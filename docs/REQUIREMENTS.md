# ifBash ITSM Backend — Requirements & Design Spec

**Owner:** Bashir / ifbash (product). Entyti (builder).
**Repo:** `ifbash/EMP` branch `feat/servicenow-foundation`.
**Live:** https://app.ifbash.com
**Status:** Sprints 0–2 shipped (auth + multi-tenant RLS + service catalog + approvals). This doc = backlog from Sprint 3 onward.

---

## 1. Vision

A modern, AI-native ITSM platform — the same problem space as ServiceNow / Jira Service Management / Freshservice / Zendesk / ManageEngine — minus the legacy crust, minus the per-seat tax, plus first-class agentic AI.

ifbash.com positioning is *AI-First ServiceNow consultancy*. The app is both:
1. Bashir's internal tool for the ifbash team in Hyderabad (real ITSM ops, 50 staff)
2. The showcase / accelerator he sells against when pitching "custom employee portal"

So it has to feel best-in-class on day one. No empty stubs.

## 2. Scope

### In scope (this product)
- Incident management (helpdesk core)
- Service catalog + request fulfilment + approvals (already partial)
- Problem management (ITIL — RCA, known errors)
- Change management (CR, CAB, risk scoring)
- CMDB / asset management (configuration items + assignments + lifecycle)
- Knowledge base (articles + AI-authoring + semantic search)
- SLA engine + breach prediction
- Surveys / CSAT + post-resolution feedback
- Announcements + employee directory + org chart (workplace knowledge surface)
- Reports & dashboards (SLA, volumes, agent productivity, AI savings)
- Audit log (every state change, every AI action)
- AI capabilities (see §6)

### Out of scope (handled by PayrollPilot)
- Attendance, timesheets, leave, time-off balance
- Payslips, benefits, travel expenses
- Shift management, overtime, work-from-home requests
- Onboarding/offboarding payroll-side
- Tax statements, PF/ESI, statutory exports

### Out of scope (Phase 2 — post-launch)
- Field Service Management (work orders, dispatch, technician mobile)
- ITOM (event correlation, monitoring agent ingestion)
- SecOps (security incidents, threat intel, SOAR)
- GRC (policy, compliance attestations, risk register)
- LMS deep features (mandatory compliance training, certifications)
- Customer-facing CSM portal (separate tenant model)

### Integration boundary with PayrollPilot
- ifBash deep-links to PayrollPilot for HR/time/leave UIs
- ifBash calls PayrollPilot REST for read-only employee profile data (manager, reporting line, cost centre) when an ITSM workflow needs it (e.g., approvals routing, asset cost allocation)
- No shared schema, no shared deploy, no shared auth (separate Supabase projects)

---

## 3. Best-of-breed analysis — what we copy, what we kill

| Capability | ServiceNow strength | ServiceNow gap | ifBash approach |
|---|---|---|---|
| Workflow engine | Mature, highly configurable | Heavy/slow, JS-on-Java, hard to debug, expensive licensing | Lean Postgres + Server Actions; workflow definitions as JSON, executed by typed TS engine |
| Form designer | Declarative, drag-drop | Slow runtime, table-explosion | `catalog_items.form_schema` JSONB → react-hook-form. Already shipped Sprint 2 |
| Approval engine | Multi-stage, delegation, parallel | Brittle config, hard to inspect | Already shipped Sprint 2 — extend with parallel branches + AI-recommended approver |
| SLA engine | Strong, breach automations | Rigid, time-zone bugs, no prediction | pg_cron tick + AI breach prediction (regression on past tickets) |
| CMDB | Comprehensive class library | Stale data, no auto-discovery without paid agents | Lightweight CMDB; AI-detected stale CIs from comment patterns; webhook ingestion |
| KB | Versioned articles | Static, manual authoring | AI drafts articles from resolved tickets; pgvector semantic search; embed in chat |
| Reporting | Performance Analytics | Expensive add-on, slow | Postgres views + Recharts; one-click "explain this trend" via Claude |
| AI / Now Assist | Strong but $$ | Locked to ServiceNow's models, opaque pricing | Claude (Sonnet for reasoning, Haiku for fast classify), pluggable provider |
| Per-seat licensing | n/a | $$$$ | Self-hosted on Vercel + Supabase, per-tenant pricing, no per-seat tax |
| UI | Workspaces shell, modern | Still feels enterprise-2010 in places | Tailwind v4 + Next 16 + agentic feel (live activity stream) |

**Killed (ServiceNow legacy we DO NOT replicate):**
- ACLs as scripted rules (we use Postgres RLS — auditable, fast)
- Server-side Glide records (we use typed TS + Drizzle-style query builders)
- Update sets (we use git + migrations)
- Customer accounts / contacts model (we collapse to `profiles` + `tenants`)
- Discovery probes (Phase 2 if at all)

---

## 4. User personas

| Persona | Role enum | Primary surfaces |
|---|---|---|
| **Requester** (any employee) | `employee` | `/request-asset`, `/my-requests`, `/helpdesk` (open ticket), `/faq`, `/announcements`, `/profile` |
| **Agent** (helpdesk staff) | `agent` | `/helpdesk` queue, `/my-assets` (their assigned), inbox of new tickets, AI suggested resolutions |
| **Manager** | `manager` | `/approval-workflows`, team request visibility, SLA dashboard for their group |
| **Admin** | `admin` | Catalog editor, approval-chain editor, KB editor, asset CMDB editor, user mgmt within tenant |
| **Owner** | `owner` | Everything admin can do + tenant settings, billing, AAD config |
| **(Phase 2) Field tech** | `field_tech` | Work orders mobile |

Roles already enum'd in `001_foundation.sql`.

---

## 5. Module-by-module spec

### 5.1 Incident management (Sprint 3)

**Schema** (`004_tickets.sql`):
- `tickets` — number `INC-000001` auto, tenant_id, requester_id, assignee_id (nullable), category_id, priority enum(P1..P4), state enum(new/triage/in_progress/pending_user/resolved/closed/cancelled), title, description, source enum(portal/email/api/agent), created_at, updated_at, resolved_at, closed_at, sla_due_at, sla_breached bool, ai_classification jsonb (category_confidence, suggested_assignment, auto_resolved bool, model_version)
- `ticket_comments` — id, ticket_id, author_id, body, internal bool, created_at
- `ticket_attachments` — id, ticket_id, storage_path, filename, mime, size_bytes, uploaded_by
- `ticket_categories` — slug, name, parent_id (tree), default_priority, default_sla_minutes, default_assignment_group
- `sla_policies` — category_id (or *), priority, response_minutes, resolution_minutes, business_hours_id
- `business_hours` — name, timezone, weekly schedule jsonb
- `ticket_state_history` — ticket_id, from_state, to_state, by_user, at, reason

**Server actions:**
- `createTicket(input)` — validate, auto-classify via Claude Haiku, assign SLA, fire creation events
- `assignTicket(id, agent_id)` — with delegation check
- `addComment(id, body, internal)` — auto-summarize on long thread (>10)
- `updateState(id, to_state, reason)` — record history, evaluate SLA breach
- `linkProblem(id, problem_id)` — many-to-many
- `linkAsset(id, asset_id)` — many-to-many
- `escalate(id, reason)` — bumps priority + reassigns

**SLA engine:**
- `pg_cron` tick every 60s evaluates open tickets vs `sla_due_at`
- 75% threshold → notify agent (warning)
- 100% threshold → notify manager (breach)
- AI predictive: `predicted_breach_at` = ML inference based on volume of recent comments, agent workload, historical category resolution time

**Email ingestion:** Resend inbound webhook → `POST /api/tickets/email-in` → parse, dedupe by `In-Reply-To` header, append comment or create ticket

**Realtime:** Supabase Realtime channel per ticket id; agent UI subscribes, requester UI subscribes

### 5.2 Problem management (Sprint 4)

**Schema** (`005_problems.sql`):
- `problems` — number `PRB-000001`, tenant_id, title, description, root_cause, workaround, state enum(new/investigating/known_error/resolved/closed), priority, related_incidents_count, ai_proposed_root_cause jsonb
- `problem_incident_links` — many-to-many
- `known_errors` — problem_id, kb_article_id (suggested workaround)

**Server actions:**
- `createProblemFromIncident(incident_id)` — copies context
- `proposeRootCause(problem_id)` — Claude Sonnet over linked incident threads
- `promoteToKnownError(problem_id)` — auto-creates KB draft

### 5.3 Change management (Sprint 5)

**Schema** (`006_changes.sql`):
- `changes` — number `CHG-000001`, tenant_id, title, description, type enum(standard/normal/emergency), risk_score numeric (0..1, AI-computed), state enum(draft/cab_review/approved/scheduled/in_progress/done/rolled_back/cancelled), planned_start, planned_end, actual_start, actual_end, requester_id, implementer_id, affected_ci_ids uuid[], rollback_plan
- `change_approvals` — change_id, approver_id, role (cab_member/manager/security), state, decided_at, comment
- `change_tasks` — change_id, sequence, title, owner_id, state, est_minutes

**AI:**
- `risk_score` from Claude Sonnet given description + affected CIs + history of similar changes
- "Standard change" auto-template detection — if change matches a previous successful pattern, suggest pre-approval

### 5.4 CMDB / asset management (Sprint 4)

**Schema** (`007_assets.sql`):
- `ci_classes` — slug (server, laptop, software, app_service, vm, container, mobile, peripheral, license), parent_class
- `cis` (configuration items) — id, tenant_id, class_id, name, serial, asset_tag, status enum(planned/in_stock/assigned/in_repair/retired/lost), location, attributes jsonb (class-specific), purchased_at, warranty_until, cost_centre, owner_user_id (nullable)
- `ci_relationships` — from_ci, to_ci, type (depends_on / runs_on / connects_to / contains / used_by)
- `asset_assignments` — ci_id, user_id, assigned_at, returned_at, condition enum
- `asset_audit_log` — ci_id, event, by_user, at, payload jsonb

**Stale CI detector (AI):** weekly job — for each CI not updated in 90d, check incident comments mentioning it; if no recent activity, flag for review.

### 5.5 Knowledge base (Sprint 6)

**Schema** (`008_kb.sql`):
- `kb_articles` — id, tenant_id, slug, title, body (markdown + tiptap json), category_id, state enum(draft/in_review/published/retired), version int, embedding vector(1536), helpful_count, unhelpful_count
- `kb_categories` — tree
- `kb_article_views` — article_id, user_id, at, source (search / ticket / faq)

**AI flows:**
- **Author from ticket:** when ticket resolves, "Generate KB article" button → Claude Sonnet over thread → markdown draft pre-filled, agent reviews
- **Semantic search:** pgvector cosine similarity across `embedding` column; embeddings via OpenAI `text-embedding-3-small` (1536 dim) on insert/update
- **Self-service deflection:** when user opens helpdesk form, classify their description → return top-3 KB articles before they submit. Track deflection rate.

### 5.6 Surveys / CSAT (Sprint 7)

**Schema** (`009_surveys.sql`):
- `surveys` — slug, tenant_id, name, trigger enum(post_incident_resolved/post_change_done/scheduled/manual), questions jsonb (array of question definitions)
- `survey_responses` — survey_id, respondent_id, related_id (ticket/change), score int (1..5), comments, ai_sentiment enum(positive/neutral/negative)

### 5.7 Workplace surface (Sprint 8 — final)

**Schema** (`010_workplace.sql`):
- `announcements` — id, tenant_id, title, body, audience jsonb (all/dept/role), pinned, expires_at, author_id
- `org_chart_nodes` — user_id, manager_id (already in profiles), department, title, location
- `kudos` — from_user, to_user, message, public, at
- `faqs` — separate from KB (lightweight, no versioning)

(employee-directory is just a `profiles` table view with department + title fields.)

### 5.8 Audit log (cross-cutting, lands with Sprint 3)

`audit_log` table on every domain mutation — `actor_id`, `action`, `entity_type`, `entity_id`, `before jsonb`, `after jsonb`, `at`, `ip`, `user_agent`. Mandatory for SOC2/HIPAA-friendly customers per ifbash.com healthcare/financial-services positioning.

---

## 6. AI capabilities

**Shared infra:** `src/lib/ai/` module. Claude API client (Sonnet for reasoning, Haiku for fast classify). OpenAI client only for embeddings (text-embedding-3-small). Prompt cache enabled per Anthropic docs. All AI actions log to `ai_actions` table — `request_hash`, `model`, `tokens_in`, `tokens_out`, `cost_usd`, `outcome` — for billing back to tenants.

| Flow | Model | Trigger | Surface |
|---|---|---|---|
| Ticket triage (classify category + priority + suggest assignee) | Haiku | on `createTicket` | INC-000123 panel "AI suggests" |
| Self-service deflection (suggest KB before submit) | Haiku + pgvector | typing in ticket form | inline KB cards |
| Long thread summarisation | Sonnet | manual button OR auto when comments > 10 | ticket detail header |
| Resolution suggester | Sonnet + RAG | ticket assigned + has KB matches | agent sidebar |
| Auto-resolve narrow categories (password reset, mailbox quota) | Sonnet (agentic, with tool calls) | category whitelisted + confidence > threshold | autonomous, posts comment + closes |
| KB authoring from resolved ticket | Sonnet | ticket state → resolved | "Draft KB article" button |
| Change risk scoring | Sonnet | on change submit | CR detail card |
| SLA breach prediction | Haiku (regressor approximation) | every 5 min on open tickets | dashboard card |
| Approver recommendation | Haiku | on request submit | approval-chain inspector |
| Survey sentiment | Haiku | on survey response submit | report dashboard |
| Stale CI detector | Sonnet weekly | cron | admin notif |
| RCA proposal (problem mgmt) | Sonnet | on `proposeRootCause` | problem detail |
| Trend explainer ("why are P1 incidents up 40%?") | Sonnet over SQL view | dashboard widget click | inline narrative |
| Field auto-fill (free text → form) | Sonnet | request submit | catalog form |

**Agentic loop pattern:** auto-resolution uses Claude tool use. Tools exposed:
- `read_kb(query)` — pgvector retrieval
- `read_ticket_history(user_id)` — past patterns
- `add_comment(ticket_id, body, internal)`
- `set_state(ticket_id, state, reason)` — only from `triage` to `resolved`
- `escalate(ticket_id, reason)` — when confidence < threshold
The loop runs server-side with a 30s deadline, audit-logged per tool call.

**Guardrails:**
- Auto-resolve only fires for category whitelist (configurable per tenant)
- Confidence threshold per category (default 0.85)
- Hard cap: never auto-close P1 / P2
- Every AI action recorded with model + prompt hash; tenant can review last N AI decisions
- AI cannot modify CMDB or change records
- Rate limit per tenant per minute; per-user opt-out flag

---

## 7. Technical architecture

```
Next.js 16 App Router (Vercel)
   |
   ├── src/app/(admin)/* — protected pages
   ├── src/app/api/* — webhook ingestion (email-in, calendar-out)
   ├── src/lib/
   │     ├── supabase/ {server,client,middleware}
   │     ├── auth.ts + auth-policy.ts
   │     ├── catalog/ (Sprint 2 — done)
   │     ├── tickets/ (Sprint 3)
   │     ├── problems/ (Sprint 4)
   │     ├── changes/ (Sprint 5)
   │     ├── assets/ (Sprint 4)
   │     ├── kb/ (Sprint 6)
   │     ├── surveys/ (Sprint 7)
   │     ├── workplace/ (Sprint 8)
   │     ├── ai/ — Claude client, prompt cache, tool use, action logger
   │     ├── sla/ — engine, predictor
   │     └── audit/ — logger
   ├── supabase/
   │     ├── migrations/ (numbered)
   │     ├── functions/ (Edge Functions for cron + email-in)
   │     └── seed/
   └── tests/ — Vitest + Playwright

External:
   Resend (transactional + inbound)
   Claude API (claude-sonnet-4-6 / claude-haiku-4-5)
   OpenAI (embeddings only)
   pg_cron (SLA + scheduled jobs)
   Supabase Storage (attachments)
   Supabase Realtime (live ticket updates)
```

**RLS pattern (already established Sprint 1):**
- Every domain table has `tenant_id`
- `current_user_tenant()` helper resolves from JWT claims
- Policies: SELECT/INSERT/UPDATE all gated by tenant match
- Role-specific policies layered on top (e.g., agents see all tickets in tenant; employees only see their own)

**Multi-tenant tenant resolution (already done):**
- URL query `?tenant=ifbash`
- Or subdomain `ifbash.app.ifbash.com` (Phase 2 — wildcard cert needed)
- Or default tenant from env

**Server actions vs API routes:**
- Mutations from authed UI = Server Actions (Next.js 16, RSC-safe)
- External webhooks = `app/api/*/route.ts`
- Cron-triggered = Supabase Edge Function

**Background jobs:**
- pg_cron extension on Supabase
- Job 1: SLA tick every 60s
- Job 2: AI breach predictor every 5m
- Job 3: KB embedding refresh every 10m
- Job 4: Stale CI scan weekly
- Job 5: Audit log archival monthly

---

## 8. Sprint plan

| # | Name | Migration | Server lib | Pages wired | AI |
|---|---|---|---|---|---|
| 3 | Incident core + SLA + email ingest + audit log | `004_tickets.sql` + `005_audit.sql` | `tickets/`, `audit/`, `sla/` | `/helpdesk`, `/helpdesk/[id]` | Triage (Haiku), thread summary, deflection |
| 4 | CMDB + assets + problem mgmt | `006_assets.sql`, `007_problems.sql` | `assets/`, `problems/` | `/my-assets`, `/asset-issue`, `/return-asset`, `/asset-documentation`, `/it-admin` | Stale CI detector, RCA proposal |
| 5 | Change management + CAB | `008_changes.sql` | `changes/` | new `/changes`, `/changes/[id]`, `/cab` | Risk scoring, standard-change template detection |
| 6 | Knowledge base + semantic search + self-service deflection | `009_kb.sql` + pgvector setup | `kb/` | `/faq`, `/hr-policies` (rebrand → /policies), new `/kb` | KB authoring, semantic search, deflection |
| 7 | Surveys / CSAT + reports / dashboards | `010_surveys.sql` | `surveys/`, `reports/` | `/surveys-feedbacks`, new `/reports` | Sentiment, trend explainer |
| 8 | Workplace surface (announcements, kudos, directory, org chart) | `011_workplace.sql` | `workplace/` | `/announcements`, `/company-news`, `/employee-directory`, `/organizational-chart`, `/appreciate`, `/feedback`, `/employee-hub` | Auto-translate announcements per user lang preference |

**HR/payroll routes are deleted from sidebar before Sprint 3** (per NEXT_SESSION.md). Final scrubbed sidebar already noted in that doc.

**Cross-cutting tasks landing in Sprint 3:**
- `audit_log` table + `audit/` lib
- `ai_actions` table + `ai/` infra (Claude client, model selector, prompt cache, action logger, cost tracker)
- `notifications` table + email/in-app delivery via Resend
- Reusable `useRealtime(table, filter)` hook
- Sidebar pruning (delete HR/payroll items)

**Each sprint runs on its own Agent worktree** (CLAUDE.md hard rule from 2026-05-09). Lands as one PR back to `feat/servicenow-foundation`. PR-ready when: typecheck clean + lint clean + `npm run build` green + smoke test of new flow + docs/changelog updated.

---

## 9. SLAs / KPIs we instrument from day one

| Metric | Where | Why |
|---|---|---|
| Mean Time To Acknowledge (MTTA) | `tickets.acknowledged_at - created_at` | Industry-standard, sells well |
| Mean Time To Resolve (MTTR) | `tickets.resolved_at - created_at` | Pricing pillar |
| First Contact Resolution rate | `tickets WHERE state=resolved AND comments<=2` | Self-service quality |
| Auto-resolve rate | `tickets.ai_classification.auto_resolved=true / total` | AI value proof |
| Deflection rate | `kb_article_views.source=ticket_form` / form submissions | KB ROI |
| SLA compliance % | `1 - (sla_breached / total)` | Customer trust |
| Predicted-breach precision/recall | Confusion matrix on past predictions | AI quality |
| AI cost per resolved ticket | `sum(ai_actions.cost_usd) / resolved_count` | Margin guard |

Numbers visible to admin/owner role. Surface on `/dashboard`.

---

## 10. Open decisions before Sprint 3 starts

**Decided 2026-05-10:**
1. **Tenant model:** multi-tenant from day 1, ifbash = seed.
2. **Email:** `service@ifbash.com` — Bashir adds DKIM/SPF/DMARC on GoDaddy. Resend domain verification before Sprint 3 ships email-in.
3. **AI defaults:** Sonnet 4.6 + Haiku 4.5. Per-tenant spend cap default `$200/mo`, surfaces hard-stop alert at 80% and breaks new AI calls at 100%.
4. **Cadence:** Entyti ships all 8 sprints back-to-back. Bashir review at the end of Sprint 8, not per-sprint.

**Still open (non-blocking — pick as needed during sprints):**

5. **AAD on for ifbash?** Sprint 2.5 infra ready, default off. Bashir to do AAD app registration when ready.
6. **PayrollPilot integration depth:** read-only profile fetch only Phase 1. Write-back deferred.
7. **Storage caps:** default — 25MB per ticket attachment, 500MB per tenant. Revisit if hit.
8. **Email confirmation on signup:** off for ifbash internal seed; on for new tenants by default.
9. **Audit log retention:** 7y (matches financial services positioning per ifbash.com case study).

---

## 11. Hard rules (carried forward)

- ifBash and PayrollPilot are DISTINCT codebases — no shared schema, no cross-references in commits/docs
- Bashir owns ifBash product. Acceptable framing: "Powered by Entyti". Not acceptable: "Entyti's product"
- Every code build runs in Agent worktree isolation
- `npm run build` gate before declaring sprint done (not `tsc --noEmit` alone)
- All HR/payroll work belongs in PayrollPilot, not here
- No internal vendor names client-facing (Claude/OpenAI/Resend/Vercel/Supabase) — generic "our AI platform" / "our infrastructure"
- Every client-facing copy passes through info@entyti.com / Bashir review

---

## 12. What we are NOT going to do

- Re-implement the ServiceNow scripted-rule engine
- Re-implement Glide query API
- Build a no-code form builder (catalog item JSONB schema is enough)
- Build a chatbot UI (KB semantic search inside ticket form is enough — until proven needed)
- Build mobile native apps (PWA + responsive web is enough Phase 1)
- Build a customer-facing CSM portal (Phase 2)
- Build email marketing / nurture flows (CRM, not ITSM)
- Replicate ServiceNow's 100+ pre-built process apps (we ship the 8 above; rest land as customer asks)
