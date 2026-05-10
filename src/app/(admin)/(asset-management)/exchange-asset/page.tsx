import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { listAllInTenant } from "@/lib/assets/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import ExchangeAssetForm from "@/components/assets/ExchangeAssetForm";

export const metadata: Metadata = { title: "Exchange asset | ifBash" };

export default async function ExchangeAssetPage() {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const [assets, profiles] = await Promise.all([
    listAllInTenant(),
    listProfilesInTenant(),
  ]);
  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Exchange asset</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">Atomically return one asset and issue another to the same user</p>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <ExchangeAssetForm assets={assets} profiles={profiles} />
      </main>
    </div>
  );
}
