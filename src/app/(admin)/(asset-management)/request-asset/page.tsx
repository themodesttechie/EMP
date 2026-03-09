"use client";

import React, { useState } from "react";
import { 
    Laptop, Monitor, Smartphone, Mouse, Headphones, Armchair, 
    MonitorPlay, ShieldCheck, ChevronRight, CheckCircle2, AlertCircle, FileText
} from "lucide-react";

// -- Data --
const CATEGORIES = [
    { id: "it_hardware", name: "IT Hardware", icon: Laptop, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
    { id: "accessories", name: "Accessories", icon: Headphones, color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
    { id: "software", name: "Software Licenses", icon: MonitorPlay, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { id: "furniture", name: "Office Furniture", icon: Armchair, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
];

const CATALOG: Record<string, any[]> = {
    it_hardware: [
        { id: "mac_16", name: "MacBook Pro 16\"", spec: "M3 Max / 32GB RAM / 1TB SSD", waitTime: "2-3 Days" },
        { id: "mac_14", name: "MacBook Pro 14\"", spec: "M3 Pro / 16GB RAM / 512GB SSD", waitTime: "1-2 Days" },
        { id: "dell_xps", name: "Dell XPS 15", spec: "i9 / 32GB RAM / 1TB SSD", waitTime: "2-3 Days" },
        { id: "iphone_15", name: "iPhone 15 Pro", spec: "256GB / Titanium", waitTime: "1 Week" },
    ],
    accessories: [
        { id: "mx_master", name: "Logitech MX Master 3S", spec: "Wireless Mouse", waitTime: "1 Day" },
        { id: "mx_keys", name: "Logitech MX Keys", spec: "Wireless Keyboard", waitTime: "1 Day" },
        { id: "sony_wh", name: "Sony WH-1000XM5", spec: "Noise Cancelling", waitTime: "3-4 Days" },
        { id: "dell_27", name: "Dell 27\" 4K Monitor", spec: "U2723QE", waitTime: "2 Days" },
    ]
};

export default function RequestAssetPage() {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    const isStepValid = () => {
        if (step === 1) return selectedCategory !== null;
        if (step === 2) return selectedAsset !== null;
        if (step === 3) return reason.length > 10;
        return true;
    };

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
                <div>
                   <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Request Asset</h1>
                   <p className="text-xs font-medium text-slate-500 mt-1">Submit a new request for IT or Office equipment</p>
                </div>
                {/* Progress Indicators */}
                <div className="hidden sm:flex items-center gap-2">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                step === num ? 'bg-brand-600 text-white' : 
                                step > num ? 'bg-emerald-500 text-white' : 
                                'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                                {step > num ? <CheckCircle2 size={12} /> : num}
                            </div>
                            {num < 3 && <div className={`w-8 h-px ${step > num ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
                
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Request Submitted Successfully!</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                            Your asset request has been routed to your manager for approval. Once approved, the IT team will dispatch the hardware to you.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.href='/my-assets'} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors">
                                View My Assets
                            </button>
                            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-700 transition-colors">
                                Make Another Request
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Step 1: Category */}
                        {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">What do you need?</h2>
                        <p className="text-sm text-slate-500 mb-8">Select the category of the asset you are requesting.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 ${
                                        selectedCategory === cat.id 
                                        ? "bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 dark:bg-brand-500/10 dark:border-brand-500" 
                                        : "bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50 dark:bg-[#121212] dark:border-slate-800 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl ${cat.color}`}>
                                        <cat.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Browse standard {cat.name.toLowerCase()} items.</p>
                                    </div>
                                    
                                    {/* Selected Checkmark */}
                                    {selectedCategory === cat.id && (
                                        <div className="absolute top-4 right-4 text-brand-600 dark:text-brand-500">
                                            <CheckCircle2 size={20} className="fill-brand-100 dark:fill-brand-900/50" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Item */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={handlePrev} className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-6">
                            &larr; Back to Categories
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select Item</h2>
                        <p className="text-sm text-slate-500 mb-8">Choose a standard item from the catalog.</p>
                        
                        <div className="space-y-3">
                            {CATALOG[selectedCategory || "it_hardware"]?.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => setSelectedAsset(item.id)}
                                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                                        selectedAsset === item.id 
                                        ? "bg-brand-50 border-brand-500 dark:bg-brand-500/10 dark:border-brand-500" 
                                        : "bg-white border-slate-200 hover:border-slate-300 dark:bg-[#121212] dark:border-slate-800 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                            selectedAsset === item.id 
                                            ? "border-brand-600 bg-brand-600 text-white" 
                                            : "border-slate-300 dark:border-slate-600"
                                        }`}>
                                            {selectedAsset === item.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{item.spec}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            Est: {item.waitTime}
                                        </span>
                                    </div>
                                </button>
                            ))}

                            {/* Custom Order Option */}
                            <button 
                                onClick={() => setSelectedAsset("custom")}
                                className={`w-full p-4 rounded-xl border border-dashed flex items-center justify-between transition-all duration-300 mt-6 ${
                                    selectedAsset === "custom"
                                    ? "bg-brand-50 border-brand-500 border-solid dark:bg-brand-500/10 dark:border-brand-500" 
                                    : "bg-transparent border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
                                }`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                        selectedAsset === "custom" 
                                        ? "border-brand-600 bg-brand-600 text-white" 
                                        : "border-slate-300 dark:border-slate-600"
                                    }`}>
                                        {selectedAsset === "custom" && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-700 dark:text-slate-300">Don't see what you need?</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Submit a custom request (requires VP approval)</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Justification */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={handlePrev} className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-6">
                            &larr; Back to Catalog
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business Justification</h2>
                        <p className="text-sm text-slate-500 mb-8">Please explain why you need this asset.</p>
                        
                        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Reason for Request <span className="text-rose-500">*</span>
                            </label>
                            <textarea 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="E.g., I need a secondary monitor for analyzing large spreadsheets, as my current setup is hindering productivity..."
                                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-all placeholder:text-slate-400"
                            />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 text-right">
                                Minimum 10 characters
                            </p>

                            <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-start gap-3">
                                <ShieldCheck className="text-brand-600 dark:text-brand-400 flex-shrink-0" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-brand-900 dark:text-brand-200">Approval Workflow</h4>
                                    <p className="text-xs text-brand-700 dark:text-brand-400 mt-1 leading-relaxed">
                                        This request will be routed to your direct manager, <span className="font-bold">Sarah Jenkins</span>. 
                                        Once approved, IT will process the fulfillment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </>
                )}

            </main>

            {/* Sticky Bottom Actions */}
            {!isSubmitted && (
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-40">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Step {step} of 3
                        </p>
                        <button 
                            onClick={step === 3 ? () => setIsSubmitted(true) : handleNext}
                            disabled={!isStepValid()}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${
                                isStepValid() 
                                ? "bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-0.5 shadow-brand-600/20" 
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                            }`}
                        >
                            {step === 3 ? "Submit Request" : "Continue"} 
                            {step !== 3 && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
