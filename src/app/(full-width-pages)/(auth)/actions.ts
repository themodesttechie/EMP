"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTenantAuthPolicy } from "@/lib/auth-policy";
import { headers } from "next/headers";

export type AuthState = {
  error?: string;
  ok?: boolean;
};

async function recordAuthEvent(opts: {
  tenantSlug?: string;
  email?: string;
  provider: "password" | "azure" | "magic_link" | "recovery";
  outcome: "success" | "failure" | "blocked";
  reason?: string;
}) {
  try {
    const admin = createAdminClient();
    const h = await headers();
    let tenantId: string | null = null;
    if (opts.tenantSlug) {
      const { data } = await admin
        .from("tenants")
        .select("id")
        .eq("slug", opts.tenantSlug)
        .maybeSingle();
      tenantId = (data?.id as string | null) ?? null;
    }
    await admin.from("auth_events").insert({
      tenant_id: tenantId,
      email: opts.email ?? null,
      provider: opts.provider,
      outcome: opts.outcome,
      reason: opts.reason ?? null,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      user_agent: h.get("user-agent") || null,
    });
  } catch {
    // audit logging must never block auth
  }
}

export async function signInAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const tenantSlug = String(formData.get("tenant_slug") || process.env.DEFAULT_TENANT_SLUG || "ifbash").trim();
  const next = String(formData.get("next") || "/");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Policy gate — if tenant is AAD-only, block password sign-in.
  const policy = await getTenantAuthPolicy(tenantSlug);
  if (policy.require_aad || !policy.allow_password) {
    await recordAuthEvent({
      tenantSlug,
      email,
      provider: "password",
      outcome: "blocked",
      reason: "tenant requires Azure AD SSO",
    });
    return {
      error: `${policy.name} requires Microsoft single sign-on. Use the "Sign in with Microsoft" button.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await recordAuthEvent({
      tenantSlug,
      email,
      provider: "password",
      outcome: "failure",
      reason: error.message,
    });
    return { error: error.message };
  }

  await recordAuthEvent({ tenantSlug, email, provider: "password", outcome: "success" });
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/");
}

export async function signInWithAzureAction(formData: FormData): Promise<void> {
  const tenantSlug = String(formData.get("tenant_slug") || process.env.DEFAULT_TENANT_SLUG || "ifbash").trim();
  const next = String(formData.get("next") || "/");
  const policy = await getTenantAuthPolicy(tenantSlug);

  if (!policy.allow_aad) {
    redirect(`/signin?error=aad_disabled&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/callback?next=${encodeURIComponent(next)}&tenant=${encodeURIComponent(tenantSlug)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: callbackUrl,
      // If the tenant pinned an AAD directory, scope auth to it; else multi-tenant
      scopes: "openid email profile offline_access",
      queryParams: policy.aad_tenant_id
        ? { domain_hint: policy.aad_tenant_id, prompt: "select_account" }
        : { prompt: "select_account" },
    },
  });

  if (error || !data?.url) {
    await recordAuthEvent({
      tenantSlug,
      provider: "azure",
      outcome: "failure",
      reason: error?.message || "no oauth url",
    });
    redirect(`/signin?error=${encodeURIComponent(error?.message || "azure_init_failed")}`);
  }

  redirect(data.url);
}

export async function signUpAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const tenantSlug = String(formData.get("tenant_slug") || "ifbash").trim();

  if (!email || !password || !fullName) {
    return { error: "Name, email, and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // Policy: a tenant that requires AAD does not accept password signup either.
  const policy = await getTenantAuthPolicy(tenantSlug);
  if (policy.require_aad || !policy.allow_password) {
    await recordAuthEvent({
      tenantSlug,
      email,
      provider: "password",
      outcome: "blocked",
      reason: "tenant requires Azure AD SSO; password signup disabled",
    });
    return {
      error: `${policy.name} requires Microsoft single sign-on. Ask your admin to invite you, or sign up with Microsoft.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, tenant_slug: tenantSlug },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/callback`,
    },
  });

  if (error) {
    await recordAuthEvent({
      tenantSlug,
      email,
      provider: "password",
      outcome: "failure",
      reason: error.message,
    });
    return { error: error.message };
  }

  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}
