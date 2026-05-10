import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { listCabQueue } from "@/lib/changes/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import CabQueue from "@/components/changes/CabQueue";
import type { ChangeApproval } from "@/lib/changes/types";

export const metadata: Metadata = { title: "CAB queue | ifBash" };

export default async function CabPage() {
  const profile = await requireProfile();
  const admin = createAdminClient();

  const [changes, profiles] = await Promise.all([
    listCabQueue(),
    listProfilesInTenant(),
  ]);

  const ids = changes.map((c) => c.id);
  const allApprovalsRes = ids.length
    ? await admin
        .from("change_approvals")
        .select("id, tenant_id, change_id, approver_id, role, state, decided_at, comment, created_at")
        .in("change_id", ids)
    : { data: [] as ChangeApproval[] };
  const allApprovals = (allApprovalsRes.data ?? []) as ChangeApproval[];

  const myApprovalsRes = await admin
    .from("change_approvals")
    .select("id, tenant_id, change_id, approver_id, role, state, decided_at, comment, created_at")
    .eq("tenant_id", profile.tenant_id)
    .eq("approver_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const myApprovals = (myApprovalsRes.data ?? []) as ChangeApproval[];

  return (
    <CabQueue
      changes={changes}
      myApprovals={myApprovals}
      allApprovals={allApprovals}
      profiles={profiles}
      myProfileId={profile.id}
      myTenantId={profile.tenant_id}
    />
  );
}
