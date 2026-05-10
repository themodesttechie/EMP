import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { listAllInTenant, listCiClasses } from "@/lib/assets/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import AssetDocList from "@/components/assets/AssetDocList";

export const metadata: Metadata = { title: "Asset documentation | ifBash" };

export default async function AssetDocumentationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; class_id?: string; q?: string }>;
}) {
  const profile = await requireProfile();
  const canManage = ["agent", "manager", "admin", "owner"].includes(profile.role);
  const sp = await searchParams;
  const [assets, classes, profiles] = await Promise.all([
    listAllInTenant({ status: sp.status, class_id: sp.class_id, q: sp.q }),
    listCiClasses(),
    listProfilesInTenant(),
  ]);

  return (
    <AssetDocList
      assets={assets}
      classes={classes}
      profiles={profiles}
      canManage={canManage}
      filters={{ status: sp.status ?? "", class_id: sp.class_id ?? "", q: sp.q ?? "" }}
    />
  );
}
