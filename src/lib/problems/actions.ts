"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { proposeRootCause as aiProposeRootCause } from "@/lib/ai/rca";
import { MODEL_SONNET } from "@/lib/ai/models";
import { nextProblemNumber } from "./numbering";
import { PROBLEM_STATES, type ProblemState } from "./types";
import type { TicketPriority } from "@/lib/tickets/types";

export type ActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

const MANAGE_ROLES = ["agent", "manager", "admin", "owner"];
const VALID_PRIORITIES: TicketPriority[] = ["P1", "P2", "P3", "P4"];

function s(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function createProblemAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string; number: string }>> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };

  const title = s(formData.get("title"), 200);
  const description = s(formData.get("description"), 8000) || null;
  const priorityRaw = s(formData.get("priority"), 3) as TicketPriority;
  const priority: TicketPriority = VALID_PRIORITIES.includes(priorityRaw) ? priorityRaw : "P3";
  const seedTicketId = s(formData.get("from_ticket_id"), 64) || null;
  if (!title) return { error: "Title is required." };

  const number = await nextProblemNumber(profile.tenant_id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("problems")
    .insert({
      tenant_id: profile.tenant_id,
      number,
      title,
      description,
      priority,
      state: "new",
      created_by: profile.id,
    })
    .select("id, number")
    .single();
  if (error || !data) return { error: error?.message || "Failed to create problem." };
  const row = data as { id: string; number: string };

  if (seedTicketId) {
    const admin = createAdminClient();
    await admin.from("problem_incident_links").insert({
      tenant_id: profile.tenant_id,
      problem_id: row.id,
      ticket_id: seedTicketId,
      linked_by: profile.id,
    });
  }

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.create",
    entity_type: "problem",
    entity_id: row.id,
    after: { number: row.number, title, priority, from_ticket_id: seedTicketId },
  });

  revalidatePath("/problems");
  return { ok: true, data: row };
}

export async function createProblemFromIncident(input: {
  ticket_id: string;
}): Promise<ActionResult<{ id: string; number: string }>> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };

  const admin = createAdminClient();
  const { data: ticket } = await admin
    .from("tickets")
    .select("id, number, title, description, priority")
    .eq("id", input.ticket_id)
    .maybeSingle();
  const t = ticket as
    | { id: string; number: string; title: string; description: string | null; priority: TicketPriority }
    | null;
  if (!t) return { error: "Ticket not found." };

  const number = await nextProblemNumber(profile.tenant_id);
  const { data, error } = await admin
    .from("problems")
    .insert({
      tenant_id: profile.tenant_id,
      number,
      title: `Problem from ${t.number}: ${t.title}`,
      description: t.description,
      priority: t.priority,
      state: "investigating",
      created_by: profile.id,
    })
    .select("id, number")
    .single();
  if (error || !data) return { error: error?.message || "Failed." };
  const row = data as { id: string; number: string };

  await admin.from("problem_incident_links").insert({
    tenant_id: profile.tenant_id,
    problem_id: row.id,
    ticket_id: t.id,
    linked_by: profile.id,
  });

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.create_from_incident",
    entity_type: "problem",
    entity_id: row.id,
    after: { number: row.number, source_ticket: t.number },
  });

  revalidatePath("/problems");
  revalidatePath(`/helpdesk/${t.number}`);
  return { ok: true, data: row };
}

export async function linkIncidentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const problem_id = s(formData.get("problem_id"), 64);
  const ticket_id = s(formData.get("ticket_id"), 64);
  if (!problem_id || !ticket_id) return { error: "problem_id and ticket_id required." };

  const supabase = await createClient();
  const { error } = await supabase.from("problem_incident_links").insert({
    tenant_id: profile.tenant_id,
    problem_id,
    ticket_id,
    linked_by: profile.id,
  });
  if (error && !/duplicate/i.test(error.message)) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.link_incident",
    entity_type: "problem",
    entity_id: problem_id,
    after: { ticket_id },
  });
  revalidatePath(`/problems`);
  return { ok: true };
}

export async function unlinkIncidentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const problem_id = s(formData.get("problem_id"), 64);
  const ticket_id = s(formData.get("ticket_id"), 64);
  if (!problem_id || !ticket_id) return { error: "ids required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("problem_incident_links")
    .delete()
    .eq("problem_id", problem_id)
    .eq("ticket_id", ticket_id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.unlink_incident",
    entity_type: "problem",
    entity_id: problem_id,
    after: { ticket_id },
  });
  revalidatePath(`/problems`);
  return { ok: true };
}

export async function updateStateAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const id = s(formData.get("id"), 64);
  const to = s(formData.get("state"), 24) as ProblemState;
  const root_cause = s(formData.get("root_cause"), 8000) || null;
  const workaround = s(formData.get("workaround"), 8000) || null;
  if (!id || !PROBLEM_STATES.includes(to)) return { error: "Invalid state." };

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("problems")
    .select("id, state, number, root_cause, workaround")
    .eq("id", id)
    .maybeSingle();
  if (!before) return { error: "Problem not found." };
  const b = before as { id: string; state: ProblemState; number: string; root_cause: string | null; workaround: string | null };

  const updates: Record<string, unknown> = { state: to };
  const now = new Date().toISOString();
  if (to === "resolved") updates.resolved_at = now;
  if (to === "closed") updates.closed_at = now;
  if (root_cause !== null) updates.root_cause = root_cause;
  if (workaround !== null) updates.workaround = workaround;

  const { error } = await supabase.from("problems").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.state_change",
    entity_type: "problem",
    entity_id: id,
    before: { state: b.state },
    after: updates,
  });

  revalidatePath(`/problems`);
  revalidatePath(`/problems/${b.number}`);
  return { ok: true };
}

export async function promoteToKnownErrorAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const problem_id = s(formData.get("problem_id"), 64);
  const workaround_summary = s(formData.get("workaround_summary"), 4000) || null;
  if (!problem_id) return { error: "problem_id required." };

  const supabase = await createClient();
  // Upsert known_errors row
  const { error } = await supabase
    .from("known_errors")
    .upsert(
      {
        tenant_id: profile.tenant_id,
        problem_id,
        workaround_summary,
        created_by: profile.id,
      },
      { onConflict: "problem_id" },
    );
  if (error) return { error: error.message };

  // Bump state to known_error if currently lower
  await supabase.from("problems").update({ state: "known_error" }).eq("id", problem_id);

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.promote_known_error",
    entity_type: "problem",
    entity_id: problem_id,
    after: { workaround_summary },
  });
  revalidatePath(`/problems`);
  return { ok: true };
}

// Bare-form wrappers
export async function updateStateFormAction(formData: FormData): Promise<void> {
  await updateStateAction(undefined, formData);
}
export async function unlinkIncidentFormAction(formData: FormData): Promise<void> {
  await unlinkIncidentAction(undefined, formData);
}
export async function linkIncidentFormAction(formData: FormData): Promise<void> {
  await linkIncidentAction(undefined, formData);
}
export async function promoteToKnownErrorFormAction(formData: FormData): Promise<void> {
  await promoteToKnownErrorAction(undefined, formData);
}
export async function proposeRootCauseFormAction(formData: FormData): Promise<void> {
  await proposeRootCauseAction(undefined, formData);
}

export async function proposeRootCauseAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ root_cause: string; confidence: number }>> {
  const profile = await requireProfile();
  if (!MANAGE_ROLES.includes(profile.role)) return { error: "Not authorised." };
  const problem_id = s(formData.get("problem_id"), 64);
  if (!problem_id) return { error: "problem_id required." };

  const r = await aiProposeRootCause({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    problem_id,
  });
  if (r.degraded) return { error: "AI unavailable or cap reached." };

  // Persist the proposal on the problem row
  const admin = createAdminClient();
  await admin
    .from("problems")
    .update({
      ai_proposed_root_cause: {
        root_cause: r.root_cause,
        confidence: r.confidence,
        reasoning: r.reasoning,
        supporting_incidents: r.supporting_incidents,
        model: MODEL_SONNET,
        at: new Date().toISOString(),
      },
    })
    .eq("id", problem_id);

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "problem.ai_rca",
    entity_type: "problem",
    entity_id: problem_id,
    after: { confidence: r.confidence, has_text: r.root_cause.length > 0 },
  });

  revalidatePath(`/problems`);
  return {
    ok: true,
    data: { root_cause: r.root_cause, confidence: r.confidence },
  };
}
