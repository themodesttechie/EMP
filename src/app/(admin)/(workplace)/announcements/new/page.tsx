import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import NewAnnouncementForm from "@/components/workplace/NewAnnouncementForm";
import { listDistinctDepartments } from "@/lib/workplace/directory";

export const metadata: Metadata = { title: "New announcement | ifBash" };

export default async function NewAnnouncementPage() {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) {
    redirect("/announcements");
  }
  const departments = await listDistinctDepartments();
  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">New announcement</h1>
          <p className="text-sm text-slate-500">Publishes immediately to the chosen audience.</p>
        </div>
      </header>
      <main className="max-w-[900px] mx-auto px-6 py-8">
        <NewAnnouncementForm departments={departments} />
      </main>
    </div>
  );
}
