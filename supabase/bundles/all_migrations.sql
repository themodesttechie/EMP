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
