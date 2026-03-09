import React from "react";
import Link from "next/link";
import { Clock, Star, Users, Play, ShieldCheck, Tag } from "lucide-react";
import Image from "next/image";

export interface CourseCardProps {
    id: string;
    title: string;
    instructor: string;
    duration: string;
    rating: number;
    students: number;
    image: string;
    progress?: number;
    tags?: string[];
    isMandatory?: boolean;
    category?: string;
}

export default function CourseCard({
    id,
    title,
    instructor,
    duration,
    rating,
    students,
    image,
    progress,
    tags = [],
    isMandatory = false,
    category
}: CourseCardProps) {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
            {/* Image Container */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {isMandatory && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Mandatory
                        </span>
                    )}
                    {category && (
                        <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-gray-200">
                            {category}
                        </span>
                    )}
                </div>

                {/* Play Button Overlay (Visible on Hover) */}
                <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/90 p-3 text-white opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:opacity-100 hover:bg-blue-600 hover:scale-110">
                    <Play className="h-6 w-6 ml-1" />
                </button>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{duration}</span>
                    </div>
                    {rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                
                <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <Link href={`/course-catalog/${id}`} className="focus:outline-none">
                        <span className="absolute inset-0 z-10" aria-hidden="true" />
                        {title}
                    </Link>
                </h3>
                
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    By {instructor}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer section (progress or students count) */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    {progress !== undefined ? (
                        <div>
                            <div className="mb-1.5 flex justify-between text-xs">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div 
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                <Users className="h-4 w-4" />
                                <span>{students.toLocaleString()} students</span>
                            </div>
                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm flex items-center group/btn relative z-20">
                                View Course
                                <svg className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
