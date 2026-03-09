"use client";

import React, { useState } from "react";
import { 
    Search, Filter, MapPin, Building2, Phone, Mail, 
    MessageSquare, ChevronRight, X, User
} from "lucide-react";
import Image from "next/image";

// -- MOCK DATA --
const DEPARTMENTS = ["All", "Engineering", "Design", "Product", "Marketing", "Sales", "HR"];
const LOCATIONS = ["All", "New York, USA", "London, UK", "Toronto, CA", "Remote"];

const EMPLOYEES = [
    {
        id: "emp-001",
        name: "Sarah Jenkins",
        role: "VP of Engineering",
        department: "Engineering",
        location: "New York, USA",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        email: "sarah.j@company.com",
        phone: "+1 (555) 123-4567",
        manager: "Michael Chang",
        timezone: "EST (UTC-5)",
        bio: "Leading the global engineering teams to build scalable and resilient products."
    },
    {
        id: "emp-002",
        name: "David Smith",
        role: "Senior Product Designer",
        department: "Design",
        location: "Remote",
        avatar: "https://i.pravatar.cc/150?u=david",
        email: "david.s@company.com",
        phone: "+1 (555) 987-6543",
        manager: "Elena Rodriguez",
        timezone: "PST (UTC-8)",
        bio: "Passionate about creating intuitive and accessible user experiences."
    },
    {
        id: "emp-003",
        name: "Emily Stone",
        role: "Marketing Manager",
        department: "Marketing",
        location: "London, UK",
        avatar: "https://i.pravatar.cc/150?u=emily",
        email: "emily.s@company.com",
        phone: "+44 20 7123 4567",
        manager: "Robert Fox",
        timezone: "GMT (UTC+0)",
        bio: "Specializing in digital growth strategies and brand development."
    },
    {
        id: "emp-004",
        name: "Alex Lee",
        role: "Frontend Developer",
        department: "Engineering",
        location: "Toronto, CA",
        avatar: "https://i.pravatar.cc/150?u=alex",
        email: "alex.l@company.com",
        phone: "+1 (416) 555-0198",
        manager: "Sarah Jenkins",
        timezone: "EST (UTC-5)",
        bio: "React enthusiast and UI performance optimizer."
    },
    {
        id: "emp-005",
        name: "Jessica Row",
        role: "HR Business Partner",
        department: "HR",
        location: "New York, USA",
        avatar: "https://i.pravatar.cc/150?u=jessica",
        email: "jessica.r@company.com",
        phone: "+1 (555) 234-5678",
        manager: "Amanda Simmons",
        timezone: "EST (UTC-5)",
        bio: "Dedicated to fostering a supportive and inclusive workplace culture."
    },
    {
        id: "emp-006",
        name: "Marcus Johnson",
        role: "Account Executive",
        department: "Sales",
        location: "London, UK",
        avatar: "https://i.pravatar.cc/150?u=marcus",
        email: "marcus.j@company.com",
        phone: "+44 20 7987 6543",
        manager: "Olivia Wilson",
        timezone: "GMT (UTC+0)",
        bio: "Helping enterprise clients achieve their digital transformation goals."
    }
];

export default function EmployeeDirectoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("All");
    const [selectedLoc, setSelectedLoc] = useState("All");
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null); // For Modal

    // Filter Logic
    const filteredEmployees = EMPLOYEES.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              emp.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === "All" || emp.department === selectedDept;
        const matchesLoc = selectedLoc === "All" || emp.location === selectedLoc;
        return matchesSearch && matchesDept && matchesLoc;
    });

    return (
        <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
                <div className="max-w-[1600px] mx-auto">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Employee Directory</h1>
                    <p className="text-sm text-slate-500">Find and connect with colleagues across the globe.</p>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8">
                
                {/* Search & Filter Bar */}
                <div className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
                    
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by name or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <select 
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer appearance-none min-w-[160px]"
                        >
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept} Dept</option>)}
                        </select>
                        
                        <select 
                            value={selectedLoc}
                            onChange={(e) => setSelectedLoc(e.target.value)}
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer appearance-none min-w-[160px]"
                        >
                            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>

                        <button className="p-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Directory Grid */}
                {filteredEmployees.length === 0 ? (
                    <div className="py-32 text-center text-slate-500">
                        <User size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">No employees found.</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEmployees.map(emp => (
                            <div 
                                key={emp.id}
                                onClick={() => setSelectedEmployee(emp)}
                                className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                {/* Card Header (Banner) */}
                                <div className="h-24 bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-500/20 dark:to-brand-500/5 relative">
                                    <div className="absolute -bottom-10 left-6">
                                        <div className="w-20 h-20 rounded-2xl p-1 bg-white dark:bg-[#121212] shadow-sm">
                                            <div className="w-full h-full rounded-xl overflow-hidden relative">
                                                <Image src={emp.avatar} alt={emp.name} fill className="object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2.5 py-1 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                            {emp.department}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 pt-14">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                        {emp.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{emp.role}</p>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin size={14} className="text-slate-400" /> {emp.location}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors">
                                                <Mail size={14} />
                                            </button>
                                            <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors">
                                                <MessageSquare size={14} />
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 group-hover:text-brand-500 transition-colors">
                                            View Profile <ChevronRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Profile Detail Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header/Banner */}
                        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400 relative">
                            <button 
                                onClick={() => setSelectedEmployee(null)} 
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8 pt-0 flex-1 overflow-y-auto relative">
                            
                            {/* Avatar positioning slightly overlapping the banner */}
                            <div className="absolute -top-16 left-8">
                                <div className="w-32 h-32 rounded-3xl p-1.5 bg-white dark:bg-[#121212] shadow-sm">
                                    <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                        <Image src={selectedEmployee.avatar} alt={selectedEmployee.name} fill className="object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-20 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{selectedEmployee.name}</h2>
                                    <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">{selectedEmployee.role}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-5 py-2.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <MessageSquare size={16} /> Chat
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">About</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-balance">
                                    {selectedEmployee.bio}
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                    <div className="p-2.5 bg-white dark:bg-[#121212] rounded-xl text-slate-400 shadow-sm"><Building2 size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Department</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedEmployee.department}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                    <div className="p-2.5 bg-white dark:bg-[#121212] rounded-xl text-slate-400 shadow-sm"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Location</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedEmployee.location} <span className="text-slate-400 font-normal">({selectedEmployee.timezone})</span></p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                    <div className="p-2.5 bg-white dark:bg-[#121212] rounded-xl text-slate-400 shadow-sm"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                                        <a href={`mailto:${selectedEmployee.email}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">{selectedEmployee.email}</a>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                    <div className="p-2.5 bg-white dark:bg-[#121212] rounded-xl text-slate-400 shadow-sm"><Phone size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Phone</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedEmployee.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Reporting Line</h3>
                                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-max cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold overflow-hidden relative">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedEmployee.manager}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Manager</p>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-400 ml-2" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
