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
- **Supabase** (Postgres + Auth + RLS) — its own project, not shared with any other Entyti product
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

### Sprint 2 — Service catalog + approvals (next; reordered 2026-05-09 per owner)
- [ ] Schema `002_catalog.sql`: catalog_categories, catalog_items, requests, request_approvals, request_comments
- [ ] Approval engine (sequential stages, manager-of-requester default)
- [ ] Server actions: createRequest, listMyRequests, listPendingApprovals, approveRequest, rejectRequest, addRequestComment
- [ ] Wire `/request-asset`, `/request-absence`, `/approval-workflows`, `/manage-absence` to real data

### Sprint 3 — Incident/Ticket core
- [ ] Schema `003_tickets.sql`: tickets, ticket_comments, ticket_attachments, ticket_categories, sla_policies
- [ ] Server actions: createTicket, listTickets, getTicket, addComment, updateStatus, assignTicket
- [ ] Wire existing `/helpdesk` + `/helpdesk/[id]` to real data
- [ ] SLA timer (created_at + priority → due_at)
- [ ] Email notif on ticket assigned / comment added (Resend)

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
- Supabase project: create dedicated project for this product (Mumbai/ap-south-1 closest to Hyderabad). Do NOT share with any other Entyti product.
- Resend sender domain: new subdomain (e.g. `service.entyti.com`) — own DKIM, own bounce stream.
- White-label: keep "ifBash" default; per-tenant rebrand via `tenants.name` already in schema.
