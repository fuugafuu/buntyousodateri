-- Mofumori v5: individual pets, consent-based friends, visits
-- Run after mofumori_v4.sql.

alter table public.mofumori_profiles
  add column if not exists active_pet_id uuid;

create table if not exists public.mofumori_pets (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  species text not null check (species in (
    'buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','canary',
    'inko_green','inko_blue','buncho_pied','buncho_black','finch_zebra',
    'lovebird','cockatiel','owl','cat','fox','penguin','fuga'
  )),
  rarity text not null check (rarity in ('N','R','SR','SSR','UR')),
  rank smallint not null check (rank between 1 and 5),
  name text not null check (char_length(name) between 1 and 12),
  source text not null default 'gacha' check (source in ('starter','legacy','gacha')),
  migration_key text,
  obtained_at timestamptz not null default now(),
  unique(owner_key, migration_key)
);

do $ begin
  if not exists (
    select 1 from pg_constraint where conname='mofumori_profiles_active_pet_fk'
  ) then
    alter table public.mofumori_profiles
      add constraint mofumori_profiles_active_pet_fk
      foreign key (active_pet_id) references public.mofumori_pets(id) on delete set null;
  end if;
end $;

create table if not exists public.mofumori_friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  recipient_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_key <> recipient_key)
);

create table if not exists public.mofumori_visits (
  id uuid primary key default gen_random_uuid(),
  host_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  visitor_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  pet_id uuid not null references public.mofumori_pets(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours'),
  ended_at timestamptz,
  last_action text,
  interaction_count integer not null default 0 check (interaction_count >= 0),
  check (host_key <> visitor_key)
);

create table if not exists public.mofumori_visit_actions (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.mofumori_visits(id) on delete cascade,
  actor_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  action text not null check (action in ('greet','pet','play','share_seed')),
  created_at timestamptz not null default now()
);

create table if not exists public.mofumori_rate_limits (
  user_key text not null,
  action text not null check (action ~ '^[a-z_]{2,40}$'),
  window_started_at timestamptz not null default now(),
  hit_count integer not null default 0 check (hit_count >= 0),
  primary key(user_key, action)
);

create index if not exists mofumori_pets_owner_idx
  on public.mofumori_pets(owner_key, obtained_at desc);
create index if not exists mofumori_friend_requests_recipient_idx
  on public.mofumori_friend_requests(recipient_key, status, created_at desc);
create index if not exists mofumori_friend_requests_sender_idx
  on public.mofumori_friend_requests(sender_key, status, created_at desc);
create index if not exists mofumori_visits_host_idx
  on public.mofumori_visits(host_key, expires_at desc);
create index if not exists mofumori_visits_visitor_idx
  on public.mofumori_visits(visitor_key, expires_at desc);
create index if not exists mofumori_visit_actions_visit_idx
  on public.mofumori_visit_actions(visit_id, created_at desc);
create unique index if not exists mofumori_visits_one_open_per_pet_idx
  on public.mofumori_visits(pet_id) where ended_at is null;
create unique index if not exists mofumori_friend_requests_one_pending_idx
  on public.mofumori_friend_requests(sender_key, recipient_key) where status='pending';

alter table public.mofumori_pets enable row level security;
alter table public.mofumori_friend_requests enable row level security;
alter table public.mofumori_visits enable row level security;
alter table public.mofumori_visit_actions enable row level security;
alter table public.mofumori_rate_limits enable row level security;

create or replace function public.mofumori_take_rate_limit(
  p_user text, p_action text, p_window_seconds integer, p_limit integer
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare current_row public.mofumori_rate_limits%rowtype;
begin
  if p_user is null or p_action !~ '^[a-z_]{2,40}$'
     or p_window_seconds < 1 or p_window_seconds > 86400
     or p_limit < 1 or p_limit > 10000 then return false; end if;

  insert into public.mofumori_rate_limits(user_key, action, window_started_at, hit_count)
  values(p_user, p_action, now(), 0)
  on conflict (user_key, action) do nothing;

  select * into current_row from public.mofumori_rate_limits
  where user_key=p_user and action=p_action for update;

  if current_row.window_started_at <= now() - make_interval(secs => p_window_seconds) then
    update public.mofumori_rate_limits set window_started_at=now(), hit_count=1
    where user_key=p_user and action=p_action;
    return true;
  end if;
  if current_row.hit_count >= p_limit then return false; end if;
  update public.mofumori_rate_limits set hit_count=hit_count+1
  where user_key=p_user and action=p_action;
  return true;
end $$;

create or replace function public.mofumori_award_gacha(
  p_owner text, p_cost integer, p_pets jsonb
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  current_state jsonb;
  current_coins bigint;
  inserted_pets jsonb;
  roll_count integer;
begin
  roll_count := coalesce(jsonb_array_length(p_pets), 0);
  if p_cost < 0 or p_cost > 100000 or roll_count not in (1, 10) then
    raise exception 'invalid_gacha';
  end if;

  select state into current_state from public.mofumori_saves
  where user_key=p_owner for update;
  if current_state is null then raise exception 'save_missing'; end if;

  current_coins := coalesce((current_state #>> array['data','coins'])::bigint,0);
  if current_coins < p_cost then raise exception 'not_enough_coins'; end if;

  current_state := jsonb_set(current_state,array['data','coins'],to_jsonb(current_coins-p_cost),true);
  current_state := jsonb_set(
    current_state,array['savedAt'],
    to_jsonb(to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),true
  );
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_owner;

  with rolls as (
    select * from jsonb_to_recordset(p_pets)
      as x(species text, rarity text, rank integer, name text, source text)
  ), inserted as (
    insert into public.mofumori_pets(owner_key,species,rarity,rank,name,source)
    select p_owner,species,rarity,rank,left(coalesce(nullif(btrim(name),''),species),12),'gacha'
    from rolls
    where species in (
      'buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','canary',
      'inko_green','inko_blue','buncho_pied','buncho_black','finch_zebra',
      'lovebird','cockatiel','owl','cat','fox','penguin'
    ) and rarity in ('N','R','SR','SSR','UR') and rank between 1 and 5
    returning id,owner_key,species,rarity,rank,name,source,obtained_at
  )
  select coalesce(jsonb_agg(to_jsonb(inserted)),'[]'::jsonb)
  into inserted_pets from inserted;

  if jsonb_array_length(inserted_pets) <> roll_count then
    raise exception 'invalid_gacha_payload';
  end if;
  return jsonb_build_object('state',current_state,'pets',inserted_pets);
end $$;

create or replace function public.mofumori_respond_friend_request(
  p_user text, p_request uuid, p_accept boolean
) returns void
language plpgsql security definer set search_path = public
as $$
declare request_row public.mofumori_friend_requests%rowtype;
begin
  select * into request_row from public.mofumori_friend_requests
  where id=p_request and recipient_key=p_user and status='pending' for update;
  if request_row.id is null then raise exception 'request_missing'; end if;

  if p_accept then
    insert into public.mofumori_friendships(owner_key,friend_key)
    values
      (request_row.sender_key,request_row.recipient_key),
      (request_row.recipient_key,request_row.sender_key)
    on conflict (owner_key,friend_key) do nothing;
    update public.mofumori_friend_requests set status='accepted',updated_at=now() where id=p_request;
  else
    update public.mofumori_friend_requests set status='declined',updated_at=now() where id=p_request;
  end if;
end $$;

create or replace function public.mofumori_remove_friend(
  p_user text, p_friend text
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.mofumori_friendships
  where (owner_key=p_user and friend_key=p_friend)
     or (owner_key=p_friend and friend_key=p_user);
  update public.mofumori_visits set ended_at=coalesce(ended_at,now())
  where ended_at is null and (
    (host_key=p_user and visitor_key=p_friend)
    or (host_key=p_friend and visitor_key=p_user)
  );
end $$;

create or replace function public.mofumori_start_visit(
  p_visitor text, p_host text, p_pet uuid
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare visit_row public.mofumori_visits%rowtype;
begin
  if p_visitor=p_host then raise exception 'invalid_host'; end if;
  if not exists(select 1 from public.mofumori_friendships where owner_key=p_visitor and friend_key=p_host)
    then raise exception 'not_friends'; end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_visitor)
    then raise exception 'pet_forbidden'; end if;

  update public.mofumori_visits set ended_at=now()
  where pet_id=p_pet and ended_at is null and expires_at<=now();

  if exists(select 1 from public.mofumori_visits where pet_id=p_pet and ended_at is null and expires_at>now())
    then raise exception 'pet_busy'; end if;

  insert into public.mofumori_visits(host_key,visitor_key,pet_id)
  values(p_host,p_visitor,p_pet) returning * into visit_row;
  return to_jsonb(visit_row);
end $$;

create or replace function public.mofumori_end_visit(
  p_user text, p_visit uuid
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.mofumori_visits set ended_at=coalesce(ended_at,now())
  where id=p_visit and (host_key=p_user or visitor_key=p_user);
  if not found then raise exception 'visit_forbidden'; end if;
end $$;

create or replace function public.mofumori_visit_interaction(
  p_user text, p_visit uuid, p_action text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare visit_row public.mofumori_visits%rowtype;
begin
  if p_action not in ('greet','pet','play','share_seed') then raise exception 'invalid_action'; end if;
  select * into visit_row from public.mofumori_visits
  where id=p_visit and ended_at is null and expires_at>now() for update;
  if visit_row.id is null or (visit_row.host_key<>p_user and visit_row.visitor_key<>p_user)
    then raise exception 'visit_forbidden'; end if;

  insert into public.mofumori_visit_actions(visit_id,actor_key,action) values(p_visit,p_user,p_action);
  update public.mofumori_visits
  set last_action=p_action,interaction_count=interaction_count+1
  where id=p_visit returning * into visit_row;
  return to_jsonb(visit_row);
end $$;

revoke all on table public.mofumori_pets, public.mofumori_friend_requests, public.mofumori_visits, public.mofumori_visit_actions, public.mofumori_rate_limits from anon, authenticated;
grant all on table public.mofumori_pets, public.mofumori_friend_requests, public.mofumori_visits, public.mofumori_visit_actions, public.mofumori_rate_limits to service_role;

revoke all on function public.mofumori_take_rate_limit(text,text,integer,integer) from public, anon, authenticated;
revoke all on function public.mofumori_award_gacha(text,integer,jsonb) from public, anon, authenticated;
revoke all on function public.mofumori_respond_friend_request(text,uuid,boolean) from public, anon, authenticated;
revoke all on function public.mofumori_remove_friend(text,text) from public, anon, authenticated;
revoke all on function public.mofumori_start_visit(text,text,uuid) from public, anon, authenticated;
revoke all on function public.mofumori_end_visit(text,uuid) from public, anon, authenticated;
revoke all on function public.mofumori_visit_interaction(text,uuid,text) from public, anon, authenticated;

grant execute on function public.mofumori_take_rate_limit(text,text,integer,integer) to service_role;
grant execute on function public.mofumori_award_gacha(text,integer,jsonb) to service_role;
grant execute on function public.mofumori_respond_friend_request(text,uuid,boolean) to service_role;
grant execute on function public.mofumori_remove_friend(text,text) to service_role;
grant execute on function public.mofumori_start_visit(text,text,uuid) to service_role;
grant execute on function public.mofumori_end_visit(text,uuid) to service_role;
grant execute on function public.mofumori_visit_interaction(text,uuid,text) to service_role;
