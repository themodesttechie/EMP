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
