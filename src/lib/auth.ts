import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AppRole = "owner" | "admin" | "agent" | "manager" | "employee";

export type Profile = {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  manager_id: string | null;
  department: string | null;
  job_title: string | null;
  phone: string | null;
  is_active: boolean;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, tenant_id, email, full_name, avatar_url, role, manager_id, department, job_title, phone, is_active",
    )
    .eq("id", user.id)
    .maybeSingle();

  return data as Profile | null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/signin");
  return profile;
}

export async function requireRole(roles: AppRole[]): Promise<Profile> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) {
    redirect("/error-403");
  }
  return profile;
}
