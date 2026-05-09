"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { triageTicket } from "@/lib/ai/triage";
import { summarizeThread } from "@/lib/ai/summarize";
import { computeSlaDueAt } from "@/lib/sla/engine";
import { nextTicketNumber } from "./numbering";
import { createNotification } from "@/lib/notifications/actions";
import type { Ticket, TicketPriority, TicketState } from "./types";

export type ActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

const VALID_PRIORITIES: TicketPriority[] = ["P1", "P2", "P3", "P4"];
const VALID_STATES: TicketState[] = [
  "new",
  "triage",
  "in_progress",
  "pending_user",
  "resolved",
  "closed",
  "cancelled",
];

function sanitiseString(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function createTicketAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ number: string }>> {
  const profile = await requireProfile();
  const title = sanitiseString(formData.get("title"), 200);
  const description = sanitiseString(formData.get("description"), 8000) || null;
  const requestedCategoryId = sanitiseString(formData.get("category_id"), 64) || null;
  const priorityRaw = sanitiseString(formData.get("priority"), 3) as TicketPriority;
  const priorityIn: TicketPriority = VALID_PRIORITIES.includes(priorityRaw) ? priorityRaw : "P3";

  if (!title) return { error: "Title is required." };

  const admin = createAdminClient();

  // Run AI triage to suggest category + priority. Always non-blocking on failure.
  const { data: cats } = await admin
    .from("ticket_categories")
    .select("id, slug, name, description, default_priority, default_assignment_role")
    .eq("tenant_id", profile.tenant_id)
    .eq("is_active", true);

  type CatRow = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    default_priority: TicketPriority;
    default_assignment_role: string | null;
  };
  const categories: CatRow[] = (cats ?? []) as CatRow[];

  const triage = await triageTicket({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    input: {
      title,
      description,
      available_categories: categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
      })),
    },
  });

  // Resolve category: prefer user pick, else AI suggestion, else null
  let category_id: string | null = requestedCategoryId;
  if (!category_id && triage.category_slug) {
    category_id = categories.find((c) => c.slug === triage.category_slug)?.id ?? null;
  }
  // Resolve priority: user pick wins; else AI; else P3
  const priority: TicketPriority = priorityIn || triage.priority || "P3";

  // Allocate INC- number
  const number = await nextTicketNumber(profile.tenant_id);

  // Compute SLA due timestamps
  const createdAt = new Date();
  const sla = await computeSlaDueAt({
    tenant_id: profile.tenant_id,
    category_id,
    priority,
    created_at: createdAt,
  });

  const ai_classification = triage.degraded
    ? null
    : {
        category_slug: triage.category_slug,
        category_id,
        priority: triage.priority,
        confidence: triage.confidence,
        reasoning: triage.reasoning,
        accepted_by_agent: null,
        model: process.env.ANTHROPIC_MODEL_HAIKU || "claude-haiku-4-5-20251001",
        at: createdAt.toISOString(),
      };

  const supabase = await createClient();
  const { data: inserted, error: insErr } = await supabase
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
      description,
      ai_classification,
      response_due_at: sla.response_due_at?.toISOString() ?? null,
      resolution_due_at: sla.resolution_due_at?.toISOString() ?? null,
    })
    .select("id, number")
    .single();

  if (insErr || !inserted) {
    return { error: insErr?.message || "Failed to create ticket." };
  }

  const ticketId = (inserted as { id: string }).id;

  // History + audit + notification
  await admin.from("ticket_state_history").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    from_state: null,
    to_state: "new",
    by_user: profile.id,
    reason: "Ticket created",
  });
  await admin.from("ticket_comments").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    author_id: profile.id,
    kind: "system",
    body: `Ticket opened by ${profile.full_name || profile.email}.`,
  });

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.create",
    entity_type: "ticket",
    entity_id: ticketId,
    after: { number, title, priority, category_id, source: "portal" },
  });

  // Notify any agent in tenant — for now, every agent (Sprint 4 narrows by group)
  const { data: agents } = await admin
    .from("profiles")
    .select("id")
    .eq("tenant_id", profile.tenant_id)
    .in("role", ["agent", "admin", "owner"])
    .neq("id", profile.id)
    .limit(50);

  for (const a of (agents ?? []) as Array<{ id: string }>) {
    await createNotification({
      tenant_id: profile.tenant_id,
      recipient_id: a.id,
      kind: "ticket_new",
      subject: `New ticket: ${number}`,
      body_md: `**${title}** opened by ${profile.full_name || profile.email}. Priority **${priority}**.`,
      related_type: "ticket",
      related_id: ticketId,
      channel: "in_app",
    });
  }

  revalidatePath("/helpdesk");
  redirect(`/helpdesk/${number}`);
}

export async function assignTicketAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner", "manager"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const ticketId = sanitiseString(formData.get("ticket_id"), 64);
  const assigneeId = sanitiseString(formData.get("assignee_id"), 64) || null;
  if (!ticketId) return { error: "Ticket id required." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: before } = await supabase
    .from("tickets")
    .select("id, number, assignee_id, state")
    .eq("id", ticketId)
    .maybeSingle();
  if (!before) return { error: "Ticket not found." };

  const updates: Record<string, unknown> = { assignee_id: assigneeId };
  if ((before as { state: string }).state === "new") updates.state = "triage";

  const { error } = await supabase.from("tickets").update(updates).eq("id", ticketId);
  if (error) return { error: error.message };

  await admin.from("ticket_comments").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    author_id: profile.id,
    kind: "system",
    body: assigneeId
      ? `Assigned by ${profile.full_name || profile.email}.`
      : `Unassigned by ${profile.full_name || profile.email}.`,
  });

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.assign",
    entity_type: "ticket",
    entity_id: ticketId,
    before: { assignee_id: (before as { assignee_id: string | null }).assignee_id },
    after: { assignee_id: assigneeId },
  });

  if (assigneeId && assigneeId !== profile.id) {
    await createNotification({
      tenant_id: profile.tenant_id,
      recipient_id: assigneeId,
      kind: "ticket_assigned",
      subject: `Assigned: ${(before as { number: string }).number}`,
      body_md: `${profile.full_name || profile.email} assigned ticket **${(before as { number: string }).number}** to you.`,
      related_type: "ticket",
      related_id: ticketId,
      channel: "in_app",
    });
  }

  const number = (before as { number: string }).number;
  revalidatePath(`/helpdesk/${number}`);
  revalidatePath("/helpdesk");
  return { ok: true };
}

export async function addTicketCommentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const ticketId = sanitiseString(formData.get("ticket_id"), 64);
  const body = sanitiseString(formData.get("body"), 8000);
  const isInternal = formData.get("is_internal") === "on";

  if (!ticketId || !body) return { error: "Comment cannot be empty." };

  const supabase = await createClient();
  const { error } = await supabase.from("ticket_comments").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    author_id: profile.id,
    kind: "comment",
    body,
    is_internal:
      isInternal &&
      ["admin", "owner", "agent", "manager"].includes(profile.role),
  });
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.comment",
    entity_type: "ticket",
    entity_id: ticketId,
    after: { internal: isInternal, len: body.length },
  });

  // Auto-summarize when thread crosses 10 comments
  const admin = createAdminClient();
  const { count } = await admin
    .from("ticket_comments")
    .select("*", { count: "exact", head: true })
    .eq("ticket_id", ticketId);
  if (count && count >= 10 && count % 5 === 0) {
    const { data: ticket } = await admin
      .from("tickets")
      .select("id, number, title, tenant_id")
      .eq("id", ticketId)
      .maybeSingle();
    const t = ticket as { id: string; number: string; title: string; tenant_id: string } | null;
    if (t) {
      const { data: comments } = await admin
        .from("ticket_comments")
        .select("body, kind, created_at, author:profiles(full_name, email)")
        .eq("ticket_id", ticketId)
        .order("created_at")
        .limit(50);
      const flat = (comments ?? []).map(
        (c: { body: string; kind: string; created_at: string; author?: { full_name?: string | null; email?: string } | { full_name?: string | null; email?: string }[] | null }) => {
          const a = Array.isArray(c.author) ? c.author[0] : c.author;
          return {
            author: a?.full_name || a?.email || "system",
            created_at: c.created_at,
            body: c.body,
            kind: c.kind,
          };
        },
      );
      const summary = await summarizeThread({
        tenant_id: t.tenant_id,
        actor_id: null,
        ticket_id: t.id,
        input: {
          ticket_number: t.number,
          title: t.title,
          comments: flat,
        },
      });
      if (!summary.degraded && summary.summary) {
        await admin.from("ticket_comments").insert({
          tenant_id: t.tenant_id,
          ticket_id: t.id,
          author_id: null,
          kind: "ai",
          body:
            `**Thread summary**\n\n${summary.summary}\n\n` +
            (summary.key_points.length
              ? `**Key points**\n${summary.key_points.map((p) => `- ${p}`).join("\n")}\n\n`
              : "") +
            (summary.suggested_next_step
              ? `**Suggested next step**\n${summary.suggested_next_step}`
              : ""),
          is_internal: true,
        });
      }
    }
  }

  // Look up the ticket number for revalidation
  const { data: t2 } = await admin
    .from("tickets")
    .select("number")
    .eq("id", ticketId)
    .maybeSingle();
  const number = (t2 as { number: string } | null)?.number;
  if (number) revalidatePath(`/helpdesk/${number}`);
  return { ok: true };
}

export async function updateTicketStateAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner", "manager"].includes(profile.role) && profile.role !== "employee") {
    return { error: "Not authorised." };
  }
  const ticketId = sanitiseString(formData.get("ticket_id"), 64);
  const toState = sanitiseString(formData.get("to_state"), 24) as TicketState;
  const reason = sanitiseString(formData.get("reason"), 1000) || null;

  if (!ticketId || !VALID_STATES.includes(toState)) {
    return { error: "Invalid state transition." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: before } = await supabase
    .from("tickets")
    .select("id, number, state, requester_id, assignee_id, responded_at, resolved_at")
    .eq("id", ticketId)
    .maybeSingle();
  if (!before) return { error: "Ticket not found." };
  const b = before as Pick<Ticket, "id" | "number" | "state" | "requester_id" | "assignee_id" | "responded_at" | "resolved_at">;

  // Employees can only cancel their own ticket
  if (profile.role === "employee") {
    if (b.requester_id !== profile.id) return { error: "Not authorised." };
    if (toState !== "cancelled") return { error: "You may only cancel your own ticket." };
  }

  if (b.state === toState) return { ok: true };

  const updates: Record<string, unknown> = { state: toState };
  const now = new Date().toISOString();
  if (!b.responded_at && ["in_progress", "pending_user", "resolved", "closed"].includes(toState)) {
    updates.responded_at = now;
  }
  if (toState === "resolved" && !b.resolved_at) updates.resolved_at = now;
  if (toState === "closed") updates.closed_at = now;

  const { error } = await supabase.from("tickets").update(updates).eq("id", ticketId);
  if (error) return { error: error.message };

  await admin.from("ticket_state_history").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    from_state: b.state,
    to_state: toState,
    by_user: profile.id,
    reason,
  });
  await admin.from("ticket_comments").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    author_id: profile.id,
    kind: "system",
    body: `State changed from ${b.state} to ${toState}${reason ? `: ${reason}` : "."}`,
  });

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.state_change",
    entity_type: "ticket",
    entity_id: ticketId,
    before: { state: b.state },
    after: { state: toState, reason },
  });

  // Notify requester on resolved/closed
  if (["resolved", "closed", "pending_user"].includes(toState) && b.requester_id !== profile.id) {
    await createNotification({
      tenant_id: profile.tenant_id,
      recipient_id: b.requester_id,
      kind: `ticket_${toState}`,
      subject: `Ticket ${b.number} ${toState.replace("_", " ")}`,
      body_md: `Your ticket **${b.number}** is now **${toState.replace("_", " ")}**.${reason ? `\n\nReason: ${reason}` : ""}`,
      related_type: "ticket",
      related_id: ticketId,
      channel: "both",
    });
  }

  revalidatePath(`/helpdesk/${b.number}`);
  revalidatePath("/helpdesk");
  return { ok: true };
}

export async function escalateTicketAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner", "manager"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const ticketId = sanitiseString(formData.get("ticket_id"), 64);
  const reason = sanitiseString(formData.get("reason"), 1000) || null;
  if (!ticketId) return { error: "Ticket id required." };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: before } = await supabase
    .from("tickets")
    .select("id, number, priority, category_id, created_at")
    .eq("id", ticketId)
    .maybeSingle();
  if (!before) return { error: "Ticket not found." };
  const b = before as { id: string; number: string; priority: TicketPriority; category_id: string | null; created_at: string };

  // Bump priority by 1 step (P4→P3→P2→P1; P1 stays)
  const order: TicketPriority[] = ["P4", "P3", "P2", "P1"];
  const idx = order.indexOf(b.priority);
  const next: TicketPriority = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : b.priority;

  const sla = await computeSlaDueAt({
    tenant_id: profile.tenant_id,
    category_id: b.category_id,
    priority: next,
    created_at: new Date(b.created_at),
  });

  const { error } = await supabase
    .from("tickets")
    .update({
      priority: next,
      response_due_at: sla.response_due_at?.toISOString() ?? null,
      resolution_due_at: sla.resolution_due_at?.toISOString() ?? null,
      sla_breached: false,
      sla_warned_at: null,
    })
    .eq("id", ticketId);
  if (error) return { error: error.message };

  await admin.from("ticket_state_history").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    from_state: null,
    to_state: "in_progress",
    by_user: profile.id,
    reason: `Escalated ${b.priority} → ${next}${reason ? `: ${reason}` : ""}`,
  });
  await admin.from("ticket_comments").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    author_id: profile.id,
    kind: "system",
    body: `Escalated from ${b.priority} to ${next}${reason ? `: ${reason}` : "."}`,
  });

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.escalate",
    entity_type: "ticket",
    entity_id: ticketId,
    before: { priority: b.priority },
    after: { priority: next, reason },
  });

  revalidatePath(`/helpdesk/${b.number}`);
  return { ok: true };
}

export async function acceptTriageSuggestionAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner", "manager"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const ticketId = sanitiseString(formData.get("ticket_id"), 64);
  if (!ticketId) return { error: "Ticket id required." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("tickets")
    .select("id, number, ai_classification, category_id, priority")
    .eq("id", ticketId)
    .maybeSingle();
  if (!row) return { error: "Ticket not found." };
  type R = {
    id: string;
    number: string;
    ai_classification: { category_id: string | null; priority: TicketPriority } | null;
    category_id: string | null;
    priority: TicketPriority;
  };
  const r = row as R;
  const ai = r.ai_classification;
  if (!ai) return { error: "No AI suggestion to accept." };

  const updates: Record<string, unknown> = {
    category_id: ai.category_id ?? r.category_id,
    priority: ai.priority,
    ai_classification: { ...ai, accepted_by_agent: true },
  };
  const { error } = await supabase.from("tickets").update(updates).eq("id", ticketId);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.ai_triage_accepted",
    entity_type: "ticket",
    entity_id: ticketId,
    after: { ai_priority: ai.priority, ai_category_id: ai.category_id },
  });

  revalidatePath(`/helpdesk/${r.number}`);
  return { ok: true };
}
