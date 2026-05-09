"use client";

import { useActionState, useMemo, useState } from "react";
import { createChangeAction, type ActionResult } from "@/lib/changes/actions";
import { CHANGE_TYPES, type ChangeType } from "@/lib/changes/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };
type TicketLite = { id: string; number: string; title: string; priority: string; state: string };
type CiLite = { id: string; name: string };
type TemplateLite = { slug: string; name: string; description: string | null };

type Props = {
  profiles: Profile[];
  tickets: TicketLite[];
  cis: CiLite[];
  templates: TemplateLite[];
};

export default function NewChangeWizard(props: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChangeType>("normal");
  const [linkedTickets, setLinkedTickets] = useState<string[]>([]);
  const [affectedCis, setAffectedCis] = useState<string[]>([]);
  const [implementer, setImplementer] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [rollback, setRollback] = useState("");

  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    createChangeAction,
    undefined,
  );

  const ticketLookup = useMemo(() => {
    const m = new Map<string, TicketLite>();
    for (const t of props.tickets) m.set(t.id, t);
    return m;
  }, [props.tickets]);
  const ciLookup = useMemo(() => {
    const m = new Map<string, CiLite>();
    for (const c of props.cis) m.set(c.id, c);
    return m;
  }, [props.cis]);

  const canStep2 = title.trim().length > 0;
  const canStep3 = canStep2;
  const canStep4 = canStep3 && !!plannedStart && !!plannedEnd && !!rollback.trim();

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b]">
      <header className="sticky top-0 z-20 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">New change</h1>
          <p className="text-xs text-slate-500">
            Step {step} of 4 — {step === 1 ? "describe" : step === 2 ? "AI review" : step === 3 ? "plan" : "submit"}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 pb-24">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 space-y-4">
          {step === 1 && (
            <Step1
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              type={type}
              setType={setType}
              linkedTickets={linkedTickets}
              setLinkedTickets={setLinkedTickets}
              affectedCis={affectedCis}
              setAffectedCis={setAffectedCis}
              tickets={props.tickets}
              cis={props.cis}
            />
          )}

          {step === 2 && (
            <Step2
              title={title}
              description={description}
              type={type}
              linkedTickets={linkedTickets.map((id) => ticketLookup.get(id)).filter(Boolean) as TicketLite[]}
              affectedCis={affectedCis.map((id) => ciLookup.get(id)).filter(Boolean) as CiLite[]}
              templates={props.templates}
            />
          )}

          {step === 3 && (
            <Step3
              implementer={implementer}
              setImplementer={setImplementer}
              plannedStart={plannedStart}
              setPlannedStart={setPlannedStart}
              plannedEnd={plannedEnd}
              setPlannedEnd={setPlannedEnd}
              rollback={rollback}
              setRollback={setRollback}
              profiles={props.profiles}
            />
          )}

          {step === 4 && (
            <Step4
              title={title}
              description={description}
              type={type}
              linkedTickets={linkedTickets.map((id) => ticketLookup.get(id)).filter(Boolean) as TicketLite[]}
              affectedCis={affectedCis.map((id) => ciLookup.get(id)).filter(Boolean) as CiLite[]}
              implementer={props.profiles.find((p) => p.id === implementer) ?? null}
              plannedStart={plannedStart}
              plannedEnd={plannedEnd}
              rollback={rollback}
            />
          )}

          {state?.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
              disabled={step === 1 || pending}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                disabled={
                  (step === 1 && !canStep2) ||
                  (step === 2 && !canStep3) ||
                  (step === 3 && !canStep4)
                }
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <form action={formAction}>
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="description" value={description} />
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="linked_ticket_ids" value={linkedTickets.join(",")} />
                <input type="hidden" name="affected_ci_ids" value={affectedCis.join(",")} />
                <input type="hidden" name="implementer_id" value={implementer} />
                <input type="hidden" name="planned_start" value={plannedStart} />
                <input type="hidden" name="planned_end" value={plannedEnd} />
                <input type="hidden" name="rollback_plan" value={rollback} />
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {pending ? "Submitting..." : "Submit for review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Step1(props: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  type: ChangeType;
  setType: (v: ChangeType) => void;
  linkedTickets: string[];
  setLinkedTickets: (v: string[]) => void;
  affectedCis: string[];
  setAffectedCis: (v: string[]) => void;
  tickets: TicketLite[];
  cis: CiLite[];
}) {
  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <input
          value={props.title}
          onChange={(e) => props.setTitle(e.target.value)}
          maxLength={200}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          placeholder="Short summary of the change"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={props.description}
          onChange={(e) => props.setDescription(e.target.value)}
          rows={5}
          maxLength={8000}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          placeholder="What is changing, why, and how"
        />
      </Field>
      <Field label="Type">
        <div className="flex gap-2">
          {CHANGE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => props.setType(t)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                props.type === t
                  ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Linked tickets">
        <MultiSelect
          options={props.tickets.map((t) => ({
            value: t.id,
            label: `${t.number} · ${t.title}`,
          }))}
          values={props.linkedTickets}
          onChange={props.setLinkedTickets}
          empty="No open tickets in this tenant."
        />
      </Field>
      <Field label="Affected configuration items">
        <MultiSelect
          options={props.cis.map((c) => ({ value: c.id, label: c.name }))}
          values={props.affectedCis}
          onChange={props.setAffectedCis}
          empty="No CIs available yet (CMDB lands in a parallel sprint)."
        />
      </Field>
    </div>
  );
}

function Step2(props: {
  title: string;
  description: string;
  type: ChangeType;
  linkedTickets: TicketLite[];
  affectedCis: CiLite[];
  templates: TemplateLite[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        AI risk score and standard-template detection run when you submit. Preview your inputs below.
      </p>
      <SummaryRow label="Title" value={props.title} />
      <SummaryRow label="Type" value={props.type} />
      <SummaryRow
        label="Linked tickets"
        value={
          props.linkedTickets.length === 0
            ? "(none)"
            : props.linkedTickets.map((t) => `${t.number}`).join(", ")
        }
      />
      <SummaryRow
        label="Affected CIs"
        value={
          props.affectedCis.length === 0
            ? "(none)"
            : props.affectedCis.map((c) => c.name).join(", ")
        }
      />
      <div className="rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-3 text-xs text-slate-700 dark:text-slate-200">
        Standard templates available: {props.templates.map((t) => t.name).join(", ") || "(none)"}
      </div>
    </div>
  );
}

function Step3(props: {
  implementer: string;
  setImplementer: (v: string) => void;
  plannedStart: string;
  setPlannedStart: (v: string) => void;
  plannedEnd: string;
  setPlannedEnd: (v: string) => void;
  rollback: string;
  setRollback: (v: string) => void;
  profiles: Profile[];
}) {
  const candidates = props.profiles.filter((p) =>
    ["agent", "manager", "admin", "owner"].includes(p.role),
  );
  return (
    <div className="space-y-4">
      <Field label="Implementer">
        <select
          value={props.implementer}
          onChange={(e) => props.setImplementer(e.target.value)}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
        >
          <option value="">(unassigned)</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || p.email}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Planned start" required>
          <input
            type="datetime-local"
            value={props.plannedStart}
            onChange={(e) => props.setPlannedStart(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Planned end" required>
          <input
            type="datetime-local"
            value={props.plannedEnd}
            onChange={(e) => props.setPlannedEnd(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Rollback plan" required>
        <textarea
          value={props.rollback}
          onChange={(e) => props.setRollback(e.target.value)}
          rows={4}
          maxLength={4000}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          placeholder="If something goes wrong, the steps to restore the previous state"
        />
      </Field>
    </div>
  );
}

function Step4(props: {
  title: string;
  description: string;
  type: ChangeType;
  linkedTickets: TicketLite[];
  affectedCis: CiLite[];
  implementer: Profile | null;
  plannedStart: string;
  plannedEnd: string;
  rollback: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      <SummaryRow label="Title" value={props.title} />
      <SummaryRow label="Type" value={props.type} />
      <SummaryRow label="Description" value={props.description || "(none)"} />
      <SummaryRow
        label="Linked tickets"
        value={
          props.linkedTickets.length === 0
            ? "(none)"
            : props.linkedTickets.map((t) => t.number).join(", ")
        }
      />
      <SummaryRow
        label="Affected CIs"
        value={
          props.affectedCis.length === 0
            ? "(none)"
            : props.affectedCis.map((c) => c.name).join(", ")
        }
      />
      <SummaryRow
        label="Implementer"
        value={props.implementer ? props.implementer.full_name || props.implementer.email : "(unassigned)"}
      />
      <SummaryRow label="Planned start" value={props.plannedStart} />
      <SummaryRow label="Planned end" value={props.plannedEnd} />
      <SummaryRow label="Rollback plan" value={props.rollback} />
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-40 shrink-0 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
        {value}
      </span>
    </div>
  );
}

function MultiSelect(props: {
  options: { value: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  empty: string;
}) {
  const toggle = (v: string) => {
    if (props.values.includes(v)) {
      props.onChange(props.values.filter((x) => x !== v));
    } else {
      props.onChange([...props.values, v]);
    }
  };
  if (props.options.length === 0) {
    return <p className="text-xs text-slate-500">{props.empty}</p>;
  }
  return (
    <div className="max-h-44 overflow-auto rounded-md border border-slate-300 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
      {props.options.map((o) => (
        <label
          key={o.value}
          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40"
        >
          <input
            type="checkbox"
            checked={props.values.includes(o.value)}
            onChange={() => toggle(o.value)}
            className="h-3.5 w-3.5"
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">{o.label}</span>
        </label>
      ))}
    </div>
  );
}
