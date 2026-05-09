-- ifBash ServiceNow alternative — foundation schema
-- Multi-tenant from day 1. Every domain table carries tenant_id.
-- RLS enforced via auth.uid() → profile → tenant_id.

-- ============================================================================
-- 1. Tenants (orgs)
-- ============================================================================
create table if not exists public.tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  logo_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.tenants is 'Top-level organisation. Every user belongs to exactly one tenant.';

-- ============================================================================
-- 2. Roles (system roles per tenant)
-- ============================================================================
do $$ begin
  create type public.app_role as enum (
    'owner',           -- tenant owner, full access
    'admin',           -- IT/HR admin, manages tickets/assets/users
    'agent',           -- helpdesk agent, can resolve tickets
    'manager',         -- approves requests for direct reports
    'employee'         -- end user, requester
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 3. Profiles (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  tenant_id       uuid not null references public.tenants(id) on delete restrict,
  email           text not null,
  full_name       text,
  avatar_url      text,
  role            public.app_role not null default 'employee',
  manager_id      uuid references public.profiles(id) on delete set null,
  department      text,
  job_title       text,
  phone           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_profiles_tenant on public.profiles(tenant_id);
create index if not exists idx_profiles_manager on public.profiles(manager_id);
create index if not exists idx_profiles_role on public.profiles(tenant_id, role);
comment on table public.profiles is '1:1 with auth.users. tenant_id sets org membership. role drives RLS for tenant-internal data.';

-- ============================================================================
-- 4. Helper: current_user_tenant() — used in every RLS policy
-- ============================================================================
create or replace function public.current_user_tenant()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role in ('owner', 'admin') from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- 5. updated_at triggers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tenants_updated_at on public.tenants;
create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6. RLS — tenants
-- ============================================================================
alter table public.tenants enable row level security;

drop policy if exists tenants_select on public.tenants;
create policy tenants_select on public.tenants
  for select
  using (id = public.current_user_tenant());

drop policy if exists tenants_update_owner on public.tenants;
create policy tenants_update_owner on public.tenants
  for update
  using (id = public.current_user_tenant() and public.current_user_role() = 'owner')
  with check (id = public.current_user_tenant() and public.current_user_role() = 'owner');

-- ============================================================================
-- 7. RLS — profiles
-- ============================================================================
alter table public.profiles enable row level security;

-- Everyone can see profiles in their tenant (employee directory)
drop policy if exists profiles_select_same_tenant on public.profiles;
create policy profiles_select_same_tenant on public.profiles
  for select
  using (tenant_id = public.current_user_tenant());

-- Self-update for own row (limited fields enforced at app level)
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid() and tenant_id = public.current_user_tenant());

-- Admin/owner can update any profile in own tenant
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- Admin/owner inserts new profiles (signup flow uses service role for first-user)
drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin on public.profiles
  for insert
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 8. handle_new_user trigger — auto-create profile on auth.users insert
--    NOTE: relies on raw_user_meta_data.tenant_slug + full_name set at signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id   uuid;
  v_tenant_slug text;
  v_full_name   text;
  v_is_first    boolean;
begin
  v_tenant_slug := coalesce(new.raw_user_meta_data->>'tenant_slug', 'ifbash');
  v_full_name   := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- Resolve or create tenant
  select id into v_tenant_id from public.tenants where slug = v_tenant_slug;
  if v_tenant_id is null then
    insert into public.tenants (slug, name)
    values (v_tenant_slug, initcap(replace(v_tenant_slug, '-', ' ')))
    returning id into v_tenant_id;
  end if;

  -- First user in a tenant becomes owner; rest are employees
  select not exists (
    select 1 from public.profiles where tenant_id = v_tenant_id
  ) into v_is_first;

  insert into public.profiles (id, tenant_id, email, full_name, role)
  values (
    new.id,
    v_tenant_id,
    new.email,
    v_full_name,
    case when v_is_first then 'owner'::public.app_role else 'employee'::public.app_role end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 9. Seed default tenant (idempotent)
-- ============================================================================
insert into public.tenants (slug, name)
values ('ifbash', 'ifBash Charity')
on conflict (slug) do nothing;
