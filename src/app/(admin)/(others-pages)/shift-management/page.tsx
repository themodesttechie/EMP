"use client";

import React from "react";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const shifts = [
    { id: 1, employee: "John Doe", mon: "Morning", tue: "Morning", wed: "Morning", thu: "Off", fri: "Night", sat: "Night", sun: "Off" },
    { id: 2, employee: "Jane Smith", mon: "Evening", tue: "Evening", wed: "Evening", thu: "Evening", fri: "Evening", sat: "Off", sun: "Off" },
    { id: 3, employee: "Mike Ross", mon: "Night", tue: "Night", wed: "Off", thu: "Morning", fri: "Morning", sat: "Morning", sun: "Off" },
    { id: 4, employee: "Rachel Green", mon: "Off", tue: "Morning", wed: "Morning", thu: "Morning", fri: "Morning", sat: "Morning", sun: "Off" },
];

const getShiftColor = (shift: string) => {
    switch (shift) {
        case "Morning": return "blue";
        case "Evening": return "orange";
        case "Night": return "purple";
        case "Off": return "gray";
        default: return "blue";
    }
};

const getBadgeColor = (shift: string) => {
    switch (shift) {
        case "Morning": return "info";
        case "Evening": return "warning";
        case "Night": return "primary";
        case "Off": return "light";
        default: return "light";
    }
};

export default function ShiftManagementPage() {
    return (
        <div className="mx-auto max-w-full">
            <PageHeader
                title="Shift Management"
                subtitle="Weekly shift roster for employees."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Shift Management" },
                ]}
            >
                <div className="flex items-center gap-2">
                    <button className="p-2 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="text-sm font-medium">Feb 17 - Feb 23, 2025</span>
                    <button className="p-2 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </PageHeader>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Employee</th>
                                <th className="px-6 py-4 text-center">Mon <br /><span className="text-xs text-gray-400 font-normal">17</span></th>
                                <th className="px-6 py-4 text-center">Tue <br /><span className="text-xs text-gray-400 font-normal">18</span></th>
                                <th className="px-6 py-4 text-center">Wed <br /><span className="text-xs text-gray-400 font-normal">19</span></th>
                                <th className="px-6 py-4 text-center">Thu <br /><span className="text-xs text-gray-400 font-normal">20</span></th>
                                <th className="px-6 py-4 text-center">Fri <br /><span className="text-xs text-gray-400 font-normal">21</span></th>
                                <th className="px-6 py-4 text-center">Sat <br /><span className="text-xs text-gray-400 font-normal">22</span></th>
                                <th className="px-6 py-4 text-center">Sun <br /><span className="text-xs text-gray-400 font-normal">23</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {shifts.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10">
                                        {row.employee}
                                    </td>
                                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                                        <td key={day} className="px-6 py-4 text-center">
                                            <Badge color={getBadgeColor((row as any)[day]) as any} variant="light">
                                                {(row as any)[day]}
                                            </Badge>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
