create extension if not exists pgcrypto;

create type public.bird_rarity as enum ('Common', 'Rare', 'Super Rare', 'Ultra Rare');
create type public.battle_status as enum ('waiting', 'running', 'finished', 'disqualified');
create type public.battle_mode as enum ('online', 'offline');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '飼い主',
  coins integer not null default 0 check (coins >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bird_species (
  id text primary key,
  name text not null,
  rarity public.bird_rarity not null,
  description text not null,
  asset_path text not null,
  base_stats jsonb not null,
  personality text not null,
  specialty text not null,
  hobby text not null,
  favorite_activity text not null,
  acquisition_hint text not null
);

create table public.owned_birds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  species_id text not null references public.bird_species(id),
  nickname text not null check (char_length(nickname) between 1 and 16),
  level integer not null default 1 check (level > 0),
  exp integer not null default 0 check (exp >= 0),
  stats jsonb not null,
  condition jsonb not null,
  personality text not null,
  specialty text not null,
  hobby text not null,
  favorite_activity text not null,
  selected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index owned_birds_one_selected_per_user
  on public.owned_birds(user_id)
  where selected;

create table public.items_master (
  code text primary key,
  display_name text not null,
  description text not null,
  consume_time_sec integer not null default 0 check (consume_time_sec >= 0),
  effect_json jsonb not null,
  price_coin integer not null check (price_coin >= 0),
  asset_path text not null
);

create table public.inventories (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_code text not null references public.items_master(code),
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_code)
);

create table public.care_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bird_id uuid not null references public.owned_birds(id) on delete cascade,
  action text not null check (action in ('feed', 'water', 'rest', 'pet')),
  coin_reward integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.gacha_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pulls integer not null check (pulls in (1, 10)),
  cost integer not null check (cost >= 0),
  result_bird_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.battle_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode public.battle_mode not null,
  level_bracket integer not null default 1,
  status public.battle_status not null default 'waiting',
  selected_bird_id uuid not null references public.owned_birds(id),
  max_taps_per_sec numeric(6,2) not null,
  raw_taps integer not null default 0,
  accepted_taps integer not null default 0,
  score integer not null default 0,
  suspicious_packets integer not null default 0,
  last_seq integer not null default 0,
  last_received_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  finishes_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.battle_entries (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  bird_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table public.battle_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null default 0,
  accepted_taps integer not null default 0,
  disqualified boolean not null default false,
  reward_coin integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.battle_logs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.owned_birds enable row level security;
alter table public.inventories enable row level security;
alter table public.care_logs enable row level security;
alter table public.gacha_logs enable row level security;
alter table public.battle_rooms enable row level security;
alter table public.battle_entries enable row level security;
alter table public.battle_results enable row level security;
alter table public.battle_logs enable row level security;
alter table public.bird_species enable row level security;
alter table public.items_master enable row level security;
alter table public.app_settings enable row level security;

create policy "species readable" on public.bird_species for select using (true);
create policy "items readable" on public.items_master for select using (true);

create policy "profiles own read" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owned birds own read" on public.owned_birds for select using (auth.uid() = user_id);
create policy "owned birds own update" on public.owned_birds for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "inventory own read" on public.inventories for select using (auth.uid() = user_id);
create policy "care own read" on public.care_logs for select using (auth.uid() = user_id);
create policy "gacha own read" on public.gacha_logs for select using (auth.uid() = user_id);
create policy "battle rooms own read" on public.battle_rooms for select using (auth.uid() = user_id);
create policy "battle entries own read" on public.battle_entries for select using (auth.uid() = user_id);
create policy "battle results own read" on public.battle_results for select using (auth.uid() = user_id);
create policy "battle logs own read" on public.battle_logs for select using (auth.uid() = user_id);

insert into public.bird_species
  (id, name, rarity, description, asset_path, base_stats, personality, specialty, hobby, favorite_activity, acquisition_hint)
values
  ('sakura', 'さくら文鳥', 'Common', 'はじめての相棒に向いた文鳥。', '/images/birds/sakura.svg', '{"speed":48,"voice":44,"flight":46,"clingy":52,"appetite":50}', '人なつっこい', '初速ダッシュ', '止まり木パトロール', 'なでられること', '最初に1羽配布されます。'),
  ('white', '白文鳥', 'Rare', '落ち着いた身のこなしの文鳥。', '/images/birds/white.svg', '{"speed":53,"voice":42,"flight":57,"clingy":45,"appetite":49}', 'おっとり', '安定食べ', '水浴び', '静かな日なたぼっこ', 'ガチャから排出されます。'),
  ('cinnamon', 'シナモン文鳥', 'Super Rare', '短期決戦に向いた文鳥。', '/images/birds/cinnamon.svg', '{"speed":62,"voice":47,"flight":58,"clingy":50,"appetite":64}', '負けず嫌い', '高速ついばみ', '豆苗チェック', '小松菜を選ぶこと', 'Rare以上確定枠で狙いやすくなります。'),
  ('sakura-white-mix', '桜白ミックス', 'Ultra Rare', '珍しいミックス系の文鳥。', '/images/birds/sakura-white-mix.svg', '{"speed":70,"voice":55,"flight":72,"clingy":68,"appetite":61}', 'スター気質', 'ふわり先制', 'ガチャ演出を眺める', 'ほめられること', 'Ultra Rareとして低確率で排出されます。')
on conflict (id) do nothing;

insert into public.items_master
  (code, display_name, description, consume_time_sec, effect_json, price_coin, asset_path)
values
  ('komatsuna', '小松菜', '体力とエネルギーを回復。完食まで少し時間がかかる。', 45, '{"stamina":18,"energy":16,"fullness":12,"mood":4}', 90, '/images/items/komatsuna.svg'),
  ('toumyou', '豆苗', '体力とエネルギーを回復。小松菜高速食べの気分が上がる。', 50, '{"stamina":16,"energy":18,"fullness":14,"mood":6}', 100, '/images/items/toumyou.svg'),
  ('canary_seed', 'カナリーシード', '少量回復だが、すぐ食べられる。', 0, '{"stamina":8,"energy":8,"fullness":8}', 60, '/images/items/canary-seed.svg'),
  ('super_komatsuna', 'スーパー小松菜', '全ステータスを大きく回復。', 75, '{"stamina":35,"energy":35,"fullness":25,"hydration":12,"mood":18}', 220, '/images/items/super-komatsuna.svg')
on conflict (code) do nothing;

create or replace function public.rename_bird(p_bird_id uuid, p_nickname text)
returns public.owned_birds
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.owned_birds;
begin
  if char_length(trim(p_nickname)) < 1 or char_length(trim(p_nickname)) > 16 then
    raise exception 'invalid nickname';
  end if;

  update public.owned_birds
    set nickname = trim(p_nickname), updated_at = now()
    where id = p_bird_id and user_id = auth.uid()
    returning * into row;

  if row.id is null then
    raise exception 'bird not found';
  end if;

  return row;
end;
$$;

create or replace function public.give_care_reward(p_bird_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reward integer;
  owned public.owned_birds;
begin
  select * into owned from public.owned_birds where id = p_bird_id and user_id = auth.uid() for update;
  if owned.id is null then
    raise exception 'bird not found';
  end if;

  reward := case p_action
    when 'feed' then 16
    when 'water' then 14
    when 'rest' then 10
    when 'pet' then 12
    else null
  end;

  if reward is null then
    raise exception 'invalid care action';
  end if;

  update public.profiles
    set coins = coins + reward, updated_at = now()
    where user_id = auth.uid();

  insert into public.care_logs(user_id, bird_id, action, coin_reward)
  values (auth.uid(), p_bird_id, p_action, reward);

  return jsonb_build_object('coin_reward', reward, 'bird_id', p_bird_id);
end;
$$;

create or replace function public.use_item_on_bird(p_bird_id uuid, p_item_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  owned public.owned_birds;
  item public.items_master;
begin
  select * into owned from public.owned_birds where id = p_bird_id and user_id = auth.uid() for update;
  if owned.id is null then
    raise exception 'bird not found';
  end if;

  select * into item from public.items_master where code = p_item_code;
  if item.code is null then
    raise exception 'item not found';
  end if;

  update public.inventories
    set quantity = quantity - 1, updated_at = now()
    where user_id = auth.uid() and item_code = p_item_code and quantity > 0;

  if not found then
    raise exception 'item not owned';
  end if;

  update public.owned_birds
    set condition = condition || item.effect_json,
        updated_at = now()
    where id = p_bird_id and user_id = auth.uid();

  return jsonb_build_object('bird_id', p_bird_id, 'item_code', p_item_code, 'effect', item.effect_json);
end;
$$;

create or replace function public.perform_gacha(p_pulls integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cost integer;
  current_coins integer;
  log_id uuid;
begin
  if p_pulls not in (1, 10) then
    raise exception 'invalid pull count';
  end if;

  cost := case when p_pulls = 10 then 1200 else 250 end;

  select coins into current_coins from public.profiles where user_id = auth.uid() for update;
  if current_coins is null or current_coins < cost then
    raise exception 'not enough coins';
  end if;

  update public.profiles
    set coins = coins - cost, updated_at = now()
    where user_id = auth.uid();

  insert into public.gacha_logs(user_id, pulls, cost, result_bird_ids)
  values (auth.uid(), p_pulls, cost, '{}')
  returning id into log_id;

  return jsonb_build_object('gacha_log_id', log_id, 'pulls', p_pulls, 'cost', cost);
end;
$$;

create or replace function public.finalize_battle_result(p_room_id uuid)
returns public.battle_results
language plpgsql
security definer
set search_path = public
as $$
declare
  room public.battle_rooms;
  result public.battle_results;
begin
  select * into room from public.battle_rooms where id = p_room_id and user_id = auth.uid() for update;
  if room.id is null then
    raise exception 'room not found';
  end if;

  update public.battle_rooms
    set status = case when room.suspicious_packets >= 4 then 'disqualified'::public.battle_status else 'finished'::public.battle_status end
    where id = p_room_id;

  insert into public.battle_results(room_id, user_id, score, accepted_taps, disqualified, reward_coin)
  values (
    p_room_id,
    auth.uid(),
    room.score,
    room.accepted_taps,
    room.suspicious_packets >= 4,
    case when room.mode = 'online' and room.suspicious_packets < 4 then least(80, room.score / 20) else 0 end
  )
  returning * into result;

  return result;
end;
$$;
