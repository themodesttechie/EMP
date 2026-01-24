"use client";

import React, { useState } from "react";
import { 
  Briefcase, Clock, AlertOctagon, Plane, Stethoscope, 
  Baby, Heart, Umbrella, TrendingUp, Sparkles, CalendarDays,
  ChevronRight, ArrowUpRight, ArrowDownRight, Info, X
} from "lucide-react";

// --- CONFIGURATION ---
const LEAVE_PORTFOLIO = [
  { 
    id: "annual", 
    title: "Annual Leave", 
    total: 18, 
    used: 12, 
    accrualRate: 1.5, // Per month
    icon: Plane, 
    color: "text-blue-600", 
    bg: "bg-blue-600",
    policy: { carryFwd: 5, encashment: true, reset: "Dec 31" }
  },
  { 
    id: "sick", 
    title: "Sick Leave", 
    total: 12, 
    used: 4, 
    accrualRate: 1.0, 
    icon: Stethoscope, 
    color: "text-rose-600", 
    bg: "bg-rose-600",
    policy: { carryFwd: 0, encashment: false, reset: "Dec 31" }
  },
  { 
    id: "casual", 
    title: "Casual Leave", 
    total: 6, 
    used: 2, 
    accrualRate: 0.5, 
    icon: Briefcase, 
    color: "text-amber-600", 
    bg: "bg-amber-600",
    policy: { carryFwd: 0, encashment: false, reset: "Jan 1" }
  },
  { 
    id: "comp", 
    title: "Comp Off", 
    total: 5, 
    used: 1, 
    accrualRate: 0, 
    icon: Umbrella, 
    color: "text-emerald-600", 
    bg: "bg-emerald-600",
    policy: { expiry: "90 days from earn date" }
  },
  { 
    id: "mat", 
    title: "Maternity", 
    total: 90, 
    used: 0, 
    accrualRate: 0, 
    icon: Baby, 
    color: "text-purple-600", 
    bg: "bg-purple-600",
    policy: { note: "Requires medical certificate" }
  },
  { 
    id: "ber", 
    title: "Bereavement", 
    total: 5, 
    used: 0, 
    accrualRate: 0, 
    icon: Heart, 
    color: "text-slate-600", 
    bg: "bg-slate-600",
    policy: { note: "Immediate family members" }
  },
  { 
    id: "lop", 
    title: "Loss of Pay", 
    total: 0, 
    used: 1, 
    accrualRate: 0, 
    icon: AlertOctagon, 
    color: "text-red-600", 
    bg: "bg-red-600",
    isNegative: true 
  },
];

const UPCOMING_HOLIDAYS = [
  { date: "Jan 26", name: "Republic Day", day: "Monday", tip: "Long Weekend!" },
  { date: "Mar 25", name: "Holi", day: "Tuesday", tip: "Take Mon off for 4 days" },
];

export default function EliteTimeOffPlanner() {
  // Simulator State
  const [forecastMonth, setForecastMonth] = useState(0); // 0 = Now, 1 = +1 Month, etc.
  const [activePolicyCard, setActivePolicyCard] = useState<string | null>(null);

  // Helper to project balance
  const getProjectedBalance = (item: any) => {
    if (item.isNegative || item.accrualRate === 0) return 0;
    return item.accrualRate * forecastMonth;
  };

  const monthsAheadLabel = forecastMonth === 0 ? "Today" : `in ${forecastMonth} Month${forecastMonth > 1 ? 's' : ''}`;

  return (
    <div className="h-screen w-full bg-[#f8fafc] dark:bg-[#050505] font-sans text-slate-800 dark:text-slate-200 flex flex-col overflow-hidden p-4 gap-4">
      
      {/* 1. HEADER */}
      <div className="flex-none flex items-center justify-between px-2">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Time Off & Balances</h1>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#111] rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
              <Sparkles size={12} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">AI Insights Active</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        
        {/* === LEFT: THE "WALLET" & SIMULATOR === */}
        <div className="flex-[1.4] bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
             
             {/* A. FORECAST SIMULATOR (The "Elite" Feature) */}
             <div className="flex-none p-6 border-b border-slate-100 dark:border-white/5 bg-indigo-50/30 dark:bg-indigo-900/5 relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 relative z-10">
                   <div>
                      <h2 className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-tight flex items-center gap-2">
                         <TrendingUp size={16}/> Balance Projector
                      </h2>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 max-w-[200px] leading-relaxed">
                         Slide to see how much leave you will accrue by a future date.
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projecting To</p>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{monthsAheadLabel}</p>
                   </div>
                </div>
                
                {/* Custom Range Slider */}
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  step="1" 
                  value={forecastMonth}
                  onChange={(e) => setForecastMonth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600 relative z-10"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 relative z-10">
                   <span>Now</span>
                   <span>6 Months</span>
                   <span>1 Year</span>
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
             </div>

             {/* B. BALANCE CARDS */}
             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {LEAVE_PORTFOLIO.map((item) => {
                      const isLop = item.isNegative;
                      const currentBal = item.total - item.used;
                      const projected = getProjectedBalance(item);
                      // const totalProjected = currentBal + projected; // Not used in render currently but calculated
                      
                      const usagePercent = isLop ? 100 : (item.used / item.total) * 100;
                      const projectPercent = isLop ? 0 : (projected / item.total) * 100;

                      // Styles
                      const themeStyles: Record<string, string> = {
                         blue: "bg-blue-500 text-blue-600", rose: "bg-rose-500 text-rose-600", 
                         amber: "bg-amber-500 text-amber-600", emerald: "bg-emerald-500 text-emerald-600", 
                         red: "bg-red-500 text-red-600", purple: "bg-purple-500 text-purple-600", slate: "bg-slate-500 text-slate-600"
                      };
                      const t = themeStyles[item.color.includes('text-blue') ? 'blue' : item.color.includes('text-rose') ? 'rose' : item.color.includes('text-amber') ? 'amber' : item.color.includes('text-emerald') ? 'emerald' : item.color.includes('text-red') ? 'red' : item.color.includes('text-purple') ? 'purple' : 'slate'];

                      const isFlipped = activePolicyCard === item.id;

                      return (
                         <div 
                            key={item.id} 
                            onClick={() => setActivePolicyCard(isFlipped ? null : item.id)}
                            className={`relative h-[160px] cursor-pointer group perspective-1000`}
                         >
                            {/* FRONT OF CARD */}
                            <div className={`absolute inset-0 bg-white dark:bg-[#151515] rounded-2xl border border-slate-100 dark:border-white/5 p-5 transition-all duration-500 backface-hidden ${isFlipped ? 'rotate-y-180 opacity-0 pointer-events-none' : 'rotate-y-0 opacity-100'}`}>
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                     <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-white/5`}>
                                        <item.icon size={18} className={t.split(' ')[1]} />
                                     </div>
                                     <div>
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                           {item.accrualRate > 0 ? `+${item.accrualRate}/mo` : 'Flat'}
                                        </span>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     {isLop ? (
                                        <h2 className="text-xl font-black text-rose-600">-{item.used}</h2>
                                     ) : (
                                        <div className="flex flex-col items-end">
                                           <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                                              {currentBal}
                                              {projected > 0 && <span className="text-xs font-bold text-emerald-500">+{projected}</span>}
                                           </h2>
                                           <p className="text-[9px] font-bold text-slate-400 uppercase">Available</p>
                                        </div>
                                     )}
                                  </div>
                               </div>

                               {!isLop && (
                                  <div className="space-y-1.5">
                                     <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                        <span>Used: {item.used}</span>
                                        <span>Total: {item.total}</span>
                                     </div>
                                     <div className="flex h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${t.split(' ')[0]}`} style={{ width: `${usagePercent}%` }} />
                                        {/* Projected Bar segment */}
                                        {projected > 0 && (
                                           <div className="h-full bg-emerald-400 animate-pulse" style={{ width: `${projectPercent}%` }} />
                                        )}
                                     </div>
                                  </div>
                               )}
                               
                               <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Info size={14} className="text-slate-400" />
                               </div>
                            </div>

                            {/* BACK OF CARD (POLICY CHEAT SHEET) */}
                            <div className={`absolute inset-0 bg-slate-900 dark:bg-indigo-900 rounded-2xl p-5 text-white transition-all duration-500 backface-hidden ${isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0 pointer-events-none'}`}>
                               <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">{item.title} Rules</h3>
                                  <button onClick={(e) => { e.stopPropagation(); setActivePolicyCard(null); }}><X size={14} className="text-white/50 hover:text-white" /></button>
                               </div>
                               <div className="space-y-2 text-[10px] font-medium text-white/80">
                                  {item.policy?.carryFwd !== undefined && (
                                     <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span>Max Carry Forward</span>
                                        <span className="font-bold text-white">{item.policy.carryFwd} Days</span>
                                     </div>
                                  )}
                                  {item.policy?.encashment !== undefined && (
                                     <div className="flex justify-between border-b border-white/10 pb-1">
                                        <span>Encashable</span>
                                        <span className="font-bold text-white">{item.policy.encashment ? "Yes" : "No"}</span>
                                     </div>
                                  )}
                                  <div className="flex justify-between border-b border-white/10 pb-1">
                                     <span>Cycle Reset</span>
                                     <span className="font-bold text-white">{item.policy?.reset || "N/A"}</span>
                                  </div>
                                  {item.policy?.note && (
                                     <div className="pt-2 text-white/60 italic">
                                        "{item.policy.note}"
                                     </div>
                                  )}
                               </div>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
        </div>

        {/* === RIGHT: INTELLIGENT CONTEXT === */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
           
           {/* A. UPCOMING HOLIDAYS (Contextual Widget) */}
           <div className="flex-[0.8] bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <CalendarDays size={16} className="text-indigo-500" /> Long Weekend Spotter
                 </h2>
              </div>
              <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
                 {UPCOMING_HOLIDAYS.map((h, i) => (
                    <div key={i} className="p-4 border-b border-slate-50 dark:border-white/5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                       <div className="text-center bg-slate-100 dark:bg-white/5 rounded-xl p-2 min-w-[50px]">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{h.date.split(' ')[0]}</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{h.date.split(' ')[1]}</p>
                       </div>
                       <div className="flex-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.name}</h4>
                          <p className="text-[10px] text-slate-500">{h.day}</p>
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded w-fit">
                             <Sparkles size={10} /> {h.tip}
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 ))}
              </div>
           </div>

           {/* B. RECENT TRANSACTIONS (Simplified History) */}
           <div className="flex-1 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-white/5">
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Activity</h2>
              </div>
              <div className="flex-1 p-0 overflow-y-auto custom-scrollbar">
                 <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-white/5">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownRight size={14}/></div>
                    <div className="flex-1">
                       <p className="text-xs font-bold">Sick Leave Taken</p>
                       <p className="text-[9px] text-slate-400">Jan 24, 2026</p>
                    </div>
                    <span className="text-xs font-black text-rose-600">-3.0</span>
                 </div>
                 <div className="p-4 flex items-center gap-3 border-b border-slate-50 dark:border-white/5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpRight size={14}/></div>
                    <div className="flex-1">
                       <p className="text-xs font-bold">Monthly Accrual</p>
                       <p className="text-[9px] text-slate-400">Jan 01, 2026</p>
                    </div>
                    <span className="text-xs font-black text-emerald-600">+1.5</span>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}