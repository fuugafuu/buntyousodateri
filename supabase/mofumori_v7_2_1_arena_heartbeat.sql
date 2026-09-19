alter table public.mofumori_arena_matches
  add column if not exists p1_last_seen_at timestamptz,
  add column if not exists p2_last_seen_at timestamptz;

create or replace function public.mofumori_arena_touch(p_user text,p_match uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  m public.mofumori_arena_matches%rowtype;
  side_no integer;
  opp_seen timestamptz;
  opp_key text;
  opp_is_bot boolean;
  opp_fresh boolean;
  now_ts timestamptz:=now();
  win_pet uuid;
  lose_pet uuid;
begin
  select * into m from public.mofumori_arena_matches
  where id=p_match and (player1_key=p_user or player2_key=p_user)
  for update;
  if m.id is null then raise exception 'match_forbidden'; end if;
  if m.status in ('finished','abandoned') then
    return jsonb_build_object('status',m.status,'locked',m.handshake_locked,'opponentFresh',false);
  end if;

  side_no:=case when m.player1_key=p_user then 1 else 2 end;
  if side_no=1 then
    update public.mofumori_arena_matches set p1_last_seen_at=now_ts where id=m.id;
    opp_key:=m.player2_key;opp_seen:=m.p2_last_seen_at;
  else
    update public.mofumori_arena_matches set p2_last_seen_at=now_ts where id=m.id;
    opp_key:=m.player1_key;opp_seen:=m.p1_last_seen_at;
  end if;
  opp_is_bot:=opp_key like 'bot:arena:%';
  opp_fresh:=opp_is_bot or (opp_seen is not null and opp_seen>=now_ts-interval '3 seconds');

  select * into m from public.mofumori_arena_matches where id=p_match for update;

  if m.status='ready' then
    if m.p1_ready_at is not null and m.p2_ready_at is not null
      and (m.player1_key like 'bot:arena:%' or m.p1_last_seen_at>=now_ts-interval '3 seconds')
      and (m.player2_key like 'bot:arena:%' or m.p2_last_seen_at>=now_ts-interval '3 seconds') then
      if not m.handshake_locked then
        update public.mofumori_arena_matches
        set handshake_locked=true,starts_at=now_ts+interval '3 seconds',expires_at=now_ts+interval '3 minutes'
        where id=m.id;
      end if;
    elsif m.handshake_locked and now_ts<m.starts_at then
      update public.mofumori_arena_matches
      set handshake_locked=false,starts_at=now_ts+interval '30 seconds'
      where id=m.id;
    end if;
  elsif m.status='running' and not opp_is_bot and (opp_seen is null or opp_seen<now_ts-interval '10 seconds') then
    win_pet:=case when side_no=1 then m.pet1_id else m.pet2_id end;
    lose_pet:=case when side_no=1 then m.pet2_id else m.pet1_id end;
    update public.mofumori_arena_matches
    set status='finished',winner_key=p_user,finished_at=now_ts
    where id=m.id and status='running';
    update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+12) where id=win_pet;
    update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-8) where id=lose_pet;
  end if;

  select * into m from public.mofumori_arena_matches where id=p_match;
  return jsonb_build_object(
    'status',m.status,'locked',m.handshake_locked,
    'opponentFresh',opp_is_bot or (
      case when side_no=1 then m.p2_last_seen_at else m.p1_last_seen_at end
      >= now_ts-interval '3 seconds'
    )
  );
end $$;

revoke all on function public.mofumori_arena_touch(text,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_arena_touch(text,uuid) to service_role;
