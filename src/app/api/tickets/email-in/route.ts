import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { logActionNoRequest } from "@/lib/audit/logger";
import { computeSlaDueAt } from "@/lib/sla/engine";
import { triageTicket } from "@/lib/ai/triage";
import { createNotification } from "@/lib/notifications/actions";

type ResendInbound = {
  // Resend inbound webhook payload (subset)
  type?: string;
  data?: {
    from?: { address?: string; name?: string };
    to?: Array<{ address?: string }>;
    subject?: string;
    text?: string;
    html?: string;
    headers?: Record<string, string>;
    message_id?: string;
    in_reply_to?: string;
  };
  // Some providers post these flat
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  message_id?: string;
  in_reply_to?: string;
};

function authorise(req: Request): boolean {
  const expected = process.env.RESEND_INBOUND_SECRET;
  if (!expected) return false;
  const got =
    req.headers.get("x-webhook-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    new URL(req.url).searchParams.get("secret");
  return got === expected;
}

function parseSenderEmail(payload: ResendInbound): string | null {
  const flat = payload.from;
  if (typeof flat === "string") {
    const m = flat.match(/<([^>]+)>/);
    return (m ? m[1] : flat).trim().toLowerCase();
  }
  return payload.data?.from?.address?.toLowerCase() ?? null;
}

function parseSubject(payload: ResendInbound): string {
  return (payload.subject || payload.data?.subject || "(no subject)").slice(0, 200);
}

function parseBody(payload: ResendInbound): string {
  return (payload.text || payload.data?.text || "").slice(0, 8000);
}

function parseInReplyTo(payload: ResendInbound): string | null {
  return (
    payload.in_reply_to ||
    payload.data?.in_reply_to ||
    payload.headers?.["in-reply-to"] ||
    payload.data?.headers?.["in-reply-to"] ||
    null
  );
}

function parseMessageId(payload: ResendInbound): string | null {
  return payload.message_id || payload.data?.message_id || null;
}

export async function POST(req: Request) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let payload: ResendInbound;
  try {
    payload = (await req.json()) as ResendInbound;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const senderEmail = parseSenderEmail(payload);
  if (!senderEmail) {
    return NextResponse.json({ error: "no_sender" }, { status: 400 });
  }
  const subject = parseSubject(payload);
  const body = parseBody(payload);
  const inReplyTo = parseInReplyTo(payload);
  const messageId = parseMessageId(payload);

  const admin = createAdminClient();

  // Resolve requester profile by email; bail if no match (we do not auto-create users from email yet).
  const { data: prof } = await admin
    .from("profiles")
    .select("id, tenant_id, full_name, email")
    .ilike("email", senderEmail)
    .maybeSingle();
  if (!prof) {
    return NextResponse.json({ ok: false, reason: "unknown_sender" }, { status: 202 });
  }
  const profile = prof as {
    id: string;
    tenant_id: string;
    full_name: string | null;
    email: string;
  };

  // Reply path: match in_reply_to to existing ticket's outbound message-id
  if (inReplyTo) {
    const { data: existing } = await admin
      .from("tickets")
      .select("id, number, tenant_id, requester_id")
      .eq("tenant_id", profile.tenant_id)
      .eq("email_message_id", inReplyTo)
      .maybeSingle();
    if (existing) {
      const t = existing as { id: string; number: string; tenant_id: string; requester_id: string };
      await admin.from("ticket_comments").insert({
        tenant_id: t.tenant_id,
        ticket_id: t.id,
        author_id: profile.id,
        kind: "comment",
        body,
        is_internal: false,
      });
      await logActionNoRequest({
        tenant_id: t.tenant_id,
        actor_id: profile.id,
        action: "ticket.email_in",
        entity_type: "ticket",
        entity_id: t.id,
        after: { kind: "reply", message_id: messageId },
      });
      return NextResponse.json({ ok: true, kind: "reply", ticket: t.number });
    }
  }

  // New ticket path
  const number = await (
    await import("@/lib/tickets/numbering")
  ).nextTicketNumber(profile.tenant_id);

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
    default_priority: "P1" | "P2" | "P3" | "P4";
    default_assignment_role: string | null;
  };
  const categories: CatRow[] = (cats ?? []) as CatRow[];

  const triage = await triageTicket({
    tenant_id: profile.tenant_id,
    actor_id: null,
    input: {
      title: subject,
      description: body,
      available_categories: categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
      })),
    },
  });

  const category_id = triage.category_slug
    ? categories.find((c) => c.slug === triage.category_slug)?.id ?? null
    : null;
  const priority = triage.priority || "P3";

  const created = new Date();
  const sla = await computeSlaDueAt({
    tenant_id: profile.tenant_id,
    category_id,
    priority,
    created_at: created,
  });

  const { data: inserted } = await admin
    .from("tickets")
    .insert({
      tenant_id: profile.tenant_id,
      number,
      requester_id: profile.id,
      category_id,
      priority,
      state: "new",
      source: "email",
      title: subject,
      description: body,
      ai_classification: triage.degraded
        ? null
        : {
            category_slug: triage.category_slug,
            category_id,
            priority: triage.priority,
            confidence: triage.confidence,
            reasoning: triage.reasoning,
            accepted_by_agent: null,
            model: process.env.ANTHROPIC_MODEL_HAIKU || "claude-haiku-4-5-20251001",
            at: created.toISOString(),
          },
      response_due_at: sla.response_due_at?.toISOString() ?? null,
      resolution_due_at: sla.resolution_due_at?.toISOString() ?? null,
      email_in_reply_to: inReplyTo,
    })
    .select("id, number")
    .single();
  if (!inserted) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }
  const ticketId = (inserted as { id: string }).id;

  await admin.from("ticket_state_history").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    from_state: null,
    to_state: "new",
    by_user: profile.id,
    reason: "Created via email",
    payload: messageId ? { message_id: messageId } : null,
  });
  await admin.from("ticket_comments").insert({
    tenant_id: profile.tenant_id,
    ticket_id: ticketId,
    author_id: profile.id,
    kind: "system",
    body: `Ticket opened by email from ${profile.full_name || profile.email}.`,
  });
  await logActionNoRequest({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "ticket.email_in",
    entity_type: "ticket",
    entity_id: ticketId,
    after: { kind: "new", number, message_id: messageId },
  });

  // Notify agents
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
      subject: `New ticket via email: ${number}`,
      body_md: `**${subject}** opened by ${profile.full_name || profile.email}. Priority **${priority}**.`,
      related_type: "ticket",
      related_id: ticketId,
      channel: "in_app",
    });
  }

  return NextResponse.json({ ok: true, kind: "new", ticket: number });
}
