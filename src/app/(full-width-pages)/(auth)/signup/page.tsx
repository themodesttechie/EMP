import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";
import { getTenantAuthPolicy, defaultTenantSlug } from "@/lib/auth-policy";

export const metadata: Metadata = {
  title: "Sign Up | ifBash",
  description: "Create an ifBash account",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SignUp({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const slug =
    (typeof sp.tenant === "string" && sp.tenant) || defaultTenantSlug();
  const policy = await getTenantAuthPolicy(slug);
  return <SignUpForm policy={policy} />;
}
