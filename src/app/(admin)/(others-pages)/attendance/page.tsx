"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { Clock, LogIn, LogOut, MapPin, X } from "lucide-react";

interface AttendanceLog {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    status: "Present" | "Late" | "Absent" | "Half Day";
}

const mockAttendance: AttendanceLog[] = [
    { id: "1", date: "2025-02-18", checkIn: "09:00 AM", checkOut: "06:00 PM", totalHours: "9h", status: "Present" },
    { id: "2", date: "2025-02-17", checkIn: "09:15 AM", checkOut: "06:00 PM", totalHours: "8h 45m", status: "Late" },
    { id: "3", date: "2025-02-16", checkIn: "-", checkOut: "-", totalHours: "-", status: "Absent" },
    { id: "4", date: "2025-02-15", checkIn: "09:00 AM", checkOut: "01:00 PM", totalHours: "4h", status: "Half Day" },
];

export default function AttendancePage() {
    const [logs, setLogs] = useState(mockAttendance);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    const handleClockAction = () => {
        setIsModalOpen(true);
        setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };

    const confirmClockAction = () => {
        // Mock Action
        setIsCheckedIn(!isCheckedIn);
        setIsModalOpen(false);

        if (!isCheckedIn) {
            // Add dummy log for today if checking in
            setLogs([{
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                checkIn: currentTime,
                checkOut: "-",
                totalHours: "-",
                status: "Present"
            }, ...logs]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present": return "success";
            case "Late": return "warning";
            case "Absent": return "error";
            case "Half Day": return "info";
            default: return "light";
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <PageHeader
                    title="Attendance"
                    subtitle="View your daily records and clock in/out."
                    breadcrumbs={[
                        { label: "Time Management" },
                        { label: "Attendance" },
                    ]}
                />
                <button
                    onClick={handleClockAction}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all ${isCheckedIn
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                            : "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                        }`}
                >
                    {isCheckedIn ? <LogOut size={20} /> : <LogIn size={20} />}
                    {isCheckedIn ? "Clock Out" : "Clock In"}
                </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Check In</th>
                            <th className="px-6 py-4">Check Out</th>
                            <th className="px-6 py-4">Total Hours</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.date}</td>
                                <td className="px-6 py-4">
                                    <Badge color={getStatusColor(log.status)} variant="light">{log.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-green-600 font-medium">{log.checkIn}</td>
                                <td className="px-6 py-4 text-red-500 font-medium">{log.checkOut}</td>
                                <td className="px-6 py-4">{log.totalHours}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:underline">View Log</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Clock In Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-sm p-6 text-center">
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${isCheckedIn ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <Clock size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {isCheckedIn ? "Confirm Clock Out?" : "Confirm Clock In?"}
                </h3>
                <p className="text-2xl font-mono text-gray-900 dark:text-gray-100 mb-2">{currentTime}</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                    <MapPin size={16} />
                    <span>Detected Location: Main Office (IP: 192.168.1.5)</span>
                </div>

                <div className="flex gap-3 justify-center">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-gray-700">Cancel</button>
                    <button
                        onClick={confirmClockAction}
                        className={`px-6 py-2 rounded-lg text-white font-medium ${isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isCheckedIn ? "Clock Out Now" : "Clock In Now"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
