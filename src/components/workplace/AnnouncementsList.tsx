"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Megaphone, Pin, Calendar, AlertTriangle } from "lucide-react";
import type { AnnouncementWithRead } from "@/lib/workplace/announcements";
import {
  dismissAnnouncementAction,
  markAnnouncementReadAction,
} from "@/lib/workplace/actions";

type Props = {
  items: AnnouncementWithRead[];
  categories: string[];
  activeCategory?: string;
  canDismiss?: boolean;
};

function fmt(s: string | null): string {
  if (!s) return "";
  try {
    const d = new Date(s);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default function AnnouncementsList({ items, categories, activeCategory, canDismiss }: Props) {
  const [filter, setFilter] = useState<string>(activeCategory ?? "all");
  const [pending, start] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((a) => a.category === filter);
  }, [items, filter]);

  const unreadCount = items.filter((a) => !a.read).length;

  function toggleOpen(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
    const target = items.find((a) => a.id === id);
    if (target && !target.read) {
      const fd = new FormData();
      fd.append("id", id);
      start(async () => {
        await markAnnouncementReadAction(undefined, fd);
      });
    }
  }

  function dismiss(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    start(async () => {
      await dismissAnnouncementAction(undefined, fd);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            filter === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          All {unreadCount > 0 && <span className="ml-1 text-xs">({unreadCount})</span>}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition ${
              filter === c
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-slate-500">
          <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-bold">Nothing to read yet.</p>
          <p className="text-sm mt-1">Active announcements will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const open = openId === a.id;
            return (
              <article
                key={a.id}
                className={`bg-white dark:bg-[#121212] p-6 rounded-3xl border transition ${
                  !a.read
                    ? "border-l-4 border-l-brand-500 border-slate-200 dark:border-slate-800"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 capitalize">
                      {a.category}
                    </span>
                    {a.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    {!a.read && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Calendar size={14} /> {fmt(a.published_at)}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {a.title}
                </h2>

                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {open ? a.body_for_user : a.body_for_user.slice(0, 280)}
                  {a.body_for_user.length > 280 && !open && "..."}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => toggleOpen(a.id)}
                    className="text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    {open ? "Show less" : "Read more"}
                  </button>
                  {a.expires_at && new Date(a.expires_at) > new Date() && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <AlertTriangle size={12} /> Expires {fmt(a.expires_at)}
                    </span>
                  )}
                  {canDismiss ? (
                    <DismissButton onDismiss={() => dismiss(a.id)} pending={pending} />
                  ) : (
                    <span />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-xs text-slate-400">
        <Link href="/announcements" className="underline">
          Refresh
        </Link>
      </div>
    </div>
  );
}

function DismissButton({ onDismiss, pending }: { onDismiss: () => void; pending: boolean }) {
  return (
    <button
      onClick={onDismiss}
      disabled={pending}
      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 disabled:opacity-50"
    >
      {pending ? "..." : "Dismiss"}
    </button>
  );
}
