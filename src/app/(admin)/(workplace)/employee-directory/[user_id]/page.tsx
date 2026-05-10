import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Mail, Phone, User, Globe, Calendar, ChevronLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getProfile, listDirectReports } from "@/lib/workplace/directory";
import { listToUser } from "@/lib/workplace/kudos";

export const metadata: Metadata = { title: "Profile | ifBash" };

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  await requireProfile();
  const { user_id } = await params;
  const profile = await getProfile(user_id);
  if (!profile) notFound();

  const [reports, manager, recentKudos] = await Promise.all([
    listDirectReports(profile.id),
    profile.manager_id ? getProfile(profile.manager_id) : Promise.resolve(null),
    listToUser(profile.id, 10),
  ]);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-[1200px] mx-auto">
          <Link
            href="/employee-directory"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft size={16} /> Back to directory
          </Link>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400" />
            <div className="px-8 pb-8">
              <div className="-mt-16 mb-6">
                <div className="w-32 h-32 rounded-3xl p-1.5 bg-white dark:bg-[#121212] shadow-sm">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={profile.full_name ?? profile.email} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} />
                    )}
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                {profile.full_name ?? profile.email}
              </h1>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">
                {profile.job_title ?? profile.role}
              </p>
              {profile.about && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">About</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {profile.about}
                  </p>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.department && (
                  <InfoTile icon={<Building2 size={20} />} label="Department" value={profile.department} />
                )}
                {profile.location && (
                  <InfoTile icon={<MapPin size={20} />} label="Location" value={profile.location} />
                )}
                <InfoTile
                  icon={<Mail size={20} />}
                  label="Email"
                  value={profile.email}
                  href={`mailto:${profile.email}`}
                />
                {profile.phone && (
                  <InfoTile icon={<Phone size={20} />} label="Phone" value={profile.phone} />
                )}
                {profile.locale && (
                  <InfoTile icon={<Globe size={20} />} label="Locale" value={profile.locale} />
                )}
                {profile.joined_at && (
                  <InfoTile icon={<Calendar size={20} />} label="Joined" value={profile.joined_at} />
                )}
              </div>
            </div>
          </div>

          {recentKudos.length > 0 && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent kudos</h2>
              <div className="space-y-3">
                {recentKudos.map((k) => (
                  <div
                    key={k.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300">{k.message}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>From {k.from_user?.full_name ?? k.from_user?.email ?? "Anonymous"}</span>
                      {k.ai_categorized_value && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 text-[10px] font-bold uppercase">
                          {k.ai_categorized_value.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {manager && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Reports to</h3>
              <Link
                href={`/employee-directory/${manager.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  <User size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {manager.full_name ?? manager.email}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    {manager.job_title ?? manager.role}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {reports.length > 0 && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Direct reports ({reports.length})
              </h3>
              <div className="space-y-2">
                {reports.map((r) => (
                  <Link
                    key={r.id}
                    href={`/employee-directory/${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {r.full_name ?? r.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 truncate">
                        {r.job_title ?? r.role}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
      <div className="p-2.5 bg-white dark:bg-[#121212] rounded-xl text-slate-400 shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}
