create table if not exists public.game_saves (
  user_key text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_profiles (
  user_key text primary key,
  player_id text not null unique,
  display_name text not null,
  score integer not null default 0,
  bird_name text not null,
  bird_species_id text not null,
  bird_asset text not null,
  bird_level integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.friendships (
  owner_key text not null,
  friend_key text not null,
  created_at timestamptz not null default now(),
  primary key (owner_key, friend_key),
  check (owner_key <> friend_key)
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  sender_key text not null,
  recipient_key text not null,
  item_code text not null,
  quantity integer not null check (quantity between 1 and 9),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;
alter table public.social_profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.gifts enable row level security;

create index if not exists social_profiles_score_idx on public.social_profiles (score desc);
create index if not exists friendships_owner_idx on public.friendships (owner_key);
create index if not exists gifts_recipient_idx on public.gifts (recipient_key, claimed_at, created_at desc);

comment on table public.game_saves is 'Server-only versioned JSON save used by Auth.js and Google GIS accounts.';
comment on table public.social_profiles is 'Public-safe bird snapshot and player ID. Mutated through service-role APIs only.';
