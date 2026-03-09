"use client";

import React, { useState } from "react";
import { 
    Megaphone, Bell, Calendar, ChevronRight, AlertTriangle, 
    Info, Building, ShieldCheck, Zap
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const ANNOUNCEMENTS = [
    {
        id: "ann-001",
        title: "Q3 Townhall Meeting Scheduled",
        type: "Company", // Company, IT, HR, Facilities
        date: "Today, 09:00 AM",
        author: { name: "Alex Sterling", role: "CEO", avatar: "https://i.pravatar.cc/150?u=alex" },
        content: "Join us this Friday at 2 PM EST for our Q3 Townhall. We will be discussing the recent product launch successes and outlining our goals for Q4. A Zoom link has been sent to your calendars.",
        isUrgent: false,
        read: false
    },
    {
        id: "ann-002",
        title: "Mandatory Security Training Update",
        type: "IT",
        date: "Yesterday, 2:30 PM",
        author: { name: "IT Security Team", role: "Department", avatar: "https://i.pravatar.cc/150?u=itsec" },
        content: "Please be advised that the annual Phishing & Security Awareness training is now available in your Learning Dashboard. Completion is mandatory by the end of the month.",
        isUrgent: true,
        read: false
    },
    {
        id: "ann-003",
        title: "New Health Benefit Providers Enrollment",
        type: "HR",
        date: "Oct 24, 2024",
        author: { name: "Amanda Simmons", role: "Chief People Officer", avatar: "https://i.pravatar.cc/150?u=amanda" },
        content: "Open enrollment for the new health plans begins next week. Please review the updated benefit guides on the HR Support portal to make your selections.",
        isUrgent: false,
        read: true
    },
    {
        id: "ann-004",
        title: "London Office Water Main Repair",
        type: "Facilities",
        date: "Oct 22, 2024",
        author: { name: "Facilities Management", role: "Department", avatar: "https://i.pravatar.cc/150?u=fac" },
        content: "The main water line on the 4th floor of the London office will be shut down for repairs this Saturday from 8 AM to 2 PM. Please plan accordingly if you intend to visit the office.",
        isUrgent: true,
        read: true
    }
];

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Company': return <Building size={16} />;
        case 'IT': return <ShieldCheck size={16} />;
        case 'HR': return <Zap size={16} />;
        case 'Facilities': return <AlertTriangle size={16} />;
        default: return <Info size={16} />;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'Company': return 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border-brand-200 dark:border-brand-800';
        case 'IT': return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800';
        case 'HR': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        case 'Facilities': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800';
        default: return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
};

export default function AnnouncementsPage() {
    const [filter, setFilter] = useState("All");

    const filteredAnnouncements = filter === "All" 
        ? ANNOUNCEMENTS 
        : ANNOUNCEMENTS.filter(a => a.type === filter);

    const unreadCount = ANNOUNCEMENTS.filter(a => !a.read).length;

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            Announcements
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest translate-y-[-2px]">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-500">Official updates, alerts, and company-wide memos.</p>
                    </div>

                    <button className="px-4 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2">
                        <Bell size={16} /> Subscription Settings
                    </button>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Filters */}
                        <div className="flex items-center gap-2 px-1 pb-4 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 mb-6">
                            {["All", "Company", "IT", "HR", "Facilities"].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                        filter === cat 
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                        : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {filteredAnnouncements.map(announcement => (
                                <div 
                                    key={announcement.id} 
                                    className={`bg-white dark:bg-[#121212] p-6 rounded-3xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
                                        !announcement.read 
                                        ? "border-l-4 border-l-brand-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 dark:border-t-slate-800 dark:border-r-slate-800 dark:border-b-slate-800 shadow-sm" 
                                        : "border-slate-200 dark:border-slate-800"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest flex items-center gap-2 ${getTypeColor(announcement.type)}`}>
                                            {getTypeIcon(announcement.type)} {announcement.type}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                            <Calendar size={14} /> {announcement.date}
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {announcement.title}
                                        {announcement.isUrgent && (
                                            <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 align-middle">
                                                <AlertTriangle size={12} /> Action Required
                                            </span>
                                        )}
                                    </h2>
                                    
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                        {announcement.content}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 relative">
                                                <Image src={announcement.author.avatar} alt={announcement.author.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{announcement.author.name}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{announcement.author.role}</p>
                                            </div>
                                        </div>
                                        
                                        <button className="text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1">
                                            Read More <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Highlight Card */}
                        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                                <Megaphone size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                    <Megaphone size={24} className="text-white" />
                                </div>
                                <h3 className="text-lg font-black leading-tight mb-2">Have something to share?</h3>
                                <p className="text-sm text-brand-100/80 mb-6">
                                    Department heads can submit announcements for review by the Internal Comms team.
                                </p>
                                <button className="w-full px-4 py-3 bg-white text-brand-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-50 transition-colors">
                                    Submit Draft
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
