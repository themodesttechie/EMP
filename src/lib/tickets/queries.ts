import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Ticket,
  TicketAttachment,
  TicketCategory,
  TicketComment,
  TicketStateHistoryRow,
} from "./types";

const TICKET_COLS =
  "id, tenant_id, number, requester_id, assignee_id, category_id, priority, state, source, title, description, ai_classification, response_due_at, resolution_due_at, responded_at, resolved_at, closed_at, sla_breached, sla_warned_at, email_message_id, email_in_reply_to, created_at, updated_at";

export async function listAllTicketCategories(): Promise<TicketCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_categories")
    .select(
      "id, tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role, is_active",
    )
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as TicketCategory[];
}

export async function listMyTickets(): Promise<Ticket[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(TICKET_COLS)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Ticket[];
}

export async function listAssignedTickets(): Promise<Ticket[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(TICKET_COLS)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Ticket[];
}

export async function listAllInTenant(filters?: {
  state?: string;
  priority?: string;
  category_id?: string;
  assignee_id?: string;
}): Promise<Ticket[]> {
  const supabase = await createClient();
  let q = supabase
    .from("tickets")
    .select(TICKET_COLS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters?.state) q = q.eq("state", filters.state);
  if (filters?.priority) q = q.eq("priority", filters.priority);
  if (filters?.category_id) q = q.eq("category_id", filters.category_id);
  if (filters?.assignee_id) q = q.eq("assignee_id", filters.assignee_id);

  const { data } = await q;
  return (data ?? []) as Ticket[];
}

export async function getTicketByNumber(number: string): Promise<Ticket | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(TICKET_COLS)
    .eq("number", number)
    .maybeSingle();
  return (data ?? null) as Ticket | null;
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(TICKET_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as Ticket | null;
}

export async function getTicketComments(ticket_id: string): Promise<TicketComment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_comments")
    .select("id, tenant_id, ticket_id, author_id, kind, body, is_internal, created_at")
    .eq("ticket_id", ticket_id)
    .order("created_at");
  return (data ?? []) as TicketComment[];
}

export async function getTicketAttachments(
  ticket_id: string,
): Promise<TicketAttachment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_attachments")
    .select(
      "id, tenant_id, ticket_id, uploaded_by, storage_path, filename, mime, size_bytes, created_at",
    )
    .eq("ticket_id", ticket_id)
    .order("created_at");
  return (data ?? []) as TicketAttachment[];
}

export async function getTicketHistory(
  ticket_id: string,
): Promise<TicketStateHistoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_state_history")
    .select("id, tenant_id, ticket_id, from_state, to_state, by_user, reason, payload, at")
    .eq("ticket_id", ticket_id)
    .order("at");
  return (data ?? []) as TicketStateHistoryRow[];
}

export async function listProfilesInTenant(): Promise<
  { id: string; full_name: string | null; email: string; role: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("is_active", true)
    .order("full_name");
  return (data ?? []) as Array<{
    id: string;
    full_name: string | null;
    email: string;
    role: string;
  }>;
}
