import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { getOrgChart, type OrgNode } from "@/lib/workplace/directory";
import OrgChart from "@/components/workplace/OrgChart";

export const metadata: Metadata = { title: "Organizational chart | ifBash" };

export default async function OrgChartPage() {
  await requireProfile();
  const tree: OrgNode[] = await getOrgChart();

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Organizational chart</h1>
          <p className="text-sm text-slate-500">Reporting structure across the tenant.</p>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <OrgChart roots={tree} />
      </main>
    </div>
  );
}
