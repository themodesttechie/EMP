"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoltIcon,
  BoxCubeIcon,
  CalenderIcon,
  ChatIcon,
  ChevronDownIcon,
  DocsIcon,
  DollarLineIcon,
  FolderIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  ShootingStarIcon,
  TableIcon,
  TaskIcon,
  TimeIcon,
  UserCircleIcon,
} from "../icons/index";
import { Clock, Computer, Group, Plane } from "lucide-react";
import { Asset } from "next/font/google";
import { FLIGHT_HEADERS } from "next/dist/client/components/app-router-headers";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// const navItems: NavItem[] = [
//   {
//     icon: <GridIcon />,
//     name: "Dashboard",
//     path: "/",
//   },
//   {
//     icon: <CalenderIcon />,
//     name: "Calendar",
//     path: "/leave-calendar",
//   },
//   {
//     icon: <DocsIcon />,
//     name: "Employee Document Hub",
//     path: "/employee-hub",
//   },
//   {
//     icon: <ListIcon />,
//     name: "HR Policies",
//     path: "/hr-policies",
//   },
//   {
//     icon: <TimeIcon />,
//     name: "TimeSheet",
//     path: "/timesheet",
//   },
//   {
//     icon: <DollarLineIcon />,
//     name: "Benefits",
//     path: "/benefits",
//   },
//   {
//     icon: <TaskIcon />,
//     name: "Help Desk",
//     path: "/help-desk",
//   },
//   {
//     icon: <ShootingStarIcon />,
//     name: "Learning & Training",
//     path: "/learning-training",
//   },
//   {
//     icon: <UserCircleIcon />,
//     name: "Leave IfBash",
//     path: "/leave-ifbash",
//   },
//   {
//     icon: <ChatIcon />,
//     name: "Announcements",
//     path: "/announcements",
//   },
//   {
//     icon: <BoltIcon />,
//     name: "Payslips",
//     path: "/payslips",
//   },
//   {
//     icon: <TableIcon />,
//     name: "Reimbursements",
//     path: "/reimbursements",
//   },
//   {
//     icon: <CalenderIcon />,
//     name: "Appreciate",
//     path: "/appreciate",
//   },
//   {
//     icon: <UserCircleIcon />,
//     name: "Admin",
//     path: "/admin",
//   },



//   // {
//   //   name: "Forms",
//   //   icon: <ListIcon />,
//   //   subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
//   // },
//   // {
//   //   name: "Tables",
//   //   icon: <TableIcon />,
//   //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
//   // },
//   // {
//   //   name: "Pages",
//   //   icon: <PageIcon />,
//   //   subItems: [
//   //     { name: "Blank Page", path: "/blank", pro: false },
//   //     { name: "404 Error", path: "/error-404", pro: false },
//   //   ],
//   // },
// ];


const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <DocsIcon />,
    name: "HR Services",
    subItems: [
      { name: "Employee Hub", path: "/employee-hub" },
      { name: "HR Policies & Handbooks", path: "/hr-policies" },
      { name: "Onboarding & Offboarding", path: "/onboarding-offboarding" },
      { name: "Employment Details", path: "/employment-details" },
      { name: "Company Letters", path: "/company-letters" },
      { name: "Background Verification", path: "/background-verification" },
      { name: "Transfer & Relocation", path: "/transfer-relocation" },
      { name: "Queries & Support", path: "/hr-queries-support" },
      { name: "Grievances", path: "/grievances" },
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Pay",
    subItems: [
      { name: "My Payslips", path: "/payslips" },
      { name: "Tax", path: "/tax" },
      { name: "Total Rewards", path: "/total-rewards" },
      { name: "Bonus history", path: "/bonus-history" },
      { name: "Claims", path: "/claims" },
      { name: "Reimbursements", path: "/reimbursements" },
      { name: "Reimbursable Allowances", path: "/reimbursable-allowances" },
      { name: "Expenses", path: "/expenses" },
      { name: "Salary Advance & Loans", path: "/salary-advance-loans" },
      { name: "Bank & Payment Details", path: "/bank-payment-details" },
      { name: "Queries & Support", path: "/payroll-queries-support" },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Benefits",
    path: "/benefits",
  },
  {
    icon: <Clock />,
    name: "Time Management",
    subItems: [
      { name: "Request Absence", path: "/request-absence" },
      { name: "Manage Absence", path: "/manage-absence" },
      { name: "Time off - Balance", path: "/time-off-balance" },
      { name: "Calendar", path: "/calendar" },
      { name: "Holiday List", path: "/holiday-list" },
      { name: "Timesheet", path: "/timesheet" },
      { name: "Attendance", path: "/attendance" },
      { name: "Shift Management", path: "/shift-management" },
      { name: "Work From Home", path: "/work-from-home" },
      { name: "Overtime & Extra Hours", path: "/overtime-extra-hours" },
      { name: "Queries & Support", path: "/time-management-queries-support" },
    ],
  },
  {
    icon: <Computer />,
    name: "Asset Management",
    subItems: [
      { name: "My Assets", path: "/my-assets" },
      { name: "Request Asset", path: "/request-asset" },
      { name: "Return Asset", path: "/return-asset" },
      { name: "Exchange Asset", path: "/exchange-asset" },
      { name: "Asset Issue", path: "/asset-issue" },
      { name: "Asset Documentation", path: "/asset-documentation" },
      { name: "Exit Clearance", path: "/asset-exit-clearance" },
    ],
  },
  {
    icon: <Group />,
    name: "Workplace",
    subItems: [
      { name: "Employee Directory", path: "/employee-directory" },
      { name: "Organizational Chart", path: "/organizational-chart" },
      { name: "Announcements", path: "/announcements" },
      { name: "Company News", path: "/company-news" },
      { name: "Appreciate", path: "/appreciate" },
      { name: "Feedback", path: "/feedback" },
      { name: "Frequently Asked Questions", path: "/faq" },
    ],
  },
  {
    icon: <Plane />,
    name: "Travel",
    subItems: [
      { name: "Travel Request", path: "/travel-request" },
      { name: "Visa & Immigration", path: "/visa-immigration" },
      { name: "Foreign Exchange", path: "/foreign-exchange" },
      { name: "Travel Policy & Guidelines", path: "/travel-policy-guidelines" },
      { name: "Queries & Support", path: "/travel-management-queries-support" },
    ],
  },
  {
    icon: <ChatIcon />,
    name: "Support & Engagement",
    subItems: [
      { name: "Help Desk", path: "/helpdesk" },
      { name: "Appreciate", path: "/appreciate" },
      { name: "Announcements", path: "/announcements" },
    ],
  },
  {
    icon: <ShootingStarIcon />,
    name: "Learning & Training",
    subItems: [
      { name: "My Learning Dashboard", path: "/my-learning-dashboard" },
      { name: "Course Catalog", path: "/course-catalog" },
      { name: "My Courses", path: "/my-courses" },
      { name: "Learning Paths", path: "/learning-paths" },
      { name: "Mandatory & Compliance Trainings", path: "/mandatory-compliance-trainings" },
      { name: "Assessments & Quizzes", path: "/assessments-quizzes" },
      { name: "Surveys & Feedbacks", path: "/surveys-feedbacks" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Resignation & Exit",
    subItems: [
      { name: "Submit Resignation", path: "/submit-resignation" },
      { name: "Resignation Status", path: "/resignation-status" },
      { name: "Withdraw Resignation", path: "/withdraw-resignation" },
      { name: "Notice Period Management", path: "/notice-period-management" },
      { name: "Exit Clearance Checklist", path: "/exit-clearance-checklist" },
      { name: "HR Clearance", path: "/hr-clearance" },
      { name: "IT Clearance", path: "/it-clearance" },
      { name: "Finance/Accounts Clearance", path: "/finance-clearance" },
      { name: "Admin/Facilities Clearance", path: "/admin-clearance" },
      { name: "Knowledge Transfer (KT)", path: "/knowledge-transfer" },
      { name: "Exit Interview", path: "/exit-interview" },
      { name: "Full & Final Settlement", path: "/full-final-settlement" },
      { name: "Exit Documents", path: "/exit-documents" },
      { name: "Post-Exit Support", path: "/post-exit-support" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Admin",
    path: "/admin",
    // Recommended: Hide via role-based access control
  },
];


const othersItems: NavItem[] = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart", pro: false },
  //     { name: "Bar Chart", path: "/bar-chart", pro: false },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts", pro: false },
  //     { name: "Avatar", path: "/avatars", pro: false },
  //     { name: "Badge", path: "/badge", pro: false },
  //     { name: "Buttons", path: "/buttons", pro: false },
  //     { name: "Images", path: "/images", pro: false },
  //     { name: "Videos", path: "/videos", pro: false },
  //   ],
  // },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isNavigatorPinned: isExpanded, isNavigatorOpen: isMobileOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const renderMenuItems = (navItems: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => {
        const isSelected = openSubmenu?.type === menuType && openSubmenu?.index === index;

        return (
          <li
            key={nav.name}
            className="relative px-2 group/menu-parent"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const opensUpward = rect.top > windowHeight * 0.6;

              // Set the submenu state
              setOpenSubmenu({ type: menuType, index });

              // Store positioning data
              setSubMenuHeight((prev) => ({
                ...prev,
                [`top-${index}`]: rect.top,
                [`dir-${index}`]: opensUpward ? 1 : 0
              }));
            }}
            onMouseLeave={() => {
              setOpenSubmenu(null);
            }}
          >
            {nav.subItems ? (
              <>
                {/* Trigger Button Area */}
                <div
                  className={`menu-item group w-full flex items-center transition-all rounded-lg p-3 cursor-pointer ${isSelected ? "bg-brand-50 text-brand-600 shadow-sm" : "text-gray-700 hover:bg-gray-100"
                    } ${!isExpanded && !isHovered ? "justify-center" : "justify-start"}`}
                >
                  <span className={isSelected ? "text-brand-600" : ""}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <>
                      <span className="ml-3 text-sm font-medium">{nav.name}</span>
                      <span className="ml-auto opacity-40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                      </span>
                    </>
                  )}
                </div>

                {/* THE SUBMENU POPUP */}
                {isSelected && (
                  <div
                    className="fixed z-[9999]"
                    style={{
                      // Align to the edge of the sidebar
                      left: isExpanded || isHovered || isMobileOpen ? "285px" : "85px",
                      // Smart Up/Down positioning
                      top: subMenuHeight[`dir-${index}`]
                        ? "auto"
                        : `${subMenuHeight[`top-${index}`]}px`,
                      bottom: subMenuHeight[`dir-${index}`]
                        ? `${window.innerHeight - (subMenuHeight[`top-${index}`] + 45)}px`
                        : "auto",
                      // The "Bridge": This invisible padding ensures the mouse 
                      // stays "inside" the menu while moving from the sidebar
                      paddingLeft: "20px",
                      marginLeft: "-10px"
                    }}
                  >
                    <div className="min-w-[260px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-[15px_15px_50px_rgba(0,0,0,0.2)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-150">
                      <div className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b dark:border-gray-800">
                        {nav.name}
                      </div>
                      <ul className="p-2 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {nav.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.path}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={nav.path || "/"}
                className={`menu-item group ${isActive(nav.path || "") ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span>{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-3 text-sm font-medium">{nav.name}</span>
                )}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
      ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* <div className="">
            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                ? "lg:justify-center"
                : "justify-start"
                }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Others"
              ) : (
                <HorizontaLDots />
              )}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </div> */}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen}
      </div>
    </aside>
  );
};

export default AppSidebar;
