import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { KnownError, Problem } from "./types";

const COLS =
  "id, tenant_id, number, title, description, root_cause, workaround, state, priority, related_incidents_count, ai_proposed_root_cause, created_by, assigned_to, resolved_at, closed_at, created_at, updated_at";

export async function listOpen(filters?: {
  state?: string;
  priority?: string;
  assigned_to?: string;
}): Promise<Problem[]> {
  const supabase = await createClient();
  let q = supabase
    .from("problems")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters?.state) q = q.eq("state", filters.state);
  if (filters?.priority) q = q.eq("priority", filters.priority);
  if (filters?.assigned_to) q = q.eq("assigned_to", filters.assigned_to);
  const { data } = await q;
  return (data ?? []) as Problem[];
}

export async function getProblemByNumber(number: string): Promise<Problem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select(COLS)
    .eq("number", number)
    .maybeSingle();
  return (data ?? null) as Problem | null;
}

export async function getProblemById(id: string): Promise<Problem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select(COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as Problem | null;
}

export async function getLinkedIncidents(problem_id: string): Promise<
  Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string; description: string | null }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problem_incident_links")
    .select(
      "ticket:tickets(id, number, title, state, priority, created_at, description)",
    )
    .eq("problem_id", problem_id);
  type Row = {
    ticket:
      | { id: string; number: string; title: string; state: string; priority: string; created_at: string; description: string | null }
      | { id: string; number: string; title: string; state: string; priority: string; created_at: string; description: string | null }[]
      | null;
  };
  const out: Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string; description: string | null }> = [];
  for (const row of (data ?? []) as Row[]) {
    const t = Array.isArray(row.ticket) ? row.ticket[0] : row.ticket;
    if (t) out.push(t);
  }
  return out;
}

export async function getKnownError(problem_id: string): Promise<KnownError | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("known_errors")
    .select(
      "id, tenant_id, problem_id, kb_article_id, workaround_summary, created_by, created_at",
    )
    .eq("problem_id", problem_id)
    .maybeSingle();
  return (data ?? null) as KnownError | null;
}
