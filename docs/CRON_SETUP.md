# Cron setup — Supabase pg_cron (Hobby Vercel limitation)

Vercel Hobby plan caps cron at 2 daily jobs. ifBash needs 5 sub-daily jobs (SLA tick every minute, embed-pending every 10 min, sentiment every 15 min, translate every 30 min, stale-CI weekly). Solution: schedule via Supabase `pg_cron`, which calls the Vercel routes via `pg_net` HTTP.

## Prerequisites

In Supabase SQL editor (`https://supabase.com/dashboard/project/fkimfpvgysgqsteyggyx/sql/new`):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
```

Grant Studio user usage if needed (typically enabled by default on Pro / Free with extension toggle).

## Schedule jobs

Replace `<APP_HOST>` with `https://app.ifbash.com` and `<CRON_SECRET>` with the value stored in Vercel env (also in `scripts/vercel-cdp/.secrets-generated` locally after env push).

```sql
-- 1. SLA tick every minute
select cron.schedule(
  'sla-tick',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://app.ifbash.com/api/cron/sla-tick',
    headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>','Content-Type','application/json'),
    body := '{}'::jsonb
  );
  $$
);

-- 2. Embed pending KB articles every 10 min
select cron.schedule(
  'embed-pending',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := 'https://app.ifbash.com/api/cron/embed-pending',
    headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>','Content-Type','application/json'),
    body := '{}'::jsonb
  );
  $$
);

-- 3. Survey response sentiment every 15 min
select cron.schedule(
  'sentiment-pending',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://app.ifbash.com/api/cron/sentiment-pending',
    headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>','Content-Type','application/json'),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Announcement translate pending every 30 min
select cron.schedule(
  'translate-pending',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://app.ifbash.com/api/cron/translate-pending',
    headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>','Content-Type','application/json'),
    body := '{}'::jsonb
  );
  $$
);

-- 5. Stale CI scan weekly Mon 09:00 UTC
select cron.schedule(
  'stale-ci-scan',
  '0 9 * * 1',
  $$
  select net.http_post(
    url := 'https://app.ifbash.com/api/cron/stale-ci-scan',
    headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>','Content-Type','application/json'),
    body := '{}'::jsonb
  );
  $$
);
```

## Verify

```sql
select jobid, jobname, schedule, active from cron.job;
select * from cron.job_run_details order by start_time desc limit 20;
```

## Pause / unschedule

```sql
select cron.unschedule('sla-tick');
```

## Why not Vercel Cron?

Hobby plan limit = 2 daily jobs. ifBash needs 5 sub-daily. Two paths to switch back:
1. Upgrade Vercel project to Pro ($20/mo) and restore `vercel.json` crons
2. Stay on pg_cron (free, runs in DB, no extra hop)

pg_cron is simpler operationally — secrets live in one place (Vercel env), Supabase calls in. Recommended Phase 1.
