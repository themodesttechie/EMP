import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getDraftsForReview } from "@/lib/kb/queries";
import KbDraftsList from "@/components/kb/KbDraftsList";

export const metadata: Metadata = { title: "KB drafts | ifBash" };
export const dynamic = "force-dynamic";

export default async function KbDraftsPage() {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const drafts = await getDraftsForReview();
  const canPublish = ["admin", "owner"].includes(profile.role);
  return <KbDraftsList drafts={drafts} canPublish={canPublish} />;
}
