"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
   Calendar as CalendarIcon,
   ChevronDown,
   CheckCircle2,
   UploadCloud,
   Plane,
   Stethoscope,
   Briefcase,
   Baby,
   Umbrella,
   Heart,
   AlertOctagon,
   Trash2,
   ArrowRight,
   User,
   AlertTriangle,
   RefreshCcw,
   Sparkles,
   Clock,
   RotateCcw,
   ChevronLeft,
   ChevronRight
} from "lucide-react";

// ============================================================================
// 🛠️ ADMIN CONFIGURATION
// ============================================================================
const COMPANY_CONFIG = {
   companyName: "IfBash",

   holidays: [
      { date: "2026-01-26", name: "Republic Day" },
      { date: "2026-02-14", name: "Valentine's" },
      { date: "2026-03-25", name: "Holi" }
   ],

   history: [
      { date: "2026-01-05", status: "approved", label: "Sick Leave" },
      { date: "2026-01-06", status: "approved", label: "Sick Leave" },
      { date: "2026-01-12", status: "rejected", label: "Casual" },
      { date: "2026-02-10", status: "pending", label: "Vacation" },
   ],

   leaveTypes: [
      { id: "annual", label: "Annual", icon: Plane, balance: 18, accrual: 1.5, color: "text-blue-500", bg: "bg-blue-500/10", requiresDoc: false },
      { id: "sick", label: "Sick", icon: Stethoscope, balance: 12, accrual: 1.0, color: "text-rose-500", bg: "bg-rose-500/10", requiresDoc: true },
      { id: "casual", label: "Casual", icon: Briefcase, balance: 6, accrual: 0.5, color: "text-amber-500", bg: "bg-amber-500/10", requiresDoc: false },
      { id: "comp", label: "Comp Off", icon: Umbrella, balance: 3, accrual: 0, color: "text-emerald-500", bg: "bg-emerald-500/10", requiresDoc: false },
      { id: "mat", label: "Maternity", icon: Baby, balance: 90, accrual: 0, color: "text-purple-500", bg: "bg-purple-500/10", requiresDoc: true },
      { id: "ber", label: "Bereave", icon: Heart, balance: 5, accrual: 0, color: "text-slate-500", bg: "bg-slate-500/10", requiresDoc: false },
      { id: "lop", label: "L.O.P", icon: AlertOctagon, balance: 0, accrual: 0, color: "text-red-500", bg: "bg-red-500/10", requiresDoc: false },
   ],

   approvers: [
      { name: "Sarah J.", role: "Manager", avatar: "SJ", time: "4h" },
      { name: "HR Dept", role: "Audit", avatar: "HR", time: "24h" }
   ],

   colleagues: [
      { id: 1, name: "Mike Ross", role: "Backend" },
      { id: 2, name: "Rachel Zane", role: "Paralegal" },
   ]
};

export default function FullyFunctionalPortal() {
   // --- STATE ---
   const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
   const [mode, setMode] = useState<"single" | "range" | "multi">("range");

   // Selection State
   const [range, setRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
   const [multiDates, setMultiDates] = useState<string[]>([]);

   // Form State
   const [typeId, setTypeId] = useState("annual");
   const [coverId, setCoverId] = useState("");
   const [reason, setReason] = useState("");
   const [file, setFile] = useState<File | null>(null);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   const dropdownRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Close dropdown on click outside
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // --- LOGIC: CALENDAR ---
   const calendarData = useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let firstDayOfWeek = new Date(year, month, 1).getDay();
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      return { year, month, daysInMonth, firstDayOfWeek };
   }, [currentDate]);

   const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

   const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
   const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
   const jumpToday = () => setCurrentDate(new Date());

   // --- LOGIC: SELECTION ---
   const handleDateClick = (day: number) => {
      const y = calendarData.year;
      const m = calendarData.month + 1;
      const dStr = `${y}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;

      // Block existing approved/pending
      const existing = COMPANY_CONFIG.history.find(r => r.date === dStr);
      if (existing && (existing.status === 'approved' || existing.status === 'pending')) return;

      if (mode === "multi") {
         // Toggle date in array
         setMultiDates(prev => prev.includes(dStr) ? prev.filter(d => d !== dStr) : [...prev, dStr].sort());
      } else if (mode === "single") {
         // Single day is just a range where start == end
         setRange({ start: dStr, end: dStr });
      } else {
         // Range Logic
         if (!range.start || (range.start && range.end)) {
            // Start new range
            setRange({ start: dStr, end: "" });
         } else {
            // Complete range (Handle reverse click)
            const s = new Date(range.start);
            const e = new Date(dStr);
            if (e < s) setRange({ start: dStr, end: range.start }); // Swapped
            else setRange({ ...range, end: dStr });
         }
      }
   };

   const handleQuickSelect = (type: 'today' | 'tomorrow') => {
      const today = new Date();
      if (type === 'tomorrow') today.setDate(today.getDate() + 1);
      const dStr = today.toISOString().split('T')[0];

      // Switch to Single mode for quick select to be intuitive
      setMode('single');
      setRange({ start: dStr, end: dStr });
      setMultiDates([]);
      setCurrentDate(today);
   };

   // --- LOGIC: VALIDATION & STATS ---
   const stats = useMemo(() => {
      let days = 0, deduction = 0, sandwichWarning = false, projection = 0;

      const checkDay = (dStr: string) => {
         const dObj = new Date(dStr);
         const isHoliday = COMPANY_CONFIG.holidays.some(h => h.date === dStr);
         const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
         if (!isHoliday && !isWeekend) return 1;
         return 0;
      };

      if (mode === "multi") {
         days = multiDates.length;
         deduction = multiDates.reduce((acc, date) => acc + checkDay(date), 0);
      } else {
         if (range.start && range.end) {
            let cur = new Date(range.start);
            let end = new Date(range.end);

            if (cur.getDay() === 5 && end.getDay() === 1) sandwichWarning = true;

            while (cur <= end) {
               deduction += checkDay(cur.toISOString().split('T')[0]);
               days++;
               cur.setDate(cur.getDate() + 1);
            }
         } else if (range.start && !range.end) {
            // Count start day only while selecting
            days = 1;
            deduction = checkDay(range.start);
         }
      }

      const selectedType = COMPANY_CONFIG.leaveTypes.find(t => t.id === typeId)!;
      const today = new Date();
      const monthDiff = (calendarData.year - today.getFullYear()) * 12 + (calendarData.month - today.getMonth());
      if (monthDiff > 0 && selectedType.accrual > 0) projection = Number((monthDiff * selectedType.accrual).toFixed(1));

      return { days, deduction, sandwichWarning, projection };
   }, [range, multiDates, mode, typeId, calendarData]);

   // --- BUTTON STATUS LOGIC ---
   const selectedType = COMPANY_CONFIG.leaveTypes.find(t => t.id === typeId)!;
   const isCoverRequired = stats.deduction > 3;

   const hasDates = mode === "multi" ? multiDates.length > 0 : !!(range.start && range.end);
   const hasReason = reason.trim().length > 0;
   const hasFile = !selectedType.requiresDoc || !!file;
   const hasCover = !isCoverRequired || !!coverId;

   // Determine Button Text & State
   let btnText = "Submit Request";
   let isBtnDisabled = false;

   if (!hasDates) {
      isBtnDisabled = true;
      btnText = mode === 'range' && range.start ? "Select End Date" : "Select Dates";
   } else if (!hasReason) {
      isBtnDisabled = true;
      btnText = "Enter Reason";
   } else if (!hasFile) {
      isBtnDisabled = true;
      btnText = "Upload Proof";
   } else if (!hasCover) {
      isBtnDisabled = true;
      btnText = "Assign Delegate";
   }

   return (
      <div className="h-screen w-full bg-slate-50 dark:bg-[#050505] font-sans text-slate-800 dark:text-slate-200 flex flex-col overflow-hidden transition-colors duration-300">

         {/* --- HEADER --- */}
         <div className="flex-none px-6 py-4 flex items-center justify-between bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 z-20">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-600 p-2 rounded-xl text-white"><CalendarIcon className="h-5 w-5" /></div>
               <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Request Absence</h1>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-xs font-medium text-slate-500">System Online</span>
            </div>
         </div>

         {/* --- MAIN CONTENT --- */}
         <div className="flex-1 flex overflow-hidden">

            {/* LEFT: CALENDAR */}
            <div className="flex-1 flex flex-col min-w-0 p-4 gap-4 overflow-hidden">

               <div className="flex-1 bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden relative">

                  {/* Calendar Toolbar */}
                  <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/10 h-16">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                           <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button>
                           <h2 className="text-base font-bold text-slate-900 dark:text-white w-32 text-center select-none">{monthLabel}</h2>
                           <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                        <button onClick={jumpToday} className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-200">Today</button>
                     </div>

                     <div className="flex gap-2 items-center">
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                           {['single', 'range', 'multi'].map((m) => (
                              <button
                                 key={m}
                                 onClick={() => { setMode(m as any); setRange({ start: "", end: "" }); setMultiDates([]); }}
                                 className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all ${mode === m
                                    ? "bg-white dark:bg-[#222] shadow-sm text-indigo-600 dark:text-indigo-300"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                              >
                                 {m}
                              </button>
                           ))}
                        </div>
                        {(range.start || multiDates.length > 0) && (
                           <button onClick={() => { setMultiDates([]); setRange({ start: "", end: "" }); }} className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                        )}
                     </div>
                  </div>

                  {/* Grid */}
                  <div className="flex-1 p-4 overflow-y-auto">
                     <div className="grid grid-cols-7 gap-1 h-full content-start auto-rows-fr">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                           <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                              {d}
                           </div>
                        ))}
                        {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}

                        {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                           const day = i + 1;
                           const y = calendarData.year;
                           const m = calendarData.month + 1;
                           const dateStr = `${y}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
                           const holiday = COMPANY_CONFIG.holidays.find(h => h.date === dateStr);
                           const existing = COMPANY_CONFIG.history.find(r => r.date === dateStr);
                           const isWeekend = new Date(y, calendarData.month, day).getDay() % 6 === 0;

                           let isSelected = false, inRange = false;
                           if (mode === "multi") isSelected = multiDates.includes(dateStr);
                           else {
                              isSelected = range.start === dateStr || range.end === dateStr;
                              // Fix: Handle single day selection in range mode visually
                              inRange = Boolean(range.start && range.end && dateStr > range.start && dateStr < range.end);
                           }

                           let btnClass = "border border-slate-100 dark:border-white/5 bg-white dark:bg-[#151515] text-slate-600 dark:text-slate-400 hover:border-indigo-300";
                           let label = null;
                           let isDisabled = false;

                           if (existing) {
                              if (existing.status === 'approved') {
                                 btnClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 opacity-60";
                                 label = <span className="flex items-center gap-1"><CheckCircle2 className="h-2 w-2" /> {existing.label}</span>;
                                 isDisabled = true;
                              } else if (existing.status === 'pending') {
                                 btnClass = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 opacity-80";
                                 label = <span className="flex items-center gap-1"><Clock className="h-2 w-2" /> {existing.label}</span>;
                                 isDisabled = true;
                              } else if (existing.status === 'rejected') {
                                 btnClass = isSelected ? "bg-indigo-600 text-white" : "bg-rose-50 dark:bg-rose-900/10 border-rose-200 text-rose-700 dark:text-rose-400 cursor-pointer hover:border-rose-400";
                                 label = !isSelected ? <span className="flex items-center gap-1"><RotateCcw className="h-2 w-2" /> Retry</span> : null;
                                 isDisabled = false;
                              }
                           } else if (isSelected) {
                              btnClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 z-10 border-indigo-600";
                           } else if (inRange) {
                              btnClass = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800";
                           } else if (holiday) {
                              btnClass = "bg-rose-50 dark:bg-rose-900/10 border-rose-100 text-rose-600";
                              label = holiday.name;
                           } else if (isWeekend) {
                              btnClass = "bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 border-transparent";
                           }

                           return (
                              <button
                                 key={day}
                                 onClick={() => handleDateClick(day)}
                                 disabled={isDisabled}
                                 className={`relative min-h-[3.5rem] w-full rounded-lg text-left p-1.5 transition-all group duration-200 ${btnClass}`}
                              >
                                 <span className={`text-xs font-bold leading-none ${isSelected ? 'text-white' : ''}`}>{day}</span>
                                 {label && <span className={`absolute bottom-1 left-1 right-1 text-[8px] font-bold px-1 rounded truncate ${isSelected ? 'bg-white/20 text-white' : 'bg-white/60 dark:bg-black/40'}`}>{label}</span>}
                                 {isSelected && <span className="absolute top-1.5 right-1.5"><Sparkles className="h-2.5 w-2.5 text-indigo-200 animate-pulse" /></span>}
                              </button>
                           )
                        })}
                     </div>
                  </div>

                  <div className="flex-none px-5 py-2 border-t border-slate-100 dark:border-white/10 flex gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Approved</div>
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Pending</div>
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Rejected (Click to Retry)</div>
                  </div>
               </div>
            </div>

            {/* RIGHT: SIDEBAR */}
            <div className="w-[360px] flex flex-col p-4 pl-0 gap-4 min-w-0 z-20">
               <div className="flex-1 bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col overflow-hidden min-h-0">

                  {/* Header */}
                  <div className="flex-none p-4 border-b border-slate-100 dark:border-white/10 space-y-3">
                     <div className="relative" ref={dropdownRef}>
                        <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block tracking-wider">Leave Type</label>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 hover:border-indigo-400 transition-all shadow-sm">
                           <div className="flex items-center gap-3"><div className={`p-1.5 rounded-lg ${selectedType.bg} ${selectedType.color}`}><selectedType.icon className="h-3.5 w-3.5" /></div><span className="text-sm font-bold text-slate-800 dark:text-white">{selectedType.label}</span></div>
                           <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                           <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                              {COMPANY_CONFIG.leaveTypes.map(t => (
                                 <button key={t.id} onClick={() => { setTypeId(t.id); setIsDropdownOpen(false); }} className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg group transition-colors">
                                    <div className="flex items-center gap-3"><div className={`p-1.5 rounded-lg ${t.bg} ${t.color}`}><t.icon className="h-3.5 w-3.5" /></div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.label}</span></div>
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">{t.balance}</span>
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>

                     <div className="flex justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-xl items-center border border-slate-100 dark:border-white/5">
                        <div className="text-center w-1/2 border-r border-slate-200 dark:border-white/10 pr-2"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Days</p><p className="text-lg font-black text-slate-900 dark:text-white mt-1">{stats.days}</p></div>
                        <div className="text-center w-1/2 pl-2"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deduction</p><p className="text-lg font-black text-rose-500 mt-1">-{stats.deduction}</p></div>
                     </div>
                  </div>

                  {/* Form Body */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                     {stats.projection > 0 && <div className="flex items-center gap-2 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded-lg border border-blue-100 dark:border-blue-800/30"><RefreshCcw className="h-3.5 w-3.5" /><span>Projected accrual: <strong>+{stats.projection} days</strong></span></div>}

                     {stats.sandwichWarning && <div className="flex items-start gap-2 text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-2 rounded-lg border border-amber-100 dark:border-amber-800/30 animate-in fade-in"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span><strong>Policy Alert:</strong> Weekends bridged.</span></div>}

                     {isCoverRequired && (
                        <div className="animate-in slide-in-from-right-4">
                           <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block tracking-wider">Delegate To <span className="text-rose-500">* Required</span></label>
                           <div className="relative">
                              <select value={coverId} onChange={(e) => setCoverId(e.target.value)} className="w-full appearance-none bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                 <option value="">Select colleague...</option>
                                 {COMPANY_CONFIG.colleagues.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                              </select>
                              <User className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 mb-2 block tracking-wider">Reason</label>
                        <textarea
                           className="w-full h-20 rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-black outline-none resize-none placeholder:text-slate-400"
                           placeholder="Context..."
                           value={reason}
                           onChange={(e) => setReason(e.target.value)}
                        />
                     </div>

                     {selectedType.requiresDoc && (
                        <div className="animate-in zoom-in-95">
                           <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block flex justify-between tracking-wider"><span>Proof</span> <span className="text-rose-500 dark:text-rose-400">* Required</span></label>
                           <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl h-12 flex items-center justify-center cursor-pointer transition-all gap-2 ${file ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-white/10 hover:border-indigo-400"}`}>
                              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                              {file ? <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> {file.name.slice(0, 15)}...</span> : <div className="flex items-center gap-2 text-slate-400"><UploadCloud className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold">Upload</span></div>}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="flex-none p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 space-y-3">
                     <div>
                        <p className="text-[8px] font-bold uppercase text-slate-400 mb-2 tracking-wider">Review Chain</p>
                        <div className="flex items-center gap-2">
                           {COMPANY_CONFIG.approvers.map((p, i) => (
                              <React.Fragment key={i}>
                                 <div className="flex items-center gap-2 bg-white dark:bg-[#151515] px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm flex-1 min-w-0">
                                    <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">{p.avatar}</div>
                                    <div className="truncate"><p className="text-[9px] font-bold text-slate-900 dark:text-white truncate">{p.name}</p></div>
                                 </div>
                                 {i < COMPANY_CONFIG.approvers.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                              </React.Fragment>
                           ))}
                        </div>
                     </div>
                     <button
                        disabled={isBtnDisabled}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group ${!isBtnDisabled ? "bg-slate-900 dark:bg-indigo-600 text-white hover:scale-[1.02]" : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"}`}
                     >
                        {btnText}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}