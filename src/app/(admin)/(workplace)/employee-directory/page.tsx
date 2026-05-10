import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import {
  searchProfiles,
  listDistinctDepartments,
  listDistinctLocations,
} from "@/lib/workplace/directory";
import EmployeeDirectory from "@/components/workplace/EmployeeDirectory";

export const metadata: Metadata = { title: "Employee directory | ifBash" };

export default async function EmployeeDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; department?: string; location?: string }>;
}) {
  await requireProfile();
  const params = await searchParams;
  const [employees, departments, locations] = await Promise.all([
    searchProfiles(params.q ?? "", {
      department: params.department,
      location: params.location,
    }),
    listDistinctDepartments(),
    listDistinctLocations(),
  ]);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Employee directory</h1>
          <p className="text-sm text-slate-500">Find and connect with colleagues in your tenant.</p>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <EmployeeDirectory
          employees={employees}
          departments={departments}
          locations={locations}
          initialQuery={params.q ?? ""}
          initialDepartment={params.department ?? "All"}
          initialLocation={params.location ?? "All"}
        />
      </main>
    </div>
  );
}
