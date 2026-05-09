import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { findDeflectionCandidates } from "@/lib/ai/deflect";

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ kb_articles: [], confidence: 0 }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const draft = String((body as { text?: string }).text ?? "");
  const result = await findDeflectionCandidates({
    tenant_id: profile.tenant_id,
    draft_text: draft,
  });
  return NextResponse.json(result);
}
