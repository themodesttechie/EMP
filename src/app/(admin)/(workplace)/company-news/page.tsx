import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { listForUser } from "@/lib/workplace/announcements";
import AnnouncementsList from "@/components/workplace/AnnouncementsList";

export const metadata: Metadata = { title: "Company news | ifBash" };

export default async function CompanyNewsPage() {
  const profile = await requireProfile();
  const items = await listForUser(profile, { category: "company" });
  const canCreate = ["admin", "owner"].includes(profile.role);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Company news</h1>
            <p className="text-sm text-slate-500">Tenant-wide updates and milestones.</p>
          </div>
          {canCreate && (
            <Link
              href="/announcements/new"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl"
            >
              New post
            </Link>
          )}
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <AnnouncementsList items={items} categories={["company"]} canDismiss={canCreate} />
      </main>
    </div>
  );
}
