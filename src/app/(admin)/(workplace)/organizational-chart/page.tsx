"use client";

import React, { useState } from "react";
import { 
    Users, ChevronDown, ChevronRight, User, Maximize2, ZoomIn, ZoomOut, Compass
} from "lucide-react";
import Image from "next/image";

// -- MOCK ORG DATA --
// Simplified hierarchical structure
const ORG_DATA = {
    id: "ceo-1",
    name: "Alex Sterling",
    role: "Chief Executive Officer",
    department: "Executive",
    avatar: "https://i.pravatar.cc/150?u=alex",
    directReports: [
        {
            id: "vp-eng-1",
            name: "Sarah Jenkins",
            role: "VP of Engineering",
            department: "Engineering",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            directReports: [
                {
                    id: "eng-m-1",
                    name: "Michael Chang",
                    role: "Engineering Manager",
                    department: "Engineering",
                    avatar: "https://i.pravatar.cc/150?u=michael",
                    directReports: [
                        { id: "dev-1", name: "Alex Lee", role: "Frontend Developer", department: "Engineering", avatar: "https://i.pravatar.cc/150?u=alexlee" },
                        { id: "dev-2", name: "Priya Patel", role: "Backend Developer", department: "Engineering", avatar: "https://i.pravatar.cc/150?u=priya" }
                    ]
                },
                {
                    id: "dev-3",
                    name: "Marcus Cole",
                    role: "Lead Architect",
                    department: "Engineering",
                    avatar: "https://i.pravatar.cc/150?u=marcuscole"
                }
            ]
        },
        {
            id: "vp-prod-1",
            name: "Elena Rodriguez",
            role: "VP of Product",
            department: "Product",
            avatar: "https://i.pravatar.cc/150?u=elena",
            directReports: [
                { id: "des-1", name: "David Smith", role: "Sr. Product Designer", department: "Design", avatar: "https://i.pravatar.cc/150?u=david" },
                { id: "pm-1", name: "Nina Taylor", role: "Product Manager", department: "Product", avatar: "https://i.pravatar.cc/150?u=nina" }
            ]
        },
        {
            id: "vp-hr-1",
            name: "Amanda Simmons",
            role: "Chief People Officer",
            department: "HR",
            avatar: "https://i.pravatar.cc/150?u=amanda",
            directReports: [
                { id: "hr-1", name: "Jessica Row", role: "HR Business Partner", department: "HR", avatar: "https://i.pravatar.cc/150?u=jessica" }
            ]
        }
    ]
};

// Recursive Node Component
const OrgNode = ({ node, isRoot = false }: { node: any, isRoot?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.directReports && node.directReports.length > 0;

    return (
        <div className="flex flex-col items-center">
            
            {/* The Node Card */}
            <div className={`relative bg-white dark:bg-[#121212] border ${isRoot ? 'border-brand-500 shadow-brand-500/20 shadow-xl' : 'border-slate-200 dark:border-slate-800 shadow-sm'} rounded-2xl p-4 min-w-[220px] text-center transition-all hover:shadow-md z-10 group`}>
                
                {/* Connector Line UP (except root) */}
                {!isRoot && (
                    <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />
                )}

                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-white dark:border-[#121212] shadow-sm mb-3 relative">
                        <Image src={node.avatar || 'https://i.pravatar.cc/150'} alt={node.name} fill className="object-cover" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{node.name}</h3>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{node.role}</p>
                    <p className="text-[10px] text-brand-600 dark:text-brand-400 font-medium px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded-md mt-2 inline-block">
                        {node.department}
                    </p>
                </div>

                {/* Expand/Collapse Toggle */}
                {hasChildren && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 transition-colors shadow-sm z-20"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}
            </div>

            {/* Children Container */}
            {hasChildren && isExpanded && (
                <div className="relative pt-6 mt-0">
                    {/* Horizontal connector line above children */}
                    {node.directReports.length > 1 && (
                        <div className="absolute top-0 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700" 
                             style={{ 
                                 width: `calc(100% - ${100 / node.directReports.length}%)`, 
                                 left: `${50 / node.directReports.length}%` 
                             }} 
                        />
                    )}
                    
                    {/* Vertical line connecting parent to horizontal line */}
                    <div className="absolute top-0 left-1/2 w-px h-6 bg-slate-200 dark:bg-slate-700 -translate-x-1/2 -translate-y-full" />

                    <div className="flex justify-center gap-8">
                        {node.directReports.map((child: any) => (
                            <OrgNode key={child.id} node={child} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function OrganizationalChartPage() {
    const [scale, setScale] = useState(1);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 2));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
    const handleReset = () => setScale(1);

    return (
        <div className="flex-1 h-screen flex flex-col bg-[#F8F9FC] dark:bg-[#09090b] overflow-hidden">
            
            {/* Header */}
            <header className="shrink-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Organizational Chart</h1>
                        <p className="text-sm text-slate-500">Explore the company structure and reporting lines.</p>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button onClick={handleZoomOut} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-xs font-bold text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ZoomIn size={18} />
                        </button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                        <button onClick={handleReset} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors" title="Reset Viewer">
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Canvas Area (Scrollable/Draggable conceptually) */}
            <main className="flex-1 overflow-auto relative cursor-grab active:cursor-grabbing bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
                
                <div className="min-w-max min-h-full p-20 flex items-start justify-center transition-transform origin-top"
                     style={{ transform: `scale(${scale})` }}
                >
                    <OrgNode node={ORG_DATA} isRoot={true} />
                </div>
                
                {/* Floating Map/Locator icon (decorative) */}
                <div className="absolute bottom-6 right-6 p-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl text-slate-400 pointer-events-none">
                    <Compass size={24} className="opacity-50" />
                </div>
            </main>
        </div>
    );
}
