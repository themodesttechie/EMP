import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { getCisAssignedToUser } from "@/lib/assets/queries";

export async function GET(req: Request) {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 403 });
  }
  const userId = new URL(req.url).searchParams.get("user_id") || "";
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });
  const assets = await getCisAssignedToUser(userId);
  return NextResponse.json({ assets });
}
