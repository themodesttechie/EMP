import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { listOpen } from "@/lib/problems/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import ProblemsList from "@/components/problems/ProblemsList";

export const metadata: Metadata = { title: "Problem management | ifBash" };

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; priority?: string }>;
}) {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const sp = await searchParams;
  const [problems, profiles] = await Promise.all([
    listOpen({ state: sp.state, priority: sp.priority }),
    listProfilesInTenant(),
  ]);
  return (
    <ProblemsList
      problems={problems}
      profiles={profiles}
      filters={{ state: sp.state ?? "", priority: sp.priority ?? "" }}
    />
  );
}
