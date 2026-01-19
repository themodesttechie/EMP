"use client";

import React from "react";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";

export default function OvertimePage() {
    return (
        <div className="mx-auto max-w-5xl">
            <PageHeader
                title="Overtime & Extra Hours"
                subtitle="Claim reimbursement for overtime work."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Overtime" },
                ]}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Claim Form */}
                <div className="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">New Claim</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                            <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hours</label>
                            <input type="number" step="0.5" placeholder="e.g. 2.5" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project / Reason</label>
                            <textarea rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white" placeholder="Reason..."></textarea>
                        </div>
                        <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit Claim</button>
                    </form>
                </div>

                {/* History */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Claim History</h3>
                    <div className="space-y-4">
                        {[
                            { date: "Feb 10, 2025", hours: "3.0 hrs", reason: "Critical Bug Fix", status: "Approved" },
                            { date: "Feb 05, 2025", hours: "1.5 hrs", reason: "Client Meeting Extension", status: "Pending" },
                            { date: "Jan 28, 2025", hours: "4.0 hrs", reason: "Deployment Support", status: "Paid" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">{item.reason}</p>
                                    <p className="text-sm text-gray-500">{item.date} • {item.hours}</p>
                                </div>
                                <Badge
                                    color={item.status === 'Approved' || item.status === 'Paid' ? 'success' : 'warning'}
                                    variant="light"
                                >
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
