-- v7 local accounts + server progression
create table if not exists public.mofumori_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  password_salt text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.mofumori_accounts enable row level security;
revoke all on table public.mofumori_accounts from anon, authenticated;
grant all on table public.mofumori_accounts to service_role;

alter table public.mofumori_profiles
  add column if not exists forest_xp bigint not null default 0,
  add column if not exists care_streak integer not null default 0,
  add column if not exists last_active_date date,
  add column if not exists daily_date date,
  add column if not exists daily_care integer not null default 0,
  add column if not exists daily_play integer not null default 0,
  add column if not exists daily_train integer not null default 0,
  add column if not exists daily_battle integer not null default 0,
  add column if not exists daily_visit integer not null default 0,
  add column if not exists daily_gacha integer not null default 0,
  add column if not exists daily_claims jsonb not null default '{}'::jsonb;

create or replace function public.mofumori_progress_event(p_user text,p_event text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare today_jst date := (now() at time zone 'Asia/Tokyo')::date; xp_gain integer := 0; r public.mofumori_profiles%rowtype;
begin
  if p_event not in ('care','play','train','battle','visit','gacha') then raise exception 'invalid_progress_event'; end if;
  update public.mofumori_profiles set
    daily_date=case when daily_date is distinct from today_jst then today_jst else daily_date end,
    daily_care=case when daily_date is distinct from today_jst then 0 else daily_care end,
    daily_play=case when daily_date is distinct from today_jst then 0 else daily_play end,
    daily_train=case when daily_date is distinct from today_jst then 0 else daily_train end,
    daily_battle=case when daily_date is distinct from today_jst then 0 else daily_battle end,
    daily_visit=case when daily_date is distinct from today_jst then 0 else daily_visit end,
    daily_gacha=case when daily_date is distinct from today_jst then 0 else daily_gacha end,
    daily_claims=case when daily_date is distinct from today_jst then '{}'::jsonb else daily_claims end
  where user_key=p_user;
  xp_gain:=case p_event when 'care' then 6 when 'play' then 8 when 'train' then 10 when 'battle' then 20 when 'visit' then 12 when 'gacha' then 5 else 0 end;
  update public.mofumori_profiles set
    forest_xp=forest_xp+xp_gain,
    care_streak=case when last_active_date is null then 1 when last_active_date=today_jst then care_streak when last_active_date=today_jst-1 then care_streak+1 else 1 end,
    last_active_date=today_jst,daily_date=today_jst,
    daily_care=daily_care+case when p_event='care' then 1 else 0 end,
    daily_play=daily_play+case when p_event='play' then 1 else 0 end,
    daily_train=daily_train+case when p_event='train' then 1 else 0 end,
    daily_battle=daily_battle+case when p_event='battle' then 1 else 0 end,
    daily_visit=daily_visit+case when p_event='visit' then 1 else 0 end,
    daily_gacha=daily_gacha+case when p_event='gacha' then 1 else 0 end,
    updated_at=now()
  where user_key=p_user returning * into r;
  return jsonb_build_object('xp',r.forest_xp,'level',floor(sqrt(greatest(r.forest_xp,0)::numeric/75))+1,'streak',r.care_streak,
    'daily',jsonb_build_object('care',r.daily_care,'play',r.daily_play,'train',r.daily_train,'battle',r.daily_battle,'visit',r.daily_visit,'gacha',r.daily_gacha,'claims',r.daily_claims));
end $$;

create or replace function public.mofumori_claim_daily_goal(p_user text,p_goal text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare today_jst date := (now() at time zone 'Asia/Tokyo')::date; r public.mofumori_profiles%rowtype; reward integer; complete boolean:=false;
begin
  select * into r from public.mofumori_profiles where user_key=p_user for update;
  if r.user_key is null then raise exception 'profile_missing'; end if;
  if r.daily_date is distinct from today_jst then
    update public.mofumori_profiles set daily_date=today_jst,daily_care=0,daily_play=0,daily_train=0,daily_battle=0,daily_visit=0,daily_gacha=0,daily_claims='{}'::jsonb
    where user_key=p_user returning * into r;
  end if;
  if coalesce((r.daily_claims->>p_goal)::boolean,false) then raise exception 'already_claimed'; end if;
  if p_goal='care3' then complete:=r.daily_care>=3; reward:=50;
  elsif p_goal='play2' then complete:=r.daily_play>=2; reward:=60;
  elsif p_goal='train1' then complete:=r.daily_train>=1; reward:=70;
  else raise exception 'invalid_goal'; end if;
  if not complete then raise exception 'goal_incomplete'; end if;
  update public.mofumori_profiles set forest_xp=forest_xp+reward,daily_claims=jsonb_set(daily_claims,array[p_goal],'true'::jsonb,true),updated_at=now()
  where user_key=p_user returning * into r;
  return jsonb_build_object('xp',r.forest_xp,'level',floor(sqrt(greatest(r.forest_xp,0)::numeric/75))+1,'streak',r.care_streak,'rewardXp',reward,
    'daily',jsonb_build_object('care',r.daily_care,'play',r.daily_play,'train',r.daily_train,'battle',r.daily_battle,'visit',r.daily_visit,'gacha',r.daily_gacha,'claims',r.daily_claims));
end $$;
revoke all on function public.mofumori_progress_event(text,text) from public,anon,authenticated;
revoke all on function public.mofumori_claim_daily_goal(text,text) from public,anon,authenticated;
grant execute on function public.mofumori_progress_event(text,text) to service_role;
grant execute on function public.mofumori_claim_daily_goal(text,text) to service_role;
