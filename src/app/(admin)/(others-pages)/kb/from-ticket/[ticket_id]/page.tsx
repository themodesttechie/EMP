import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getTicketById } from "@/lib/tickets/queries";
import { listCategories } from "@/lib/kb/queries";
import KbFromTicket from "@/components/kb/KbFromTicket";

export const metadata: Metadata = { title: "Draft from ticket | ifBash" };
export const dynamic = "force-dynamic";

export default async function KbFromTicketPage({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const { ticket_id } = await params;
  const ticket = await getTicketById(ticket_id);
  if (!ticket) notFound();

  const categories = await listCategories();
  return (
    <KbFromTicket
      ticketId={ticket_id}
      ticketTitle={ticket.title}
      ticketNumber={ticket.number}
      categories={categories}
    />
  );
}
