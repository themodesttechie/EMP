import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  countByStatus,
  listAllInTenant,
  listRecentAssignments,
} from "@/lib/assets/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import { scanStaleCis } from "@/lib/ai/stale-ci";
import { CI_STATUSES } from "@/lib/assets/types";
import { StatusBadge, ConditionBadge } from "@/components/assets/AssetBadges";

export const metadata: Metadata = { title: "IT admin | ifBash" };

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export default async function ItAdminPage() {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }

  const [counts, allAssets, recent, profiles, stale] = await Promise.all([
    countByStatus(),
    listAllInTenant(),
    listRecentAssignments(10),
    listProfilesInTenant(),
    scanStaleCis({ tenant_id: profile.tenant_id }),
  ]);

  const profMap = new Map<string, (typeof profiles)[number]>(profiles.map((p) => [p.id, p]));
  const ciMap = new Map(allAssets.map((a) => [a.id, a]));

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">IT admin</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{allAssets.length} configuration items</p>
        </div>
        <div className="flex gap-2">
          <Link href="/asset-documentation" className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">All CIs</Link>
          <Link href="/exchange-asset" className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600">Exchange</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 pb-24 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">By status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CI_STATUSES.map((s) => (
              <div key={s} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{s.replace("_", " ")}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{counts[s] ?? 0}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Recent assignments</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">When</th>
                  <th className="text-left px-4 py-3 font-medium">CI</th>
                  <th className="text-left px-4 py-3 font-medium">User</th>
                  <th className="text-left px-4 py-3 font-medium">Condition</th>
                  <th className="text-left px-4 py-3 font-medium">Returned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recent.length === 0 ? (
                  <tr><td colSpan={5} className="text-center px-4 py-8 text-sm text-slate-500">No assignments yet.</td></tr>
                ) : recent.map((a) => {
                  const ci = ciMap.get(a.ci_id);
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(a.assigned_at)}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {ci ? (
                          <Link href={`/asset-documentation/${ci.id}`} className="text-brand-600 hover:underline">{ci.number}</Link>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {profMap.get(a.user_id)?.full_name || profMap.get(a.user_id)?.email || "—"}
                      </td>
                      <td className="px-4 py-3"><ConditionBadge condition={a.condition} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{a.returned_at ? fmtDate(a.returned_at) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Stale CIs ({stale.flagged.length})</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
            {stale.flagged.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500 text-center">No stale CIs.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Number</th>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Days idle</th>
                    <th className="text-left px-4 py-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stale.flagged.map((s) => {
                    const ci = ciMap.get(s.ci_id);
                    return (
                      <tr key={s.ci_id}>
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link href={`/asset-documentation/${s.ci_id}`} className="text-brand-600 hover:underline">{s.number}</Link>
                        </td>
                        <td className="px-4 py-3">{s.name}</td>
                        <td className="px-4 py-3">{ci ? <StatusBadge status={ci.status} /> : "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{s.days_since_update}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{s.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
