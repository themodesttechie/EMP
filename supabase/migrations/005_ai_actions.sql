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
