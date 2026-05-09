import Link from "next/link";
import { listMyRequests } from "@/lib/catalog/queries";
import { requireProfile } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Requests | ifBash" };

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400",
  fulfilled: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

export default async function MyRequestsPage() {
  const profile = await requireProfile();
  const requests = await listMyRequests();
  const mine = requests.filter((r) => r.requester_id === profile.id);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">My Requests</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{mine.length} total</p>
        </div>
        <Link
          href="/request-asset"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          New request
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 pb-24">
        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-sm text-slate-500">
            No requests yet.{" "}
            <Link href="/request-asset" className="text-brand-500 hover:underline">
              Browse the catalog.
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Code</th>
                  <th className="text-left px-4 py-3 font-medium">Item</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Stage</th>
                  <th className="text-left px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mine.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/my-requests/${r.code}`}
                        className="font-mono text-xs text-brand-600 hover:underline"
                      >
                        {r.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">
                      {r.item_name_snapshot}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.category_name_snapshot}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          STATUS_STYLES[r.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.total_stages > 0
                        ? `${Math.min(r.current_stage + 1, r.total_stages)} / ${r.total_stages}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
