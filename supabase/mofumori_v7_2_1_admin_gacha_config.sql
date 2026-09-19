create table if not exists public.mofumori_game_config(
  key text primary key,value jsonb not null,updated_by text,updated_at timestamptz not null default now()
);
alter table public.mofumori_game_config enable row level security;
revoke all on public.mofumori_game_config from public,anon,authenticated;
grant all on public.mofumori_game_config to service_role;

insert into public.mofumori_game_config(key,value) values('gacha','{"activeBanner":"standard","banners":[{"id":"standard","name":"森の仲間ガチャ","enabled":true,"price1":180,"price10":1600,"rates":{"N":55,"R":27,"SR":13,"SSR":4,"UR":1},"speciesWeights":{"buncho_sakura":16,"buncho_white":14,"buncho_cinnamon":11,"buncho_silver":9,"canary":8,"inko_green":7,"inko_blue":7,"buncho_pied":6,"buncho_black":5,"finch_zebra":5,"lovebird":4,"cockatiel":4,"cat":4,"penguin":4,"beaver":3,"fox":3,"owl":2}}]}'::jsonb)
on conflict(key) do nothing;

create or replace function public.mofumori_admin_adjust_currency(p_admin text,p_player_id text,p_coins bigint default 0,p_gems bigint default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare target_key text;current_state jsonb;coins bigint;gems bigint;
begin
  if not exists(select 1 from public.mofumori_admins where user_key=p_admin and role in ('admin','owner')) then raise exception 'admin_forbidden'; end if;
  if abs(p_coins)>100000000 or abs(p_gems)>1000000 then raise exception 'adjustment_too_large'; end if;
  select user_key into target_key from public.mofumori_profiles where player_id=upper(trim(p_player_id));
  if target_key is null or target_key like 'bot:arena:%' then raise exception 'player_missing'; end if;
  select state into current_state from public.mofumori_saves where user_key=target_key for update;
  if current_state is null then raise exception 'save_missing'; end if;
  coins:=greatest(0,coalesce((current_state#>>array['data','coins'])::bigint,0)+p_coins);
  gems:=greatest(0,coalesce((current_state#>>array['data','gems'])::bigint,0)+p_gems);
  current_state:=jsonb_set(current_state,array['data','coins'],to_jsonb(coins),true);
  current_state:=jsonb_set(current_state,array['data','gems'],to_jsonb(gems),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=target_key;
  return jsonb_build_object('playerId',upper(trim(p_player_id)),'coins',coins,'gems',gems);
end $$;
revoke all on function public.mofumori_admin_adjust_currency(text,text,bigint,bigint) from public,anon,authenticated;
grant execute on function public.mofumori_admin_adjust_currency(text,text,bigint,bigint) to service_role;

create or replace function public.mofumori_award_gacha(p_owner text,p_cost integer,p_pets jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare current_state jsonb;current_coins bigint;inserted_pets jsonb;roll_count integer;
begin
  roll_count:=coalesce(jsonb_array_length(p_pets),0);
  if p_cost<0 or p_cost>100000 or roll_count not in(1,10) then raise exception 'invalid_gacha'; end if;
  select state into current_state from public.mofumori_saves where user_key=p_owner for update;
  if current_state is null then raise exception 'save_missing'; end if;
  current_coins:=coalesce((current_state#>>array['data','coins'])::bigint,0);
  if current_coins<p_cost then raise exception 'not_enough_coins'; end if;
  current_state:=jsonb_set(current_state,array['data','coins'],to_jsonb(current_coins-p_cost),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_owner;
  with rolls as(select * from jsonb_to_recordset(p_pets) as x(species text,rarity text,rank integer,name text,source text)),
  inserted as(
    insert into public.mofumori_pets(owner_key,species,rarity,rank,name,source)
    select p_owner,species,rarity,rank,left(coalesce(nullif(btrim(name),''),species),12),'gacha' from rolls
    where species in('buncho_sakura','buncho_white','buncho_cinnamon','buncho_silver','canary','inko_green','inko_blue','buncho_pied','buncho_black','finch_zebra','lovebird','cockatiel','owl','cat','fox','penguin','beaver')
      and rarity in('N','R','SR','SSR','UR') and rank between 1 and 5
    returning id,owner_key,species,rarity,rank,name,source,obtained_at
  ) select coalesce(jsonb_agg(to_jsonb(inserted)),'[]'::jsonb) into inserted_pets from inserted;
  if jsonb_array_length(inserted_pets)<>roll_count then raise exception 'invalid_gacha_payload'; end if;
  return jsonb_build_object('state',current_state,'pets',inserted_pets);
end $$;
revoke all on function public.mofumori_award_gacha(text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.mofumori_award_gacha(text,integer,jsonb) to service_role;
