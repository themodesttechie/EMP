import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { sendSurveyForTrigger } from "./actions";

/**
 * Hook: call from `tickets/actions.ts updateTicketStateAction` when a ticket
 * transitions into the `resolved` state.
 *
 * Splice point (parent integrates after Sprint 7 merge):
 *
 *   if (toState === "resolved" && b.state !== "resolved") {
 *     await triggerOnTicketResolved(ticketId);
 *   }
 *
 * No-ops gracefully if no `post_incident_resolved` survey exists for the tenant.
 */
export async function triggerOnTicketResolved(
  ticket_id: string,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("tickets")
      .select("id, tenant_id, requester_id")
      .eq("id", ticket_id)
      .maybeSingle();
    if (!data) return { ok: false, reason: "ticket_not_found" };
    const t = data as { id: string; tenant_id: string; requester_id: string };

    const r = await sendSurveyForTrigger({
      tenant_id: t.tenant_id,
      related_type: "ticket",
      related_id: t.id,
      recipient_id: t.requester_id,
      trigger: "post_incident_resolved",
      source: "ticket_resolved",
    });
    return { ok: r.ok, reason: r.reason };
  } catch (e) {
    console.error("[surveys] triggerOnTicketResolved failed:", e);
    return { ok: false, reason: "exception" };
  }
}

/**
 * Hook: call from Sprint 5's `changes/actions.ts` when a change transitions
 * to the `done` state.
 *
 * Splice point:
 *
 *   if (toState === "done" && b.state !== "done") {
 *     await triggerOnChangeDone(changeId);
 *   }
 *
 * No-ops if Sprint 5 hasn't shipped yet (changes table missing) — we log and return.
 */
export async function triggerOnChangeDone(
  change_id: string,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const admin = createAdminClient();
    // Defensive: Sprint 5 may not be applied; query catches missing table.
    const { data, error } = await admin
      .from("changes")
      .select("id, tenant_id, requester_id")
      .eq("id", change_id)
      .maybeSingle();
    if (error) return { ok: false, reason: "changes_table_missing" };
    if (!data) return { ok: false, reason: "change_not_found" };
    const c = data as { id: string; tenant_id: string; requester_id: string };

    const r = await sendSurveyForTrigger({
      tenant_id: c.tenant_id,
      related_type: "change",
      related_id: c.id,
      recipient_id: c.requester_id,
      trigger: "post_change_done",
      source: "change_done",
    });
    return { ok: r.ok, reason: r.reason };
  } catch (e) {
    console.error("[surveys] triggerOnChangeDone failed:", e);
    return { ok: false, reason: "exception" };
  }
}
