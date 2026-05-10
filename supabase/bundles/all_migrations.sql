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
-- ifBash Sprint 2 — Service catalog + approvals
-- Models ServiceNow's sc_cat_item / sc_request / sc_req_item / sysapproval_approver split,
-- collapsed for ifBash scale: catalog_items (templates), requests (instances),
-- request_approvals (decisions), request_comments (activity stream).

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.request_status as enum (
    'draft',          -- requester hasn't submitted yet
    'pending',        -- submitted, awaiting first approver
    'approved',       -- all approval stages cleared, fulfilment pending
    'rejected',       -- any approver rejected
    'fulfilled',      -- assignee marked complete (laptop delivered, leave granted, etc.)
    'cancelled'       -- requester or admin pulled it
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.approval_decision as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.approver_kind as enum (
    'manager',        -- requester's direct manager (resolved at submit)
    'role',           -- any user with a given app_role (e.g. admin)
    'user'            -- a named profile id
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. catalog_categories — taxonomy (HR, IT, Finance, Travel, etc.)
-- ============================================================================
create table if not exists public.catalog_categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  slug        text not null,
  name        text not null,
  icon        text,                                -- lucide-react icon name
  sort_order  int  not null default 100,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_catalog_categories_tenant on public.catalog_categories(tenant_id);

drop trigger if exists trg_catalog_categories_updated_at on public.catalog_categories;
create trigger trg_catalog_categories_updated_at
  before update on public.catalog_categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. catalog_items — request templates ("Request Laptop", "Annual Leave", "Reset Password")
-- ============================================================================
create table if not exists public.catalog_items (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  category_id     uuid not null references public.catalog_categories(id) on delete restrict,
  slug            text not null,
  name            text not null,
  short_description text,
  description     text,
  icon            text,
  -- Form definition: array of fields. Each field = { key, label, type, required, options? }
  -- type ∈ text, textarea, number, date, select, checkbox, file
  form_schema     jsonb not null default '[]'::jsonb,
  -- Approval chain: ordered array of approver definitions
  -- Each step = { kind: 'manager'|'role'|'user', role?, user_id?, label?, optional? }
  approval_chain  jsonb not null default '[]'::jsonb,
  fulfilment_role public.app_role not null default 'admin',  -- who picks up after approval
  sla_hours       int,                                       -- nullable: optional fulfilment SLA
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_catalog_items_tenant on public.catalog_items(tenant_id);
create index if not exists idx_catalog_items_category on public.catalog_items(category_id);
create index if not exists idx_catalog_items_active on public.catalog_items(tenant_id, is_active);

drop trigger if exists trg_catalog_items_updated_at on public.catalog_items;
create trigger trg_catalog_items_updated_at
  before update on public.catalog_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. requests — instances of a catalog item submission
-- ============================================================================
create table if not exists public.requests (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  -- Human-readable code per tenant: REQ-000123. Generated at insert via sequence.
  code            text not null,
  catalog_item_id uuid not null references public.catalog_items(id) on delete restrict,
  requester_id    uuid not null references public.profiles(id) on delete restrict,
  -- Snapshot of the item name + category at submit time, so renames don't break history
  item_name_snapshot     text not null,
  category_name_snapshot text not null,
  -- Form payload — values keyed by form_schema field keys
  form_data       jsonb not null default '{}'::jsonb,
  status          public.request_status not null default 'draft',
  current_stage   int not null default 0,           -- index into approval chain; 0 = first stage
  total_stages    int not null default 0,           -- length of approval_chain at submit
  assignee_id     uuid references public.profiles(id) on delete set null,  -- fulfiller after approval
  due_at          timestamptz,                                -- computed from sla_hours at submit
  submitted_at    timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (tenant_id, code)
);
create index if not exists idx_requests_tenant on public.requests(tenant_id);
create index if not exists idx_requests_requester on public.requests(requester_id);
create index if not exists idx_requests_status on public.requests(tenant_id, status);
create index if not exists idx_requests_assignee on public.requests(assignee_id) where assignee_id is not null;

drop trigger if exists trg_requests_updated_at on public.requests;
create trigger trg_requests_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- Per-tenant request code sequence
create table if not exists public.request_code_seq (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  next_value bigint not null default 1
);

create or replace function public.allocate_request_code(p_tenant uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next bigint;
begin
  insert into public.request_code_seq (tenant_id, next_value)
  values (p_tenant, 1)
  on conflict (tenant_id) do nothing;

  update public.request_code_seq
     set next_value = next_value + 1
   where tenant_id = p_tenant
   returning next_value - 1 into v_next;

  return 'REQ-' || lpad(v_next::text, 6, '0');
end;
$$;

-- ============================================================================
-- 5. request_approvals — one row per approval stage per request
-- ============================================================================
create table if not exists public.request_approvals (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  request_id      uuid not null references public.requests(id) on delete cascade,
  stage           int not null,                              -- 0-indexed; matches requests.current_stage
  approver_kind   public.approver_kind not null,
  approver_id     uuid references public.profiles(id) on delete set null, -- resolved approver
  required_role   public.app_role,                            -- only set if approver_kind='role'
  decision        public.approval_decision not null default 'pending',
  decided_by      uuid references public.profiles(id) on delete set null,
  decided_at      timestamptz,
  comment         text,
  created_at      timestamptz not null default now(),
  unique (request_id, stage)
);
create index if not exists idx_request_approvals_tenant on public.request_approvals(tenant_id);
create index if not exists idx_request_approvals_request on public.request_approvals(request_id);
create index if not exists idx_request_approvals_pending_for_user on public.request_approvals(approver_id, decision)
  where decision = 'pending';
create index if not exists idx_request_approvals_pending_for_role on public.request_approvals(tenant_id, required_role, decision)
  where decision = 'pending' and approver_kind = 'role';

-- ============================================================================
-- 6. request_comments — activity stream (system events + human comments)
-- ============================================================================
create table if not exists public.request_comments (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  request_id      uuid not null references public.requests(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,
  -- 'comment' = human note; 'system' = state transitions ("Approved by X", "Assigned to Y")
  kind            text not null default 'comment' check (kind in ('comment', 'system')),
  body            text not null,
  is_internal     boolean not null default false,            -- agent-only notes hidden from requester
  created_at      timestamptz not null default now()
);
create index if not exists idx_request_comments_tenant on public.request_comments(tenant_id);
create index if not exists idx_request_comments_request on public.request_comments(request_id, created_at);

-- ============================================================================
-- 7. RLS — catalog_categories (readable by all in tenant; writable by admin/owner)
-- ============================================================================
alter table public.catalog_categories enable row level security;

drop policy if exists catalog_categories_select on public.catalog_categories;
create policy catalog_categories_select on public.catalog_categories
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists catalog_categories_admin_write on public.catalog_categories;
create policy catalog_categories_admin_write on public.catalog_categories
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 8. RLS — catalog_items (readable by all in tenant; writable by admin/owner)
-- ============================================================================
alter table public.catalog_items enable row level security;

drop policy if exists catalog_items_select on public.catalog_items;
create policy catalog_items_select on public.catalog_items
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists catalog_items_admin_write on public.catalog_items;
create policy catalog_items_admin_write on public.catalog_items
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 9. RLS — requests
--    - Requester sees own
--    - Assignee sees assigned
--    - Approver sees ones awaiting their decision
--    - Admin/owner sees all in tenant
-- ============================================================================
alter table public.requests enable row level security;

drop policy if exists requests_select_visibility on public.requests;
create policy requests_select_visibility on public.requests
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      requester_id = auth.uid()
      or assignee_id = auth.uid()
      or public.is_admin_or_owner()
      or exists (
        select 1 from public.request_approvals ra
         where ra.request_id = requests.id
           and (
             ra.approver_id = auth.uid()
             or (ra.approver_kind = 'role' and ra.required_role = public.current_user_role())
           )
      )
    )
  );

drop policy if exists requests_insert_self on public.requests;
create policy requests_insert_self on public.requests
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and requester_id = auth.uid()
  );

drop policy if exists requests_update_visibility on public.requests;
create policy requests_update_visibility on public.requests
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (
      (requester_id = auth.uid() and status in ('draft', 'pending'))
      or assignee_id = auth.uid()
      or public.is_admin_or_owner()
    )
  )
  with check (tenant_id = public.current_user_tenant());

-- ============================================================================
-- 10. RLS — request_approvals
--     - Approver sees own pending; admin/owner sees all in tenant
--     - Approver updates own decision (or role-match for role-kind)
-- ============================================================================
alter table public.request_approvals enable row level security;

drop policy if exists request_approvals_select on public.request_approvals;
create policy request_approvals_select on public.request_approvals
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      approver_id = auth.uid()
      or (approver_kind = 'role' and required_role = public.current_user_role())
      or public.is_admin_or_owner()
      or exists (
        select 1 from public.requests r
         where r.id = request_approvals.request_id
           and (r.requester_id = auth.uid() or r.assignee_id = auth.uid())
      )
    )
  );

drop policy if exists request_approvals_insert_admin on public.request_approvals;
create policy request_approvals_insert_admin on public.request_approvals
  for insert
  with check (tenant_id = public.current_user_tenant());

drop policy if exists request_approvals_update_decision on public.request_approvals;
create policy request_approvals_update_decision on public.request_approvals
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (
      approver_id = auth.uid()
      or (approver_kind = 'role' and required_role = public.current_user_role())
      or public.is_admin_or_owner()
    )
  )
  with check (tenant_id = public.current_user_tenant());

-- ============================================================================
-- 11. RLS — request_comments (visibility piggybacks on requests)
-- ============================================================================
alter table public.request_comments enable row level security;

drop policy if exists request_comments_select on public.request_comments;
create policy request_comments_select on public.request_comments
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.requests r
       where r.id = request_comments.request_id
         and (
           r.requester_id = auth.uid()
           or r.assignee_id = auth.uid()
           or public.is_admin_or_owner()
           or exists (
             select 1 from public.request_approvals ra
              where ra.request_id = r.id
                and (ra.approver_id = auth.uid()
                  or (ra.approver_kind = 'role' and ra.required_role = public.current_user_role()))
           )
         )
         -- Internal comments are hidden from requester
         and (not request_comments.is_internal or r.requester_id <> auth.uid() or public.is_admin_or_owner())
    )
  );

drop policy if exists request_comments_insert on public.request_comments;
create policy request_comments_insert on public.request_comments
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and (author_id = auth.uid() or author_id is null)
  );

-- ============================================================================
-- 12. Seed default ifbash catalog (idempotent)
-- ============================================================================
do $$
declare
  v_tenant uuid;
  v_cat_hr  uuid;
  v_cat_it  uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  insert into public.catalog_categories (tenant_id, slug, name, icon, sort_order)
  values
    (v_tenant, 'hr',      'HR',          'Users',     10),
    (v_tenant, 'it',      'IT',          'Laptop',    20),
    (v_tenant, 'finance', 'Finance',     'Wallet',    30),
    (v_tenant, 'travel',  'Travel',      'Plane',     40)
  on conflict (tenant_id, slug) do nothing;

  select id into v_cat_hr from public.catalog_categories where tenant_id = v_tenant and slug = 'hr';
  select id into v_cat_it from public.catalog_categories where tenant_id = v_tenant and slug = 'it';

  insert into public.catalog_items (tenant_id, category_id, slug, name, short_description, description,
                                    icon, form_schema, approval_chain, fulfilment_role, sla_hours)
  values
    (v_tenant, v_cat_hr, 'annual-leave', 'Annual Leave',
      'Request paid time off',
      'Submit your annual leave dates for manager approval. Leave balance is checked at submit.',
      'CalendarDays',
      jsonb_build_array(
        jsonb_build_object('key','start_date','label','Start date','type','date','required',true),
        jsonb_build_object('key','end_date','label','End date','type','date','required',true),
        jsonb_build_object('key','reason','label','Reason (optional)','type','textarea','required',false)
      ),
      jsonb_build_array(
        jsonb_build_object('kind','manager','label','Direct manager')
      ),
      'admin', 24
    ),
    (v_tenant, v_cat_hr, 'work-from-home', 'Work From Home',
      'Request a WFH day or block',
      'Submit your WFH dates. Defaults to single-step manager approval.',
      'Home',
      jsonb_build_array(
        jsonb_build_object('key','start_date','label','Start date','type','date','required',true),
        jsonb_build_object('key','end_date','label','End date','type','date','required',true),
        jsonb_build_object('key','reason','label','Reason','type','textarea','required',false)
      ),
      jsonb_build_array(
        jsonb_build_object('kind','manager','label','Direct manager')
      ),
      'admin', 8
    ),
    (v_tenant, v_cat_it, 'request-laptop', 'Request a Laptop',
      'New or replacement device',
      'Submit a hardware request. Manager approves first, then IT admin fulfils.',
      'Laptop',
      jsonb_build_array(
        jsonb_build_object('key','device_type','label','Device type','type','select','required',true,
          'options', jsonb_build_array('Standard laptop','High-spec laptop','MacBook','Desktop')),
        jsonb_build_object('key','reason','label','Justification','type','textarea','required',true),
        jsonb_build_object('key','urgency','label','Urgency','type','select','required',true,
          'options', jsonb_build_array('Standard','High','Urgent'))
      ),
      jsonb_build_array(
        jsonb_build_object('kind','manager','label','Direct manager'),
        jsonb_build_object('kind','role','role','admin','label','IT admin')
      ),
      'admin', 72
    ),
    (v_tenant, v_cat_it, 'reset-password', 'Reset Password',
      'Lost access to your account',
      'Submit a password reset. IT admin processes immediately.',
      'KeyRound',
      jsonb_build_array(
        jsonb_build_object('key','account','label','Account / system','type','text','required',true),
        jsonb_build_object('key','notes','label','Extra detail','type','textarea','required',false)
      ),
      jsonb_build_array(
        jsonb_build_object('kind','role','role','admin','label','IT admin')
      ),
      'admin', 4
    )
  on conflict (tenant_id, slug) do nothing;
end $$;
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
-- ifBash Sprint 3 — audit_log (cross-cutting)
-- Every domain mutation writes a row. Per requirements doc §5.8 / §10 retention 7y.
-- RLS: only admin/owner of the same tenant can read; inserts via service role.

create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  actor_id     uuid references public.profiles(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    text,
  before       jsonb,
  after        jsonb,
  ip           inet,
  user_agent   text,
  at           timestamptz not null default now()
);
create index if not exists idx_audit_log_tenant_at on public.audit_log(tenant_id, at desc);
create index if not exists idx_audit_log_entity on public.audit_log(tenant_id, entity_type, entity_id);
create index if not exists idx_audit_log_actor on public.audit_log(actor_id, at desc);

comment on table public.audit_log is 'Immutable mutation audit. 7y retention per ifbash compliance positioning.';

alter table public.audit_log enable row level security;

drop policy if exists audit_log_admin_select on public.audit_log;
create policy audit_log_admin_select on public.audit_log
  for select
  using (
    tenant_id = public.current_user_tenant()
    and public.is_admin_or_owner()
  );

-- Inserts only via service role (bypasses RLS); never via end-user JWT.

-- ============================================================================
-- Archival cron stub (parent session wires via Supabase Studio / pg_cron extension):
--   select cron.schedule(
--     'audit_log_archival_monthly',
--     '0 3 1 * *',
--     $$delete from public.audit_log where at < now() - interval '7 years'$$
--   );
-- pg_cron permissions vary per Supabase plan; left as comment for manual setup.
-- ============================================================================
-- ifBash Sprint 3 — ai_actions
-- Every LLM call logs here. Drives per-tenant $200/mo cap + cost-per-resolved-ticket KPI.

do $$ begin
  create type public.ai_flow as enum (
    'triage',
    'summary',
    'deflect',
    'auto_resolve',
    'rca',
    'risk_score',
    'kb_authoring',
    'sentiment',
    'breach_predict',
    'trend_explain',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ai_outcome as enum ('success','error','timeout','rate_limited','blocked_cap');
exception when duplicate_object then null; end $$;

create table if not exists public.ai_actions (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  actor_id             uuid references public.profiles(id) on delete set null,
  flow                 public.ai_flow not null,
  model                text not null,
  prompt_hash          text,
  tokens_in            int not null default 0,
  tokens_out           int not null default 0,
  cost_usd             numeric(10,6) not null default 0,
  latency_ms           int,
  outcome              public.ai_outcome not null,
  error_reason         text,
  result_json          jsonb,
  related_entity_type  text,
  related_entity_id    text,
  at                   timestamptz not null default now()
);
create index if not exists idx_ai_actions_tenant_at on public.ai_actions(tenant_id, at desc);
create index if not exists idx_ai_actions_tenant_month_cost on public.ai_actions(tenant_id, at) where outcome = 'success';
create index if not exists idx_ai_actions_related on public.ai_actions(tenant_id, related_entity_type, related_entity_id);

comment on table public.ai_actions is 'Audit log for every Claude/AI call. Drives per-tenant monthly cap + cost analytics.';

alter table public.ai_actions enable row level security;

drop policy if exists ai_actions_admin_select on public.ai_actions;
create policy ai_actions_admin_select on public.ai_actions
  for select
  using (
    tenant_id = public.current_user_tenant()
    and public.is_admin_or_owner()
  );

-- Helper: month-to-date AI spend for a tenant. Used by client to enforce cap.
create or replace function public.tenant_ai_spend_mtd(p_tenant uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(cost_usd), 0)
    from public.ai_actions
   where tenant_id = p_tenant
     and outcome = 'success'
     and at >= date_trunc('month', now())
$$;

revoke all on function public.tenant_ai_spend_mtd(uuid) from public;
grant execute on function public.tenant_ai_spend_mtd(uuid) to authenticated, service_role;
-- ifBash Sprint 3 — notifications
-- In-app + email delivery (Resend). Per-user RLS: user reads own only.

do $$ begin
  create type public.notification_channel as enum ('in_app','email','both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_status as enum ('pending','sent','failed','suppressed');
exception when duplicate_object then null; end $$;

create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  recipient_id    uuid not null references public.profiles(id) on delete cascade,
  kind            text not null,
  subject         text not null,
  body_md         text not null,
  related_type    text,
  related_id      text,
  channel         public.notification_channel not null default 'in_app',
  read_at         timestamptz,
  sent_at         timestamptz,
  delivery_status public.notification_status not null default 'pending',
  delivery_error  text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_notifications_recipient_unread on public.notifications(recipient_id, created_at desc) where read_at is null;
create index if not exists idx_notifications_tenant_at on public.notifications(tenant_id, created_at desc);
create index if not exists idx_notifications_pending on public.notifications(delivery_status, created_at) where delivery_status = 'pending';

comment on table public.notifications is 'In-app + email notifications. Per-user RLS so user sees only own.';

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select
  using (
    tenant_id = public.current_user_tenant()
    and recipient_id = auth.uid()
  );

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update
  using (
    tenant_id = public.current_user_tenant()
    and recipient_id = auth.uid()
  )
  with check (
    tenant_id = public.current_user_tenant()
    and recipient_id = auth.uid()
  );

-- Inserts via service role only (server-side only, never user-driven).
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
-- ifBash Sprint 3 — seed ticket categories, SLA defaults, business hours
-- Idempotent: re-runs are safe.

do $$
declare
  v_tenant uuid;
  v_bh     uuid;
  v_it     uuid;
  v_hrit   uuid;
  v_fac    uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  ----------------------------------------------------------------------------
  -- Business hours: Default 9-5 Mon-Fri Asia/Kolkata
  ----------------------------------------------------------------------------
  insert into public.business_hours (tenant_id, name, timezone, is_default)
  values (v_tenant, 'Default 9-5 Mon-Fri', 'Asia/Kolkata', true)
  on conflict (tenant_id, name) do nothing;

  select id into v_bh from public.business_hours
   where tenant_id = v_tenant and name = 'Default 9-5 Mon-Fri';

  ----------------------------------------------------------------------------
  -- Top-level categories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, 'it',          'IT',          'Hardware, software, network, account access', 'P3', 'agent'),
    (v_tenant, 'hr-it',       'HR-IT',       'Onboarding, offboarding handoffs',             'P3', 'agent'),
    (v_tenant, 'facilities',  'Facilities',  'Office space, power, utilities',               'P3', 'admin')
  on conflict (tenant_id, slug) do nothing;

  select id into v_it   from public.ticket_categories where tenant_id = v_tenant and slug = 'it';
  select id into v_hrit from public.ticket_categories where tenant_id = v_tenant and slug = 'hr-it';
  select id into v_fac  from public.ticket_categories where tenant_id = v_tenant and slug = 'facilities';

  ----------------------------------------------------------------------------
  -- IT subcategories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, v_it, 'it-hardware', 'Hardware', 'Laptops, peripherals, monitors',    'P3', 'agent'),
    (v_tenant, v_it, 'it-software', 'Software', 'Application installs, license keys','P3', 'agent'),
    (v_tenant, v_it, 'it-network',  'Network',  'VPN, wifi, internet, firewall',     'P2', 'agent'),
    (v_tenant, v_it, 'it-access',   'Access',   'Account access, password, MFA',     'P2', 'agent')
  on conflict (tenant_id, slug) do nothing;

  ----------------------------------------------------------------------------
  -- HR-IT subcategories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, v_hrit, 'hrit-onboarding',  'Onboarding',  'New joiner provisioning',     'P3', 'agent'),
    (v_tenant, v_hrit, 'hrit-offboarding', 'Offboarding', 'Leaver deprovisioning',       'P2', 'agent')
  on conflict (tenant_id, slug) do nothing;

  ----------------------------------------------------------------------------
  -- Facilities subcategories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, v_fac, 'fac-office',     'Office',     'Office space, seating, AC',        'P3', 'admin'),
    (v_tenant, v_fac, 'fac-power',      'Power',      'Power cuts, UPS, generator',        'P1', 'admin'),
    (v_tenant, v_fac, 'fac-utilities',  'Utilities',  'Water, cleaning, supplies',         'P4', 'admin')
  on conflict (tenant_id, slug) do nothing;

  ----------------------------------------------------------------------------
  -- Default SLA policies (category_id null => default for that priority)
  -- P1 = 15m response / 4h resolve
  -- P2 = 1h / 8h
  -- P3 = 4h / 24h
  -- P4 = 8h / 72h
  ----------------------------------------------------------------------------
  insert into public.sla_policies (tenant_id, category_id, priority, response_minutes, resolution_minutes, business_hours_id)
  values
    (v_tenant, null, 'P1', 15,   240,  v_bh),
    (v_tenant, null, 'P2', 60,   480,  v_bh),
    (v_tenant, null, 'P3', 240,  1440, v_bh),
    (v_tenant, null, 'P4', 480,  4320, v_bh)
  on conflict (tenant_id, category_id, priority) do nothing;
end $$;
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
-- ifBash Sprint 5 — pre-approved standard-change templates
-- A template carries a default task list + auto-approve flag. When a draft
-- change semantically matches a template at high confidence, the AI suggests
-- skipping CAB review.

create table if not exists public.change_templates (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references public.tenants(id) on delete cascade,
  slug                  text not null,
  name                  text not null,
  description           text,
  default_tasks         jsonb not null default '[]'::jsonb,
  auto_approve          boolean not null default true,
  risk_score_ceiling    numeric(4,3) not null default 0.300,
  is_active             boolean not null default true,
  last_used_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (tenant_id, slug),
  check (risk_score_ceiling >= 0 and risk_score_ceiling <= 1)
);
create index if not exists idx_change_templates_tenant on public.change_templates(tenant_id);
create index if not exists idx_change_templates_active on public.change_templates(tenant_id, is_active);

drop trigger if exists trg_change_templates_updated_at on public.change_templates;
create trigger trg_change_templates_updated_at
  before update on public.change_templates
  for each row execute function public.set_updated_at();

alter table public.change_templates enable row level security;

drop policy if exists change_templates_select on public.change_templates;
create policy change_templates_select on public.change_templates
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists change_templates_admin_write on public.change_templates;
create policy change_templates_admin_write on public.change_templates
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- Seed three standard templates for ifbash tenant
-- ============================================================================
do $$
declare v_tenant uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  insert into public.change_templates (tenant_id, slug, name, description, default_tasks, auto_approve, risk_score_ceiling)
  values
    (
      v_tenant,
      'password-reset-bulk',
      'Password reset bulk',
      'Bulk reset of expired passwords for a department or role group. Pre-approved when reset count is below 50 and no privileged accounts are included.',
      jsonb_build_array(
        jsonb_build_object('sequence', 1, 'title', 'Identify target accounts', 'est_minutes', 15),
        jsonb_build_object('sequence', 2, 'title', 'Run reset script in staging', 'est_minutes', 20),
        jsonb_build_object('sequence', 3, 'title', 'Run reset script in production', 'est_minutes', 30),
        jsonb_build_object('sequence', 4, 'title', 'Notify users via email', 'est_minutes', 10),
        jsonb_build_object('sequence', 5, 'title', 'Verify login for sample of users', 'est_minutes', 15)
      ),
      true,
      0.250
    ),
    (
      v_tenant,
      'server-reboot-scheduled',
      'Server reboot scheduled',
      'Scheduled reboot of a non-production server during the standard maintenance window. Pre-approved when scope is single host and no public-facing service.',
      jsonb_build_array(
        jsonb_build_object('sequence', 1, 'title', 'Notify dependent service owners', 'est_minutes', 10),
        jsonb_build_object('sequence', 2, 'title', 'Drain traffic if applicable', 'est_minutes', 15),
        jsonb_build_object('sequence', 3, 'title', 'Snapshot state', 'est_minutes', 10),
        jsonb_build_object('sequence', 4, 'title', 'Reboot host', 'est_minutes', 15),
        jsonb_build_object('sequence', 5, 'title', 'Verify service health post-reboot', 'est_minutes', 20)
      ),
      true,
      0.300
    ),
    (
      v_tenant,
      'dns-record-update',
      'DNS record update',
      'Add, modify or remove a DNS record in the corporate zone. Pre-approved for non-public-facing records and TTL >= 300s.',
      jsonb_build_array(
        jsonb_build_object('sequence', 1, 'title', 'Confirm record change with requester', 'est_minutes', 10),
        jsonb_build_object('sequence', 2, 'title', 'Apply change in DNS provider console', 'est_minutes', 10),
        jsonb_build_object('sequence', 3, 'title', 'Verify resolution from internal resolver', 'est_minutes', 10),
        jsonb_build_object('sequence', 4, 'title', 'Verify resolution from external resolver', 'est_minutes', 10),
        jsonb_build_object('sequence', 5, 'title', 'Document change in CMDB', 'est_minutes', 10)
      ),
      true,
      0.200
    )
  on conflict (tenant_id, slug) do nothing;
end $$;
-- ifBash Sprint 6 — knowledge base + pgvector semantic search
-- Powers: /kb browse, /kb/[slug], /faq, /policies, deflection, AI authoring.

-- ============================================================================
-- 0. Extensions
-- ============================================================================
create extension if not exists vector;

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.kb_state as enum ('draft','in_review','published','retired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.kb_view_source as enum ('search','ticket_form','faq_browse','direct','related');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. kb_categories — tree
-- ============================================================================
create table if not exists public.kb_categories (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  parent_id    uuid references public.kb_categories(id) on delete cascade,
  slug         text not null,
  name         text not null,
  description  text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_kb_categories_tenant on public.kb_categories(tenant_id);
create index if not exists idx_kb_categories_parent on public.kb_categories(parent_id);

drop trigger if exists trg_kb_categories_updated_at on public.kb_categories;
create trigger trg_kb_categories_updated_at
  before update on public.kb_categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. kb_articles
-- ============================================================================
create table if not exists public.kb_articles (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  slug              text not null,
  title             text not null,
  body              text not null default '',
  body_tiptap       jsonb,
  category_id       uuid references public.kb_categories(id) on delete set null,
  state             public.kb_state not null default 'draft',
  version           int not null default 1,
  embedding         vector(1536),
  helpful_count     int not null default 0,
  unhelpful_count   int not null default 0,
  tags              text[] not null default array[]::text[],
  author_id         uuid references public.profiles(id) on delete set null,
  reviewer_id       uuid references public.profiles(id) on delete set null,
  source_ticket_id  uuid references public.tickets(id) on delete set null,
  published_at      timestamptz,
  retired_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_kb_articles_tenant on public.kb_articles(tenant_id);
create index if not exists idx_kb_articles_category on public.kb_articles(category_id);
create index if not exists idx_kb_articles_author on public.kb_articles(author_id);

drop trigger if exists trg_kb_articles_updated_at on public.kb_articles;
create trigger trg_kb_articles_updated_at
  before update on public.kb_articles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. kb_article_versions — body history
-- ============================================================================
create table if not exists public.kb_article_versions (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  article_id      uuid not null references public.kb_articles(id) on delete cascade,
  version         int not null,
  title           text not null,
  body            text not null default '',
  body_tiptap     jsonb,
  changed_by      uuid references public.profiles(id) on delete set null,
  changed_at      timestamptz not null default now(),
  change_summary  text,
  unique (article_id, version)
);
create index if not exists idx_kb_article_versions_article on public.kb_article_versions(article_id, version desc);

-- ============================================================================
-- 5. kb_article_views — analytics
-- ============================================================================
create table if not exists public.kb_article_views (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  article_id  uuid not null references public.kb_articles(id) on delete cascade,
  viewer_id   uuid references public.profiles(id) on delete set null,
  source      public.kb_view_source not null default 'direct',
  at          timestamptz not null default now()
);
create index if not exists idx_kb_article_views_article on public.kb_article_views(article_id, at desc);
create index if not exists idx_kb_article_views_tenant on public.kb_article_views(tenant_id, at desc);

-- ============================================================================
-- 6. RLS — kb_categories
-- ============================================================================
alter table public.kb_categories enable row level security;

drop policy if exists kb_categories_select on public.kb_categories;
create policy kb_categories_select on public.kb_categories
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists kb_categories_admin_write on public.kb_categories;
create policy kb_categories_admin_write on public.kb_categories
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 7. RLS — kb_articles
--    published rows readable by all in tenant
--    drafts/in_review readable by author/reviewer/admin/owner/agent only
-- ============================================================================
create or replace function public.can_view_kb_drafts()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role in ('agent','admin','owner') from public.profiles where id = auth.uid()
$$;

alter table public.kb_articles enable row level security;

drop policy if exists kb_articles_select on public.kb_articles;
create policy kb_articles_select on public.kb_articles
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      state = 'published'
      or author_id = auth.uid()
      or reviewer_id = auth.uid()
      or public.can_view_kb_drafts()
    )
  );

drop policy if exists kb_articles_insert on public.kb_articles;
create policy kb_articles_insert on public.kb_articles
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and public.can_view_kb_drafts()
  );

drop policy if exists kb_articles_update on public.kb_articles;
create policy kb_articles_update on public.kb_articles
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (
      author_id = auth.uid()
      or reviewer_id = auth.uid()
      or public.is_admin_or_owner()
    )
  )
  with check (tenant_id = public.current_user_tenant());

drop policy if exists kb_articles_delete_admin on public.kb_articles;
create policy kb_articles_delete_admin on public.kb_articles
  for delete
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 8. RLS — kb_article_versions (read piggyback on article visibility)
-- ============================================================================
alter table public.kb_article_versions enable row level security;

drop policy if exists kb_article_versions_select on public.kb_article_versions;
create policy kb_article_versions_select on public.kb_article_versions
  for select
  using (
    tenant_id = public.current_user_tenant()
    and exists (
      select 1 from public.kb_articles a
       where a.id = kb_article_versions.article_id
         and (
           a.state = 'published'
           or a.author_id = auth.uid()
           or a.reviewer_id = auth.uid()
           or public.can_view_kb_drafts()
         )
    )
  );

-- ============================================================================
-- 9. RLS — kb_article_views (insert anyone in tenant; read admin/owner)
-- ============================================================================
alter table public.kb_article_views enable row level security;

drop policy if exists kb_article_views_insert on public.kb_article_views;
create policy kb_article_views_insert on public.kb_article_views
  for insert
  with check (tenant_id = public.current_user_tenant());

drop policy if exists kb_article_views_admin_select on public.kb_article_views;
create policy kb_article_views_admin_select on public.kb_article_views
  for select
  using (tenant_id = public.current_user_tenant() and public.can_view_kb_drafts());

-- ============================================================================
-- 10. Vote helpers — RPCs that bypass RLS to bump counters atomically
-- ============================================================================
create or replace function public.kb_vote_helpful(p_article uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.kb_articles
     set helpful_count = helpful_count + 1
   where id = p_article
     and tenant_id = public.current_user_tenant();
end;
$$;

create or replace function public.kb_vote_unhelpful(p_article uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.kb_articles
     set unhelpful_count = unhelpful_count + 1
   where id = p_article
     and tenant_id = public.current_user_tenant();
end;
$$;

revoke all on function public.kb_vote_helpful(uuid) from public;
revoke all on function public.kb_vote_unhelpful(uuid) from public;
grant execute on function public.kb_vote_helpful(uuid) to authenticated, service_role;
grant execute on function public.kb_vote_unhelpful(uuid) to authenticated, service_role;

-- ============================================================================
-- 11. Cosine similarity search RPC — service-role wrapper for tenant scoping
-- ============================================================================
create or replace function public.kb_search_published(
  p_tenant uuid,
  p_query vector(1536),
  p_limit int default 5
)
returns table (
  id uuid,
  slug text,
  title text,
  body text,
  category_id uuid,
  helpful_count int,
  similarity numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.slug, a.title, a.body, a.category_id, a.helpful_count,
         (1 - (a.embedding <=> p_query))::numeric as similarity
    from public.kb_articles a
   where a.tenant_id = p_tenant
     and a.state = 'published'
     and a.embedding is not null
   order by a.embedding <=> p_query
   limit greatest(p_limit, 1);
$$;

revoke all on function public.kb_search_published(uuid, vector, int) from public;
grant execute on function public.kb_search_published(uuid, vector, int) to authenticated, service_role;

-- ============================================================================
-- 12. Seed — 5 published articles for ifbash tenant
-- ============================================================================
do $$
declare
  v_tenant uuid;
  v_faq    uuid;
  v_it     uuid;
  v_access uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  -- Categories
  insert into public.kb_categories (tenant_id, slug, name, description, sort_order)
  values
    (v_tenant, 'faq',          'FAQ',          'Top frequently asked questions',          0),
    (v_tenant, 'it-support',   'IT support',   'Hardware, software, network, accounts',   1),
    (v_tenant, 'access',       'Access',       'Logins, passwords, MFA, VPN',             2),
    (v_tenant, 'incidents',    'Incidents',    'How to raise, escalate, resolve',         3),
    (v_tenant, 'self-service', 'Self service', 'Things you can do without raising a ticket', 4)
  on conflict (tenant_id, slug) do nothing;

  select id into v_faq    from public.kb_categories where tenant_id = v_tenant and slug = 'faq';
  select id into v_it     from public.kb_categories where tenant_id = v_tenant and slug = 'it-support';
  select id into v_access from public.kb_categories where tenant_id = v_tenant and slug = 'access';

  -- Articles
  insert into public.kb_articles (tenant_id, slug, title, body, category_id, state, published_at, tags)
  values
    (v_tenant, 'reset-outlook-password',
     'Reset your Outlook password',
     E'# Reset your Outlook password\n\nIf you cannot sign into Outlook, follow these steps:\n\n1. Go to portal.office.com.\n2. Click sign in and enter your work email.\n3. Click forgot my password.\n4. Choose verify by SMS or authenticator app.\n5. Enter the code, then set a new password that is at least 12 characters and includes a number, symbol, and upper case letter.\n6. Sign back into Outlook on your laptop. You may need to restart the app.\n\nIf you still cannot sign in after a reset, raise an IT ticket with category Access.',
     v_access, 'published', now(), array['outlook','password','email','reset']),
    (v_tenant, 'connect-to-office-vpn',
     'Connect to the office VPN',
     E'# Connect to the office VPN\n\nThe corporate VPN is required for accessing internal apps from outside the office network.\n\n1. Open the Cisco Secure Client on your laptop. If it is not installed, raise an IT ticket.\n2. Server address is vpn.ifbash.com.\n3. Enter your standard SSO credentials.\n4. Approve the multi factor push on your phone.\n5. Once connected the lock icon turns green.\n\nIf you see a certificate error, sign out, restart the laptop, and try again. Persistent failures should be raised to IT with category Network.',
     v_access, 'published', now(), array['vpn','cisco','remote','network']),
    (v_tenant, 'request-new-laptop',
     'Request a new laptop',
     E'# Request a new laptop\n\nLaptops are refreshed on a 3 year cycle or when there is a hardware fault that cannot be repaired.\n\n1. Open the service catalog and choose request asset.\n2. Pick laptop and select the model band that matches your role.\n3. Add a short justification, especially if requesting outside the standard refresh cycle.\n4. Submit. Your manager receives an approval request.\n5. Once approved, IT typically delivers within 5 business days.\n\nFor urgent replacement of a broken laptop, raise a P2 incident under IT, Hardware.',
     v_it, 'published', now(), array['laptop','hardware','asset','request']),
    (v_tenant, 'submit-a-p1-incident',
     'Submit a P1 incident',
     E'# Submit a P1 incident\n\nP1 means a full outage or business critical impact, for example multiple users blocked, security breach, or data loss.\n\n1. Open helpdesk and click new ticket.\n2. Set the title to a clear one line description, for example payroll system unreachable.\n3. Set priority to P1.\n4. Add description with what failed, when it started, who is affected, and what was changed before the failure.\n5. Submit. The on call agent is paged immediately and the SLA clock starts.\n\nDo not use P1 for single user issues. Those are P2 or P3 depending on impact.',
     v_faq, 'published', now(), array['p1','incident','outage','priority']),
    (v_tenant, 'self-service-wifi-access',
     'Self service Wi-Fi access',
     E'# Self service Wi-Fi access\n\nGuests and personal devices can join the open network without an IT ticket.\n\n1. Connect to ifbash-guest from your device Wi-Fi list.\n2. A captive portal opens. If it does not, browse to any http site.\n3. Enter your work email and accept the acceptable use policy.\n4. You are signed in for 24 hours. After that, repeat the steps to renew.\n\nFor work laptops you should be on ifbash-corp using SSO. Personal phones should stay on ifbash-guest.',
     v_faq, 'published', now(), array['wifi','guest','self-service','network'])
  on conflict (tenant_id, slug) do nothing;
end $$;
-- ifBash Sprint 6 — pgvector + analytics indexes
-- HNSW for fast cosine similarity over kb_articles.embedding.

-- HNSW index on the embedding (cosine ops). Built with sane defaults; tune later
-- once we have real corpus volume. Created concurrently is not used to keep this
-- migration runnable inside a transaction.
do $$
begin
  if not exists (
    select 1 from pg_indexes
     where schemaname = 'public'
       and tablename  = 'kb_articles'
       and indexname  = 'idx_kb_articles_embedding_hnsw'
  ) then
    execute 'create index idx_kb_articles_embedding_hnsw on public.kb_articles using hnsw (embedding vector_cosine_ops)';
  end if;
end $$;

-- Tenant + state filter (drives published-list reads + draft queues)
create index if not exists idx_kb_articles_tenant_state on public.kb_articles(tenant_id, state);

-- View analytics — group by source for deflection-rate KPI
create index if not exists idx_kb_article_views_article_source on public.kb_article_views(article_id, source);
-- ifBash Sprint 7 — surveys + responses
-- CSAT post-incident-resolved + post-change-done. Multi-target via related_type/related_id (no FK).

-- ============================================================================
-- 1. Enums
-- ============================================================================
do $$ begin
  create type public.survey_trigger as enum (
    'post_incident_resolved',
    'post_change_done',
    'scheduled',
    'manual'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.survey_related_type as enum ('ticket','change','none');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.survey_sentiment as enum ('positive','neutral','negative');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. surveys
-- questions JSONB shape: array of { id: string, type: 'rating'|'text'|'choice',
--   label: string, required: bool, options?: string[] }
-- ============================================================================
create table if not exists public.surveys (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  slug         text not null,
  name         text not null,
  description  text,
  trigger      public.survey_trigger not null default 'manual',
  questions    jsonb not null default '[]'::jsonb,
  active       boolean not null default true,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_surveys_tenant on public.surveys(tenant_id);
create index if not exists idx_surveys_trigger on public.surveys(tenant_id, trigger) where active = true;

drop trigger if exists trg_surveys_updated_at on public.surveys;
create trigger trg_surveys_updated_at
  before update on public.surveys
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. survey_responses
-- related_id has no FK (multi-target: ticket OR change OR none)
-- ============================================================================
create table if not exists public.survey_responses (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  survey_id      uuid not null references public.surveys(id) on delete cascade,
  respondent_id  uuid references public.profiles(id) on delete set null,
  related_type   public.survey_related_type not null default 'none',
  related_id     uuid,
  score          int check (score is null or (score between 1 and 5)),
  answers        jsonb not null default '{}'::jsonb,
  comments       text,
  ai_sentiment   public.survey_sentiment,
  ai_themes      text[],
  ai_confidence  numeric(4,3),
  ai_processed_at timestamptz,
  submitted_at   timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists idx_survey_responses_tenant on public.survey_responses(tenant_id);
create index if not exists idx_survey_responses_survey on public.survey_responses(survey_id, submitted_at desc);
create index if not exists idx_survey_responses_respondent on public.survey_responses(respondent_id, submitted_at desc);
create index if not exists idx_survey_responses_related on public.survey_responses(tenant_id, related_type, related_id);
create index if not exists idx_survey_responses_pending_ai on public.survey_responses(tenant_id) where ai_sentiment is null and submitted_at is not null;

-- ============================================================================
-- 4. RLS — surveys
-- Read: anyone in tenant (responders need to see active surveys).
-- Write: admin/owner.
-- ============================================================================
alter table public.surveys enable row level security;

drop policy if exists surveys_select on public.surveys;
create policy surveys_select on public.surveys
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists surveys_admin_write on public.surveys;
create policy surveys_admin_write on public.surveys
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 5. RLS — survey_responses
-- Respondent reads own. Admin/owner reads all in tenant.
-- Agents read responses tied to tickets they are assigned to.
-- ============================================================================
alter table public.survey_responses enable row level security;

drop policy if exists survey_responses_select_own on public.survey_responses;
create policy survey_responses_select_own on public.survey_responses
  for select
  using (
    tenant_id = public.current_user_tenant()
    and (
      respondent_id = auth.uid()
      or public.is_admin_or_owner()
      or (
        related_type = 'ticket'
        and exists (
          select 1 from public.tickets t
           where t.id = survey_responses.related_id
             and t.assignee_id = auth.uid()
        )
      )
    )
  );

drop policy if exists survey_responses_insert_self on public.survey_responses;
create policy survey_responses_insert_self on public.survey_responses
  for insert
  with check (
    tenant_id = public.current_user_tenant()
    and (respondent_id = auth.uid() or respondent_id is null)
  );

drop policy if exists survey_responses_update_self on public.survey_responses;
create policy survey_responses_update_self on public.survey_responses
  for update
  using (
    tenant_id = public.current_user_tenant()
    and (respondent_id = auth.uid() or public.is_admin_or_owner())
  )
  with check (tenant_id = public.current_user_tenant());

-- ============================================================================
-- 6. Seed default post-resolution CSAT for ifbash tenant (idempotent)
-- ============================================================================
do $$
declare
  v_tenant uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  insert into public.surveys (tenant_id, slug, name, description, trigger, questions, active)
  values (
    v_tenant,
    'post-resolution-csat',
    'Post-resolution CSAT',
    'Quick three-question survey sent when an incident is resolved.',
    'post_incident_resolved',
    jsonb_build_array(
      jsonb_build_object(
        'id', 'overall',
        'type', 'rating',
        'label', 'How satisfied were you?',
        'required', true
      ),
      jsonb_build_object(
        'id', 'worked_well',
        'type', 'text',
        'label', 'What worked well?',
        'required', false
      ),
      jsonb_build_object(
        'id', 'better',
        'type', 'text',
        'label', 'What could be better?',
        'required', false
      )
    ),
    true
  )
  on conflict (tenant_id, slug) do nothing;
end $$;
-- ifBash Sprint 7 — KPI views for the reports dashboard.
-- All views are SECURITY INVOKER so RLS on underlying tables propagates.
-- Views read-only by design; no DML granted.

-- ============================================================================
-- 1. Daily ticket volume per category (last 90d)
-- ============================================================================
create or replace view public.v_ticket_volume_daily
with (security_invoker = true) as
select
  t.tenant_id,
  date_trunc('day', t.created_at)::date           as day,
  t.category_id,
  c.slug                                          as category_slug,
  c.name                                          as category_name,
  count(*)::int                                   as ticket_count
from public.tickets t
left join public.ticket_categories c on c.id = t.category_id
where t.created_at >= now() - interval '90 days'
group by t.tenant_id, day, t.category_id, c.slug, c.name;

-- ============================================================================
-- 2. Resolution time (MTTR) per category × priority (last 90d)
-- ============================================================================
create or replace view public.v_ticket_resolution_time
with (security_invoker = true) as
select
  t.tenant_id,
  t.category_id,
  c.slug                                          as category_slug,
  c.name                                          as category_name,
  t.priority,
  count(*) filter (where t.resolved_at is not null)::int                                as resolved_count,
  avg(extract(epoch from (t.resolved_at - t.created_at))/60)
    filter (where t.resolved_at is not null)::numeric(10,2)                              as avg_minutes,
  percentile_cont(0.5) within group (order by extract(epoch from (t.resolved_at - t.created_at))/60)
    filter (where t.resolved_at is not null)::numeric(10,2)                              as median_minutes,
  percentile_cont(0.9) within group (order by extract(epoch from (t.resolved_at - t.created_at))/60)
    filter (where t.resolved_at is not null)::numeric(10,2)                              as p90_minutes
from public.tickets t
left join public.ticket_categories c on c.id = t.category_id
where t.created_at >= now() - interval '90 days'
group by t.tenant_id, t.category_id, c.slug, c.name, t.priority;

-- ============================================================================
-- 3. First-contact resolution: tickets resolved with <= 2 non-system comments
-- ============================================================================
create or replace view public.v_first_contact_resolution
with (security_invoker = true) as
with comment_counts as (
  select
    tc.tenant_id,
    tc.ticket_id,
    count(*) filter (where tc.kind = 'comment')::int as comment_count
  from public.ticket_comments tc
  group by tc.tenant_id, tc.ticket_id
)
select
  t.tenant_id,
  t.category_id,
  c.slug                                                as category_slug,
  c.name                                                as category_name,
  count(*) filter (where t.state in ('resolved','closed'))::int                          as resolved_count,
  count(*) filter (
    where t.state in ('resolved','closed')
      and coalesce(cc.comment_count, 0) <= 2
  )::int                                                                                  as fcr_count,
  case
    when count(*) filter (where t.state in ('resolved','closed')) = 0 then 0
    else round(
      100.0 * count(*) filter (
        where t.state in ('resolved','closed')
          and coalesce(cc.comment_count, 0) <= 2
      ) / count(*) filter (where t.state in ('resolved','closed')),
      2
    )
  end::numeric(5,2)                                                                        as fcr_pct
from public.tickets t
left join public.ticket_categories c on c.id = t.category_id
left join comment_counts cc on cc.ticket_id = t.id
where t.created_at >= now() - interval '90 days'
group by t.tenant_id, t.category_id, c.slug, c.name;

-- ============================================================================
-- 4. SLA compliance % per category × priority (last 90d)
-- ============================================================================
create or replace view public.v_sla_compliance
with (security_invoker = true) as
select
  t.tenant_id,
  t.category_id,
  c.slug                                                as category_slug,
  c.name                                                as category_name,
  t.priority,
  count(*)::int                                         as total,
  count(*) filter (where t.sla_breached = false)::int   as met,
  case
    when count(*) = 0 then 100
    else round(100.0 * count(*) filter (where t.sla_breached = false) / count(*), 2)
  end::numeric(5,2)                                      as compliance_pct
from public.tickets t
left join public.ticket_categories c on c.id = t.category_id
where t.created_at >= now() - interval '90 days'
group by t.tenant_id, t.category_id, c.slug, c.name, t.priority;

-- ============================================================================
-- 5. Auto-resolve rate (AI-driven closures)
-- ============================================================================
create or replace view public.v_auto_resolve_rate
with (security_invoker = true) as
select
  t.tenant_id,
  count(*)::int                                                                          as total,
  count(*) filter (
    where t.ai_classification ? 'auto_resolved'
      and (t.ai_classification->>'auto_resolved')::boolean = true
  )::int                                                                                  as auto_resolved,
  case
    when count(*) = 0 then 0
    else round(
      100.0 * count(*) filter (
        where t.ai_classification ? 'auto_resolved'
          and (t.ai_classification->>'auto_resolved')::boolean = true
      ) / count(*),
      2
    )
  end::numeric(5,2)                                                                       as auto_resolve_pct
from public.tickets t
where t.created_at >= now() - interval '30 days'
group by t.tenant_id;

-- ============================================================================
-- 6. Deflection rate proxy
-- KB views from ticket form vs new ticket creates (last 30d).
-- If kb_article_views table not yet created (Sprint 6), view returns 0 for views.
-- ============================================================================
do $$
begin
  if not exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'kb_article_views'
  ) then
    create table public.kb_article_views (
      id           uuid primary key default gen_random_uuid(),
      tenant_id    uuid not null references public.tenants(id) on delete cascade,
      article_id   uuid,
      user_id      uuid references public.profiles(id) on delete set null,
      source       text,
      at           timestamptz not null default now()
    );
    alter table public.kb_article_views enable row level security;
    create policy kb_article_views_select on public.kb_article_views
      for select using (tenant_id = public.current_user_tenant());
    create policy kb_article_views_insert on public.kb_article_views
      for insert with check (tenant_id = public.current_user_tenant());
  end if;
end $$;

create or replace view public.v_deflection_rate
with (security_invoker = true) as
with views as (
  select tenant_id, count(*)::int as deflections
    from public.kb_article_views
   where source = 'ticket_form'
     and at >= now() - interval '30 days'
   group by tenant_id
),
opens as (
  select tenant_id, count(*)::int as form_submits
    from public.tickets
   where source = 'portal'
     and created_at >= now() - interval '30 days'
   group by tenant_id
)
select
  coalesce(v.tenant_id, o.tenant_id)              as tenant_id,
  coalesce(v.deflections, 0)                      as deflections,
  coalesce(o.form_submits, 0)                     as form_submits,
  case
    when coalesce(v.deflections, 0) + coalesce(o.form_submits, 0) = 0 then 0
    else round(
      100.0 * coalesce(v.deflections, 0)
        / (coalesce(v.deflections, 0) + coalesce(o.form_submits, 0)),
      2
    )
  end::numeric(5,2)                                as deflection_pct
from views v
full outer join opens o on o.tenant_id = v.tenant_id;

-- ============================================================================
-- 7. AI cost per resolved ticket (last 30d)
-- ============================================================================
create or replace view public.v_ai_cost_per_resolved
with (security_invoker = true) as
with ai as (
  select tenant_id, sum(cost_usd)::numeric(12,4) as ai_spend_usd
    from public.ai_actions
   where outcome = 'success'
     and at >= now() - interval '30 days'
   group by tenant_id
),
res as (
  select tenant_id, count(*)::int as resolved_count
    from public.tickets
   where resolved_at >= now() - interval '30 days'
   group by tenant_id
)
select
  coalesce(ai.tenant_id, res.tenant_id)           as tenant_id,
  coalesce(ai.ai_spend_usd, 0)                    as ai_spend_usd,
  coalesce(res.resolved_count, 0)                 as resolved_count,
  case
    when coalesce(res.resolved_count, 0) = 0 then 0
    else round(coalesce(ai.ai_spend_usd, 0) / res.resolved_count, 4)
  end::numeric(12,4)                               as cost_per_resolved_usd
from ai
full outer join res on res.tenant_id = ai.tenant_id;

-- ============================================================================
-- 8. CSAT trend (avg score per ISO week, last 12 weeks)
-- ============================================================================
create or replace view public.v_csat_trend
with (security_invoker = true) as
select
  sr.tenant_id,
  date_trunc('week', sr.submitted_at)::date       as week,
  count(*) filter (where sr.score is not null)::int                                       as response_count,
  avg(sr.score) filter (where sr.score is not null)::numeric(4,2)                          as avg_score,
  count(*) filter (where sr.ai_sentiment = 'positive')::int                                as positive_count,
  count(*) filter (where sr.ai_sentiment = 'neutral')::int                                 as neutral_count,
  count(*) filter (where sr.ai_sentiment = 'negative')::int                                as negative_count
from public.survey_responses sr
where sr.submitted_at is not null
  and sr.submitted_at >= now() - interval '12 weeks'
group by sr.tenant_id, week;

-- ============================================================================
-- 9. Grants — read-only via authenticated role; RLS enforced at base tables
-- ============================================================================
grant select on public.v_ticket_volume_daily      to authenticated;
grant select on public.v_ticket_resolution_time   to authenticated;
grant select on public.v_first_contact_resolution to authenticated;
grant select on public.v_sla_compliance           to authenticated;
grant select on public.v_auto_resolve_rate        to authenticated;
grant select on public.v_deflection_rate          to authenticated;
grant select on public.v_ai_cost_per_resolved     to authenticated;
grant select on public.v_csat_trend               to authenticated;
-- ifBash Sprint 8 — workplace profile extensions
-- Adds ITSM directory + locale fields to profiles. NOT HR/payroll.

alter table public.profiles
  add column if not exists location text,
  add column if not exists locale text not null default 'en',
  add column if not exists about text,
  add column if not exists joined_at date;

-- department, job_title, manager_id, avatar_url already in 001_foundation.sql
-- Add fresh indexes for directory + org-chart queries.
create index if not exists idx_profiles_tenant_dept on public.profiles(tenant_id, department);
create index if not exists idx_profiles_manager_self on public.profiles(manager_id) where manager_id is not null;
-- ifBash Sprint 8 — workplace surface
-- Announcements, kudos, FAQs, anonymous feedback. Tenant-scoped, RLS enforced.

-- ============================================================================
-- 1. announcements
-- ============================================================================
create table if not exists public.announcements (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  title           text not null,
  body_md         text not null default '',
  -- per-locale translated bodies: { "hi": "...", "te": "..." }
  body_translated jsonb not null default '{}'::jsonb,
  -- audience: { "all": true } | { "departments": [..], "roles": [..], "user_ids": [..] }
  audience        jsonb not null default jsonb_build_object('all', true),
  category        text not null default 'general',
  pinned          boolean not null default false,
  published_at    timestamptz,
  expires_at      timestamptz,
  author_id       uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_announcements_tenant on public.announcements(tenant_id, published_at desc);
create index if not exists idx_announcements_active on public.announcements(tenant_id, pinned desc, published_at desc) where published_at is not null and (expires_at is null or expires_at > now());

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. announcement_reads
-- ============================================================================
create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (announcement_id, user_id)
);
create index if not exists idx_announcement_reads_user on public.announcement_reads(user_id);

-- ============================================================================
-- 3. kudos
-- ============================================================================
create table if not exists public.kudos (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null references public.tenants(id) on delete cascade,
  from_user_id           uuid not null references public.profiles(id) on delete cascade,
  to_user_id             uuid not null references public.profiles(id) on delete cascade,
  message                text not null,
  public                 boolean not null default true,
  ai_categorized_value   text,
  at                     timestamptz not null default now(),
  check (from_user_id <> to_user_id),
  check (length(message) between 1 and 500)
);
create index if not exists idx_kudos_tenant_at on public.kudos(tenant_id, at desc);
create index if not exists idx_kudos_to on public.kudos(to_user_id, at desc);
create index if not exists idx_kudos_from on public.kudos(from_user_id, at desc);

-- ============================================================================
-- 4. faqs
-- ============================================================================
create table if not exists public.faqs (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  slug              text not null,
  question          text not null,
  answer_md         text not null default '',
  category          text not null default 'general',
  sort_order        int not null default 100,
  helpful_count     int not null default 0,
  unhelpful_count   int not null default 0,
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_faqs_tenant_published on public.faqs(tenant_id, published, sort_order);

drop trigger if exists trg_faqs_updated_at on public.faqs;
create trigger trg_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. anonymous_feedback
-- ============================================================================
do $$ begin
  create type public.feedback_category as enum ('suggestion','complaint','praise','bug');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.feedback_sentiment as enum ('positive','neutral','negative');
exception when duplicate_object then null; end $$;

create table if not exists public.anonymous_feedback (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  body            text not null,
  category        public.feedback_category not null default 'suggestion',
  ai_sentiment    public.feedback_sentiment,
  submitted_at    timestamptz not null default now(),
  check (length(body) between 1 and 4000)
);
create index if not exists idx_anon_feedback_tenant on public.anonymous_feedback(tenant_id, submitted_at desc);

-- ============================================================================
-- 6. RLS — announcements (everyone in tenant reads; admin/owner writes)
-- ============================================================================
alter table public.announcements enable row level security;

drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_admin_write on public.announcements
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 7. RLS — announcement_reads (self only)
-- ============================================================================
alter table public.announcement_reads enable row level security;

drop policy if exists announcement_reads_self on public.announcement_reads;
create policy announcement_reads_self on public.announcement_reads
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- 8. RLS — kudos (public visible to tenant; private only to from/to)
-- ============================================================================
alter table public.kudos enable row level security;

drop policy if exists kudos_select on public.kudos;
create policy kudos_select on public.kudos
  for select using (
    tenant_id = public.current_user_tenant()
    and (
      public = true
      or from_user_id = auth.uid()
      or to_user_id = auth.uid()
      or public.is_admin_or_owner()
    )
  );

drop policy if exists kudos_insert_self on public.kudos;
create policy kudos_insert_self on public.kudos
  for insert with check (
    tenant_id = public.current_user_tenant()
    and from_user_id = auth.uid()
  );

drop policy if exists kudos_delete_self on public.kudos;
create policy kudos_delete_self on public.kudos
  for delete using (
    tenant_id = public.current_user_tenant()
    and (from_user_id = auth.uid() or public.is_admin_or_owner())
  );

-- ============================================================================
-- 9. RLS — faqs (read all in tenant; admin/owner writes)
-- ============================================================================
alter table public.faqs enable row level security;

drop policy if exists faqs_select on public.faqs;
create policy faqs_select on public.faqs
  for select using (tenant_id = public.current_user_tenant());

drop policy if exists faqs_admin_write on public.faqs;
create policy faqs_admin_write on public.faqs
  for all
  using (tenant_id = public.current_user_tenant() and public.is_admin_or_owner())
  with check (tenant_id = public.current_user_tenant() and public.is_admin_or_owner());

-- ============================================================================
-- 10. RLS — anonymous_feedback (anyone in tenant inserts; admin/owner reads)
-- ============================================================================
alter table public.anonymous_feedback enable row level security;

drop policy if exists anon_feedback_insert on public.anonymous_feedback;
create policy anon_feedback_insert on public.anonymous_feedback
  for insert with check (tenant_id = public.current_user_tenant());

drop policy if exists anon_feedback_select_admin on public.anonymous_feedback;
create policy anon_feedback_select_admin on public.anonymous_feedback
  for select using (
    tenant_id = public.current_user_tenant()
    and public.is_admin_or_owner()
  );

-- ============================================================================
-- 11. Seed — 5 sample FAQs + 1 announcement (per tenant via fn)
-- ============================================================================
create or replace function public.seed_workplace(p_tenant uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.faqs (tenant_id, slug, question, answer_md, category, sort_order)
  values
    (p_tenant, 'report-it-issue', 'How do I report an IT issue?',
     'Go to Helpdesk and click New ticket. Describe the issue and pick a category. Our team triages within one business hour.',
     'support', 10),
    (p_tenant, 'support-email', 'Where is the ifBash support email?',
     'Reach the desk at service@ifbash.com. Tickets you raise here are tracked in Helpdesk.',
     'support', 20),
    (p_tenant, 'vpn', 'What VPN do we use?',
     'The corporate VPN client is provisioned on your work laptop. If you cannot connect, raise a ticket under Network.',
     'access', 30),
    (p_tenant, 'kb-access', 'How do I access the knowledge base?',
     'Open the Knowledge tab in the sidebar. Search returns relevant articles ranked by similarity.',
     'support', 40),
    (p_tenant, 'it-contact', 'Who is my IT contact?',
     'Your assigned agent appears on every ticket detail page. For urgent items, raise a P1 ticket.',
     'support', 50)
  on conflict (tenant_id, slug) do nothing;

  insert into public.announcements (tenant_id, title, body_md, category, pinned, published_at, audience)
  select p_tenant,
         'Welcome to ifBash ITSM portal',
         'You can raise tickets, request services, browse the knowledge base, and connect with your team here. Have feedback? Use the anonymous feedback form.',
         'company',
         true,
         now(),
         jsonb_build_object('all', true)
  where not exists (
    select 1 from public.announcements
     where tenant_id = p_tenant and title = 'Welcome to ifBash ITSM portal'
  );
end;
$$;

revoke all on function public.seed_workplace(uuid) from public;
grant execute on function public.seed_workplace(uuid) to authenticated, service_role;

-- Seed for the default tenant
do $$
declare v_tenant uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is not null then
    perform public.seed_workplace(v_tenant);
  end if;
end $$;
