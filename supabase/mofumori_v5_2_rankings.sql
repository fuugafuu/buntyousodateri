-- Mofumori v5.2: server-authoritative leaderboards.
-- Scores are derived only from server-owned social/pet/visit tables.

create or replace function public.mofumori_get_leaderboard(
  p_user text,
  p_board text default 'total',
  p_limit integer default 100
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  board_name text := lower(coalesce(p_board, 'total'));
  row_limit integer := greatest(1, least(coalesce(p_limit, 100), 100));
  rows_json jsonb := '[]'::jsonb;
  me_json jsonb := null;
begin
  if board_name not in ('total','collection','social','explorer') then
    board_name := 'total';
  end if;

  with
  pet_stats as (
    select owner_key,
      count(*)::integer as pet_count,
      count(distinct species)::integer as species_count,
      coalesce(sum(case rarity
        when 'UR' then 50 when 'SSR' then 20 when 'SR' then 8 when 'R' then 3 else 1 end),0)::integer as rarity_points
    from public.mofumori_pets group by owner_key
  ),
  friend_stats as (
    select owner_key, count(*)::integer as friend_count
    from public.mofumori_friendships group by owner_key
  ),
  visit_stats as (
    select visitor_key as user_key,
      count(*)::integer as visit_count,
      count(*) filter (where started_at >= now() - interval '7 days')::integer as weekly_visits
    from public.mofumori_visits group by visitor_key
  ),
  action_stats as (
    select actor_key as user_key,
      count(*)::integer as action_count,
      count(*) filter (where created_at >= now() - interval '7 days')::integer as weekly_actions
    from public.mofumori_visit_actions group by actor_key
  ),
  base as (
    select
      p.user_key,p.player_id,p.display_name,p.character,
      coalesce(ps.pet_count,0) as pet_count,
      coalesce(ps.species_count,0) as species_count,
      coalesce(ps.rarity_points,0) as rarity_points,
      coalesce(fs.friend_count,0) as friend_count,
      coalesce(vs.visit_count,0) as visit_count,
      coalesce(vs.weekly_visits,0) as weekly_visits,
      coalesce(a.action_count,0) as action_count,
      coalesce(a.weekly_actions,0) as weekly_actions,
      (coalesce(ps.species_count,0)*120+coalesce(ps.pet_count,0)*12+coalesce(ps.rarity_points,0)*9)::bigint as collection_score,
      (coalesce(fs.friend_count,0)*100+coalesce(vs.visit_count,0)*35+coalesce(a.action_count,0)*14)::bigint as social_score,
      (coalesce(vs.visit_count,0)*90+coalesce(vs.weekly_visits,0)*45+coalesce(a.weekly_actions,0)*18)::bigint as explorer_score
    from public.mofumori_profiles p
    left join pet_stats ps on ps.owner_key=p.user_key
    left join friend_stats fs on fs.owner_key=p.user_key
    left join visit_stats vs on vs.user_key=p.user_key
    left join action_stats a on a.user_key=p.user_key
  ),
  scored as (
    select *,case board_name
      when 'collection' then collection_score
      when 'social' then social_score
      when 'explorer' then explorer_score
      else collection_score+social_score+explorer_score end as leaderboard_score
    from base
  ),
  ranked as (
    select *,dense_rank() over(order by leaderboard_score desc,player_id asc)::integer as position from scored
  ),
  limited as (select * from ranked order by position asc,player_id asc limit row_limit)
  select coalesce(jsonb_agg(jsonb_build_object(
    'position',position,'playerId',player_id,'displayName',display_name,'score',leaderboard_score,'character',character,'isMe',user_key=p_user,
    'metrics',jsonb_build_object(
      'pets',pet_count,'species',species_count,'rarityPoints',rarity_points,'friends',friend_count,
      'visits',visit_count,'weeklyVisits',weekly_visits,'interactions',action_count,'weeklyInteractions',weekly_actions
    )
  ) order by position asc,player_id asc),'[]'::jsonb)
  into rows_json from limited;

  with
  pet_stats as (
    select owner_key,count(*)::integer pet_count,count(distinct species)::integer species_count,
      coalesce(sum(case rarity when 'UR' then 50 when 'SSR' then 20 when 'SR' then 8 when 'R' then 3 else 1 end),0)::integer rarity_points
    from public.mofumori_pets group by owner_key
  ),
  friend_stats as (select owner_key,count(*)::integer friend_count from public.mofumori_friendships group by owner_key),
  visit_stats as (
    select visitor_key user_key,count(*)::integer visit_count,
      count(*) filter(where started_at>=now()-interval '7 days')::integer weekly_visits
    from public.mofumori_visits group by visitor_key
  ),
  action_stats as (
    select actor_key user_key,count(*)::integer action_count,
      count(*) filter(where created_at>=now()-interval '7 days')::integer weekly_actions
    from public.mofumori_visit_actions group by actor_key
  ),
  base as (
    select p.user_key,p.player_id,p.display_name,p.character,
      coalesce(ps.pet_count,0) pet_count,coalesce(ps.species_count,0) species_count,coalesce(ps.rarity_points,0) rarity_points,
      coalesce(fs.friend_count,0) friend_count,coalesce(vs.visit_count,0) visit_count,coalesce(vs.weekly_visits,0) weekly_visits,
      coalesce(a.action_count,0) action_count,coalesce(a.weekly_actions,0) weekly_actions,
      (coalesce(ps.species_count,0)*120+coalesce(ps.pet_count,0)*12+coalesce(ps.rarity_points,0)*9)::bigint collection_score,
      (coalesce(fs.friend_count,0)*100+coalesce(vs.visit_count,0)*35+coalesce(a.action_count,0)*14)::bigint social_score,
      (coalesce(vs.visit_count,0)*90+coalesce(vs.weekly_visits,0)*45+coalesce(a.weekly_actions,0)*18)::bigint explorer_score
    from public.mofumori_profiles p
    left join pet_stats ps on ps.owner_key=p.user_key
    left join friend_stats fs on fs.owner_key=p.user_key
    left join visit_stats vs on vs.user_key=p.user_key
    left join action_stats a on a.user_key=p.user_key
  ),
  scored as (
    select *,case board_name when 'collection' then collection_score when 'social' then social_score when 'explorer' then explorer_score else collection_score+social_score+explorer_score end leaderboard_score from base
  ),
  ranked as (select *,dense_rank() over(order by leaderboard_score desc,player_id asc)::integer position from scored)
  select jsonb_build_object(
    'position',position,'playerId',player_id,'displayName',display_name,'score',leaderboard_score,'character',character,'isMe',true,
    'metrics',jsonb_build_object('pets',pet_count,'species',species_count,'rarityPoints',rarity_points,'friends',friend_count,'visits',visit_count,'weeklyVisits',weekly_visits,'interactions',action_count,'weeklyInteractions',weekly_actions)
  ) into me_json from ranked where user_key=p_user;

  return jsonb_build_object('board',board_name,'generatedAt',clock_timestamp(),'authoritative',true,'rows',rows_json,'me',me_json);
end $$;

revoke all on function public.mofumori_get_leaderboard(text,text,integer) from public, anon, authenticated;
grant execute on function public.mofumori_get_leaderboard(text,text,integer) to service_role;
