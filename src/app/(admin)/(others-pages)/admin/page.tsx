import type { Metadata } from "next";
import Link from "next/link";
import { Home, FileText, ClipboardList, Bell, PieChart, ChevronRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin | ifBash" };

const MODULES = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Document Hub", icon: FileText, href: "/employee-hub" },
  { name: "Policies", icon: ClipboardList, href: "/policies" },
  { name: "Announcements", icon: Bell, href: "/announcements" },
  { name: "Helpdesk", icon: PieChart, href: "/helpdesk" },
];

export default async function AdminDashboard() {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) {
    redirect("/");
  }
  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] p-8">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Admin panel</h1>
        <p className="text-sm text-slate-500 mb-8">Manage workplace surfaces and tenant settings.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.name}
                href={m.href}
                className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-brand-400 transition group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-xl">
                    <Icon size={20} />
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-brand-500 transition" size={18} />
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white">{m.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
