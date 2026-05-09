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
