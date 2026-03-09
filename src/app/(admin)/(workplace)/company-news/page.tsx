"use client";

import React, { useState } from "react";
import { 
    Newspaper, ArrowUpRight, Clock, User, Tag, ChevronRight, Bookmark
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const CATEGORIES = ["All", "Product", "Culture", "Engineering", "Events"];

const FEATURED_NEWS = {
    id: "news-feat-1",
    title: "Introducing our new AI-powered platform features for Q4",
    excerpt: "We're thrilled to announce the rollout of our next-generation AI tools designed to streamline your daily workflows. Dive into the details and learn how to leverage these new capabilities.",
    category: "Product",
    date: "Oct 24, 2024",
    readTime: "5 min read",
    author: { name: "Elena Rodriguez", role: "VP of Product", avatar: "https://i.pravatar.cc/150?u=elena" },
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=600&fit=crop"
};

const NEWS_FEED = [
    {
        id: "news-001",
        title: "Q3 All-Hands Recap: Record Growth & New Horizons",
        excerpt: "Missed the All-Hands? Get the full breakdown of our Q3 financial results, team achievements, and a sneak peek at our roadmap for the rest of the year.",
        category: "Company",
        date: "Oct 20, 2024",
        readTime: "8 min read",
        author: { name: "Corporate Comms", avatar: "https://i.pravatar.cc/150?u=comms" },
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop"
    },
    {
        id: "news-002",
        title: "Engineering Blog: Migrating to Next.js 14",
        excerpt: "Our core web team shares the technical journey, challenges, and massive performance gains from our recent migration to Next.js 14.",
        category: "Engineering",
        date: "Oct 18, 2024",
        readTime: "12 min read",
        author: { name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=sarah" },
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"
    },
    {
        id: "news-003",
        title: "Employee Spotlight: Getting to know the Design Team",
        excerpt: "Step into the creative process of our design team. We sit down with David Smith to discuss inspiration, accessibility, and the future of our design system.",
        category: "Culture",
        date: "Oct 15, 2024",
        readTime: "4 min read",
        author: { name: "HR Comms", avatar: "https://i.pravatar.cc/150?u=hr" },
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
    },
    {
        id: "news-004",
        title: "Annual Charity Hackathon Registration Open",
        type: "Events",
        excerpt: "Form your teams and get ready! Our annual 48-hour charity hackathon is back. Learn about this year's themes, prizes, and how you can participate.",
        category: "Events",
        date: "Oct 12, 2024",
        readTime: "3 min read",
        author: { name: "Culture Committee", avatar: "https://i.pravatar.cc/150?u=culture" },
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop"
    }
];

export default function CompanyNewsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredNews = selectedCategory === "All" 
        ? NEWS_FEED 
        : NEWS_FEED.filter(news => news.category === selectedCategory);

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="px-6 py-8 md:py-12 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1400px] mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 mb-6">
                        <Newspaper size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">The Inside Scoop</h1>
                    <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
                        Stories, updates, and deep dives from around the company. Stay informed and inspired.
                    </p>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-12 pb-32">
                
                {/* Featured Hero Article */}
                {selectedCategory === "All" && (
                    <div className="mb-16 group cursor-pointer relative rounded-[2.5rem] overflow-hidden bg-black isolation-auto shadow-xl">
                        {/* Background Image Container */}
                        <div className="absolute inset-0 z-0">
                            <Image 
                                src={FEATURED_NEWS.image} 
                                alt={FEATURED_NEWS.title}
                                fill
                                className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col justify-end min-h-[500px] p-8 md:p-12 lg:p-16">
                            
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-3 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    {FEATURED_NEWS.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-300 text-xs font-bold uppercase tracking-widest">
                                    <Clock size={14} /> {FEATURED_NEWS.readTime}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-4xl tracking-tight">
                                {FEATURED_NEWS.title}
                            </h2>
                            <p className="text-lg text-slate-300 mb-8 max-w-3xl leading-relaxed">
                                {FEATURED_NEWS.excerpt}
                            </p>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative">
                                        <Image src={FEATURED_NEWS.author.avatar} alt={FEATURED_NEWS.author.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{FEATURED_NEWS.author.name}</p>
                                        <p className="text-xs text-slate-400">{FEATURED_NEWS.author.role}  ·  {FEATURED_NEWS.date}</p>
                                    </div>
                                </div>

                                <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group-hover:pr-4">
                                    Read Article <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feed Filters */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Latest News</h3>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                                    selectedCategory === cat 
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                    : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNews.map(news => (
                        <div key={news.id} className="group cursor-pointer flex flex-col h-full">
                            
                            {/* Card Image */}
                            <div className="relative h-64 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-6">
                                <Image 
                                    src={news.image} 
                                    alt={news.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                        {news.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <button className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                                        <Bookmark size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {news.readTime}</span>
                                    <span>·</span>
                                    <span>{news.date}</span>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                    {news.title}
                                </h3>

                                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                                    {news.excerpt}
                                </p>

                                {/* Author footer */}
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative">
                                        <Image src={news.author.avatar} alt={news.author.name} fill className="object-cover" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{news.author.name}</p>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
