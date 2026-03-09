"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CourseCard from "@/components/learning/CourseCard";
import { Search, Filter, SlidersHorizontal, BookOpen } from "lucide-react";

// Mock data for the catalog
const ALL_COURSES = [
    {
        id: "course-1",
        title: "Advanced Next.js 14 Web Development",
        instructor: "John Doe",
        duration: "12h 30m",
        rating: 4.8,
        students: 1250,
        image: "https://placehold.co/600x400/4F46E5/FFFFFF?text=Next.js+14",
        tags: ["React", "Next.js", "Web"],
        category: "Engineering",
        level: "Advanced",
    },
    {
        id: "course-2",
        title: "Corporate Data Security Basics",
        instructor: "Security Team",
        duration: "2h 15m",
        rating: 4.5,
        students: 5000,
        image: "https://placehold.co/600x400/DC2626/FFFFFF?text=Security+Basics",
        isMandatory: true,
        category: "Compliance",
        level: "Beginner",
    },
    {
        id: "course-3",
        title: "Effective Leadership Skills 2024",
        instructor: "Jane Smith",
        duration: "5h 45m",
        rating: 4.9,
        students: 800,
        image: "https://placehold.co/600x400/059669/FFFFFF?text=Leadership",
        tags: ["Management", "Soft Skills"],
        category: "Leadership",
        level: "Intermediate",
    },
    {
        id: "course-4",
        title: "Mastering TypeScript in React",
        instructor: "Alex Johnson",
        duration: "8h 10m",
        rating: 4.7,
        students: 3200,
        image: "https://placehold.co/600x400/2563EB/FFFFFF?text=TypeScript",
        tags: ["TypeScript", "React"],
        category: "Engineering",
        level: "Intermediate",
    },
    {
        id: "course-5",
        title: "Cloud Infrastructure with AWS",
        instructor: "Cloud Team",
        duration: "15h 0m",
        rating: 4.6,
        students: 1500,
        image: "https://placehold.co/600x400/F59E0B/FFFFFF?text=AWS",
        tags: ["Cloud", "AWS", "DevOps"],
        category: "Engineering",
        level: "Advanced",
    },
    {
        id: "course-6",
        title: "Mental Health & Wellbeing at Work",
        instructor: "HR Department",
        duration: "1h 30m",
        rating: 4.9,
        students: 4200,
        image: "https://placehold.co/600x400/8B5CF6/FFFFFF?text=Wellbeing",
        tags: ["Health", "Culture"],
        category: "Wellness",
        level: "Beginner",
    },
    {
        id: "course-7",
        title: "Product Management Fundamentals",
        instructor: "Sarah Lee",
        duration: "10h 20m",
        rating: 4.8,
        students: 2100,
        image: "https://placehold.co/600x400/EC4899/FFFFFF?text=Product",
        tags: ["Product", "Strategy"],
        category: "Product",
        level: "Beginner",
    },
    {
        id: "course-8",
        title: "UI/UX Design Systems Workshop",
        instructor: "Emily Clark",
        duration: "6h 45m",
        rating: 4.9,
        students: 1800,
        image: "https://placehold.co/600x400/0ea5e9/FFFFFF?text=Design+Systems",
        tags: ["Design", "Figma", "UI/UX"],
        category: "Design",
        level: "Intermediate",
    },
];

const CATEGORIES = ["All", "Engineering", "Compliance", "Leadership", "Wellness", "Product", "Design"];
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export default function CourseCatalog() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All Levels");
    const [showFilters, setShowFilters] = useState(false);

    const filteredCourses = ALL_COURSES.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
        const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;

        return matchesSearch && matchesCategory && matchesLevel;
    });

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Course Catalog" />

            <div className="flex flex-col gap-6">
                {/* Search and Top Filters Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <div className="relative w-full md:max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search courses, instructors, keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        {CATEGORIES.slice(0, 4).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                    selectedCategory === cat
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex whitespace-nowrap items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Additional Filters Panel */}
                {showFilters && (
                    <div className="animate-in fade-in slide-in-from-top-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category
                                </label>
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Difficulty Level
                                </label>
                                <select 
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="block w-full rounded-lg border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Grid */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            All Courses
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {filteredCourses.length} results
                        </span>
                    </div>

                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
                            {filteredCourses.map((course) => (
                                <CourseCard key={course.id} {...course} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800 text-gray-400">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No courses found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                            <button 
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("All");
                                    setSelectedLevel("All Levels");
                                }}
                                className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
