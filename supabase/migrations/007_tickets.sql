-- ifBash Sprint 3 — incident management core
-- ServiceNow-equivalent: incident table + comments + attachments + categories + SLA + history.
-- Per-tenant `INC-NNNNNN` numbering via sequence allocator (mirrors REQ pattern).

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.ticket_state as enum (
    'new','triage','in_progress','pending_user','resolved','closed','cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ticket_priority as enum ('P1','P2','P3','P4');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ticket_source as enum ('portal','email','api','agent','chat');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. business_hours — used by SLA engine to skip non-working time
-- ============================================================================
create table if not exists public.business_hours (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  name         text not null,
  timezone     text not null default 'Asia/Kolkata',
  -- weekly schedule: { mon: [{start:"09:00",end:"17:00"}], tue: [...], ... }
  schedule     jsonb not null default jsonb_build_object(
    'mon', jsonb_build_array(jsonb_build_object('start','09:00','end','17:00')),
    'tue', jsonb_build_array(jsonb_build_object('start','09:00','end','17:00')),
    'wed', jsonb_build_array(jsonb_build_object('start','09:00','end','17:00')),
    'thu', jsonb_build_array(jsonb_build_object('start','09:00','end','17:00')),
    'fri', jsonb_build_array(jsonb_build_object('start','09:00','end','17:00')),
    'sat', jsonb_build_array(),
    'sun', jsonb_build_array()
  ),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, name)
);
create index if not exists idx_business_hours_tenant on public.business_hours(tenant_id);

drop trigger if exists trg_business_hours_updated_at on public.business_hours;
create trigger trg_business_hours_updated_at
  before update on public.business_hours
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. ticket_categories — tree taxonomy (IT > Hardware, IT > Software, ...)
-- ============================================================================
create table if not exists public.ticket_categories (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references public.tenants(id) on delete cascade,
  parent_id                uuid references public.ticket_categories(id) on delete cascade,
  slug                     text not null,
  name                     text not null,
  description              text,
  default_priority         public.ticket_priority not null default 'P3',
  default_assignment_role  public.app_role,
  is_active                boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_ticket_categories_tenant on public.ticket_categories(tenant_id);
create index if not exists idx_ticket_categories_parent on public.ticket_categories(parent_id);

drop trigger if exists trg_ticket_categories_updated_at on public.ticket_categories;
create trigger trg_ticket_categories_updated_at
  before update on public.ticket_categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. sla_policies — per category × priority response/resolution clocks
-- ============================================================================
create table if not exists public.sla_policies (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null references public.tenants(id) on delete cascade,
  category_id            uuid references public.ticket_categories(id) on delete cascade,
  priority               public.ticket_priority not null,
  response_minutes       int not null,
  resolution_minutes     int not null,
  business_hours_id      uuid references public.business_hours(id) on delete set null,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- A null category_id means default policy for that priority
  unique (tenant_id, category_id, priority)
);
create index if not exists idx_sla_policies_lookup on public.sla_policies(tenant_id, category_id, priority);

drop trigger if exists trg_sla_policies_updated_at on public.sla_policies;
create trigger trg_sla_policies_updated_at
  before update on public.sla_policies
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. tickets — incident records
-- ============================================================================
create table if not exists public.tickets (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  number                  text not null,
  requester_id            uuid not null references public.profiles(id) on delete restrict,
  assignee_id             uuid references public.profiles(id) on delete set null,
  category_id             uuid references public.ticket_categories(id) on delete set null,
  priority                public.ticket_priority not null default 'P3',
  state                   public.ticket_state not null default 'new',
  source                  public.ticket_source not null default 'portal',
  title                   text not null,
  description             text,
  -- AI triage suggestion + accepted-by-agent flag
  ai_classification       jsonb,
  -- SLA timestamps (computed at create + recomputed on priority change)
  response_due_at         timestamptz,
  resolution_due_at       timestamptz,
  responded_at            timestamptz,
  resolved_at             timestamptz,
  closed_at               timestamptz,
  sla_breached            boolean not null default false,
  sla_warned_at           timestamptz,
  -- Email-in tracking for thread reply matching
  email_message_id        text,
  email_in_reply_to       text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (tenant_id, number)
);
create index if not exists idx_tickets_tenant on public.tickets(tenant_id);
create index if not exists idx_tickets_requester on public.tickets(requester_id);
create index if not exists idx_tickets_assignee on public.tickets(assignee_id) where assignee_id is not null;
create index if not exists idx_tickets_open on public.tickets(tenant_id, state) where state not in ('resolved','closed','cancelled');
create index if not exists idx_tickets_email_msgid on public.tickets(email_message_id) where email_message_id is not null;
create index if not exists idx_tickets_resolution_due on public.tickets(resolution_due_at) where resolution_due_at is not null and state not in ('resolved','closed','cancelled');

drop trigger if exists trg_tickets_updated_at on public.tickets;
create trigger trg_tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- Per-tenant ticket number sequence (mirrors request_code_seq pattern)
create table if not exists public.ticket_number_seq (
  tenant_id  uuid primary key references public.tenants(id) on delete cascade,
  next_value bigint not null default 1
);

create or replace function public.allocate_ticket_number(p_tenant uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next bigint;
begin
  insert into public.ticket_number_seq (tenant_id, next_value)
  values (p_tenant, 1)
  on conflict (tenant_id) do nothing;

  update public.ticket_number_seq
     set next_value = next_value + 1
   where tenant_id = p_tenant
   returning next_value - 1 into v_next;

  return 'INC-' || lpad(v_next::text, 6, '0');
end;
$$;

revoke all on function public.allocate_ticket_number(uuid) from public;
grant execute on function public.allocate_ticket_number(uuid) to authenticated, service_role;

-- ============================================================================
-- 6. ticket_comments
-- ============================================================================
create table if not exists public.ticket_comments (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  ticket_id    uuid not null references public.tickets(id) on delete cascade,
  author_id    uuid references public.profiles(id) on delete set null,
  kind         text not null default 'comment' check (kind in ('comment','system','ai')),
  body         text not null,
  is_internal  boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists idx_ticket_comments_tenant on public.ticket_comments(tenant_id);
create index if not exists idx_ticket_comments_ticket on public.ticket_comments(ticket_id, created_at);

-- ============================================================================
-- 7. ticket_attachments
-- ============================================================================
create table if not exists public.ticket_attachments (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  ticket_id     uuid not null references public.tickets(id) on delete cascade,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  storage_path  text not null,
  filename      text not null,
  mime          text,
  size_bytes    bigint not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_ticket_attachments_ticket on public.ticket_attachments(ticket_id, created_at);

-- ============================================================================
-- 8. ticket_state_history
-- ============================================================================
create table if not exists public.ticket_state_history (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  from_state  public.ticket_state,
  to_state    public.ticket_state not null,
  by_user     uuid references public.profiles(id) on delete set null,
  reason      text,
  -- Free-form payload: outbound email message-ids, escalation context, etc.
  payload     jsonb,
  at          timestamptz not null default now()
);
create index if not exists idx_ticket_state_history_ticket on public.ticket_state_history(ticket_id, at);
create index if not exists idx_ticket_state_history_tenant on public.ticket_state_history(tenant_id, at desc);

-- ============================================================================
-- 9. RLS — business_hours (read all in tenant; write admin/owner)
-- ============================================================================
alter table public.business_hours enable row level security;

drop policy if exists business_hours_select on public.business_hours;
create policy business_hours_select on public.business_hours
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists business_hours_admin_write on public.business_hours;
create policy business_hours_admin_write on public.business_hours
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 10. RLS — ticket_categories
-- ============================================================================
alter table public.ticket_categories enable row level security;

drop policy if exists ticket_categories_select on public.ticket_categories;
create policy ticket_categories_select on public.ticket_categories
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists ticket_categories_admin_write on public.ticket_categories;
create policy ticket_categories_admin_write on public.ticket_categories
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 11. RLS — sla_policies
-- ============================================================================
alter table public.sla_policies enable row level security;

drop policy if exists sla_policies_select on public.sla_policies;
create policy sla_policies_select on public.sla_policies
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists sla_policies_admin_write on public.sla_policies;
create policy sla_policies_admin_write on public.sla_policies
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 12. RLS — tickets
--    Helper function: roles agent/manager/admin/owner see all in tenant.
--    Employee sees only own.
-- ============================================================================
create or replace function public.can_view_all_tickets()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role in ('agent','manager','admin','owner') from public.profiles where id = auth.uid()
$$;

alter table public.tickets enable row level security;

drop policy if exists tickets_select_visibility on public.tickets;
create policy tickets_select_visibility on public.tickets
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      requester_id = auth.uid()
      or assignee_id = auth.uid()
      or public.can_view_all_tickets()
    )
  );

drop policy if exists tickets_insert_self on public.tickets;
create policy tickets_insert_self on public.tickets
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and (requester_id = auth.uid() or public.can_view_all_tickets())
  );

drop policy if exists tickets_update_visibility on public.tickets;
create policy tickets_update_visibility on public.tickets
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (
      assignee_id = auth.uid()
      or public.can_view_all_tickets()
      or (requester_id = auth.uid() and state in ('new','pending_user'))
    )
  )
  with check (tenant_id = public.current_user_tenant());

-- ============================================================================
-- 13. RLS — ticket_comments (piggyback on tickets)
-- ============================================================================
alter table public.ticket_comments enable row level security;

drop policy if exists ticket_comments_select on public.ticket_comments;
create policy ticket_comments_select on public.ticket_comments
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.tickets t
       where t.id = ticket_comments.ticket_id
         and (
           t.requester_id = auth.uid()
           or t.assignee_id = auth.uid()
           or public.can_view_all_tickets()
         )
         -- Internal comments hidden from requester
         and (not ticket_comments.is_internal or t.requester_id <> auth.uid() or public.can_view_all_tickets())
    )
  );

drop policy if exists ticket_comments_insert on public.ticket_comments;
create policy ticket_comments_insert on public.ticket_comments
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and (author_id = auth.uid() or author_id is null)
    and exists (
      select 1 from public.tickets t
       where t.id = ticket_comments.ticket_id
         and (
           t.requester_id = auth.uid()
           or t.assignee_id = auth.uid()
           or public.can_view_all_tickets()
         )
    )
  );

-- ============================================================================
-- 14. RLS — ticket_attachments (piggyback on tickets)
-- ============================================================================
alter table public.ticket_attachments enable row level security;

drop policy if exists ticket_attachments_select on public.ticket_attachments;
create policy ticket_attachments_select on public.ticket_attachments
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.tickets t
       where t.id = ticket_attachments.ticket_id
         and (
           t.requester_id = auth.uid()
           or t.assignee_id = auth.uid()
           or public.can_view_all_tickets()
         )
    )
  );

drop policy if exists ticket_attachments_insert on public.ticket_attachments;
create policy ticket_attachments_insert on public.ticket_attachments
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and (uploaded_by = auth.uid() or uploaded_by is null)
  );

-- ============================================================================
-- 15. RLS — ticket_state_history (read-piggyback; write service-role only)
-- ============================================================================
alter table public.ticket_state_history enable row level security;

drop policy if exists ticket_state_history_select on public.ticket_state_history;
create policy ticket_state_history_select on public.ticket_state_history
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.tickets t
       where t.id = ticket_state_history.ticket_id
         and (
           t.requester_id = auth.uid()
           or t.assignee_id = auth.uid()
           or public.can_view_all_tickets()
         )
    )
  );
