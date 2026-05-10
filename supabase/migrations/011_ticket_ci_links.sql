-- ifBash Sprint 4 — link tickets to CIs (and to problems via the link table from 010)
-- Sprint 3's tickets/actions.ts had `linkAsset(id, asset_id)` + `linkProblem(id, problem_id)`
-- as TODOs. This migration provides the join tables.

-- ============================================================================
-- 1. ticket_ci_links — many-to-many tickets <-> cis
-- ============================================================================
create table if not exists public.ticket_ci_links (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  ticket_id     uuid not null references public.tickets(id) on delete cascade,
  ci_id         uuid not null references public.cis(id) on delete cascade,
  linked_by     uuid references public.profiles(id) on delete set null,
  linked_at     timestamptz not null default now(),
  unique (ticket_id, ci_id)
);
create index if not exists idx_ticket_ci_tenant on public.ticket_ci_links(tenant_id);
create index if not exists idx_ticket_ci_ticket on public.ticket_ci_links(ticket_id);
create index if not exists idx_ticket_ci_ci on public.ticket_ci_links(ci_id);

-- ============================================================================
-- 2. RLS — ticket_ci_links
--    Visibility piggybacks on tickets: requester / assignee / manage-roles.
-- ============================================================================
alter table public.ticket_ci_links enable row level security;

drop policy if exists ticket_ci_links_select on public.ticket_ci_links;
create policy ticket_ci_links_select on public.ticket_ci_links
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.tickets t
       where t.id = ticket_ci_links.ticket_id
         and (
           t.requester_id = auth.uid()
           or t.assignee_id = auth.uid()
           or public.can_view_all_tickets()
         )
    )
  );

drop policy if exists ticket_ci_links_write on public.ticket_ci_links;
create policy ticket_ci_links_write on public.ticket_ci_links
  for all
  using (
    tenant_id = public.current_user_tenant() and public.can_view_all_tickets()
  )
  with check (
    tenant_id = public.current_user_tenant() and public.can_view_all_tickets()
  );
