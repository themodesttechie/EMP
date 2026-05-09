"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { ApproverStep, FormField, ServiceRequest } from "./types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

function validateFormData(
  schema: FormField[],
  payload: Record<string, unknown>,
): string | null {
  for (const field of schema) {
    const v = payload[field.key];
    if (field.required && (v === undefined || v === null || v === "")) {
      return `${field.label} is required.`;
    }
    if (field.type === "select" && v && field.options && !field.options.includes(String(v))) {
      return `${field.label}: invalid selection.`;
    }
  }
  return null;
}

async function resolveApprover(
  step: ApproverStep,
  requesterId: string,
  tenantId: string,
): Promise<{
  approver_kind: "manager" | "role" | "user";
  approver_id: string | null;
  required_role: ApproverStep extends { kind: "role"; role: infer R } ? R : null;
}> {
  const admin = createAdminClient();
  if (step.kind === "manager") {
    const { data } = await admin
      .from("profiles")
      .select("manager_id")
      .eq("id", requesterId)
      .maybeSingle();
    return {
      approver_kind: "manager",
      approver_id: (data?.manager_id as string | null) ?? null,
      required_role: null as never,
    };
  }
  if (step.kind === "role") {
    return {
      approver_kind: "role",
      approver_id: null,
      required_role: step.role as never,
    };
  }
  // user kind
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("id", step.user_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  return {
    approver_kind: "user",
    approver_id: (data?.id as string | null) ?? null,
    required_role: null as never,
  };
}

export async function createRequestAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ code: string }>> {
  const profile = await requireProfile();
  const itemSlug = String(formData.get("item_slug") || "");
  if (!itemSlug) return { error: "Catalog item required." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: item } = await supabase
    .from("catalog_items")
    .select(
      "id, tenant_id, slug, name, form_schema, approval_chain, sla_hours, fulfilment_role, category:catalog_categories!inner(name)",
    )
    .eq("slug", itemSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!item) return { error: "Catalog item not found." };

  const schema = (item.form_schema ?? []) as FormField[];
  const payload: Record<string, unknown> = {};
  for (const field of schema) {
    const v = formData.get(field.key);
    if (v === null) continue;
    if (field.type === "checkbox") {
      payload[field.key] = v === "on" || v === "true";
    } else if (field.type === "number") {
      const n = Number(v);
      payload[field.key] = Number.isFinite(n) ? n : null;
    } else {
      payload[field.key] = String(v);
    }
  }

  const err = validateFormData(schema, payload);
  if (err) return { error: err };

  const chain = (item.approval_chain ?? []) as ApproverStep[];
  const totalStages = chain.length;

  // Allocate REQ-NNNNNN code via SECURITY DEFINER RPC (bypasses RLS on seq table)
  const { data: codeRpc, error: codeErr } = await admin.rpc("allocate_request_code", {
    p_tenant: profile.tenant_id,
  });
  if (codeErr || !codeRpc) {
    return { error: "Failed to allocate request code." };
  }
  const code = codeRpc as string;

  const dueAt =
    item.sla_hours != null
      ? new Date(Date.now() + Number(item.sla_hours) * 3600_000).toISOString()
      : null;

  // Insert request as the requester (RLS allows insert when requester_id = auth.uid())
  const categoryName = Array.isArray(item.category)
    ? (item.category[0] as { name: string })?.name
    : (item.category as { name: string })?.name;

  const { data: insertedReq, error: insErr } = await supabase
    .from("requests")
    .insert({
      tenant_id: profile.tenant_id,
      code,
      catalog_item_id: item.id,
      requester_id: profile.id,
      item_name_snapshot: item.name,
      category_name_snapshot: categoryName ?? "",
      form_data: payload,
      status: "pending",
      current_stage: 0,
      total_stages: totalStages,
      due_at: dueAt,
      submitted_at: new Date().toISOString(),
    })
    .select("id, code")
    .single();

  if (insErr || !insertedReq) {
    return { error: insErr?.message || "Failed to create request." };
  }

  // Insert approval rows via service role (RLS allows insert in tenant, but we want to
  // sidestep any race on chain ordering and ensure all stages land atomically).
  if (chain.length > 0) {
    const approvalRows = await Promise.all(
      chain.map(async (step, idx) => {
        const resolved = await resolveApprover(step, profile.id, profile.tenant_id);
        return {
          tenant_id: profile.tenant_id,
          request_id: insertedReq.id as string,
          stage: idx,
          approver_kind: resolved.approver_kind,
          approver_id: resolved.approver_id,
          required_role: resolved.required_role,
          decision: "pending" as const,
        };
      }),
    );

    const { error: appErr } = await admin.from("request_approvals").insert(approvalRows);
    if (appErr) {
      return { error: `Created request ${code} but failed to seed approvals: ${appErr.message}` };
    }
  } else {
    // No approvals → auto-approve and move to fulfilment
    await admin
      .from("requests")
      .update({ status: "approved" })
      .eq("id", insertedReq.id as string);
  }

  // System comment
  await admin.from("request_comments").insert({
    tenant_id: profile.tenant_id,
    request_id: insertedReq.id as string,
    author_id: profile.id,
    kind: "system",
    body: `Request submitted by ${profile.full_name || profile.email}.`,
  });

  revalidatePath("/my-requests");
  revalidatePath("/approval-workflows");
  redirect(`/my-requests/${code}`);
}

export async function decideApprovalAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const requestId = String(formData.get("request_id") || "");
  const stage = Number(formData.get("stage") || -1);
  const decision = String(formData.get("decision") || "");
  const comment = String(formData.get("comment") || "").trim() || null;

  if (!requestId || stage < 0 || !["approved", "rejected"].includes(decision)) {
    return { error: "Invalid approval payload." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  // Fetch the approval row visible to the user
  const { data: approval } = await supabase
    .from("request_approvals")
    .select("id, request_id, stage, approver_kind, approver_id, required_role, decision")
    .eq("request_id", requestId)
    .eq("stage", stage)
    .maybeSingle();

  if (!approval) return { error: "Approval step not found." };
  if (approval.decision !== "pending") return { error: "Already decided." };

  // Authorisation: must match approver_id OR role match OR admin/owner
  const isApprover =
    approval.approver_id === profile.id ||
    (approval.approver_kind === "role" &&
      approval.required_role === profile.role) ||
    profile.role === "owner" ||
    profile.role === "admin";
  if (!isApprover) return { error: "You are not authorised to decide on this step." };

  // Record decision
  const { error: updErr } = await supabase
    .from("request_approvals")
    .update({
      decision,
      decided_by: profile.id,
      decided_at: new Date().toISOString(),
      comment,
    })
    .eq("id", approval.id as string);
  if (updErr) return { error: updErr.message };

  // Fetch parent request to advance state
  const { data: req } = await admin
    .from("requests")
    .select("id, code, current_stage, total_stages, status")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return { error: "Request not found." };

  const r = req as Pick<
    ServiceRequest,
    "id" | "code" | "current_stage" | "total_stages" | "status"
  >;

  if (decision === "rejected") {
    await admin
      .from("requests")
      .update({ status: "rejected", completed_at: new Date().toISOString() })
      .eq("id", r.id);
    await admin.from("request_comments").insert({
      tenant_id: profile.tenant_id,
      request_id: r.id,
      author_id: profile.id,
      kind: "system",
      body: `Stage ${stage + 1} rejected by ${profile.full_name || profile.email}${
        comment ? `: ${comment}` : "."
      }`,
    });
  } else {
    // Approved — advance stage or finalise
    const nextStage = r.current_stage + 1;
    if (nextStage >= r.total_stages) {
      await admin
        .from("requests")
        .update({
          status: "approved",
          current_stage: nextStage,
          completed_at: null,
        })
        .eq("id", r.id);
    } else {
      await admin
        .from("requests")
        .update({ current_stage: nextStage })
        .eq("id", r.id);
    }
    await admin.from("request_comments").insert({
      tenant_id: profile.tenant_id,
      request_id: r.id,
      author_id: profile.id,
      kind: "system",
      body: `Stage ${stage + 1} approved by ${profile.full_name || profile.email}${
        comment ? `: ${comment}` : "."
      }`,
    });
  }

  revalidatePath("/approval-workflows");
  revalidatePath(`/my-requests/${r.code}`);
  return { ok: true };
}

export async function addRequestCommentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const requestId = String(formData.get("request_id") || "");
  const body = String(formData.get("body") || "").trim();
  const isInternal = formData.get("is_internal") === "on";

  if (!requestId || !body) return { error: "Comment cannot be empty." };

  const supabase = await createClient();
  const { error } = await supabase.from("request_comments").insert({
    tenant_id: profile.tenant_id,
    request_id: requestId,
    author_id: profile.id,
    kind: "comment",
    body,
    is_internal: isInternal && (profile.role === "admin" || profile.role === "owner" || profile.role === "agent"),
  });
  if (error) return { error: error.message };

  const code = String(formData.get("code") || "");
  if (code) revalidatePath(`/my-requests/${code}`);
  return { ok: true };
}

export async function cancelRequestAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const requestId = String(formData.get("request_id") || "");
  const code = String(formData.get("code") || "");
  if (!requestId) return { error: "Request id required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  await admin.from("request_comments").insert({
    tenant_id: profile.tenant_id,
    request_id: requestId,
    author_id: profile.id,
    kind: "system",
    body: `Cancelled by ${profile.full_name || profile.email}.`,
  });

  revalidatePath("/my-requests");
  if (code) revalidatePath(`/my-requests/${code}`);
  return { ok: true };
}
