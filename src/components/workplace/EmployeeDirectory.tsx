"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Building2, Mail, ChevronRight, User } from "lucide-react";
import type { DirectoryProfile } from "@/lib/workplace/directory";

type Props = {
  employees: DirectoryProfile[];
  departments: string[];
  locations: string[];
  initialQuery: string;
  initialDepartment: string;
  initialLocation: string;
};

export default function EmployeeDirectory({
  employees,
  departments,
  locations,
  initialQuery,
  initialDepartment,
  initialLocation,
}: Props) {
  const [q, setQ] = useState(initialQuery);
  const [dept, setDept] = useState(initialDepartment);
  const [loc, setLoc] = useState(initialLocation);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchQ =
        !q ||
        e.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        e.email.toLowerCase().includes(q.toLowerCase()) ||
        (e.job_title ?? "").toLowerCase().includes(q.toLowerCase());
      const matchD = dept === "All" || e.department === dept;
      const matchL = loc === "All" || e.location === loc;
      return matchQ && matchD && matchL;
    });
  }, [employees, q, dept, loc]);

  return (
    <div>
      <div className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or title..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium min-w-[160px]"
          >
            <option value="All">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium min-w-[160px]"
          >
            <option value="All">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-32 text-center text-slate-500">
          <User size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold">No employees found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((emp) => (
            <Link
              key={emp.id}
              href={`/employee-directory/${emp.id}`}
              className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="h-24 bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-500/20 dark:to-brand-500/5 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl p-1 bg-white dark:bg-[#121212] shadow-sm">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      {emp.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={emp.avatar_url} alt={emp.full_name ?? emp.email} className="w-full h-full object-cover" />
                      ) : (
                        <User size={28} />
                      )}
                    </div>
                  </div>
                </div>
                {emp.department && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      {emp.department}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 pt-14">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-brand-600 transition-colors">
                  {emp.full_name ?? emp.email}
                </h3>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                  {emp.job_title ?? emp.role}
                </p>
                <div className="mt-4 space-y-2">
                  {emp.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} className="text-slate-400" /> {emp.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                    <Mail size={14} className="text-slate-400" /> <span className="truncate">{emp.email}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <Building2 size={12} /> {emp.role}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 group-hover:text-brand-500">
                    View profile <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
