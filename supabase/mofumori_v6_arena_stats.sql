-- Mofumori v6: detailed buncho stats and online arena.
-- Run after v5.2.

alter table public.mofumori_pets
  add column if not exists appetite numeric(5,2) not null default (35 + floor(random()*51)),
  add column if not exists frame numeric(5,2) not null default (35 + floor(random()*51)),
  add column if not exists metabolism numeric(5,2) not null default (35 + floor(random()*51)),
  add column if not exists temperament numeric(5,2) not null default (35 + floor(random()*51)),
  add column if not exists curiosity numeric(5,2) not null default (35 + floor(random()*51)),
  add column if not exists sociability numeric(5,2) not null default (35 + floor(random()*51)),
  add column if not exists endurance numeric(5,2) not null default (32 + floor(random()*29)),
  add column if not exists agility numeric(5,2) not null default (32 + floor(random()*29)),
  add column if not exists flight_power numeric(5,2) not null default (32 + floor(random()*29)),
  add column if not exists focus numeric(5,2) not null default (32 + floor(random()*29)),
  add column if not exists beak_speed numeric(5,2) not null default (32 + floor(random()*29)),
  add column if not exists balance numeric(5,2) not null default (32 + floor(random()*29)),
  add column if not exists weight_g numeric(5,2) not null default (22.8 + random()*3.4),
  add column if not exists ideal_weight_g numeric(5,2) not null default 24.5,
  add column if not exists body_length_cm numeric(5,2) not null default (13.2 + random()*1.8),
  add column if not exists wing_span_cm numeric(5,2) not null default (20.2 + random()*2.8),
  add column if not exists fitness numeric(5,2) not null default 50,
  add column if not exists care_counters jsonb not null default '{"feed":0,"treat":0,"play":0,"train":0,"sing":0,"bath":0,"pet":0,"sleep":0}'::jsonb,
  add column if not exists arena_rating integer not null default 1000,
  add column if not exists arena_wins integer not null default 0,
  add column if not exists arena_losses integer not null default 0,
  add column if not exists arena_draws integer not null default 0,
  add column if not exists last_care_at timestamptz,
  add column if not exists stats_updated_at timestamptz not null default now();

update public.mofumori_pets
set ideal_weight_g=case
      when species like 'buncho_%' then 24.5
      when species='finch_zebra' then 12.5
      when species='canary' then 20
      when species like 'inko_%' then 35
      when species='lovebird' then 48
      when species='cockatiel' then 88
      else ideal_weight_g end,
    endurance=least(100,endurance+rank*1.5),
    agility=least(100,agility+rank*1.2),
    flight_power=least(100,flight_power+rank*1.4),
    focus=least(100,focus+rank*1.1),
    beak_speed=least(100,beak_speed+rank),
    balance=least(100,balance+rank)
where stats_updated_at<=now();

create or replace function public.mofumori_record_pet_care(p_owner text,p_pet uuid,p_action text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.mofumori_pets%rowtype; n integer;
begin
  if p_action not in ('feed','treat','play','train','sing','bath','pet','sleep') then raise exception 'invalid_care_action'; end if;
  select * into r from public.mofumori_pets where id=p_pet and owner_key=p_owner for update;
  if r.id is null then raise exception 'pet_forbidden'; end if;
  n:=coalesce((r.care_counters->>p_action)::integer,0)+1;
  update public.mofumori_pets set
    care_counters=jsonb_set(care_counters,array[p_action],to_jsonb(n),true),
    appetite=greatest(1,least(100,appetite+case p_action when 'feed' then .05 when 'treat' then .16 when 'play' then -.02 else 0 end)),
    temperament=greatest(1,least(100,temperament+case p_action when 'pet' then .08 when 'bath' then .04 when 'sleep' then .03 else 0 end)),
    curiosity=greatest(1,least(100,curiosity+case p_action when 'play' then .07 when 'train' then .05 else 0 end)),
    sociability=greatest(1,least(100,sociability+case p_action when 'pet' then .08 when 'sing' then .09 when 'play' then .04 else 0 end)),
    endurance=greatest(1,least(100,endurance+case p_action when 'train' then .18 when 'play' then .11 when 'sleep' then .07 else 0 end)),
    agility=greatest(1,least(100,agility+case p_action when 'play' then .18 when 'train' then .09 else 0 end)),
    flight_power=greatest(1,least(100,flight_power+case p_action when 'train' then .20 when 'play' then .06 else 0 end)),
    focus=greatest(1,least(100,focus+case p_action when 'train' then .16 when 'sing' then .10 when 'sleep' then .04 else 0 end)),
    beak_speed=greatest(1,least(100,beak_speed+case p_action when 'feed' then .05 when 'treat' then .03 else 0 end)),
    balance=greatest(1,least(100,balance+case p_action when 'play' then .12 when 'train' then .12 else 0 end)),
    fitness=greatest(1,least(100,fitness+case p_action when 'train' then .13 when 'play' then .10 when 'sleep' then .07 when 'treat' then -.12 else 0 end)),
    weight_g=greatest(16,least(40,weight_g+case p_action when 'feed' then .018 when 'treat' then .055 when 'play' then -.018 when 'train' then -.012 else 0 end)),
    last_care_at=now(),stats_updated_at=now()
  where id=p_pet returning * into r;
  return jsonb_build_object('id',r.id,'appetite',r.appetite,'frame',r.frame,'metabolism',r.metabolism,'temperament',r.temperament,
    'curiosity',r.curiosity,'sociability',r.sociability,'endurance',r.endurance,'agility',r.agility,'flightPower',r.flight_power,
    'focus',r.focus,'beakSpeed',r.beak_speed,'balance',r.balance,'weightG',r.weight_g,'idealWeightG',r.ideal_weight_g,
    'bodyLengthCm',r.body_length_cm,'wingSpanCm',r.wing_span_cm,'fitness',r.fitness,'careCounters',r.care_counters,
    'rating',r.arena_rating,'wins',r.arena_wins,'losses',r.arena_losses,'draws',r.arena_draws);
end $$;

create table if not exists public.mofumori_arena_queue(
  user_key text primary key references public.mofumori_profiles(user_key) on delete cascade,
  pet_id uuid not null references public.mofumori_pets(id) on delete cascade,
  game_type text not null check(game_type in ('flight','kale','perch')),
  joined_at timestamptz not null default now(),
  expires_at timestamptz not null default(now()+interval '2 minutes')
);

create table if not exists public.mofumori_arena_matches(
  id uuid primary key default gen_random_uuid(),
  game_type text not null check(game_type in ('flight','kale','perch')),
  player1_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  player2_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  pet1_id uuid not null references public.mofumori_pets(id) on delete cascade,
  pet2_id uuid not null references public.mofumori_pets(id) on delete cascade,
  seed bigint not null default(floor(random()*2147483647))::bigint,
  status text not null default 'ready' check(status in ('ready','running','finished','abandoned')),
  created_at timestamptz not null default now(),
  starts_at timestamptz not null default(now()+interval '5 seconds'),
  expires_at timestamptz not null default(now()+interval '2 minutes'),
  p1_score integer,p2_score integer,p1_detail jsonb,p2_detail jsonb,
  p1_progress jsonb not null default '{}'::jsonb,p2_progress jsonb not null default '{}'::jsonb,
  winner_key text references public.mofumori_profiles(user_key) on delete set null,
  finished_at timestamptz,
  check(player1_key<>player2_key)
);

create table if not exists public.mofumori_arena_challenges(
  id uuid primary key default gen_random_uuid(),
  sender_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  recipient_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  sender_pet_id uuid not null references public.mofumori_pets(id) on delete cascade,
  recipient_pet_id uuid references public.mofumori_pets(id) on delete set null,
  game_type text not null check(game_type in ('flight','kale','perch')),
  status text not null default 'pending' check(status in ('pending','accepted','declined','cancelled','expired')),
  match_id uuid references public.mofumori_arena_matches(id) on delete set null,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(sender_key<>recipient_key)
);

create index if not exists mofumori_arena_queue_game_idx on public.mofumori_arena_queue(game_type,joined_at);
create index if not exists mofumori_arena_matches_p1_idx on public.mofumori_arena_matches(player1_key,created_at desc);
create index if not exists mofumori_arena_matches_p2_idx on public.mofumori_arena_matches(player2_key,created_at desc);
create index if not exists mofumori_arena_challenges_recipient_idx on public.mofumori_arena_challenges(recipient_key,status,created_at desc);
create unique index if not exists mofumori_arena_one_pending_challenge_idx on public.mofumori_arena_challenges(sender_key,recipient_key,game_type) where status='pending';

alter table public.mofumori_arena_queue enable row level security;
alter table public.mofumori_arena_matches enable row level security;
alter table public.mofumori_arena_challenges enable row level security;
revoke all on table public.mofumori_arena_queue,public.mofumori_arena_matches,public.mofumori_arena_challenges from anon,authenticated;
grant all on table public.mofumori_arena_queue,public.mofumori_arena_matches,public.mofumori_arena_challenges to service_role;

create or replace function public.mofumori_arena_enqueue(p_user text,p_pet uuid,p_game text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare rival public.mofumori_arena_queue%rowtype; m public.mofumori_arena_matches%rowtype;
begin
  if p_game not in ('flight','kale','perch') then raise exception 'invalid_game'; end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_user and species like 'buncho_%') then raise exception 'pet_not_eligible'; end if;
  delete from public.mofumori_arena_queue where expires_at<=now();
  if exists(select 1 from public.mofumori_arena_matches where (player1_key=p_user or player2_key=p_user) and status in ('ready','running') and expires_at>now()) then raise exception 'already_in_match'; end if;
  delete from public.mofumori_arena_queue where user_key=p_user;
  select * into rival from public.mofumori_arena_queue where game_type=p_game and user_key<>p_user and expires_at>now()
    order by joined_at limit 1 for update skip locked;
  if rival.user_key is null then
    insert into public.mofumori_arena_queue(user_key,pet_id,game_type,joined_at,expires_at)
    values(p_user,p_pet,p_game,now(),now()+interval '2 minutes')
    on conflict(user_key) do update set pet_id=excluded.pet_id,game_type=excluded.game_type,joined_at=now(),expires_at=now()+interval '2 minutes';
    return jsonb_build_object('status','queued');
  end if;
  delete from public.mofumori_arena_queue where user_key=rival.user_key;
  insert into public.mofumori_arena_matches(game_type,player1_key,player2_key,pet1_id,pet2_id,status,starts_at,expires_at)
  values(p_game,rival.user_key,p_user,rival.pet_id,p_pet,'ready',now()+interval '5 seconds',now()+interval '2 minutes') returning * into m;
  return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at);
end $$;

create or replace function public.mofumori_arena_create_challenge(p_sender text,p_recipient text,p_pet uuid,p_game text)
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
  if p_game not in ('flight','kale','perch') then raise exception 'invalid_game'; end if;
  if p_sender=p_recipient then raise exception 'invalid_recipient'; end if;
  if not exists(select 1 from public.mofumori_friendships where owner_key=p_sender and friend_key=p_recipient) then raise exception 'not_friends'; end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_sender and species like 'buncho_%') then raise exception 'pet_not_eligible'; end if;
  update public.mofumori_arena_challenges set status='expired',updated_at=now() where status='pending' and created_at<now()-interval '5 minutes';
  insert into public.mofumori_arena_challenges(sender_key,recipient_key,sender_pet_id,game_type)
  values(p_sender,p_recipient,p_pet,p_game) returning id into cid;
  return cid;
end $$;

create or replace function public.mofumori_arena_respond_challenge(p_user text,p_challenge uuid,p_accept boolean,p_pet uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c public.mofumori_arena_challenges%rowtype; m public.mofumori_arena_matches%rowtype;
begin
  select * into c from public.mofumori_arena_challenges where id=p_challenge and recipient_key=p_user and status='pending' for update;
  if c.id is null then raise exception 'challenge_missing'; end if;
  if not p_accept then
    update public.mofumori_arena_challenges set status='declined',updated_at=now() where id=c.id;
    return jsonb_build_object('status','declined');
  end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_user and species like 'buncho_%') then raise exception 'pet_not_eligible'; end if;
  insert into public.mofumori_arena_matches(game_type,player1_key,player2_key,pet1_id,pet2_id,status,starts_at,expires_at)
  values(c.game_type,c.sender_key,c.recipient_key,c.sender_pet_id,p_pet,'ready',now()+interval '5 seconds',now()+interval '2 minutes') returning * into m;
  update public.mofumori_arena_challenges set status='accepted',recipient_pet_id=p_pet,match_id=m.id,updated_at=now() where id=c.id;
  return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at);
end $$;

create or replace function public.mofumori_arena_submit(p_user text,p_match uuid,p_score integer,p_detail jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare m public.mofumori_arena_matches%rowtype; win text;
begin
  if p_score<0 or p_score>1000000 then raise exception 'invalid_score'; end if;
  select * into m from public.mofumori_arena_matches where id=p_match and (player1_key=p_user or player2_key=p_user) for update;
  if m.id is null then raise exception 'match_forbidden'; end if;
  if m.status in ('finished','abandoned') then return to_jsonb(m); end if;
  if now()<m.starts_at-interval '1 second' then raise exception 'match_not_started'; end if;
  if m.player1_key=p_user and m.p1_score is null then
    update public.mofumori_arena_matches set p1_score=p_score,p1_detail=p_detail,status='running' where id=m.id;
  elsif m.player2_key=p_user and m.p2_score is null then
    update public.mofumori_arena_matches set p2_score=p_score,p2_detail=p_detail,status='running' where id=m.id;
  end if;
  select * into m from public.mofumori_arena_matches where id=p_match for update;
  if m.p1_score is not null and m.p2_score is not null then
    if m.p1_score>m.p2_score then win:=m.player1_key;
    elsif m.p2_score>m.p1_score then win:=m.player2_key;
    else win:=null; end if;
    update public.mofumori_arena_matches set status='finished',winner_key=win,finished_at=now() where id=m.id returning * into m;
    if win is null then
      update public.mofumori_pets set arena_draws=arena_draws+1,arena_rating=least(3000,arena_rating+1) where id in (m.pet1_id,m.pet2_id);
    elsif win=m.player1_key then
      update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet1_id;
      update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet2_id;
    else
      update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet2_id;
      update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet1_id;
    end if;
  end if;
  return to_jsonb(m);
end $$;

create or replace function public.mofumori_arena_abandon(p_user text,p_match uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  update public.mofumori_arena_matches
  set status='abandoned',finished_at=now(),
      winner_key=case when player1_key=p_user then player2_key when player2_key=p_user then player1_key else winner_key end
  where id=p_match and (player1_key=p_user or player2_key=p_user) and status in ('ready','running');
  if not found then raise exception 'match_forbidden'; end if;
end $$;

revoke all on function public.mofumori_record_pet_care(text,uuid,text) from public,anon,authenticated;
revoke all on function public.mofumori_arena_enqueue(text,uuid,text) from public,anon,authenticated;
revoke all on function public.mofumori_arena_create_challenge(text,text,uuid,text) from public,anon,authenticated;
revoke all on function public.mofumori_arena_respond_challenge(text,uuid,boolean,uuid) from public,anon,authenticated;
revoke all on function public.mofumori_arena_submit(text,uuid,integer,jsonb) from public,anon,authenticated;
revoke all on function public.mofumori_arena_abandon(text,uuid) from public,anon,authenticated;

grant execute on function public.mofumori_record_pet_care(text,uuid,text) to service_role;
grant execute on function public.mofumori_arena_enqueue(text,uuid,text) to service_role;
grant execute on function public.mofumori_arena_create_challenge(text,text,uuid,text) to service_role;
grant execute on function public.mofumori_arena_respond_challenge(text,uuid,boolean,uuid) to service_role;
grant execute on function public.mofumori_arena_submit(text,uuid,integer,jsonb) to service_role;
grant execute on function public.mofumori_arena_abandon(text,uuid) to service_role;
