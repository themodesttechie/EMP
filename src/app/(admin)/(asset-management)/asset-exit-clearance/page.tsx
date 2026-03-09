"use client";

import React, { useState } from "react";
import { 
    CheckCircle2, Circle, AlertCircle, Laptop, Smartphone, 
    Monitor, ArrowRight, UploadCloud, FileCheck, Info
} from "lucide-react";

// -- MOCK DATA --
const EXIT_TASKS = [
    {
        id: "t1",
        title: "Return Assigned Hardware",
        desc: "Hand over all assigned physical devices to the IT Service Desk.",
        status: "pending", // pending, partial, completed
        items: [
            { id: "i1", name: "MacBook Pro 16\"", category: "Laptop", status: "pending", defaultIcon: Laptop },
            { id: "i2", name: "iPhone 15 Pro", category: "Mobile", status: "returned", defaultIcon: Smartphone },
            { id: "i3", name: "Dell 27\" Monitor", category: "Monitor", status: "cleared", defaultIcon: Monitor },
        ]
    },
    {
        id: "t2",
        title: "Software & Cloud Access",
        desc: "Ensure all company data is synced and local files are wiped. IT will revoke access on your final day.",
        status: "completed",
        items: []
    },
    {
        id: "t3",
        title: "Sign Digital Clearance Form",
        desc: "Acknowledge that all items have been returned and data policies have been followed.",
        status: "pending",
        items: []
    }
];

export default function AssetExitClearancePage() {
    // Calculate overall progress
    const totalSubItems = EXIT_TASKS[0].items.length;
    const completedSubItems = EXIT_TASKS[0].items.filter(i => i.status === 'returned' || i.status === 'cleared').length;
    
    // Simplistic progress calc
    let score = 0;
    if (EXIT_TASKS[1].status === 'completed') score += 1;
    if (EXIT_TASKS[2].status === 'completed') score += 1;
    
    const progressPercent = Math.round(((completedSubItems + score) / (totalSubItems + 2)) * 100);

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-8 shadow-sm text-center">
                <div className="max-w-[800px] mx-auto">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 mb-4">
                        <FileCheck size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">IT Asset Offboarding</h1>
                    <p className="text-sm text-slate-500 max-w-lg mx-auto">
                        Track the return of your assigned devices and software access revocation to complete your IT exit clearance.
                    </p>
                </div>
            </header>

            <main className="max-w-[800px] mx-auto px-6 py-12">
                
                {/* Progress Bar Component */}
                <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8 shadow-sm text-center relative overflow-hidden">
                    {/* Decorative Background Ring */}
                    <div className="absolute -right-12 -top-12 w-48 h-48 border-[24px] border-emerald-50 dark:border-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Clearance Status</h2>
                    <div className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        {progressPercent}%
                    </div>
                    
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    
                    {progressPercent === 100 ? (
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">All IT Clearance tasks completed! 🎉</p>
                    ) : (
                        <p className="text-slate-500 text-sm">{totalSubItems - completedSubItems + (EXIT_TASKS[2].status !== 'completed' ? 1 : 0)} tasks remaining</p>
                    )}
                </div>

                {/* Tasks List */}
                <div className="space-y-6">
                    {EXIT_TASKS.map((task, index) => (
                        <div 
                            key={task.id}
                            className={`bg-white dark:bg-[#121212] border rounded-2xl p-6 transition-all ${
                                task.status === 'completed' 
                                ? "border-emerald-200 dark:border-emerald-500/30" 
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    {task.status === 'completed' ? (
                                        <CheckCircle2 size={24} className="text-emerald-500" />
                                    ) : task.status === 'partial' ? (
                                        <AlertCircle size={24} className="text-amber-500" />
                                    ) : (
                                        <Circle size={24} className="text-slate-300 dark:text-slate-700" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-lg font-bold mb-1 ${task.status === 'completed' ? "text-emerald-900 dark:text-emerald-400 line-through opacity-70" : "text-slate-900 dark:text-white"}`}>
                                        Step {index + 1}: {task.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{task.desc}</p>

                                    {/* Render Sub-items if any */}
                                    {task.items.length > 0 && (
                                        <div className="space-y-3 mt-4">
                                            {task.items.map(item => (
                                                <div 
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${
                                                            item.status === 'cleared' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                            item.status === 'returned' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                                                            'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}>
                                                            <item.defaultIcon size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.name}</p>
                                                            <p className="text-[10px] uppercase tracking-widest text-slate-500">{item.category}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                                                        item.status === 'cleared' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                        item.status === 'returned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                    }`}>
                                                        {item.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                            
                                            <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-start gap-2 text-xs text-brand-700 dark:text-brand-300">
                                                <Info size={16} className="mt-0.5 shrink-0" />
                                                <p>Drop off hardware at IT Desk (Tower A, 4th Floor) between 9 AM - 5 PM. "Returned" status means IT has received it; "Cleared" means it has been verified working.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button for Form */}
                                    {task.id === 't3' && task.status !== 'completed' && (
                                        <button 
                                            disabled={completedSubItems !== totalSubItems}
                                            className={`mt-4 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                                                completedSubItems === totalSubItems
                                                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                                            }`}
                                        >
                                            Sign Clearance Form <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Sign-off Note */}
                <div className="mt-8 text-center bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        If you have any questions regarding your IT offboarding or have lost an item, please contact <a href="mailto:it-offboarding@company.com" className="text-brand-600 dark:text-brand-400 hover:underline">it-offboarding@company.com</a> immediately to prevent delays in your final fnf settlement.
                    </p>
                </div>

            </main>
        </div>
    );
}
