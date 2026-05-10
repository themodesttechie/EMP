"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { bulkReturnFromUserFormAction } from "@/lib/assets/actions";
import type { Ci } from "@/lib/assets/types";
import { StatusBadge } from "./AssetBadges";

type Profile = { id: string; full_name: string | null; email: string; role: string };

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
      {pending ? "Returning…" : "Bulk return all"}
    </button>
  );
}

export default function ExitClearanceFlow({ profiles }: { profiles: Profile[] }) {
  const [userId, setUserId] = useState("");
  const [assets, setAssets] = useState<Ci[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  const profile = profiles.find((p) => p.id === userId);

  useEffect(() => {
    if (!userId) {
      setAssets([]);
      return;
    }
    setLoading(true);
    fetch(`/api/assets/by-user?user_id=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((j) => setAssets(j.assets ?? []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [userId]);

  async function generatePdf() {
    if (!profile) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;
    doc.setFontSize(18);
    doc.text("Asset clearance certificate", margin, y);
    y += 28;
    doc.setFontSize(10);
    doc.text(`User: ${profile.full_name || profile.email}`, margin, y);
    y += 14;
    doc.text(`Email: ${profile.email}`, margin, y);
    y += 14;
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, y);
    y += 24;

    doc.setFontSize(12);
    doc.text("Assets returned", margin, y);
    y += 16;
    doc.setFontSize(9);
    if (assets.length === 0) {
      doc.text("No assets to return.", margin, y);
      y += 14;
    } else {
      assets.forEach((a, i) => {
        doc.text(
          `${i + 1}. ${a.number}  ${a.name}  (tag: ${a.asset_tag || "—"}; serial: ${a.serial || "—"})`,
          margin,
          y,
        );
        y += 14;
        if (y > 760) {
          doc.addPage();
          y = margin;
        }
      });
    }

    y += 20;
    doc.setFontSize(10);
    doc.text("Signed (handover):  ____________________________", margin, y);
    y += 24;
    doc.text("Signed (IT):        ____________________________", margin, y);

    doc.save(`asset-clearance-${profile.email}.pdf`);
    setPdfReady(true);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Offboarding user</label>
        <select
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setPdfReady(false);
          }}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
        >
          <option value="">— Pick —</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
        </select>
      </div>

      {userId ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Open assignments</h3>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : assets.length === 0 ? (
            <p className="text-sm text-slate-500">No assets currently assigned.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Number</th>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Tag</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-mono text-xs text-brand-600">{a.number}</td>
                    <td className="px-3 py-2">{a.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{a.asset_tag || "—"}</td>
                    <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={generatePdf}
              disabled={!profile || assets.length === 0}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Download clearance PDF
            </button>
            <form action={bulkReturnFromUserFormAction}>
              <input type="hidden" name="user_id" value={userId} />
              <input type="hidden" name="notes" value="Exit clearance" />
              <ConfirmButton />
            </form>
          </div>
          {pdfReady ? <p className="text-xs text-emerald-600 mt-2">PDF generated.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
