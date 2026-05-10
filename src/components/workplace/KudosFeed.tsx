"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, User } from "lucide-react";
import type { KudosWithProfiles } from "@/lib/workplace/kudos";

type Props = {
  items: KudosWithProfiles[];
  categories: string[];
  activeCategory?: string;
};

function fmt(s: string): string {
  try {
    const d = new Date(s);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default function KudosFeed({ items, categories, activeCategory }: Props) {
  const [filter, setFilter] = useState<string>(activeCategory ?? "all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((k) => k.ai_categorized_value === filter);
  }, [items, filter]);

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
          All
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
            {c.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-slate-500">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-bold">No kudos yet.</p>
          <p className="text-sm mt-1">Be the first to recognise a colleague.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((k) => (
            <article
              key={k.id}
              className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden flex-shrink-0">
                  {k.from_user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={k.from_user.avatar_url} alt={k.from_user.full_name ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm">
                      <Link
                        href={`/employee-directory/${k.from_user_id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600"
                      >
                        {k.from_user?.full_name ?? k.from_user?.email ?? "Someone"}
                      </Link>{" "}
                      <span className="text-slate-500">recognised</span>{" "}
                      <Link
                        href={`/employee-directory/${k.to_user_id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600"
                      >
                        {k.to_user?.full_name ?? k.to_user?.email ?? "a colleague"}
                      </Link>
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0">{fmt(k.at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {k.message}
                  </p>
                  {k.ai_categorized_value && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 text-[10px] font-bold uppercase tracking-widest">
                      <Heart size={10} /> {k.ai_categorized_value.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
