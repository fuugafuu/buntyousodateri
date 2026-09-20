create table if not exists public.mofumori_admin_audit(
  id uuid primary key default gen_random_uuid(),
  admin_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  action text not null,
  target text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.mofumori_admin_audit enable row level security;
revoke all on public.mofumori_admin_audit from public,anon,authenticated;
grant select,insert on public.mofumori_admin_audit to service_role;
create index if not exists mofumori_admin_audit_created_idx on public.mofumori_admin_audit(created_at desc);

create or replace function public.mofumori_admin_log(
  p_admin text,
  p_action text,
  p_target text default null,
  p_detail jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare new_id uuid;
begin
  if not exists(select 1 from public.mofumori_admins where user_key=p_admin and role in ('admin','owner')) then
    raise exception 'admin_forbidden';
  end if;
  insert into public.mofumori_admin_audit(admin_key,action,target,detail)
  values(p_admin,left(coalesce(p_action,''),80),left(coalesce(p_target,''),120),coalesce(p_detail,'{}'::jsonb))
  returning id into new_id;
  return new_id;
end $$;
revoke all on function public.mofumori_admin_log(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.mofumori_admin_log(text,text,text,jsonb) to service_role;
