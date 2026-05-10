import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  getKnownError,
  getLinkedIncidents,
  getProblemByNumber,
} from "@/lib/problems/queries";
import { listProfilesInTenant } from "@/lib/tickets/queries";
import ProblemDetail from "@/components/problems/ProblemDetail";

export const metadata: Metadata = { title: "Problem | ifBash" };

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const profile = await requireProfile();
  if (!["agent", "manager", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const { number } = await params;
  const problem = await getProblemByNumber(number);
  if (!problem) notFound();
  const [incidents, knownError, profiles] = await Promise.all([
    getLinkedIncidents(problem.id),
    getKnownError(problem.id),
    listProfilesInTenant(),
  ]);

  return (
    <ProblemDetail
      problem={problem}
      incidents={incidents}
      knownError={knownError}
      profiles={profiles}
    />
  );
}
