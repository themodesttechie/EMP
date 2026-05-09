"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptTriageSuggestionAction,
  addTicketCommentAction,
  assignTicketAction,
  escalateTicketAction,
  updateTicketStateAction,
  type ActionResult,
} from "@/lib/tickets/actions";
import { useRealtime } from "@/hooks/useRealtime";
import { PriorityBadge, StateBadge } from "./TicketBadges";
import SlaTimer from "./SlaTimer";
import type {
  Ticket,
  TicketAttachment,
  TicketCategory,
  TicketComment,
  TicketStateHistoryRow,
  TicketState,
} from "@/lib/tickets/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };

type Props = {
  ticket: Ticket;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  history: TicketStateHistoryRow[];
  categories: TicketCategory[];
  profiles: Profile[];
  myProfileId: string;
  myRole: string;
};

const TAB_KEYS = ["comments", "activity", "attachments"] as const;
type Tab = (typeof TAB_KEYS)[number];

const NEXT_STATES: Record<TicketState, TicketState[]> = {
  new: ["triage", "in_progress", "cancelled"],
  triage: ["in_progress", "pending_user", "cancelled"],
  in_progress: ["pending_user", "resolved", "cancelled"],
  pending_user: ["in_progress", "resolved", "cancelled"],
  resolved: ["closed", "in_progress"],
  closed: [],
  cancelled: [],
};

export default function TicketDetail(props: Props) {
  const router = useRouter();
  const { ticket } = props;
  const [tab, setTab] = useState<Tab>("comments");
  const isAgent = ["agent", "admin", "owner", "manager"].includes(props.myRole);

  useRealtime({
    table: "ticket_comments",
    filter: `ticket_id=eq.${ticket.id}`,
    onChange: () => router.refresh(),
  });
  useRealtime({
    table: "tickets",
    filter: `id=eq.${ticket.id}`,
    onChange: () => router.refresh(),
  });

  const profileById = (id: string | null) => {
    if (!id) return null;
    return props.profiles.find((p) => p.id === id) ?? null;
  };

  const ai = ticket.ai_classification;
  const aiCategoryName =
    ai?.category_id ? props.categories.find((c) => c.id === ai.category_id)?.name : null;

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b]">
      <header className="sticky top-0 z-20 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-brand-600">{ticket.number}</span>
              <StateBadge state={ticket.state} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-1 truncate">
              {ticket.title}
            </h1>
          </div>
          <SlaTimer
            resolutionDueAt={ticket.resolution_due_at}
            resolved={["resolved", "closed", "cancelled"].includes(ticket.state)}
            breached={ticket.sla_breached}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24">
        <section className="lg:col-span-2 space-y-4">
          {ticket.description ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
              <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Description</h2>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          ) : null}

          {ai && isAgent && !ai.accepted_by_agent ? (
            <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    AI triage suggestion
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                    Suggested category <strong>{aiCategoryName ?? ai.category_slug ?? "—"}</strong> at priority{" "}
                    <strong>{ai.priority}</strong> (confidence {(ai.confidence * 100).toFixed(0)}%).
                  </p>
                  {ai.reasoning ? (
                    <p className="text-xs text-slate-500 mt-1">{ai.reasoning}</p>
                  ) : null}
                </div>
                <AcceptTriageForm ticketId={ticket.id} />
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-3">
              {TAB_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-4 py-3 text-sm font-medium capitalize ${
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
              {tab === "comments" && (
                <CommentsTab
                  comments={props.comments}
                  profileById={profileById}
                  ticketId={ticket.id}
                  isAgent={isAgent}
                />
              )}
              {tab === "activity" && (
                <ActivityTab history={props.history} profileById={profileById} />
              )}
              {tab === "attachments" && (
                <AttachmentsTab attachments={props.attachments} profileById={profileById} />
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <SidePanel
            ticket={ticket}
            categories={props.categories}
            profiles={props.profiles}
            isAgent={isAgent}
            myProfileId={props.myProfileId}
          />
        </aside>
      </main>
    </div>
  );
}

function AcceptTriageForm({ ticketId }: { ticketId: string }) {
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    acceptTriageSuggestionAction,
    undefined,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="ticket_id" value={ticketId} />
      <button
        type="submit"
        className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
      >
        Accept
      </button>
    </form>
  );
}

function CommentsTab({
  comments,
  profileById,
  ticketId,
  isAgent,
}: {
  comments: TicketComment[];
  profileById: (id: string | null) => Profile | null;
  ticketId: string;
  isAgent: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} author={profileById(c.author_id)} />
          ))
        )}
      </div>
      <AddCommentForm ticketId={ticketId} isAgent={isAgent} />
    </div>
  );
}

function CommentItem({ comment, author }: { comment: TicketComment; author: Profile | null }) {
  const ring =
    comment.kind === "system"
      ? "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
      : comment.kind === "ai"
        ? "bg-purple-50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/20"
        : comment.is_internal
          ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
          : "bg-white dark:bg-[#0f0f10] border-slate-200 dark:border-slate-800";
  const label =
    comment.kind === "ai" ? "AI" : author?.full_name || author?.email || "system";
  return (
    <div className={`rounded-lg border p-3 ${ring}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-[11px] text-slate-500">
          {new Date(comment.created_at).toLocaleString()}
          {comment.is_internal && comment.kind !== "system" ? " · internal" : ""}
        </span>
      </div>
      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}

function AddCommentForm({ ticketId, isAgent }: { ticketId: string; isAgent: boolean }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    addTicketCommentAction,
    undefined,
  );
  return (
    <form action={formAction} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Write a comment…"
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
      <div className="flex items-center justify-between">
        {isAgent ? (
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input type="checkbox" name="is_internal" className="h-3.5 w-3.5" />
            Internal note
          </label>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
        >
          Send
        </button>
      </div>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

function ActivityTab({
  history,
  profileById,
}: {
  history: TicketStateHistoryRow[];
  profileById: (id: string | null) => Profile | null;
}) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500">No activity yet.</p>;
  }
  return (
    <ol className="space-y-2">
      {history.map((h) => {
        const by = profileById(h.by_user);
        return (
          <li
            key={h.id}
            className="flex items-start gap-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f10] p-3"
          >
            <div className="text-xs text-slate-500 w-32 shrink-0">
              {new Date(h.at).toLocaleString()}
            </div>
            <div className="text-sm text-slate-800 dark:text-slate-200">
              <span className="font-medium">{by?.full_name || by?.email || "system"}</span>{" "}
              {h.from_state ? (
                <>
                  moved <span className="font-mono">{h.from_state}</span> →{" "}
                  <span className="font-mono">{h.to_state}</span>
                </>
              ) : (
                <>set state to <span className="font-mono">{h.to_state}</span></>
              )}
              {h.reason ? <span className="text-slate-500"> · {h.reason}</span> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function AttachmentsTab({
  attachments,
  profileById,
}: {
  attachments: TicketAttachment[];
  profileById: (id: string | null) => Profile | null;
}) {
  if (attachments.length === 0) {
    return <p className="text-sm text-slate-500">No attachments.</p>;
  }
  return (
    <ul className="space-y-2">
      {attachments.map((a) => {
        const by = profileById(a.uploaded_by);
        return (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f0f10] p-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.filename}</p>
              <p className="text-xs text-slate-500">
                {(a.size_bytes / 1024).toFixed(1)} KB ·{" "}
                {by?.full_name || by?.email || "uploader"} ·{" "}
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SidePanel({
  ticket,
  categories,
  profiles,
  isAgent,
  myProfileId,
}: {
  ticket: Ticket;
  categories: TicketCategory[];
  profiles: Profile[];
  isAgent: boolean;
  myProfileId: string;
}) {
  const requester = profiles.find((p) => p.id === ticket.requester_id);
  const assignee = ticket.assignee_id ? profiles.find((p) => p.id === ticket.assignee_id) : null;
  const cat = ticket.category_id ? categories.find((c) => c.id === ticket.category_id) : null;
  const next = NEXT_STATES[ticket.state] ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 text-sm space-y-3">
        <Field label="Requester">{requester?.full_name || requester?.email || "—"}</Field>
        <Field label="Assignee">{assignee?.full_name || assignee?.email || "Unassigned"}</Field>
        <Field label="Category">{cat?.name || "—"}</Field>
        <Field label="Source">{ticket.source}</Field>
        <Field label="Created">{new Date(ticket.created_at).toLocaleString()}</Field>
      </div>

      {isAgent ? (
        <>
          <AssignForm ticket={ticket} profiles={profiles} myProfileId={myProfileId} />
          {next.length > 0 ? <StateChangeForm ticket={ticket} states={next} /> : null}
          {ticket.priority !== "P1" ? <EscalateForm ticket={ticket} /> : null}
        </>
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

function AssignForm({
  ticket,
  profiles,
  myProfileId,
}: {
  ticket: Ticket;
  profiles: Profile[];
  myProfileId: string;
}) {
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    assignTicketAction,
    undefined,
  );
  const candidates = profiles.filter((p) =>
    ["agent", "admin", "owner", "manager"].includes(p.role),
  );
  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-2"
    >
      <input type="hidden" name="ticket_id" value={ticket.id} />
      <p className="text-xs uppercase tracking-wide text-slate-500">Assign to</p>
      <div className="flex gap-2">
        <select
          name="assignee_id"
          defaultValue={ticket.assignee_id ?? ""}
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || p.email}
              {p.id === myProfileId ? " (me)" : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}

function StateChangeForm({ ticket, states }: { ticket: Ticket; states: TicketState[] }) {
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    updateTicketStateAction,
    undefined,
  );
  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-2"
    >
      <input type="hidden" name="ticket_id" value={ticket.id} />
      <p className="text-xs uppercase tracking-wide text-slate-500">Change state</p>
      <select
        name="to_state"
        defaultValue={states[0]}
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      >
        {states.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
      <textarea
        name="reason"
        rows={2}
        placeholder="Reason (optional)"
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
      >
        Apply
      </button>
    </form>
  );
}

function EscalateForm({ ticket }: { ticket: Ticket }) {
  const [, formAction] = useActionState<ActionResult | undefined, FormData>(
    escalateTicketAction,
    undefined,
  );
  return (
    <form
      action={formAction}
      className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-4 space-y-2"
    >
      <input type="hidden" name="ticket_id" value={ticket.id} />
      <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Escalate</p>
      <textarea
        name="reason"
        rows={2}
        placeholder="Why does this need higher priority?"
        className="w-full rounded-md border border-amber-300 dark:border-amber-500/30 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600"
      >
        Bump priority
      </button>
    </form>
  );
}
