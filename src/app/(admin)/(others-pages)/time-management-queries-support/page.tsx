"use client";

import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function TimeManagementSupportPage() {
    return (
        <div className="mx-auto max-w-5xl">
            <PageHeader
                title="Time Management Support"
                subtitle="Get help with your leave requests, attendance, or shifts."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Support" },
                ]}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">Submit a Query</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white">
                                <option>Leave Balance Issue</option>
                                <option>Attendance Correction</option>
                                <option>Shift Change Request</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea rows={5} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent dark:text-white" placeholder="Describe your issue detailed..."></textarea>
                        </div>
                        <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Submit Ticket</button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl bg-blue-600 p-6 text-white">
                        <h4 className="mb-2 text-lg font-bold">HR Helpdesk</h4>
                        <p className="mb-6 text-blue-100 opcaity-90">Our team is available Mon-Fri, 9AM - 6PM.</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 opacity-80" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 opacity-80" />
                                <span>hr-support@company.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h4 className="mb-4 font-semibold text-gray-800 dark:text-white">FAQ</h4>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-700 dark:text-gray-300">
                                    <span>How do I correct my attendance?</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm text-gray-500 group-open:animate-fadeIn">
                                    Raise a ticket with category "Attendance Correction" and specify the date and correct time.
                                </p>
                            </details>
                            <details className="group border-t border-gray-100 pt-4 dark:border-gray-800">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-700 dark:text-gray-300">
                                    <span>Can I cancel approved leave?</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm text-gray-500 group-open:animate-fadeIn">
                                    Yes, go to Manage Absence, find your approved leave, and click "Request Cancellation".
                                </p>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
