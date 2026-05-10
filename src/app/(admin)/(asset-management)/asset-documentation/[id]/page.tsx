import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  getAssetById,
  getAssetAudit,
  getAssignmentHistory,
  getLinkedTickets,
  getRelationships,
  listCiClasses,
  listAllInTenant,
} from "@/lib/assets/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import AssetDetail from "@/components/assets/AssetDetail";

export const metadata: Metadata = { title: "Asset detail | ifBash" };

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const ci = await getAssetById(id);
  if (!ci) notFound();
  const canManage = ["agent", "manager", "admin", "owner"].includes(profile.role);
  // Employees only see their own
  if (!canManage && ci.owner_user_id !== profile.id) notFound();

  const [classes, profiles, rels, history, audit, tickets, allCis] = await Promise.all([
    listCiClasses(),
    listProfilesInTenant(),
    getRelationships(ci.id),
    getAssignmentHistory(ci.id),
    getAssetAudit(ci.id),
    getLinkedTickets(ci.id),
    canManage ? listAllInTenant() : Promise.resolve([]),
  ]);

  return (
    <AssetDetail
      ci={ci}
      classes={classes}
      profiles={profiles}
      relationships={rels}
      history={history}
      auditEvents={audit}
      linkedTickets={tickets}
      allCis={allCis}
      canManage={canManage}
    />
  );
}
