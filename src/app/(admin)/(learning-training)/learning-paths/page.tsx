"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { BookOpen, Map, CheckCircle2, Circle, ArrowRight, Play, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for Learning Paths
const LEARNING_PATHS = [
    {
        id: "path-1",
        title: "Frontend Engineering Mastery",
        description: "A complete guide from basic HTML/CSS to advanced React and Next.js applications.",
        progress: 45,
        totalCourses: 5,
        estimatedTime: "40h",
        image: "https://placehold.co/600x400/4F46E5/FFFFFF?text=Frontend+Mastery",
        courses: [
            { id: "c-1", title: "HTML, CSS & JS Fundamentals", duration: "8h", status: "completed" },
            { id: "c-2", title: "React Basics", duration: "10h", status: "completed" },
            { id: "c-3", title: "Advanced React Patterns", duration: "6h", status: "in-progress", current: true },
            { id: "c-4", title: "Next.js App Router", duration: "12h", status: "locked" },
            { id: "c-5", title: "Performance & Optimization", duration: "4h", status: "locked" },
        ]
    },
    {
        id: "path-2",
        title: "New Employee Onboarding",
        description: "Mandatory training and orientation for all new hires in the company.",
        progress: 100,
        totalCourses: 3,
        estimatedTime: "5h",
        image: "https://placehold.co/600x400/059669/FFFFFF?text=Onboarding",
        courses: [
            { id: "c-6", title: "Company Culture & Values", duration: "1h 30m", status: "completed" },
            { id: "c-7", title: "IT Security Basics", duration: "2h", status: "completed" },
            { id: "c-8", title: "HR Policies & Benefits", duration: "1h 30m", status: "completed" },
        ]
    },
    {
        id: "path-3",
        title: "Cloud Architecture Pathway",
        description: "Design and implement scalable infrastructure using AWS and modern DevOps practices.",
        progress: 0,
        totalCourses: 4,
        estimatedTime: "60h",
        image: "https://placehold.co/600x400/F59E0B/FFFFFF?text=Cloud+Path",
        courses: [
            { id: "c-9", title: "AWS Core Services", duration: "15h", status: "not-started", current: true },
            { id: "c-10", title: "Docker & Containers", duration: "10h", status: "locked" },
            { id: "c-11", title: "Kubernetes Admin", duration: "25h", status: "locked" },
            { id: "c-12", title: "CI/CD Pipelines", duration: "10h", status: "locked" },
        ]
    }
];

export default function LearningPaths() {
    const [expandedPathId, setExpandedPathId] = useState<string | null>("path-1");

    const togglePath = (id: string) => {
        setExpandedPathId(expandedPathId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Learning Paths" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Available Paths List */}
                <div className="lg:col-span-12 space-y-4">
                    {LEARNING_PATHS.map((path) => {
                        const isExpanded = expandedPathId === path.id;
                        
                        return (
                            <div key={path.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                isExpanded 
                                ? "border-blue-500 shadow-md bg-white dark:border-blue-500/50 dark:bg-gray-900" 
                                : "border-gray-200 bg-white hover:border-blue-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                            }`}>
                                {/* Path Header (Clickable) */}
                                <div 
                                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                                    onClick={() => togglePath(path.id)}
                                >
                                    <div className="relative h-24 w-36 shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block">
                                        <img src={path.image} alt={path.title} className="object-cover w-full h-full" />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Map className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {path.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 max-w-2xl">
                                            {path.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" /> {path.totalCourses} Courses
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Circle className="h-4 w-4" /> {path.estimatedTime}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-48 shrink-0 flex flex-col items-start sm:items-end">
                                        <div className="flex w-full justify-between items-center mb-1.5">
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                {path.progress}% Completed
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${path.progress === 100 ? "bg-green-500" : "bg-blue-600"}`}
                                                style={{ width: `${path.progress}%` }}
                                            />
                                        </div>
                                        <button className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                                            {isExpanded ? "Hide Details" : "View Curriculum"}
                                            <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline Details Panel */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 sm:p-8 dark:border-gray-800 dark:bg-gray-900/50">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Course Curriculum</h4>
                                        
                                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                                            {path.courses.map((course, index) => {
                                                const isCompleted = course.status === "completed";
                                                const isCurrent = course.current;
                                                const isLocked = course.status === "locked";
                                                
                                                return (
                                                    <div key={course.id} className="relative pl-8">
                                                        {/* Timeline Marker */}
                                                        <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-2 bg-white dark:bg-gray-900 flex items-center justify-center
                                                            ${isCompleted ? "border-green-500 text-green-500" : 
                                                              isCurrent ? "border-blue-600 text-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30" : 
                                                              "border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-600"}
                                                        `}>
                                                            {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 fill-current" />}
                                                            {isLocked && <Lock className="h-2.5 w-2.5" />}
                                                            {!isCompleted && !isLocked && <Circle className="h-2 w-2" fill="currentColor" />}
                                                        </div>

                                                        {/* Course Card in Timeline */}
                                                        <div className={`rounded-xl border p-4 transition-all ${
                                                            isCurrent ? "border-blue-200 bg-blue-50/30 shadow-sm dark:border-blue-800/50 dark:bg-blue-900/10" :
                                                            isCompleted ? "border-gray-200 bg-white opacity-80 dark:border-gray-800 dark:bg-gray-900" :
                                                            "border-gray-100 bg-gray-50/50 opacity-60 dark:border-gray-800 dark:bg-gray-900/30"
                                                        }`}>
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                                        Step {index + 1} • {course.duration}
                                                                    </p>
                                                                    <h5 className={`font-semibold ${isLocked ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                                                                        {course.title}
                                                                    </h5>
                                                                </div>
                                                                
                                                                <div>
                                                                    {isCompleted ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                                                            Completed
                                                                        </span>
                                                                    ) : isCurrent ? (
                                                                        <Link href={`/course-catalog`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm">
                                                                            <Play className="h-4 w-4" /> Start Course
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                                            Locked
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
            </div>
        </div>
    );
}
