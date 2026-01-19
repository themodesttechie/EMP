"use client";

import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import PageHeader from "@/components/common/PageHeader";
import { ChevronLeft, ChevronRight, Plus, Trash2, Copy, Check, Save } from "lucide-react";

/* ---------------- TYPES ---------------- */
type EntryType = "WORK" | "LEAVE" | "HOLIDAY";
type Status = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

interface DayEntry {
    id: string;
    project: string;
    type: EntryType;
    hours: number;
    notes: string;
}

interface WeeklyTimesheet {
    weekStart: string;
    status: Status;
    entries: Record<string, DayEntry[]>;
}

/* ---------------- HELPERS ---------------- */
const startOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const addDays = (d: Date, days: number) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
};

export default function TimesheetPage() {
    const today = new Date();
    const [weekStart, setWeekStart] = useState(startOfWeek(today));
    const [timesheet, setTimesheet] = useState<WeeklyTimesheet>({
        weekStart: formatDate(startOfWeek(today)),
        status: "DRAFT",
        entries: {},
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    const isEditable = timesheet.status === "DRAFT";

    // Generate Days
    const days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(weekStart, i);
            return {
                label: d.toLocaleDateString("en-US", { weekday: "short" }),
                fullLabel: d.toLocaleDateString("en-US", { weekday: "long", year: 'numeric', month: 'long', day: 'numeric' }),
                date: formatDate(d),
                day: d.getDate(),
                isToday: formatDate(d) === formatDate(today),
            };
        });
    }, [weekStart]);

    // Calculate Total Hours
    const totalHours = useMemo(() => {
        let total = 0;
        Object.values(timesheet.entries).forEach(dayEntries => {
            dayEntries.forEach(e => {
                if (e.type === "WORK") total += e.hours;
            });
        });
        return total;
    }, [timesheet]);

    /* ---------------- ACTIONS ---------------- */
    const updateEntry = (date: string, id: string, field: keyof DayEntry, value: any) => {
        setTimesheet((prev) => ({
            ...prev,
            entries: {
                ...prev.entries,
                [date]: prev.entries[date].map((e) => e.id === id ? { ...e, [field]: value } : e),
            },
        }));
    };

    const addEntry = (date: string) => {
        setTimesheet((prev) => ({
            ...prev,
            entries: {
                ...prev.entries,
                [date]: [...(prev.entries[date] || []), { id: crypto.randomUUID(), project: "Internal", type: "WORK", hours: 8, notes: "" }],
            },
        }));
    };

    const deleteEntry = (date: string, id: string) => {
        setTimesheet((prev) => ({
            ...prev,
            entries: {
                ...prev.entries,
                [date]: prev.entries[date].filter((e) => e.id !== id),
            },
        }));
    };

    const handleSubmit = () => {
        setTimesheet(prev => ({ ...prev, status: "SUBMITTED" }));
        setIsSubmitModalOpen(false);
    };

    return (
        <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <PageHeader
                    title="Weekly Timesheet"
                    subtitle="Log your work hours and submit for approval."
                    breadcrumbs={[{ label: "Time Management" }, { label: "Timesheet" }]}
                />
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Total Hours</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalHours}h</p>
                    </div>
                    <button
                        disabled={!isEditable}
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                    >
                        {timesheet.status === "SUBMITTED" ? <Check size={18} /> : <Save size={18} />}
                        {timesheet.status === "SUBMITTED" ? "Submitted" : "Submit Week"}
                    </button>
                </div>
            </div>

            {/* Navigation & Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center gap-4">
                    <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800 transition-colors"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-white text-lg">{days[0].label} {days[0].day}</span>
                        <span className="text-gray-400">-</span>
                        <span className="font-semibold text-gray-800 dark:text-white text-lg">{days[6].label} {days[6].day}</span>
                    </div>
                    <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800 transition-colors"><ChevronRight size={20} /></button>
                </div>

                {isEditable && (
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                        <Copy size={16} /> Copy from previous week
                    </button>
                )}
            </div>

            {/* Premium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-0 border border-gray-200 rounded-2xl bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
                {days.map((d) => (
                    <div
                        key={d.date}
                        className={`min-h-[160px] p-4 flex flex-col group transition-colors md:border-r border-b md:border-b-0 border-gray-100 dark:border-gray-800 last:border-r-0 ${d.isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-sm font-medium ${d.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>{d.label}</span>
                            <div className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold ${d.isToday ? 'bg-blue-600 text-white' : 'text-gray-800 dark:text-white'}`}>{d.day}</div>
                        </div>

                        <div className="flex-1 space-y-2">
                            {(timesheet.entries[d.date] || []).map(e => (
                                <div key={e.id} onClick={() => isEditable && setSelectedDate(d.date)} className="cursor-pointer text-xs p-2 rounded border border-gray-200 bg-gray-50 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 transition-all">
                                    <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{e.project}</div>
                                    <div className="text-gray-500">{e.hours} hrs</div>
                                </div>
                            ))}
                            {(!timesheet.entries[d.date] || timesheet.entries[d.date].length === 0) && (
                                <div className="h-full flex items-center justify-center">
                                    {isEditable && (
                                        <button onClick={() => { setSelectedDate(d.date); addEntry(d.date); }} className="md:opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                                            <Plus size={20} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {isEditable && (timesheet.entries[d.date]?.length > 0) && (
                            <button onClick={() => setSelectedDate(d.date)} className="mt-2 w-full text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 hover:underline transition-opacity">
                                Edit Entries
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Entry Edit Modal */}
            <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} className="max-w-lg p-6">
                {selectedDate && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600"><Plus size={24} className="rotate-45" /></button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {(timesheet.entries[selectedDate] || []).map((e) => (
                                <div key={e.id} className="group relative rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Project</label>
                                            <select
                                                value={e.project}
                                                onChange={(ev) => updateEntry(selectedDate, e.id, "project", ev.target.value)}
                                                className="mt-1 w-full rounded-lg border-gray-300 bg-white py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
                                            >
                                                <option>Internal</option>
                                                <option>Client Project A</option>
                                                <option>Client Project B</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">Hours</label>
                                            <input
                                                type="number"
                                                value={e.hours}
                                                onChange={(ev) => updateEntry(selectedDate, e.id, "hours", Number(ev.target.value))}
                                                className="mt-1 w-full rounded-lg border-gray-300 bg-white py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        placeholder="Description of work..."
                                        value={e.notes}
                                        onChange={(ev) => updateEntry(selectedDate, e.id, "notes", ev.target.value)}
                                        className="w-full rounded-lg border-gray-300 bg-white py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                                        rows={2}
                                    ></textarea>

                                    <button
                                        onClick={() => deleteEntry(selectedDate, e.id)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => addEntry(selectedDate)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            <Plus size={16} /> Add Another Entry
                        </button>
                    </>
                )}
            </Modal>

            {/* Submit Confirmation Modal */}
            <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} className="max-w-sm p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4 dark:bg-blue-900/30 dark:text-blue-400">
                    <Save size={32} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">Submit Timesheet?</h3>
                <p className="mb-6 text-sm text-gray-500">
                    Are you sure you want to submit <strong>{totalHours} hours</strong> for this week? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setIsSubmitModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Yes, Submit</button>
                </div>
            </Modal>
        </div>
    );
}
