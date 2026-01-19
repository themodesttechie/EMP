"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { User, Calendar, ArrowRight, XCircle } from "lucide-react";

interface Delegation {
    id: string;
    delegateTo: string;
    startDate: string;
    endDate: string;
    modules: string[];
    status: "Active" | "Scheduled" | "Expired";
}

const mockDelegations: Delegation[] = [
    {
        id: "1",
        delegateTo: "Sarah Connor (QA Lead)",
        startDate: "2025-02-20",
        endDate: "2025-02-25",
        modules: ["Leave", "Timesheet"],
        status: "Scheduled",
    },
];

export default function DelegationsPage() {
    const [delegations, setDelegations] = useState<Delegation[]>(mockDelegations);
    const [showForm, setShowForm] = useState(false);

    const handleDelete = (id: string) => {
        setDelegations(delegations.filter((d) => d.id !== id));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newDelegation: Delegation = {
            id: Date.now().toString(),
            delegateTo: "John Doe (Dev)", // Mock
            startDate: "2025-03-01",
            endDate: "2025-03-05",
            modules: ["All"],
            status: "Scheduled",
        };
        setDelegations([...delegations, newDelegation]);
        setShowForm(false);
    };

    return (
        <div className="mx-auto max-w-5xl">
            <PageHeader
                title="Delegation Settings"
                subtitle="Delegate your approval authority when you are unavailable."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Delegations" },
                ]}
            >
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    {showForm ? "Cancel" : "+ Add Delegation"}
                </button>
            </PageHeader>

            {/* Delegation Form */}
            {showForm && (
                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">New Delegation</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Delegate To</label>
                                <select className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white">
                                    <option>Select Employee...</option>
                                    <option>John Doe</option>
                                    <option>Jane Smith</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modules</label>
                                <select className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white">
                                    <option>All Approvals</option>
                                    <option>Leave Only</option>
                                    <option>Timesheet Only</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white" required />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Delegation</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Active Delegations */}
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Your Delegations</h3>
            <div className="space-y-4">
                {delegations.length > 0 ? (
                    delegations.map((d) => (
                        <div key={d.id} className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">To: {d.delegateTo}</h4>
                                        <Badge color={d.status === 'Active' ? 'success' : 'info'} variant="light" size="sm">{d.status}</Badge>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar size={14} />
                                        <span>{d.startDate}</span>
                                        <ArrowRight size={14} />
                                        <span>{d.endDate}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">Modules: {d.modules.join(", ")}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(d.id)}
                                className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                            >
                                <XCircle size={16} /> Revoke
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
                        No active delegations found.
                    </div>
                )}
            </div>

            {/* Incoming Delegations Warning (Mock) */}
            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <div className="flex gap-3">
                    <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                        <User size={20} />
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Delegated to You</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            You are currently approving requests on behalf of <strong>Alex Chen</strong> (Director) until Feb 28, 2025.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
