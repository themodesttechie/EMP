import Link from "next/link";
import { listCategoriesWithItems } from "@/lib/catalog/queries";
import { requireProfile } from "@/lib/auth";
import * as Lucide from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Service Catalog | ifBash" };

function Icon({ name, size = 20 }: { name: string | null; size?: number }) {
  if (!name) return <Lucide.Package size={size} />;
  const C = (Lucide as unknown as Record<string, React.ComponentType<{ size?: number }>>)[name];
  return C ? <C size={size} /> : <Lucide.Package size={size} />;
}

export default async function ServiceCatalogPage() {
  await requireProfile();
  const categories = await listCategoriesWithItems();

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Service Catalog</h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Submit a request — laptop, leave, password reset, anything your team owns.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 pb-24 space-y-10">
        {categories.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-sm text-slate-500">
            No catalog items yet. An admin can add categories and items in the catalog console.
          </div>
        )}

        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon name={cat.icon} size={18} />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{cat.name}</h2>
                <p className="text-xs text-slate-500">{cat.items.length} items</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/request-asset/${item.slug}`}
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-500/10 dark:group-hover:text-brand-400 transition-colors">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.short_description || item.description || ""}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        {item.sla_hours != null && (
                          <span className="inline-flex items-center gap-1">
                            <Lucide.Clock size={12} /> {item.sla_hours}h SLA
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Lucide.GitBranch size={12} />
                          {item.approval_chain.length === 0
                            ? "No approval"
                            : `${item.approval_chain.length}-step approval`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
