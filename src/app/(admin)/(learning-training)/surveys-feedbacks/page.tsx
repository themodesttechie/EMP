"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { MessageSquare, Star, ThumbsUp, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

// Mock data
const PENDING_SURVEYS = [
    {
        id: "s-1",
        title: "Course Evaluation: Advanced Next.js 14 Web Development",
        instructor: "John Doe",
        dueDate: "2024-03-25",
        estimatedTime: "5m",
        status: "pending",
        courseId: "course-1",
    },
    {
        id: "s-2",
        title: "Instructor Feedback: Corporate Data Security Basics",
        instructor: "Security Team",
        dueDate: "2024-03-20",
        estimatedTime: "3m",
        status: "pending",
        courseId: "course-2",
    }
];

const COMPLETED_SURVEYS = [
    {
        id: "s-3",
        title: "Quarterly Training Needs Assessment",
        completedDate: "2024-01-15",
        status: "completed",
    },
    {
        id: "s-4",
        title: "Course Evaluation: Understanding Agile methodologies",
        completedDate: "2023-11-20",
        status: "completed",
        ratingGiven: 5,
    }
];

export default function SurveysFeedbacks() {
    const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
    const [showModal, setShowModal] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
    const [rating, setRating] = useState(0);

    const handleStartSurvey = (survey: any) => {
        setSelectedSurvey(survey);
        setShowModal(true);
        setRating(0);
    };

    return (
        <div className="space-y-6">
            <PageBreadcrumb pageTitle="Surveys & Feedbacks" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={`
                                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                                    ${activeTab === "pending" 
                                        ? "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400" 
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300"
                                    }
                                `}
                            >
                                Action Required
                                <span className={`ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium 
                                    ${activeTab === "pending" 
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                                        : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                                    }
                                `}>
                                    {PENDING_SURVEYS.length}
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
                                    {COMPLETED_SURVEYS.length}
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Pending Surveys List */}
                    {activeTab === "pending" && (
                        <div className="space-y-4 animate-in fade-in">
                            {PENDING_SURVEYS.length > 0 ? (
                                PENDING_SURVEYS.map((survey) => (
                                    <div key={survey.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-5 transition-all hover:bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10 dark:hover:bg-amber-900/20">
                                        <div className="flex gap-4 items-start">
                                            <div className="mt-1 shrink-0 rounded-full bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                                    {survey.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1.5 border border-amber-200 bg-white px-2 py-0.5 rounded shadow-sm dark:bg-gray-800 dark:border-amber-900/50">
                                                        <Calendar className="h-3 w-3 text-amber-500" /> Due: {new Date(survey.dueDate).toLocaleDateString()}
                                                    </span>
                                                    <span>Instructor: {survey.instructor}</span>
                                                    <span>Est. time: {survey.estimatedTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleStartSurvey(survey)}
                                            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
                                        >
                                            Start Survey <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You have completed all your pending surveys.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completed Surveys List */}
                    {activeTab === "completed" && (
                        <div className="space-y-4 animate-in fade-in">
                            {COMPLETED_SURVEYS.map((survey) => (
                                <div key={survey.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                                    <div className="flex gap-4 items-center">
                                        <div className="shrink-0 rounded-full bg-green-100 p-2.5 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                                                {survey.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Completed on {new Date(survey.completedDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {survey.ratingGiven && (
                                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-500/10">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3.5 w-3.5 ${i < survey.ratingGiven! ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Highlight */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 dark:bg-none">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                            <ThumbsUp className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Why Your Feedback Matters</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            Your input directly impacts our learning programs. We use survey data to improve course quality, update materials, and better align training paths with your career goals.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> 100% Anonymous</li>
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> Directly sent to L&D admins</li>
                            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> Takes less than 5 minutes</li>
                        </ul>
                    </div>
                </div>

            </div>

            {/* Mock Modal for Survey Form */}
            {showModal && selectedSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Course Feedback</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSurvey.title}</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Rating Question */}
                            <div>
                                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    How would you rate this course overall?
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`p-2 transition-transform hover:scale-110 ${rating >= star ? "text-amber-500" : "text-gray-300 dark:text-gray-600"}`}
                                        >
                                            <Star className="h-8 w-8 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Area Question */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    What did you like most about this course?
                                </label>
                                <textarea 
                                    className="w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    rows={3}
                                    placeholder="Your thoughts here..."
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Any suggestions for improvement?
                                </label>
                                <textarea 
                                    className="w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    rows={3}
                                    placeholder="Tell us what could be better..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
