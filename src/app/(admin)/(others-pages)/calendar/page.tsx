"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Modal } from "@/components/ui/modal";
import { X } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [leaveType, setLeaveType] = useState("Annual");

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsRequestModalOpen(true);
  };

  const holidays = [
    { title: "New Year", start: "2025-01-01", color: "#10B981" }, // Green
    { title: "Republic Day", start: "2025-01-26", color: "#10B981" },
    { title: "Good Friday", start: "2025-04-18", color: "#10B981" },
  ];

  const myLeaves = [
    { title: "Sick Leave", start: "2025-02-05", color: "#3B82F6" }, // Blue
    { title: "Vacation", start: "2025-02-10", end: "2025-02-13", color: "#3B82F6" },
  ];

  const teamLeaves = [
    { title: "John (Sick)", start: "2025-02-06", color: "#F59E0B" }, // Orange
  ];

  const [events, setEvents] = useState([...holidays, ...myLeaves, ...teamLeaves]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEvents([...events, { title: `${leaveType} (Pending)`, start: selectedDate, color: "#3B82F6" }]);
    setIsRequestModalOpen(false);
    alert("Leave Request Submitted!");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Calendar"
        subtitle="View holidays, manage your leaves, and see team availability."
        breadcrumbs={[
          { label: "Time Management" },
          { label: "Calendar" },
        ]}
      />

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Holidays</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500"></span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">My Leaves</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-500"></span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Leaves</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          * Click on any date to request leave
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar-styles">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek"
            }}
            events={events}
            dateClick={handleDateClick}
            height="auto"
            selectable={true}
            editable={false}
          />
        </div>
      </div>

      {/* Quick Request Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} className="max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Request Leave</h3>
          <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white"
            >
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (Optional)</label>
            <textarea rows={2} className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white" placeholder="Taking a break..."></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsRequestModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
