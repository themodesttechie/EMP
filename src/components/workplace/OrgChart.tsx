"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import type { OrgNode } from "@/lib/workplace/directory";

type Props = { roots: OrgNode[] };

export default function OrgChart({ roots }: Props) {
  if (roots.length === 0) {
    return (
      <div className="py-32 text-center text-slate-500">
        <User size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg font-bold">No org chart yet.</p>
        <p className="text-sm mt-1">Set manager_id on profiles to see the tree.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {roots.map((r) => (
        <NodeRow key={r.id} node={r} depth={0} />
      ))}
    </div>
  );
}

function NodeRow({ node, depth }: { node: OrgNode; depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.reports.length > 0;

  return (
    <div className="org-node" style={{ paddingLeft: depth === 0 ? 0 : 24 }}>
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-sm transition">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30"
          disabled={!hasChildren}
          aria-label={open ? "Collapse" : "Expand"}
        >
          {hasChildren ? open ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : null}
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
          {node.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.avatar_url} alt={node.full_name ?? node.email} className="w-full h-full object-cover" />
          ) : (
            <User size={16} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/employee-directory/${node.id}`}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600"
          >
            {node.full_name ?? node.email}
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 truncate">
            {node.job_title ?? node.role}
            {node.department && (
              <span className="ml-2 text-slate-400">· {node.department}</span>
            )}
          </p>
        </div>
        {hasChildren && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {node.reports.length} report{node.reports.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-5 mt-2 pl-2 space-y-2">
          {node.reports.map((r) => (
            <NodeRow key={r.id} node={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
