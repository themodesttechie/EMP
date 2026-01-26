(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/modal/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>Modal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const Modal = ({ isOpen, onClose, children, className, showCloseButton = true, isFullscreen = false })=>{
    _s();
    const modalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            const handleEscape = {
                "Modal.useEffect.handleEscape": (event)=>{
                    if (event.key === "Escape") {
                        onClose();
                    }
                }
            }["Modal.useEffect.handleEscape"];
            if (isOpen) {
                document.addEventListener("keydown", handleEscape);
            }
            return ({
                "Modal.useEffect": ()=>{
                    document.removeEventListener("keydown", handleEscape);
                }
            })["Modal.useEffect"];
        }
    }["Modal.useEffect"], [
        isOpen,
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            if (isOpen) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "unset";
            }
            return ({
                "Modal.useEffect": ()=>{
                    document.body.style.overflow = "unset";
                }
            })["Modal.useEffect"];
        }
    }["Modal.useEffect"], [
        isOpen
    ]);
    if (!isOpen) return null;
    const contentClasses = isFullscreen ? "w-full h-full" : "relative w-full rounded-3xl bg-white  dark:bg-gray-900";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999",
        children: [
            !isFullscreen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/ui/modal/index.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: modalRef,
                className: `${contentClasses}  ${className}`,
                onClick: (e)=>e.stopPropagation(),
                children: [
                    showCloseButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            width: "24",
                            height: "24",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                fillRule: "evenodd",
                                clipRule: "evenodd",
                                d: "M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z",
                                fill: "currentColor"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/modal/index.tsx",
                                lineNumber: 82,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/modal/index.tsx",
                            lineNumber: 75,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/modal/index.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/modal/index.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/modal/index.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/modal/index.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Modal, "Hfgks34jZ8gGGjujuH3DNi1cOoA=");
_c = Modal;
var _c;
__turbopack_context__.k.register(_c, "Modal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UltraPremiumTimesheet
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tree$2d$palm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palmtree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tree-palm.js [app-client] (ecmascript) <export default as Palmtree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$modal$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/modal/index.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// Note: If you don't have the Modal component file, I have included a simple inline one at the bottom of this code.
/* ---------------- 1. CONFIGURATION & MOCK DB ---------------- */ // Governance Rules
const HOLIDAYS = [
    "2026-01-26"
]; // Republic Day
const APPROVED_LEAVES = [
    "2026-01-27"
]; // Approved Leave
const CURRENT_USER_ID = "u1";
// Projects Database
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
        name: "Acme Corp: Redesign",
        code: "ACM-102",
        color: "bg-blue-600",
        billable: true
    },
    {
        id: "p3",
        name: "Globex: Mobile App",
        code: "GLO-404",
        color: "bg-indigo-600",
        billable: true
    },
    {
        id: "p4",
        name: "Stark Ind: Consulting",
        code: "STK-999",
        color: "bg-amber-600",
        billable: true
    }
];
/* ---------------- 3. HELPERS ---------------- */ const formatDate = (d)=>d.toISOString().split("T")[0];
const addDays = (d, days)=>{
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
};
// Ensure we always snap to Monday
const startOfWeek = (date)=>{
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};
function UltraPremiumTimesheet() {
    _s();
    // 1. Initialize State with "Today"
    const [currentWeekStart, setCurrentWeekStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(startOfWeek(new Date("2026-01-26")));
    // 2. The "Database" State (Persists across week navigation)
    const [db, setDb] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        // Seed with some initial data for the demo week
        "2026-01-26": {
            status: "DRAFT",
            entries: {}
        }
    });
    // 3. UI States
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errorMsg, setErrorMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [successMsg, setSuccessMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Helpers to get current week's data safely
    const currentWeekKey = formatDate(currentWeekStart);
    const currentWeekData = db[currentWeekKey] || {
        status: "DRAFT",
        entries: {}
    };
    const isLocked = currentWeekData.status !== "DRAFT";
    // Auto-clear toasts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UltraPremiumTimesheet.useEffect": ()=>{
            if (errorMsg) setTimeout({
                "UltraPremiumTimesheet.useEffect": ()=>setErrorMsg(null)
            }["UltraPremiumTimesheet.useEffect"], 3000);
            if (successMsg) setTimeout({
                "UltraPremiumTimesheet.useEffect": ()=>setSuccessMsg(null)
            }["UltraPremiumTimesheet.useEffect"], 3000);
        }
    }["UltraPremiumTimesheet.useEffect"], [
        errorMsg,
        successMsg
    ]);
    /* --- DERIVED: DAYS CALCULATION --- */ const days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "UltraPremiumTimesheet.useMemo[days]": ()=>{
            return Array.from({
                length: 7
            }).map({
                "UltraPremiumTimesheet.useMemo[days]": (_, i)=>{
                    const d = addDays(currentWeekStart, i);
                    const dateStr = formatDate(d);
                    const isHoliday = HOLIDAYS.includes(dateStr);
                    const isLeave = APPROVED_LEAVES.includes(dateStr);
                    const isBlocked = isHoliday || isLeave;
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
                        isWeekend: i === 5 || i === 6,
                        isHoliday,
                        isLeave,
                        isBlocked,
                        // Get entries from the DB for this specific day
                        entries: currentWeekData.entries[dateStr] || []
                    };
                }
            }["UltraPremiumTimesheet.useMemo[days]"]);
        }
    }["UltraPremiumTimesheet.useMemo[days]"], [
        currentWeekStart,
        currentWeekData
    ]);
    /* --- DERIVED: STATS --- */ const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "UltraPremiumTimesheet.useMemo[stats]": ()=>{
            let total = 0;
            let billable = 0;
            let nonBillable = 0;
            Object.values(currentWeekData.entries).forEach({
                "UltraPremiumTimesheet.useMemo[stats]": (dayEntries)=>{
                    dayEntries.forEach({
                        "UltraPremiumTimesheet.useMemo[stats]": (e)=>{
                            total += e.hours;
                            const project = PROJECTS.find({
                                "UltraPremiumTimesheet.useMemo[stats].project": (p)=>p.id === e.projectId
                            }["UltraPremiumTimesheet.useMemo[stats].project"]);
                            if (project?.billable) billable += e.hours;
                            else nonBillable += e.hours;
                        }
                    }["UltraPremiumTimesheet.useMemo[stats]"]);
                }
            }["UltraPremiumTimesheet.useMemo[stats]"]);
            const utilization = Math.min(100, total / 40 * 100);
            return {
                total,
                billable,
                nonBillable,
                utilization
            };
        }
    }["UltraPremiumTimesheet.useMemo[stats]"], [
        currentWeekData
    ]);
    /* ---------------- CORE LOGIC FUNCTIONS ---------------- */ // Generic DB Updater
    const updateDb = (fn)=>{
        setDb((prev)=>fn(prev));
    };
    const handleNavigateWeek = (direction)=>{
        const newDate = addDays(currentWeekStart, direction === 'next' ? 7 : -7);
        setCurrentWeekStart(newDate);
    // Note: We don't need to fetch data, React will re-render and pull from `db` based on the new date key
    };
    const addEntry = (date, hours = 0, projectId = PROJECTS[0].id)=>{
        if (isLocked) {
            setErrorMsg("Week is submitted. Withdraw to edit.");
            return;
        }
        const dayInfo = days.find((d)=>d.date === date);
        if (dayInfo?.isHoliday) {
            setErrorMsg("Cannot log hours on Public Holiday.");
            return;
        }
        if (dayInfo?.isLeave) {
            setErrorMsg("Cannot log hours on Approved Leave.");
            return;
        }
        updateDb((prev)=>{
            const week = prev[currentWeekKey] || {
                status: "DRAFT",
                entries: {}
            };
            const dayEntries = week.entries[date] || [];
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: [
                            ...dayEntries,
                            {
                                id: crypto.randomUUID(),
                                projectId,
                                hours,
                                notes: ""
                            }
                        ]
                    }
                }
            };
        });
    };
    const updateEntry = (date, entryId, field, value)=>{
        if (isLocked) return;
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            const updatedDay = week.entries[date].map((e)=>e.id === entryId ? {
                    ...e,
                    [field]: value
                } : e);
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: updatedDay
                    }
                }
            };
        });
    };
    const deleteEntry = (date, entryId)=>{
        if (isLocked) return;
        updateDb((prev)=>{
            const week = prev[currentWeekKey];
            return {
                ...prev,
                [currentWeekKey]: {
                    ...week,
                    entries: {
                        ...week.entries,
                        [date]: week.entries[date].filter((e)=>e.id !== entryId)
                    }
                }
            };
        });
    };
    /* ---------------- PREMIUM FEATURES ---------------- */ const handleCopyPreviousWeek = ()=>{
        if (isLocked) return;
        // 1. Find Previous Week Key
        const prevWeekDate = addDays(currentWeekStart, -7);
        const prevWeekKey = formatDate(prevWeekDate);
        const prevData = db[prevWeekKey];
        if (!prevData || Object.keys(prevData.entries).length === 0) {
            setErrorMsg("No data found in previous week to copy.");
            return;
        }
        // 2. Clone entries to current week (Generate NEW IDs)
        const newEntries = {};
        days.forEach((day, index)=>{
            if (day.isBlocked) return; // Skip holidays in CURRENT week
            // Calculate matching date in previous week (e.g., Mon -> Mon)
            const prevDayDate = addDays(prevWeekDate, index);
            const sourceEntries = prevData.entries[formatDate(prevDayDate)] || [];
            if (sourceEntries.length > 0) {
                newEntries[day.date] = sourceEntries.map((e)=>({
                        ...e,
                        id: crypto.randomUUID()
                    }));
            }
        });
        updateDb((prev)=>({
                ...prev,
                [currentWeekKey]: {
                    ...prev[currentWeekKey],
                    entries: newEntries
                }
            }));
        setSuccessMsg("Copied entries from previous week!");
    };
    const handleAutoFill = ()=>{
        if (isLocked) return;
        const newEntries = {
            ...currentWeekData.entries
        };
        let addedCount = 0;
        days.slice(0, 5).forEach((d)=>{
            if (d.isBlocked) return; // Governance check
            if (!newEntries[d.date] || newEntries[d.date].length === 0) {
                newEntries[d.date] = [
                    {
                        id: crypto.randomUUID(),
                        projectId: PROJECTS[0].id,
                        hours: 8,
                        notes: "Regular hours"
                    }
                ];
                addedCount++;
            }
        });
        updateDb((prev)=>({
                ...prev,
                [currentWeekKey]: {
                    ...prev[currentWeekKey],
                    entries: newEntries
                }
            }));
        if (addedCount > 0) setSuccessMsg(`Auto-filled ${addedCount} days.`);
        else setErrorMsg("Week is already full or blocked.");
    };
    const handleSubmit = ()=>{
        updateDb((prev)=>({
                ...prev,
                [currentWeekKey]: {
                    ...prev[currentWeekKey],
                    status: "SUBMITTED"
                }
            }));
        setIsSubmitModalOpen(false);
        setSuccessMsg("Timesheet submitted successfully!");
    };
    const handleWithdraw = ()=>{
        if (confirm("Withdraw timesheet to make edits? Approval process will reset.")) {
            updateDb((prev)=>({
                    ...prev,
                    [currentWeekKey]: {
                        ...prev[currentWeekKey],
                        status: "DRAFT"
                    }
                }));
            setSuccessMsg("Timesheet withdrawn to Draft.");
        }
    };
    /* ---------------- RENDER ---------------- */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto max-w-7xl px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col xl:flex-row justify-between items-start gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        className: "text-blue-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 295,
                                        columnNumber: 25
                                    }, this),
                                    " Timesheet Portal"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 294,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 mt-1 ml-1",
                                children: "Track time, manage projects, and submit for approval."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 297,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 293,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleNavigateWeek('prev'),
                                className: "p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 303,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 302,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-6 flex flex-col items-center min-w-[160px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-bold uppercase text-slate-400",
                                        children: "Current Week"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 306,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 308,
                                                columnNumber: 29
                                            }, this),
                                            days[0].fullLabel.split(',')[1],
                                            " - ",
                                            days[6].fullLabel.split(',')[1]
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 307,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 305,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleNavigateWeek('next'),
                                className: "p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 313,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 312,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 301,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 292,
                columnNumber: 13
            }, this),
            errorMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-6 right-6 z-50 bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 shadow-xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 321,
                        columnNumber: 21
                    }, this),
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-bold",
                        children: errorMsg
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 321,
                        columnNumber: 49
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 320,
                columnNumber: 17
            }, this),
            successMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-6 right-6 z-50 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-xl border border-emerald-100 shadow-xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 326,
                        columnNumber: 21
                    }, this),
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-bold",
                        children: successMsg
                    }, void 0, false, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 326,
                        columnNumber: 41
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 325,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                                                        children: "Total"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-3xl font-black text-slate-900 dark:text-white mt-1",
                                                        children: [
                                                            stats.total,
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-lg text-slate-300 font-medium",
                                                                children: "/40"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 339,
                                                                columnNumber: 119
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 339,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 337,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-[1px] bg-slate-100 dark:bg-slate-800"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 341,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                                size: 12
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 135
                                                            }, this),
                                                            " Billable"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-emerald-600 mt-1",
                                                        children: [
                                                            stats.billable,
                                                            "h"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 342,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-[1px] bg-slate-100 dark:bg-slate-800"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 346,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                                                size: 12
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 348,
                                                                columnNumber: 135
                                                            }, this),
                                                            " Internal"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-slate-500 mt-1",
                                                        children: [
                                                            stats.nonBillable,
                                                            "h"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 347,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 336,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${currentWeekData.status === "DRAFT" ? "bg-amber-100 text-amber-700" : currentWeekData.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`,
                                        children: [
                                            currentWeekData.status === "DRAFT" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 358,
                                                columnNumber: 67
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 358,
                                                columnNumber: 89
                                            }, this),
                                            currentWeekData.status
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 354,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 335,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `absolute left-0 top-0 h-full transition-all duration-1000 ${stats.utilization > 100 ? 'bg-red-500' : 'bg-blue-600'}`,
                                    style: {
                                        width: `${stats.utilization}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 365,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 364,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 334,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1",
                                children: "Quick Tools"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 371,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleCopyPreviousWeek,
                                        disabled: isLocked,
                                        className: "flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md hover:text-blue-600 transition-all disabled:opacity-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                size: 18,
                                                className: "text-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 378,
                                                columnNumber: 29
                                            }, this),
                                            " Copy Last Week"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 373,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleAutoFill,
                                        disabled: isLocked,
                                        className: "flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md hover:text-purple-600 transition-all disabled:opacity-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wand$2d$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wand2$3e$__["Wand2"], {
                                                size: 18,
                                                className: "text-purple-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 385,
                                                columnNumber: 29
                                            }, this),
                                            " Smart Auto-Fill"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 380,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 372,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 370,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 331,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-7 gap-4",
                children: days.map((d)=>{
                    const dailyHours = d.entries.reduce((acc, curr)=>acc + curr.hours, 0);
                    const isComplete = dailyHours >= 8;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `
                                relative min-h-[240px] flex flex-col rounded-2xl border transition-all duration-300
                                ${d.isBlocked ? "bg-slate-50/80 dark:bg-white/[0.02] border-slate-200 dark:border-slate-800" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm hover:shadow-lg"}
                            `,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-[10px] font-black uppercase ${d.isBlocked ? 'text-slate-400' : 'text-slate-500'}`,
                                                children: d.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 411,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-xl font-black ${d.isBlocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`,
                                                children: d.dayNum
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 410,
                                        columnNumber: 33
                                    }, this),
                                    d.isHoliday && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "bg-purple-100 text-purple-600 p-1.5 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 415,
                                            columnNumber: 114
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 415,
                                        columnNumber: 49
                                    }, this),
                                    d.isLeave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "bg-amber-100 text-amber-600 p-1.5 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tree$2d$palm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palmtree$3e$__["Palmtree"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 416,
                                            columnNumber: 110
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 416,
                                        columnNumber: 47
                                    }, this),
                                    !d.isBlocked && dailyHours > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `px-2 py-0.5 rounded text-[10px] font-black ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`,
                                        children: [
                                            dailyHours,
                                            "h"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 419,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 409,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 p-2 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar",
                                children: d.isBlocked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full flex flex-col items-center justify-center text-slate-300 gap-2 select-none min-h-[120px]",
                                    children: [
                                        d.isHoliday ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                            size: 24,
                                            className: "opacity-20"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 429,
                                            columnNumber: 56
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tree$2d$palm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palmtree$3e$__["Palmtree"], {
                                            size: 24,
                                            className: "opacity-20"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 429,
                                            columnNumber: 105
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold uppercase tracking-widest",
                                            children: d.isHoliday ? "Holiday" : "Leave"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 430,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 428,
                                    columnNumber: 37
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        d.entries.map((e)=>{
                                            const project = PROJECTS.find((p)=>p.id === e.projectId);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                onClick: ()=>!isLocked && setSelectedDate(d.date),
                                                className: `
                                                        p-2.5 rounded-xl border border-transparent transition-all group/entry
                                                        ${isLocked ? 'bg-slate-50 cursor-default' : 'bg-slate-50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'}
                                                    `,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-start mb-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${project?.color}`,
                                                                children: project?.code
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 446,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-bold text-slate-700",
                                                                children: [
                                                                    e.hours,
                                                                    "h"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 447,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 445,
                                                        columnNumber: 53
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500 line-clamp-1",
                                                        children: e.notes || "No notes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 449,
                                                        columnNumber: 53
                                                    }, this)
                                                ]
                                            }, e.id, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 437,
                                                columnNumber: 49
                                            }, this);
                                        }),
                                        !isLocked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "pt-2",
                                            children: [
                                                d.entries.length === 0 && !d.isWeekend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>addEntry(d.date, 8),
                                                    className: "w-full py-2 mb-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors",
                                                    children: "+ Quick 8h"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 458,
                                                    columnNumber: 53
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setSelectedDate(d.date),
                                                    className: "w-full py-2 border border-dashed border-slate-200 text-slate-400 rounded-lg text-xs font-bold hover:border-blue-400 hover:text-blue-600 transition-colors",
                                                    children: d.entries.length > 0 ? "Edit / Add More" : "Add Entry"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 456,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 426,
                                columnNumber: 29
                            }, this)
                        ]
                    }, d.date, true, {
                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                        lineNumber: 398,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 392,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-8 left-1/2 -translate-x-1/2 z-40",
                children: isLocked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-slate-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom fade-in duration-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-sm font-bold",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    size: 16,
                                    className: "text-emerald-400"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 480,
                                    columnNumber: 29
                                }, this),
                                "Timesheet Submitted"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 479,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleWithdraw,
                            className: "bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-full text-xs font-bold transition-colors",
                            children: "Withdraw to Edit"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 483,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 478,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: stats.total === 0,
                    onClick: ()=>setIsSubmitModalOpen(true),
                    className: "bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-blue-500/30 hover:scale-105 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 493,
                            columnNumber: 25
                        }, this),
                        " Submit ",
                        stats.total,
                        " Hours"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 488,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 476,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$modal$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
                isOpen: !!selectedDate,
                onClose: ()=>setSelectedDate(null),
                children: selectedDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-slate-50 dark:bg-slate-950 p-5 border-b border-slate-100 flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xl font-bold text-slate-900 dark:text-white",
                                            children: new Date(selectedDate).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric"
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 505,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-medium text-slate-500 uppercase tracking-widest mt-1",
                                            children: "Editing Entries"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 508,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 504,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedDate(null),
                                    className: "p-2 hover:bg-slate-200 rounded-full",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 20,
                                        className: "text-slate-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 510,
                                        columnNumber: 123
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 510,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 503,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto p-6 space-y-4",
                            children: [
                                (currentWeekData.entries[selectedDate] || []).map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-4 rounded-xl border border-slate-100 bg-slate-50/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "md:col-span-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-bold uppercase text-slate-400 mb-1 block",
                                                        children: "Project"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: e.projectId,
                                                        onChange: (ev)=>updateEntry(selectedDate, e.id, "projectId", ev.target.value),
                                                        className: "w-full p-2 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none",
                                                        children: PROJECTS.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: p.id,
                                                                children: [
                                                                    p.code,
                                                                    " - ",
                                                                    p.name
                                                                ]
                                                            }, p.id, true, {
                                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                                lineNumber: 524,
                                                                columnNumber: 64
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 519,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 517,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "md:col-span-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-bold uppercase text-slate-400 mb-1 block",
                                                        children: "Hours"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 528,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        max: "24",
                                                        value: e.hours,
                                                        onChange: (ev)=>updateEntry(selectedDate, e.id, "hours", Number(ev.target.value)),
                                                        className: "w-full p-2 rounded-lg border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 529,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 527,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "md:col-span-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-[10px] font-bold uppercase text-slate-400 mb-1 block",
                                                        children: "Notes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 536,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Details...",
                                                        value: e.notes,
                                                        onChange: (ev)=>updateEntry(selectedDate, e.id, "notes", ev.target.value),
                                                        className: "w-full p-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 535,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "md:col-span-1 flex justify-center pt-6",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>deleteEntry(selectedDate, e.id),
                                                    className: "text-slate-300 hover:text-red-500",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        size: 18
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 143
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                    lineNumber: 544,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                                lineNumber: 543,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, e.id, true, {
                                        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                        lineNumber: 516,
                                        columnNumber: 33
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>addEntry(selectedDate),
                                    className: "w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                            lineNumber: 550,
                                            columnNumber: 33
                                        }, this),
                                        " Add New Row"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 549,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 514,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 bg-slate-50 border-t border-slate-100 flex justify-end",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedDate(null),
                                className: "bg-slate-900 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all",
                                children: "Save & Close"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 556,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 555,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 501,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 499,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$modal$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
                isOpen: isSubmitModalOpen,
                onClose: ()=>setIsSubmitModalOpen(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl p-8 max-w-sm w-full text-center mx-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                size: 32
                            }, void 0, false, {
                                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                lineNumber: 568,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 567,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold text-slate-900 mb-2",
                            children: "Submit Timesheet?"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 570,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-500 mb-6",
                            children: [
                                "You are about to submit ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: [
                                        stats.total,
                                        " Hours"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 572,
                                    columnNumber: 49
                                }, this),
                                " for approval. You will not be able to edit this unless you withdraw it."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 571,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsSubmitModalOpen(false),
                                    className: "px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 575,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSubmit,
                                    className: "px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
                                    children: "Confirm Submit"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                                    lineNumber: 576,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                            lineNumber: 574,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 566,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 565,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
        lineNumber: 289,
        columnNumber: 9
    }, this);
}
_s(UltraPremiumTimesheet, "yZR7GopLSYFS8jlKOiWGh5GBVGE=");
_c = UltraPremiumTimesheet;
// INLINE MODAL COMPONENT (If you don't have one)
function SimpleModal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 589,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full flex justify-center pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "pointer-events-auto shadow-2xl",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                    lineNumber: 591,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
                lineNumber: 590,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(admin)/(others-pages)/timesheet/page.tsx",
        lineNumber: 588,
        columnNumber: 9
    }, this);
}
_c1 = SimpleModal;
var _c, _c1;
__turbopack_context__.k.register(_c, "UltraPremiumTimesheet");
__turbopack_context__.k.register(_c1, "SimpleModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_d173bb50._.js.map