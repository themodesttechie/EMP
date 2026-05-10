import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { listAssignedToMe } from "@/lib/assets/queries";
import ReturnAssetList from "@/components/assets/ReturnAssetList";

export const metadata: Metadata = { title: "Return asset | ifBash" };

export default async function ReturnAssetPage() {
  const profile = await requireProfile();
  const assigns = await listAssignedToMe(profile.id);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Return asset</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">{assigns.length} asset(s) currently assigned to you</p>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <ReturnAssetList assigns={assigns} />
      </main>
    </div>
  );
}
