import { NextResponse } from "next/server";
import { evaluateOpenTickets } from "@/lib/sla/engine";

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
  const result = await evaluateOpenTickets();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(req: Request) {
  return GET(req);
}
