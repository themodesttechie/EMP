-- ifBash Sprint 4 — problem management
-- ITIL: problems group recurring incidents, capture root cause + workaround,
-- and may promote to a known error backed by a KB article (Sprint 6).

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.problem_state as enum (
    'new','investigating','known_error','resolved','closed'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. problems
-- ============================================================================
create table if not exists public.problems (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid not null references public.tenants(id) on delete cascade,
  number                      text not null,
  title                       text not null,
  description                 text,
  root_cause                  text,
  workaround                  text,
  state                       public.problem_state not null default 'new',
  priority                    public.ticket_priority not null default 'P3',
  related_incidents_count     int not null default 0,
  ai_proposed_root_cause      jsonb,
  created_by                  uuid references public.profiles(id) on delete set null,
  assigned_to                 uuid references public.profiles(id) on delete set null,
  resolved_at                 timestamptz,
  closed_at                   timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  unique (tenant_id, number)
);
create index if not exists idx_problems_tenant on public.problems(tenant_id);
create index if not exists idx_problems_state on public.problems(tenant_id, state);
create index if not exists idx_problems_assigned on public.problems(assigned_to) where assigned_to is not null;

drop trigger if exists trg_problems_updated_at on public.problems;
create trigger trg_problems_updated_at
  before update on public.problems
  for each row execute function public.set_updated_at();

-- Per-tenant PRB- number sequence
create table if not exists public.problem_number_seq (
  tenant_id  uuid primary key references public.tenants(id) on delete cascade,
  next_value bigint not null default 1
);

create or replace function public.allocate_problem_number(p_tenant uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next bigint;
begin
  insert into public.problem_number_seq (tenant_id, next_value)
  values (p_tenant, 1)
  on conflict (tenant_id) do nothing;

  update public.problem_number_seq
     set next_value = next_value + 1
   where tenant_id = p_tenant
   returning next_value - 1 into v_next;

  return 'PRB-' || lpad(v_next::text, 6, '0');
end;
$$;

revoke all on function public.allocate_problem_number(uuid) from public;
grant execute on function public.allocate_problem_number(uuid) to authenticated, service_role;

-- ============================================================================
-- 3. problem_incident_links — many-to-many between problems and tickets
-- ============================================================================
create table if not exists public.problem_incident_links (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  problem_id    uuid not null references public.problems(id) on delete cascade,
  ticket_id     uuid not null references public.tickets(id) on delete cascade,
  linked_by     uuid references public.profiles(id) on delete set null,
  linked_at     timestamptz not null default now(),
  unique (problem_id, ticket_id)
);
create index if not exists idx_problem_links_tenant on public.problem_incident_links(tenant_id);
create index if not exists idx_problem_links_problem on public.problem_incident_links(problem_id);
create index if not exists idx_problem_links_ticket on public.problem_incident_links(ticket_id);

-- Trigger to keep related_incidents_count in sync
create or replace function public.sync_problem_incident_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_problem uuid;
begin
  v_problem := coalesce(new.problem_id, old.problem_id);
  update public.problems
     set related_incidents_count = (
       select count(*) from public.problem_incident_links where problem_id = v_problem
     )
   where id = v_problem;
  return null;
end;
$$;

drop trigger if exists trg_problem_link_count_ins on public.problem_incident_links;
create trigger trg_problem_link_count_ins
  after insert on public.problem_incident_links
  for each row execute function public.sync_problem_incident_count();

drop trigger if exists trg_problem_link_count_del on public.problem_incident_links;
create trigger trg_problem_link_count_del
  after delete on public.problem_incident_links
  for each row execute function public.sync_problem_incident_count();

-- ============================================================================
-- 4. known_errors — promoted problems that have a documented workaround
--    kb_article_id is nullable until Sprint 6 ships kb_articles.
-- ============================================================================
create table if not exists public.known_errors (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  problem_id           uuid not null references public.problems(id) on delete cascade,
  kb_article_id        uuid,
  workaround_summary   text,
  created_by           uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  unique (problem_id)
);
create index if not exists idx_known_errors_tenant on public.known_errors(tenant_id);

-- ============================================================================
-- 5. RLS — problems (managers/agents/admin/owner read-write; employees no access)
-- ============================================================================
alter table public.problems enable row level security;

drop policy if exists problems_select on public.problems;
create policy problems_select on public.problems
  for select
  using (
    tenant_id = public.current_user_tenant()
    and public.can_view_all_tickets()
  );

drop policy if exists problems_write on public.problems;
create policy problems_write on public.problems
  for all
  using (tenant_id = public.current_user_tenant() and public.can_view_all_tickets())
  with check (tenant_id = public.current_user_tenant() and public.can_view_all_tickets());

-- ============================================================================
-- 6. RLS — problem_incident_links
-- ============================================================================
alter table public.problem_incident_links enable row level security;

drop policy if exists problem_links_select on public.problem_incident_links;
create policy problem_links_select on public.problem_incident_links
  for select
  using (tenant_id = public.current_user_tenant() and public.can_view_all_tickets());

drop policy if exists problem_links_write on public.problem_incident_links;
create policy problem_links_write on public.problem_incident_links
  for all
  using (tenant_id = public.current_user_tenant() and public.can_view_all_tickets())
  with check (tenant_id = public.current_user_tenant() and public.can_view_all_tickets());

-- ============================================================================
-- 7. RLS — known_errors (managers/agents/admin/owner)
-- ============================================================================
alter table public.known_errors enable row level security;

drop policy if exists known_errors_select on public.known_errors;
create policy known_errors_select on public.known_errors
  for select
  using (tenant_id = public.current_user_tenant() and public.can_view_all_tickets());

drop policy if exists known_errors_write on public.known_errors;
create policy known_errors_write on public.known_errors
  for all
  using (tenant_id = public.current_user_tenant() and public.can_view_all_tickets())
  with check (tenant_id = public.current_user_tenant() and public.can_view_all_tickets());
