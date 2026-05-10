import type { Metadata } from "next";
import Link from "next/link";
import {
  Megaphone,
  Heart,
  HelpCircle,
  Ticket,
  Package,
  Clock,
  Users,
  Send,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listForUser } from "@/lib/workplace/announcements";
import { listToUser } from "@/lib/workplace/kudos";
import { listMyRequests } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Employee hub | ifBash" };

async function countMyOpenTickets(profileId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("requester_id", profileId)
    .not("state", "in", "(resolved,closed,cancelled)");
  return count ?? 0;
}

async function countMyAssignedAssets(): Promise<number> {
  // Asset module ships in Sprint 4. Tolerate missing table.
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("asset_assignments")
      .select("*", { count: "exact", head: true })
      .is("returned_at", null);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function EmployeeHubPage() {
  const profile = await requireProfile();
  const [pinned, openTickets, openRequests, recentKudos, assignedAssets] = await Promise.all([
    listForUser(profile),
    countMyOpenTickets(profile.id),
    listMyRequests().catch(() => [] as unknown[]),
    listToUser(profile.id, 5),
    countMyAssignedAssets(),
  ]);

  const pinnedItems = pinned.filter((a) => a.pinned).slice(0, 3);
  const openRequestsCount = (openRequests as Array<{ status: string }>).filter(
    (r) => r.status !== "completed" && r.status !== "cancelled" && r.status !== "rejected" && r.status !== "fulfilled",
  ).length;

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Welcome, {profile.full_name ?? profile.email}
          </h1>
          <p className="text-sm text-slate-500">Your snapshot across the workplace.</p>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<Ticket size={18} />}
              label="Open tickets"
              value={openTickets}
              href="/helpdesk"
            />
            <StatCard
              icon={<Clock size={18} />}
              label="Open requests"
              value={openRequestsCount}
              href="/my-requests"
            />
            <StatCard
              icon={<Package size={18} />}
              label="Assigned assets"
              value={assignedAssets}
              href="/my-assets"
            />
            <StatCard
              icon={<Heart size={18} />}
              label="Kudos received"
              value={recentKudos.length}
              href="/appreciate/feed"
            />
          </div>

          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone size={20} /> Pinned announcements
              </h2>
              <Link href="/announcements" className="text-xs text-brand-600 font-bold uppercase tracking-widest">
                View all
              </Link>
            </div>
            {pinnedItems.length === 0 ? (
              <p className="text-sm text-slate-500">No pinned announcements right now.</p>
            ) : (
              <div className="space-y-3">
                {pinnedItems.map((a) => (
                  <Link
                    key={a.id}
                    href="/announcements"
                    className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-brand-300 transition"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.body_for_user}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Heart size={20} /> Recent kudos
              </h2>
              <Link href="/appreciate" className="text-xs text-brand-600 font-bold uppercase tracking-widest">
                Give kudos
              </Link>
            </div>
            {recentKudos.length === 0 ? (
              <p className="text-sm text-slate-500">No kudos yet.</p>
            ) : (
              <div className="space-y-3">
                {recentKudos.map((k) => (
                  <div
                    key={k.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      From {k.from_user?.full_name ?? k.from_user?.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{k.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick links</h3>
            <div className="space-y-2">
              <QuickLink href="/helpdesk" icon={<Ticket size={16} />} label="Raise a ticket" />
              <QuickLink href="/request-asset" icon={<Package size={16} />} label="Request a service" />
              <QuickLink href="/employee-directory" icon={<Users size={16} />} label="Employee directory" />
              <QuickLink href="/faq" icon={<HelpCircle size={16} />} label="Frequently asked" />
              <QuickLink href="/feedback" icon={<Send size={16} />} label="Anonymous feedback" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-brand-400 transition group"
    >
      <div className="flex items-center justify-between mb-2 text-slate-400">
        {icon}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </Link>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-300"
    >
      <span className="text-slate-400">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
