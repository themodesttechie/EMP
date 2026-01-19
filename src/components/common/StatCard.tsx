import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        direction: "up" | "down" | "neutral";
    };
    color?: "blue" | "green" | "orange" | "red" | "purple";
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = "blue",
}: StatCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
        red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-4">
                {icon && (
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}
                    >
                        {icon}
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                        {value}
                    </h4>
                </div>
            </div>
            {subtitle && (
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </span>
                </div>
            )}
        </div>
    );
}
