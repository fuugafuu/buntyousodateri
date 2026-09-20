-- Mofumori v7.2.3: persistent daily events, boss progress, rewards, admin bird
alter table public.mofumori_admins
  add column if not exists admin_bird_enabled boolean not null default false;

create table if not exists public.mofumori_daily_event_players (
  user_key text not null,
  event_date date not null,
  event_id text not null,
  progress integer not null default 0,
  target integer not null default 1,
  completed boolean not null default false,
  claimed boolean not null default false,
  boss_hp_remaining integer,
  boss_damage bigint not null default 0,
  attempts integer not null default 0,
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_key,event_date)
);
create index if not exists mofumori_daily_event_players_event_idx
  on public.mofumori_daily_event_players(event_date,event_id);
alter table public.mofumori_daily_event_players enable row level security;
revoke all on public.mofumori_daily_event_players from anon, authenticated;

create or replace function public.mofumori_claim_daily_event_reward(
  p_user text,p_event_date date,p_event_id text,p_coins bigint,p_xp bigint
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  ev public.mofumori_daily_event_players%rowtype;
  current_state jsonb;
  new_coins bigint;
  new_xp bigint;
begin
  if p_coins<0 or p_coins>100000 or p_xp<0 or p_xp>10000 then raise exception 'reward_out_of_range'; end if;
  select * into ev from public.mofumori_daily_event_players
    where user_key=p_user and event_date=p_event_date and event_id=p_event_id for update;
  if ev.user_key is null then raise exception 'event_state_missing'; end if;
  if ev.completed is not true then raise exception 'event_not_complete'; end if;
  if ev.claimed is true then raise exception 'event_already_claimed'; end if;

  select state into current_state from public.mofumori_saves where user_key=p_user for update;
  if current_state is null then raise exception 'save_missing'; end if;
  new_coins:=greatest(0,coalesce((current_state #>> array['data','coins'])::bigint,0)+p_coins);
  current_state:=jsonb_set(current_state,array['data','coins'],to_jsonb(new_coins),true);
  current_state:=jsonb_set(current_state,array['savedAt'],to_jsonb(to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_user;

  update public.mofumori_profiles set forest_xp=coalesce(forest_xp,0)+p_xp,updated_at=now()
    where user_key=p_user returning forest_xp into new_xp;
  update public.mofumori_daily_event_players set claimed=true,updated_at=now()
    where user_key=p_user and event_date=p_event_date and event_id=p_event_id;

  return jsonb_build_object('claimed',true,'coins',new_coins,'forestXp',coalesce(new_xp,0),'rewardCoins',p_coins,'rewardXp',p_xp);
end
$$;
revoke all on function public.mofumori_claim_daily_event_reward(text,date,text,bigint,bigint) from public,anon,authenticated;
grant execute on function public.mofumori_claim_daily_event_reward(text,date,text,bigint,bigint) to service_role;
