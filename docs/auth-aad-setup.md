# Azure AD SSO setup — ifBash

This is a one-time setup per Supabase project. Two halves: **Azure side** (registers ifBash as an app in your Azure AD directory) and **Supabase side** (tells Supabase to trust that Azure app).

## Prerequisites

- A Supabase project (URL + anon key + service role key in `.env.local`)
- Migrations `001_foundation.sql`, `002_catalog.sql`, `003_auth_policy.sql` applied in order
- Access to `portal.azure.com` for the Azure AD tenant you want to federate with (for Bashir, this is ifbash's M365 / Entra tenant)

## Step 1 — Register the app in Azure AD

1. Sign in to <https://portal.azure.com> with an admin account on the target Azure AD tenant
2. **Microsoft Entra ID** → **App registrations** → **New registration**
3. **Name:** `ifBash` (or `ifBash (Production)` if you want a separate dev/prod split)
4. **Supported account types:**
   - For ifbash-tenant-only: *Accounts in this organizational directory only*
   - For multi-AAD-tenant SaaS: *Accounts in any organizational directory*
5. **Redirect URI** (Web platform): `https://<YOUR_SUPABASE_REF>.supabase.co/auth/v1/callback`
   - You can find `<YOUR_SUPABASE_REF>` in your Supabase project URL: e.g. `abcdef123.supabase.co`
6. Click **Register**

After registration:
- Copy **Application (client) ID** → you'll paste this into Supabase as the **Client ID**
- Copy **Directory (tenant) ID** → you'll store this on the `tenants.aad_tenant_id` column for the matching Supabase tenant

## Step 2 — Create a client secret

1. Inside the new app registration → **Certificates & secrets** → **Client secrets** → **New client secret**
2. **Description:** `Supabase ifBash`
3. **Expires:** 24 months (or shorter per your security policy; rotate before expiry)
4. **Add**, then immediately copy the **Value** (NOT the Secret ID). Once you leave this page the value is hidden forever.

Store the secret value in:
- Bitwarden (item: `AAD ifBash Supabase`)
- Supabase Studio (next step)

## Step 3 — Set API permissions

Inside the app registration → **API permissions** → ensure these Microsoft Graph delegated permissions are present:

- `openid`
- `email`
- `profile`
- `offline_access`

Click **Grant admin consent for <tenant>** if your IT policy requires admin-consented scopes.

## Step 4 — Configure Azure provider in Supabase

1. Open Supabase Studio for your project
2. **Authentication** → **Providers** → find **Azure**
3. Toggle **Enabled**
4. Paste:
   - **Client ID** = the Application (client) ID from Step 1
   - **Client Secret** = the secret value from Step 2
   - **Azure tenant URL** = `https://login.microsoftonline.com/<DIRECTORY_TENANT_ID>` (single-tenant) or `https://login.microsoftonline.com/common` (multi-tenant)
5. **Save**

The Supabase callback URL (`https://<ref>.supabase.co/auth/v1/callback`) must match exactly the redirect URI set in Step 1.

## Step 5 — Set tenant policy

In Supabase Studio SQL editor (or psql):

```sql
update public.tenants
   set allow_aad     = true,
       require_aad   = true,           -- ifbash forces SSO
       aad_tenant_id = '<DIRECTORY_TENANT_ID>'
 where slug = 'ifbash';
```

For tenants that allow both password and AAD:

```sql
update public.tenants
   set allow_password = true,
       allow_aad      = true,
       require_aad    = false,
       aad_tenant_id  = '<DIRECTORY_TENANT_ID_OR_NULL>'
 where slug = '<tenant_slug>';
```

For password-only tenants: leave `allow_aad` and `require_aad` at default `false`.

## Step 6 — Smoke test

1. Visit `http://localhost:3000/signin?tenant=ifbash`
2. Confirm: only "Sign in with Microsoft" button visible (no password fields, because `require_aad = true`)
3. Click button → redirected to `login.microsoftonline.com`
4. Authenticate with a Microsoft account in the target directory
5. Should land back on `http://localhost:3000/` with an active session
6. Open Supabase Studio → `auth_events` table → confirm a row with `provider='azure'`, `outcome='success'`, your IP, and your user agent

## Step 7 — Production redirect URIs

When deploying, add the production redirect URI to the Azure app registration:

- `https://ifbash.entyti.com/auth/callback` (or wherever Bashir's prod domain lives)

Both URIs (`localhost` for dev, prod URL for live) can coexist on the same Azure app. Keep secrets the same; only domains differ.

## Common gotchas

- **AADSTS50011 redirect URI mismatch.** The redirect URI registered in Azure must match the one Supabase posts back to *exactly*, including scheme + path. Re-check Step 1 vs Step 4.
- **"Application requires admin consent" wall.** Some Azure tenants block user-consent for any app. Click **Grant admin consent** in Step 3 from a global admin account.
- **Multi-tenant signin opens "select tenant" screen.** Set `aad_tenant_id` on the `tenants` row to pin SSO to one Azure directory; the action passes `domain_hint` + `prompt=select_account` to skip directory chooser.
- **First-time Azure login creates an `auth.users` row with default tenant `ifbash`.** The callback route reconciles `profiles.tenant_id` to whichever `?tenant=` slug came in on the OAuth init. If you need to migrate an existing AAD user between tenants, do it via SQL on the `profiles` row — Azure won't notice.
- **`auth_events` empty after a successful login?** Audit logging fires from server actions and the callback route; both use the service role client. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local` and not the placeholder.

## Rollback

To disable AAD on a tenant without redeploying:

```sql
update public.tenants
   set allow_aad   = false,
       require_aad = false
 where slug = 'ifbash';
```

The next page load drops the Microsoft button. Existing AAD-authed sessions stay valid until expiry.

To kill the Azure provider entirely: Supabase Studio → **Authentication** → **Providers** → **Azure** → toggle **Disabled**.
