"use client";

import React, { useState } from "react";
import { 
    Laptop, Monitor, Smartphone, Repeat, CornerDownLeft, 
    ArrowRightLeft, CheckCircle2, PackageSearch, Activity, FileText, RefreshCw
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const MY_ASSETS = [
    { id: "AST-2024-001", name: "MacBook Pro 16\"", category: "Laptop", spec: "M3 Max / 32GB RAM", icon: Laptop, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
    { id: "AST-2024-045", name: "Dell 27\" 4K", category: "Monitor", spec: "U2723QE", icon: Monitor, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { id: "AST-2024-112", name: "iPhone 15 Pro", category: "Mobile", spec: "256GB", icon: Smartphone, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" }
];

const CATALOG = [
    { id: "cat-lap-1", name: "MacBook Pro 14\"", category: "Laptop", spec: "M3 Pro / 16GB RAM", icon: Laptop },
    { id: "cat-lap-2", name: "Dell XPS 15", category: "Laptop", spec: "i9 / 32GB RAM", icon: Laptop },
    { id: "cat-mon-1", name: "Apple Studio Display", category: "Monitor", spec: "27\" 5K Retina", icon: Monitor },
    { id: "cat-mob-1", name: "iPhone 16 Pro", category: "Mobile", spec: "256GB / Desert Titanium", icon: Smartphone }
];

export default function ExchangeAssetPage() {
    const [selectedCurrentAsset, setSelectedCurrentAsset] = useState<any>(null);
    const [selectedNewAsset, setSelectedNewAsset] = useState<any>(null);
    const [justification, setJustification] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Filter catalog based on the category of the currently selected asset (if any)
    const availableCatalog = selectedCurrentAsset 
        ? CATALOG.filter(item => item.category === selectedCurrentAsset.category)
        : CATALOG;

    const isReadyToExchange = selectedCurrentAsset && selectedNewAsset && justification.length >= 5;

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
                <div>
                   <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Exchange Asset</h1>
                   <p className="text-xs font-medium text-slate-500 mt-1">Upgrade or swap your current hardware for a new model</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500">
                    <span className={`px-3 py-1.5 rounded-md ${selectedCurrentAsset ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : ''}`}>1. Select Asset</span>
                    <ChevronRight className="text-slate-300" size={14} />
                    <span className={`px-3 py-1.5 rounded-md ${selectedNewAsset ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : ''}`}>2. Select Replacement</span>
                    <ChevronRight className="text-slate-300" size={14} />
                    <span className={`px-3 py-1.5 rounded-md ${justification.length > 5 ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : ''}`}>3. Request</span>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8 pb-32">
                
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Exchange Request Submitted!</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                            Your request to exchange the <b>{selectedCurrentAsset?.name}</b> for a <b>{selectedNewAsset?.name}</b> has been sent for approval.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.href='/my-assets'} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors">
                                Back to My Assets
                            </button>
                        </div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Select Current Asset */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">1</span> 
                            Select Asset to Return
                        </h2>
                        
                        <div className="space-y-4">
                            {MY_ASSETS.map(asset => (
                                <div 
                                    key={asset.id}
                                    onClick={() => {
                                        setSelectedCurrentAsset(asset);
                                        // Reset new asset if category changes
                                        if (selectedNewAsset && selectedNewAsset.category !== asset.category) {
                                            setSelectedNewAsset(null);
                                        }
                                    }}
                                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                                        selectedCurrentAsset?.id === asset.id 
                                        ? "bg-rose-50 border-rose-500 ring-4 ring-rose-500/10 dark:bg-rose-500/10 dark:border-rose-500 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-slate-300 dark:bg-[#121212] dark:border-slate-800 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl ${asset.color}`}>
                                        <asset.icon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{asset.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.id}</p>
                                    </div>
                                    {selectedCurrentAsset?.id === asset.id && (
                                        <CheckCircle2 size={20} className="text-rose-600 dark:text-rose-500 flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Middle Column: Replacement Asset Selection */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">2</span> 
                            Select Replacement Asset
                        </h2>
                        
                        <div className="space-y-4">
                            {!selectedCurrentAsset ? (
                                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                                    <Activity className="mx-auto text-slate-400 mb-2" size={32} />
                                    <p className="text-sm font-bold text-slate-500">Select an asset to return first</p>
                                </div>
                            ) : availableCatalog.length === 0 ? (
                                <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#121212] text-center">
                                    <p className="text-sm font-bold text-slate-500">No replacements available for this category.</p>
                                </div>
                            ) : (
                                availableCatalog.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedNewAsset(item)}
                                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4 ${
                                            selectedNewAsset?.id === item.id 
                                            ? "bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10 dark:bg-emerald-500/10 dark:border-emerald-500 shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300 dark:bg-[#121212] dark:border-slate-800 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className={`p-3 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`}>
                                            <item.icon size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{item.spec}</p>
                                        </div>
                                        {selectedNewAsset?.id === item.id && (
                                            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Justification & Summary */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">3</span> 
                            Exchange Details
                        </h2>
                        
                        <div className={`bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-opacity duration-500 ${selectedCurrentAsset && selectedNewAsset ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                Reason for Exchange <span className="text-rose-500">*</span>
                            </label>
                            <textarea 
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="E.g., Device performance is too slow for compiling new projects..."
                                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-all placeholder:text-slate-400 mb-4"
                            />

                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    <span>Summary</span>
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded text-xs font-semibold shadow-sm">
                                        <span className="text-rose-600">Return</span>
                                        <span className="truncate ml-2">{selectedCurrentAsset?.name || "---"}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded text-xs font-semibold shadow-sm">
                                        <span className="text-emerald-600">Receive</span>
                                        <span className="truncate ml-2">{selectedNewAsset?.name || "---"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button 
                                    disabled={!isReadyToExchange}
                                    onClick={() => setIsSubmitted(true)}
                                    className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        isReadyToExchange
                                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:-translate-y-0.5"
                                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                                    }`}
                                >
                                    Submit Exchange Request <RefreshCw size={16} />
                                </button>
                                <p className="text-[10px] text-center text-slate-500 mt-3 font-medium">By submitting, you agree to return your current device in its present condition upon receipt of the replacement.</p>
                            </div>
                        </div>
                    </div>

                </div>
                )}
            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-40">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
                        {(!selectedCurrentAsset || !selectedNewAsset) ? "Select both assets to proceed" : "Ready to submit workflow"}
                    </p>
                    {/* The submit button is now inside the main content area, so this one is removed or conditionally rendered */}
                </div>
            </div>

        </div>
    );
}

// Simple internal icon for layout visualization
const ChevronRight = ({className, size}: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
