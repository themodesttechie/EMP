"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, Copy, 
  Check, Save, Wand2, Calendar, Lock, Palmtree, 
  AlertTriangle, X, History, Clock, ChevronDown, 
  Briefcase, ArrowRight, PieChart, Loader2, Search, Zap, Coffee
} from "lucide-react";

/* ---------------- 1. CONFIGURATION ---------------- */
const HOLIDAYS = ["2026-01-26"]; 
const APPROVED_LEAVES = ["2026-01-27"]; 
const NON_WORKING_DAYS = [0, 6]; 

const PROJECTS = [
    { id: "p1", name: "Internal / Admin", code: "INT-001", color: "bg-slate-500", billable: false },
    { id: "p2", name: "Acme Corp: Website Redesign", code: "ACM-102", color: "bg-blue-600", billable: true },
    { id: "p3", name: "Globex: Mobile App MVP", code: "GLO-404", color: "bg-indigo-600", billable: true },
    { id: "p4", name: "Stark Ind: AI Consulting", code: "STK-999", color: "bg-amber-600", billable: true },
    { id: "p5", name: "Cyberdyne: Security Audit", code: "CYB-800", color: "bg-red-600", billable: true },
    { id: "p6", name: "Wayne Ent: Cloud Migration", code: "WAY-007", color: "bg-emerald-600", billable: true },
];

/* ---------------- 2. TYPES ---------------- */
type Status = "DRAFT" | "SUBMITTED" | "APPROVED";

interface DayEntry {
    id: string;
    projectId: string;
    hours: number;
    minutes: number;
    notes: string;
}

interface WeekData {
    status: Status;
    lastSaved: Date | null;
    entries: Record<string, DayEntry[]>;
}

type TimesheetDB = Record<string, WeekData>;

/* ---------------- 3. HELPERS ---------------- */
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, days: number) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
};
const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};
const formatDuration = (h: number, m: number) => {
    if (h === 0 && m === 0) return "0h";
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
const getDayStatus = (dateStr: string, dayIndex: number) => { 
    const isHoliday = HOLIDAYS.includes(dateStr);
    const isLeave = APPROVED_LEAVES.includes(dateStr);
    const isWeekend = NON_WORKING_DAYS.includes(dayIndex);
    return { isNonStandard: isHoliday || isLeave || isWeekend, isHoliday, isLeave, isWeekend };
};

/* ---------------- 4. COMPONENT: PROJECT SELECTOR ---------------- */
const ProjectSelector = ({ value, onChange }: { value: string, onChange: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedProject = PROJECTS.find(p => p.id === value);

    const filteredProjects = useMemo(() => {
        if (!search) return PROJECTS;
        return PROJECTS.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase()) || 
            p.code.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Project</label>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium flex justify-between items-center hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedProject?.color}`} />
                    <span className="truncate">{selectedProject ? `${selectedProject.code} - ${selectedProject.name}` : "Select Project"}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input autoFocus type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredProjects.map(p => (
                            <button key={p.id} onClick={() => { onChange(p.id); setIsOpen(false); setSearch(""); }} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${value === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.color}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                                </div>
                                {value === p.id && <Check size={14} className="text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------- 5. MAIN COMPONENT ---------------- */
export default function CompleteTimesheet() {
    const today = new Date("2026-01-26"); 
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today));
    const [db, setDb] = useState<TimesheetDB>({});

    const [selectedDate, setSelectedDate] = useState<string | null>(null); 
    const [activeMenu, setActiveMenu] = useState<'import' | 'history' | null>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const currentWeekKey = formatDate(currentWeekStart);
    const currentData = db[currentWeekKey] || { status: "DRAFT", lastSaved: null, entries: {} };
    const isLocked = currentData.status !== "DRAFT";

    // --- SEED MOCK HISTORY ---
    useEffect(() => {
        const mockDb: TimesheetDB = {};
        for (let i = 0; i < 4; i++) {
            const pastDate = addDays(startOfWeek(today), -(i * 7));
            const key = formatDate(pastDate);
            const entries: Record<string, DayEntry[]> = {};
            for(let j=0; j<5; j++) {
                const dStr = formatDate(addDays(pastDate, j));
                entries[dStr] = [{ id: crypto.randomUUID(), projectId: PROJECTS[1].id, hours: 8, minutes: 0, notes: "Past work" }];
            }
            mockDb[key] = { status: i > 0 ? "SUBMITTED" : "DRAFT", lastSaved: new Date(), entries };
        }
        setDb(mockDb);
    }, []);

    // Menu click outside
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null); };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Helper: Toast Timer
    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
    }, [toast]);

    /* --- DATA CALCULATIONS --- */
    const days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(currentWeekStart, i);
            const dateStr = formatDate(d);
            const status = getDayStatus(dateStr, d.getDay());
            return {
                label: d.toLocaleDateString("en-US", { weekday: "short" }),
                fullLabel: d.toLocaleDateString("en-US", { weekday: "long", month: 'short', day: 'numeric' }),
                date: dateStr,
                dayNum: d.getDate(),
                ...status,
                entries: currentData.entries[dateStr] || []
            };
        });
    }, [currentWeekStart, currentData]);

    const { stats, projectSummary } = useMemo(() => {
        let totalMins = 0;
        let billableMins = 0;
        const summary: Record<string, number> = {};

        Object.values(currentData.entries).forEach(dayEntries => {
            dayEntries.forEach(e => {
                const mins = (e.hours * 60) + e.minutes;
                totalMins += mins;
                if (PROJECTS.find(p => p.id === e.projectId)?.billable) billableMins += mins;
                summary[e.projectId] = (summary[e.projectId] || 0) + mins;
            });
        });

        return { 
            stats: { 
                total: (totalMins / 60).toFixed(1), 
                billable: (billableMins / 60).toFixed(1),
                utilization: Math.min(100, (totalMins / 2400) * 100)
            },
            projectSummary: summary
        };
    }, [currentData]);

    const updateDb = (fn: (prev: TimesheetDB) => TimesheetDB) => setDb(prev => fn(prev));

    /* --- ACTIONS --- */
    const handleSmartFill = () => {
        if (isLocked) { setToast({ type: 'error', msg: "Week is locked" }); return; }
        const newEntries = { ...currentData.entries };
        let count = 0;
        days.forEach(d => {
            if (d.isNonStandard) return; // Skip weekends/holidays
            if (!newEntries[d.date] || newEntries[d.date].length === 0) {
                newEntries[d.date] = [{ id: crypto.randomUUID(), projectId: PROJECTS[0].id, hours: 8, minutes: 0, notes: "Standard Hours" }];
                count++;
            }
        });
        updateDb(prev => ({ ...prev, [currentWeekKey]: { ...currentData, entries: newEntries } }));
        setToast({ type: 'success', msg: `Filled ${count} standard days` });
    };

    const handleCopyWeek = (sourceWeekKey: string) => {
        if (isLocked) return;
        const sourceEntries = db[sourceWeekKey]?.entries || {};
        const newEntries: Record<string, DayEntry[]> = {};
        days.forEach((day, index) => {
            if (day.isHoliday || day.isLeave) return; 
            const sourceDate = addDays(new Date(sourceWeekKey), index);
            const sourceDayEntries = sourceEntries[formatDate(sourceDate)] || [];
            if (sourceDayEntries.length > 0) newEntries[day.date] = sourceDayEntries.map(e => ({ ...e, id: crypto.randomUUID() }));
        });
        updateDb(prev => ({ ...prev, [currentWeekKey]: { ...currentData, entries: newEntries } }));
        setActiveMenu(null);
        setToast({ type: 'success', msg: "Imported valid entries" });
    };

    const handleSubmit = () => {
        const exceptionEntries = days.filter(d => d.isNonStandard && d.entries.length > 0);
        if (exceptionEntries.length > 0) {
            if(!confirm(`You have logged hours on ${exceptionEntries.length} non-working days. Submit anyway?`)) {
                setIsSubmitModalOpen(false); return;
            }
        }
        updateDb(prev => ({ ...prev, [currentWeekKey]: { ...currentData, status: "SUBMITTED" } }));
        setIsSubmitModalOpen(false);
        setToast({ type: 'success', msg: "Timesheet Submitted" });
    };

    const handleClearDay = (dateStr: string) => {
        if (isLocked) return;
        if (confirm("Clear all entries for this day?")) {
            updateDb(prev => {
                const week = prev[currentWeekKey];
                const newEntries = { ...week.entries };
                delete newEntries[dateStr];
                return { ...prev, [currentWeekKey]: { ...week, entries: newEntries } };
            });
        }
    };

    const handleCopyDayToNext = (dateStr: string) => {
        if (isLocked) return;
        const sourceEntries = currentData.entries[dateStr] || [];
        if (sourceEntries.length === 0) return;

        const nextDay = addDays(new Date(dateStr), 1);
        const nextDayStr = formatDate(nextDay);
        
        // Soft Check for Governance
        const status = getDayStatus(nextDayStr, nextDay.getDay());
        if(status.isNonStandard) setToast({ type: 'info', msg: "Copying to a non-working day" });

        const clonedEntries = sourceEntries.map(e => ({ ...e, id: crypto.randomUUID() }));
        
        updateDb(prev => {
            const week = prev[currentWeekKey];
            const targetEntries = [...(week.entries[nextDayStr] || []), ...clonedEntries];
            return {
                ...prev,
                [currentWeekKey]: { ...week, entries: { ...week.entries, [nextDayStr]: targetEntries } }
            };
        });
        setToast({ type: 'success', msg: "Copied successfully" });
    };

    /* --- ENTRY CRUD --- */
    const addEntry = (date: string) => {
        const status = getDayStatus(date, new Date(date).getDay());
        if (status.isHoliday) setToast({ type: 'info', msg: "Logging Overtime on Holiday" });
        const newEntry = { id: crypto.randomUUID(), projectId: PROJECTS[0].id, hours: 0, minutes: 0, notes: "" };
        updateDb(prev => {
            const week = prev[currentWeekKey] || { status: 'DRAFT', entries: {} };
            return { ...prev, [currentWeekKey]: { ...week, entries: { ...week.entries, [date]: [...(week.entries[date] || []), newEntry] } } };
        });
    };

    const updateEntry = (date: string, id: string, field: keyof DayEntry, val: any) => {
        let cleanVal = val;
        if (field === 'hours') cleanVal = Math.max(0, parseInt(val) || 0);
        if (field === 'minutes') cleanVal = Math.max(0, Math.min(59, parseInt(val) || 0));
        updateDb(prev => {
            const week = prev[currentWeekKey];
            const updated = week.entries[date].map(e => e.id === id ? { ...e, [field]: cleanVal } : e);
            return { ...prev, [currentWeekKey]: { ...week, entries: { ...week.entries, [date]: updated } } };
        });
    };

    const deleteEntry = (date: string, id: string) => {
        updateDb(prev => {
            const week = prev[currentWeekKey];
            return { ...prev, [currentWeekKey]: { ...week, entries: { ...week.entries, [date]: week.entries[date].filter(e => e.id !== id) } } };
        });
    };

    const duplicateEntry = (date: string, entry: DayEntry) => {
        const newEntry = { ...entry, id: crypto.randomUUID() };
        updateDb(prev => {
            const week = prev[currentWeekKey];
            return { ...prev, [currentWeekKey]: { ...week, entries: { ...week.entries, [date]: [...(week.entries[date] || []), newEntry] } } };
        });
        setToast({ type: 'success', msg: "Entry Duplicated" });
    };

    const addTime = (date: string, id: string, minsToAdd: number) => {
        const entry = currentData.entries[date]?.find(e => e.id === id);
        if (!entry) return;
        let totalMins = (entry.hours * 60) + entry.minutes + minsToAdd;
        const newH = Math.floor(totalMins / 60);
        const newM = totalMins % 60;
        updateDb(prev => {
            const week = prev[currentWeekKey];
            const updated = week.entries[date].map(e => e.id === id ? { ...e, hours: newH, minutes: newM } : e);
            return { ...prev, [currentWeekKey]: { ...week, entries: { ...week.entries, [date]: updated } } };
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans pb-32">
            
            {/* 1. HEADER */}
            <div className="bg-white dark:bg-[#11151F] border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg"><Clock size={20} /></div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">Timesheet</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${currentData.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{currentData.status}</span>
                                {currentData.lastSaved && <span className="text-xs text-slate-400">Saved {currentData.lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"><ChevronLeft size={16}/></button>
                        <div className="px-4 text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">{days[0].date} - {days[6].date}</div>
                        <button onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all"><ChevronRight size={16}/></button>
                    </div>

                    <div className="flex items-center gap-2" ref={menuRef}>
                        <div className="relative">
                            <button onClick={() => setActiveMenu(activeMenu === 'import' ? null : 'import')} disabled={isLocked} className={`hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all ${isLocked ? 'opacity-50' : 'hover:border-blue-500'}`}>
                                <Copy size={14} className="text-blue-500" /> Copy <ChevronDown size={12} />
                            </button>
                            {activeMenu === 'import' && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#11151F] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="p-3 bg-slate-50 text-[10px] font-black uppercase text-slate-400">Past 3 Months</div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {Array.from({ length: 12 }).map((_, i) => {
                                            const d = addDays(currentWeekStart, -(i + 1) * 7);
                                            const dStr = formatDate(d);
                                            const hasData = db[dStr] && Object.keys(db[dStr].entries).length > 0;
                                            return (
                                                <button key={i} onClick={() => handleCopyWeek(dStr)} disabled={!hasData} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs font-medium border-b border-slate-50 flex justify-between disabled:opacity-50">
                                                    <span>{d.toLocaleDateString()}</span> {hasData && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 rounded">Data</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleSmartFill} disabled={isLocked} className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-all ${isLocked ? 'opacity-50' : 'hover:border-purple-500'}`}>
                            <Wand2 size={14} className="text-purple-500" /> Smart Fill
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. DASHBOARD */}
            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#11151F] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Total Hours</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black dark:text-white">{stats.total}</span>
                        <span className="text-lg font-bold text-slate-400 mb-1">/ 40h</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${stats.utilization > 100 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${stats.utilization}%` }} />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-[#11151F] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Project Distribution</h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {PROJECTS.map(p => {
                            const mins = projectSummary[p.id] || 0;
                            const hours = (mins / 60).toFixed(1);
                            
                            // Calculate percentage share of total hours for the bar
                            const totalWeekMins = Object.values(projectSummary).reduce((a, b) => a + b, 0);
                            const share = totalWeekMins > 0 ? (mins / totalWeekMins) * 100 : 0;

                            if (mins === 0) return null;
                            return (
                                <div key={p.id} className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 min-w-[160px]">
                                    <div className="flex items-center gap-2 mb-2"><div className={`w-2 h-2 rounded-full ${p.color}`} /><span className="text-[10px] font-bold text-slate-500 truncate">{p.code}</span></div>
                                    <div className="text-lg font-bold dark:text-white">{hours}h</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[120px] mb-2">{p.name}</div>
                                    {/* VISUAL BAR */}
                                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${p.color}`} style={{ width: `${share}%` }} />
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-1 text-right">{Math.round(share)}% of week</div>
                                </div>
                            )
                        })}
                        {Object.keys(projectSummary).length === 0 && <div className="text-xs text-slate-400 italic">No time logged yet.</div>}
                    </div>
                </div>
            </div>

            {/* 3. GRID */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((d) => {
                    const totalMins = d.entries.reduce((a, b) => a + (b.hours * 60) + b.minutes, 0);
                    const totalHours = Math.floor(totalMins / 60);
                    const totalMinutes = totalMins % 60;
                    
                    return (
                        <div 
                            key={d.date}
                            onClick={() => !isLocked && setSelectedDate(d.date)}
                            className={`
                                relative min-h-[240px] rounded-2xl border transition-all duration-300 flex flex-col group cursor-pointer
                                ${isLocked ? "cursor-default opacity-80" : "hover:shadow-lg"}
                                ${d.isHoliday ? "bg-purple-50/30 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800" : d.isLeave ? "bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800" : d.isWeekend ? "bg-slate-50/50 border-slate-200 dark:bg-slate-800/30 dark:border-slate-800" : "bg-white dark:bg-[#11151F] border-slate-200 dark:border-slate-800 hover:border-blue-400"}
                                ${totalMins > 0 && d.isNonStandard ? "ring-1 ring-amber-400 border-amber-400" : ""}
                            `}
                        >
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center rounded-t-2xl">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-slate-400">{d.label}</div>
                                    <div className={`text-xl font-black ${d.isNonStandard ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>{d.dayNum}</div>
                                </div>
                                {d.isHoliday && <Lock size={16} className="text-purple-400" />}
                                {d.isLeave && <Palmtree size={16} className="text-amber-400" />}
                                {d.isWeekend && <Coffee size={16} className="text-slate-300" />}
                                {totalMins > 0 && <span className={`text-[10px] font-black px-2 py-0.5 rounded ${d.isNonStandard ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{formatDuration(totalHours, totalMinutes)}</span>}
                            </div>
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                                {d.entries.length === 0 && d.isNonStandard && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300"><span className="text-[9px] font-bold uppercase tracking-widest text-center opacity-60">{d.isHoliday ? "Holiday" : d.isLeave ? "On Leave" : "Weekend"}</span></div>
                                )}
                                {d.entries.map(e => {
                                    const proj = PROJECTS.find(p => p.id === e.projectId);
                                    return (
                                        <div key={e.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex justify-between mb-1"><div className={`w-1.5 h-1.5 rounded-full ${proj?.color}`} /><span className="text-[10px] font-bold">{formatDuration(e.hours, e.minutes)}</span></div>
                                            <p className="text-[10px] text-slate-500 font-medium truncate">{proj?.code}</p>
                                        </div>
                                    )
                                })}
                                {!isLocked && d.entries.length === 0 && !d.isNonStandard && (
                                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><Plus size={16} /></div></div>
                                )}
                            </div>

                            {/* --- RESTORED FOOTER ACTIONS --- */}
                            {!isLocked && (
                                <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50/30 dark:bg-slate-900/30">
                                    <button onClick={(e) => { e.stopPropagation(); handleClearDay(d.date); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Clear Day"><Trash2 size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleCopyDayToNext(d.date); }} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Copy to Next Day"><ArrowRight size={14} /></button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* 4. FOOTER */}
            <div className="fixed bottom-0 w-full bg-white dark:bg-[#11151F] border-t border-slate-200 dark:border-slate-800 p-4 z-40 flex justify-center items-center gap-4 shadow-lg">
                {isLocked ? (
                    <button onClick={() => setDb(prev => ({...prev, [currentWeekKey]: {...currentData, status: 'DRAFT'}}))} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"><Lock size={16} /> Submitted - Withdraw</button>
                ) : (
                    <>
                        <button onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); setToast({type: 'success', msg: 'Draft Saved'}); }, 500); }} disabled={isSaving} className="px-8 py-3 rounded-full font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Draft</button>
                        <button onClick={() => setIsSubmitModalOpen(true)} disabled={stats.total === "0.0"} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"><Check size={18} /> Submit Timesheet</button>
                    </>
                )}
            </div>

            {/* --- SLIDE-OVER DRAWER --- */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-[#11151F] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long' })}</h2>
                                <p className="text-sm font-medium text-slate-500">{selectedDate}</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-4">
                                {(currentData.entries[selectedDate] || []).map((e, idx) => (
                                    <div key={e.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-400 transition-colors relative">
                                        <div className="mb-4">
                                            <ProjectSelector value={e.projectId} onChange={(pid) => updateEntry(selectedDate, e.id, 'projectId', pid)} />
                                        </div>
                                        <div className="flex gap-3 mb-4">
                                            <div className="w-20"><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Hrs</label><input type="number" min="0" max="23" value={e.hours} onChange={(ev) => updateEntry(selectedDate, e.id, 'hours', ev.target.value)} className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 focus:border-blue-500 outline-none" /></div>
                                            <div className="w-20"><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Mins</label><input type="number" min="0" max="59" value={e.minutes} onChange={(ev) => updateEntry(selectedDate, e.id, 'minutes', ev.target.value)} className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 focus:border-blue-500 outline-none" /></div>
                                            
                                            {/* Quick Time Chips */}
                                            <div className="flex items-end gap-1 pb-1">
                                                <button onClick={() => addTime(selectedDate, e.id, 15)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold">+15m</button>
                                                <button onClick={() => addTime(selectedDate, e.id, 60)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold">+1h</button>
                                            </div>
                                        </div>
                                        <input type="text" placeholder="Work description..." value={e.notes} onChange={(ev) => updateEntry(selectedDate, e.id, 'notes', ev.target.value)} className="w-full text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
                                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => duplicateEntry(selectedDate, e)} className="bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-500 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700"><Copy size={14} /></button>
                                            <button onClick={() => deleteEntry(selectedDate, e.id)} className="bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addEntry(selectedDate)} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"><Plus size={20} /> Add Activity</button>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                             <button onClick={() => setSelectedDate(null)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOAST --- */}
            {toast && (
                <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {toast.type === 'success' ? <Check size={18} /> : toast.type === 'error' ? <AlertTriangle size={18} /> : <Zap size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* --- SUBMIT MODAL --- */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Submission</h3>
                        <p className="text-sm text-slate-500 mb-6">Lock week of <strong>{currentWeekKey}</strong>? Total: <strong>{stats.total}h</strong>.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setIsSubmitModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}