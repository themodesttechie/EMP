"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { Eye, Check, X, Filter, Trash2, Edit2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface LeaveRequest {
    id: string;
    employee: string;
    role: string;
    leaveType: string;
    duration: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected" | "Cancelled";
    appliedOn: string;
    isSelf?: boolean; // New flag to identify current user's leaves
}

const mockRequests: LeaveRequest[] = [
    // Team Requests
    {
        id: "LR001",
        employee: "John Doe",
        role: "Software Engineer",
        leaveType: "Annual Leave",
        duration: "3 Days",
        startDate: "2025-02-10",
        endDate: "2025-02-12",
        reason: "Family vacation",
        status: "Pending",
        appliedOn: "2025-02-01",
        isSelf: false,
    },
    {
        id: "LR005",
        employee: "Alice Wonder",
        role: "Designer",
        leaveType: "Sick Leave",
        duration: "1 Day",
        startDate: "2025-02-11",
        endDate: "2025-02-11",
        reason: "Migraine",
        status: "Approved",
        appliedOn: "2025-02-02",
        isSelf: false,
    },
    // Self Requests
    {
        id: "LR002",
        employee: "Me (You)",
        role: "Manager",
        leaveType: "Sick Leave",
        duration: "1 Day",
        startDate: "2025-02-05",
        endDate: "2025-02-05",
        reason: "Fever and cold",
        status: "Approved",
        appliedOn: "2025-02-04",
        isSelf: true,
    },
    {
        id: "LR003",
        employee: "Me (You)",
        role: "Manager",
        leaveType: "Casual Leave",
        duration: "2 Days",
        startDate: "2025-02-20",
        endDate: "2025-02-21",
        reason: "Personal work",
        status: "Pending",
        appliedOn: "2025-02-15",
        isSelf: true,
    },
];

export default function ManageAbsencePage() {
    const [activeTab, setActiveTab] = useState<"team" | "my">("team");
    const [requests, setRequests] = useState(mockRequests);

    // Approval Actions (For Team)
    const handleAction = (id: string, action: "Approved" | "Rejected") => {
        setRequests((prev) =>
            prev.map((req) => (req.id === id ? { ...req, status: action } : req))
        );
    };

    // Self Actions
    const handleCancel = (id: string) => {
        if (confirm("Are you sure you want to cancel this leave request?")) {
            setRequests((prev) =>
                prev.map((req) => (req.id === id ? { ...req, status: "Cancelled" } : req))
            );
        }
    };

    const filteredRequests = requests.filter((req) =>
        activeTab === "team" ? !req.isSelf : req.isSelf
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "success";
            case "Rejected": return "error";
            case "Cancelled": return "dark";
            default: return "warning";
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            <PageHeader
                title="Manage Absence"
                subtitle="Review and manage employee leave requests."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Manage Absence" },
                ]}
            />

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("team")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'team' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                        >
                            Team Approvals
                        </button>
                    </li>
                    <li className="me-2">
                        <button
                            onClick={() => setActiveTab("my")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'my' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                        >
                            My Leaves
                        </button>
                    </li>
                </ul>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Employee</th>
                                <th scope="col" className="px-6 py-4">Leave Type</th>
                                <th scope="col" className="px-6 py-4">Duration</th>
                                <th scope="col" className="px-6 py-4">Date Range</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex flex-col">
                                            <span>{req.employee}</span>
                                            <span className="text-xs text-gray-400 font-normal">{req.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{req.leaveType}</td>
                                    <td className="px-6 py-4">{req.duration}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs">
                                            <span>{req.startDate}</span>
                                            <span className="text-gray-400">to</span>
                                            <span>{req.endDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={getStatusColor(req.status)} variant="light">
                                            {req.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* TEAM ACTIONS */}
                                            {activeTab === "team" && req.status === "Pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(req.id, "Approved")}
                                                        className="p-1 rounded hover:bg-green-100 text-green-600 dark:hover:bg-green-900/30"
                                                        title="Approve"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, "Rejected")}
                                                        className="p-1 rounded hover:bg-red-100 text-red-600 dark:hover:bg-red-900/30"
                                                        title="Reject"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}

                                            {/* MY ACTIONS */}
                                            {activeTab === "my" && req.status === "Pending" && (
                                                <>
                                                    <button
                                                        className="p-1 rounded hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-900/30"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(req.id)}
                                                        className="p-1 rounded hover:bg-red-100 text-red-600 dark:hover:bg-red-900/30"
                                                        title="Cancel Request"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}

                                            <button className="p-1 rounded hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-700" title="View Details">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-500">No requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
