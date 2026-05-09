"use client";
import React, { useState } from "react";
import {
    Home, FileText, ClipboardList, Bell, PieChart
} from "lucide-react";
import EmployeeDocumentHub from "../employee-hub/page";
import HrPoliciesPage from "../hr-policies/page";
import AnnouncementsPage from "../../(workplace)/announcements/page";

const modules = [
    { name: "Dashboard", icon: Home },
    { name: "Document Hub", icon: FileText },
    { name: "HR Policies", icon: ClipboardList },
    { name: "Announcements", icon: Bell },
    { name: "Helpdesk", icon: PieChart },
];

export default function AdminDashboard() {
    const [activeModule, setActiveModule] = useState("Dashboard");

    const renderModule = () => {
        switch (activeModule) {
            case "Document Hub":
                return <EmployeeDocumentHub />;
            case "HR Policies":
                return <HrPoliciesPage />;
            case "Announcements":
                return <AnnouncementsPage />;
            default:
                return (
                    <div className="text-gray-600 dark:text-gray-300 p-6">
                        <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
                        <p>Select a module from the sidebar to manage workplace resources.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-6 text-xl font-bold text-gray-900 dark:text-white">Admin Panel</div>
                <nav className="flex-1 px-2 space-y-1">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        const isActive = activeModule === module.name;
                        return (
                            <button
                                key={module.name}
                                onClick={() => setActiveModule(module.name)}
                                className={`flex items-center w-full px-4 py-2 rounded-lg text-left transition ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <Icon size={18} className="mr-3" />
                                {module.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="p-6">{renderModule()}</div>
            </div>
        </div>
    );
}
