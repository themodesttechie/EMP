"use client";

import React, { useState } from "react";
import { 
    MessageCircleHeart, Shield, AlertTriangle, Lightbulb, 
    Send, CheckCircle2, Building, Users, Briefcase
} from "lucide-react";

const TOPICS = [
    { id: "culture", name: "Company Culture", icon: MessageCircleHeart, desc: "Feedback on environment, values, and morale" },
    { id: "processes", name: "Process & Tools", icon: Briefcase, desc: "Ideas to improve efficiency or software" },
    { id: "leadership", name: "Leadership & Management", icon: Users, desc: "Constructive feedback for leadership" },
    { id: "facilities", name: "Workspace & Facilities", icon: Building, desc: "Office environment and amenities" },
    { id: "innovation", name: "New Ideas / Innovation", icon: Lightbulb, desc: "Suggestions for new products or initiatives" },
    { id: "concern", name: "Report a Concern", icon: AlertTriangle, desc: "Confidential reporting of issues", critical: true }
];

export default function FeedbackPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isFormValid = selectedTopic && title.length > 5 && message.length > 20;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!isFormValid) return;
        setIsSubmitted(true);
    };

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="px-6 py-12 md:py-16 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-rose-500" />
                <div className="max-w-[800px] mx-auto relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Your Voice Matters</h1>
                    <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                        We are committed to building a better workplace together. Share your feedback, suggestions, or concerns directly with the leadership team.
                    </p>
                </div>
            </header>

            <main className="max-w-[800px] mx-auto px-6 py-12 pb-32">
                
                {isSubmitted ? (
                    <div className="bg-white dark:bg-[#121212] p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Thank You!</h2>
                        <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
                            Your feedback has been securely submitted. {isAnonymous ? "As requested, your submission is completely anonymous." : "Our team reviews all submissions and will follow up if necessary."}
                        </p>
                        <button 
                            onClick={() => {
                                setIsSubmitted(false);
                                setTitle("");
                                setMessage("");
                                setSelectedTopic(null);
                            }}
                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Submit Another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-12">
                        
                        {/* Section 1: Topic */}
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs">1</span> 
                                Select Category
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {TOPICS.map(topic => (
                                    <div 
                                        key={topic.id}
                                        onClick={() => setSelectedTopic(topic.id)}
                                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 group ${
                                            selectedTopic === topic.id 
                                            ? `bg-brand-50 dark:bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/20 shadow-md ${topic.critical ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 ring-rose-500/20' : ''}`
                                            : "bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${selectedTopic === topic.id ? (topic.critical ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-brand-500 text-white shadow-brand-500/30') : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'} transition-colors shadow-sm`}>
                                                <topic.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{topic.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{topic.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 2: Content */}
                        <section className={`transition-opacity duration-500 ${selectedTopic ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs">2</span> 
                                Your Feedback
                            </h3>
                            
                            <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Subject <span className="text-rose-500">*</span></label>
                                        <input 
                                            type="text"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="Brief summary of your feedback"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Details <span className="text-rose-500">*</span></label>
                                        <textarea 
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Please provide as much context and detail as possible. If making a suggestion, how would it improve our workplace?"
                                            className="w-full h-40 px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none leading-relaxed"
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Minimum 20 characters</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${message.length >= 20 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {message.length} / 20+
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Privacy & Submit */}
                        <section className={`transition-opacity duration-500 ${selectedTopic && title.length > 5 && message.length > 20 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 p-6 bg-slate-50 dark:bg-[#1a1a1a] rounded-[2rem] border border-slate-200 dark:border-slate-800">
                                
                                {/* Anonymity Toggle */}
                                <div className="flex-1 flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-[#121212] rounded-xl shadow-sm text-slate-500 shrink-0">
                                        <Shield size={24} className={isAnonymous ? "text-emerald-500" : ""} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                                            Submit Anonymously
                                            {/* Toggle UI */}
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isAnonymous ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                                            If enabled, your name and department will be scrubbed from this submission. Leadership will not be able to follow up with you directly.
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800" />

                                {/* Action */}
                                <div className="flex flex-col justify-center">
                                    <button 
                                        type="submit"
                                        disabled={!isFormValid}
                                        className="w-full md:w-auto px-10 py-4 bg-brand-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-brand-700 hover:-translate-y-0.5 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        Submit Feedback <Send size={16} />
                                    </button>
                                </div>

                            </div>
                        </section>

                    </form>
                )}
            </main>
        </div>
    );
}
