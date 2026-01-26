"use client";

import React, { useState, useMemo } from "react";
import { 
  CalendarDays, MapPin, Flag, ChevronDown, 
  Filter, Sparkles, Globe, Calendar 
} from "lucide-react";

/* --- 1. DATASET --- */
const HOLIDAYS_DB = [
  // JAN
  { id: 101, name: "New Year's Day", date: "Jan 01", monthIdx: 0, day: "Thu", year: "2026", type: "Public", country: "Global", region: "All" },
  { id: 104, name: "Republic Day", date: "Jan 26", monthIdx: 0, day: "Mon", year: "2026", type: "National", country: "India", region: "All" },
  
  // FEB
  { id: 201, name: "Presidents' Day", date: "Feb 16", monthIdx: 1, day: "Mon", year: "2026", type: "Public", country: "USA", region: "All" },
  
  // MAR
  { id: 301, name: "Maha Shivaratri", date: "Mar 08", monthIdx: 2, day: "Sun", year: "2026", type: "Optional", country: "India", region: "All" },
  { id: 302, name: "Holi", date: "Mar 14", monthIdx: 2, day: "Sat", year: "2026", type: "Optional", country: "India", region: "All" },
  { id: 303, name: "Ugadi", date: "Mar 19", monthIdx: 2, day: "Thu", year: "2026", type: "Optional", country: "India", region: "Telangana" },
  
  // APR
  { id: 401, name: "Good Friday", date: "Apr 03", monthIdx: 3, day: "Fri", year: "2026", type: "Public", country: "Global", region: "All" },
  
  // MAY
  { id: 501, name: "Labor Day", date: "May 01", monthIdx: 4, day: "Fri", year: "2026", type: "Public", country: "Global", region: "All" },
  { id: 502, name: "Memorial Day", date: "May 25", monthIdx: 4, day: "Mon", year: "2026", type: "Public", country: "USA", region: "All" },

  // AUG
  { id: 801, name: "Independence Day", date: "Aug 15", monthIdx: 7, day: "Sat", year: "2026", type: "National", country: "India", region: "All" },
  
  // NOV
  { id: 1101, name: "Kannada Rajyotsava", date: "Nov 01", monthIdx: 10, day: "Sun", year: "2026", type: "Optional", country: "India", region: "Karnataka" },
  
  // DEC
  { id: 1201, name: "Christmas", date: "Dec 25", monthIdx: 11, day: "Fri", year: "2026", type: "Public", country: "Global", region: "All" },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028", "2029"];

const REGIONS_BY_COUNTRY: any = {
    "All": ["All", "Telangana", "Karnataka", "North India", "New York"],
    "India": ["All", "Telangana", "Karnataka", "North India"],
    "USA": ["All", "New York", "California"],
    "Global": ["All"]
};

export default function BentoHolidayGrid() {
  const [year, setYear] = useState("2026");
  const [country, setCountry] = useState("All");
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");

  /* --- LOGIC ENGINE --- */
  const monthData = useMemo(() => {
    // 1. Filter Database
    const filtered = HOLIDAYS_DB.filter((h) => {
      const matchYear = h.year === year;
      const matchCountry = country === "All" || h.country === country || h.country === "Global";
      const matchRegion = region === "All" || h.region === region || h.region === "All";
      const matchType = type === "All" || h.type === type;
      return matchYear && matchCountry && matchRegion && matchType;
    });

    // 2. Group by Month Index (0-11)
    const groups: Record<number, typeof filtered> = {};
    
    // Initialize all months (so we show empty cards too, for calendar feel)
    // Or just show active months? Let's show ALL 12 for the grid look.
    for(let i=0; i<12; i++) groups[i] = [];

    filtered.forEach(h => {
        groups[h.monthIdx].push(h);
    });

    return groups;
  }, [year, country, region, type]);

  // Check if grid is totally empty
  const hasEvents = Object.values(monthData).some(arr => arr.length > 0);

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#F8F9FC] dark:bg-[#09090b]">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
         <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 w-full xl:w-auto">
               <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                  <CalendarDays size={20} />
               </div>
               <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Holiday Calendar</h1>
                  <p className="text-xs font-medium text-slate-500 mt-1">Year at a Glance</p>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* Type Filter */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
                    {['All', 'Public', 'Optional'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                type === t 
                                ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" />

                <CompactSelect icon={<Flag size={14} />} value={country} onChange={(v: string)=>{setCountry(v); setRegion('All')}} options={['All', 'India', 'USA']} />
                <CompactSelect icon={<MapPin size={14} />} value={region} onChange={setRegion} options={REGIONS_BY_COUNTRY[country] || ['All']} disabled={country === 'Global'} />
                <CompactSelect icon={<Filter size={14} />} value={year} onChange={setYear} options={YEAR_OPTIONS} highlight={true} />
            </div>
         </div>
      </header>

      {/* --- BENTO GRID CONTENT --- */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 pb-20">
         {hasEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {MONTH_NAMES.map((monthName, idx) => {
                    const holidays = monthData[idx];
                    const isActive = holidays.length > 0;
                    
                    // Don't render empty months if you want a cleaner look? 
                    // No, "Months as Cards" implies showing the calendar structure.
                    // We will fade out empty months.
                    
                    return (
                        <div 
                            key={monthName}
                            className={`
                                relative flex flex-col rounded-2xl border transition-all duration-300
                                ${isActive 
                                    ? "bg-white dark:bg-[#121212] border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg hover:-translate-y-1" 
                                    : "bg-slate-50/50 dark:bg-white/[0.02] border-transparent opacity-60 hover:opacity-100"
                                }
                            `}
                        >
                            {/* Card Header */}
                            <div className="p-5 pb-2 flex justify-between items-center">
                                <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {monthName}
                                </h3>
                                {isActive && (
                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                                        {holidays.length}
                                    </span>
                                )}
                            </div>

                            {/* Card Body (Events List) */}
                            <div className="p-5 pt-2 flex-1 flex flex-col gap-3">
                                {isActive ? (
                                    holidays.map((h: any) => (
                                        <div key={h.id} className="group flex gap-3 items-start p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-default">
                                            {/* Date Badge */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/50">
                                                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 leading-none">
                                                    {h.date.split(' ')[1]}
                                                </span>
                                            </div>
                                            
                                            {/* Info */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${h.type === 'Optional' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                                                        {h.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={h.name}>
                                                    {h.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-20 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Events</span>
                                    </div>
                                )}
                            </div>

                            {/* Decorative Watermark for Empty Months */}
                            {!isActive && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <span className="text-6xl font-black text-slate-200/50 dark:text-white/[0.02] uppercase -rotate-12 select-none">
                                        {monthName.substring(0,3)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <Calendar size={24} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">No holidays found</h3>
               <p className="text-sm text-slate-500 mt-1">Try adjusting your year or country filters.</p>
               <button onClick={() => {setCountry('All'); setType('All')}} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-700">
                  Reset Filters
               </button>
            </div>
         )}
      </main>
    </div>
  );
}

/* --- COMPONENTS --- */
const CompactSelect = ({ icon, value, onChange, options, disabled, highlight }: any) => (
   <div className={`relative h-9 min-w-[130px] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>
      <select 
         value={value} 
         onChange={(e) => onChange(e.target.value)} 
         disabled={disabled}
         className={`w-full h-full pl-9 pr-8 text-xs font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none rounded-lg border transition-all ${
            highlight 
            ? "bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800" 
            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
         }`}
      >
         {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
   </div>
);