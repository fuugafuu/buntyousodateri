create table if not exists public.mofumori_auth_limits(
  bucket text primary key,window_start timestamptz not null default now(),attempts integer not null default 0
);
alter table public.mofumori_auth_limits enable row level security;
revoke all on table public.mofumori_auth_limits from anon,authenticated;
grant all on table public.mofumori_auth_limits to service_role;
create or replace function public.mofumori_take_auth_limit(p_bucket text,p_window_seconds integer,p_limit integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare now_ts timestamptz:=now(); r public.mofumori_auth_limits%rowtype;
begin
  insert into public.mofumori_auth_limits(bucket,window_start,attempts) values(p_bucket,now_ts,1)
  on conflict(bucket) do update set
    window_start=case when public.mofumori_auth_limits.window_start+make_interval(secs=>p_window_seconds)<=now_ts then now_ts else public.mofumori_auth_limits.window_start end,
    attempts=case when public.mofumori_auth_limits.window_start+make_interval(secs=>p_window_seconds)<=now_ts then 1 else public.mofumori_auth_limits.attempts+1 end
  returning * into r;
  return r.attempts<=p_limit;
end $$;
revoke all on function public.mofumori_take_auth_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.mofumori_take_auth_limit(text,integer,integer) to service_role;
