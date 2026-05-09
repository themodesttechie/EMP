import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function logAuthEvent(opts: {
  request: Request;
  tenantSlug: string | null;
  email: string | null;
  userId: string | null;
  outcome: "success" | "failure";
  reason?: string;
}) {
  try {
    const admin = createAdminClient();
    let tenantId: string | null = null;
    if (opts.tenantSlug) {
      const { data } = await admin
        .from("tenants")
        .select("id")
        .eq("slug", opts.tenantSlug)
        .maybeSingle();
      tenantId = (data?.id as string | null) ?? null;
    }
    const h = opts.request.headers;
    await admin.from("auth_events").insert({
      tenant_id: tenantId,
      user_id: opts.userId,
      email: opts.email,
      provider: "azure",
      outcome: opts.outcome,
      reason: opts.reason ?? null,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      user_agent: h.get("user-agent") || null,
    });
  } catch {
    // never block auth on logging
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const tenantSlug = searchParams.get("tenant");
  const oauthError = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  if (oauthError) {
    await logAuthEvent({
      request,
      tenantSlug,
      email: null,
      userId: null,
      outcome: "failure",
      reason: errorDesc || oauthError,
    });
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(errorDesc || oauthError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = data?.user;
      await logAuthEvent({
        request,
        tenantSlug,
        email: user?.email ?? null,
        userId: user?.id ?? null,
        outcome: "success",
      });

      // Multi-tenant OAuth: if tenant param differs from the profile's default
      // tenant ('ifbash' from handle_new_user trigger), reconcile via admin client.
      if (tenantSlug && user) {
        try {
          const admin = createAdminClient();
          const { data: target } = await admin
            .from("tenants")
            .select("id, slug")
            .eq("slug", tenantSlug)
            .maybeSingle();
          if (target?.id) {
            await admin
              .from("profiles")
              .update({ tenant_id: target.id })
              .eq("id", user.id);
          }
        } catch {
          // non-fatal; default tenant assignment stands
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    await logAuthEvent({
      request,
      tenantSlug,
      email: null,
      userId: null,
      outcome: "failure",
      reason: error.message,
    });
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed`);
}
