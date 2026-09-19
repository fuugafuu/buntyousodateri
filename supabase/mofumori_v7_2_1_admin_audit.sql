create table if not exists public.mofumori_admin_audit(
  id uuid primary key default gen_random_uuid(),
  admin_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  action text not null,target text,detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.mofumori_admin_audit enable row level security;
revoke all on public.mofumori_admin_audit from public,anon,authenticated;
grant all on public.mofumori_admin_audit to service_role;
create index if not exists mofumori_admin_audit_created_idx on public.mofumori_admin_audit(created_at desc);
