import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import { listChangeTemplates } from "@/lib/changes/queries";
import NewChangeWizard from "@/components/changes/NewChangeWizard";

export const metadata: Metadata = { title: "New change | ifBash" };

export default async function NewChangePage() {
  const profile = await requireProfile();
  const admin = createAdminClient();

  type CiRow = { id: string; name: string };

  async function loadCis(): Promise<CiRow[]> {
    try {
      const { data } = await admin
        .from("cis")
        .select("id, name")
        .eq("tenant_id", profile.tenant_id)
        .limit(200);
      return (data ?? []) as CiRow[];
    } catch {
      return [];
    }
  }

  const [profiles, templates, ticketsRes, cisData] = await Promise.all([
    listProfilesInTenant(),
    listChangeTemplates(),
    admin
      .from("tickets")
      .select("id, number, title, priority, state")
      .eq("tenant_id", profile.tenant_id)
      .not("state", "in", "(closed,cancelled,resolved)")
      .order("created_at", { ascending: false })
      .limit(50),
    loadCis(),
  ]);

  const tickets = (ticketsRes.data ?? []) as Array<{
    id: string;
    number: string;
    title: string;
    priority: string;
    state: string;
  }>;

  return (
    <NewChangeWizard
      profiles={profiles}
      tickets={tickets}
      cis={cisData}
      templates={templates.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
      }))}
    />
  );
}
