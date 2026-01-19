import React from "react";
import PageBreadcrumb from "./PageBreadCrumb";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: React.ReactNode; // For action buttons
}

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs,
    children,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <PageBreadcrumb pageTitle={title} items={breadcrumbs} />
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
}
