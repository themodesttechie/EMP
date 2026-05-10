"use client"
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import React, { useState } from "react";
import TiptapEditor from "@/components/ui/editor/TiptapEditor";

interface Policy {
    id: string;
    title: string;
    content: React.ReactNode | string; // Allow string for HTML content
    imageUrl?: string;
}

interface Category {
    id: string;
    name: string;
    description: string;
    policies: Policy[];
    imageUrl?: string;
}

const defaultImageUrl =
    "https://www.vecteezy.com/free-vector/policy-icon";

// Sample data (replace or extend as needed)                                                                                                                                                                                                                    
const initialCategories: Category[] = [
    {
        id: "leave",
        name: "Leave & Time Off",
        description:
            "Guidelines regarding annual leave, sick leave, and other time-off policies.",
        policies: [
            {
                id: "annual-leave",
                title: "Annual Leave Policy",
                content: (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Annual Leave Entitlement</h3>
                        <p>
                            Employees are entitled to 20 days of paid annual leave per year.
                            Leave must be requested at least 2 weeks in advance via the HR
                            portal.
                        </p>
                        <p>Unused leave can be carried over up to 5 days to the next year.</p>
                    </div>
                ),
            },
            {
                id: "sick-leave",
                title: "Sick Leave Policy",
                content: (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Sick Leave</h3>
                        <p>
                            Employees receive 10 days of paid sick leave annually. A medical
                            certificate is required for absences exceeding 2 consecutive days.
                        </p>
                    </div>
                ),
            },
        ],
    },
    {
        id: "conduct",
        name: "Code of Conduct",
        description: "Standards of behavior, ethics, and professional expectations.",
        policies: [
            {
                id: "harassment",
                title: "Anti-Harassment Policy",
                content: (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Zero Tolerance</h3>
                        <p>
                            The company maintains a zero-tolerance policy towards harassment
                            of any kind. All employees are expected to treat colleagues with
                            respect and dignity.
                        </p>
                    </div>
                ),
            },
            {
                id: "dress-code",
                title: "Dress Code",
                content: (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Business Casual</h3>
                        <p>
                            Our workplace adopts a business casual dress code. Employees
                            should dress neatly and appropriately for a professional
                            environment.
                        </p>
                    </div>
                ),
            },
        ],
    },
    // Add more categories as needed...
];

export default function PoliciesPage() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

    // Create Policy State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPolicyTitle, setNewPolicyTitle] = useState("");
    const [newPolicyCategory, setNewPolicyCategory] = useState(initialCategories[0].id);
    const [newPolicyContent, setNewPolicyContent] = useState("<p>Start writing your policy...</p>");
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null); // Track if editing

    // Create Category State
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [newCategoryImageUrl, setNewCategoryImageUrl] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(null); // Track if editing


    // Pagination states
    const [categoryPage, setCategoryPage] = useState(1);
    const categoriesPerPage = 6;
    const [policyPage, setPolicyPage] = useState(1);
    const policiesPerPage = 9;

    const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);

    const displayedCategories = categories.slice(
        (categoryPage - 1) * categoriesPerPage,
        categoryPage * categoriesPerPage
    );

    const displayedPolicies = selectedCategory
        ? selectedCategory.policies.slice(
            (policyPage - 1) * policiesPerPage,
            policyPage * policiesPerPage
        )
        : [];

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setPolicyPage(1); // reset policy page
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
    };

    const handlePolicyClick = (policy: Policy) => {
        setSelectedPolicy(policy);
    };

    const closeModal = () => setSelectedPolicy(null);


    // --- Policy Handlers ---
    const openCreatePolicyModal = () => {
        setEditingPolicy(null);
        setNewPolicyTitle("");
        setNewPolicyCategory(selectedCategory ? selectedCategory.id : initialCategories[0].id);
        setNewPolicyContent("<p>Start writing your policy...</p>");
        setIsCreateModalOpen(true);
    };

    const openEditPolicyModal = (policy: Policy) => {
        setEditingPolicy(policy);
        setNewPolicyTitle(policy.title);
        // Find which category this policy belongs to if not already selected
        const categoryId = selectedCategory?.id || categories.find(c => c.policies.find(p => p.id === policy.id))?.id || initialCategories[0].id;
        setNewPolicyCategory(categoryId);
        setNewPolicyContent(typeof policy.content === 'string' ? policy.content : ""); // Note: Complex ReactNode content might wait for a better editor handling

        // Locate the content string if possible, otherwise we might need a better way to serialize ReactNode back to HTML for the editor
        // For this demo, we assume content is HTML string as pushed by the editor. 
        // If it was the hardcoded ReactNode, we might not be able to edit it nicely in the editor.
        // Let's force it to string for the editable ones.
        if (typeof policy.content !== 'string') {
            // If it's the initial hardcoded data, we might just warn or leave it empty? 
            // Or better, let's just not support editing the hardcoded ReactNode ones ideally, 
            // but for now let's just put a placeholder or convert if simple.
            setNewPolicyContent("<p><i>(Content cannot be fully edited in Tiptap)</i></p>");
        }

        setIsCreateModalOpen(true);
        // If we are editing from the details modal, close it
        setSelectedPolicy(null);
    };

    const handleSavePolicy = () => {
        if (!newPolicyTitle || !newPolicyContent) return;

        const updatedCategories = categories.map(cat => {
            // Remove from old category if category changed (only logic for moved policies could go here, 
            // but for simplicity let's assume if editing, we might just update valid fields or handle move later. 
            // For now, let's keep it simple: strict update within category or add new)

            // Logic for Update:
            if (editingPolicy) {
                // Check if this category contains the policy to update
                const policyIndex = cat.policies.findIndex(p => p.id === editingPolicy.id);
                if (policyIndex > -1) {
                    // Check if we are moving categories?
                    if (cat.id !== newPolicyCategory) {
                        // Remove from this category
                        return {
                            ...cat,
                            policies: cat.policies.filter(p => p.id !== editingPolicy.id)
                        };
                    } else {
                        // Update in place
                        const updatedPolicies = [...cat.policies];
                        updatedPolicies[policyIndex] = {
                            ...editingPolicy,
                            title: newPolicyTitle,
                            content: <div dangerouslySetInnerHTML={{ __html: newPolicyContent }} className="prose dark:prose-invert max-w-none" />,
                        };
                        return { ...cat, policies: updatedPolicies };
                    }
                }
                // If this is the NEW category and we moved it here (it wasn't here before)
                if (cat.id === newPolicyCategory && policyIndex === -1) {
                    // We need to add it, but verification of removal from old runs in the map above. 
                    // actually map runs sequentially or parallel? Array.map is synchronous.
                    // But we can't easily know if we "will remove" it from another iteration.
                    // EASIER -> Filter all categories to remove old instance, THEN add to new.
                }
            }
            return cat;
        });

        // Refined Logic:
        let newCategories = [...categories];

        if (editingPolicy) {
            // 1. Remove existing policy from wherever it was
            newCategories = newCategories.map(c => ({
                ...c,
                policies: c.policies.filter(p => p.id !== editingPolicy.id)
            }));

            // 2. Add/Update to target category
            newCategories = newCategories.map(c => {
                if (c.id === newPolicyCategory) {
                    return {
                        ...c,
                        policies: [...c.policies, {
                            id: editingPolicy.id, // Keep ID
                            title: newPolicyTitle,
                            content: <div dangerouslySetInnerHTML={{ __html: newPolicyContent }} className="prose dark:prose-invert max-w-none" />, // Simplified for demo
                            imageUrl: editingPolicy.imageUrl
                        }]
                    };
                }
                return c;
            });
        } else {
            // Create New
            newCategories = newCategories.map(cat => {
                if (cat.id === newPolicyCategory) {
                    return {
                        ...cat,
                        policies: [
                            ...cat.policies,
                            {
                                id: newPolicyTitle.toLowerCase().replace(/\s+/g, '-'),
                                title: newPolicyTitle,
                                content: <div dangerouslySetInnerHTML={{ __html: newPolicyContent }} className="prose dark:prose-invert max-w-none" />,
                            }
                        ]
                    };
                }
                return cat;
            });
        }

        setCategories(newCategories);
        setIsCreateModalOpen(false);

        // Update selected category view if needed
        if (selectedCategory) {
            const updatedSelected = newCategories.find(c => c.id === selectedCategory.id);
            if (updatedSelected) setSelectedCategory(updatedSelected);
        }
    };


    // --- Category Handlers ---
    const openCreateCategoryModal = () => {
        setEditingCategory(null);
        setNewCategoryName("");
        setNewCategoryDescription("");
        setNewCategoryImageUrl("");
        setIsCreateCategoryModalOpen(true);
    };

    const openEditCategoryModal = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryDescription(category.description);
        setNewCategoryImageUrl(category.imageUrl || "");
        setIsCreateCategoryModalOpen(true);
    };


    const handleSaveCategory = () => {
        if (!newCategoryName) return;

        if (editingCategory) {
            // Update
            const updatedCategories = categories.map(cat =>
                cat.id === editingCategory.id
                    ? {
                        ...cat,
                        name: newCategoryName,
                        description: newCategoryDescription,
                        imageUrl: newCategoryImageUrl || defaultImageUrl
                    }
                    : cat
            );
            setCategories(updatedCategories);
            // Update selected view if we are viewing it
            if (selectedCategory && selectedCategory.id === editingCategory.id) {
                const me = updatedCategories.find(c => c.id === editingCategory.id);
                if (me) setSelectedCategory(me);
            }
        } else {
            // Create
            const newCategory: Category = {
                id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
                name: newCategoryName,
                description: newCategoryDescription,
                imageUrl: newCategoryImageUrl || defaultImageUrl,
                policies: []
            };
            setCategories([...categories, newCategory]);
        }

        setIsCreateCategoryModalOpen(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <PageBreadcrumb pageTitle="Policies" />
                <div className="flex gap-3">
                    <button
                        onClick={openCreateCategoryModal}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow"
                    >
                        + New Category
                    </button>
                    <button
                        onClick={openCreatePolicyModal}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                        + New Policy
                    </button>
                </div>
            </div>

            <div className="min-h-[calc(100vh-140px)]">
                {/* Categories */}
                {!selectedCategory ? (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Browse Categories
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Select a category to view related policies
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {displayedCategories.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                                        <img
                                            src={category.imageUrl || defaultImageUrl}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                {category.name}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditCategoryModal(category);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                title="Edit Category"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                            {category.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                            View {category.policies.length} Policies →
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Category Pagination */}
                        {totalCategoryPages > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    onClick={() => setCategoryPage(Math.max(categoryPage - 1, 1))}
                                    className="px-3 py-1 border rounded"
                                    disabled={categoryPage === 1}
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCategoryPage(Math.max(categoryPage - 1, 1))}
                                    className="px-3 py-1 border rounded"
                                    disabled={categoryPage === 1}
                                >
                                    1
                                </button>

                                <button
                                    onClick={() =>
                                        setCategoryPage(
                                            Math.min(categoryPage + 1, totalCategoryPages)
                                        )
                                    }
                                    className="px-3 py-1 border rounded"
                                    disabled={categoryPage === totalCategoryPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // Policies inside selected category
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={handleBackToCategories}
                                className="group flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-brand-600 hover:border-brand-600 transition-all dark:text-gray-400 dark:hover:text-brand-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedCategory.name}
                                </h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedCategory.description}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <button
                                        onClick={() => openEditCategoryModal(selectedCategory)}
                                        className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {displayedPolicies.map((policy) => (
                                <div
                                    key={policy.id}
                                    onClick={() => handlePolicyClick(policy)}
                                    className="group relative cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                            {policy.imageUrl ? (
                                                <img
                                                    src={policy.imageUrl}
                                                    alt={policy.title}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                                                {policy.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                Click to view full policy
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Policy Pagination */}
                        {selectedCategory.policies.length > policiesPerPage && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    onClick={() => setPolicyPage(Math.max(policyPage - 1, 1))}
                                    className="px-3 py-1 border rounded"
                                    disabled={policyPage === 1}
                                >
                                    Prev
                                </button>
                                {[...Array(
                                    Math.ceil(selectedCategory.policies.length / policiesPerPage)
                                )].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPolicyPage(idx + 1)}
                                        className={`px-3 py-1 border rounded ${policyPage === idx + 1 ? "bg-brand-500 text-white" : ""
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() =>
                                        setPolicyPage(
                                            Math.min(
                                                policyPage + 1,
                                                Math.ceil(
                                                    selectedCategory.policies.length / policiesPerPage
                                                )
                                            )
                                        )
                                    }
                                    className="px-3 py-1 border rounded"
                                    disabled={
                                        policyPage ===
                                        Math.ceil(selectedCategory.policies.length / policiesPerPage)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Policy Details Modal */}
            <Modal isOpen={!!selectedPolicy} onClose={closeModal} className="max-w-xl p-8">
                {selectedPolicy && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedPolicy.title}
                        </h2>
                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />
                        <div className="text-gray-600 dark:text-gray-300">
                            {/* Render helper for different content types */}
                            {typeof selectedPolicy.content === 'string' ? (
                                <div dangerouslySetInnerHTML={{ __html: selectedPolicy.content }} className="prose dark:prose-invert max-w-none" />
                            ) : (
                                selectedPolicy.content
                            )}
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => openEditPolicyModal(selectedPolicy)}
                                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline"
                            >
                                Edit Policy
                            </button>
                            <button
                                onClick={closeModal}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create Policy Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="max-w-4xl p-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingPolicy ? "Edit Policy" : "Create New Policy"}
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Policy Title
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="e.g., Remote Work Policy"
                            value={newPolicyTitle}
                            onChange={(e) => setNewPolicyTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category
                        </label>
                        <select
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={newPolicyCategory}
                            onChange={(e) => setNewPolicyCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Policy Content
                        </label>
                        <TiptapEditor content={newPolicyContent} onChange={setNewPolicyContent} />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePolicy}
                            className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                        >
                            {editingPolicy ? "Save Changes" : "Create Policy"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Create/Edit Category Modal */}
            <Modal isOpen={isCreateCategoryModalOpen} onClose={() => setIsCreateCategoryModalOpen(false)} className="max-w-md p-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editingCategory ? "Edit Category" : "Create New Category"}
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="e.g., Finance Policies"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Category description..."
                            rows={3}
                            value={newCategoryDescription}
                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Image URL
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="https://..."
                            value={newCategoryImageUrl}
                            onChange={(e) => setNewCategoryImageUrl(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsCreateCategoryModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveCategory}
                            className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
                        >
                            {editingCategory ? "Save Changes" : "Create Category"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
