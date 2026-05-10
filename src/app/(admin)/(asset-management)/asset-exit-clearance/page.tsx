import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import ExitClearanceFlow from "@/components/assets/ExitClearanceFlow";

export const metadata: Metadata = { title: "Exit clearance | ifBash" };

export default async function ExitClearancePage() {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const profiles = await listProfilesInTenant();
  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Asset exit clearance</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">Bulk return all assets for an offboarding user and generate a clearance PDF</p>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <ExitClearanceFlow profiles={profiles} />
      </main>
    </div>
  );
}
