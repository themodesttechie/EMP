// data/nav-items.ts
import {
    LayoutDashboard, FileText, DollarSign, Clock,
    Briefcase, Users, Plane, MessageSquare, GraduationCap,
    LogOut, Settings
} from 'lucide-react';

import GridIcon from '@/icons/grid.svg';
import DocsIcon from '@/icons/docs.svg';
import DollarLineIcon from '@/icons/dollar-line.svg';
import TaskIcon from '@/icons/task.svg';
import Group from '@/icons/group.svg';
import ChatIcon from '@/icons/chat.svg';
import ShootingStarIcon from '@/icons/shooting-star.svg';
import UserCircleIcon from '@/icons/user-circle.svg';

export type NavItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    subItems?: NavItem[];
};

export const navItems: NavItem[] = [
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
            { name: "Holiday List", path: "/holiday-list" },
            { name: "Timesheet", path: "/timesheet" },
            { name: "Attendance", path: "/attendance" },
            { name: "Shift Management", path: "/shift-management" },
            { name: "Work From Home", path: "/work-from-home" },
            { name: "Overtime & Extra Hours", path: "/overtime-extra-hours" },
            { name: "Queries & Support", path: "/time-management-queries-support" },
            { name: "Approval Workflows", path: "/approval-workflows" },
            { name: "Delegation", path: "/delegations" },
        ],
    },
    {
        icon: <TaskIcon />,
        name: "Asset Management",
        subItems: [
            { name: "My Assets", path: "/my-assets" },
            { name: "Service Catalog", path: "/request-asset" },
            { name: "My Requests", path: "/my-requests" },
            { name: "Return Asset", path: "/return-asset" },
            { name: "Exchange Asset", path: "/exchange-asset" },
            { name: "Asset Issue", path: "/asset-issue" },
            { name: "Asset Documentation", path: "/asset-documentation" },
            { name: "Exit Clearance", path: "/asset-exit-clearance" },
            { name: "IT Admin Dashboard", path: "/it-admin" },
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