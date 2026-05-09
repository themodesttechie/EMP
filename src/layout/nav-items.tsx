// data/nav-items.ts
import { Computer, Group } from 'lucide-react';

import GridIcon from '@/icons/grid.svg';
import TaskIcon from '@/icons/task.svg';
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
        icon: <ChatIcon />,
        name: "Support",
        subItems: [
            { name: "Helpdesk", path: "/helpdesk" },
            { name: "My Requests", path: "/my-requests" },
            { name: "Service Catalog", path: "/request-asset" },
            { name: "Approval Workflows", path: "/approval-workflows" },
            { name: "Delegations", path: "/delegations" },
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
            { name: "Employee Hub", path: "/employee-hub" },
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
        icon: <TaskIcon />,
        name: "Profile",
        path: "/profile",
    },
    {
        icon: <UserCircleIcon />,
        name: "Admin",
        path: "/admin",
    },
];
