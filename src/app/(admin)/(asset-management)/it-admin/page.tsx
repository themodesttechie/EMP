"use client";

import React, { useState } from "react";
import { 
    Activity, Box, Laptop, Monitor, AlertTriangle, 
    CheckCircle2, Clock, XCircle, MoreVertical, 
    Search, Filter, Plus, ChevronRight, PackageCheck
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const STATS = [
    { label: "Total Assets", value: 1240, trend: "+12", icon: Box, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" },
    { label: "Deployed", value: 890, trend: "+5", icon: Laptop, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
    { label: "In Stock", value: 305, trend: "-2", icon: PackageCheck, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10" },
    { label: "In Repair", value: 45, trend: "+4", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10" },
];

const REQUESTS = [
    { id: "REQ-0192", user: "Sarah Jenkins", role: "Product Manager", type: "New Request", device: "MacBook Pro 16\"", status: "Pending Approval", date: "2h ago", urgency: "High" },
    { id: "REQ-0191", user: "Michael Chen", role: "Software Engineer", type: "Issue", device: "Dell UltraSharp 27\"", status: "In Progress", date: "5h ago", urgency: "Medium" },
    { id: "REQ-0190", user: "Jessica Row", role: "UX Designer", type: "Exchange", device: "MacBook Air to Pro", status: "Pending Approval", date: "1d ago", urgency: "Low" },
    { id: "REQ-0189", user: "David Smith", role: "Sales Lead", type: "Return", device: "iPhone 13 Pro", status: "Pending Intake", date: "1d ago", urgency: "Medium" },
    { id: "REQ-0188", user: "Emily Stone", role: "Marketing", type: "New Request", device: "Magic Mouse 2", status: "Approved, Pending Dispatch", date: "2d ago", urgency: "Low" },
];

export default function ITAdminDashboardPage() {
    const [activeTab, setActiveTab] = useState("requests");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<any>(null); // For Modal
    const [actionState, setActionState] = useState(""); // approve, reject, assign

    const handleActionClick = (req: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedRequest(req);
        setActionState("");
    };

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">IT Admin Center</h1>
                        <p className="text-xs font-medium text-slate-500 mt-1">Manage global inventory and employee requests</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2">
                        <Plus size={14} /> Add Inventory
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm">
                        Generate Report
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {STATS.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                stat.trend.startsWith('+') 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}>
                                {stat.trend} this week
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl inline-flex">
                        {["requests", "inventory", "users", "reports"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                    activeTab === tab 
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Search ID, User, Device..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#121212] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area based on Tabs */}
                {activeTab === "requests" && (
                    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24">Req ID</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 min-w-[200px]">Employee</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 min-w-[200px]">Item / Reason</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24">Urgency</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24 align-right">Age</th>
                                        <th className="p-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {REQUESTS.map((req, i) => (
                                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group cursor-pointer">
                                            <td className="p-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-300">
                                                {req.id}
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-slate-900 dark:text-white">
                                                {req.user}
                                                <span className="block text-[11px] text-slate-500 font-normal">{req.role}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                    req.type === 'New Request' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                    req.type === 'Issue' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                                    req.type === 'Exchange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                }`}>
                                                    {req.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                {req.device}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800">
                                                    {req.status.includes('Approved') || req.status.includes('Progress') ? <Clock size={12} className="text-amber-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[11px] font-bold ${
                                                    req.urgency === 'High' ? 'text-rose-600 dark:text-rose-400' :
                                                    req.urgency === 'Medium' ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-slate-500'
                                                }`}>
                                                    {req.urgency}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs font-semibold text-slate-500">
                                                {req.date}
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={(e) => handleActionClick(req, e)}
                                                    className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    Manage <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>Showing 1 to 5 of 45 requests</span>
                            <div className="flex items-center gap-1">
                                <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800">Prev</button>
                                <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold">1</button>
                                <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800">2</button>
                                <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800">Next</button>
                            </div>
                        </div>

                    </div>
                )}
                
                {activeTab !== "requests" && (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
                        <Box size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 capitalize">{activeTab} Interface</h3>
                        <p className="text-sm text-slate-500">This section is currently under construction in the mock.</p>
                    </div>
                )}

            </main>

            {/* ACTION MODAL OVERLAY */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121212] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Request</h3>
                                <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            
                            {/* Request Info Card */}
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.user}</p>
                                        <p className="text-xs text-slate-500">{selectedRequest.role}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                        selectedRequest.type === 'New Request' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                        selectedRequest.type === 'Issue' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                        selectedRequest.type === 'Exchange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    }`}>
                                        {selectedRequest.type}
                                    </span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Item Requested</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedRequest.device}</p>
                                    {selectedRequest.type === "Issue" && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">"The screen has been flickering randomly for the last two days. Reboots didn't help."</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Form Selection */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Select Action</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setActionState("approve")}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            actionState === "approve"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                                            : "border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <CheckCircle2 size={20} className="mx-auto mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Approve</span>
                                    </button>
                                    <button 
                                        onClick={() => setActionState("assign")}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            actionState === "assign"
                                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 ring-2 ring-brand-500/20"
                                            : "border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <Laptop size={20} className="mx-auto mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Assign</span>
                                    </button>
                                    <button 
                                        onClick={() => setActionState("reject")}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            actionState === "reject"
                                            ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 ring-2 ring-rose-500/20"
                                            : "border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/50 dark:border-slate-800 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <XCircle size={20} className="mx-auto mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Reject</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Action Fields */}
                            {actionState === "reject" && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Rejection Reason</label>
                                    <textarea 
                                        placeholder="Explain why this request is being rejected..."
                                        className="w-full h-24 px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all"
                                    />
                                </div>
                            )}

                            {actionState === "assign" && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Dispatch Asset Details</label>
                                    <input 
                                        type="text"
                                        placeholder="Scan or Enter Asset Serial Number (e.g. C02DG5HGMD6M)"
                                        className="w-full px-4 py-3 mb-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                                    />
                                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-medium">
                                        <AlertTriangle size={16} /> 
                                        Ensure item is marked as 'Ready to Deploy' in inventory before assignment.
                                    </div>
                                </div>
                            )}

                            {actionState === "approve" && (
                                <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm">
                                    This will formally approve the request in the system. The provisioning team will be notified to prepare the asset.
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a]">
                            <button 
                                disabled={!actionState}
                                onClick={() => {
                                    alert(`Action ${actionState.toUpperCase()} executed for ${selectedRequest.id}`);
                                    setSelectedRequest(null);
                                }}
                                className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                                    actionState === "approve" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                                    actionState === "assign" ? "bg-brand-600 text-white hover:bg-brand-700" :
                                    actionState === "reject" ? "bg-rose-600 text-white hover:bg-rose-700" :
                                    "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                                }`}
                            >
                                Confirm Action
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
