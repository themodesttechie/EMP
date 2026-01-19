"use client";

import React from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Briefcase, Clock, Calendar, AlertCircle } from "lucide-react";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function TimeOffBalancePage() {
    const balances = [
        {
            title: "Annual Leave",
            value: "12 / 18",
            subtitle: "6 days remaining",
            icon: <Briefcase className="h-6 w-6 text-current" />,
            color: "blue" as const,
        },
        {
            title: "Sick Leave",
            value: "8 / 12",
            subtitle: "4 days remaining",
            icon: <AlertCircle className="h-6 w-6 text-current" />,
            color: "red" as const,
        },
        {
            title: "Casual Leave",
            value: "4 / 7",
            subtitle: "3 days remaining",
            icon: <Clock className="h-6 w-6 text-current" />,
            color: "orange" as const,
        },
        {
            title: "Comp Off",
            value: "2",
            subtitle: "Available to maintain",
            icon: <Calendar className="h-6 w-6 text-current" />,
            color: "green" as const,
        },
    ];

    const chartOptions: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        colors: ["#3C50E0", "#FF4560", "#F9C80E", "#10B981"],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: "55%",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            title: { text: "Days Taken" },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " days";
                },
            },
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
        }
    };

    const chartSeries = [
        { name: "Annual Leave", data: [2, 1, 0, 3, 0, 0, 2, 0, 1, 0, 0, 0] },
        { name: "Sick Leave", data: [0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0] },
        { name: "Casual Leave", data: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] },
        { name: "Comp Off", data: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0] },
    ];

    return (
        <div className="mx-auto max-w-7xl">
            <PageHeader
                title="Time Off Balance"
                subtitle="Manage and view your leave balances and history."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Time Off Balance" },
                ]}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {balances.map((balance, index) => (
                    <StatCard
                        key={index}
                        title={balance.title}
                        value={balance.value}
                        subtitle={balance.subtitle}
                        icon={balance.icon}
                        color={balance.color}
                    />
                ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Leave Usage History (2025)
                </h3>
                <div id="chartOne" className="-ml-5">
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height={350}
                    />
                </div>
            </div>
        </div>
    );
}
