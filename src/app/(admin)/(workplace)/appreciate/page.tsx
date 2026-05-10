import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { searchProfiles } from "@/lib/workplace/directory";
import { listFromUser } from "@/lib/workplace/kudos";
import GiveKudosForm from "@/components/workplace/GiveKudosForm";

export const metadata: Metadata = { title: "Give kudos | ifBash" };

export default async function AppreciatePage() {
  const profile = await requireProfile();
  const [recipients, mySent] = await Promise.all([
    searchProfiles("", undefined, 500),
    listFromUser(profile.id, 5),
  ]);
  const others = recipients.filter((r) => r.id !== profile.id);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Give kudos</h1>
            <p className="text-sm text-slate-500">
              Recognise a colleague. Public kudos appear in the feed.
            </p>
          </div>
          <Link
            href="/appreciate/feed"
            className="px-4 py-2 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest rounded-xl"
          >
            View feed
          </Link>
        </div>
      </header>
      <main className="max-w-[1000px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GiveKudosForm recipients={others} />
        </div>
        <aside>
          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Recently sent
            </h3>
            {mySent.length === 0 ? (
              <p className="text-sm text-slate-500">You have not sent kudos yet.</p>
            ) : (
              <div className="space-y-3">
                {mySent.map((k) => (
                  <div
                    key={k.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      To {k.to_user?.full_name ?? k.to_user?.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{k.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
