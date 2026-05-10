import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getApprovals,
  getChangeByNumber,
  getLinkedTickets,
  getTasks,
} from "@/lib/changes/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import ChangeDetail from "@/components/changes/ChangeDetail";

export const metadata: Metadata = { title: "Change | ifBash" };

export default async function ChangeDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const profile = await requireProfile();
  const change = await getChangeByNumber(number);
  if (!change) notFound();

  const [approvals, tasks, links, profiles] = await Promise.all([
    getApprovals(change.id),
    getTasks(change.id),
    getLinkedTickets(change.id),
    listProfilesInTenant(),
  ]);

  const admin = createAdminClient();

  const ticketIds = links.map((l) => l.ticket_id);
  const linkedTicketsRes = ticketIds.length
    ? await admin
        .from("tickets")
        .select("id, number, title, priority, state")
        .in("id", ticketIds)
    : { data: [] as Array<{ id: string; number: string; title: string; priority: string; state: string }> };
  const linkedTickets = (linkedTicketsRes.data ?? []) as Array<{
    id: string;
    number: string;
    title: string;
    priority: string;
    state: string;
  }>;

  const auditRes = await admin
    .from("audit_log")
    .select("id, action, at, actor_id, before, after")
    .eq("entity_type", "change")
    .eq("entity_id", change.id)
    .order("at", { ascending: false })
    .limit(100);
  const audit = (auditRes.data ?? []) as Array<{
    id: string;
    action: string;
    at: string;
    actor_id: string | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  }>;

  return (
    <ChangeDetail
      change={change}
      approvals={approvals}
      tasks={tasks}
      links={links}
      linkedTickets={linkedTickets}
      audit={audit}
      profiles={profiles}
      myProfileId={profile.id}
      myRole={profile.role}
    />
  );
}
