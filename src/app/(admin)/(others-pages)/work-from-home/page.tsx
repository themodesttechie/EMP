"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { Laptop, Home } from "lucide-react";

export default function WorkFromHomePage() {
    const [activeTab, setActiveTab] = useState("apply");

    return (
        <div className="mx-auto max-w-5xl">
            <PageHeader
                title="Work From Home"
                subtitle="Manage your Work From Home requests."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Work From Home" },
                ]}
            />

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("apply")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'apply' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                        >
                            Apply for WFH
                        </button>
                    </li>
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'history' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                        >
                            Request History
                        </button>
                    </li>
                </ul>
            </div>

            {activeTab === "apply" && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                                placeholder="Why do you need to work from home?"
                            />
                        </div>
                        <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Submit Request</button>
                    </form>
                </div>
            )}

            {activeTab === "history" && (
                <div className="space-y-4">
                    {[1, 2].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                    <Laptop size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">WFH Request #{item}025</h4>
                                    <p className="text-sm text-gray-500">Feb 1{item}, 2025</p>
                                </div>
                            </div>
                            <Badge color={item === 1 ? "success" : "warning"} variant="light">
                                {item === 1 ? "Approved" : "Pending"}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
