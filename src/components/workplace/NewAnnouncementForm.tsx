"use client";

import React, { useActionState, useState } from "react";
import { createAnnouncementAction, type ActionResult } from "@/lib/workplace/actions";

const ROLES = ["owner", "admin", "agent", "manager", "employee"] as const;
const TARGET_LOCALES = ["hi", "te", "ta", "kn", "ml", "fr", "es", "de", "ja", "ar"] as const;

type Props = { departments: string[] };

export default function NewAnnouncementForm({ departments }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | undefined, FormData>(
    createAnnouncementAction,
    undefined,
  );
  const [audMode, setAudMode] = useState<"all" | "scoped">("all");
  const [selRoles, setSelRoles] = useState<string[]>([]);
  const [selDepts, setSelDepts] = useState<string[]>([]);
  const [selLocales, setSelLocales] = useState<string[]>([]);

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Title</label>
        <input
          name="title"
          required
          maxLength={200}
          className="w-full px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Body (markdown)</label>
        <textarea
          name="body_md"
          rows={10}
          maxLength={16000}
          className="w-full px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 font-mono"
        />
        <p className="text-xs text-slate-400 mt-1">
          Plain markdown is fine. Headings, lists, links, and code blocks render in the feed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
          <select
            name="category"
            defaultValue="general"
            className="w-full px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          >
            <option value="general">general</option>
            <option value="company">company</option>
            <option value="it">it</option>
            <option value="hr">hr</option>
            <option value="facilities">facilities</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Expires</label>
          <input
            name="expires_at"
            type="datetime-local"
            className="w-full px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" name="pinned" className="w-5 h-5" />
            Pin to top
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Audience</label>
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="audience_mode"
              value="all"
              checked={audMode === "all"}
              onChange={() => setAudMode("all")}
            />
            Everyone in tenant
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="audience_mode"
              value="scoped"
              checked={audMode === "scoped"}
              onChange={() => setAudMode("scoped")}
            />
            Scoped
          </label>
        </div>

        {audMode === "scoped" && (
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Roles</span>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelRoles((s) => toggle(s, r))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                      selRoles.includes(r)
                        ? "bg-brand-500 text-white"
                        : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 text-slate-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input type="hidden" name="audience_roles" value={selRoles.join(",")} />
            </div>
            {departments.length > 0 && (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Departments</span>
                <div className="flex flex-wrap gap-2">
                  {departments.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelDepts((s) => toggle(s, d))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        selDepts.includes(d)
                          ? "bg-brand-500 text-white"
                          : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 text-slate-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="audience_departments" value={selDepts.join(",")} />
              </div>
            )}
            <input type="hidden" name="audience_user_ids" value="" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Auto-translate to
        </label>
        <div className="flex flex-wrap gap-2">
          {TARGET_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setSelLocales((s) => toggle(s, l))}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                selLocales.includes(l)
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 text-slate-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <input type="hidden" name="target_locales" value={selLocales.join(",")} />
        <p className="text-xs text-slate-400 mt-2">
          Translation runs in the background after publish. Source body is shown if translation is not ready.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-60"
        >
          {pending ? "Publishing..." : "Publish announcement"}
        </button>
        <a href="/announcements" className="text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </a>
      </div>
    </form>
  );
}
