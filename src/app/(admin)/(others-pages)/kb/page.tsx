import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import {
  listCategories,
  listMostViewed,
  listPublished,
  searchPublishedByText,
} from "@/lib/kb/queries";
import KbBrowse from "@/components/kb/KbBrowse";

export const metadata: Metadata = { title: "Knowledge base | ifBash" };
export const dynamic = "force-dynamic";

export default async function KbPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile();
  const canAuthor = ["agent", "admin", "owner"].includes(profile.role);

  const q = (params.q ?? "").trim();
  const [categories, recent, mostViewed, searched] = await Promise.all([
    listCategories(),
    listPublished({ limit: 12 }),
    listMostViewed({ limit: 8 }),
    q ? searchPublishedByText(q, { limit: 30 }) : Promise.resolve([]),
  ]);

  return (
    <KbBrowse
      categories={categories}
      recent={recent}
      mostViewed={mostViewed}
      searchResults={searched}
      activeQuery={q}
      canAuthor={canAuthor}
    />
  );
}
