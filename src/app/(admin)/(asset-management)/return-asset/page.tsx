"use client";

import React, { useState } from "react";
import {
    Laptop, Monitor, Smartphone, Headphones, CornerDownLeft,
    AlertTriangle, Calendar, CheckCircle2, ChevronRight, X
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const ASSIGNED_ASSETS = [
    {
        id: "AST-2024-001", name: "MacBook Pro 16\" (M3 Max)", category: "Laptop",
        serial: "C02DG5HGMD6M", assigned: "Jan 12, 2024", condition: "Good", icon: Laptop,
        color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
    },
    {
        id: "AST-2024-045", name: "Dell UltraSharp 27\" 4K", category: "Monitor",
        serial: "CN-0PWGND", assigned: "Feb 05, 2024", condition: "Good", icon: Monitor,
        color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
    },
    {
        id: "AST-2024-112", name: "iPhone 15 Pro", category: "Mobile",
        serial: "F17H8K9JQW", assigned: "Mar 20, 2024", condition: "Damaged Screen", icon: Smartphone,
        color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
    }
];

export default function ReturnAssetPage() {
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [returnReason, setReturnReason] = useState("");
    const [condition, setCondition] = useState("Good");
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const CONDITIONS = ["Perfect", "Good", "Fair", "Damaged", "Non-Functional"];

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto relative">

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Return Asset</h1>
                    <p className="text-xs font-medium text-slate-500 mt-1">Select an active asset to initiate a return request</p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 pb-32">
                
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Return Request Initiated</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                            Please backup your data and hand over the device to the IT Service Desk within the next 3 business days.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.href='/my-assets'} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors">
                                Back to My Assets
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4">Your Active Assets</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ASSIGNED_ASSETS.map((asset) => (
                        <div
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className={`bg-white dark:bg-[#121212] rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col p-5 hover:border-rose-400 hover:shadow-lg dark:hover:border-rose-500/50 ${selectedAsset?.id === asset.id
                                    ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md"
                                    : "border-slate-200 dark:border-slate-800"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4 relative">
                                <div className={`p-3 rounded-xl ${asset.color}`}>
                                    <asset.icon size={24} />
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <CornerDownLeft size={12} /> Return
                                </button>

                                {selectedAsset?.id === asset.id && (
                                    <div className="absolute top-0 right-0 p-1.5 bg-rose-500 text-white rounded-full translate-x-1/2 -translate-y-1/2">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{asset.category}</p>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight placeholder">{asset.name}</h3>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Asset ID</span>
                                        <span className="font-semibold font-mono text-slate-900 dark:text-slate-300">{asset.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Condition</span>
                                        <span className={`font-semibold ${asset.condition === 'Damaged Screen' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {asset.condition}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
                )}

            </main>

            {/* Bottom Sheet / Modal Overlay for Return Details */}
            {selectedAsset && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedAsset(null)} />

                    {/* Panel */}
                    <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[500px] bg-white dark:bg-[#121212] z-50 border-t sm:border-l sm:border-t-0 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[90vh] sm:h-screen animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 sm:rounded-l-3xl rounded-t-3xl sm:rounded-tr-none">

                        {/* Panel Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Return Request</h3>
                                <p className="text-xs text-slate-500">Complete details for {selectedAsset.id}</p>
                            </div>
                            <button onClick={() => setSelectedAsset(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-8">

                            {/* Selected Asset Mini-Card */}
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${selectedAsset.color}`}>
                                    <selectedAsset.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedAsset.name}</h4>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">SN: {selectedAsset.serial}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                        Current Condition
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CONDITIONS.map(cond => (
                                            <button
                                                key={cond}
                                                onClick={() => setCondition(cond)}
                                                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${condition === cond
                                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400 dark:bg-[#121212] dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
                                                    }`}
                                            >
                                                {cond}
                                            </button>
                                        ))}
                                    </div>
                                    {(condition === "Damaged" || condition === "Non-Functional") && (
                                        <div className="mt-3 p-3 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 flex items-start gap-2 text-xs">
                                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                            <p>Return may require an incident report for damaged items. IT will contact you.</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                        Reason for Return <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={returnReason}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                        placeholder="E.g., Device is no longer needed, upgrading to a new model..."
                                        className="w-full h-24 px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                        Preferred Handover Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer */}
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a]">
                            <button 
                                disabled={returnReason.length < 5}
                                onClick={() => {
                                    setIsSubmitted(true);
                                    setSelectedAsset(null);
                                }}
                                className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    returnReason.length >= 5
                                    ? "bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-0.5 shadow-sm shadow-rose-600/20"
                                    : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                                }`}
                            >
                                Initiate Return <CornerDownLeft size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
