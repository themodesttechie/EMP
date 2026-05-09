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
