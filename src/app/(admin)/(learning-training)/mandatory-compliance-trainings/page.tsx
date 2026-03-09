"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, AlertCircle, ShieldCheck, Play } from "lucide-react";
import Link from "next/link";
import CourseCard from "@/components/learning/CourseCard";

// Mock data
const COMPLIANCE_METRICS = {
    overallCompletion: 85,
    totalMandatory: 8,
    completed: 6,
    upcoming: 1,
    overdue: 1,
};

const MANDATORY_COURSES = [
    {
        id: "c-1",
        title: "Annual Data Privacy & GDPR 2024",
        instructor: "Legal Team",
        duration: "1h 30m",
        dueDate: "2024-03-01",
        status: "overdue",
        progress: 0,
        image: "https://placehold.co/600x400/ef4444/FFFFFF?text=GDPR",
    },
    {
        id: "c-2",
        title: "Workplace Harassment Prevention",
        instructor: "HR Department",
        duration: "2h",
        dueDate: "2024-03-15",
        status: "due-soon",
        progress: 40,
        image: "https://placehold.co/600x400/f59e0b/FFFFFF?text=Workplace+Safety",
    },
    {
        id: "c-3",
        title: "IT Security & Phishing Awareness",
        instructor: "IT Security",
        duration: "45m",
        dueDate: "2024-01-15",
        status: "completed",
        progress: 100,
        image: "https://placehold.co/600x400/22c55e/FFFFFF?text=IT+Security",
    },
    {
        id: "c-4",
        title: "Code of Conduct Acknowledgment",
        instructor: "Compliance Team",
        duration: "30m",
        dueDate: "2024-02-01",
        status: "completed",
        progress: 100,
        image: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Code+Of+Conduct",
    }
];

export default function MandatoryTrainings() {
    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Mandatory & Compliance Trainings" />
            
            {/* Compliance Status Overview Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    
                    {/* Radial Progress Widget */}
                    <div className="flex items-center gap-6">
                        <div className="relative h-32 w-32 shrink-0">
                            {/* SVG Circle for Progress Ring */}
                            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" className="fill-transparent stroke-gray-100 dark:stroke-gray-800" strokeWidth="10" />
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    className={`fill-transparent ${COMPLIANCE_METRICS.overallCompletion === 100 ? "stroke-green-500" : "stroke-blue-600"}`}
                                    strokeWidth="10" 
                                    strokeLinecap="round" 
                                    strokeDasharray={`${(COMPLIANCE_METRICS.overallCompletion / 100) * 251.2} 251.2`} 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {COMPLIANCE_METRICS.overallCompletion}%
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Compliance Status</h3>
                            <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
                                {COMPLIANCE_METRICS.overallCompletion === 100 
                                    ? "Great job! You are fully compliant with all mandatory trainings." 
                                    : "You have pending mandatory trainings. Please complete them before the respective deadlines to maintain compliance."}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
                        <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{COMPLIANCE_METRICS.totalMandatory}</span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Assigned</span>
                        </div>
                        <div className="rounded-xl bg-green-50 px-4 py-3 dark:bg-green-500/10 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{COMPLIANCE_METRICS.completed}</span>
                            <span className="text-xs font-medium text-green-600/70 dark:text-green-500">Completed</span>
                        </div>
                        <div className="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/10 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{COMPLIANCE_METRICS.upcoming}</span>
                            <span className="text-xs font-medium text-amber-600/70 dark:text-amber-500">Due Soon</span>
                        </div>
                        <div className="rounded-xl bg-red-50 px-4 py-3 dark:bg-red-500/10 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{COMPLIANCE_METRICS.overdue}</span>
                            <span className="text-xs font-medium text-red-600/70 dark:text-red-500">Overdue</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Required Section (Overdue & Due Soon) */}
            {(COMPLIANCE_METRICS.overdue > 0 || COMPLIANCE_METRICS.upcoming > 0) && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" /> Action Required
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {MANDATORY_COURSES.filter(c => c.status === "overdue" || c.status === "due-soon").map(course => (
                            <div key={course.id} className={`flex flex-col rounded-xl border ${
                                course.status === "overdue" ? "border-red-200 bg-red-50 flex items-center dark:border-red-900/50 dark:bg-red-900/10" 
                                : "border-amber-200 bg-amber-50 flex dark:border-amber-900/50 dark:bg-amber-900/10"
                            } p-5`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        course.status === "overdue" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" 
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                    }`}>
                                        {course.status === "overdue" ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                        {course.status === "overdue" ? "Overdue" : "Due Soon"}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Due: {new Date(course.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <h4 className="mb-2 text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                                    {course.title}
                                </h4>
                                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">By {course.instructor}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                                    <div className="w-1/2">
                                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <span className="mt-1 block text-xs text-gray-500">{course.progress}% done</span>
                                    </div>
                                    <Link href={`/course-catalog`} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                                        course.status === "overdue" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                                    }`}>
                                        <Play className="h-4 w-4" /> {course.progress > 0 ? "Resume" : "Start"}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Mandatory Courses */}
            <div className="pt-4 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" /> Completed Compliance Trainings
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MANDATORY_COURSES.filter(c => c.status === "completed").map((course) => (
                        <CourseCard 
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            instructor={course.instructor}
                            duration={course.duration}
                            rating={0}
                            students={0}
                            progress={100}
                            isMandatory={true}
                            image={course.image}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}
