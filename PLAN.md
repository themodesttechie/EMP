# ifBash EMP → ServiceNow Alternative

## Current state (audit 2026-05-09)
- Next.js 16.0.10 + React 19.2 + TS + Tailwind v4
- 50+ frontend route stubs (HR, IT asset, LMS, workplace)
- ZERO backend (no `src/app/api/`)
- ZERO auth (SignIn/SignUp forms = static)
- ZERO DB
- `.next` + `tsconfig.tsbuildinfo` committed (cleanup needed)
- `.gitignore` only excludes `node_modules` (high leak risk)

## ServiceNow primitives mapping
| ServiceNow | EMP route stub | Status |
|---|---|---|
| Incident mgmt | `/helpdesk` + `[id]` | Frontend only |
| Service catalog | `/request-asset`, `/request-absence` | Frontend only |
| Approvals | `/approval-workflows` | Frontend only |
| Knowledge base | `/faq`, `/hr-policies` | Frontend only |
| CMDB / Asset mgmt | `/asset-*` (8 routes) | Frontend only |
| HR Service Delivery | `/(others-pages)/*` (25 routes) | Frontend only |

## Stack decision
- **Supabase** (Postgres + Auth + RLS) — reuse PayrollPilot pattern
- **Server Actions** for mutations (no separate API layer)
- **RLS** multi-tenant from day 1 (tenant_id on every table)
- **Resend** for notifications (info@entyti.com sender)
- **Tailwind v4** (already installed)

## Sprint plan

### Sprint 0 — repo hygiene (THIS SESSION)
- [ ] Fix `.gitignore`: add `.next`, `*.tsbuildinfo`, `.env*`, `.idea`, `.DS_Store`
- [ ] Remove tracked `.next/` + `tsconfig.tsbuildinfo` from git
- [ ] `.env.local.example` skeleton (Supabase URL, anon key, service role placeholder)

### Sprint 1 — Foundation (THIS SESSION)
- [ ] Supabase client wrapper (`src/lib/supabase/{server,client,middleware}.ts`)
- [ ] Auth: real Supabase Auth on existing SignIn/SignUp forms
- [ ] Schema migration `001_foundation.sql`: tenants, users (profiles), roles
- [ ] RLS policies for tenants/users
- [ ] Middleware: protect `(admin)/*` routes, redirect unauth → `/signin`

### Sprint 2 — Incident/Ticket core (next)
- [ ] Schema `002_tickets.sql`: tickets, ticket_comments, ticket_attachments, ticket_categories, sla_policies
- [ ] Server actions: createTicket, listTickets, getTicket, addComment, updateStatus, assignTicket
- [ ] Wire existing `/helpdesk` + `/helpdesk/[id]` to real data
- [ ] SLA timer (created_at + priority → due_at)
- [ ] Email notif on ticket assigned / comment added (Resend)

### Sprint 3 — Service catalog + approvals
- [ ] Schema `003_catalog.sql`: catalog_items, requests, approval_steps
- [ ] Approval engine (sequential + parallel stages)
- [ ] Wire `/request-asset`, `/request-absence`, `/approval-workflows`

### Sprint 4 — CMDB / Asset
- [ ] Schema `004_assets.sql`: assets, asset_assignments, asset_audit_log
- [ ] Wire `/asset-issue`, `/return-asset`, `/my-assets`

### Sprint 5 — Knowledge base
- [ ] Schema `005_kb.sql`: kb_articles, kb_categories
- [ ] Tiptap editor (already in deps) for article authoring
- [ ] Wire `/faq`, `/hr-policies`

### Sprint 6 — Reports + SLA dashboard
- [ ] Use existing apexcharts/recharts on real data
- [ ] SLA breach report
- [ ] Ticket volume / agent productivity

## Hard rules carried from Entyti CLAUDE.md
- Verify before done (run tests, smoke test, "would staff eng approve?")
- Pre-deploy audit (`pre_deploy_audit.py` for any deploy artefacts)
- Never name internal vendors to clients (Bashir/team)
- All client comms via info@entyti.com only
- Backup before regen of any generated artefact to `F:\`

## Open questions for user
- Confirm Supabase project: reuse PayrollPilot Mumbai project or new for ifbash?
- Hyderabad region preference (per Bashir's 50-staff context) — ap-south-1 (Mumbai) is closest available
- Resend domain: `payroll.entyti.com` (existing) or new `ifbash.entyti.com`?
- White-label: keep "IfBash" branding or rebrand to neutral (Entyti-internal product)?
