"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addTaskAction,
  cancelChangeAction,
  completeChangeAction,
  recordApprovalDecisionAction,
  rollbackChangeAction,
  scheduleChangeAction,
  startChangeAction,
  submitForReviewAction,
  updateTaskStateAction,
  type ActionResult,
} from "@/lib/changes/actions";
import { useRealtime } from "@/hooks/useRealtime";
import {
  ApprovalStateBadge,
  ChangeStateBadge,
  ChangeTypeBadge,
  TaskStateBadge,
} from "./ChangeBadges";
import RiskScore from "./RiskScore";
import type {
  Change,
  ChangeApproval,
  ChangeTask,
  ChangeTaskState,
  ChangeTicketLink,
} from "@/lib/changes/types";
import { CHANGE_TASK_STATES } from "@/lib/changes/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };
type TicketLite = { id: string; number: string; title: string; priority: string; state: string };
type AuditEntry = {
  id: string;
  action: string;
  at: string;
  actor_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

type Props = {
  change: Change;
  approvals: ChangeApproval[];
  tasks: ChangeTask[];
  links: ChangeTicketLink[];
  linkedTickets: TicketLite[];
  audit: AuditEntry[];
  profiles: Profile[];
  myProfileId: string;
  myRole: string;
};

const TAB_KEYS = ["plan", "tasks", "approvals", "tickets", "audit"] as const;
type Tab = (typeof TAB_KEYS)[number];

export default function ChangeDetail(props: Props) {
  const router = useRouter();
  const { change } = props;
  const [tab, setTab] = useState<Tab>("plan");
  const isStaff = ["agent", "manager", "admin", "owner"].includes(props.myRole);

  useRealtime({
    table: "changes",
    filter: `id=eq.${change.id}`,
    onChange: () => router.refresh(),
  });
  useRealtime({
    table: "change_approvals",
    filter: `change_id=eq.${change.id}`,
    onChange: () => router.refresh(),
  });
  useRealtime({
    table: "change_tasks",
    filter: `change_id=eq.${change.id}`,
    onChange: () => router.refresh(),
  });

  const profileById = (id: string | null) => {
    if (!id) return null;
    return props.profiles.find((p) => p.id === id) ?? null;
  };

  const requester = profileById(change.requester_id);
  const implementer = profileById(change.implementer_id);
  const ai = change.ai_classification;

  const myApproval = props.approvals.find(
    (a) => a.approver_id === props.myProfileId && a.state === "pending",
  );

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b]">
      <header className="sticky top-0 z-20 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-sm text-brand-600">{change.number}</span>
              <ChangeStateBadge state={change.state} />
              <ChangeTypeBadge type={change.type} />
              <RiskScore score={change.risk_score} compact />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-1 truncate">
              {change.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {change.planned_start
                ? `Planned ${new Date(change.planned_start).toLocaleString()}`
                : "Not yet scheduled"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
        <section className="lg:col-span-2 space-y-4">
          {change.description ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
              <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Description</h2>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {change.description}
              </p>
            </div>
          ) : null}

          {ai && ai.risk_score != null ? (
            <RiskScore
              score={ai.risk_score}
              reasoning={ai.risk_reasoning}
              factors={ai.risk_factors}
            />
          ) : null}

          {ai?.template_match && ai.template_match.auto_approve_recommended ? (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Standard change detected
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                Matches template{" "}
                <strong>{ai.template_match.slug}</strong> at{" "}
                {(ai.template_match.confidence * 100).toFixed(0)}% confidence. CAB review may be skipped per template policy.
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 overflow-x-auto">
              {TAB_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap ${
                    tab === k
                      ? "text-brand-600 border-b-2 border-brand-500"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="p-4 space-y-4">
              {tab === "plan" && (
                <PlanTab
                  change={change}
                  requester={requester}
                  implementer={implementer}
                />
              )}
              {tab === "tasks" && (
                <TasksTab
                  changeId={change.id}
                  tasks={props.tasks}
                  profiles={props.profiles}
                  isStaff={isStaff}
                  myProfileId={props.myProfileId}
                />
              )}
              {tab === "approvals" && (
                <ApprovalsTab
                  approvals={props.approvals}
                  profileById={profileById}
                  myApproval={myApproval ?? null}
                />
              )}
              {tab === "tickets" && (
                <TicketsTab links={props.links} tickets={props.linkedTickets} />
              )}
              {tab === "audit" && <AuditTab entries={props.audit} profileById={profileById} />}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <ActionPanel
            change={change}
            isStaff={isStaff}
            isRequester={change.requester_id === props.myProfileId}
          />
        </aside>
      </main>
    </div>
  );
}

function PlanTab({
  change,
  requester,
  implementer,
}: {
  change: Change;
  requester: Profile | null;
  implementer: Profile | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <Field label="Requester">{requester?.full_name || requester?.email || "-"}</Field>
      <Field label="Implementer">{implementer?.full_name || implementer?.email || "Unassigned"}</Field>
      <Field label="Planned start">
        {change.planned_start ? new Date(change.planned_start).toLocaleString() : "-"}
      </Field>
      <Field label="Planned end">
        {change.planned_end ? new Date(change.planned_end).toLocaleString() : "-"}
      </Field>
      <Field label="Actual start">
        {change.actual_start ? new Date(change.actual_start).toLocaleString() : "-"}
      </Field>
      <Field label="Actual end">
        {change.actual_end ? new Date(change.actual_end).toLocaleString() : "-"}
      </Field>
      <Field label="Affected CIs">{change.affected_ci_ids.length}</Field>
      <Field label="Created">{new Date(change.created_at).toLocaleString()}</Field>
      <div className="sm:col-span-2">
        <Field label="Rollback plan">
          <span className="whitespace-pre-wrap">{change.rollback_plan || "(not provided)"}</span>
        </Field>
      </div>
    </div>
  );
}

function TasksTab({
  changeId,
  tasks,
  profiles,
  isStaff,
  myProfileId,
}: {
  changeId: string;
  tasks: ChangeTask[];
  profiles: Profile[];
  isStaff: boolean;
  myProfileId: string;
}) {
  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500">No tasks yet.</p>
      ) : (
        <ol className="space-y-2">
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              profiles={profiles}
              canAct={isStaff || t.owner_id === myProfileId}
            />
          ))}
        </ol>
      )}
      {isStaff ? <AddTaskForm changeId={changeId} profiles={profiles} /> : null}
    </div>
  );
}

function TaskRow({
  task,
  profiles,
  canAct,
}: {
  task: ChangeTask;
  profiles: Profile[];
  canAct: boolean;
}) {
  const owner = profiles.find((p) => p.id === task.owner_id);
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    updateTaskStateAction,
    undefined,
  );
  return (
    <li className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f10] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            <span className="font-mono text-xs text-slate-500 mr-2">#{task.sequence}</span>
            {task.title}
          </p>
          {task.description ? (
            <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{task.description}</p>
          ) : null}
          <p className="text-[11px] text-slate-500 mt-1">
            Owner: {owner?.full_name || owner?.email || "unassigned"}
            {task.est_minutes != null ? ` · est ${task.est_minutes}m` : ""}
            {task.actual_minutes != null ? ` · actual ${task.actual_minutes}m` : ""}
          </p>
        </div>
        <TaskStateBadge state={task.state} />
      </div>
      {canAct ? (
        <form action={formAction} className="mt-2 flex flex-wrap items-end gap-2">
          <input type="hidden" name="task_id" value={task.id} />
          <select
            name="to_state"
            defaultValue={task.state}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-2 py-1 text-xs"
          >
            {CHANGE_TASK_STATES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="actual_minutes"
            min={0}
            placeholder="Actual min"
            className="w-28 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-2 py-1 text-xs"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
          >
            Update
          </button>
        </form>
      ) : null}
    </li>
  );
}

function AddTaskForm({ changeId, profiles }: { changeId: string; profiles: Profile[] }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    addTaskAction,
    undefined,
  );
  const candidates = profiles.filter((p) =>
    ["agent", "manager", "admin", "owner"].includes(p.role),
  );
  return (
    <form
      action={formAction}
      className="rounded-md border border-dashed border-slate-300 dark:border-slate-700 p-3 space-y-2"
    >
      <input type="hidden" name="change_id" value={changeId} />
      <input
        name="title"
        required
        placeholder="Task title"
        maxLength={200}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        rows={2}
        placeholder="Description (optional)"
        maxLength={2000}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <select
          name="owner_id"
          className="flex-1 min-w-[180px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
        >
          <option value="">Owner (unassigned)</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || p.email}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="est_minutes"
          min={0}
          placeholder="Est minutes"
          className="w-32 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
        >
          Add task
        </button>
      </div>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function ApprovalsTab({
  approvals,
  profileById,
  myApproval,
}: {
  approvals: ChangeApproval[];
  profileById: (id: string | null) => Profile | null;
  myApproval: ChangeApproval | null;
}) {
  return (
    <div className="space-y-3">
      {myApproval ? (
        <ApprovalDecisionForm approval={myApproval} />
      ) : null}
      {approvals.length === 0 ? (
        <p className="text-sm text-slate-500">No approvers yet. Submit for review to seed CAB.</p>
      ) : (
        <ul className="space-y-2">
          {approvals.map((a) => {
            const by = profileById(a.approver_id);
            return (
              <li
                key={a.id}
                className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f10] p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {by?.full_name || by?.email || "Unknown"}{" "}
                    <span className="text-xs text-slate-500">({a.role.replace("_", " ")})</span>
                  </p>
                  {a.comment ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{a.comment}</p>
                  ) : null}
                  {a.decided_at ? (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Decided {new Date(a.decided_at).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <ApprovalStateBadge state={a.state} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ApprovalDecisionForm({ approval }: { approval: ChangeApproval }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    recordApprovalDecisionAction,
    undefined,
  );
  return (
    <form
      action={formAction}
      className="rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-3 space-y-2"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        Your CAB decision
      </p>
      <input type="hidden" name="approval_id" value={approval.id} />
      <textarea
        name="comment"
        rows={2}
        placeholder="Comment (optional)"
        maxLength={2000}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          name="decision"
          value="approved"
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
        >
          Reject
        </button>
        <button
          type="submit"
          name="decision"
          value="abstained"
          className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
        >
          Abstain
        </button>
      </div>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function TicketsTab({
  links,
  tickets,
}: {
  links: ChangeTicketLink[];
  tickets: TicketLite[];
}) {
  if (links.length === 0) {
    return <p className="text-sm text-slate-500">No linked tickets.</p>;
  }
  const tixById = new Map(tickets.map((t) => [t.id, t]));
  return (
    <ul className="space-y-2">
      {links.map((l) => {
        const t = tixById.get(l.ticket_id);
        if (!t) return null;
        return (
          <li
            key={l.id}
            className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f10] p-3 flex items-start justify-between gap-3"
          >
            <div>
              <Link
                href={`/helpdesk/${t.number}`}
                className="text-sm font-mono text-brand-600 hover:underline"
              >
                {t.number}
              </Link>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{t.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t.priority} · {t.state.replace("_", " ")} · {l.link_kind.replace("_", " ")}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function AuditTab({
  entries,
  profileById,
}: {
  entries: AuditEntry[];
  profileById: (id: string | null) => Profile | null;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No audit entries yet.</p>;
  }
  return (
    <ol className="space-y-2">
      {entries.map((e) => {
        const by = profileById(e.actor_id);
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f10] p-3"
          >
            <div className="text-xs text-slate-500 w-32 shrink-0">
              {new Date(e.at).toLocaleString()}
            </div>
            <div className="text-sm text-slate-800 dark:text-slate-200">
              <span className="font-medium">{by?.full_name || by?.email || "system"}</span>{" "}
              <span className="font-mono text-xs text-slate-500">{e.action}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ActionPanel({
  change,
  isStaff,
  isRequester,
}: {
  change: Change;
  isStaff: boolean;
  isRequester: boolean;
}) {
  return (
    <div className="space-y-3">
      {change.state === "draft" && (isRequester || isStaff) ? (
        <SubmitForReviewForm changeId={change.id} />
      ) : null}
      {change.state === "approved" && isStaff ? (
        <ScheduleForm change={change} />
      ) : null}
      {(change.state === "approved" || change.state === "scheduled") && isStaff ? (
        <StartForm changeId={change.id} />
      ) : null}
      {change.state === "in_progress" && isStaff ? (
        <CompleteForm changeId={change.id} />
      ) : null}
      {(change.state === "in_progress" || change.state === "done") && isStaff ? (
        <RollbackForm changeId={change.id} />
      ) : null}
      {["draft", "cab_review", "approved", "scheduled"].includes(change.state) &&
      (isRequester || isStaff) ? (
        <CancelForm changeId={change.id} />
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm text-slate-800 dark:text-slate-200">{children}</p>
    </div>
  );
}

function SubmitForReviewForm({ changeId }: { changeId: string }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    submitForReviewAction,
    undefined,
  );
  return (
    <form
      action={formAction}
      className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-4 space-y-2"
    >
      <input type="hidden" name="change_id" value={changeId} />
      <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">Submit</p>
      <button
        type="submit"
        className="w-full rounded-md bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
      >
        Send to CAB review
      </button>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function ScheduleForm({ change }: { change: Change }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    scheduleChangeAction,
    undefined,
  );
  const toLocal = (iso: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 16) : "";
  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-2"
    >
      <input type="hidden" name="change_id" value={change.id} />
      <p className="text-xs uppercase tracking-wide text-slate-500">Schedule window</p>
      <input
        type="datetime-local"
        name="planned_start"
        required
        defaultValue={toLocal(change.planned_start)}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <input
        type="datetime-local"
        name="planned_end"
        required
        defaultValue={toLocal(change.planned_end)}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
      >
        Schedule
      </button>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function StartForm({ changeId }: { changeId: string }) {
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    startChangeAction,
    undefined,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="change_id" value={changeId} />
      <button
        type="submit"
        className="w-full rounded-md bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600"
      >
        Start implementation
      </button>
    </form>
  );
}

function CompleteForm({ changeId }: { changeId: string }) {
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    completeChangeAction,
    undefined,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="change_id" value={changeId} />
      <button
        type="submit"
        className="w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
      >
        Mark done
      </button>
    </form>
  );
}

function RollbackForm({ changeId }: { changeId: string }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    rollbackChangeAction,
    undefined,
  );
  return (
    <form
      action={formAction}
      className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-4 space-y-2"
    >
      <input type="hidden" name="change_id" value={changeId} />
      <p className="text-xs uppercase tracking-wide text-red-700 dark:text-red-300">Rollback</p>
      <textarea
        name="reason"
        rows={2}
        placeholder="Why rolling back?"
        className="w-full rounded-md border border-red-300 dark:border-red-500/30 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600"
      >
        Roll back
      </button>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function CancelForm({ changeId }: { changeId: string }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    cancelChangeAction,
    undefined,
  );
  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-2"
    >
      <input type="hidden" name="change_id" value={changeId} />
      <p className="text-xs uppercase tracking-wide text-slate-500">Cancel</p>
      <textarea
        name="reason"
        rows={2}
        placeholder="Reason (optional)"
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40"
      >
        Cancel change
      </button>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
