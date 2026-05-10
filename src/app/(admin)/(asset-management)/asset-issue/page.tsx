import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { listMyAssets } from "@/lib/assets/queries";
import { listAllTicketCategories } from "@/lib/tickets/queries";
import AssetIssueForm from "@/components/assets/AssetIssueForm";

export const metadata: Metadata = { title: "Report asset issue | ifBash" };

export default async function AssetIssuePage({
  searchParams,
}: {
  searchParams: Promise<{ ci?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const [assets, categories] = await Promise.all([
    listMyAssets(profile.id),
    listAllTicketCategories(),
  ]);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Report an asset issue</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">Open a helpdesk ticket linked to a specific asset</p>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <AssetIssueForm assets={assets} categories={categories} preselectedCiId={sp.ci ?? null} />
      </main>
    </div>
  );
}
