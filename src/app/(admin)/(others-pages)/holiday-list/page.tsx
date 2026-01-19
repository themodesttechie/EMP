"use client";

import React from "react";
import PageHeader from "@/components/common/PageHeader";

const holidays = [
    { name: "New Year's Day", date: "Jan 1, 2025", day: "Wednesday", type: "Public" },
    { name: "Republic Day", date: "Jan 26, 2025", day: "Sunday", type: "National" },
    { name: "Holi", date: "Mar 14, 2025", day: "Friday", type: "Optional" },
    { name: "Good Friday", date: "Apr 18, 2025", day: "Friday", type: "Public" },
    { name: "Labor Day", date: "May 1, 2025", day: "Thursday", type: "Public" },
    { name: "Independence Day", date: "Aug 15, 2025", day: "Friday", type: "National" },
    { name: "Diwali", date: "Oct 20, 2025", day: "Monday", type: "Public" },
    { name: "Christmas", date: "Dec 25, 2025", day: "Thursday", type: "Public" },
];

export default function HolidayListPage() {
    return (
        <div className="mx-auto max-w-7xl">
            <PageHeader
                title="Holiday List"
                subtitle="Upcoming public and national holidays for the year 2025."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Holiday List" },
                ]}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {holidays.map((holiday, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]"
                    >
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-50 transition-all group-hover:bg-blue-100 dark:bg-blue-500/10 dark:group-hover:bg-blue-500/20"></div>

                        <div className="relative z-10">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${holiday.type === 'National'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400'
                                    : holiday.type === 'Public'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                                        : 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'
                                }`}>
                                {holiday.type}
                            </span>

                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                {holiday.name}
                            </h3>

                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <p className="font-medium text-gray-700 dark:text-gray-300">{holiday.date}</p>
                                <p>{holiday.day}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
