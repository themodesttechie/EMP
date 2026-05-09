-- ifBash Sprint 2.5 — per-tenant auth policy (Azure AD SSO + password fallback)
-- Lets one tenant force AAD-only (ifbash, all M365 staff) while another allows
-- email/password (e.g. external contractors, non-M365 SMBs). Default = password
-- on, AAD off so existing flows keep working.

-- ============================================================================
-- 1. tenants policy columns
-- ============================================================================
alter table public.tenants
  add column if not exists allow_password boolean not null default true,
  add column if not exists allow_aad      boolean not null default false,
  add column if not exists require_aad    boolean not null default false,
  add column if not exists aad_tenant_id  text;

comment on column public.tenants.allow_password is 'When true, password sign-in is allowed for this tenant.';
comment on column public.tenants.allow_aad      is 'When true, Azure AD SSO is offered as a sign-in option.';
comment on column public.tenants.require_aad    is 'When true, only AAD SSO is allowed (password fields hidden). Implies allow_aad.';
comment on column public.tenants.aad_tenant_id  is 'AAD directory (tenant) GUID this Supabase tenant federates against. Optional — null means accept any AAD tenant.';

-- Sanity: require_aad implies allow_aad
alter table public.tenants drop constraint if exists tenants_require_aad_implies_allow_aad;
alter table public.tenants add  constraint tenants_require_aad_implies_allow_aad
  check (not require_aad or allow_aad);

-- ifbash default tenant gets AAD-required (Bashir's 50 staff are on M365)
update public.tenants
   set allow_aad = true,
       require_aad = true
 where slug = 'ifbash'
   and require_aad = false;

-- ============================================================================
-- 2. auth_events — audit trail of sign-in attempts
--    Captured server-side via the auth/callback route + signin action.
--    Useful for compliance + diagnosing AAD misconfig.
-- ============================================================================
create table if not exists public.auth_events (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete set null,
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  provider    text not null,                    -- 'password' | 'azure' | 'magic_link' | 'recovery'
  outcome     text not null check (outcome in ('success','failure','blocked')),
  reason      text,                              -- failure / blocked detail
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_auth_events_tenant_created on public.auth_events(tenant_id, created_at desc);
create index if not exists idx_auth_events_user on public.auth_events(user_id, created_at desc);
create index if not exists idx_auth_events_outcome on public.auth_events(outcome, created_at desc) where outcome <> 'success';

alter table public.auth_events enable row level security;

drop policy if exists auth_events_admin_select on public.auth_events;
create policy auth_events_admin_select on public.auth_events
  for select
  using (
    tenant_id = public.current_user_tenant()
    and public.is_admin_or_owner()
  );

-- Inserts go through service-role only (server-side audit logging)

-- ============================================================================
-- 3. RPC: tenant_policy_for_slug — public read, returns auth policy without
--    exposing other tenant rows. Used by signin page before user is authed.
-- ============================================================================
create or replace function public.tenant_policy_for_slug(p_slug text)
returns table (
  slug           text,
  name           text,
  allow_password boolean,
  allow_aad      boolean,
  require_aad    boolean,
  aad_tenant_id  text
)
language sql
stable
security definer
set search_path = public
as $$
  select t.slug, t.name, t.allow_password, t.allow_aad, t.require_aad, t.aad_tenant_id
    from public.tenants t
   where t.slug = p_slug
$$;

revoke all on function public.tenant_policy_for_slug(text) from public;
grant execute on function public.tenant_policy_for_slug(text) to anon, authenticated;
