import React from "react";
import type { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StatCard from "@/components/common/StatCard";
import CourseCard from "@/components/learning/CourseCard";
import { BookOpen, Award, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "My Learning Dashboard | TailAdmin App",
    description: "Employee learning dashboard and recommendations.",
};

export default function MyLearningDashboard() {
    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="My Learning Dashboard" />

            {/* Metrics Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                <StatCard
                    title="Courses Completed"
                    value="12"
                    icon={<Award className="h-6 w-6" />}
                    color="blue"
                    subtitle="2 this month"
                />
                <StatCard
                    title="Learning Hours"
                    value="48.5h"
                    icon={<Clock className="h-6 w-6" />}
                    color="green"
                    subtitle="+5.2h from last month"
                />
                <StatCard
                    title="Assessments Passed"
                    value="8"
                    icon={<BookOpen className="h-6 w-6" />}
                    color="purple"
                    subtitle="Averaging 92% score"
                />
            </div>

            {/* Continue Learning Section */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                        Continue Learning
                    </h3>
                    <Link
                        href="/my-courses"
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        View all my courses
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
                    <CourseCard
                        id="course-1"
                        title="Advanced Next.js 14 Web Development"
                        instructor="John Doe"
                        duration="12h 30m"
                        rating={4.8}
                        students={1250}
                        image="https://placehold.co/600x400/4F46E5/FFFFFF?text=Next.js+14"
                        progress={65}
                        tags={["React", "Next.js", "Web"]}
                        category="Engineering"
                    />
                    <CourseCard
                        id="course-2"
                        title="Corporate Data Security Basics"
                        instructor="Security Team"
                        duration="2h 15m"
                        rating={4.5}
                        students={5000}
                        image="https://placehold.co/600x400/DC2626/FFFFFF?text=Security+Basics"
                        progress={20}
                        isMandatory={true}
                        category="Compliance"
                    />
                    <CourseCard
                        id="course-3"
                        title="Effective Leadership Skills 2024"
                        instructor="Jane Smith"
                        duration="5h 45m"
                        rating={4.9}
                        students={800}
                        image="https://placehold.co/600x400/059669/FFFFFF?text=Leadership"
                        progress={80}
                        tags={["Management", "Soft Skills"]}
                        category="Leadership"
                    />
                </div>
            </div>

            {/* Recommended Courses Section */}
            <div className="pt-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                        Recommended for You
                    </h3>
                    <Link
                        href="/course-catalog"
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Browse Catalog
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
                    <CourseCard
                        id="course-4"
                        title="Mastering TypeScript in React"
                        instructor="Alex Johnson"
                        duration="8h 10m"
                        rating={4.7}
                        students={3200}
                        image="https://placehold.co/600x400/2563EB/FFFFFF?text=TypeScript"
                        tags={["TypeScript", "React"]}
                        category="Engineering"
                    />
                    <CourseCard
                        id="course-5"
                        title="Cloud Infrastructure with AWS"
                        instructor="Cloud Team"
                        duration="15h 0m"
                        rating={4.6}
                        students={1500}
                        image="https://placehold.co/600x400/F59E0B/FFFFFF?text=AWS"
                        tags={["Cloud", "AWS", "DevOps"]}
                        category="Engineering"
                    />
                    <CourseCard
                        id="course-6"
                        title="Mental Health & Wellbeing at Work"
                        instructor="HR Department"
                        duration="1h 30m"
                        rating={4.9}
                        students={4200}
                        image="https://placehold.co/600x400/8B5CF6/FFFFFF?text=Wellbeing"
                        tags={["Health", "Culture"]}
                        category="Wellness"
                    />
                    <CourseCard
                        id="course-7"
                        title="Product Management Fundamentals"
                        instructor="Sarah Lee"
                        duration="10h 20m"
                        rating={4.8}
                        students={2100}
                        image="https://placehold.co/600x400/EC4899/FFFFFF?text=Product"
                        tags={["Product", "Strategy"]}
                        category="Product"
                    />
                </div>
            </div>
        </div>
    );
}
