import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { runSentimentAnalysis } from "@/lib/surveys/actions";

function authorise(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    new URL(req.url).searchParams.get("secret");
  return got === expected;
}

export async function GET(req: Request) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("survey_responses")
    .select("id")
    .is("ai_sentiment", null)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: true })
    .limit(25);

  const ids = ((data ?? []) as Array<{ id: string }>).map((r) => r.id);
  let processed = 0;
  let failed = 0;
  for (const id of ids) {
    try {
      await runSentimentAnalysis(id);
      processed += 1;
    } catch (e) {
      failed += 1;
      console.error("[cron/sentiment-pending] failed for", id, e);
    }
  }

  return NextResponse.json({ ok: true, processed, failed, queued: ids.length });
}

export async function POST(req: Request) {
  return GET(req);
}
