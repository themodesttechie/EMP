-- ifBash Sprint 4 — CMDB / asset management
-- ServiceNow-equivalent: cmdb_ci + cmdb_rel_ci + asset assignments + audit trail.
-- Per-tenant `CI-NNNNNN` numbering mirrors INC- pattern from 007_tickets.sql.

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.ci_status as enum (
    'planned','in_stock','assigned','in_repair','retired','lost'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.asset_condition as enum ('new','good','fair','damaged');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ci_relationship_type as enum (
    'depends_on','runs_on','connects_to','contains','used_by'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. ci_classes — taxonomy of configuration item types
-- ============================================================================
create table if not exists public.ci_classes (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  parent_id            uuid references public.ci_classes(id) on delete set null,
  slug                 text not null,
  name                 text not null,
  description          text,
  -- JSON schema describing per-class attribute fields, e.g.
  -- { "type":"object","properties":{"cpu":{"type":"string"},"ram_gb":{"type":"integer"}} }
  attributes_schema    jsonb not null default '{}'::jsonb,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_ci_classes_tenant on public.ci_classes(tenant_id);
create index if not exists idx_ci_classes_parent on public.ci_classes(parent_id);

drop trigger if exists trg_ci_classes_updated_at on public.ci_classes;
create trigger trg_ci_classes_updated_at
  before update on public.ci_classes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. cis — configuration items (the actual asset records)
-- ============================================================================
create table if not exists public.cis (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  number               text not null,
  class_id             uuid references public.ci_classes(id) on delete set null,
  name                 text not null,
  serial               text,
  asset_tag            text,
  status               public.ci_status not null default 'in_stock',
  location             text,
  attributes           jsonb not null default '{}'::jsonb,
  purchased_at         date,
  warranty_until       date,
  cost_centre          text,
  owner_user_id        uuid references public.profiles(id) on delete set null,
  -- For inbound webhook ref (vendor confirmation emails, etc.)
  email_message_id     text,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (tenant_id, number),
  unique (tenant_id, asset_tag)
);
create index if not exists idx_cis_tenant on public.cis(tenant_id);
create index if not exists idx_cis_class on public.cis(class_id);
create index if not exists idx_cis_owner on public.cis(owner_user_id) where owner_user_id is not null;
create index if not exists idx_cis_status on public.cis(tenant_id, status);
create index if not exists idx_cis_serial on public.cis(tenant_id, serial) where serial is not null;
create index if not exists idx_cis_warranty on public.cis(tenant_id, warranty_until) where warranty_until is not null;

drop trigger if exists trg_cis_updated_at on public.cis;
create trigger trg_cis_updated_at
  before update on public.cis
  for each row execute function public.set_updated_at();

-- Per-tenant CI number sequence (mirrors allocate_ticket_number)
create table if not exists public.ci_number_seq (
  tenant_id  uuid primary key references public.tenants(id) on delete cascade,
  next_value bigint not null default 1
);

create or replace function public.allocate_ci_number(p_tenant uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next bigint;
begin
  insert into public.ci_number_seq (tenant_id, next_value)
  values (p_tenant, 1)
  on conflict (tenant_id) do nothing;

  update public.ci_number_seq
     set next_value = next_value + 1
   where tenant_id = p_tenant
   returning next_value - 1 into v_next;

  return 'CI-' || lpad(v_next::text, 6, '0');
end;
$$;

revoke all on function public.allocate_ci_number(uuid) from public;
grant execute on function public.allocate_ci_number(uuid) to authenticated, service_role;

-- ============================================================================
-- 4. ci_relationships — graph between CIs (server runs_on host etc.)
-- ============================================================================
create table if not exists public.ci_relationships (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  from_ci       uuid not null references public.cis(id) on delete cascade,
  to_ci         uuid not null references public.cis(id) on delete cascade,
  type          public.ci_relationship_type not null,
  inverse_type  public.ci_relationship_type,
  notes         text,
  created_at    timestamptz not null default now(),
  unique (tenant_id, from_ci, to_ci, type),
  check (from_ci <> to_ci)
);
create index if not exists idx_ci_rel_tenant on public.ci_relationships(tenant_id);
create index if not exists idx_ci_rel_from on public.ci_relationships(from_ci);
create index if not exists idx_ci_rel_to on public.ci_relationships(to_ci);

-- ============================================================================
-- 5. asset_assignments — checkout/return history per CI per user
-- ============================================================================
create table if not exists public.asset_assignments (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  ci_id           uuid not null references public.cis(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete restrict,
  assigned_by     uuid references public.profiles(id) on delete set null,
  assigned_at     timestamptz not null default now(),
  returned_at     timestamptz,
  returned_to     uuid references public.profiles(id) on delete set null,
  condition       public.asset_condition not null default 'good',
  return_condition public.asset_condition,
  checkout_notes  text,
  return_notes    text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_asset_assign_tenant on public.asset_assignments(tenant_id);
create index if not exists idx_asset_assign_ci on public.asset_assignments(ci_id, assigned_at desc);
create index if not exists idx_asset_assign_user on public.asset_assignments(user_id, assigned_at desc);
create index if not exists idx_asset_assign_open on public.asset_assignments(ci_id) where returned_at is null;

-- ============================================================================
-- 6. asset_audit_log — every CI mutation event recorded here in addition to
--    the global audit_log (this is asset-specific quick-lookup)
-- ============================================================================
create table if not exists public.asset_audit_log (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  ci_id         uuid not null references public.cis(id) on delete cascade,
  event         text not null,
  by_user       uuid references public.profiles(id) on delete set null,
  payload       jsonb,
  at            timestamptz not null default now()
);
create index if not exists idx_asset_audit_ci on public.asset_audit_log(ci_id, at desc);
create index if not exists idx_asset_audit_tenant on public.asset_audit_log(tenant_id, at desc);

-- ============================================================================
-- 7. RLS — ci_classes (read all in tenant; write admin/owner/agent)
-- ============================================================================
alter table public.ci_classes enable row level security;

drop policy if exists ci_classes_select on public.ci_classes;
create policy ci_classes_select on public.ci_classes
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists ci_classes_admin_write on public.ci_classes;
create policy ci_classes_admin_write on public.ci_classes
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 8. RLS — cis
--    Agents/admin/owner read-write all in tenant.
--    Employees: read-only on CIs they own.
-- ============================================================================
create or replace function public.can_manage_assets()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role in ('agent','manager','admin','owner') from public.profiles where id = auth.uid()
$$;

alter table public.cis enable row level security;

drop policy if exists cis_select_visibility on public.cis;
create policy cis_select_visibility on public.cis
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      owner_user_id = auth.uid()
      or public.can_manage_assets()
    )
  );

drop policy if exists cis_insert_manage on public.cis;
create policy cis_insert_manage on public.cis
  for insert
  with check (
    tenant_id = public.current_user_tenant() and public.can_manage_assets()
  );

drop policy if exists cis_update_manage on public.cis;
create policy cis_update_manage on public.cis
  for update
  using (tenant_id = public.current_user_tenant() and public.can_manage_assets())
  with check (tenant_id = public.current_user_tenant() and public.can_manage_assets());

drop policy if exists cis_delete_manage on public.cis;
create policy cis_delete_manage on public.cis
  for delete
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 9. RLS — ci_relationships (piggyback on cis)
-- ============================================================================
alter table public.ci_relationships enable row level security;

drop policy if exists ci_rel_select on public.ci_relationships;
create policy ci_rel_select on public.ci_relationships
  for select
  using (tenant_id = public.current_user_tenant() and public.can_manage_assets());

drop policy if exists ci_rel_write on public.ci_relationships;
create policy ci_rel_write on public.ci_relationships
  for all
  using (tenant_id = public.current_user_tenant() and public.can_manage_assets())
  with check (tenant_id = public.current_user_tenant() and public.can_manage_assets());

-- ============================================================================
-- 10. RLS — asset_assignments
--     Employees see own rows. Agents/admin/owner see all in tenant.
-- ============================================================================
alter table public.asset_assignments enable row level security;

drop policy if exists asset_assign_select on public.asset_assignments;
create policy asset_assign_select on public.asset_assignments
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (user_id = auth.uid() or public.can_manage_assets())
  );

drop policy if exists asset_assign_write on public.asset_assignments;
create policy asset_assign_write on public.asset_assignments
  for all
  using (tenant_id = public.current_user_tenant() and public.can_manage_assets())
  with check (tenant_id = public.current_user_tenant() and public.can_manage_assets());

-- ============================================================================
-- 11. RLS — asset_audit_log (read for managers/admins/owners; write service role)
-- ============================================================================
alter table public.asset_audit_log enable row level security;

drop policy if exists asset_audit_select on public.asset_audit_log;
create policy asset_audit_select on public.asset_audit_log
  for select
  using (tenant_id = public.current_user_tenant() and public.can_manage_assets());

-- ============================================================================
-- 12. Seed — sample ci_classes for ifbash tenant
-- ============================================================================
do $$
declare
  v_tenant uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  insert into public.ci_classes (tenant_id, slug, name, description, attributes_schema)
  values
    (v_tenant, 'laptop',  'Laptop',  'Portable workstation issued to staff',
      jsonb_build_object(
        'type','object',
        'properties', jsonb_build_object(
          'cpu',    jsonb_build_object('type','string'),
          'ram_gb', jsonb_build_object('type','integer'),
          'os',     jsonb_build_object('type','string')
        )
      )
    ),
    (v_tenant, 'desktop', 'Desktop', 'Stationary workstation',
      jsonb_build_object('type','object','properties', jsonb_build_object(
        'cpu',jsonb_build_object('type','string'),
        'ram_gb',jsonb_build_object('type','integer')
      ))
    ),
    (v_tenant, 'monitor', 'Monitor', 'External display',
      jsonb_build_object('type','object','properties', jsonb_build_object(
        'size_in',jsonb_build_object('type','number'),
        'panel',jsonb_build_object('type','string')
      ))
    ),
    (v_tenant, 'mobile-phone', 'Mobile phone', 'Issued mobile device',
      jsonb_build_object('type','object','properties', jsonb_build_object(
        'imei',jsonb_build_object('type','string'),
        'plan',jsonb_build_object('type','string')
      ))
    ),
    (v_tenant, 'software-license', 'Software license', 'Per-seat or per-machine licence key',
      jsonb_build_object('type','object','properties', jsonb_build_object(
        'product',jsonb_build_object('type','string'),
        'seats',jsonb_build_object('type','integer'),
        'expires_at',jsonb_build_object('type','string','format','date')
      ))
    ),
    (v_tenant, 'server',  'Server',  'Physical or virtual server',
      jsonb_build_object('type','object','properties', jsonb_build_object(
        'hostname',jsonb_build_object('type','string'),
        'environment',jsonb_build_object('type','string'),
        'ip',jsonb_build_object('type','string')
      ))
    )
  on conflict (tenant_id, slug) do nothing;
end $$;
