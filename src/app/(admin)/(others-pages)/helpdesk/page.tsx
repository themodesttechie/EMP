import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import {
  listAllInTenant,
  listAllTicketCategories,
  listProfilesInTenant,
} from "@/lib/tickets/queries";
import HelpdeskQueue from "@/components/tickets/HelpdeskQueue";

export const metadata: Metadata = { title: "Helpdesk | ifBash" };

export default async function HelpdeskPage() {
  const profile = await requireProfile();
  const canSeeAll = ["agent", "admin", "owner", "manager"].includes(profile.role);

  const [tickets, categories, profiles] = await Promise.all([
    listAllInTenant(),
    listAllTicketCategories(),
    listProfilesInTenant(),
  ]);

  return (
    <HelpdeskQueue
      tickets={tickets}
      categories={categories}
      profiles={profiles}
      myProfileId={profile.id}
      myTenantId={profile.tenant_id}
      myRole={profile.role}
      canSeeAll={canSeeAll}
    />
  );
}
