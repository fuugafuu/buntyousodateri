-- Mofumori v7.3.4 background Web Push
create extension if not exists pg_net;
create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create table if not exists public.mofumori_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  preferences jsonb not null default '{"lifecycle":true,"visits":true,"social":true,"arena":true,"gifts":true}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_success_at timestamptz,
  failure_count integer not null default 0,
  disabled_at timestamptz
);

create index if not exists mofumori_push_subscriptions_user_enabled_idx
  on public.mofumori_push_subscriptions(user_key,enabled)
  where disabled_at is null;

alter table public.mofumori_push_subscriptions enable row level security;
revoke all on table public.mofumori_push_subscriptions from anon, authenticated;

create table if not exists public.mofumori_push_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  subscription_id uuid not null references public.mofumori_push_subscriptions(id) on delete cascade,
  event_key text not null,
  event_type text not null,
  status text not null default 'sent' check(status in ('sent','failed')),
  error text,
  sent_at timestamptz not null default now(),
  unique(subscription_id,event_key)
);

create index if not exists mofumori_push_deliveries_user_sent_idx
  on public.mofumori_push_deliveries(user_key,sent_at desc);

alter table public.mofumori_push_deliveries enable row level security;
revoke all on table public.mofumori_push_deliveries from anon, authenticated;

create or replace function public.mofumori_push_secret(p_name text)
returns text
language sql
security definer
set search_path=''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name=p_name
  limit 1
$$;

revoke execute on function public.mofumori_push_secret(text) from public, anon, authenticated;
grant execute on function public.mofumori_push_secret(text) to service_role;

select cron.schedule(
  'mofumori-push-delivery-cleanup',
  '17 3 * * *',
  $$delete from public.mofumori_push_deliveries where sent_at < now() - interval '45 days'$$
);
