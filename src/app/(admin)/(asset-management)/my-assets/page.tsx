import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { listAssignedToMe, listMyAssets } from "@/lib/assets/queries";
import { ConditionBadge, StatusBadge } from "@/components/assets/AssetBadges";

export const metadata: Metadata = { title: "My assets | ifBash" };

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default async function MyAssetsPage() {
  const profile = await requireProfile();
  const [owned, openAssignments] = await Promise.all([
    listMyAssets(profile.id),
    listAssignedToMe(profile.id),
  ]);

  // Build a map of CI id -> latest open assignment for condition + checkout date
  const assignByCi = new Map<string, (typeof openAssignments)[number]>();
  for (const a of openAssignments) assignByCi.set(a.ci_id, a);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">My assets</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{owned.length} assets assigned to you</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/asset-issue" className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
            Report issue
          </Link>
          <Link href="/return-asset" className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Return asset
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 pb-24">
        {owned.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] p-10 text-center">
            <p className="text-sm text-slate-500">You have no assigned assets.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Number</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Asset tag</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Condition</th>
                  <th className="text-left px-4 py-3 font-medium">Last checkout</th>
                  <th className="text-left px-4 py-3 font-medium">Warranty</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {owned.map((ci) => {
                  const a = assignByCi.get(ci.id);
                  return (
                    <tr key={ci.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-mono text-xs text-brand-600">{ci.number}</td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{ci.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{ci.asset_tag || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={ci.status} /></td>
                      <td className="px-4 py-3">{a ? <ConditionBadge condition={a.condition} /> : <span className="text-xs text-slate-500">—</span>}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(a?.assigned_at ?? null)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(ci.warranty_until)}</td>
                      <td className="px-4 py-3 text-xs">
                        <Link href={`/asset-issue?ci=${ci.id}`} className="text-brand-600 hover:underline">
                          Issue
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
