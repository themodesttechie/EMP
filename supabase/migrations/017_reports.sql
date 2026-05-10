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
