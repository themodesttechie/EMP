"use client";

import React, { useState } from "react";
import { 
    BookOpen, Search, FileText, ChevronRight, ShieldCheck, 
    Smartphone, Download, ExternalLink, Hash
} from "lucide-react";

// -- MOCK DATA --
const CATEGORIES = [
    { id: "aup", name: "Acceptable Use Policy", icon: ShieldCheck, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" },
    { id: "byod", name: "BYOD Guidelines", icon: Smartphone, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10" },
    { id: "return", name: "Return & Replacements", icon: FileText, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" },
];

const CONTENT: Record<string, React.ReactNode> = {
    aup: (
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-a:text-brand-600 dark:prose-a:text-brand-400 hover:prose-a:text-brand-700">
            <h1>Acceptable Use Policy</h1>
            <p className="lead">Last Updated: October 15, 2025</p>
            <p>
                This Acceptable Use Policy outlines the acceptable use of computer equipment at the company. 
                These rules are in place to protect the employee and the company. Inappropriate use exposes the company to risks including virus attacks, compromise of network systems and services, and legal issues.
            </p>
            
            <h2>1. General Use and Ownership</h2>
            <ul>
                <li>Company proprietary information stored on electronic and computing devices whether owned or leased by the company, the employee or a third party, remains the sole property of the company.</li>
                <li>You have a responsibility to promptly report the theft, loss, or unauthorized disclosure of company proprietary information.</li>
                <li>You may access, use or share company proprietary information only to the extent it is authorized and necessary to fulfill your assigned job duties.</li>
            </ul>

            <h2>2. Security and Proprietary Information</h2>
            <p>
                Providing access to another individual, either deliberately or through failure to secure its access, is prohibited.
            </p>
            <ul>
                <li>All computing devices must be secured with a password-protected screensaver with the automatic activation feature set to 10 minutes or less.</li>
                <li>You must lock the screen or log off when the device is unattended.</li>
            </ul>

            <h2>3. Unacceptable Use</h2>
            <p>
                The following activities are, in general, prohibited. Employees may be exempted from these restrictions during the course of their legitimate job responsibilities.
            </p>
            <ul>
                <li>Violating the rights of any person or company protected by copyright, trade secret, patent, or other intellectual property.</li>
                <li>Exporting software, technical information, encryption software or technology, in violation of international or regional export control laws.</li>
                <li>Introduction of malicious programs into the network or server.</li>
            </ul>
            
            <div className="mt-8 p-6 bg-slate-50 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0 mb-1">Download PDF Version</h3>
                    <p className="text-xs text-slate-500 m-0">AUP_v2.4_2025.pdf (1.2 MB)</p>
                </div>
                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    <Download size={18} />
                </button>
            </div>
        </article>
    ),
    byod: (
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl">
            <h1>Bring Your Own Device (BYOD)</h1>
            <p className="lead">Guidelines for using personal devices for work.</p>
            <p>
                Our company grants its employees the privilege of purchasing and using smartphones and tablets of their choosing at work for their convenience. The company reserves the right to revoke this privilege if users do not abide by the policies and procedures outlined below.
            </p>
            {/* More content would go here */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 mt-6">
                <h4 className="text-amber-800 dark:text-amber-400 mt-0 font-bold">Important Notice</h4>
                <p className="text-amber-700 dark:text-amber-300/80 mb-0 text-sm">
                    Reimbursements for BYOD plans are capped at $50/month. Any overages must be covered by the employee. Apply via the Payroll module.
                </p>
            </div>
        </article>
    ),
    return: (
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl">
            <h1>Return & Replacements</h1>
            <p className="lead">Standard operating procedures for handing back IT equipment.</p>
            <p>
                Whether you are upgrading, returning a damaged item, or offboarding, following the correct return procedure ensures a smooth handover and prevents liability charges.
            </p>
            {/* More content would go here */}
            <h3>Damaged Items</h3>
            <p>If returning a physically damaged item, a manager's approval is required before a replacement can be issued.</p>
        </article>
    )
};

export default function AssetDocumentationPage() {
    const [activeTab, setActiveTab] = useState("aup");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex items-center gap-3">
                        <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Knowledge Base</h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">Asset policies and IT documentation</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-72 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search policies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 shrink-0 space-y-2 lg:sticky lg:top-28 lg:self-start">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 mb-4">Categories</h2>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                    activeTab === cat.id 
                                    ? "bg-white dark:bg-[#121212] shadow-sm font-bold text-brand-700 dark:text-brand-400 border border-slate-200 dark:border-slate-800"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 border border-transparent font-medium"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <cat.icon size={18} className={activeTab === cat.id ? "text-brand-500" : "text-slate-400"} />
                                    <span className="text-sm">{cat.name}</span>
                                </div>
                                {activeTab === cat.id && <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />}
                            </button>
                        ))}

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 px-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Quick Links</h2>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
                                        <ExternalLink size={14} /> IT Helpdesk Portal
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
                                        <ExternalLink size={14} /> ISMS Security Portal
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {CONTENT[activeTab]}
                    </div>

                    {/* Optional: Table of Contents for the active article (Right sidebar) */}
                    <div className="hidden xl:block w-56 shrink-0 sticky top-28 self-start">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">On this page</h2>
                        <ul className="space-y-3 border-l-2 border-slate-100 dark:border-slate-800">
                            {/* In a real app, this would be generated from the markdown/headings */}
                            <li className="pl-4 border-l-2 border-brand-500 -ml-[2px]">
                                <a href="#" className="text-xs font-bold text-brand-600 dark:text-brand-400">1. General Use</a>
                            </li>
                            <li className="pl-4">
                                <a href="#" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition">2. Security</a>
                            </li>
                            <li className="pl-4">
                                <a href="#" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition">3. Unacceptable Use</a>
                            </li>
                        </ul>
                    </div>

                </div>

            </main>
        </div>
    );
}
