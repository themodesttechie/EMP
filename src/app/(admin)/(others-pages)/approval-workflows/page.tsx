"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Plus, Trash2, GripVertical, CheckCircle, ArrowRight } from "lucide-react";

interface WorkflowStep {
    id: number;
    role: string;
    type: "Approval" | "Notification";
}

interface Workflow {
    id: string;
    name: string;
    steps: WorkflowStep[];
}

const initialWorkflows: Workflow[] = [
    {
        id: "WF1",
        name: "Leave Request",
        steps: [
            { id: 1, role: "Reporting Manager", type: "Approval" },
            { id: 2, role: "Dept Head", type: "Approval" },
            { id: 3, role: "HR", type: "Notification" },
        ],
    },
    {
        id: "WF2",
        name: "Overtime Claim",
        steps: [
            { id: 1, role: "Project Manager", type: "Approval" },
            { id: 2, role: "Finance", type: "Approval" },
        ],
    },
    {
        id: "WF3",
        name: "WFH Request",
        steps: [{ id: 1, role: "Reporting Manager", type: "Approval" }],
    },
];

export default function ApprovalWorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(initialWorkflows[0].id);

    const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

    const updateSteps = (newSteps: WorkflowStep[]) => {
        setWorkflows((prev) =>
            prev.map((w) => (w.id === selectedWorkflowId ? { ...w, steps: newSteps } : w))
        );
    };

    const addStep = () => {
        if (!selectedWorkflow) return;
        const newStep: WorkflowStep = {
            id: Date.now(),
            role: "Select Role",
            type: "Approval",
        };
        updateSteps([...selectedWorkflow.steps, newStep]);
    };

    const removeStep = (stepId: number) => {
        if (!selectedWorkflow) return;
        updateSteps(selectedWorkflow.steps.filter((s) => s.id !== stepId));
    };

    const updateStepField = (stepId: number, field: keyof WorkflowStep, value: string) => {
        if (!selectedWorkflow) return;
        updateSteps(
            selectedWorkflow.steps.map((s) =>
                s.id === stepId ? { ...s, [field]: value } : s
            )
        );
    };

    return (
        <div className="mx-auto max-w-7xl">
            <PageHeader
                title="Approval Workflows"
                subtitle="Configure approval chains for different request types."
                breadcrumbs={[
                    { label: "Time Management" },
                    { label: "Approval Workflows" },
                ]}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Sidebar: Workflow List */}
                <div className="lg:col-span-1 space-y-2">
                    {workflows.map((wf) => (
                        <div
                            key={wf.id}
                            onClick={() => setSelectedWorkflowId(wf.id)}
                            className={`cursor-pointer rounded-xl border p-4 transition-all ${selectedWorkflowId === wf.id
                                    ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/5"
                                }`}
                        >
                            <h3 className={`font-medium ${selectedWorkflowId === wf.id ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
                                {wf.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{wf.steps.length} Steps</p>
                        </div>
                    ))}
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    {selectedWorkflow ? (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Edit Flow: {selectedWorkflow.name}
                                </h2>
                                <button
                                    onClick={() => alert("Flow saved successfully!")}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Visual Start Node */}
                                <div className="flex flex-col items-center">
                                    <div className="flex h-10 w-32 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                        Request Start
                                    </div>
                                    <div className="h-6 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                                </div>

                                {selectedWorkflow.steps.map((step, index) => (
                                    <div key={step.id} className="flex flex-col items-center relative group">
                                        <div className="relative w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                            <div className="flex items-center gap-4">
                                                <GripVertical className="cursor-move text-gray-400" size={20} />
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 font-bold text-sm">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <select
                                                        value={step.role}
                                                        onChange={(e) => updateStepField(step.id, "role", e.target.value)}
                                                        className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option>Reporting Manager</option>
                                                        <option>Project Manager</option>
                                                        <option>Dept Head</option>
                                                        <option>HR</option>
                                                        <option>Finance</option>
                                                        <option>Select Role</option>
                                                    </select>

                                                    <select
                                                        value={step.type}
                                                        onChange={(e) => updateStepField(step.id, "type", e.target.value as any)}
                                                        className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option value="Approval">Require Approval</option>
                                                        <option value="Notification">Notify Only</option>
                                                    </select>
                                                </div>

                                                <button
                                                    onClick={() => removeStep(step.id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Visual Connector */}
                                        <div className="h-6 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                                    </div>
                                ))}

                                {/* Add Step Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={addStep}
                                        className="flex items-center gap-2 rounded-full border border-dashed border-gray-400 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-white/5"
                                    >
                                        <Plus size={16} /> Add Step
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500">
                            Select a workflow to edit
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
