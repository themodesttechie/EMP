"use client";

import React, { useState } from "react";
import { 
    Search, HelpCircle, ChevronDown, Monitor, HeartPulse, 
    Briefcase, Banknote, ShieldCheck
} from "lucide-react";

// -- MOCK DATA --
const CATEGORIES = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "it", name: "IT Support", icon: Monitor },
    { id: "hr", name: "HR & Benefits", icon: HeartPulse },
    { id: "payroll", name: "Payroll", icon: Banknote },
    { id: "facilities", name: "Facilities", icon: Briefcase },
    { id: "security", name: "Security", icon: ShieldCheck }
];

const FAQS = [
    {
        id: "faq-1",
        category: "it",
        question: "How do I connect to the corporate VPN?",
        answer: "You can connect to the corporate VPN using the Cisco Secure Client installed on your company machine. Open the app, enter 'vpn.company.com' as the server address, and log in with your standard SSO credentials. You will be prompted to approve a Duo 2FA push on your mobile device."
    },
    {
        id: "faq-2",
        category: "it",
        question: "How do I request a software license or completely new hardware?",
        answer: "Head over to the 'Asset Management' > 'Request Asset' page from the main sidebar. You can browse standard hardware options there or submit a custom request for specialized software or equipment. Manager approval is usually required for paid licenses."
    },
    {
        id: "faq-3",
        category: "hr",
        question: "How is PTO accrued and what is the maximum carryover?",
        answer: "PTO is accrued bi-weekly at a rate determined by your tenure. Employees can carry over a maximum of 40 hours into the next calendar year. Any unused hours over 40 at the end of December will be forfeited unless state laws prevent it. You can check your exact accrual rate in the 'Time Management' module."
    },
    {
        id: "faq-4",
        category: "hr",
        question: "Where can I find details about our 401(k) matching?",
        answer: "The company matches 100% of your contributions up to the first 4% of your eligible compensation, and 50% on the next 2%. You can manage your contributions and view vesting schedules directly in the Fidelity portal, accessible via Okta."
    },
    {
        id: "faq-5",
        category: "payroll",
        question: "When are performance bonuses paid out?",
        answer: "Annual performance bonuses are typically finalized in February and paid out on the second payroll cycle of March. Eligibility metrics are based on company performance and individual reviews conducted during the January evaluation period."
    },
    {
        id: "faq-6",
        category: "payroll",
        question: "How do I update my direct deposit information?",
        answer: "Navigate to 'Pay' > 'Bank & Payment Details'. You can add up to 3 different bank accounts and specify exact amounts or percentages to be deposited into each. Please allow 1-2 pay cycles for changes to take full effect."
    },
    {
        id: "faq-7",
        category: "facilities",
        question: "How do I book a meeting room in the New York office?",
        answer: "Meeting rooms can be booked directly through Google Calendar by adding a 'Room' resource, or by using the Robin workplace app. Standard rooms have a 2-hour maximum booking limit to ensure availability."
    },
    {
        id: "faq-8",
        category: "security",
        question: "What should I do if I lose my employee badge?",
        answer: "Immediately report the lost badge to Security at security@company.com or call the 24/7 hotline so the badge can be deactivated. A replacement badge will be issued at the front desk upon your next visit; a $25 replacement fee may apply."
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

    // Filter Logic
    const filteredFaqs = FAQS.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleAccordion = (id: string) => {
        if (openQuestionId === id) {
            setOpenQuestionId(null);
        } else {
            setOpenQuestionId(id);
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header / Hero */}
            <header className="px-6 py-16 md:py-24 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="max-w-[800px] mx-auto relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">How can we help you?</h1>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md scale-[1.02] group-hover:scale-105 group-hover:bg-white/30 transition-all duration-300" />
                        <div className="relative flex items-center bg-white dark:bg-[#121212] rounded-2xl p-2 shadow-xl border border-white/50 dark:border-slate-800 focus-within:ring-4 ring-brand-500/30 transition-all">
                            <Search className="text-slate-400 ml-4 mr-2" size={24} />
                            <input 
                                type="text"
                                placeholder="Search 'VPN', 'Benefits', 'Payroll'..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-2 py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-lg focus:outline-none"
                            />
                            <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 py-12 pb-32">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Sidebar: Categories */}
                    <div className="lg:col-span-4 lg:col-start-1 h-max top-8 sticky">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Browse by Topic</h3>
                        <div className="space-y-2">
                            {CATEGORIES.map(category => (
                                <button 
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setSearchQuery(""); // clear search when category clicked
                                        setOpenQuestionId(null);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        selectedCategory === category.id 
                                        ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm"
                                        : "bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <category.icon size={20} className={selectedCategory === category.id ? "text-brand-500" : "text-slate-400"} />
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{category.name}</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedCategory === category.id ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        {category.id === "all" ? FAQS.length : FAQS.filter(f => f.category === category.id).length}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Support Card */}
                        <div className="mt-8 p-6 rounded-3xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-center">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                                <HelpCircle size={24} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Still need help?</h4>
                            <p className="text-xs text-slate-500 mb-6">If you couldn't find the answer you're looking for, please raise a ticket.</p>
                            <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Content: FAQs Accordion */}
                    <div className="lg:col-span-8">
                        <div className="mb-8 flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                    {searchQuery ? "Search Results" : CATEGORIES.find(c => c.id === selectedCategory)?.name || "All FAQs"}
                                </h2>
                                {searchQuery && (
                                    <p className="text-sm text-slate-500 mt-1">Showing results for "{searchQuery}"</p>
                                )}
                            </div>
                        </div>

                        {filteredFaqs.length === 0 ? (
                            <div className="py-24 text-center text-slate-500">
                                <Search size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-bold text-slate-900 dark:text-white">No matches found</p>
                                <p className="text-sm mt-1">Try adjusting your search terms or relaxing the category filter.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFaqs.map((faq) => {
                                    const isOpen = openQuestionId === faq.id;
                                    return (
                                        <div 
                                            key={faq.id} 
                                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                                isOpen 
                                                ? "bg-white dark:bg-[#121212] border-brand-200 dark:border-brand-800/50 shadow-md ring-1 ring-brand-500/10" 
                                                : "bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                            }`}
                                        >
                                            <button 
                                                onClick={() => toggleAccordion(faq.id)}
                                                className="w-full p-6 text-left flex items-start justify-between gap-6"
                                            >
                                                <h3 className={`text-base font-bold leading-snug pr-8 transition-colors ${isOpen ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white group-hover:text-brand-600'}`}>
                                                    {faq.question}
                                                </h3>
                                                <div className={`shrink-0 p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                    <ChevronDown size={16} />
                                                </div>
                                            </button>
                                            
                                            <div 
                                                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6 px-6' : 'max-h-0 opacity-0 overflow-hidden px-6'}`}
                                            >
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                        {faq.answer}
                                                    </p>
                                                    
                                                    {/* Helpful Feedback (Visual styling only) */}
                                                    <div className="mt-6 flex items-center gap-4">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Was this helpful?</span>
                                                        <div className="flex gap-2">
                                                            <button className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">Yes</button>
                                                            <button className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">No</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
