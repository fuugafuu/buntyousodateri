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
  now_ts timestamptz:=now();
  deadline timestamptz;
  win text;
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

  select * into m from public.mofumori_arena_matches where id=p_match for update;
  deadline:=m.starts_at + case m.game_type
    when 'flight' then interval '45 seconds'
    when 'kale' then interval '25 seconds'
    when 'perch' then interval '35 seconds'
    when 'seedrace' then interval '30 seconds'
    when 'ring' then interval '40 seconds'
    else interval '45 seconds'
  end;

  if m.status in ('ready','running') and now_ts>deadline then
    if m.p1_score is null and m.p2_score is null then
      update public.mofumori_arena_matches set status='abandoned',finished_at=now_ts where id=m.id;
    else
      if m.p1_score is not null and m.p2_score is null then win:=m.player1_key;
      elsif m.p2_score is not null and m.p1_score is null then win:=m.player2_key;
      elsif m.p1_score>m.p2_score then win:=m.player1_key;
      elsif m.p2_score>m.p1_score then win:=m.player2_key;
      else win:=null;
      end if;
      update public.mofumori_arena_matches set status='finished',winner_key=win,finished_at=now_ts where id=m.id;
      if win is null then
        update public.mofumori_pets set arena_draws=arena_draws+1,arena_rating=least(3000,arena_rating+1) where id in(m.pet1_id,m.pet2_id);
      elsif win=m.player1_key then
        update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet1_id;
        update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet2_id;
      else
        update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet2_id;
        update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet1_id;
      end if;
    end if;

  elsif m.status='ready' then
    if m.p1_ready_at is not null and m.p2_ready_at is not null
      and (m.player1_key like 'bot:arena:%' or m.p1_last_seen_at>=now_ts-interval '2 seconds')
      and (m.player2_key like 'bot:arena:%' or m.p2_last_seen_at>=now_ts-interval '2 seconds') then
      if not m.handshake_locked then
        update public.mofumori_arena_matches
        set handshake_locked=true,starts_at=now_ts+interval '3 seconds',expires_at=now_ts+interval '3 minutes'
        where id=m.id;
      end if;
    elsif m.handshake_locked then
      update public.mofumori_arena_matches
      set handshake_locked=false,starts_at=now_ts+interval '30 seconds'
      where id=m.id;
    end if;

  elsif m.status='running' and not opp_is_bot and (opp_seen is null or opp_seen<now_ts-interval '10 seconds') then
    win:=p_user;
    update public.mofumori_arena_matches set status='finished',winner_key=win,finished_at=now_ts where id=m.id and status='running';
    if side_no=1 then
      update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet1_id;
      update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet2_id;
    else
      update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet2_id;
      update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet1_id;
    end if;
  end if;

  select * into m from public.mofumori_arena_matches where id=p_match;
  return jsonb_build_object(
    'status',m.status,
    'locked',m.handshake_locked,
    'opponentFresh',
      (case when side_no=1 then m.player2_key else m.player1_key end) like 'bot:arena:%'
      or (case when side_no=1 then m.p2_last_seen_at else m.p1_last_seen_at end)>=now_ts-interval '2 seconds'
  );
end $$;

revoke all on function public.mofumori_arena_touch(text,uuid) from public,anon,authenticated;
grant execute on function public.mofumori_arena_touch(text,uuid) to service_role;