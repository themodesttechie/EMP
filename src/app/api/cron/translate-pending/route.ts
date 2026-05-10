import { NextResponse } from "next/server";
import { listPendingTranslations } from "@/lib/workplace/announcements";
import { translateAnnouncement } from "@/lib/ai/translate";

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

  const pending = await listPendingTranslations();
  let translated = 0;
  let failed = 0;
  const max = Number(process.env.WORKPLACE_TRANSLATE_BATCH || 25);

  for (const ann of pending.slice(0, max)) {
    const r = await translateAnnouncement({
      tenant_id: ann.tenant_id,
      actor_id: null,
      announcement_id: ann.id,
      target_locales: ann.missing,
    });
    if (r.ok) translated += 1;
    else failed += 1;
  }

  return NextResponse.json({ ok: true, scanned: pending.length, translated, failed });
}

export async function POST(req: Request) {
  return GET(req);
}
