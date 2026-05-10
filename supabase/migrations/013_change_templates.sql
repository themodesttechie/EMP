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
