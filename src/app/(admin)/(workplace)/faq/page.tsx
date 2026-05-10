import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { listPublished } from "@/lib/workplace/faqs";
import FaqList from "@/components/workplace/FaqList";

export const metadata: Metadata = { title: "FAQ | ifBash" };

export default async function FaqPage() {
  await requireProfile();
  const faqs = await listPublished();
  const categories = Array.from(new Set(faqs.map((f) => f.category))).sort();

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Frequently asked questions</h1>
          <p className="text-sm text-slate-500">Quick answers to common questions.</p>
        </div>
      </header>
      <main className="max-w-[900px] mx-auto px-6 py-8">
        <FaqList items={faqs} categories={categories} />
      </main>
    </div>
  );
}
