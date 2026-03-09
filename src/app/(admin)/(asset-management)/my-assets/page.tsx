"use client";
import React, { useState } from "react";
import { Monitor, Laptop, Smartphone, Mouse, Keyboard, Headphones, Calendar, AlertCircle, Wrench, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock Data
const MY_ASSETS = [
    {
        id: "AST-2024-001",
        name: "MacBook Pro 16\" (M3 Max)",
        category: "Laptop",
        serialNumber: "C02DG5HGMD6M",
        assignedDate: "Jan 12, 2024",
        status: "Active", // Active, Repair, Pending Return
        condition: "Good",
        warrantyEnd: "Jan 11, 2027",
        icon: Laptop,
        color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" // Just for visual placeholder if needed
    },
    {
        id: "AST-2024-045",
        name: "Dell UltraSharp 27\" 4K",
        category: "Monitor",
        serialNumber: "CN-0PWGND-QDC00",
        assignedDate: "Feb 05, 2024",
        status: "Active",
        condition: "Good",
        warrantyEnd: "Feb 04, 2027",
        icon: Monitor,
        color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
    },
    {
        id: "AST-2024-112",
        name: "iPhone 15 Pro",
        category: "Mobile",
        serialNumber: "F17H8K9JQW",
        assignedDate: "Mar 20, 2024",
        status: "Repair",
        condition: "Damaged Screen",
        warrantyEnd: "Mar 19, 2025",
        icon: Smartphone,
        color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
    },
    {
        id: "AST-2023-889",
        name: "Sony WH-1000XM5",
        category: "Accessories",
        serialNumber: "SNY-99827364",
        assignedDate: "Nov 15, 2023",
        status: "Active",
        condition: "Fair",
        warrantyEnd: "Nov 14, 2024",
        icon: Headphones,
        color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
    }
];

export default function MyAssetsPage() {
    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">My Assets</h1>
                        <p className="text-xs font-medium text-slate-500 mt-1">Manage all hardware and software assigned to you</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/asset-issue" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <Wrench size={14} /> Report Issue
                        </Link>
                        <Link href="/request-asset" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm shadow-brand-600/20">
                            <RefreshCw size={14} /> Request New
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Assets", value: MY_ASSETS.length, icon: Monitor, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10" },
                        { label: "Active", value: MY_ASSETS.filter(a => a.status === 'Active').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                        { label: "In Repair", value: MY_ASSETS.filter(a => a.status === 'Repair').length, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
                        { label: "Pending Return", value: 0, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#121212] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Asset Cards Grid */}
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4">Assigned to Me</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {MY_ASSETS.map((asset) => (
                        <div
                            key={asset.id}
                            className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                        >
                            {/* Card Top / Graphic Area */}
                            <div className={`h-32 p-5 ${asset.color.split(" ")[0]} ${asset.color.split(" ")[2]} flex justify-between items-start relative overflow-hidden bg-opacity-30 dark:bg-opacity-100`}>
                                <div className={`p-2.5 rounded-xl bg-white dark:bg-[#121212] shadow-sm ${asset.color.split(" ")[1]} ${asset.color.split(" ")[3]} relative z-10`}>
                                    <asset.icon size={24} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white dark:bg-[#121212] shadow-sm relative z-10 ${asset.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' :
                                        asset.status === 'Repair' ? 'text-amber-600 dark:text-amber-400' :
                                            'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {asset.status}
                                </span>

                                {/* Large Watermark Icon */}
                                <asset.icon size={120} className="absolute -right-6 -bottom-6 text-black/5 dark:text-white/5 rotate-12 -z-0" />
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-1">{asset.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{asset.category}</p>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Asset ID</span>
                                        <span className="font-semibold text-slate-900 dark:text-white font-mono text-xs">{asset.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Serial</span>
                                        <span className="font-semibold text-slate-900 dark:text-white font-mono text-xs">{asset.serialNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Assigned</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{asset.assignedDate}</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-slate-100 dark:bg-slate-800 -mx-5 mb-4" />

                                {/* Card Actions */}
                                <div className="flex items-center gap-2">
                                    <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors">
                                        View Details
                                    </button>
                                    <Link href={`/asset-issue?asset=${asset.id}`} className="flex-1 py-2 bg-white hover:bg-slate-50 dark:bg-[#121212] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5">
                                        <AlertCircle size={14} className="text-amber-500 mt-[-1px]" /> Issue
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Policies Panel */}
                <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-brand-500/20 rounded-xl text-brand-600 dark:text-brand-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Asset IT Policy & Compliance</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                                Please ensure you review our updated IT asset compliance protocol. All devices must be updated to the latest security patches within 14 days of release.
                            </p>
                        </div>
                    </div>
                    <Link href="/asset-documentation" className="px-5 py-2.5 bg-white dark:bg-[#121212] border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-50 hover:border-brand-300 transition-all flex-shrink-0">
                        Read Policy
                    </Link>
                </div>

            </main>

        </div>
    );
}
