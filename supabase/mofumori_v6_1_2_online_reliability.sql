-- Mofumori v6.1.2 online reliability
-- Make random matchmaking idempotent and serialize queue joins per game.

create or replace function public.mofumori_arena_enqueue(p_user text,p_pet uuid,p_game text)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  rival public.mofumori_arena_queue%rowtype;
  m public.mofumori_arena_matches%rowtype;
begin
  if p_game not in ('flight','kale','perch') then
    raise exception 'invalid_game';
  end if;

  if not exists(
    select 1 from public.mofumori_pets
    where id=p_pet and owner_key=p_user and species like 'buncho_%'
  ) then
    raise exception 'pet_not_eligible';
  end if;

  -- Serialize matchmaking for one game so two players arriving at nearly
  -- the same instant cannot both miss each other and end up queued.
  perform pg_advisory_xact_lock(hashtextextended('mofumori_arena:' || p_game, 0));

  delete from public.mofumori_arena_queue where expires_at<=now();

  -- Queue requests are idempotent. A repeated tap/request after a match
  -- was already created returns that match instead of raising 409.
  select * into m
  from public.mofumori_arena_matches
  where (player1_key=p_user or player2_key=p_user)
    and status in ('ready','running')
    and expires_at>now()
  order by created_at desc
  limit 1;

  if m.id is not null then
    delete from public.mofumori_arena_queue where user_key=p_user;
    return jsonb_build_object(
      'status','matched',
      'matchId',m.id,
      'startsAt',m.starts_at,
      'reused',true
    );
  end if;

  delete from public.mofumori_arena_queue where user_key=p_user;

  select * into rival
  from public.mofumori_arena_queue
  where game_type=p_game
    and user_key<>p_user
    and expires_at>now()
  order by joined_at
  limit 1
  for update skip locked;

  if rival.user_key is null then
    insert into public.mofumori_arena_queue(user_key,pet_id,game_type,joined_at,expires_at)
    values(p_user,p_pet,p_game,now(),now()+interval '2 minutes')
    on conflict(user_key) do update
      set pet_id=excluded.pet_id,
          game_type=excluded.game_type,
          joined_at=now(),
          expires_at=now()+interval '2 minutes';
    return jsonb_build_object('status','queued');
  end if;

  delete from public.mofumori_arena_queue
  where user_key in (rival.user_key,p_user);

  insert into public.mofumori_arena_matches(
    game_type,player1_key,player2_key,pet1_id,pet2_id,status,starts_at,expires_at
  )
  values(
    p_game,rival.user_key,p_user,rival.pet_id,p_pet,'ready',
    now()+interval '5 seconds',now()+interval '2 minutes'
  )
  returning * into m;

  return jsonb_build_object(
    'status','matched',
    'matchId',m.id,
    'startsAt',m.starts_at,
    'reused',false
  );
end
$$;

revoke all on function public.mofumori_arena_enqueue(text,uuid,text) from public,anon,authenticated;
grant execute on function public.mofumori_arena_enqueue(text,uuid,text) to service_role;
