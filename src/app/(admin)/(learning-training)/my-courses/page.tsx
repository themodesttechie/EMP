"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CourseCard from "@/components/learning/CourseCard";
import { BookOpen } from "lucide-react";

// Mock data for enrolled courses
const ENROLLED_COURSES = [
    {
        id: "course-1",
        title: "Advanced Next.js 14 Web Development",
        instructor: "John Doe",
        duration: "12h 30m",
        rating: 0, // Not rated yet
        students: 0,
        image: "https://placehold.co/600x400/4F46E5/FFFFFF?text=Next.js+14",
        progress: 65,
        tags: ["React", "Next.js"],
        category: "Engineering",
        status: "active"
    },
    {
        id: "course-2",
        title: "Corporate Data Security Basics",
        instructor: "Security Team",
        duration: "2h 15m",
        rating: 0,
        students: 0,
        image: "https://placehold.co/600x400/DC2626/FFFFFF?text=Security+Basics",
        progress: 20,
        isMandatory: true,
        category: "Compliance",
        status: "active"
    },
    {
        id: "course-3",
        title: "Effective Leadership Skills 2024",
        instructor: "Jane Smith",
        duration: "5h 45m",
        rating: 4.9,
        students: 0,
        image: "https://placehold.co/600x400/059669/FFFFFF?text=Leadership",
        progress: 100,
        tags: ["Management", "Soft Skills"],
        category: "Leadership",
        status: "completed"
    },
    {
        id: "course-4",
        title: "Mastering TypeScript in React",
        instructor: "Alex Johnson",
        duration: "8h 10m",
        rating: 0,
        students: 0,
        image: "https://placehold.co/600x400/2563EB/FFFFFF?text=TypeScript",
        progress: 5,
        category: "Engineering",
        status: "active"
    },
    {
        id: "course-6",
        title: "Mental Health & Wellbeing at Work",
        instructor: "HR Department",
        duration: "1h 30m",
        rating: 4.8,
        students: 0,
        image: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=Wellbeing",
        progress: 100,
        category: "Wellness",
        status: "completed"
    },
];

export default function MyCourses() {
    const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

    const displayedCourses = ENROLLED_COURSES.filter(course => course.status === activeTab);

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="My Courses" />

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`
                            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                            ${activeTab === "active" 
                                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" 
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Active Courses
                        <span className={`ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium 
                            ${activeTab === "active" 
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
                                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                            }
                        `}>
                            {ENROLLED_COURSES.filter(c => c.status === "active").length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`
                            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                            ${activeTab === "completed" 
                                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" 
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
                            }
                        `}
                    >
                        Completed
                        <span className={`ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium 
                            ${activeTab === "completed" 
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
                                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                            }
                        `}>
                            {ENROLLED_COURSES.filter(c => c.status === "completed").length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Courses Grid */}
            <div className="pt-4">
                {displayedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
                        {displayedCourses.map((course) => (
                            <CourseCard key={course.id} {...course} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800 text-gray-400">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                            No {activeTab} courses found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeTab === "active" 
                                ? "You don't have any active courses. Browse the catalog to start learning." 
                                : "You haven't completed any courses yet. Keep learning!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
