import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogItemBySlug } from "@/lib/catalog/queries";
import { requireProfile } from "@/lib/auth";
import DynamicRequestForm from "@/components/catalog/DynamicRequestForm";
import { ChevronLeft } from "lucide-react";

export default async function CatalogItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireProfile();
  const { slug } = await params;
  const item = await getCatalogItemBySlug(slug);
  if (!item) notFound();

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <Link
          href="/request-asset"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <ChevronLeft size={14} />
          Back to catalog
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{item.name}</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {item.category.name} · {item.short_description || ""}
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-24">
        {item.description && (
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
        )}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
          <DynamicRequestForm item={item} />
        </div>
      </main>
    </div>
  );
}
