-- Mofumori v7.2 arena readiness, new games and CPU pool

alter table public.mofumori_arena_matches
  add column if not exists p1_ready_at timestamptz,
  add column if not exists p2_ready_at timestamptz,
  add column if not exists handshake_locked boolean not null default false;

alter table public.mofumori_arena_matches drop constraint if exists mofumori_arena_matches_game_type_check;
alter table public.mofumori_arena_matches
  add constraint mofumori_arena_matches_game_type_check
  check (game_type in ('flight','kale','perch','seedrace','ring'));

alter table public.mofumori_arena_queue drop constraint if exists mofumori_arena_queue_game_type_check;
alter table public.mofumori_arena_queue
  add constraint mofumori_arena_queue_game_type_check
  check (game_type in ('flight','kale','perch','seedrace','ring'));

alter table public.mofumori_arena_challenges drop constraint if exists mofumori_arena_challenges_game_type_check;
alter table public.mofumori_arena_challenges
  add constraint mofumori_arena_challenges_game_type_check
  check (game_type in ('flight','kale','perch','seedrace','ring'));

create or replace function public.mofumori_arena_enqueue(p_user text,p_pet uuid,p_game text)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $$
declare
  rival public.mofumori_arena_queue%rowtype;
  m public.mofumori_arena_matches%rowtype;
begin
  if p_game not in ('flight','kale','perch','seedrace','ring') then raise exception 'invalid_game'; end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_user and species like 'buncho_%')
    then raise exception 'pet_not_eligible'; end if;

  perform pg_advisory_xact_lock(hashtextextended('mofumori_arena:'||p_game,0));
  delete from public.mofumori_arena_queue where expires_at<=now();

  select * into m from public.mofumori_arena_matches
  where (player1_key=p_user or player2_key=p_user)
    and status in ('ready','running') and expires_at>now()
  order by created_at desc limit 1;
  if m.id is not null then
    delete from public.mofumori_arena_queue where user_key=p_user;
    return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at,'reused',true);
  end if;

  select * into rival from public.mofumori_arena_queue
  where game_type=p_game and user_key<>p_user and user_key not like 'bot:arena:%' and expires_at>now()
  order by joined_at limit 1 for update skip locked;

  if rival.user_key is not null then
    delete from public.mofumori_arena_queue where user_key in (rival.user_key,p_user);
    insert into public.mofumori_arena_matches(game_type,player1_key,player2_key,pet1_id,pet2_id,status,starts_at,expires_at)
    values(p_game,rival.user_key,p_user,rival.pet_id,p_pet,'ready',now()+interval '5 seconds',now()+interval '3 minutes')
    returning * into m;
    return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at,'reused',false,'opponentKind','human');
  end if;

  insert into public.mofumori_arena_queue(user_key,pet_id,game_type,joined_at,expires_at)
  values(p_user,p_pet,p_game,now(),now()+interval '2 minutes')
  on conflict(user_key) do update set
    pet_id=excluded.pet_id,
    game_type=excluded.game_type,
    joined_at=case when public.mofumori_arena_queue.game_type=excluded.game_type then public.mofumori_arena_queue.joined_at else now() end,
    expires_at=now()+interval '2 minutes';

  return jsonb_build_object('status','queued');
end $$;

create or replace function public.mofumori_arena_create_challenge(p_sender text,p_recipient text,p_pet uuid,p_game text)
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare cid uuid;
begin
  if p_game not in ('flight','kale','perch','seedrace','ring') then raise exception 'invalid_game'; end if;
  if p_sender=p_recipient then raise exception 'invalid_recipient'; end if;
  if not exists(select 1 from public.mofumori_friendships where owner_key=p_sender and friend_key=p_recipient)
    then raise exception 'not_friends'; end if;
  if not exists(select 1 from public.mofumori_pets where id=p_pet and owner_key=p_sender and species like 'buncho_%')
    then raise exception 'pet_not_eligible'; end if;
  update public.mofumori_arena_challenges set status='expired',updated_at=now()
  where status='pending' and created_at<now()-interval '5 minutes';
  insert into public.mofumori_arena_challenges(sender_key,recipient_key,sender_pet_id,game_type)
  values(p_sender,p_recipient,p_pet,p_game) returning id into cid;
  return cid;
end $$;

-- 50 persistent CPU profiles. They are server-side match opponents, not fake human accounts.
insert into public.mofumori_profiles(user_key,player_id,display_name,score,character)
select
  'bot:arena:'||lpad(i::text,3,'0'),
  'MF-BOT'||lpad(i::text,5,'0'),
  (array['ことり日和','もち文鳥','しろごま','羽休め','ちゅん森','小鳥部屋','さくら羽','ふわまる','豆苗クラブ','ことり窓辺'])[((i-1)%10)+1]||' '||lpad(i::text,2,'0'),
  0,
  jsonb_build_object('icon','🐦','name',(array['モチ','ピコ','チュン','ソラ','マメ','ハク','リン','コメ','ユキ','サクラ'])[((i-1)%10)+1],'species',
    (array['buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','buncho_pied','buncho_black'])[((i-1)%6)+1],
    'arenaBot',true)
from generate_series(1,50) i
on conflict(user_key) do update set display_name=excluded.display_name,character=excluded.character;

insert into public.mofumori_pets(owner_key,species,rarity,rank,name,source,migration_key,arena_rating,fitness)
select
  'bot:arena:'||lpad(i::text,3,'0'),
  (array['buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','buncho_pied','buncho_black'])[((i-1)%6)+1],
  (array['N','R','R','SR','SR','SSR'])[((i-1)%6)+1],
  1+((i-1)%5),
  (array['モチ','ピコ','チュン','ソラ','マメ','ハク','リン','コメ','ユキ','サクラ'])[((i-1)%10)+1],
  'reward','arena_cpu',850+((i*37)%550),45+((i*11)%45)
from generate_series(1,50) i
on conflict(owner_key,migration_key) do update set
  species=excluded.species,rarity=excluded.rarity,rank=excluded.rank,name=excluded.name,
  arena_rating=excluded.arena_rating,fitness=excluded.fitness;

update public.mofumori_profiles p
set active_pet_id=pet.id,updated_at=now()
from public.mofumori_pets pet
where p.user_key like 'bot:arena:%' and pet.owner_key=p.user_key and pet.migration_key='arena_cpu';

create or replace function public.mofumori_arena_poll(p_user text)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $$
declare
  q public.mofumori_arena_queue%rowtype;
  rival public.mofumori_arena_queue%rowtype;
  m public.mofumori_arena_matches%rowtype;
  bot_key text;
  bot_pet uuid;
  waited integer;
begin
  select * into m from public.mofumori_arena_matches
  where (player1_key=p_user or player2_key=p_user)
    and status in ('ready','running') and expires_at>now()
  order by created_at desc limit 1;
  if m.id is not null then
    delete from public.mofumori_arena_queue where user_key=p_user;
    return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at,'reused',true);
  end if;

  select * into q from public.mofumori_arena_queue
  where user_key=p_user and expires_at>now() for update;
  if q.user_key is null then return jsonb_build_object('status','idle'); end if;

  perform pg_advisory_xact_lock(hashtextextended('mofumori_arena:'||q.game_type,0));

  select * into rival from public.mofumori_arena_queue
  where game_type=q.game_type and user_key<>p_user and user_key not like 'bot:arena:%' and expires_at>now()
  order by joined_at limit 1 for update skip locked;

  if rival.user_key is not null then
    delete from public.mofumori_arena_queue where user_key in (rival.user_key,p_user);
    insert into public.mofumori_arena_matches(game_type,player1_key,player2_key,pet1_id,pet2_id,status,starts_at,expires_at)
    values(q.game_type,q.user_key,rival.user_key,q.pet_id,rival.pet_id,'ready',now()+interval '5 seconds',now()+interval '3 minutes')
    returning * into m;
    return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at,'opponentKind','human');
  end if;

  waited:=greatest(0,floor(extract(epoch from (now()-q.joined_at))*1000)::integer);
  if waited<10000 then return jsonb_build_object('status','queued','waitedMs',waited); end if;

  select p.user_key,p.active_pet_id into bot_key,bot_pet
  from public.mofumori_profiles p
  where p.user_key like 'bot:arena:%' and p.active_pet_id is not null
  order by md5(p.user_key||p_user||q.game_type||q.joined_at::text)
  limit 1;
  if bot_key is null or bot_pet is null then return jsonb_build_object('status','queued','waitedMs',waited); end if;

  delete from public.mofumori_arena_queue where user_key=p_user;
  insert into public.mofumori_arena_matches(
    game_type,player1_key,player2_key,pet1_id,pet2_id,status,starts_at,expires_at,
    p2_ready_at,p2_progress
  ) values(
    q.game_type,p_user,bot_key,q.pet_id,bot_pet,'ready',now()+interval '30 seconds',now()+interval '3 minutes',
    now(),jsonb_build_object('ready',true,'bot',true,'t',0,'x',0,'height',0,'count',0,'hits',0,'hp',100)
  ) returning * into m;

  return jsonb_build_object('status','matched','matchId',m.id,'startsAt',m.starts_at,'opponentKind','bot');
end $$;

revoke all on function public.mofumori_arena_poll(text) from public,anon,authenticated;
grant execute on function public.mofumori_arena_poll(text) to service_role;
revoke all on function public.mofumori_arena_enqueue(text,uuid,text) from public,anon,authenticated;
grant execute on function public.mofumori_arena_enqueue(text,uuid,text) to service_role;
revoke all on function public.mofumori_arena_create_challenge(text,text,uuid,text) from public,anon,authenticated;
grant execute on function public.mofumori_arena_create_challenge(text,text,uuid,text) to service_role;
