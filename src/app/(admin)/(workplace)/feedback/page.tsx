import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import FeedbackForm from "@/components/workplace/FeedbackForm";

export const metadata: Metadata = { title: "Anonymous feedback | ifBash" };

type Row = {
  id: string;
  body: string;
  category: string;
  ai_sentiment: string | null;
  submitted_at: string;
};

export default async function FeedbackPage() {
  const profile = await requireProfile();
  const isAdmin = ["admin", "owner"].includes(profile.role);

  let rows: Row[] = [];
  if (isAdmin) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("anonymous_feedback")
      .select("id, body, category, ai_sentiment, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(200);
    rows = (data ?? []) as Row[];
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-6 shadow-sm">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Anonymous feedback</h1>
          <p className="text-sm text-slate-500">
            Share thoughts privately. Admins read submissions; your identity is not stored.
          </p>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FeedbackForm />
        </div>
        {isAdmin && (
          <aside className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Submissions ({rows.length})
            </h3>
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500">No feedback yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                        {r.category}
                      </span>
                      {r.ai_sentiment && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            r.ai_sentiment === "positive"
                              ? "bg-emerald-50 text-emerald-600"
                              : r.ai_sentiment === "negative"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {r.ai_sentiment}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-slate-400">
                        {new Date(r.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
}
