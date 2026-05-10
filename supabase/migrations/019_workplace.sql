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
create index if not exists idx_announcements_active on public.announcements(tenant_id, pinned desc, published_at desc) where published_at is not null;

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
