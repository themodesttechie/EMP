import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";
import { getTenantAuthPolicy, defaultTenantSlug } from "@/lib/auth-policy";

export const metadata: Metadata = {
  title: "Sign In | ifBash",
  description: "Sign in to ifBash",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const slug =
    (typeof sp.tenant === "string" && sp.tenant) ||
    defaultTenantSlug();
  const policy = await getTenantAuthPolicy(slug);

  return (
    <Suspense fallback={null}>
      <SignInForm policy={policy} />
    </Suspense>
  );
}
