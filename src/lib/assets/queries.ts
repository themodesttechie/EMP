import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AssetAssignment,
  AssetAuditEvent,
  Ci,
  CiClass,
  CiRelationship,
} from "./types";

const CI_COLS =
  "id, tenant_id, number, class_id, name, serial, asset_tag, status, location, attributes, purchased_at, warranty_until, cost_centre, owner_user_id, email_message_id, notes, created_at, updated_at";

export async function listCiClasses(): Promise<CiClass[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ci_classes")
    .select(
      "id, tenant_id, parent_id, slug, name, description, attributes_schema, is_active",
    )
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as CiClass[];
}

export async function listMyAssets(userId: string): Promise<Ci[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cis")
    .select(CI_COLS)
    .eq("owner_user_id", userId)
    .order("name");
  return (data ?? []) as Ci[];
}

export async function listAssignedToMe(userId: string): Promise<
  Array<AssetAssignment & { ci: Ci | null }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_assignments")
    .select(
      `id, tenant_id, ci_id, user_id, assigned_by, assigned_at, returned_at, returned_to, condition, return_condition, checkout_notes, return_notes, created_at,
       ci:cis(${CI_COLS})`,
    )
    .eq("user_id", userId)
    .is("returned_at", null)
    .order("assigned_at", { ascending: false });
  type Row = AssetAssignment & { ci: Ci | Ci[] | null };
  return ((data ?? []) as Row[]).map((r) => ({
    ...r,
    ci: Array.isArray(r.ci) ? r.ci[0] ?? null : r.ci,
  }));
}

export async function listAllInTenant(filters?: {
  status?: string;
  class_id?: string;
  owner_user_id?: string;
  q?: string;
}): Promise<Ci[]> {
  const supabase = await createClient();
  let q = supabase
    .from("cis")
    .select(CI_COLS)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.class_id) q = q.eq("class_id", filters.class_id);
  if (filters?.owner_user_id) q = q.eq("owner_user_id", filters.owner_user_id);
  if (filters?.q) {
    const t = filters.q.replace(/[%_]/g, "");
    q = q.or(`name.ilike.%${t}%,asset_tag.ilike.%${t}%,serial.ilike.%${t}%,number.ilike.%${t}%`);
  }
  const { data } = await q;
  return (data ?? []) as Ci[];
}

export async function getAssetById(id: string): Promise<Ci | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cis")
    .select(CI_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as Ci | null;
}

export async function getAssetByNumber(number: string): Promise<Ci | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cis")
    .select(CI_COLS)
    .eq("number", number)
    .maybeSingle();
  return (data ?? null) as Ci | null;
}

export async function getRelationships(ci_id: string): Promise<{
  outgoing: CiRelationship[];
  incoming: CiRelationship[];
}> {
  const supabase = await createClient();
  const cols =
    "id, tenant_id, from_ci, to_ci, type, inverse_type, notes, created_at";
  const [outRes, inRes] = await Promise.all([
    supabase.from("ci_relationships").select(cols).eq("from_ci", ci_id),
    supabase.from("ci_relationships").select(cols).eq("to_ci", ci_id),
  ]);
  return {
    outgoing: (outRes.data ?? []) as CiRelationship[],
    incoming: (inRes.data ?? []) as CiRelationship[],
  };
}

export async function getAssignmentHistory(ci_id: string): Promise<AssetAssignment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_assignments")
    .select(
      "id, tenant_id, ci_id, user_id, assigned_by, assigned_at, returned_at, returned_to, condition, return_condition, checkout_notes, return_notes, created_at",
    )
    .eq("ci_id", ci_id)
    .order("assigned_at", { ascending: false });
  return (data ?? []) as AssetAssignment[];
}

export async function getAssetAudit(ci_id: string): Promise<AssetAuditEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_audit_log")
    .select("id, tenant_id, ci_id, event, by_user, payload, at")
    .eq("ci_id", ci_id)
    .order("at", { ascending: false })
    .limit(200);
  return (data ?? []) as AssetAuditEvent[];
}

export async function getLinkedTickets(ci_id: string): Promise<
  Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string }>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticket_ci_links")
    .select("ticket:tickets(id, number, title, state, priority, created_at)")
    .eq("ci_id", ci_id);
  type Row = {
    ticket:
      | { id: string; number: string; title: string; state: string; priority: string; created_at: string }
      | { id: string; number: string; title: string; state: string; priority: string; created_at: string }[]
      | null;
  };
  const out: Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string }> = [];
  for (const row of (data ?? []) as Row[]) {
    const t = Array.isArray(row.ticket) ? row.ticket[0] : row.ticket;
    if (t) out.push(t);
  }
  return out;
}

export async function getCisAssignedToUser(userId: string): Promise<Ci[]> {
  // Convenience: read CIs where the *current* assignment open belongs to user.
  // Distinct from owner_user_id because ownership changes only on transfer.
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_assignments")
    .select(`ci:cis(${CI_COLS})`)
    .eq("user_id", userId)
    .is("returned_at", null);
  type Row = { ci: Ci | Ci[] | null };
  const out: Ci[] = [];
  for (const r of (data ?? []) as Row[]) {
    const ci = Array.isArray(r.ci) ? r.ci[0] : r.ci;
    if (ci) out.push(ci);
  }
  return out;
}

export async function countByStatus(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("cis").select("status");
  const out: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ status: string }>) {
    out[row.status] = (out[row.status] ?? 0) + 1;
  }
  return out;
}

export async function listRecentAssignments(limit = 20): Promise<AssetAssignment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("asset_assignments")
    .select(
      "id, tenant_id, ci_id, user_id, assigned_by, assigned_at, returned_at, returned_to, condition, return_condition, checkout_notes, return_notes, created_at",
    )
    .order("assigned_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AssetAssignment[];
}
