import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { recordView } from "@/lib/kb/queries";

const VALID_SOURCES = new Set([
  "search",
  "ticket_form",
  "faq_browse",
  "direct",
  "related",
]);

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    article_id?: string;
    source?: string;
  };
  const article_id = String(body.article_id || "").slice(0, 64);
  const source = String(body.source || "direct");
  if (!article_id) {
    return NextResponse.json({ ok: false, error: "article_id required" }, { status: 400 });
  }
  if (!VALID_SOURCES.has(source)) {
    return NextResponse.json({ ok: false, error: "bad source" }, { status: 400 });
  }
  await recordView({
    tenant_id: profile.tenant_id,
    article_id,
    viewer_id: profile.id,
    source: source as "search" | "ticket_form" | "faq_browse" | "direct" | "related",
  });
  return NextResponse.json({ ok: true });
}
