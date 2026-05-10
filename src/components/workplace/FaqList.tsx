"use client";

import React, { useMemo, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Search } from "lucide-react";
import type { Faq } from "@/lib/workplace/faqs";
import { voteFaqAction } from "@/lib/workplace/actions";

type Props = { items: Faq[]; categories: string[] };

export default function FaqList({ items, categories }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, "up" | "down">>({});
  const [, start] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((f) => {
      const matchCat = filter === "all" || f.category === filter;
      const matchQ =
        !q ||
        f.question.toLowerCase().includes(q.toLowerCase()) ||
        f.answer_md.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [items, filter, q]);

  function vote(id: string, direction: "up" | "down") {
    if (voted[id]) return;
    setVoted((v) => ({ ...v, [id]: direction }));
    const fd = new FormData();
    fd.append("id", id);
    fd.append("direction", direction);
    start(async () => {
      await voteFaqAction(undefined, fd);
    });
  }

  return (
    <div>
      <div className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
      </div>

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
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-500 py-12">No questions match your filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const isOpen = open === f.id;
            return (
              <div
                key={f.id}
                className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  className="w-full flex items-start justify-between gap-3 p-5 text-left"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.question}</h3>
                  {isOpen ? (
                    <ChevronUp className="text-slate-400 flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400 flex-shrink-0" size={20} />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {f.answer_md}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 capitalize">
                        {f.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Was this helpful?</span>
                        <button
                          onClick={() => vote(f.id, "up")}
                          disabled={!!voted[f.id]}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                            voted[f.id] === "up"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ThumbsUp size={12} /> {f.helpful_count + (voted[f.id] === "up" ? 1 : 0)}
                        </button>
                        <button
                          onClick={() => vote(f.id, "down")}
                          disabled={!!voted[f.id]}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                            voted[f.id] === "down"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ThumbsDown size={12} /> {f.unhelpful_count + (voted[f.id] === "down" ? 1 : 0)}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
