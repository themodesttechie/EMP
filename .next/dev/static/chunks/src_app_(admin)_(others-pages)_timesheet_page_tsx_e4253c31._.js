(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompleteTimesheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wand-sparkles.js [app-client] (ecmascript) <export default as Wand2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tree$2d$palm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palmtree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tree-palm.js [app-client] (ecmascript) <export default as Palmtree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coffee.js [app-client] (ecmascript) <export default as Coffee>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
/* ---------------- 1. CONFIGURATION ---------------- */ const HOLIDAYS = [
    "2026-01-26"
];
const APPROVED_LEAVES = [
    "2026-01-27"
];
const NON_WORKING_DAYS = [
    0,
    6
];
const PROJECTS = [
    {
        id: "p1",
        name: "Internal / Admin",
        code: "INT-001",
        color: "bg-slate-500",
        billable: false
    },
    {
        id: "p2",
        name: "Acme Corp: Website Redesign",
        code: "ACM-102",
        color: "bg-blue-600",
        billable: true
    },
    {
        id: "p3",
        name: "Globex: Mobile App MVP",
        code: "GLO-404",
        color: "bg-indigo-600",
        billable: true
    },
    {
        id: "p4",
        name: "Stark Ind: AI Consulting",
        code: "STK-999",
        color: "bg-amber-600",
        billable: true
    },
    {
        id: "p5",
        name: "Cyberdyne: Security Audit",
        code: "CYB-800",
        color: "bg-red-600",
        billable: true
    },
    {
        id: "p6",
        name: "Wayne Ent: Cloud Migration",
        code: "WAY-007",
        color: "bg-emerald-600",
        billable: true
    }
];
/* ---------------- 3. HELPERS ---------------- */ const formatDate = (d)=>d.toISOString().split("T")[0];
const addDays = (d, days)=>{
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
};
const startOfWeek = (date)=>{
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};
const formatDuration = (h, m)=>{
    if (h === 0 && m === 0) return "0h";
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
const getDayStatus = (dateStr, dayIndex)=>{
    const isHoliday = HOLIDAYS.includes(dateStr);
    const isLeave = APPROVED_LEAVES.includes(dateStr);
    const isWeekend = NON_WORKING_DAYS.includes(dayIndex);
    return {
        isNonStandard: isHoliday || isLeave || isWeekend,
        isHoliday,
        isLeave,
        isWeekend
    };
};
/* ---------------- 4. COMPONENT: PROJECT SELECTOR ---------------- */ const ProjectSelector = ({ value, onChange })=>{
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectedProject = PROJECTS.find((p)=>p.id === value);
    const filteredProjects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProjectSelector.useMemo[filteredProjects]": ()=>{
            if (!search) return PROJECTS;
            return PROJECTS.filter({
                "ProjectSelector.useMemo[filteredProjects]": (p)=>p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
            }["ProjectSelector.useMemo[filteredProjects]"]);
        }
    }["ProjectSelector.useMemo[filteredProjects]"], [
        search
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectSelector.useEffect": ()=>{
            const handleClick = {
                "ProjectSelector.useEffect.handleClick": (e)=>{
                    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
                }
            }["ProjectSelector.useEffect.handleClick"];
            document.addEventListener("mousedown", handleClick);
            return ({
                "ProjectSelector.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["ProjectSelector.useEffect"];
        }
    }["ProjectSelector.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: wrapperRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-[10px] font-bold uppercase text-slate-400 mb-1 block",
                children: "Project"
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 93,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsOpen(!isOpen),
                className: "w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium flex justify-between items-center hover:border-blue-400 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-2 h-2 rounded-full flex-shrink-0 ${selectedProject?.color}`
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 96,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate",
                                children: selectedProject ? `${selectedProject.code} - ${selectedProject.name}` : "Select Project"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 97,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 95,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        size: 14,
                        className: "text-slate-400"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 99,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 94,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 border-b border-slate-100 dark:border-slate-800",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                    size: 14,
                                    className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 105,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    autoFocus: true,
                                    type: "text",
                                    placeholder: "Search...",
                                    value: search,
                                    onChange: (e)=>setSearch(e.target.value),
                                    className: "w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 104,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 103,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-60 overflow-y-auto p-1",
                        children: filteredProjects.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    onChange(p.id);
                                    setIsOpen(false);
                                    setSearch("");
                                },
                                className: `w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${value === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-2 h-2 rounded-full flex-shrink-0 ${p.color}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 112,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs font-bold text-slate-700 dark:text-slate-200 truncate",
                                                children: p.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 114,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] text-slate-400 font-mono",
                                                children: p.code
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 115,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 113,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    value === p.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                        size: 14,
                                        className: "text-blue-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 117,
                                        columnNumber: 52
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, p.id, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 111,
                                columnNumber: 29
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 109,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 102,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
        lineNumber: 92,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ProjectSelector, "Z9aalRodqCJclfBw+u8umusNQw0=");
_c = ProjectSelector;
function CompleteTimesheet() {
    _s1();
    const today = new Date("2026-01-26");
    const [currentWeekStart, setCurrentWeekStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(startOfWeek(today));
    const [db, setDb] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeMenu, setActiveMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSaving, setIsSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const currentWeekKey = formatDate(currentWeekStart);
    const currentData = db[currentWeekKey] || {
        status: "DRAFT",
        lastSaved: null,
        entries: {}
    };
    const isLocked = currentData.status !== "DRAFT";
    // --- SEED MOCK HISTORY ---
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompleteTimesheet.useEffect": ()=>{
            const mockDb = {};
            for(let i = 0; i < 4; i++){
                const pastDate = addDays(startOfWeek(today), -(i * 7));
                const key = formatDate(pastDate);
                const entries = {};
                for(let j = 0; j < 5; j++){
                    const dStr = formatDate(addDays(pastDate, j));
                    entries[dStr] = [
                        {
                            id: crypto.randomUUID(),
                            projectId: PROJECTS[1].id,
                            hours: 8,
                            minutes: 0,
                            notes: "Past work"
                        }
                    ];
                }
                mockDb[key] = {
                    status: i > 0 ? "SUBMITTED" : "DRAFT",
                    lastSaved: new Date(),
                    entries
                };
            }
            setDb(mockDb);
        }
    }["CompleteTimesheet.useEffect"], []);
    // Menu click outside
    const menuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompleteTimesheet.useEffect": ()=>{
            const handleClick = {
                "CompleteTimesheet.useEffect.handleClick": (e)=>{
                    if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
                }
            }["CompleteTimesheet.useEffect.handleClick"];
            document.addEventListener("mousedown", handleClick);
            return ({
                "CompleteTimesheet.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["CompleteTimesheet.useEffect"];
        }
    }["CompleteTimesheet.useEffect"], []);
    // Helper: Toast Timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompleteTimesheet.useEffect": ()=>{
            if (toast) {
                const t = setTimeout({
                    "CompleteTimesheet.useEffect.t": ()=>setToast(null)
                }["CompleteTimesheet.useEffect.t"], 3000);
                return ({
                    "CompleteTimesheet.useEffect": ()=>clearTimeout(t)
                })["CompleteTimesheet.useEffect"];
            }
        }
    }["CompleteTimesheet.useEffect"], [
        toast
    ]);
    /* --- DATA CALCULATIONS --- */ const days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CompleteTimesheet.useMemo[days]": ()=>{
            return Array.from({
                length: 7
            }).map({
                "CompleteTimesheet.useMemo[days]": (_, i)=>{
                    const d = addDays(currentWeekStart, i);
                    const dateStr = formatDate(d);
                    const status = getDayStatus(dateStr, d.getDay());
                    return {
                        label: d.toLocaleDateString("en-US", {
                            weekday: "short"
                        }),
                        fullLabel: d.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: 'short',
                            day: 'numeric'
                        }),
                        date: dateStr,
                        dayNum: d.getDate(),
                        ...status,
                        entries: currentData.entries[dateStr] || []
                    };
                }
            }["CompleteTimesheet.useMemo[days]"]);
        }
    }["CompleteTimesheet.useMemo[days]"], [
        currentWeekStart,
        currentData
    ]);
    const { stats, projectSummary } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CompleteTimesheet.useMemo": ()=>{
            let totalMins = 0;
            let billableMins = 0;
            const summary = {};
            Object.values(currentData.entries).forEach({
                "CompleteTimesheet.useMemo": (dayEntries)=>{
                    dayEntries.forEach({
                        "CompleteTimesheet.useMemo": (e)=>{
                            const mins = e.hours * 60 + e.minutes;
                            totalMins += mins;
                            if (PROJECTS.find({
                                "CompleteTimesheet.useMemo": (p)=>p.id === e.projectId
                            }["CompleteTimesheet.useMemo"])?.billable) billableMins += mins;
                            summary[e.projectId] = (summary[e.projectId] || 0) + mins;
                        }
                    }["CompleteTimesheet.useMemo"]);
                }
            }["CompleteTimesheet.useMemo"]);
            return {
                stats: {
                    total: (totalMins / 60).toFixed(1),
                    billable: (billableMins / 60).toFixed(1),
                    utilization: Math.min(100, totalMins / 2400 * 100)
                },
                projectSummary: summary
            };
        }
    }["CompleteTimesheet.useMemo"], [
        currentData
    ]);
    const updateDb = (fn)=>setDb((prev)=>fn(prev));
    /* --- ACTIONS --- */ const handleSmartFill = ()=>{
        if (isLocked) {
            setToast({
                type: 'error',
                msg: "Week is locked"
            });
            return;
        }
        const newEntries = {
            ...currentData.entries
        };
        let count = 0;
        days.forEach((d)=>{
            if (d.isNonStandard) return; // Skip weekends/holidays
            if (!newEntries[d.date] || newEntries[d.date].length === 0) {
                newEntries[d.date] = [
                    {
                        id: crypto.randomUUID(),
                        projectId: PROJECTS[0].id,
                        hours: 8,
                        minutes: 0,
                        notes: "Standard Hours"
                    }
                ];
                count++;
            }
        });
        updateDb((prev)=>({
                ...prev,
                [currentWeekKey]: {
                    ...currentData,
                    entries: newEntries
                }
            }));
        setToast({
            type: 'success',
            msg: `Filled ${count} standard days`
        });
    };
    const handleCopyWeek = (sourceWeekKey)=>{
        if (isLocked) return;
        const sourceEntries = db[sourceWeekKey]?.entries || {};
        const newEntries = {};
        days.forEach((day, index)=>{
            if (day.isHoliday || day.isLeave) return;
            const sourceDate = addDays(new Date(sourceWeekKey), index);
            const sourceDayEntries = sourceEntries[formatDate(sourceDate)] || [];
            if (sourceDayEntries.length > 0) newEntries[day.date] = sourceDayEntries.map((e)=>({
                    ...e,
                    id: crypto.randomUUID()
                }));
        });
        updateDb((prev)=>({
                ...prev,
                [currentWeekKey]: {
                    ...currentData,
                    entries: newEntries
                }
            }));
        setActiveMenu(null);
        setToast({
            type: 'success',
            msg: "Imported valid entries"
        });
    };
    const handleSubmit = ()=>{
        const exceptionEntries = days.filter((d)=>d.isNonStandard && d.entries.length > 0);
        if (exceptionEntries.length > 0) {
            if (!confirm(`You have logged hours on ${exceptionEntries.length} non-working days. Submit anyway?`)) {
                setIsSubmitModalOpen(false);
                return;
            }
        }
        updateDb((prev)=>({
                ...prev,
                [currentWeekKey]: {
                    ...currentData,
                    status: "SUBMITTED"
                }
            }));
        setIsSubmitModalOpen(false);
        setToast({
            type: 'success',
            msg: "Timesheet Submitted"
        });
    };
    const handleClearDay = (dateStr)=>{
        if (isLocked) return;
        if (confirm("Clear all entries for this day?")) {
            updateDb((prev)=>{
                const week = prev[currentWeekKey];
                const newEntries = {
                    ...week.entries
                };
                delete newEntries[dateStr];
                return {
                    ...prev,
                    [currentWeekKey]: {
                        ...week,
                        entries: newEntries
                    }
                };
            });
        }
    };
    const handleCopyDayToNext = (dateStr)=>{
        if (isLocked) return;
        const sourceEntries = currentData.entries[dateStr] || [];
        if (sourceEntries.length === 0) return;
        const nextDay = addDays(new Date(dateStr), 1);
        const nextDayStr = formatDate(nextDay);
        // Soft Check for Governance
        const status = getDayStatus(nextDayStr, nextDay.getDay());
        if (status.isNonStandard) setToast({
            type: 'info',
            msg: "Copying to a non-working day"
        });
        const clonedEntries = sourceEntries.map((e)=>({
                ...e,
                id: crypto.randomUUID()
            }));
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            const targetEntries = [
                ...week.entries[nextDayStr] || [],
                ...clonedEntries
            ];
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [nextDayStr]: targetEntries
                    }
                }
            };
        });
        setToast({
            type: 'success',
            msg: "Copied successfully"
        });
    };
    /* --- ENTRY CRUD --- */ const addEntry = (date)=>{
        const status = getDayStatus(date, new Date(date).getDay());
        if (status.isHoliday) setToast({
            type: 'info',
            msg: "Logging Overtime on Holiday"
        });
        const newEntry = {
            id: crypto.randomUUID(),
            projectId: PROJECTS[0].id,
            hours: 0,
            minutes: 0,
            notes: ""
        };
        updateDb((prev)=>{
            const week = prev[currentWeekKey] || {
                status: 'DRAFT',
                entries: {}
            };
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: [
                            ...week.entries[date] || [],
                            newEntry
                        ]
                    }
                }
            };
        });
    };
    const updateEntry = (date, id, field, val)=>{
        let cleanVal = val;
        if (field === 'hours') cleanVal = Math.max(0, parseInt(val) || 0);
        if (field === 'minutes') cleanVal = Math.max(0, Math.min(59, parseInt(val) || 0));
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            const updated = week.entries[date].map((e)=>e.id === id ? {
                    ...e,
                    [field]: cleanVal
                } : e);
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: updated
                    }
                }
            };
        });
    };
    const deleteEntry = (date, id)=>{
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: week.entries[date].filter((e)=>e.id !== id)
                    }
                }
            };
        });
    };
    const duplicateEntry = (date, entry)=>{
        const newEntry = {
            ...entry,
            id: crypto.randomUUID()
        };
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: [
                            ...week.entries[date] || [],
                            newEntry
                        ]
                    }
                }
            };
        });
        setToast({
            type: 'success',
            msg: "Entry Duplicated"
        });
    };
    const addTime = (date, id, minsToAdd)=>{
        const entry = currentData.entries[date]?.find((e)=>e.id === id);
        if (!entry) return;
        let totalMins = entry.hours * 60 + entry.minutes + minsToAdd;
        const newH = Math.floor(totalMins / 60);
        const newM = totalMins % 60;
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            const updated = week.entries[date].map((e)=>e.id === id ? {
                    ...e,
                    hours: newH,
                    minutes: newM
                } : e);
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: updated
                    }
                }
            };
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#F8F9FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans pb-32",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white dark:bg-[#11151F] border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 bg-blue-600 text-white rounded-lg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 353,
                                        columnNumber: 80
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 353,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-lg font-bold leading-none",
                                            children: "Timesheet"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 355,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 mt-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-[10px] font-black uppercase px-2 py-0.5 rounded ${currentData.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`,
                                                    children: currentData.status
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 357,
                                                    columnNumber: 33
                                                }, this),
                                                currentData.lastSaved && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-slate-400",
                                                    children: [
                                                        "Saved ",
                                                        currentData.lastSaved.toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 59
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 356,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 354,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 352,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setCurrentWeekStart((prev)=>addDays(prev, -7)),
                                    className: "p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 364,
                                        columnNumber: 179
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 364,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-4 text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300",
                                    children: [
                                        days[0].date,
                                        " - ",
                                        days[6].date
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 365,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setCurrentWeekStart((prev)=>addDays(prev, 7)),
                                    className: "p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 366,
                                        columnNumber: 178
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 366,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 363,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            ref: menuRef,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActiveMenu(activeMenu === 'import' ? null : 'import'),
                                            disabled: isLocked,
                                            className: `hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all ${isLocked ? 'opacity-50' : 'hover:border-blue-500'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                    size: 14,
                                                    className: "text-blue-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 372,
                                                    columnNumber: 33
                                                }, this),
                                                " Copy ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 372,
                                                    columnNumber: 83
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 371,
                                            columnNumber: 29
                                        }, this),
                                        activeMenu === 'import' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#11151F] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 bg-slate-50 text-[10px] font-black uppercase text-slate-400",
                                                    children: "Past 3 Months"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 376,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "max-h-60 overflow-y-auto",
                                                    children: Array.from({
                                                        length: 12
                                                    }).map((_, i)=>{
                                                        const d = addDays(currentWeekStart, -(i + 1) * 7);
                                                        const dStr = formatDate(d);
                                                        const hasData = db[dStr] && Object.keys(db[dStr].entries).length > 0;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleCopyWeek(dStr),
                                                            disabled: !hasData,
                                                            className: "w-full text-left px-4 py-3 hover:bg-slate-50 text-xs font-medium border-b border-slate-50 flex justify-between disabled:opacity-50",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: d.toLocaleDateString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                    lineNumber: 384,
                                                                    columnNumber: 53
                                                                }, this),
                                                                " ",
                                                                hasData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] bg-emerald-50 text-emerald-600 px-1 rounded",
                                                                    children: "Data"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                    lineNumber: 384,
                                                                    columnNumber: 103
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 49
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 375,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSmartFill,
                                    disabled: isLocked,
                                    className: `flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-all ${isLocked ? 'opacity-50' : 'hover:border-purple-500'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                            size: 14,
                                            className: "text-purple-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 393,
                                            columnNumber: 29
                                        }, this),
                                        " Smart Fill"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 392,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 369,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 351,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 350,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white dark:bg-[#11151F] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4",
                                children: "Total Hours"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 402,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-end gap-2 mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-4xl font-black dark:text-white",
                                        children: stats.total
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 404,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-lg font-bold text-slate-400 mb-1",
                                        children: "/ 40h"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 405,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 403,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `h-full transition-all duration-1000 ${stats.utilization > 100 ? 'bg-red-500' : 'bg-blue-600'}`,
                                    style: {
                                        width: `${stats.utilization}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 408,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 407,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 401,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-2 bg-white dark:bg-[#11151F] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4",
                                children: "Project Distribution"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 412,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-4 overflow-x-auto pb-2 scrollbar-none",
                                children: [
                                    PROJECTS.map((p)=>{
                                        const mins = projectSummary[p.id] || 0;
                                        const hours = (mins / 60).toFixed(1);
                                        // Calculate percentage share of total hours for the bar
                                        const totalWeekMins = Object.values(projectSummary).reduce((a, b)=>a + b, 0);
                                        const share = totalWeekMins > 0 ? mins / totalWeekMins * 100 : 0;
                                        if (mins === 0) return null;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 min-w-[160px]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `w-2 h-2 rounded-full ${p.color}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                            lineNumber: 425,
                                                            columnNumber: 83
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-bold text-slate-500 truncate",
                                                            children: p.code
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                            lineNumber: 425,
                                                            columnNumber: 136
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 425,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-lg font-bold dark:text-white",
                                                    children: [
                                                        hours,
                                                        "h"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 426,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[10px] text-slate-400 truncate max-w-[120px] mb-2",
                                                    children: p.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 427,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `h-full ${p.color}`,
                                                        style: {
                                                            width: `${share}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 430,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[9px] text-slate-400 mt-1 text-right",
                                                    children: [
                                                        Math.round(share),
                                                        "% of week"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 424,
                                            columnNumber: 33
                                        }, this);
                                    }),
                                    Object.keys(projectSummary).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-slate-400 italic",
                                        children: "No time logged yet."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 436,
                                        columnNumber: 70
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 413,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 411,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 400,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-7 gap-4",
                children: days.map((d)=>{
                    const totalMins = d.entries.reduce((a, b)=>a + b.hours * 60 + b.minutes, 0);
                    const totalHours = Math.floor(totalMins / 60);
                    const totalMinutes = totalMins % 60;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>!isLocked && setSelectedDate(d.date),
                        className: `
                                relative min-h-[240px] rounded-2xl border transition-all duration-300 flex flex-col group cursor-pointer
                                ${isLocked ? "cursor-default opacity-80" : "hover:shadow-lg"}
                                ${d.isHoliday ? "bg-purple-50/30 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800" : d.isLeave ? "bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800" : d.isWeekend ? "bg-slate-50/50 border-slate-200 dark:bg-slate-800/30 dark:border-slate-800" : "bg-white dark:bg-[#11151F] border-slate-200 dark:border-slate-800 hover:border-blue-400"}
                                ${totalMins > 0 && d.isNonStandard ? "ring-1 ring-amber-400 border-amber-400" : ""}
                            `,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center rounded-t-2xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[10px] font-black uppercase text-slate-400",
                                                children: d.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 461,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-xl font-black ${d.isNonStandard ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`,
                                                children: d.dayNum
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 462,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 460,
                                        columnNumber: 33
                                    }, this),
                                    d.isHoliday && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                        size: 16,
                                        className: "text-purple-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 464,
                                        columnNumber: 49
                                    }, this),
                                    d.isLeave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tree$2d$palm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palmtree$3e$__["Palmtree"], {
                                        size: 16,
                                        className: "text-amber-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 465,
                                        columnNumber: 47
                                    }, this),
                                    d.isWeekend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"], {
                                        size: 16,
                                        className: "text-slate-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 466,
                                        columnNumber: 49
                                    }, this),
                                    totalMins > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-[10px] font-black px-2 py-0.5 rounded ${d.isNonStandard ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`,
                                        children: formatDuration(totalHours, totalMinutes)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 467,
                                        columnNumber: 51
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 459,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 p-2 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar",
                                children: [
                                    d.entries.length === 0 && d.isNonStandard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full flex flex-col items-center justify-center text-slate-300",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[9px] font-bold uppercase tracking-widest text-center opacity-60",
                                            children: d.isHoliday ? "Holiday" : d.isLeave ? "On Leave" : "Weekend"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 471,
                                            columnNumber: 118
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 471,
                                        columnNumber: 37
                                    }, this),
                                    d.entries.map((e)=>{
                                        const proj = PROJECTS.find((p)=>p.id === e.projectId);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between mb-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `w-1.5 h-1.5 rounded-full ${proj?.color}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                            lineNumber: 477,
                                                            columnNumber: 88
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] font-bold",
                                                            children: formatDuration(e.hours, e.minutes)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                            lineNumber: 477,
                                                            columnNumber: 149
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 477,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-slate-500 font-medium truncate",
                                                    children: proj?.code
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 478,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, e.id, true, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 476,
                                            columnNumber: 41
                                        }, this);
                                    }),
                                    !isLocked && d.entries.length === 0 && !d.isNonStandard && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 483,
                                                columnNumber: 243
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 483,
                                            columnNumber: 147
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 483,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 469,
                                columnNumber: 29
                            }, this),
                            !isLocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-2 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50/30 dark:bg-slate-900/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            handleClearDay(d.date);
                                        },
                                        className: "p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors",
                                        title: "Clear Day",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 490,
                                            columnNumber: 226
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 490,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            handleCopyDayToNext(d.date);
                                        },
                                        className: "p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors",
                                        title: "Copy to Next Day",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 491,
                                            columnNumber: 240
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 491,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 489,
                                columnNumber: 33
                            }, this)
                        ]
                    }, d.date, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 449,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 442,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-0 w-full bg-white dark:bg-[#11151F] border-t border-slate-200 dark:border-slate-800 p-4 z-40 flex justify-center items-center gap-4 shadow-lg",
                children: isLocked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setDb((prev)=>({
                                ...prev,
                                [currentWeekKey]: {
                                    ...currentData,
                                    status: 'DRAFT'
                                }
                            })),
                    className: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                            size: 16
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 502,
                            columnNumber: 329
                        }, this),
                        " Submitted - Withdraw"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 502,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setIsSaving(true);
                                setTimeout(()=>{
                                    setIsSaving(false);
                                    setToast({
                                        type: 'success',
                                        msg: 'Draft Saved'
                                    });
                                }, 500);
                            },
                            disabled: isSaving,
                            className: "px-8 py-3 rounded-full font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all",
                            children: [
                                isSaving ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    size: 16,
                                    className: "animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 505,
                                    columnNumber: 350
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 505,
                                    columnNumber: 399
                                }, this),
                                " Save Draft"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 505,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setIsSubmitModalOpen(true),
                            disabled: stats.total === "0.0",
                            className: "bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 506,
                                    columnNumber: 272
                                }, this),
                                " Submit Timesheet"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 506,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 500,
                columnNumber: 13
            }, this),
            selectedDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex justify-end",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-slate-900/30 backdrop-blur-sm",
                        onClick: ()=>setSelectedDate(null)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 514,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-full max-w-md bg-white dark:bg-[#11151F] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-xl font-black text-slate-900 dark:text-white",
                                                children: new Date(selectedDate).toLocaleDateString("en-US", {
                                                    weekday: 'long'
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 518,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium text-slate-500",
                                                children: selectedDate
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 519,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 517,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedDate(null),
                                        className: "p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 20,
                                            className: "text-slate-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 521,
                                            columnNumber: 165
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 521,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 516,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto p-6 space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: (currentData.entries[selectedDate] || []).map((e, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-400 transition-colors relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProjectSelector, {
                                                            value: e.projectId,
                                                            onChange: (pid)=>updateEntry(selectedDate, e.id, 'projectId', pid)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                            lineNumber: 528,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 527,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-3 mb-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-20",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "text-[10px] font-bold uppercase text-slate-400 mb-1 block",
                                                                        children: "Hrs"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                        lineNumber: 531,
                                                                        columnNumber: 67
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "number",
                                                                        min: "0",
                                                                        max: "23",
                                                                        value: e.hours,
                                                                        onChange: (ev)=>updateEntry(selectedDate, e.id, 'hours', ev.target.value),
                                                                        className: "w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 focus:border-blue-500 outline-none"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                        lineNumber: 531,
                                                                        columnNumber: 155
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 531,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-20",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "text-[10px] font-bold uppercase text-slate-400 mb-1 block",
                                                                        children: "Mins"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                        lineNumber: 532,
                                                                        columnNumber: 67
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "number",
                                                                        min: "0",
                                                                        max: "59",
                                                                        value: e.minutes,
                                                                        onChange: (ev)=>updateEntry(selectedDate, e.id, 'minutes', ev.target.value),
                                                                        className: "w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 focus:border-blue-500 outline-none"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                        lineNumber: 532,
                                                                        columnNumber: 156
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 532,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-end gap-1 pb-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>addTime(selectedDate, e.id, 15),
                                                                        className: "px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold",
                                                                        children: "+15m"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                        lineNumber: 536,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>addTime(selectedDate, e.id, 60),
                                                                        className: "px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold",
                                                                        children: "+1h"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                        lineNumber: 537,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 535,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 530,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Work description...",
                                                        value: e.notes,
                                                        onChange: (ev)=>updateEntry(selectedDate, e.id, 'notes', ev.target.value),
                                                        className: "w-full text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>duplicateEntry(selectedDate, e),
                                                                className: "bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-500 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                    lineNumber: 542,
                                                                    columnNumber: 250
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 542,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>deleteEntry(selectedDate, e.id),
                                                                className: "bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                    lineNumber: 543,
                                                                    columnNumber: 249
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 543,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 541,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, e.id, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 526,
                                                columnNumber: 37
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 524,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>addEntry(selectedDate),
                                        className: "w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 548,
                                                columnNumber: 335
                                            }, this),
                                            " Add Activity"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 548,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 523,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedDate(null),
                                    className: "w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors",
                                    children: "Done"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 551,
                                    columnNumber: 30
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 550,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 515,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 513,
                columnNumber: 17
            }, this),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`,
                children: [
                    toast.type === 'success' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 560,
                        columnNumber: 49
                    }, this) : toast.type === 'error' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 560,
                        columnNumber: 96
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                        size: 18
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 560,
                        columnNumber: 126
                    }, this),
                    toast.msg
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 559,
                columnNumber: 17
            }, this),
            isSubmitModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                size: 32
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 569,
                                columnNumber: 136
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 569,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold text-slate-900 dark:text-white mb-2",
                            children: "Confirm Submission"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 570,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-500 mb-6",
                            children: [
                                "Lock week of ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: currentWeekKey
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 571,
                                    columnNumber: 81
                                }, this),
                                "? Total: ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: [
                                        stats.stats.total,
                                        "h"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 571,
                                    columnNumber: 123
                                }, this),
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 571,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsSubmitModalOpen(false),
                                    className: "px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 573,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSubmit,
                                    className: "px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700",
                                    children: "Confirm"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 574,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 572,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 568,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 567,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
        lineNumber: 347,
        columnNumber: 9
    }, this);
}
_s1(CompleteTimesheet, "xOThYuioIDEcHmRTZz7UnG1LFPc=");
_c1 = CompleteTimesheet;
var _c, _c1;
__turbopack_context__.k.register(_c, "ProjectSelector");
__turbopack_context__.k.register(_c1, "CompleteTimesheet");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_%28admin%29_%28others-pages%29_timesheet_page_tsx_e4253c31._.js.map