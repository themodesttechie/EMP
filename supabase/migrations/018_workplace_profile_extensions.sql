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
