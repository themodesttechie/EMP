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
