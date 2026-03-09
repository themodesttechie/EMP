"use client";

import React, { useState } from "react";
import { 
    Laptop, Monitor, Smartphone, AlertTriangle, MessageSquare, 
    Paperclip, CheckCircle2, Clock, Wrench, ShieldAlert
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const MY_ASSETS = [
    { id: "AST-2024-001", name: "MacBook Pro 16\"", category: "Laptop", spec: "M3 Max / 32GB RAM", icon: Laptop, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
    { id: "AST-2024-045", name: "Dell 27\" 4K", category: "Monitor", spec: "U2723QE", icon: Monitor, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { id: "AST-2024-112", name: "iPhone 15 Pro", category: "Mobile", spec: "256GB", icon: Smartphone, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" }
];

const ISSUE_TYPES = [
    { id: "hardware", name: "Hardware Issue", desc: "Physical damage, won't turn on, overheating", icon: Wrench, color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10" },
    { id: "software", name: "Software / OS", desc: "Crashing apps, slow performance, updates", icon: Monitor, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" },
    { id: "security", name: "Security Concern", desc: "Suspected malware, lost device, unauthorized access", icon: ShieldAlert, color: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10" },
    { id: "other", name: "Other", desc: "Accessories, connectivity, general queries", icon: MessageSquare, color: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800" },
];

export default function AssetIssuePage() {
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [issueTitle, setIssueTitle] = useState("");
    const [issueDesc, setIssueDesc] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isFormValid = selectedAsset && selectedType && issueTitle.length > 5 && issueDesc.length > 10;

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Report Asset Issue</h1>
                   <p className="text-xs font-medium text-slate-500 mt-1">Create an IT support ticket for your active hardware or software</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        My Tickets (2)
                    </button>
                    <button 
                        disabled={!isFormValid}
                        onClick={() => setIsSubmitted(true)}
                        className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-sm ${
                            isFormValid 
                            ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20" 
                            : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                        }`}
                    >
                        Submit Ticket
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ticket #INC-8992 Created</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                            Our IT support team has received your report regarding <b>{selectedAsset?.name}</b>. A technician will review it shortly based on the SLA.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.href='/my-assets'} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors">
                                Back to My Assets
                            </button>
                        </div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Form Setup */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Step 1: Select Asset */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">1</div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Which asset is experiencing issues?</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pl-8">
                                {MY_ASSETS.map(asset => (
                                    <div 
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                            selectedAsset?.id === asset.id 
                                            ? "bg-brand-50 border-brand-500 ring-2 ring-brand-500/10 dark:bg-brand-500/10 dark:border-brand-500 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300 dark:bg-[#121212] dark:border-slate-800 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2 rounded-lg ${asset.color}`}>
                                                <asset.icon size={18} />
                                            </div>
                                            {selectedAsset?.id === asset.id && <CheckCircle2 size={18} className="text-brand-600 dark:text-brand-500" />}
                                        </div>
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{asset.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{asset.id}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Step 2: Issue Type */}
                        <section className={selectedAsset ? "opacity-100 transition-opacity duration-500" : "opacity-30 pointer-events-none"}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">2</div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">What type of issue is this?</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8">
                                {ISSUE_TYPES.map(type => (
                                    <div 
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                                            selectedType === type.id 
                                            ? "bg-brand-50 border-brand-500 ring-2 ring-brand-500/10 dark:bg-brand-500/10 dark:border-brand-500 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300 dark:bg-[#121212] dark:border-slate-800 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-lg ${type.color}`}>
                                            <type.icon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{type.name}</h3>
                                            <p className="text-[11px] text-slate-500 leading-tight">{type.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Step 3: Details */}
                        <section className={selectedType ? "opacity-100 transition-opacity duration-500" : "opacity-30 pointer-events-none"}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Provide details</h2>
                            </div>
                            <div className="pl-8 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Issue Title</label>
                                    <input 
                                        type="text"
                                        value={issueTitle}
                                        onChange={(e) => setIssueTitle(e.target.value)}
                                        placeholder="E.g., Screen flickering intermittently"
                                        className="w-full px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-between">
                                        <span>Description</span>
                                        <span className={issueDesc.length > 0 && issueDesc.length < 10 ? "text-amber-500" : "text-slate-400"}>
                                            Min 10 chars
                                        </span>
                                    </label>
                                    <textarea 
                                        value={issueDesc}
                                        onChange={(e) => setIssueDesc(e.target.value)}
                                        placeholder="Please describe exactly what happens, when it started, and any steps you've already taken to troubleshoot..."
                                        className="w-full h-32 px-4 py-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                
                                {/* File Upload */}
                                <div className="mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#121212]/50 hover:bg-slate-100 dark:hover:bg-[#121212] transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-500 group-hover:border-brand-200 transition-colors mb-3">
                                        <Paperclip size={18} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to attach screenshots or logs</p>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">JPG, PNG, PDF up to 10MB</p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Knowledge Base / Context */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">
                            
                            {/* IT Support Info Callout */}
                            <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-2xl p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-brand-900 dark:text-brand-400 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> SLA Information
                                </h3>
                                <p className="text-[13px] text-brand-800 dark:text-brand-300/80 mb-4 leading-relaxed">
                                    Standard hardware issues are reviewed within <span className="font-bold">2 business hours</span>. 
                                    If your issue is critical (preventing you from working entirely), please escalate by calling IT Helpdesk at <span className="font-mono bg-white dark:bg-black/20 px-1 rounded">555-0192</span>.
                                </p>
                            </div>

                            {/* Suggested Articles (Dynamic based on selected Type) */}
                            <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4">Suggested Articles</h3>
                                
                                <div className="space-y-3">
                                    <a href="#" className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">How to hard reset your MacBook Pro</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Hardware Support</p>
                                    </a>
                                    <a href="#" className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Clearing cache and fixing slow apps</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Software Support</p>
                                    </a>
                                    <a href="#" className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Setting up secondary displays</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Monitor Setup</p>
                                    </a>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                </div>
                )}
            </main>
        </div>
    );
}
