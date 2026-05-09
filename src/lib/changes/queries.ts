import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Change,
  ChangeApproval,
  ChangeTask,
  ChangeTemplate,
  ChangeTicketLink,
} from "./types";

const CHANGE_COLS =
  "id, tenant_id, number, title, description, type, risk_score, state, planned_start, planned_end, actual_start, actual_end, requester_id, implementer_id, affected_ci_ids, rollback_plan, template_id, ai_classification, created_at, updated_at";

export async function listMyChanges(filters?: {
  state?: string;
  type?: string;
}): Promise<Change[]> {
  const supabase = await createClient();
  let q = supabase
    .from("changes")
    .select(CHANGE_COLS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters?.state) q = q.eq("state", filters.state);
  if (filters?.type) q = q.eq("type", filters.type);
  const { data } = await q;
  return (data ?? []) as Change[];
}

export async function listAllChanges(filters?: {
  state?: string;
  type?: string;
  requester_id?: string;
  scheduled_after?: string;
  scheduled_before?: string;
}): Promise<Change[]> {
  const supabase = await createClient();
  let q = supabase
    .from("changes")
    .select(CHANGE_COLS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters?.state) q = q.eq("state", filters.state);
  if (filters?.type) q = q.eq("type", filters.type);
  if (filters?.requester_id) q = q.eq("requester_id", filters.requester_id);
  if (filters?.scheduled_after) q = q.gte("planned_start", filters.scheduled_after);
  if (filters?.scheduled_before) q = q.lte("planned_start", filters.scheduled_before);
  const { data } = await q;
  return (data ?? []) as Change[];
}

export async function listCabQueue(): Promise<Change[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("changes")
    .select(CHANGE_COLS)
    .eq("state", "cab_review")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Change[];
}

export async function listScheduledChanges(): Promise<Change[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("changes")
    .select(CHANGE_COLS)
    .in("state", ["approved", "scheduled", "in_progress"])
    .order("planned_start", { ascending: true })
    .limit(200);
  return (data ?? []) as Change[];
}

export async function getChangeByNumber(number: string): Promise<Change | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("changes")
    .select(CHANGE_COLS)
    .eq("number", number)
    .maybeSingle();
  return (data ?? null) as Change | null;
}

export async function getChangeById(id: string): Promise<Change | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("changes")
    .select(CHANGE_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as Change | null;
}

export async function getApprovals(change_id: string): Promise<ChangeApproval[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("change_approvals")
    .select("id, tenant_id, change_id, approver_id, role, state, decided_at, comment, created_at")
    .eq("change_id", change_id)
    .order("created_at");
  return (data ?? []) as ChangeApproval[];
}

export async function getTasks(change_id: string): Promise<ChangeTask[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("change_tasks")
    .select(
      "id, tenant_id, change_id, sequence, title, description, owner_id, state, est_minutes, actual_minutes, started_at, completed_at, created_at, updated_at",
    )
    .eq("change_id", change_id)
    .order("sequence");
  return (data ?? []) as ChangeTask[];
}

export async function getLinkedTickets(change_id: string): Promise<ChangeTicketLink[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("change_ticket_links")
    .select("id, tenant_id, change_id, ticket_id, link_kind, created_by, created_at")
    .eq("change_id", change_id)
    .order("created_at");
  return (data ?? []) as ChangeTicketLink[];
}

export async function listChangeTemplates(): Promise<ChangeTemplate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("change_templates")
    .select(
      "id, tenant_id, slug, name, description, default_tasks, auto_approve, risk_score_ceiling, is_active, last_used_at, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as ChangeTemplate[];
}
