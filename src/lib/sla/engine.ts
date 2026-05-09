import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { logActionNoRequest } from "@/lib/audit/logger";
import { createNotification } from "@/lib/notifications/actions";

export type Priority = "P1" | "P2" | "P3" | "P4";

type SlaPolicyRow = {
  id: string;
  category_id: string | null;
  priority: Priority;
  response_minutes: number;
  resolution_minutes: number;
  business_hours_id: string | null;
};

// Resolve the policy for (tenant, category, priority). Specific category wins;
// fallback to the tenant default (category_id = null).
async function resolvePolicy(
  tenant_id: string,
  category_id: string | null,
  priority: Priority,
): Promise<SlaPolicyRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("sla_policies")
    .select("id, category_id, priority, response_minutes, resolution_minutes, business_hours_id")
    .eq("tenant_id", tenant_id)
    .eq("priority", priority)
    .eq("is_active", true);

  const rows = (data ?? []) as SlaPolicyRow[];
  if (rows.length === 0) return null;
  // Prefer a category-specific policy; fall back to default (null category).
  const specific = rows.find((r) => r.category_id === category_id);
  if (specific) return specific;
  return rows.find((r) => r.category_id === null) ?? rows[0];
}

export async function computeSlaDueAt(opts: {
  tenant_id: string;
  category_id: string | null;
  priority: Priority;
  created_at: Date;
}): Promise<{ response_due_at: Date | null; resolution_due_at: Date | null }> {
  const policy = await resolvePolicy(opts.tenant_id, opts.category_id, opts.priority);
  if (!policy) {
    return { response_due_at: null, resolution_due_at: null };
  }
  // Phase 1: simple wallclock add. Business-hours-aware skip TODO Sprint 4.
  const responseDue = new Date(
    opts.created_at.getTime() + policy.response_minutes * 60_000,
  );
  const resolutionDue = new Date(
    opts.created_at.getTime() + policy.resolution_minutes * 60_000,
  );
  return { response_due_at: responseDue, resolution_due_at: resolutionDue };
}

type OpenTicket = {
  id: string;
  tenant_id: string;
  number: string;
  assignee_id: string | null;
  requester_id: string;
  priority: Priority;
  state: string;
  created_at: string;
  resolution_due_at: string | null;
  responded_at: string | null;
  response_due_at: string | null;
  sla_breached: boolean;
  sla_warned_at: string | null;
};

export async function evaluateOpenTickets(): Promise<{
  scanned: number;
  warned: number;
  breached: number;
}> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("tickets")
    .select(
      "id, tenant_id, number, assignee_id, requester_id, priority, state, created_at, resolution_due_at, responded_at, response_due_at, sla_breached, sla_warned_at",
    )
    .not("state", "in", "(resolved,closed,cancelled)")
    .not("resolution_due_at", "is", null);

  const tickets = (data ?? []) as OpenTicket[];
  let warned = 0;
  let breached = 0;
  const now = Date.now();

  for (const t of tickets) {
    const resDue = t.resolution_due_at ? new Date(t.resolution_due_at).getTime() : null;
    const created = new Date(t.created_at).getTime();
    if (!resDue) continue;

    const total = resDue - created;
    const elapsed = now - created;
    const ratio = total > 0 ? elapsed / total : 0;

    // 100% — breach
    if (ratio >= 1 && !t.sla_breached) {
      await admin.from("tickets").update({ sla_breached: true }).eq("id", t.id);
      breached += 1;
      await logActionNoRequest({
        tenant_id: t.tenant_id,
        actor_id: null,
        action: "ticket.sla_breach",
        entity_type: "ticket",
        entity_id: t.id,
        before: { sla_breached: false },
        after: { sla_breached: true },
      });
      // Notify assignee + manager-of-assignee path collapses to assignee for now
      if (t.assignee_id) {
        await createNotification({
          tenant_id: t.tenant_id,
          recipient_id: t.assignee_id,
          kind: "sla_breach",
          subject: `SLA breached: ${t.number}`,
          body_md: `Ticket **${t.number}** has breached its resolution SLA.`,
          related_type: "ticket",
          related_id: t.id,
          channel: "in_app",
        });
      }
      continue;
    }

    // 75% — warning (once)
    if (ratio >= 0.75 && !t.sla_warned_at && !t.sla_breached) {
      await admin
        .from("tickets")
        .update({ sla_warned_at: new Date().toISOString() })
        .eq("id", t.id);
      warned += 1;
      await logActionNoRequest({
        tenant_id: t.tenant_id,
        actor_id: null,
        action: "ticket.sla_warning",
        entity_type: "ticket",
        entity_id: t.id,
        after: { ratio },
      });
      if (t.assignee_id) {
        await createNotification({
          tenant_id: t.tenant_id,
          recipient_id: t.assignee_id,
          kind: "sla_warning",
          subject: `SLA at 75%: ${t.number}`,
          body_md: `Ticket **${t.number}** is at 75% of its resolution SLA. Take action soon.`,
          related_type: "ticket",
          related_id: t.id,
          channel: "in_app",
        });
      }
    }
  }

  return { scanned: tickets.length, warned, breached };
}
