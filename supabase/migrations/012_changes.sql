-- ifBash Sprint 5 — change management + CAB
-- ServiceNow-equivalent: change_request + change_task + change_approver tables.
-- Per-tenant CHG-NNNNNN allocator. AI-computed risk_score.
--
-- NOTE on affected_ci_ids: declared as uuid[] without FK. Sprint 4 introduces the
-- `cis` table in 009_assets.sql; building these in parallel worktrees means we
-- cannot guarantee `cis` exists at apply time. We degrade gracefully: array of
-- uuids, soft-resolved at query time. A follow-up migration may add a trigger
-- that scrubs deleted ci ids.

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.change_type as enum ('standard','normal','emergency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.change_state as enum (
    'draft','cab_review','approved','scheduled','in_progress','done','rolled_back','cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.change_approval_role as enum ('cab_member','manager','security');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.change_approval_state as enum ('pending','approved','rejected','abstained');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.change_task_state as enum ('todo','in_progress','done','blocked');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. changes — core change request record
-- ============================================================================
create table if not exists public.changes (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  number              text not null,
  title               text not null,
  description         text,
  type                public.change_type not null default 'normal',
  risk_score          numeric(4,3),
  state               public.change_state not null default 'draft',
  planned_start       timestamptz,
  planned_end         timestamptz,
  actual_start        timestamptz,
  actual_end          timestamptz,
  requester_id        uuid not null references public.profiles(id) on delete restrict,
  implementer_id      uuid references public.profiles(id) on delete set null,
  affected_ci_ids     uuid[] not null default '{}',
  rollback_plan       text,
  template_id         uuid,
  ai_classification   jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (tenant_id, number),
  check (risk_score is null or (risk_score >= 0 and risk_score <= 1))
);
create index if not exists idx_changes_tenant on public.changes(tenant_id);
create index if not exists idx_changes_requester on public.changes(requester_id);
create index if not exists idx_changes_implementer on public.changes(implementer_id) where implementer_id is not null;
create index if not exists idx_changes_state on public.changes(tenant_id, state);
create index if not exists idx_changes_planned on public.changes(tenant_id, planned_start) where planned_start is not null;
create index if not exists idx_changes_open on public.changes(tenant_id, state) where state not in ('done','rolled_back','cancelled');

drop trigger if exists trg_changes_updated_at on public.changes;
create trigger trg_changes_updated_at
  before update on public.changes
  for each row execute function public.set_updated_at();

-- Per-tenant CHG number sequence (mirrors allocate_ticket_number)
create table if not exists public.change_number_seq (
  tenant_id  uuid primary key references public.tenants(id) on delete cascade,
  next_value bigint not null default 1
);

create or replace function public.allocate_change_number(p_tenant uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next bigint;
begin
  insert into public.change_number_seq (tenant_id, next_value)
  values (p_tenant, 1)
  on conflict (tenant_id) do nothing;

  update public.change_number_seq
     set next_value = next_value + 1
   where tenant_id = p_tenant
   returning next_value - 1 into v_next;

  return 'CHG-' || lpad(v_next::text, 6, '0');
end;
$$;

revoke all on function public.allocate_change_number(uuid) from public;
grant execute on function public.allocate_change_number(uuid) to authenticated, service_role;

-- ============================================================================
-- 3. change_approvals — CAB / manager / security sign-off rows
-- ============================================================================
create table if not exists public.change_approvals (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  change_id     uuid not null references public.changes(id) on delete cascade,
  approver_id   uuid not null references public.profiles(id) on delete cascade,
  role          public.change_approval_role not null default 'cab_member',
  state         public.change_approval_state not null default 'pending',
  decided_at    timestamptz,
  comment       text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_change_approvals_change on public.change_approvals(change_id);
create index if not exists idx_change_approvals_approver on public.change_approvals(approver_id, state);
create index if not exists idx_change_approvals_tenant on public.change_approvals(tenant_id);
create unique index if not exists uniq_change_approvals_member
  on public.change_approvals(change_id, approver_id, role);

-- ============================================================================
-- 4. change_tasks — implementation steps with sequence + estimates
-- ============================================================================
create table if not exists public.change_tasks (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  change_id       uuid not null references public.changes(id) on delete cascade,
  sequence        int not null default 0,
  title           text not null,
  description     text,
  owner_id        uuid references public.profiles(id) on delete set null,
  state           public.change_task_state not null default 'todo',
  est_minutes     int,
  actual_minutes  int,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_change_tasks_change on public.change_tasks(change_id, sequence);
create index if not exists idx_change_tasks_owner on public.change_tasks(owner_id) where owner_id is not null;
create index if not exists idx_change_tasks_tenant on public.change_tasks(tenant_id);

drop trigger if exists trg_change_tasks_updated_at on public.change_tasks;
create trigger trg_change_tasks_updated_at
  before update on public.change_tasks
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. change_ticket_links — many-to-many between changes and tickets
-- ============================================================================
create table if not exists public.change_ticket_links (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  change_id   uuid not null references public.changes(id) on delete cascade,
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  link_kind   text not null default 'caused_by' check (link_kind in ('caused_by','related','resolves')),
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (change_id, ticket_id, link_kind)
);
create index if not exists idx_change_ticket_links_change on public.change_ticket_links(change_id);
create index if not exists idx_change_ticket_links_ticket on public.change_ticket_links(ticket_id);
create index if not exists idx_change_ticket_links_tenant on public.change_ticket_links(tenant_id);

-- ============================================================================
-- 6. RLS helper — who can act on changes
-- CAB members + manager + admin/owner see all in tenant
-- requester sees own; implementer sees assigned
-- ============================================================================
create or replace function public.is_cab_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role in ('manager','admin','owner') from public.profiles where id = auth.uid()
$$;

create or replace function public.can_view_all_changes()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role in ('agent','manager','admin','owner') from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- 7. RLS — changes
-- ============================================================================
alter table public.changes enable row level security;

drop policy if exists changes_select_visibility on public.changes;
create policy changes_select_visibility on public.changes
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      requester_id = auth.uid()
      or implementer_id = auth.uid()
      or public.can_view_all_changes()
    )
  );

drop policy if exists changes_insert_self on public.changes;
create policy changes_insert_self on public.changes
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and (requester_id = auth.uid() or public.can_view_all_changes())
  );

drop policy if exists changes_update_visibility on public.changes;
create policy changes_update_visibility on public.changes
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (
      implementer_id = auth.uid()
      or public.can_view_all_changes()
      or (requester_id = auth.uid() and state in ('draft','cab_review'))
    )
  )
  with check (tenant_id = public.current_user_tenant());

-- ============================================================================
-- 8. RLS — change_approvals
-- approvers see their own row; CAB / admins see all in tenant
-- ============================================================================
alter table public.change_approvals enable row level security;

drop policy if exists change_approvals_select on public.change_approvals;
create policy change_approvals_select on public.change_approvals
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      approver_id = auth.uid()
      or public.can_view_all_changes()
    )
  );

drop policy if exists change_approvals_update_self on public.change_approvals;
create policy change_approvals_update_self on public.change_approvals
  for update
  using (
    tenant_id = public.current_user_tenant()
    and approver_id = auth.uid()
  )
  with check (
    tenant_id = public.current_user_tenant()
    and approver_id = auth.uid()
  );

-- ============================================================================
-- 9. RLS — change_tasks (piggyback on changes visibility)
-- ============================================================================
alter table public.change_tasks enable row level security;

drop policy if exists change_tasks_select on public.change_tasks;
create policy change_tasks_select on public.change_tasks
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.changes c
       where c.id = change_tasks.change_id
         and (
           c.requester_id = auth.uid()
           or c.implementer_id = auth.uid()
           or public.can_view_all_changes()
         )
    )
  );

drop policy if exists change_tasks_update on public.change_tasks;
create policy change_tasks_update on public.change_tasks
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (
      owner_id = auth.uid()
      or public.can_view_all_changes()
    )
  )
  with check (tenant_id = public.current_user_tenant());

-- ============================================================================
-- 10. RLS — change_ticket_links (piggyback)
-- ============================================================================
alter table public.change_ticket_links enable row level security;

drop policy if exists change_ticket_links_select on public.change_ticket_links;
create policy change_ticket_links_select on public.change_ticket_links
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.changes c
       where c.id = change_ticket_links.change_id
         and (
           c.requester_id = auth.uid()
           or c.implementer_id = auth.uid()
           or public.can_view_all_changes()
         )
    )
  );

-- ============================================================================
-- 11. Seed: default CAB role marker for ifbash tenant
-- We do not pre-create approver rows (those are per-change) but we ensure the
-- ifbash tenant has at least one admin/manager flagged as CAB-eligible already
-- via the existing role enum. The function is_cab_member() already covers this.
-- This block is a noop placeholder so the migration carries the seed contract.
-- ============================================================================
do $$
declare v_tenant uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;
  -- Ensure number sequence row exists so the first allocate is fast.
  insert into public.change_number_seq (tenant_id, next_value)
  values (v_tenant, 1)
  on conflict (tenant_id) do nothing;
end $$;
