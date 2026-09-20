-- Mofumori v7.2.4: duplicate fusion + online battle win rewards
alter table public.mofumori_pets
  add column if not exists custom_named boolean not null default false,
  add column if not exists fusion_level smallint not null default 0,
  add column if not exists fusion_count integer not null default 0,
  add column if not exists fused_at timestamptz;

do $$
begin
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_fusion_level_check') then
    alter table public.mofumori_pets add constraint mofumori_pets_fusion_level_check check (fusion_level between 0 and 20);
  end if;
  if not exists(select 1 from pg_constraint where conname='mofumori_pets_fusion_count_check') then
    alter table public.mofumori_pets add constraint mofumori_pets_fusion_count_check check (fusion_count >= 0);
  end if;
end $$;

update public.mofumori_pets
set custom_named = (
  name <> case species
    when 'buncho_sakura' then '桜文鳥' when 'buncho_white' then '白文鳥'
    when 'buncho_cinnamon' then 'シナモン文鳥' when 'buncho_silver' then 'シルバー文鳥'
    when 'canary' then 'カナリア' when 'inko_green' then 'セキセイインコ'
    when 'inko_blue' then '青インコ' when 'buncho_pied' then '白黒文鳥'
    when 'buncho_black' then '黒文鳥' when 'finch_zebra' then 'キンカチョウ'
    when 'lovebird' then 'コザクラインコ' when 'cockatiel' then 'オカメインコ'
    when 'owl' then 'フクロウ' when 'cat' then 'ねこ' when 'fox' then 'きつね'
    when 'penguin' then 'ペンギン' when 'beaver' then 'ビーバー'
    when 'fuga' then 'ふうが' else species end
)
where fusion_level=0 and fusion_count=0;

alter table public.mofumori_arena_matches
  add column if not exists reward_coins integer not null default 0,
  add column if not exists reward_xp integer not null default 0,
  add column if not exists reward_awarded_at timestamptz;

create or replace function public.mofumori_fuse_pets(p_owner text,p_target uuid,p_materials uuid[])
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  t public.mofumori_pets%rowtype;
  material_count integer;
  valid_count integer;
  new_level integer;
begin
  material_count:=coalesce(array_length(p_materials,1),0);
  if material_count<1 or material_count>20 then raise exception 'invalid_material_count'; end if;
  if p_target=any(p_materials) then raise exception 'target_in_materials'; end if;
  if (select count(distinct x) from unnest(p_materials)x)<>material_count then raise exception 'duplicate_material'; end if;

  select * into t from public.mofumori_pets where id=p_target and owner_key=p_owner for update;
  if t.id is null then raise exception 'target_missing'; end if;
  if t.custom_named then raise exception 'target_protected'; end if;
  if t.fusion_level+material_count>20 then raise exception 'fusion_level_max'; end if;

  if exists(select 1 from public.mofumori_arena_matches m where m.status in ('ready','running') and m.expires_at>now() and (m.pet1_id=p_target or m.pet2_id=p_target))
    or exists(select 1 from public.mofumori_visits v where v.ended_at is null and v.expires_at>now() and v.pet_id=p_target)
  then raise exception 'target_busy'; end if;

  select count(*) into valid_count
  from public.mofumori_pets p
  where p.owner_key=p_owner and p.id=any(p_materials) and p.id<>p_target and p.species=t.species
    and p.custom_named=false and p.fusion_level=0
    and not exists(select 1 from public.mofumori_profiles pr where pr.user_key=p_owner and pr.active_pet_id=p.id)
    and not exists(select 1 from public.mofumori_visits v where v.ended_at is null and v.expires_at>now() and v.pet_id=p.id)
    and not exists(select 1 from public.mofumori_arena_matches m where m.status in ('ready','running') and m.expires_at>now() and (m.pet1_id=p.id or m.pet2_id=p.id));
  if valid_count<>material_count then raise exception 'material_invalid_or_protected'; end if;

  perform 1 from public.mofumori_pets p where p.owner_key=p_owner and p.id=any(p_materials) for update;
  new_level:=t.fusion_level+material_count;

  update public.mofumori_pets
  set fusion_level=new_level,fusion_count=fusion_count+material_count,fused_at=now(),
      endurance=least(120,endurance+2.5*material_count),agility=least(120,agility+2.5*material_count),
      flight_power=least(120,flight_power+2.5*material_count),focus=least(120,focus+2.5*material_count),
      beak_speed=least(120,beak_speed+2.5*material_count),balance=least(120,balance+2.5*material_count),
      fitness=least(120,fitness+2.5*material_count),stats_updated_at=now()
  where id=p_target and owner_key=p_owner;

  delete from public.mofumori_pets where owner_key=p_owner and id=any(p_materials);
  select * into t from public.mofumori_pets where id=p_target;
  return jsonb_build_object('targetId',t.id,'species',t.species,'fusionLevel',t.fusion_level,'fusionCount',t.fusion_count,'consumed',material_count,'statGain',2.5*material_count);
end
$$;
revoke execute on function public.mofumori_fuse_pets(text,uuid,uuid[]) from public,anon,authenticated;
grant execute on function public.mofumori_fuse_pets(text,uuid,uuid[]) to service_role;

create or replace function public.mofumori_arena_submit(p_user text,p_match uuid,p_score integer,p_detail jsonb)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  m public.mofumori_arena_matches%rowtype;
  win text;
  opponent_key text;
  reward_state jsonb;
  current_coins bigint;
  coins_gain integer:=0;
  xp_gain integer:=0;
begin
  if p_score<0 or p_score>1000000 then raise exception 'invalid_score'; end if;
  select * into m from public.mofumori_arena_matches where id=p_match and (player1_key=p_user or player2_key=p_user) for update;
  if m.id is null then raise exception 'match_forbidden'; end if;
  if m.status in ('finished','abandoned') then return to_jsonb(m); end if;
  if now()<m.starts_at-interval '1 second' then raise exception 'match_not_started'; end if;

  if m.player1_key=p_user then
    if m.p1_score is null then update public.mofumori_arena_matches set p1_score=p_score,p1_detail=p_detail,status='running' where id=m.id; end if;
  else
    if m.p2_score is null then update public.mofumori_arena_matches set p2_score=p_score,p2_detail=p_detail,status='running' where id=m.id; end if;
  end if;
  select * into m from public.mofumori_arena_matches where id=p_match for update;

  if m.p1_score is not null and m.p2_score is not null then
    if m.p1_score>m.p2_score then win:=m.player1_key;
    elsif m.p2_score>m.p1_score then win:=m.player2_key;
    else win:=null;
    end if;

    if win is null then
      update public.mofumori_pets set arena_draws=arena_draws+1,arena_rating=least(3000,arena_rating+1) where id in (m.pet1_id,m.pet2_id);
    elsif win=m.player1_key then
      update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet1_id;
      update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet2_id;
    else
      update public.mofumori_pets set arena_wins=arena_wins+1,arena_rating=least(3000,arena_rating+18) where id=m.pet2_id;
      update public.mofumori_pets set arena_losses=arena_losses+1,arena_rating=greatest(600,arena_rating-12) where id=m.pet1_id;
    end if;

    if win is not null and win not like 'bot:arena:%' then
      opponent_key:=case when win=m.player1_key then m.player2_key else m.player1_key end;
      if opponent_key like 'bot:arena:%' then coins_gain:=80;xp_gain:=20;else coins_gain:=150;xp_gain:=35;end if;

      select state into reward_state from public.mofumori_saves where user_key=win for update;
      if reward_state is not null then
        current_coins:=coalesce((reward_state #>> array['data','coins'])::bigint,0);
        reward_state:=jsonb_set(reward_state,array['data','coins'],to_jsonb(current_coins+coins_gain),true);
        reward_state:=jsonb_set(reward_state,array['savedAt'],to_jsonb(to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),true);
        update public.mofumori_saves set state=reward_state,saved_at=now() where user_key=win;
        update public.mofumori_profiles set forest_xp=coalesce(forest_xp,0)+xp_gain,updated_at=now() where user_key=win;
      else
        coins_gain:=0;xp_gain:=0;
      end if;
    end if;

    update public.mofumori_arena_matches
    set status='finished',winner_key=win,finished_at=now(),reward_coins=coins_gain,reward_xp=xp_gain,
        reward_awarded_at=case when coins_gain>0 or xp_gain>0 then now() else null end
    where id=m.id returning * into m;
  end if;
  return to_jsonb(m);
end
$$;
revoke execute on function public.mofumori_arena_submit(text,uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.mofumori_arena_submit(text,uuid,integer,jsonb) to service_role;


-- Bulk gifts and live visit care
create or replace function public.mofumori_send_gift(
  p_sender text,p_recipient text,p_item text,p_quantity integer
) returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare current_state jsonb; current_count integer;
begin
  if p_quantity is null or p_quantity<1 or p_quantity>9999 then raise exception 'invalid_quantity'; end if;
  if not exists(select 1 from public.mofumori_friendships where owner_key=p_sender and friend_key=p_recipient) then raise exception 'not_friends'; end if;
  select state into current_state from public.mofumori_saves where user_key=p_sender for update;
  if current_state is null then raise exception 'save_missing'; end if;
  current_count:=coalesce((current_state #>> array['data','inv',p_item])::integer,0);
  if current_count<p_quantity then raise exception 'not_enough'; end if;
  current_state:=jsonb_set(current_state,array['data','inv',p_item],to_jsonb(current_count-p_quantity),true);
  current_state:=jsonb_set(current_state,array['savedAt'],to_jsonb(to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_sender;
  insert into public.mofumori_gifts(sender_key,recipient_key,item_code,quantity) values(p_sender,p_recipient,p_item,p_quantity);
  return current_state;
end
$$;
revoke execute on function public.mofumori_send_gift(text,text,text,integer) from public,anon,authenticated;
grant execute on function public.mofumori_send_gift(text,text,text,integer) to service_role;

create or replace function public.mofumori_claim_all_gifts(p_recipient text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare current_state jsonb; r record; current_count integer; gift_count integer:=0; item_count integer:=0;
begin
  select state into current_state from public.mofumori_saves where user_key=p_recipient for update;
  if current_state is null then raise exception 'save_missing'; end if;
  perform 1 from public.mofumori_gifts where recipient_key=p_recipient and claimed_at is null for update;
  select count(*),coalesce(sum(quantity),0) into gift_count,item_count from public.mofumori_gifts where recipient_key=p_recipient and claimed_at is null;
  if gift_count=0 then return jsonb_build_object('state',current_state,'claimedCount',0,'itemCount',0); end if;
  for r in select item_code,sum(quantity)::integer qty from public.mofumori_gifts where recipient_key=p_recipient and claimed_at is null group by item_code loop
    current_count:=coalesce((current_state #>> array['data','inv',r.item_code])::integer,0);
    current_state:=jsonb_set(current_state,array['data','inv',r.item_code],to_jsonb(current_count+r.qty),true);
  end loop;
  current_state:=jsonb_set(current_state,array['savedAt'],to_jsonb(to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_recipient;
  update public.mofumori_gifts set claimed_at=now() where recipient_key=p_recipient and claimed_at is null;
  return jsonb_build_object('state',current_state,'claimedCount',gift_count,'itemCount',item_count);
end
$$;
revoke execute on function public.mofumori_claim_all_gifts(text) from public,anon,authenticated;
grant execute on function public.mofumori_claim_all_gifts(text) to service_role;

create or replace function public.mofumori_visit_care(p_user text,p_visit uuid,p_action text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare visit_row public.mofumori_visits%rowtype; care_result jsonb;
begin
  if p_action not in ('feed','treat','play','sing','bath','pet') then raise exception 'invalid_care_action'; end if;
  select * into visit_row from public.mofumori_visits where id=p_visit and ended_at is null and expires_at>now() for update;
  if visit_row.id is null or visit_row.host_key<>p_user then raise exception 'visit_care_forbidden'; end if;
  select public.mofumori_record_pet_care(visit_row.visitor_key,visit_row.pet_id,p_action) into care_result;
  insert into public.mofumori_visit_actions(visit_id,actor_key,action) values(p_visit,p_user,'care:'||p_action);
  update public.mofumori_visits set last_action='care:'||p_action,interaction_count=interaction_count+1 where id=p_visit returning * into visit_row;
  return jsonb_build_object('visit',to_jsonb(visit_row),'stats',care_result);
end
$$;
revoke execute on function public.mofumori_visit_care(text,uuid,text) from public,anon,authenticated;
grant execute on function public.mofumori_visit_care(text,uuid,text) to service_role;


alter table public.mofumori_gifts drop constraint if exists mofumori_gifts_quantity_check;
alter table public.mofumori_gifts add constraint mofumori_gifts_quantity_check check (quantity between 1 and 9999);

alter table public.mofumori_visit_actions drop constraint if exists mofumori_visit_actions_action_check;
alter table public.mofumori_visit_actions add constraint mofumori_visit_actions_action_check check (
  action in (
    'greet','pet','play','share_seed',
    'care:feed','care:treat','care:play','care:sing','care:bath','care:pet'
  )
);
