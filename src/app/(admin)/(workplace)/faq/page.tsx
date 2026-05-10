import type { Metadata } from "next";
import { listByCategory, listPublished } from "@/lib/kb/queries";
import FaqList from "@/components/kb/FaqList";

export const metadata: Metadata = { title: "FAQ | ifBash" };
export const dynamic = "force-dynamic";

export default async function FAQPage() {
  // Prefer the dedicated 'faq' category; fall back to most-recent published
  // articles so the page is never empty.
  const fromCategory = await listByCategory("faq", { limit: 20 });
  const articles =
    fromCategory.length > 0 ? fromCategory : await listPublished({ limit: 10 });

  return <FaqList articles={articles} />;
}
