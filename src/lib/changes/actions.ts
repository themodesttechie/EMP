"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { createNotification } from "@/lib/notifications/actions";
import { scoreChangeRisk } from "@/lib/ai/change-risk";
import { detectStandardChangeMatch } from "@/lib/ai/standard-change-detect";
import { nextChangeNumber } from "./numbering";
import type {
  Change,
  ChangeApprovalRole,
  ChangeApprovalState,
  ChangeState,
  ChangeTaskState,
  ChangeType,
} from "./types";
import {
  CHANGE_APPROVAL_ROLES,
  CHANGE_APPROVAL_STATES,
  CHANGE_STATES,
  CHANGE_TASK_STATES,
  CHANGE_TYPES,
} from "./types";

export type ActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

function s(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

function parseUuidArray(v: FormDataEntryValue | null): string[] {
  const raw = s(v, 4000);
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter((x) => /^[0-9a-fA-F-]{36}$/.test(x));
}

async function loadCiNames(tenant_id: string, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const admin = createAdminClient();
  // cis table may not exist if Sprint 4 has not landed. Guard with try/catch.
  try {
    const { data, error } = await admin
      .from("cis")
      .select("id, name")
      .eq("tenant_id", tenant_id)
      .in("id", ids);
    if (error) return [];
    return (data ?? []).map((r: { name?: string | null }) => r.name ?? "(unnamed CI)");
  } catch {
    return [];
  }
}

async function notifyCabMembers(
  tenant_id: string,
  change_id: string,
  number: string,
  title: string,
  by_name: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data: members } = await admin
    .from("profiles")
    .select("id")
    .eq("tenant_id", tenant_id)
    .in("role", ["manager", "admin", "owner"])
    .eq("is_active", true)
    .limit(50);
  for (const m of (members ?? []) as Array<{ id: string }>) {
    await createNotification({
      tenant_id,
      recipient_id: m.id,
      kind: "change_cab_review",
      subject: `CAB review: ${number}`,
      body_md: `Change **${number}** "${title}" submitted for CAB review by ${by_name}.`,
      related_type: "change",
      related_id: change_id,
      channel: "in_app",
    });
  }
}

// ---------------------------------------------------------------------------
// createChange — initial draft from wizard step 1+2
// ---------------------------------------------------------------------------

export async function createChangeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ number: string }>> {
  const profile = await requireProfile();
  const title = s(formData.get("title"), 200);
  const description = s(formData.get("description"), 8000) || null;
  const typeRaw = s(formData.get("type"), 16) as ChangeType;
  const type: ChangeType = CHANGE_TYPES.includes(typeRaw) ? typeRaw : "normal";
  const rollback = s(formData.get("rollback_plan"), 4000) || null;
  const plannedStart = s(formData.get("planned_start"), 64) || null;
  const plannedEnd = s(formData.get("planned_end"), 64) || null;
  const implementerId = s(formData.get("implementer_id"), 64) || null;
  const ciIds = parseUuidArray(formData.get("affected_ci_ids"));
  const linkedTicketIds = parseUuidArray(formData.get("linked_ticket_ids"));

  if (!title) return { error: "Title is required." };

  // Resolve AI inputs in parallel: linked-ticket summaries + similar past changes + templates
  const admin = createAdminClient();

  const [ticketsRes, pastRes, tmplRes, ciNames] = await Promise.all([
    linkedTicketIds.length
      ? admin
          .from("tickets")
          .select("id, number, priority, state, title")
          .eq("tenant_id", profile.tenant_id)
          .in("id", linkedTicketIds)
      : Promise.resolve({ data: [] as Array<{ id: string; number: string; priority: string; state: string; title: string }> }),
    admin
      .from("changes")
      .select("number, title, state, risk_score")
      .eq("tenant_id", profile.tenant_id)
      .in("state", ["done", "rolled_back"])
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("change_templates")
      .select("slug, name, description")
      .eq("tenant_id", profile.tenant_id)
      .eq("is_active", true),
    loadCiNames(profile.tenant_id, ciIds),
  ]);

  const linkedTickets = (ticketsRes.data ?? []) as Array<{
    id: string;
    number: string;
    priority: string;
    state: string;
    title: string;
  }>;
  const pastChanges = (pastRes.data ?? []) as Array<{
    number: string;
    title: string;
    state: string;
    risk_score: number | null;
  }>;
  const templates = (tmplRes.data ?? []) as Array<{
    slug: string;
    name: string;
    description: string | null;
  }>;

  const [risk, match] = await Promise.all([
    scoreChangeRisk({
      tenant_id: profile.tenant_id,
      actor_id: profile.id,
      input: {
        title,
        description,
        type,
        rollback_plan: rollback,
        affected_ci_count: ciIds.length,
        affected_ci_names: ciNames,
        linked_ticket_summaries: linkedTickets.map((t) => ({
          number: t.number,
          priority: t.priority,
          state: t.state,
          title: t.title,
        })),
        similar_past_changes: pastChanges.map((p) => ({
          number: p.number,
          title: p.title,
          final_state: p.state,
          risk_score: p.risk_score,
        })),
      },
    }),
    detectStandardChangeMatch({
      tenant_id: profile.tenant_id,
      actor_id: profile.id,
      input: {
        title,
        description,
        type,
        templates,
      },
    }),
  ]);

  // Resolve template_id if matched
  let template_id: string | null = null;
  if (match.match_slug) {
    const { data: tRow } = await admin
      .from("change_templates")
      .select("id")
      .eq("tenant_id", profile.tenant_id)
      .eq("slug", match.match_slug)
      .maybeSingle();
    template_id = (tRow as { id?: string } | null)?.id ?? null;
  }

  const ai_classification = {
    risk_score: risk.degraded ? null : risk.score,
    risk_reasoning: risk.degraded ? null : risk.reasoning,
    risk_factors: risk.degraded ? [] : risk.factors,
    template_match: match.match_slug
      ? {
          slug: match.match_slug,
          confidence: match.confidence,
          auto_approve_recommended: match.auto_approve_recommended,
        }
      : null,
    model: `${risk.model}+${match.model}`,
    at: new Date().toISOString(),
  };

  const number = await nextChangeNumber(profile.tenant_id);

  const supabase = await createClient();
  const { data: inserted, error: insErr } = await supabase
    .from("changes")
    .insert({
      tenant_id: profile.tenant_id,
      number,
      title,
      description,
      type,
      risk_score: risk.degraded ? null : risk.score,
      state: "draft",
      planned_start: plannedStart || null,
      planned_end: plannedEnd || null,
      requester_id: profile.id,
      implementer_id: implementerId,
      affected_ci_ids: ciIds,
      rollback_plan: rollback,
      template_id,
      ai_classification,
    })
    .select("id, number")
    .single();

  if (insErr || !inserted) {
    return { error: insErr?.message || "Failed to create change." };
  }

  const changeId = (inserted as { id: string }).id;

  // Seed default tasks from template if matched
  if (template_id) {
    const { data: tmplFull } = await admin
      .from("change_templates")
      .select("default_tasks")
      .eq("id", template_id)
      .maybeSingle();
    const tasks = ((tmplFull as { default_tasks?: unknown } | null)?.default_tasks ?? []) as Array<{
      sequence?: number;
      title?: string;
      description?: string;
      est_minutes?: number;
    }>;
    if (Array.isArray(tasks) && tasks.length > 0) {
      await admin.from("change_tasks").insert(
        tasks.map((t, i) => ({
          tenant_id: profile.tenant_id,
          change_id: changeId,
          sequence: typeof t.sequence === "number" ? t.sequence : i + 1,
          title: typeof t.title === "string" ? t.title : `Task ${i + 1}`,
          description: typeof t.description === "string" ? t.description : null,
          est_minutes: typeof t.est_minutes === "number" ? t.est_minutes : null,
          state: "todo",
        })),
      );
    }
    await admin
      .from("change_templates")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", template_id);
  }

  // Link tickets if any
  if (linkedTicketIds.length > 0) {
    await admin.from("change_ticket_links").insert(
      linkedTicketIds.map((tid) => ({
        tenant_id: profile.tenant_id,
        change_id: changeId,
        ticket_id: tid,
        link_kind: "caused_by",
        created_by: profile.id,
      })),
    );
  }

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.create",
    entity_type: "change",
    entity_id: changeId,
    after: {
      number,
      title,
      type,
      risk_score: risk.degraded ? null : risk.score,
      template_match: match.match_slug,
      ci_count: ciIds.length,
      linked_tickets: linkedTicketIds.length,
    },
  });

  revalidatePath("/changes");
  redirect(`/changes/${number}`);
}

// ---------------------------------------------------------------------------
// submitForReviewAction — draft → cab_review (creates approval rows)
// ---------------------------------------------------------------------------

export async function submitForReviewAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const id = s(formData.get("change_id"), 64);
  if (!id) return { error: "Change id required." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: row } = await supabase
    .from("changes")
    .select("id, number, title, state, requester_id")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: "Change not found." };
  const r = row as Pick<Change, "id" | "number" | "title" | "state" | "requester_id">;
  if (r.state !== "draft") return { error: "Only drafts can be submitted." };
  if (r.requester_id !== profile.id && !["admin", "owner", "manager"].includes(profile.role)) {
    return { error: "Not authorised." };
  }

  const { error } = await supabase
    .from("changes")
    .update({ state: "cab_review" })
    .eq("id", id);
  if (error) return { error: error.message };

  // Seed approval rows: every active manager/admin/owner in tenant gets a CAB pending row
  const { data: members } = await admin
    .from("profiles")
    .select("id, role")
    .eq("tenant_id", profile.tenant_id)
    .in("role", ["manager", "admin", "owner"])
    .eq("is_active", true)
    .limit(50);
  const memberRows = (members ?? []) as Array<{ id: string; role: string }>;

  if (memberRows.length > 0) {
    await admin.from("change_approvals").upsert(
      memberRows.map((m) => ({
        tenant_id: profile.tenant_id,
        change_id: id,
        approver_id: m.id,
        role: "cab_member" as ChangeApprovalRole,
        state: "pending" as ChangeApprovalState,
      })),
      { onConflict: "change_id,approver_id,role", ignoreDuplicates: true },
    );
  }

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.submit_review",
    entity_type: "change",
    entity_id: id,
    before: { state: r.state },
    after: { state: "cab_review", cab_seeded: memberRows.length },
  });

  await notifyCabMembers(
    profile.tenant_id,
    id,
    r.number,
    r.title,
    profile.full_name || profile.email,
  );

  revalidatePath(`/changes/${r.number}`);
  revalidatePath("/changes");
  revalidatePath("/cab");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// recordApprovalDecisionAction — approver acts on their pending row
// ---------------------------------------------------------------------------

export async function recordApprovalDecisionAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const approvalId = s(formData.get("approval_id"), 64);
  const decisionRaw = s(formData.get("decision"), 16) as ChangeApprovalState;
  const comment = s(formData.get("comment"), 2000) || null;

  if (!CHANGE_APPROVAL_STATES.includes(decisionRaw)) {
    return { error: "Invalid decision." };
  }
  if (decisionRaw === "pending") return { error: "Pick a decision." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: row } = await supabase
    .from("change_approvals")
    .select("id, change_id, approver_id, state, role")
    .eq("id", approvalId)
    .maybeSingle();
  if (!row) return { error: "Approval not found." };
  const a = row as { id: string; change_id: string; approver_id: string; state: ChangeApprovalState; role: ChangeApprovalRole };
  if (a.approver_id !== profile.id) return { error: "Not authorised." };
  if (a.state !== "pending") return { error: "Already decided." };

  const { error } = await supabase
    .from("change_approvals")
    .update({
      state: decisionRaw,
      comment,
      decided_at: new Date().toISOString(),
    })
    .eq("id", approvalId);
  if (error) return { error: error.message };

  // Recompute aggregate: any reject → change rejected (back to draft); all approved (no pending) → approved
  const { data: peers } = await admin
    .from("change_approvals")
    .select("state")
    .eq("change_id", a.change_id);
  const states = ((peers ?? []) as Array<{ state: ChangeApprovalState }>).map((p) => p.state);
  const anyReject = states.includes("rejected");
  const anyPending = states.includes("pending");

  let newChangeState: ChangeState | null = null;
  if (anyReject) newChangeState = "draft";
  else if (!anyPending) newChangeState = "approved";

  const { data: ch } = await admin
    .from("changes")
    .select("id, number, title, state, requester_id")
    .eq("id", a.change_id)
    .maybeSingle();
  const c = ch as Pick<Change, "id" | "number" | "title" | "state" | "requester_id"> | null;
  if (c && newChangeState && c.state !== newChangeState) {
    await admin.from("changes").update({ state: newChangeState }).eq("id", c.id);

    if (c.requester_id !== profile.id) {
      await createNotification({
        tenant_id: profile.tenant_id,
        recipient_id: c.requester_id,
        kind: newChangeState === "approved" ? "change_approved" : "change_rejected",
        subject: `Change ${c.number} ${newChangeState}`,
        body_md: `Your change **${c.number}** "${c.title}" is now **${newChangeState}**.${
          comment ? `\n\nComment: ${comment}` : ""
        }`,
        related_type: "change",
        related_id: c.id,
        channel: "both",
      });
    }
  }

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.approval_decision",
    entity_type: "change",
    entity_id: a.change_id,
    before: { state: a.state },
    after: { state: decisionRaw, role: a.role, change_new_state: newChangeState ?? null },
  });

  if (c) {
    revalidatePath(`/changes/${c.number}`);
  }
  revalidatePath("/cab");
  revalidatePath("/changes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// scheduleChangeAction — approved → scheduled with planned window
// ---------------------------------------------------------------------------

export async function scheduleChangeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const id = s(formData.get("change_id"), 64);
  const plannedStart = s(formData.get("planned_start"), 64);
  const plannedEnd = s(formData.get("planned_end"), 64);
  if (!id) return { error: "Change id required." };
  if (!plannedStart || !plannedEnd) return { error: "Start and end required." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("changes")
    .select("id, number, state")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: "Change not found." };
  const r = row as { id: string; number: string; state: ChangeState };
  if (!["approved", "scheduled"].includes(r.state)) {
    return { error: "Change must be approved before scheduling." };
  }

  const { error } = await supabase
    .from("changes")
    .update({
      planned_start: plannedStart,
      planned_end: plannedEnd,
      state: "scheduled",
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.schedule",
    entity_type: "change",
    entity_id: id,
    before: { state: r.state },
    after: { state: "scheduled", planned_start: plannedStart, planned_end: plannedEnd },
  });

  revalidatePath(`/changes/${r.number}`);
  revalidatePath("/changes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// startChangeAction — scheduled → in_progress
// ---------------------------------------------------------------------------

export async function startChangeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const id = s(formData.get("change_id"), 64);
  if (!id) return { error: "Change id required." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("changes")
    .select("id, number, state")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: "Change not found." };
  const r = row as { id: string; number: string; state: ChangeState };
  if (!["approved", "scheduled"].includes(r.state)) {
    return { error: "Change must be approved or scheduled before starting." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("changes")
    .update({ state: "in_progress", actual_start: now })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.start",
    entity_type: "change",
    entity_id: id,
    before: { state: r.state },
    after: { state: "in_progress", actual_start: now },
  });

  revalidatePath(`/changes/${r.number}`);
  revalidatePath("/changes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// completeChangeAction — in_progress → done
// ---------------------------------------------------------------------------

export async function completeChangeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const id = s(formData.get("change_id"), 64);
  if (!id) return { error: "Change id required." };

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: row } = await supabase
    .from("changes")
    .select("id, number, state, requester_id, title")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: "Change not found." };
  const r = row as Pick<Change, "id" | "number" | "state" | "requester_id" | "title">;
  if (r.state !== "in_progress") return { error: "Change must be in progress." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("changes")
    .update({ state: "done", actual_end: now })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.complete",
    entity_type: "change",
    entity_id: id,
    before: { state: r.state },
    after: { state: "done", actual_end: now },
  });

  if (r.requester_id !== profile.id) {
    await createNotification({
      tenant_id: profile.tenant_id,
      recipient_id: r.requester_id,
      kind: "change_done",
      subject: `Change ${r.number} done`,
      body_md: `Change **${r.number}** "${r.title}" is now done.`,
      related_type: "change",
      related_id: r.id,
      channel: "in_app",
    });
  }
  void admin;

  revalidatePath(`/changes/${r.number}`);
  revalidatePath("/changes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// rollbackChangeAction — in_progress|done → rolled_back
// ---------------------------------------------------------------------------

export async function rollbackChangeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const id = s(formData.get("change_id"), 64);
  const reason = s(formData.get("reason"), 2000) || null;
  if (!id) return { error: "Change id required." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("changes")
    .select("id, number, state, requester_id, title")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: "Change not found." };
  const r = row as Pick<Change, "id" | "number" | "state" | "requester_id" | "title">;
  if (!["in_progress", "done"].includes(r.state)) {
    return { error: "Only in-progress or done changes can be rolled back." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("changes")
    .update({ state: "rolled_back", actual_end: now })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.rollback",
    entity_type: "change",
    entity_id: id,
    before: { state: r.state },
    after: { state: "rolled_back", reason },
  });

  if (r.requester_id !== profile.id) {
    await createNotification({
      tenant_id: profile.tenant_id,
      recipient_id: r.requester_id,
      kind: "change_rolled_back",
      subject: `Change ${r.number} rolled back`,
      body_md: `Change **${r.number}** "${r.title}" was rolled back.${reason ? `\n\nReason: ${reason}` : ""}`,
      related_type: "change",
      related_id: r.id,
      channel: "both",
    });
  }

  revalidatePath(`/changes/${r.number}`);
  revalidatePath("/changes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// cancelChangeAction — any pre-implementation state → cancelled
// ---------------------------------------------------------------------------

export async function cancelChangeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const id = s(formData.get("change_id"), 64);
  const reason = s(formData.get("reason"), 2000) || null;
  if (!id) return { error: "Change id required." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("changes")
    .select("id, number, state, requester_id")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { error: "Change not found." };
  const r = row as Pick<Change, "id" | "number" | "state" | "requester_id">;
  if (!["draft", "cab_review", "approved", "scheduled"].includes(r.state)) {
    return { error: "Change cannot be cancelled at this state." };
  }
  if (
    r.requester_id !== profile.id &&
    !["agent", "manager", "admin", "owner"].includes(profile.role)
  ) {
    return { error: "Not authorised." };
  }

  const { error } = await supabase
    .from("changes")
    .update({ state: "cancelled" })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.cancel",
    entity_type: "change",
    entity_id: id,
    before: { state: r.state },
    after: { state: "cancelled", reason },
  });

  revalidatePath(`/changes/${r.number}`);
  revalidatePath("/changes");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// addTaskAction — add a task to the implementation plan
// ---------------------------------------------------------------------------

export async function addTaskAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const change_id = s(formData.get("change_id"), 64);
  const title = s(formData.get("title"), 200);
  const description = s(formData.get("description"), 2000) || null;
  const ownerId = s(formData.get("owner_id"), 64) || null;
  const estMinutesRaw = s(formData.get("est_minutes"), 8);
  const estMinutes = /^\d+$/.test(estMinutesRaw) ? Number(estMinutesRaw) : null;
  if (!change_id || !title) return { error: "Title required." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { count } = await admin
    .from("change_tasks")
    .select("*", { count: "exact", head: true })
    .eq("change_id", change_id);
  const sequence = (count ?? 0) + 1;

  const { data: row, error } = await supabase
    .from("change_tasks")
    .insert({
      tenant_id: profile.tenant_id,
      change_id,
      sequence,
      title,
      description,
      owner_id: ownerId,
      est_minutes: estMinutes,
      state: "todo",
    })
    .select("id")
    .single();
  if (error || !row) return { error: error?.message || "Failed to add task." };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.task_add",
    entity_type: "change",
    entity_id: change_id,
    after: { task_id: (row as { id: string }).id, title, sequence },
  });

  // Refresh detail page (caller passes change_id; we look up number)
  const { data: ch } = await admin
    .from("changes")
    .select("number")
    .eq("id", change_id)
    .maybeSingle();
  const num = (ch as { number?: string } | null)?.number;
  if (num) revalidatePath(`/changes/${num}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// updateTaskStateAction — task state transitions
// ---------------------------------------------------------------------------

export async function updateTaskStateAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const task_id = s(formData.get("task_id"), 64);
  const toStateRaw = s(formData.get("to_state"), 16) as ChangeTaskState;
  const actualMinutesRaw = s(formData.get("actual_minutes"), 8);
  const actualMinutes = /^\d+$/.test(actualMinutesRaw) ? Number(actualMinutesRaw) : null;
  if (!task_id || !CHANGE_TASK_STATES.includes(toStateRaw)) {
    return { error: "Invalid task state." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: row } = await supabase
    .from("change_tasks")
    .select("id, change_id, state, owner_id, started_at")
    .eq("id", task_id)
    .maybeSingle();
  if (!row) return { error: "Task not found." };
  const t = row as { id: string; change_id: string; state: ChangeTaskState; owner_id: string | null; started_at: string | null };

  const updates: Record<string, unknown> = { state: toStateRaw };
  const now = new Date().toISOString();
  if (toStateRaw === "in_progress" && !t.started_at) updates.started_at = now;
  if (toStateRaw === "done") {
    updates.completed_at = now;
    if (actualMinutes !== null) updates.actual_minutes = actualMinutes;
  }

  const { error } = await supabase.from("change_tasks").update(updates).eq("id", task_id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.task_state",
    entity_type: "change",
    entity_id: t.change_id,
    before: { task_id: t.id, state: t.state },
    after: { state: toStateRaw, actual_minutes: actualMinutes },
  });

  const { data: ch } = await admin
    .from("changes")
    .select("number")
    .eq("id", t.change_id)
    .maybeSingle();
  const num = (ch as { number?: string } | null)?.number;
  if (num) revalidatePath(`/changes/${num}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// linkTicketAction — attach a ticket to a change
// ---------------------------------------------------------------------------

export async function linkTicketAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const change_id = s(formData.get("change_id"), 64);
  const ticket_id = s(formData.get("ticket_id"), 64);
  const linkKindRaw = s(formData.get("link_kind"), 24) || "caused_by";
  const linkKind = ["caused_by", "related", "resolves"].includes(linkKindRaw)
    ? (linkKindRaw as "caused_by" | "related" | "resolves")
    : "caused_by";
  if (!change_id || !ticket_id) return { error: "Both ids required." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { error } = await supabase
    .from("change_ticket_links")
    .insert({
      tenant_id: profile.tenant_id,
      change_id,
      ticket_id,
      link_kind: linkKind,
      created_by: profile.id,
    });
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "change.link_ticket",
    entity_type: "change",
    entity_id: change_id,
    after: { ticket_id, link_kind: linkKind },
  });

  const { data: ch } = await admin
    .from("changes")
    .select("number")
    .eq("id", change_id)
    .maybeSingle();
  const num = (ch as { number?: string } | null)?.number;
  if (num) revalidatePath(`/changes/${num}`);
  return { ok: true };
}

// Re-export type aliases used elsewhere — silences "exported but never used" lint
// when the parent imports them via this barrel.
export type {
  Change,
  ChangeState,
  ChangeType,
  ChangeApprovalRole,
  ChangeApprovalState,
  ChangeTaskState,
};
export { CHANGE_STATES, CHANGE_TYPES, CHANGE_APPROVAL_ROLES, CHANGE_APPROVAL_STATES, CHANGE_TASK_STATES };
