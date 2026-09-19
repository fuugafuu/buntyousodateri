create table if not exists public.mofumori_admins (
  user_key text primary key references public.mofumori_profiles(user_key) on delete cascade,
  role text not null default 'admin' check (role in ('admin','owner')),
  permissions jsonb not null default '{"gacha":true,"economy":true,"content":true,"debug":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mofumori_admins enable row level security;
revoke all on public.mofumori_admins from public,anon,authenticated;
grant select,insert,update,delete on public.mofumori_admins to service_role;

insert into public.mofumori_admins(user_key,role,permissions)
select user_key,'owner','{"gacha":true,"economy":true,"content":true,"debug":true}'::jsonb
from public.mofumori_profiles
where player_id='MF-5DB84402'
on conflict(user_key) do update set
  role='owner',
  permissions=excluded.permissions,
  updated_at=now();
