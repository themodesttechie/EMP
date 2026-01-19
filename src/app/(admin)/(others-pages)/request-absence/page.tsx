"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Upload, Calendar as CalendarIcon, FileText } from "lucide-react";

export default function RequestAbsencePage() {
    const [formData, setFormData] = useState({
        leaveType: "annual",
        startDate: "",
        endDate: "",
        duration: "full",
        reason: "",
        files: null as FileList | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData((prev) => ({ ...prev, files: e.target.files }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting Request:", formData);
        alert("Leave requested successfully (Mock)");
    };

    return (
        <div className="mx-auto max-w-5xl">
            <PageHeader
                title="Request Absence"
                subtitle="Submit a new leave request for approval."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Request Absence" },
                ]}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Leave Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Leave Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
                                >
                                    <option value="annual">Annual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="casual">Casual Leave</option>
                                    <option value="comp_off">Comp Off</option>
                                    <option value="maternity">Maternity/Paternity</option>
                                    <option value="unpaid">Loss of Pay (L.O.P)</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                            </div>
                        </div>

                        {/* Duration Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Duration Type
                            </label>
                            <div className="relative">
                                <select
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
                                >
                                    <option value="full">Full Day</option>
                                    <option value="first_half">First Half</option>
                                    <option value="second_half">Second Half</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </span>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
                                    required
                                />
                                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
                                    required
                                />
                                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Please describe the reason for your leave..."
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-200 dark:focus:border-blue-500"
                            required
                        ></textarea>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attachments (Medical Certificate etc.)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG (MAX. 5MB)</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} multiple />
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
