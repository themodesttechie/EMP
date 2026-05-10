"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CI_STATUSES, type Ci, type CiClass } from "@/lib/assets/types";
import { StatusBadge } from "./AssetBadges";
import NewCiModal from "./NewCiModal";

type Profile = { id: string; full_name: string | null; email: string; role: string };

type Props = {
  assets: Ci[];
  classes: CiClass[];
  profiles: Profile[];
  canManage: boolean;
  filters: { status: string; class_id: string; q: string };
};

export default function AssetDocList({ assets, classes, profiles, canManage, filters }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(filters.status);
  const [classId, setClassId] = useState(filters.class_id);
  const [q, setQ] = useState(filters.q);

  const profMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]));
  const classMap = new Map<string, CiClass>(classes.map((c) => [c.id, c]));

  function applyFilters() {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (classId) sp.set("class_id", classId);
    if (q) sp.set("q", q);
    router.push(`/asset-documentation?${sp.toString()}`);
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Asset documentation</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{assets.length} configuration items</p>
        </div>
        {canManage ? (
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            New CI
          </button>
        ) : null}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <div className="bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Search name, tag, serial, number"
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {CI_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100"
          >
            Apply
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Class</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Tag</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-10 text-sm text-slate-500">No CIs match.</td>
                </tr>
              ) : (
                assets.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer" onClick={() => router.push(`/asset-documentation/${c.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs text-brand-600">
                      <Link href={`/asset-documentation/${c.id}`} className="hover:underline">{c.number}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{c.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {c.class_id ? classMap.get(c.class_id)?.name ?? "—" : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {c.owner_user_id
                        ? profMap.get(c.owner_user_id)?.full_name ||
                          profMap.get(c.owner_user_id)?.email ||
                          "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.asset_tag || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.location || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {canManage ? <NewCiModal open={open} onClose={() => setOpen(false)} classes={classes} /> : null}
    </div>
  );
}
