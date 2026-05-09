# Next session pickup — ifBash ServiceNow alt

Snapshot taken 2026-05-09 PM. Three sprints landed on `feat/servicenow-foundation`. Code is ready; live Supabase + Azure AD config is pending.

## What's done

| Sprint | Commit | Scope |
|---|---|---|
| 0 — hygiene | `3149a04` | gitignore + untrack `.next` / `.idea` / `tsbuildinfo` (was 2727 tracked files) |
| 1 — auth foundation | `2cf3c34` | `001_foundation.sql` (tenants/profiles/RLS), Supabase clients, middleware, server actions, `lib/auth.ts` guards |
| 2 — service catalog + approvals | `28b5fa0` | `002_catalog.sql`, `src/lib/catalog/`, dynamic form per `form_schema`, `/request-asset`, `/my-requests`, `/approval-workflows`, sidebar nav |
| docs | `f6acacd` | PLAN.md scrubbed of PayrollPilot lineage |
| 2.5 — AAD + audit | `f741943` | `003_auth_policy.sql` (per-tenant `allow_password`/`allow_aad`/`require_aad`/`aad_tenant_id` + `auth_events`), Azure OAuth wiring, policy-aware sign-in/up forms, `docs/auth-aad-setup.md` |

Verified each ship: `npx tsc --noEmit` clean, lint clean (new + modified files), `npm run build` green across 67 routes.

## What's blocked on config (user, ~30-45 min total)

In this order:

1. **Provision Supabase project** (Mumbai / ap-south-1, closest to Hyderabad)
2. **Get env values into `.env.local`**
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publishable / anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — secret key (rotated 2026-05-09 after one was leaked in chat; new value lives in BW item `Supabase ifbash service_role`)
   - `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for dev, prod URL after deploy
3. **Apply migrations** — open Supabase Studio → SQL Editor → paste `supabase/bundles/all_migrations.sql` → Run. Verify by SQL:
   ```sql
   select slug, name, require_aad from public.tenants;          -- expect 1 row, ifbash, require_aad=true
   select count(*) from public.catalog_categories;              -- expect 4
   select count(*) from public.catalog_items;                   -- expect 4
   ```
4. **Azure AD app registration** — follow `docs/auth-aad-setup.md` Steps 1-4 (portal.azure.com → App registrations → New → set redirect to `https://<REF>.supabase.co/auth/v1/callback`, create client secret, set API permissions, paste Client ID + Secret into Supabase Studio Auth Providers → Azure)
5. **Pin AAD directory tenant** — Step 5 SQL with the AAD directory GUID:
   ```sql
   update public.tenants
      set aad_tenant_id = '<DIRECTORY_TENANT_ID>'
    where slug = 'ifbash';
   ```
6. **Lock Bitwarden** — `bw lock` to invalidate the session token that hit chat history this session.

## Smoke test once config lands

```bash
cd "c:/Users/fuzzy/Claude projects/ifbash-emp"
npm run dev
```

- Visit `http://localhost:3000/signin?tenant=ifbash`
  - Expect: only "Sign in with Microsoft" button. No password fields.
- Click button → Microsoft login → land back on `/`
- Open Supabase Studio → `auth_events` table → confirm row with `provider='azure'`, `outcome='success'`, your IP, your user-agent
- Visit `/request-asset` → 4 catalog items grouped under HR / IT
- Click "Annual Leave" → fill form → submit → land on `/my-requests/REQ-000001` with stage 1 of 1 pending
- (Optional) sign in as a manager account → visit `/approval-workflows` → see the request → approve

## Sprint 3 — next code work

**Incident/ticket core (helpdesk).** Schema `004_tickets.sql` (tickets, ticket_comments, ticket_attachments, ticket_categories, sla_policies). Server lib `src/lib/tickets/`. Wire existing `/helpdesk` + `/helpdesk/[id]` to live data. Add SLA timer (created_at + priority → due_at). Resend email notif on assign / comment.

**Constraint:** all Sprint 3 code work runs in an Agent worktree (instruction from 2026-05-09 PM session). Spawn pattern:

```
Agent({
  description: "Sprint 3 — ticket core",
  subagent_type: "general-purpose",
  isolation: "worktree",
  prompt: "<self-contained brief>"
})
```

## Hard rules locked-in this session

- ifBash ServiceNow alt and PayrollPilot are **DISTINCT codebases** for the same client. No shared code, no cross-references in commits or docs. The `tasks/lessons.md` 2026-05-09 entries cite the past mistake.
- **Bashir owns ifBash product. Entyti = builder.** Acceptable framing: "Powered by Entyti". Not acceptable: "Entyti's product", "SaaS resale", "white-label spin".
- **HR/time/payroll belong in PayrollPilot, not ifBash.** Recommended integration: PayrollPilot exposes REST + ifBash deep-links / API-calls. 13 ifBash HR-stub pages will be deleted from sidebar before Sprint 3+ touches them — see `ifBash sidebar pruning` task below.
- **PayrollPilot stays on email/password until W7-W8 compliance work ships.** AAD layer goes on top of PayrollPilot only after lock+audit, TDS, statutory exports, retro+SoD land.

## Sidebar pruning (small task, do before Sprint 3)

Delete from `src/layout/nav-items.tsx` — these all belong in PayrollPilot, not ifBash:

- payslips
- attendance
- timesheet
- leave-calendar
- time-off-balance
- request-absence
- manage-absence
- benefits
- shift-management
- overtime-extra-hours
- profile (or repoint to PayrollPilot URL)
- travel-expenses
- holiday-list

Optionally also delete the corresponding stub `page.tsx` files under `src/app/(admin)/(others-pages)/` — they're dead routes once unlinked.

## Quick repo orientation

```
ifbash-emp/
├── PLAN.md                              ← 6-sprint roadmap
├── NEXT_SESSION.md                      ← this file
├── docs/
│   └── auth-aad-setup.md                ← Azure AD walkthrough
├── supabase/
│   ├── migrations/
│   │   ├── 001_foundation.sql           ← tenants, profiles, RLS
│   │   ├── 002_catalog.sql              ← catalog + requests + approvals
│   │   └── 003_auth_policy.sql          ← per-tenant auth + audit
│   └── bundles/
│       └── all_migrations.sql           ← single-paste bundle for Studio
├── src/
│   ├── lib/
│   │   ├── auth.ts                      ← server-side guards
│   │   ├── auth-policy.ts               ← tenant policy resolver
│   │   ├── catalog/                     ← types + queries + actions
│   │   └── supabase/                    ← server / browser / middleware clients
│   ├── components/auth/                 ← SignIn/SignUp/SignOut
│   ├── components/catalog/              ← DynamicRequestForm, ApprovalActions, AddCommentForm
│   └── app/
│       ├── (admin)/(asset-management)/request-asset/
│       │   ├── page.tsx                 ← catalog browser
│       │   └── [slug]/page.tsx          ← dynamic form per item
│       ├── (admin)/(others-pages)/
│       │   ├── my-requests/             ← list + detail
│       │   └── approval-workflows/      ← my queue
│       ├── (full-width-pages)/(auth)/   ← signin / signup / actions
│       └── auth/callback/route.ts       ← OAuth + PKCE exchange
└── .env.local.example                   ← env template
```

## One-liner pickup prompt for next session

> Resume ifBash ServiceNow alt. Read `c:\Users\fuzzy\Claude projects\ifbash-emp\NEXT_SESSION.md` first. State: 4 commits on `feat/servicenow-foundation`, code ready, awaiting Supabase project + Azure AD config. If env populated and migrations applied, smoke-test then start Sprint 3 (ticket core) in an Agent worktree.
