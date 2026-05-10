import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { listAllChanges } from "@/lib/changes/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import ChangesList from "@/components/changes/ChangesList";

export const metadata: Metadata = { title: "Change management | ifBash" };

export default async function ChangesPage() {
  const profile = await requireProfile();
  const [changes, profiles] = await Promise.all([
    listAllChanges(),
    listProfilesInTenant(),
  ]);

  return (
    <ChangesList
      changes={changes}
      profiles={profiles}
      myProfileId={profile.id}
      myTenantId={profile.tenant_id}
      myRole={profile.role}
    />
  );
}
