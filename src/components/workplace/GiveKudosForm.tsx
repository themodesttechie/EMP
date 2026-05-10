"use client";

import React, { useActionState, useMemo, useState } from "react";
import { Heart, Search, User, Check } from "lucide-react";
import { giveKudosAction, type ActionResult } from "@/lib/workplace/actions";
import type { DirectoryProfile } from "@/lib/workplace/directory";

type Props = { recipients: DirectoryProfile[] };

export default function GiveKudosForm({ recipients }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | undefined, FormData>(
    giveKudosAction,
    undefined,
  );
  return (
    <GiveKudosFormInner
      key={state?.ok ? "ok" : "draft"}
      recipients={recipients}
      state={state}
      formAction={formAction}
      pending={pending}
    />
  );
}

function GiveKudosFormInner({
  recipients,
  state,
  formAction,
  pending,
}: {
  recipients: DirectoryProfile[];
  state: ActionResult<{ id: string }> | undefined;
  formAction: (fd: FormData) => void;
  pending: boolean;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<DirectoryProfile | null>(null);
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const filtered = useMemo(() => {
    if (!q) return recipients.slice(0, 8);
    const lc = q.toLowerCase();
    return recipients
      .filter(
        (r) =>
          (r.full_name ?? "").toLowerCase().includes(lc) ||
          r.email.toLowerCase().includes(lc) ||
          (r.job_title ?? "").toLowerCase().includes(lc),
      )
      .slice(0, 8);
  }, [recipients, q]);

  return (
    <form action={formAction} className="space-y-6 bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
      {state?.error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-center gap-2">
          <Check size={16} /> Kudos sent.
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Recipient</label>
        {sel ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
              {sel.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sel.avatar_url} alt={sel.full_name ?? sel.email} className="w-full h-full object-cover" />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{sel.full_name ?? sel.email}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                {sel.job_title ?? sel.role}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSel(null)}
              className="text-xs text-slate-400 hover:text-rose-500"
            >
              Change
            </button>
            <input type="hidden" name="to_user_id" value={sel.id} />
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search colleagues..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            {filtered.length > 0 && (
              <div className="mt-3 space-y-1 max-h-72 overflow-y-auto">
                {filtered.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSel(r)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {r.full_name ?? r.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 truncate">
                        {r.job_title ?? r.role}
                        {r.department ? ` · ${r.department}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Message ({message.length}/500)
        </label>
        <textarea
          name="message"
          required
          maxLength={500}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Thanks for staying late to fix the migration..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.currentTarget.checked)}
          className="w-5 h-5"
        />
        Show in public feed (uncheck for private kudos)
      </label>
      <input type="hidden" name="public" value={isPublic ? "on" : "off"} />

      <button
        type="submit"
        disabled={pending || !sel || !message.trim()}
        className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Heart size={16} /> {pending ? "Sending..." : "Send kudos"}
      </button>
    </form>
  );
}
