"use client";

import React, { useState, useMemo } from "react";
import {
   Calendar as CalendarIcon, Clock, Trash2, Edit2, CheckCircle2,
   XCircle, ArrowUpRight, ShieldCheck, Plane, Stethoscope, Briefcase,
   ChevronRight, Save, Undo2, ChevronLeft, Filter, X, ChevronDown, CalendarDays
} from "lucide-react";

// --- CONFIGURATION ---
const LEAVE_TYPES = {
   annual: { label: "Annual Leave", icon: Plane, color: "text-blue-600", bg: "bg-blue-500/10", dot: "bg-blue-500" },
   sick: { label: "Sick Leave", icon: Stethoscope, color: "text-rose-600", bg: "bg-rose-500/10", dot: "bg-rose-500" },
   casual: { label: "Casual Leave", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-500/10", dot: "bg-amber-500" }
};

type Status = "Pending" | "Approved" | "Rejected" | "Cancelled";
type FilterType = "All" | "Pending" | "Approved" | "Rejected";

interface LeaveRequest {
   id: string;
   type: keyof typeof LEAVE_TYPES;
   start: string;
   end: string;
   days: number;
   reason: string;
   status: Status;
   applied: string;
   approvers: string[];
}

const INITIAL_DATA: LeaveRequest[] = [
   { id: "LR-001", type: "sick", start: "2026-02-10", end: "2026-02-12", days: 3, reason: "Dental surgery.", status: "Pending", applied: "2026-01-24", approvers: ["Sarah J.", "HR"] },
   { id: "LR-002", type: "annual", start: "2026-04-05", end: "2026-04-10", days: 6, reason: "Japan Trip.", status: "Approved", applied: "2026-01-15", approvers: ["Sarah J.", "HR"] },
   { id: "LR-OLD", type: "casual", start: "2021-05-20", end: "2021-05-20", days: 1, reason: "Old Record.", status: "Approved", applied: "2021-05-18", approvers: ["Sarah J."] },
   { id: "LR-004", type: "sick", start: "2026-03-01", end: "2026-03-02", days: 2, reason: "Checkup.", status: "Pending", applied: "2026-01-28", approvers: ["Sarah J."] },
   { id: "LR-005", type: "annual", start: "2026-01-28", end: "2026-02-02", days: 6, reason: "Cross-month holiday.", status: "Pending", applied: "2026-01-10", approvers: ["Sarah J."] }
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ManageAbsenceComplete() {
   const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_DATA);
   const [selectedId, setSelectedId] = useState<string>(INITIAL_DATA[0].id);
   const [statusFilter, setStatusFilter] = useState<FilterType>("All");

   // --- CALENDAR STATE ---
   const currentYear = new Date().getFullYear();
   const [viewYear, setViewYear] = useState(2026); // Defaulting to 2026 for demo data
   const [viewMonth, setViewMonth] = useState(new Date().getMonth());

   // Filter Ranges
   const [rangeStart, setRangeStart] = useState<string | null>(null);
   const [rangeEnd, setRangeEnd] = useState<string | null>(null);

   // Edit State
   const [isEditing, setIsEditing] = useState(false);
   const [editForm, setEditForm] = useState<Partial<LeaveRequest>>({});

   // --- 1. CALENDAR GRID GENERATION ---
   const calendarGrid = useMemo(() => {
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const offset = firstDay === 0 ? 6 : firstDay - 1;
      return { daysInMonth, offset };
   }, [viewYear, viewMonth]);

   // Generate 100 Years (1950 - 2050)
   const yearOptions = useMemo(() => {
      const years = [];
      for (let y = 2050; y >= 1950; y--) years.push(y);
      return years;
   }, []);

   // --- 2. FILTER LOGIC ---
   const filteredList = useMemo(() => {
      return requests.filter(r => {
         // A. Status
         if (statusFilter !== "All" && r.status !== statusFilter) return false;

         // B. Date Range (Cross Month Capable)
         if (rangeStart) {
            const rStart = r.start;
            const rEnd = r.end;

            // Single Date Select
            if (!rangeEnd) {
               return rStart <= rangeStart && rEnd >= rangeStart;
            }
            // Range Select
            else {
               // Standard Overlap Logic: (StartA <= EndB) and (EndA >= StartB)
               const fStart = rangeStart < rangeEnd ? rangeStart : rangeEnd;
               const fEnd = rangeStart < rangeEnd ? rangeEnd : rangeStart;
               return rStart <= fEnd && rEnd >= fStart;
            }
         }

         // C. Default: Show all if no date selected (or specific to view?)
         // Let's show ALL history by default if no date picked, sorted by date
         return true;
      }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
   }, [requests, statusFilter, rangeStart, rangeEnd]);

   const selectedReq = useMemo(() => requests.find(r => r.id === selectedId) || requests[0], [requests, selectedId]);

   // --- 3. ACTIONS ---
   const handleDateClick = (day: number) => {
      const m = String(viewMonth + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dateStr = `${viewYear}-${m}-${d}`;

      if (!rangeStart || (rangeStart && rangeEnd)) {
         // Start new selection
         setRangeStart(dateStr);
         setRangeEnd(null);
      } else {
         // Complete range (even if across months/years via navigation)
         if (dateStr < rangeStart) {
            setRangeEnd(rangeStart);
            setRangeStart(dateStr);
         } else {
            setRangeEnd(dateStr);
         }
      }
   };

   const getRequestsForDate = (day: number) => {
      const m = String(viewMonth + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dateStr = `${viewYear}-${m}-${d}`;
      return requests.filter(r => dateStr >= r.start && dateStr <= r.end && r.status !== 'Cancelled');
   };

   const handleWithdraw = (id: string) => {
      if (confirm("Withdraw this request?")) {
         setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Cancelled" } : r));
         setIsEditing(false);
      }
   };

   const handleSave = () => {
      if (!editForm.start || !editForm.end) return;
      const s = new Date(editForm.start);
      const e = new Date(editForm.end);
      const days = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setRequests(prev => prev.map(r => r.id === selectedId ? { ...r, ...editForm, days } as LeaveRequest : r));
      setIsEditing(false);
   };

   const nextMonth = () => {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
      else setViewMonth(m => m + 1);
   };

   const prevMonth = () => {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
      else setViewMonth(m => m - 1);
   };

   // --- HELPERS ---
   const formatDate = (d: string) => {
      const date = new Date(d);
      return { day: date.getDate(), month: date.toLocaleString('default', { month: 'short' }), year: date.getFullYear() };
   };

   const getStatusStyle = (s: Status) => {
      switch (s) {
         case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
         case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
         case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
         default: return 'bg-amber-100 text-amber-700 border-amber-200';
      }
   };

   return (
      <div className="h-screen w-full bg-[#f8fafc] dark:bg-[#050505] font-sans text-slate-800 dark:text-slate-200 flex flex-col overflow-hidden p-4 gap-4">

         {/* 1. HEADER */}
         <div className="flex-none flex items-center justify-between px-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Manage Absence</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111] rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sync: Live</span>
            </div>
         </div>

         <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

            {/* === LEFT PANEL: CALENDAR & LIST === */}
            <div className="flex-[1.3] bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">

               {/* A. CALENDAR HEADER (DROPDOWNS) */}
               <div className="flex-none px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between">

                     <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-900"><ChevronLeft size={16} /></button>

                        {/* MONTH DROPDOWN */}
                        <div className="relative group">
                           <select
                              value={viewMonth}
                              onChange={(e) => setViewMonth(Number(e.target.value))}
                              className="appearance-none bg-transparent font-black text-sm pr-6 pl-2 py-1 cursor-pointer outline-none text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                           >
                              {MONTHS.map((m, i) => <option key={i} value={i} className="text-black">{m}</option>)}
                           </select>
                           <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>

                        {/* YEAR DROPDOWN */}
                        <div className="relative group">
                           <select
                              value={viewYear}
                              onChange={(e) => setViewYear(Number(e.target.value))}
                              className="appearance-none bg-transparent font-black text-sm pr-6 pl-2 py-1 cursor-pointer outline-none text-slate-500 hover:text-indigo-600 transition-colors"
                           >
                              {yearOptions.map((y) => <option key={y} value={y} className="text-black">{y}</option>)}
                           </select>
                           <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>

                        <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-900"><ChevronRight size={16} /></button>
                     </div>

                     {/* FILTER INFO / CLEAR */}
                     <div className="flex items-center gap-2">
                        {rangeStart ? (
                           <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                              <span className="text-[10px] font-bold text-indigo-600">{rangeStart} {rangeEnd ? `→ ${rangeEnd}` : ''}</span>
                              <button onClick={() => { setRangeStart(null); setRangeEnd(null); }} className="text-rose-500 hover:bg-rose-100 rounded p-0.5"><X size={10} /></button>
                           </div>
                        ) : (
                           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Select Dates</span>
                        )}
                     </div>
                  </div>
               </div>

               {/* B. VISUAL CALENDAR GRID */}
               <div className="flex-none px-5 py-3 border-b border-slate-100 dark:border-white/5">
                  <div className="grid grid-cols-7 gap-1">
                     {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[9px] font-bold text-slate-300 mb-1">{d}</div>)}
                     {Array.from({ length: calendarGrid.offset }).map((_, i) => <div key={`empty-${i}`} />)}
                     {Array.from({ length: calendarGrid.daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const m = String(viewMonth + 1).padStart(2, '0');
                        const d = String(day).padStart(2, '0');
                        const dateStr = `${viewYear}-${m}-${d}`;

                        const activeRequests = getRequestsForDate(day);
                        const hasActive = activeRequests.length > 0;

                        // Check Selection
                        let isSelected = false;
                        let isRange = false;

                        if (rangeStart && !rangeEnd && rangeStart === dateStr) isSelected = true;
                        if (rangeStart && rangeEnd) {
                           const start = rangeStart < rangeEnd ? rangeStart : rangeEnd;
                           const end = rangeStart < rangeEnd ? rangeEnd : rangeStart;
                           if (dateStr === start || dateStr === end) isSelected = true;
                           if (dateStr > start && dateStr < end) isRange = true;
                        }

                        return (
                           <button
                              key={day}
                              onClick={() => handleDateClick(day)}
                              className={`h-8 rounded-lg flex flex-col items-center justify-center relative transition-all ${isSelected
                                    ? 'bg-indigo-600 text-white shadow-md z-10 scale-105'
                                    : isRange
                                       ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                       : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                 }`}
                           >
                              <span className="text-[10px] font-bold">{day}</span>
                              {hasActive && (
                                 <div className="flex gap-0.5 -mt-0.5">
                                    {activeRequests.map((r, idx) => (
                                       <div key={idx} className={`w-1 h-1 rounded-full ${LEAVE_TYPES[r.type].dot}`} />
                                    ))}
                                 </div>
                              )}
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* C. STATUS FILTERS */}
               <div className="flex-none px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                  <div className="flex gap-2">
                     {(["All", "Pending", "Approved", "Rejected"] as FilterType[]).map(f => (
                        <button
                           key={f}
                           onClick={() => setStatusFilter(f)}
                           className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${statusFilter === f
                                 ? "bg-white dark:bg-[#222] border border-slate-200 dark:border-white/10 shadow-sm text-indigo-600"
                                 : "text-slate-400 hover:text-slate-600"
                              }`}
                        >
                           {f}
                        </button>
                     ))}
                  </div>
               </div>

               {/* D. RESULT LIST */}
               <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {filteredList.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <CalendarDays size={32} strokeWidth={1.5} />
                        <p className="text-xs font-bold mt-2 text-center">No records found</p>
                        {rangeStart && <p className="text-[10px] mt-1">Try clearing date filters</p>}
                     </div>
                  ) : (
                     filteredList.map(req => {
                        const isSelected = selectedId === req.id;
                        const { day, month, year } = formatDate(req.start);

                        return (
                           <div
                              key={req.id}
                              onClick={() => { setSelectedId(req.id); setIsEditing(false); }}
                              className={`group cursor-pointer w-full p-3 rounded-2xl border transition-all relative overflow-hidden flex items-center gap-4 ${isSelected
                                    ? "bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 shadow-lg text-white"
                                    : "bg-white dark:bg-[#151515] border-slate-100 dark:border-white/5 hover:border-indigo-300"
                                 }`}
                           >
                              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border ${isSelected ? "bg-white/10 border-white/10" : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                                 }`}>
                                 <span className={`text-[8px] font-black uppercase ${isSelected ? "text-white/60" : "text-slate-400"}`}>{month} '{year.toString().slice(2)}</span>
                                 <span className={`text-xl font-black leading-none ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>{day}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-center mb-0.5">
                                    <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                                       {LEAVE_TYPES[req.type].label}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isSelected ? "bg-white/20 border-white/10 text-white" : getStatusStyle(req.status)
                                       }`}>
                                       {req.status}
                                    </span>
                                 </div>
                                 <p className={`text-[10px] truncate ${isSelected ? "text-white/60" : "text-slate-500"}`}>{req.reason}</p>
                              </div>
                              <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 ${isSelected ? "text-white" : "text-slate-300"}`} />
                           </div>
                        );
                     })
                  )}
               </div>
            </div>

            {/* === RIGHT PANEL: DETAILS & EDIT === */}
            <div className="flex-1 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col shadow-xl overflow-hidden">

               {/* Header */}
               <div className={`p-6 border-b border-slate-50 dark:border-white/5 transition-colors ${isEditing ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-slate-50/50 dark:bg-white/[0.02]'}`}>
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Request ID</span>
                           <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500">{selectedReq.id}</span>
                        </div>
                        {isEditing ? (
                           <h2 className="text-xl font-black text-indigo-600 flex items-center gap-2"><Edit2 size={18} /> Edit Request</h2>
                        ) : (
                           <h2 className="text-xl font-black text-slate-900 dark:text-white">{LEAVE_TYPES[selectedReq.type].label}</h2>
                        )}
                     </div>
                     <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isEditing ? "bg-white border-indigo-200 text-indigo-600" : getStatusStyle(selectedReq.status)
                        }`}>
                        {selectedReq.status === 'Approved' && <CheckCircle2 size={14} />}
                        {selectedReq.status === 'Rejected' && <XCircle size={14} />}
                        {selectedReq.status === 'Pending' && <Clock size={14} />}
                        <span className="text-xs font-bold uppercase">{isEditing ? "Drafting..." : selectedReq.status}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white dark:bg-[#151515] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black uppercase text-slate-400">Duration</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{isEditing ? "-" : selectedReq.days}<span className="text-xs text-slate-400 ml-1">days</span></p>
                     </div>
                     <div className="bg-white dark:bg-[#151515] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black uppercase text-slate-400">Applied On</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">{selectedReq.applied}</p>
                     </div>
                  </div>
               </div>

               {/* Content */}
               <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                  <section>
                     <label className="text-[9px] font-black uppercase text-slate-400 mb-3 block tracking-widest flex justify-between">
                        <span>Timeline</span>
                        {isEditing && <span className="text-indigo-600">Editable</span>}
                     </label>
                     <div className="flex items-center gap-2">
                        <div className={`flex-1 p-3 rounded-xl border flex items-center gap-3 transition-all ${isEditing ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/10' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                           <CalendarIcon size={14} className={isEditing ? "text-indigo-600" : "text-slate-400"} />
                           {isEditing ? (
                              <input type="date" value={editForm.start || ''} onChange={e => setEditForm({ ...editForm, start: e.target.value })} className="w-full text-xs font-bold bg-transparent outline-none text-slate-900 dark:text-white" />
                           ) : (
                              <span className="text-xs font-bold">{selectedReq.start}</span>
                           )}
                        </div>
                        <ArrowUpRight size={14} className="text-slate-300" />
                        <div className={`flex-1 p-3 rounded-xl border flex items-center gap-3 transition-all ${isEditing ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/10' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                           <CalendarIcon size={14} className={isEditing ? "text-indigo-600" : "text-slate-400"} />
                           {isEditing ? (
                              <input type="date" value={editForm.end || ''} onChange={e => setEditForm({ ...editForm, end: e.target.value })} className="w-full text-xs font-bold bg-transparent outline-none text-slate-900 dark:text-white" />
                           ) : (
                              <span className="text-xs font-bold">{selectedReq.end}</span>
                           )}
                        </div>
                     </div>
                  </section>

                  {!isEditing && (
                     <section>
                        <label className="text-[9px] font-black uppercase text-slate-400 mb-4 block tracking-widest">Approval Chain</label>
                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-white/5 space-y-6">
                           {selectedReq.approvers.map((p, i) => (
                              <div key={i} className="relative">
                                 <div className={`absolute -left-[29px] top-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#111] z-10 ${selectedReq.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'
                                    }`} />
                                 <p className="text-xs font-bold text-slate-900 dark:text-white">{p}</p>
                                 <p className="text-[9px] font-medium text-slate-400 uppercase mt-0.5">Step {i + 1} • {selectedReq.status === 'Approved' ? 'Approved' : 'Pending'}</p>
                              </div>
                           ))}
                        </div>
                     </section>
                  )}

                  <section className="flex-1">
                     <label className="text-[9px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Justification</label>
                     {isEditing ? (
                        <textarea
                           className="w-full h-32 p-4 bg-white border border-indigo-500 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                           value={editForm.reason || ''}
                           onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                        />
                     ) : (
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300 relative">
                           <span className="absolute top-4 left-4 text-slate-300 text-2xl leading-none">"</span>
                           <p className="relative z-10 pl-4">{selectedReq.reason}</p>
                        </div>
                     )}
                  </section>
               </div>

               {/* Footer */}
               <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  {isEditing ? (
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsEditing(false)} className="py-3.5 rounded-xl bg-white border border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                           <Undo2 size={14} /> Cancel
                        </button>
                        <button onClick={handleSave} className="py-3.5 rounded-xl bg-indigo-600 font-bold text-xs uppercase tracking-wider text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                           <Save size={14} /> Save Changes
                        </button>
                     </div>
                  ) : (
                     <>
                        {selectedReq.status === 'Pending' ? (
                           <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => { setEditForm(selectedReq); setIsEditing(true); }} className="py-3.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 bg-white dark:bg-[#151515]">
                                 <Edit2 size={14} /> Edit
                              </button>
                              <button onClick={() => handleWithdraw(selectedReq.id)} className="py-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 font-bold text-xs uppercase tracking-wider text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all flex items-center justify-center gap-2">
                                 <Trash2 size={14} /> Withdraw
                              </button>
                           </div>
                        ) : (
                           <button disabled className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center justify-center gap-2 cursor-not-allowed">
                              <ShieldCheck size={14} />
                              {selectedReq.status === 'Cancelled' ? 'Request Withdrawn' : 'Modification Locked'}
                           </button>
                        )}
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}