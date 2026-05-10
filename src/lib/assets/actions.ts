"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { createNotification } from "@/lib/notifications/actions";
import { nextTicketNumber } from "@/lib/tickets/numbering";
import type { TicketPriority } from "@/lib/tickets/types";
import { nextCiNumber } from "./numbering";
import {
  ASSET_CONDITIONS,
  CI_REL_INVERSE,
  CI_REL_TYPES,
  CI_STATUSES,
  type AssetCondition,
  type CiRelationshipType,
  type CiStatus,
} from "./types";

const TICKET_PRIORITIES: TicketPriority[] = ["P1", "P2", "P3", "P4"];

export type ActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

const MANAGE_ROLES = ["agent", "manager", "admin", "owner"];

function s(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

async function recordAssetEvent(
  tenant_id: string,
  ci_id: string,
  by_user: string | null,
  event: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("asset_audit_log").insert({
      tenant_id,
      ci_id,
      by_user,
      event,
      payload: payload ?? null,
    });
  } catch (err) {
    console.error("[assets] recordAssetEvent failed:", err);
  }
}

export async function recordAuditEvent(input: {
  tenant_id: string;
  ci_id: string;
  by_user: string | null;
  event: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  return recordAssetEvent(
    input.tenant_id,
    input.ci_id,
    input.by_user,
    input.event,
    input.payload,
  );
}

export async function createCiAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string; number: string }>> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };

  const name = s(formData.get("name"), 200);
  const class_id = s(formData.get("class_id"), 64) || null;
  const serial = s(formData.get("serial"), 200) || null;
  const asset_tag = s(formData.get("asset_tag"), 100) || null;
  const status = (s(formData.get("status"), 24) || "in_stock") as CiStatus;
  const location = s(formData.get("location"), 200) || null;
  const cost_centre = s(formData.get("cost_centre"), 100) || null;
  const purchased_at = s(formData.get("purchased_at"), 32) || null;
  const warranty_until = s(formData.get("warranty_until"), 32) || null;
  const notes = s(formData.get("notes"), 4000) || null;

  if (!name) return { error: "Name is required." };
  if (!CI_STATUSES.includes(status)) return { error: "Invalid status." };

  const number = await nextCiNumber(profile.tenant_id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cis")
    .insert({
      tenant_id: profile.tenant_id,
      number,
      class_id,
      name,
      serial,
      asset_tag,
      status,
      location,
      cost_centre,
      purchased_at,
      warranty_until,
      notes,
    })
    .select("id, number")
    .single();
  if (error || !data) return { error: error?.message || "Failed to create CI." };

  const row = data as { id: string; number: string };

  await recordAssetEvent(profile.tenant_id, row.id, profile.id, "ci.created", {
    name,
    status,
    asset_tag,
  });
  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.create",
    entity_type: "ci",
    entity_id: row.id,
    after: { number: row.number, name, status, asset_tag },
  });

  revalidatePath("/asset-documentation");
  revalidatePath("/it-admin");
  return { ok: true, data: row };
}

export async function updateCiAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const id = s(formData.get("id"), 64);
  if (!id) return { error: "id required." };

  const updates: Record<string, unknown> = {};
  const fields: Array<[string, number]> = [
    ["name", 200],
    ["serial", 200],
    ["asset_tag", 100],
    ["location", 200],
    ["cost_centre", 100],
    ["purchased_at", 32],
    ["warranty_until", 32],
    ["notes", 4000],
  ];
  for (const [k, max] of fields) {
    const raw = formData.get(k);
    if (raw !== null) {
      const val = s(raw, max);
      updates[k] = val || null;
    }
  }
  const status = s(formData.get("status"), 24);
  if (status) {
    if (!CI_STATUSES.includes(status as CiStatus)) return { error: "Invalid status." };
    updates.status = status;
  }
  const class_id = formData.get("class_id");
  if (class_id !== null) updates.class_id = s(class_id, 64) || null;

  if (Object.keys(updates).length === 0) return { ok: true };

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("cis")
    .select("id, status, name, asset_tag, owner_user_id")
    .eq("id", id)
    .maybeSingle();
  if (!before) return { error: "CI not found." };

  const { error } = await supabase.from("cis").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await recordAssetEvent(profile.tenant_id, id, profile.id, "ci.updated", updates);
  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.update",
    entity_type: "ci",
    entity_id: id,
    before: before as Record<string, unknown>,
    after: updates,
  });

  revalidatePath("/asset-documentation");
  revalidatePath(`/asset-documentation/${id}`);
  return { ok: true };
}

export async function retireCiAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const id = s(formData.get("id"), 64);
  if (!id) return { error: "id required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cis")
    .update({ status: "retired", owner_user_id: null })
    .eq("id", id);
  if (error) return { error: error.message };

  await recordAssetEvent(profile.tenant_id, id, profile.id, "ci.retired", {});
  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.retire",
    entity_type: "ci",
    entity_id: id,
    after: { status: "retired" },
  });

  revalidatePath("/asset-documentation");
  revalidatePath(`/asset-documentation/${id}`);
  return { ok: true };
}

export type AssignToUserInput = {
  ci_id: string;
  user_id: string;
  condition?: AssetCondition;
  checkout_notes?: string | null;
};

export async function assignToUser(input: AssignToUserInput): Promise<ActionResult<{ assignment_id: string }>> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };

  const condition: AssetCondition = ASSET_CONDITIONS.includes(input.condition as AssetCondition)
    ? (input.condition as AssetCondition)
    : "good";

  const admin = createAdminClient();

  // Close any open assignment for this CI first
  await admin
    .from("asset_assignments")
    .update({
      returned_at: new Date().toISOString(),
      returned_to: profile.id,
      return_condition: condition,
      return_notes: "Auto-closed on reassignment",
    })
    .eq("ci_id", input.ci_id)
    .is("returned_at", null);

  const { data, error } = await admin
    .from("asset_assignments")
    .insert({
      tenant_id: profile.tenant_id,
      ci_id: input.ci_id,
      user_id: input.user_id,
      assigned_by: profile.id,
      condition,
      checkout_notes: input.checkout_notes ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "Assignment failed." };

  await admin
    .from("cis")
    .update({ owner_user_id: input.user_id, status: "assigned" })
    .eq("id", input.ci_id);

  await recordAssetEvent(profile.tenant_id, input.ci_id, profile.id, "ci.assigned", {
    user_id: input.user_id,
    condition,
  });
  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.assign",
    entity_type: "ci",
    entity_id: input.ci_id,
    after: { assigned_to: input.user_id, condition },
  });

  await createNotification({
    tenant_id: profile.tenant_id,
    recipient_id: input.user_id,
    kind: "asset_assigned",
    subject: "An asset has been assigned to you",
    body_md: `An IT asset has been assigned to you. View it under My assets.`,
    related_type: "ci",
    related_id: input.ci_id,
    channel: "in_app",
  });

  return { ok: true, data: { assignment_id: (data as { id: string }).id } };
}

export async function assignToUserAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ci_id = s(formData.get("ci_id"), 64);
  const user_id = s(formData.get("user_id"), 64);
  const condition = (s(formData.get("condition"), 16) || "good") as AssetCondition;
  const checkout_notes = s(formData.get("checkout_notes"), 2000) || null;
  if (!ci_id || !user_id) return { error: "ci_id and user_id required." };
  const r = await assignToUser({ ci_id, user_id, condition, checkout_notes });
  if (r.error) return r;
  revalidatePath("/asset-documentation");
  revalidatePath(`/asset-documentation/${ci_id}`);
  revalidatePath("/it-admin");
  return { ok: true };
}

export type ReturnFromUserInput = {
  ci_id: string;
  return_condition?: AssetCondition;
  return_notes?: string | null;
  to_status?: CiStatus;
};

export async function returnFromUser(input: ReturnFromUserInput): Promise<ActionResult> {
  const profile = await requireProfile();
  const admin = createAdminClient();

  // Find open assignment
  const { data: openAssignment } = await admin
    .from("asset_assignments")
    .select("id, user_id")
    .eq("ci_id", input.ci_id)
    .is("returned_at", null)
    .maybeSingle();
  const open = openAssignment as { id: string; user_id: string } | null;

  // Permission: managers/agents can return any; employees only their own
  if (!MANAGE_ROLES.includes(profile.role)) {
    if (!open || open.user_id !== profile.id) {
      return { error: "Not authorised." };
    }
  }

  if (!open) return { error: "No open assignment for this CI." };

  const return_condition: AssetCondition = ASSET_CONDITIONS.includes(
    input.return_condition as AssetCondition,
  )
    ? (input.return_condition as AssetCondition)
    : "good";

  const newStatus: CiStatus = input.to_status && CI_STATUSES.includes(input.to_status)
    ? input.to_status
    : return_condition === "damaged"
      ? "in_repair"
      : "in_stock";

  await admin
    .from("asset_assignments")
    .update({
      returned_at: new Date().toISOString(),
      returned_to: profile.id,
      return_condition,
      return_notes: input.return_notes ?? null,
    })
    .eq("id", open.id);

  await admin
    .from("cis")
    .update({ owner_user_id: null, status: newStatus })
    .eq("id", input.ci_id);

  await recordAssetEvent(profile.tenant_id, input.ci_id, profile.id, "ci.returned", {
    return_condition,
    new_status: newStatus,
  });
  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.return",
    entity_type: "ci",
    entity_id: input.ci_id,
    after: { return_condition, new_status: newStatus },
  });

  return { ok: true };
}

export async function returnFromUserAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const ci_id = s(formData.get("ci_id"), 64);
  const return_condition = (s(formData.get("return_condition"), 16) || "good") as AssetCondition;
  const return_notes = s(formData.get("return_notes"), 2000) || null;
  if (!ci_id) return { error: "ci_id required." };
  const r = await returnFromUser({ ci_id, return_condition, return_notes });
  if (r.error) return r;
  revalidatePath("/return-asset");
  revalidatePath("/my-assets");
  revalidatePath(`/asset-documentation/${ci_id}`);
  revalidatePath("/asset-documentation");
  revalidatePath("/it-admin");
  return { ok: true };
}

export type ExchangeAssetInput = {
  old_ci_id: string;
  new_ci_id: string;
  user_id: string;
  return_condition?: AssetCondition;
  notes?: string | null;
};

export async function exchangeAsset(input: ExchangeAssetInput): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };

  const ret = await returnFromUser({
    ci_id: input.old_ci_id,
    return_condition: input.return_condition ?? "good",
    return_notes: input.notes ?? "Returned via exchange",
  });
  if (ret.error) return ret;

  const ass = await assignToUser({
    ci_id: input.new_ci_id,
    user_id: input.user_id,
    condition: "good",
    checkout_notes: input.notes ?? "Issued via exchange",
  });
  if (ass.error) return ass;

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.exchange",
    entity_type: "ci",
    entity_id: input.new_ci_id,
    before: { old_ci_id: input.old_ci_id },
    after: { new_ci_id: input.new_ci_id, user_id: input.user_id },
  });

  return { ok: true };
}

export async function exchangeAssetAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const old_ci_id = s(formData.get("old_ci_id"), 64);
  const new_ci_id = s(formData.get("new_ci_id"), 64);
  const user_id = s(formData.get("user_id"), 64);
  const return_condition = (s(formData.get("return_condition"), 16) || "good") as AssetCondition;
  const notes = s(formData.get("notes"), 2000) || null;
  if (!old_ci_id || !new_ci_id || !user_id) return { error: "All fields are required." };
  if (old_ci_id === new_ci_id) return { error: "Old and new CI must differ." };

  const r = await exchangeAsset({ old_ci_id, new_ci_id, user_id, return_condition, notes });
  if (r.error) return r;
  revalidatePath("/exchange-asset");
  revalidatePath("/asset-documentation");
  revalidatePath("/it-admin");
  return { ok: true };
}

export async function addRelationshipAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const from_ci = s(formData.get("from_ci"), 64);
  const to_ci = s(formData.get("to_ci"), 64);
  const type = s(formData.get("type"), 32) as CiRelationshipType;
  if (!from_ci || !to_ci || from_ci === to_ci) return { error: "Pick two different CIs." };
  if (!CI_REL_TYPES.includes(type)) return { error: "Invalid relationship type." };

  const supabase = await createClient();
  const { error } = await supabase.from("ci_relationships").insert({
    tenant_id: profile.tenant_id,
    from_ci,
    to_ci,
    type,
    inverse_type: CI_REL_INVERSE[type],
  });
  if (error) return { error: error.message };

  await recordAssetEvent(profile.tenant_id, from_ci, profile.id, "ci.relationship_added", {
    to_ci,
    type,
  });
  revalidatePath(`/asset-documentation/${from_ci}`);
  return { ok: true };
}

export async function removeRelationshipAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const id = s(formData.get("id"), 64);
  const ci_id = s(formData.get("ci_id"), 64);
  if (!id) return { error: "id required." };

  const supabase = await createClient();
  const { error } = await supabase.from("ci_relationships").delete().eq("id", id);
  if (error) return { error: error.message };

  if (ci_id) {
    await recordAssetEvent(profile.tenant_id, ci_id, profile.id, "ci.relationship_removed", {
      relationship_id: id,
    });
    revalidatePath(`/asset-documentation/${ci_id}`);
  }
  return { ok: true };
}

export async function linkTicketToCi(input: {
  ticket_id: string;
  ci_id: string;
}): Promise<ActionResult> {
  const profile = await requireProfile();
  // Allow link by any signed-in user from the asset-issue flow; RLS will still
  // enforce tenant scope. Audit captures actor.
  const admin = createAdminClient();
  const { error } = await admin.from("ticket_ci_links").insert({
    tenant_id: profile.tenant_id,
    ticket_id: input.ticket_id,
    ci_id: input.ci_id,
    linked_by: profile.id,
  });
  if (error && !/duplicate/i.test(error.message)) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.link_asset",
    entity_type: "ticket",
    entity_id: input.ticket_id,
    after: { ci_id: input.ci_id },
  });
  await recordAssetEvent(profile.tenant_id, input.ci_id, profile.id, "ci.linked_to_ticket", {
    ticket_id: input.ticket_id,
  });
  return { ok: true };
}

export async function createAssetIssueAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ number: string }>> {
  const profile = await requireProfile();
  const ci_id = s(formData.get("ci_id"), 64);
  const title = s(formData.get("title"), 200);
  const description = s(formData.get("description"), 8000) || null;
  const priorityRaw = s(formData.get("priority"), 3) as TicketPriority;
  const category_id = s(formData.get("category_id"), 64) || null;
  const priority: TicketPriority = TICKET_PRIORITIES.includes(priorityRaw) ? priorityRaw : "P3";
  if (!ci_id) return { error: "Pick an asset." };
  if (!title) return { error: "Title is required." };

  const admin = createAdminClient();

  // Verify CI exists and (for employees) is owned by the requester
  const { data: ciRow } = await admin
    .from("cis")
    .select("id, number, name, owner_user_id, tenant_id")
    .eq("id", ci_id)
    .maybeSingle();
  const ci = ciRow as
    | { id: string; number: string; name: string; owner_user_id: string | null; tenant_id: string }
    | null;
  if (!ci || ci.tenant_id !== profile.tenant_id) return { error: "Asset not found." };
  if (!MANAGE_ROLES.includes(profile.role) && ci.owner_user_id !== profile.id) {
    return { error: "You can only report issues on assets assigned to you." };
  }

  const number = await nextTicketNumber(profile.tenant_id);
  const enrichedDesc = `Asset: ${ci.number} ${ci.name}\n\n${description ?? ""}`.trim();

  const { data, error } = await admin
    .from("tickets")
    .insert({
      tenant_id: profile.tenant_id,
      number,
      requester_id: profile.id,
      category_id,
      priority,
      state: "new",
      source: "portal",
      title,
      description: enrichedDesc,
    })
    .select("id, number")
    .single();
  if (error || !data) return { error: error?.message || "Failed to create ticket." };
  const t = data as { id: string; number: string };

  await admin.from("ticket_state_history").insert({
    tenant_id: profile.tenant_id,
    ticket_id: t.id,
    from_state: null,
    to_state: "new",
    by_user: profile.id,
    reason: "Asset issue ticket created",
  });

  await admin.from("ticket_ci_links").insert({
    tenant_id: profile.tenant_id,
    ticket_id: t.id,
    ci_id,
    linked_by: profile.id,
  });

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.create",
    entity_type: "ticket",
    entity_id: t.id,
    after: { number: t.number, ci_id, source: "asset_issue" },
  });
  await recordAssetEvent(profile.tenant_id, ci_id, profile.id, "ci.linked_to_ticket", {
    ticket_id: t.id,
    ticket_number: t.number,
  });

  revalidatePath("/helpdesk");
  revalidatePath("/my-assets");
  redirect(`/helpdesk/${t.number}`);
}

// Bare-form wrappers (signature: (formData) => Promise<void>) so forms can be
// used directly with `<form action={...}>` without the useActionState helper.
export async function updateCiFormAction(formData: FormData): Promise<void> {
  await updateCiAction(undefined, formData);
}
export async function retireCiFormAction(formData: FormData): Promise<void> {
  await retireCiAction(undefined, formData);
}
export async function assignToUserFormAction(formData: FormData): Promise<void> {
  await assignToUserAction(undefined, formData);
}
export async function returnFromUserFormAction(formData: FormData): Promise<void> {
  await returnFromUserAction(undefined, formData);
}
export async function addRelationshipFormAction(formData: FormData): Promise<void> {
  await addRelationshipAction(undefined, formData);
}
export async function removeRelationshipFormAction(formData: FormData): Promise<void> {
  await removeRelationshipAction(undefined, formData);
}
export async function bulkReturnFromUserFormAction(formData: FormData): Promise<void> {
  await bulkReturnFromUserAction(undefined, formData);
}

export async function bulkReturnFromUserAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ returned: number }>> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const user_id = s(formData.get("user_id"), 64);
  const notes = s(formData.get("notes"), 2000) || "Offboarding clearance";
  if (!user_id) return { error: "user_id required." };

  const admin = createAdminClient();
  const { data } = await admin
    .from("asset_assignments")
    .select("ci_id")
    .eq("user_id", user_id)
    .is("returned_at", null);
  const cis = ((data ?? []) as Array<{ ci_id: string }>).map((r) => r.ci_id);
  let returned = 0;
  for (const ci_id of cis) {
    const r = await returnFromUser({
      ci_id,
      return_condition: "good",
      return_notes: notes,
      to_status: "in_stock",
    });
    if (!r.error) returned += 1;
  }

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ci.exit_clearance",
    entity_type: "user",
    entity_id: user_id,
    after: { returned },
  });

  revalidatePath("/asset-exit-clearance");
  revalidatePath("/it-admin");
  return { ok: true, data: { returned } };
}

// Stub for cross-product profile fetch. PayrollPilot integration TODO Sprint 9.
// ifBash MUST NOT depend on PayrollPilot at runtime. Always returns hardcoded fallback.
export async function getProfileFromPayrollPilot(_user_id: string): Promise<{
  cost_centre: string | null;
  manager_name: string | null;
} | null> {
  return { cost_centre: null, manager_name: null };
}

