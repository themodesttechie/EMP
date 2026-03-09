"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { CheckCircle, Clock, FileText, Plus, Search, HelpCircle, BarChart3, Settings } from "lucide-react";

// Mock data
const MY_ASSESSMENTS = [
    {
        id: "a-1",
        title: "React & Next.js Final Quiz",
        course: "Advanced Next.js 14 Web Development",
        questions: 20,
        timeLimit: "30m",
        status: "pending",
        dueDate: "2024-03-20",
    },
    {
        id: "a-2",
        title: "Information Security Test",
        course: "Corporate Data Security Basics",
        questions: 15,
        timeLimit: "20m",
        status: "completed",
        score: 95,
        passed: true,
        completedAt: "2024-01-10",
    },
    {
        id: "a-3",
        title: "Code of Conduct Quiz",
        course: "Workplace Policies",
        questions: 10,
        timeLimit: "15m",
        status: "completed",
        score: 100,
        passed: true,
        completedAt: "2024-02-05",
    }
];

const ADMIN_ASSESSMENTS = [
    {
        id: "ad-1",
        title: "React & Next.js Final Quiz",
        course: "Advanced Next.js 14 Web Development",
        questions: 20,
        submissions: 145,
        avgScore: 88,
        status: "active",
    },
    {
        id: "ad-2",
        title: "Information Security Test",
        course: "Corporate Data Security Basics",
        questions: 15,
        submissions: 4200,
        avgScore: 92,
        status: "active",
    },
    {
        id: "ad-3",
        title: "Q1 Management Evaluation",
        course: "Leadership Foundations",
        questions: 25,
        submissions: 0,
        avgScore: 0,
        status: "draft",
    }
];

export default function AssessmentsQuizzes() {
    const [viewMode, setViewMode] = useState<"employee" | "admin">("employee");

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Assessments & Quizzes" />

            {/* View Toggle */}
            <div className="mb-6 flex overflow-hidden rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 w-fit">
                <button
                    onClick={() => setViewMode("employee")}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        viewMode === "employee"
                            ? "bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400"
                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                >
                    <FileText className="h-4 w-4" /> My Assessments
                </button>
                <button
                    onClick={() => setViewMode("admin")}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        viewMode === "admin"
                            ? "bg-purple-50 text-purple-600 shadow-sm dark:bg-purple-500/10 dark:text-purple-400"
                            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                >
                    <Settings className="h-4 w-4" /> Manage (Admin)
                </button>
            </div>

            {/* Employee View */}
            {viewMode === "employee" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MY_ASSESSMENTS.map((assessment) => (
                            <div key={assessment.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                        assessment.status === "completed" 
                                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" 
                                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                    }`}>
                                        {assessment.status === "completed" ? "Completed" : "Pending"}
                                    </span>
                                    {assessment.status === "pending" && (
                                        <span className="text-xs text-red-500 font-medium">Due: {new Date(assessment.dueDate!).toLocaleDateString()}</span>
                                    )}
                                </div>
                                
                                <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{assessment.title}</h3>
                                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{assessment.course}</p>
                                
                                <div className="mb-6 grid grid-cols-2 gap-4 border-y border-gray-100 py-4 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <HelpCircle className="h-4 w-4 text-gray-400" />
                                        <span>{assessment.questions} Questions</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{assessment.timeLimit} Limit</span>
                                    </div>
                                </div>
                                
                                <div className="mt-auto pt-2">
                                    {assessment.status === "completed" ? (
                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{assessment.score}%</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                                                <CheckCircle className="h-4 w-4" /> Passed
                                            </div>
                                        </div>
                                    ) : (
                                        <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                                            Start Assessment
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Admin View */}
            {viewMode === "admin" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Admin Actions Bar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search assessments..."
                                className="block w-full rounded-lg border-0 py-2 pl-9 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 shadow-sm">
                            <Plus className="h-4 w-4" /> Create Assessment
                        </button>
                    </div>

                    {/* Admin Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Assessment Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Linked Course</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Submissions</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Score</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                    {ADMIN_ASSESSMENTS.map((assessment) => (
                                        <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">{assessment.title}</div>
                                                        <div className="text-xs text-gray-500">{assessment.questions} Questions</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {assessment.course}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    assessment.status === "active" 
                                                    ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400" 
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                }`}>
                                                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {assessment.submissions.toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${assessment.avgScore}%` }} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{assessment.avgScore}%</span>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 justify-end ml-auto">
                                                    <Settings className="h-4 w-4" /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
