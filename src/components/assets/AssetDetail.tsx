"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addRelationshipFormAction,
  assignToUserFormAction,
  removeRelationshipFormAction,
  retireCiFormAction,
  returnFromUserFormAction,
  updateCiFormAction,
} from "@/lib/assets/actions";
import {
  CI_REL_TYPES,
  CI_STATUSES,
  type AssetAssignment,
  type AssetAuditEvent,
  type AssetCondition,
  type Ci,
  type CiClass,
  type CiRelationship,
} from "@/lib/assets/types";
import { ConditionBadge, StatusBadge } from "./AssetBadges";

type Profile = { id: string; full_name: string | null; email: string; role: string };

type Props = {
  ci: Ci;
  classes: CiClass[];
  profiles: Profile[];
  relationships: { outgoing: CiRelationship[]; incoming: CiRelationship[] };
  history: AssetAssignment[];
  auditEvents: AssetAuditEvent[];
  linkedTickets: Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string }>;
  allCis: Ci[];
  canManage: boolean;
};

type Tab = "details" | "relationships" | "assignments" | "tickets" | "audit";

function PendingButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50">
      {pending ? "Working…" : children}
    </button>
  );
}

export default function AssetDetail(props: Props) {
  const { ci, canManage } = props;
  const [tab, setTab] = useState<Tab>("details");
  const profMap = new Map<string, Profile>(props.profiles.map((p) => [p.id, p]));
  const ciMap = new Map<string, Ci>(props.allCis.map((c) => [c.id, c]));

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500">{ci.number}</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{ci.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={ci.status} />
            {ci.owner_user_id ? (
              <span className="text-xs text-slate-500">Owner: {profMap.get(ci.owner_user_id)?.full_name || profMap.get(ci.owner_user_id)?.email}</span>
            ) : (
              <span className="text-xs text-slate-500">Unassigned</span>
            )}
          </div>
        </div>
        <Link href="/asset-documentation" className="text-xs text-brand-600 hover:underline">← Back to list</Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 pb-24">
        <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-800">
          {(["details", "relationships", "assignments", "tickets", "audit"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 ${tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <DetailsTab ci={ci} classes={props.classes} canManage={canManage} profiles={props.profiles} />
        )}
        {tab === "relationships" && (
          <RelationshipsTab
            ci={ci}
            relationships={props.relationships}
            allCis={props.allCis}
            canManage={canManage}
            ciMap={ciMap}
          />
        )}
        {tab === "assignments" && (
          <AssignmentsTab history={props.history} profMap={profMap} />
        )}
        {tab === "tickets" && (
          <TicketsTab tickets={props.linkedTickets} />
        )}
        {tab === "audit" && (
          <AuditTab events={props.auditEvents} profMap={profMap} />
        )}
      </main>
    </div>
  );
}

function DetailsTab({ ci, classes, canManage, profiles }: { ci: Ci; classes: CiClass[]; canManage: boolean; profiles: Profile[] }) {
  if (!canManage) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 text-sm space-y-2">
        <Row label="Number" value={ci.number} />
        <Row label="Name" value={ci.name} />
        <Row label="Status" value={ci.status} />
        <Row label="Asset tag" value={ci.asset_tag || "—"} />
        <Row label="Serial" value={ci.serial || "—"} />
        <Row label="Location" value={ci.location || "—"} />
        <Row label="Warranty until" value={ci.warranty_until || "—"} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form action={updateCiFormAction} className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 space-y-3">
        <input type="hidden" name="id" value={ci.id} />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Edit details</h3>
        <Field name="name" label="Name" defaultValue={ci.name} required />
        <div className="grid grid-cols-2 gap-3">
          <SelectField name="class_id" label="Class" defaultValue={ci.class_id ?? ""}>
            <option value="">—</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <SelectField name="status" label="Status" defaultValue={ci.status}>
            {CI_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </SelectField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="asset_tag" label="Asset tag" defaultValue={ci.asset_tag ?? ""} />
          <Field name="serial" label="Serial" defaultValue={ci.serial ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="location" label="Location" defaultValue={ci.location ?? ""} />
          <Field name="cost_centre" label="Cost centre" defaultValue={ci.cost_centre ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field name="purchased_at" label="Purchased" type="date" defaultValue={ci.purchased_at ?? ""} />
          <Field name="warranty_until" label="Warranty until" type="date" defaultValue={ci.warranty_until ?? ""} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
          <textarea name="notes" defaultValue={ci.notes ?? ""} rows={3} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end pt-2">
          <PendingButton>Save</PendingButton>
        </div>
      </form>

      <div className="space-y-3">
        <form action={assignToUserFormAction} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-2">
          <input type="hidden" name="ci_id" value={ci.id} />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Assign to user</h4>
          <SelectField name="user_id" label="User" defaultValue="" required>
            <option value="">— Pick —</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
          </SelectField>
          <SelectField name="condition" label="Condition" defaultValue="good">
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="damaged">Damaged</option>
          </SelectField>
          <Field name="checkout_notes" label="Notes" defaultValue="" />
          <div className="flex justify-end pt-1"><PendingButton>Assign</PendingButton></div>
        </form>

        {ci.owner_user_id ? (
          <form action={returnFromUserFormAction} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-2">
            <input type="hidden" name="ci_id" value={ci.id} />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Return from user</h4>
            <SelectField name="return_condition" label="Return condition" defaultValue="good">
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </SelectField>
            <Field name="return_notes" label="Notes" defaultValue="" />
            <div className="flex justify-end pt-1"><PendingButton>Return</PendingButton></div>
          </form>
        ) : null}

        <form action={retireCiFormAction} className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-500/5 p-4">
          <input type="hidden" name="id" value={ci.id} />
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Retire CI</h4>
          <p className="text-xs text-red-600 dark:text-red-300 mb-2">Marks the CI as retired and clears ownership. Reversible by editing.</p>
          <button type="submit" className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Retire</button>
        </form>
      </div>
    </div>
  );
}

function RelationshipsTab({
  ci,
  relationships,
  allCis,
  canManage,
  ciMap,
}: {
  ci: Ci;
  relationships: { outgoing: CiRelationship[]; incoming: CiRelationship[] };
  allCis: Ci[];
  canManage: boolean;
  ciMap: Map<string, Ci>;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Outgoing</h3>
        {relationships.outgoing.length === 0 ? (
          <p className="text-sm text-slate-500">No outgoing relationships.</p>
        ) : (
          <ul className="space-y-2">
            {relationships.outgoing.map((r) => {
              const target = ciMap.get(r.to_ci);
              return (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-mono text-xs text-slate-500">{r.type.replace("_", " ")}</span>{" "}
                    →{" "}
                    <Link href={`/asset-documentation/${r.to_ci}`} className="text-brand-600 hover:underline">
                      {target?.number} {target?.name}
                    </Link>
                  </span>
                  {canManage ? (
                    <form action={removeRelationshipFormAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="ci_id" value={ci.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">Remove</button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Incoming</h3>
        {relationships.incoming.length === 0 ? (
          <p className="text-sm text-slate-500">No incoming relationships.</p>
        ) : (
          <ul className="space-y-2">
            {relationships.incoming.map((r) => {
              const source = ciMap.get(r.from_ci);
              return (
                <li key={r.id} className="text-sm">
                  <Link href={`/asset-documentation/${r.from_ci}`} className="text-brand-600 hover:underline">
                    {source?.number} {source?.name}
                  </Link>{" "}
                  <span className="font-mono text-xs text-slate-500">{r.type.replace("_", " ")}</span>{" "}
                  → here
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {canManage ? (
        <form action={addRelationshipFormAction} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="hidden" name="from_ci" value={ci.id} />
          <SelectField name="type" label="Type" defaultValue="depends_on" required>
            {CI_REL_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </SelectField>
          <SelectField name="to_ci" label="Target CI" defaultValue="" required>
            <option value="">— Pick —</option>
            {allCis.filter((c) => c.id !== ci.id).map((c) => (
              <option key={c.id} value={c.id}>{c.number} — {c.name}</option>
            ))}
          </SelectField>
          <div className="flex items-end justify-end">
            <PendingButton>Add relationship</PendingButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function AssignmentsTab({ history, profMap }: { history: AssetAssignment[]; profMap: Map<string, Profile> }) {
  if (history.length === 0) return <p className="text-sm text-slate-500">No assignment history.</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
          <tr>
            <th className="text-left px-4 py-3 font-medium">User</th>
            <th className="text-left px-4 py-3 font-medium">Assigned</th>
            <th className="text-left px-4 py-3 font-medium">Condition</th>
            <th className="text-left px-4 py-3 font-medium">Returned</th>
            <th className="text-left px-4 py-3 font-medium">Return condition</th>
            <th className="text-left px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {history.map((h) => (
            <tr key={h.id}>
              <td className="px-4 py-3">{profMap.get(h.user_id)?.full_name || profMap.get(h.user_id)?.email || "—"}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{new Date(h.assigned_at).toLocaleString()}</td>
              <td className="px-4 py-3"><ConditionBadge condition={h.condition as AssetCondition} /></td>
              <td className="px-4 py-3 text-xs text-slate-500">{h.returned_at ? new Date(h.returned_at).toLocaleString() : "—"}</td>
              <td className="px-4 py-3">{h.return_condition ? <ConditionBadge condition={h.return_condition} /> : <span className="text-xs text-slate-500">—</span>}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{h.return_notes || h.checkout_notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TicketsTab({ tickets }: { tickets: Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string }> }) {
  if (tickets.length === 0) return <p className="text-sm text-slate-500">No linked tickets.</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Number</th>
            <th className="text-left px-4 py-3 font-medium">Title</th>
            <th className="text-left px-4 py-3 font-medium">State</th>
            <th className="text-left px-4 py-3 font-medium">Priority</th>
            <th className="text-left px-4 py-3 font-medium">Opened</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 font-mono text-xs text-brand-600">
                <Link href={`/helpdesk/${t.number}`} className="hover:underline">{t.number}</Link>
              </td>
              <td className="px-4 py-3">{t.title}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{t.state.replace("_", " ")}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{t.priority}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditTab({ events, profMap }: { events: AssetAuditEvent[]; profMap: Map<string, Profile> }) {
  if (events.length === 0) return <p className="text-sm text-slate-500">No audit events.</p>;
  return (
    <ul className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] divide-y divide-slate-100 dark:divide-slate-800">
      {events.map((e) => (
        <li key={e.id} className="px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500">{e.event}</span>
            <span className="text-xs text-slate-500">{new Date(e.at).toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            By {e.by_user ? profMap.get(e.by_user)?.full_name || profMap.get(e.by_user)?.email || "system" : "system"}
          </p>
          {e.payload ? (
            <pre className="mt-2 text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(e.payload, null, 2)}</pre>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Field({ name, label, defaultValue, type, required }: { name: string; label: string; defaultValue: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}{required ? " *" : ""}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        type={type ?? "text"}
        required={required}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  required,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}{required ? " *" : ""}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      >
        {children}
      </select>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
