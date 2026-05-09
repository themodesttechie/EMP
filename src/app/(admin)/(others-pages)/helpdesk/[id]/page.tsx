import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import {
  getTicketByNumber,
  getTicketComments,
  getTicketAttachments,
  getTicketHistory,
  listAllTicketCategories,
  listProfilesInTenant,
} from "@/lib/tickets/queries";
import TicketDetail from "@/components/tickets/TicketDetail";

export const metadata: Metadata = { title: "Ticket | ifBash" };

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const ticket = await getTicketByNumber(id);
  if (!ticket) notFound();

  const [comments, attachments, history, categories, profiles] = await Promise.all([
    getTicketComments(ticket.id),
    getTicketAttachments(ticket.id),
    getTicketHistory(ticket.id),
    listAllTicketCategories(),
    listProfilesInTenant(),
  ]);

  return (
    <TicketDetail
      ticket={ticket}
      comments={comments}
      attachments={attachments}
      history={history}
      categories={categories}
      profiles={profiles}
      myProfileId={profile.id}
      myRole={profile.role}
    />
  );
}
