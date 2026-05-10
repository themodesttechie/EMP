import "server-only";
import { createClient } from "@/lib/supabase/server";

export type DirectoryProfile = {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  manager_id: string | null;
  department: string | null;
  job_title: string | null;
  phone: string | null;
  location: string | null;
  locale: string | null;
  about: string | null;
  joined_at: string | null;
  is_active: boolean;
};

const COLS =
  "id, tenant_id, email, full_name, avatar_url, role, manager_id, department, job_title, phone, location, locale, about, joined_at, is_active";

export async function searchProfiles(
  query: string,
  filters?: { department?: string; location?: string },
  limit = 200,
): Promise<DirectoryProfile[]> {
  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select(COLS)
    .eq("is_active", true)
    .order("full_name")
    .limit(limit);

  if (query) {
    const safe = query.replace(/[%,()]/g, " ").trim();
    if (safe) q = q.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%,job_title.ilike.%${safe}%`);
  }
  if (filters?.department && filters.department !== "All") q = q.eq("department", filters.department);
  if (filters?.location && filters.location !== "All") q = q.eq("location", filters.location);

  const { data } = await q;
  return (data ?? []) as DirectoryProfile[];
}

export async function getProfile(userId: string): Promise<DirectoryProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(COLS).eq("id", userId).maybeSingle();
  return (data as DirectoryProfile | null) ?? null;
}

export async function listByDepartment(department: string): Promise<DirectoryProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(COLS)
    .eq("is_active", true)
    .eq("department", department)
    .order("full_name");
  return (data ?? []) as DirectoryProfile[];
}

export async function listDirectReports(managerId: string): Promise<DirectoryProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(COLS)
    .eq("is_active", true)
    .eq("manager_id", managerId)
    .order("full_name");
  return (data ?? []) as DirectoryProfile[];
}

export type OrgNode = DirectoryProfile & { reports: OrgNode[] };

export async function getOrgChart(): Promise<OrgNode[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(COLS).eq("is_active", true).order("full_name");
  const all = (data ?? []) as DirectoryProfile[];
  const byId = new Map<string, OrgNode>();
  for (const p of all) byId.set(p.id, { ...p, reports: [] });
  const roots: OrgNode[] = [];
  for (const node of byId.values()) {
    if (node.manager_id && byId.has(node.manager_id)) {
      byId.get(node.manager_id)!.reports.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function listDistinctDepartments(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("department")
    .eq("is_active", true)
    .not("department", "is", null);
  const set = new Set<string>();
  for (const r of (data ?? []) as Array<{ department: string | null }>) {
    if (r.department) set.add(r.department);
  }
  return Array.from(set).sort();
}

export async function listDistinctLocations(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("location")
    .eq("is_active", true)
    .not("location", "is", null);
  const set = new Set<string>();
  for (const r of (data ?? []) as Array<{ location: string | null }>) {
    if (r.location) set.add(r.location);
  }
  return Array.from(set).sort();
}
