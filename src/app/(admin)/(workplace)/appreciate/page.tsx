"use client";

import React, { useState } from "react";
import { 
    Award, Star, Heart, ThumbsUp, Medal, Sparkles, 
    MessageSquare, Share2, Plus, X, Search
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const BADGES = [
    { id: "b1", name: "Team Player", icon: ThumbsUp, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { id: "b2", name: "Innovator", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
    { id: "b3", name: "Going Above", icon: Star, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { id: "b4", name: "Problem Solver", icon: Medal, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
    { id: "b5", name: "Culture Champion", icon: Heart, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-500/20" }
];

const EMPLOYEES = [
    { id: "e1", name: "David Smith", role: "Product Designer", avatar: "https://i.pravatar.cc/150?u=david" },
    { id: "e2", name: "Sarah Jenkins", role: "Engineering VP", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { id: "e3", name: "Alex Lee", role: "Frontend Dev", avatar: "https://i.pravatar.cc/150?u=alex" },
    { id: "e4", name: "Emily Stone", role: "Marketing", avatar: "https://i.pravatar.cc/150?u=emily" }
];

const FEED = [
    {
        id: "kf-1",
        sender: EMPLOYEES[1],
        receiver: EMPLOYEES[2],
        badge: BADGES[1],
        message: "Alex went above and beyond this week to ensure our new dashboard release was entirely bug-free. Their innovative approach to state management saved us days of work!",
        likes: 12,
        comments: 3,
        timeAgo: "2 hours ago"
    },
    {
        id: "kf-2",
        sender: EMPLOYEES[3],
        receiver: EMPLOYEES[0],
        badge: BADGES[0],
        message: "Huge shoutout to David for stepping in to help finalize the marketing assets on such short notice. A true team player!",
        likes: 8,
        comments: 1,
        timeAgo: "5 hours ago"
    },
    {
        id: "kf-3",
        sender: { name: "CEO Office", role: "Executive", avatar: "https://i.pravatar.cc/150?u=ceo" },
        receiver: EMPLOYEES[1],
        badge: BADGES[3],
        message: "Recognizing Sarah for successfully navigating the engineering team through the complex Q3 platform migration with zero downtime.",
        likes: 45,
        comments: 12,
        timeAgo: "1 day ago"
    }
];

export default function AppreciatePage() {
    const [isGiveKudosModalOpen, setIsGiveKudosModalOpen] = useState(false);
    
    // Modal State
    const [step, setStep] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const [kudosMessage, setKudosMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleGiveKudos = () => {
        setIsGiveKudosModalOpen(false);
        setStep(1);
        setSelectedEmployee(null);
        setSelectedBadge(null);
        setKudosMessage("");
        // In a real app, this would add to the feed data
        alert("Kudos Given Successfully!"); 
    };

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            Appreciate <Heart className="text-rose-500 fill-rose-500/20" size={24} />
                        </h1>
                        <p className="text-sm text-slate-500">Celebrate wins and recognize your peers.</p>
                    </div>

                    <button 
                        onClick={() => setIsGiveKudosModalOpen(true)}
                        className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Plus size={16} /> Give Kudos
                    </button>
                </div>
            </header>

            <main className="max-w-[1000px] mx-auto px-6 py-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {FEED.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 absolute top-0 left-0 border-2 border-white dark:border-[#121212] z-10">
                                                <Image src={item.sender.avatar} alt={item.sender.name} fill className="object-cover" />
                                            </div>
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 absolute bottom-0 right-0 border-2 border-white dark:border-[#121212] z-0 opacity-80">
                                                <Image src={item.receiver.avatar} alt={item.receiver.name} fill className="object-cover" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                <span className="font-black">{item.sender.name}</span> recognized <span className="font-black">{item.receiver.name}</span>
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{item.timeAgo}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Badge */}
                                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm ${item.badge.bg} ${item.badge.color}`}>
                                        <item.badge.icon size={16} /> {item.badge.name}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-6">
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                                        "{item.message}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                    <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group">
                                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 gap-2 flex items-center">
                                            <ThumbsUp size={16} /> <span>{item.likes}</span>
                                        </div>
                                    </button>
                                    <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group">
                                         <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 gap-2 flex items-center">
                                            <MessageSquare size={16} /> <span>{item.comments}</span>
                                        </div>
                                    </button>
                                    <div className="flex-1" />
                                    <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <Share2 size={16} />
                                    </button>
                                </div>

                            </div>
                        ))}

                    </div>

                    {/* Right Column: Stats & Leaderboard */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-20">
                                <Award size={160} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 mb-6">My Impact</h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-4xl font-black mb-1">12</p>
                                        <p className="text-xs text-indigo-100 font-medium">Kudos Received</p>
                                    </div>
                                    <div>
                                        <p className="text-4xl font-black mb-1">28</p>
                                        <p className="text-xs text-indigo-100 font-medium">Kudos Given</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/20">
                                    <p className="text-xs text-indigo-100 font-medium italic">"You are in the top 10% of appreciators this month!"</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            {/* Give Kudos Modal */}
            {isGiveKudosModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121212] w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="text-brand-500" size={20} /> Give Kudos (Step {step}/3)
                            </h2>
                            <button onClick={() => setIsGiveKudosModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            
                            {/* Step 1: Select Person */}
                            {step === 1 && (
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Who are you recognizing?</h3>
                                    <p className="text-sm text-slate-500 mb-6">Search for a colleague to appreciate.</p>
                                    
                                    <div className="relative mb-6">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            type="text"
                                            placeholder="Search name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                        />
                                    </div>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {EMPLOYEES.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map(emp => (
                                            <div 
                                                key={emp.id}
                                                onClick={() => setSelectedEmployee(emp)}
                                                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                                    selectedEmployee?.id === emp.id 
                                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' 
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        <Image src={emp.avatar} alt={emp.name} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{emp.role}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedEmployee?.id === emp.id ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-slate-700'}`}>
                                                    {selectedEmployee?.id === emp.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 text-right">
                                        <button 
                                            disabled={!selectedEmployee}
                                            onClick={() => setStep(2)}
                                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Badge */}
                            {step === 2 && (
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-brand-600 mb-6 flex items-center gap-1">
                                        &larr; Back
                                    </button>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Badge</h3>
                                    <p className="text-sm text-slate-500 mb-6">Choose the value that best represents their contribution.</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        {BADGES.map((badge) => (
                                            <div 
                                                key={badge.id}
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`p-6 rounded-2xl border text-center cursor-pointer transition-all ${
                                                    selectedBadge?.id === badge.id 
                                                    ? `border-slate-300 dark:border-slate-600 shadow-xl scale-105 ${badge.bg}` 
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 bg-white dark:bg-[#121212] hover:-translate-y-1'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${selectedBadge?.id !== badge.id ? badge.bg : ''} ${badge.color}`}>
                                                    <badge.icon size={24} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{badge.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 text-right">
                                        <button 
                                            disabled={!selectedBadge}
                                            onClick={() => setStep(3)}
                                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Message */}
                            {step === 3 && (
                                <div className="animate-in slide-in-from-right-4 duration-300">
                                    <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-brand-600 mb-6 flex items-center gap-1">
                                        &larr; Back
                                    </button>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Write your message</h3>
                                    <p className="text-sm text-slate-500 mb-6">Tell {selectedEmployee.name.split(' ')[0]} and the company why they are awesome.</p>
                                    
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <Image src={selectedEmployee.avatar} alt={selectedEmployee.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">To: {selectedEmployee.name}</p>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-sm bg-white dark:bg-[#121212] ${selectedBadge.color}`}>
                                                <selectedBadge.icon size={14} /> {selectedBadge.name}
                                            </div>
                                        </div>
                                        
                                        <textarea 
                                            value={kudosMessage}
                                            onChange={(e) => setKudosMessage(e.target.value)}
                                            placeholder="Example: Thanks for staying late to help me debug that critical issue..."
                                            className="w-full h-32 bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none resize-none placeholder:text-slate-400"
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">This will be posted publicly</p>
                                        <button 
                                            disabled={kudosMessage.length < 10}
                                            onClick={handleGiveKudos}
                                            className="px-8 py-3 bg-brand-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-500/30 disabled:opacity-50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                        >
                                            <Sparkles size={16} /> Post Kudos
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
