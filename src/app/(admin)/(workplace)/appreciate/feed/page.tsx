import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { listPublicFeed, KUDOS_CATEGORIES } from "@/lib/workplace/kudos";
import KudosFeed from "@/components/workplace/KudosFeed";

export const metadata: Metadata = { title: "Kudos feed | ifBash" };

export default async function KudosFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; from?: string; to?: string }>;
}) {
  await requireProfile();
  const params = await searchParams;
  const items = await listPublicFeed({
    category: params.category,
    from_user_id: params.from,
    to_user_id: params.to,
  });

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Kudos feed</h1>
            <p className="text-sm text-slate-500">Public recognition across the tenant.</p>
          </div>
          <Link
            href="/appreciate"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl"
          >
            Give kudos
          </Link>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <KudosFeed
          items={items}
          categories={[...KUDOS_CATEGORIES]}
          activeCategory={params.category}
        />
      </main>
    </div>
  );
}
