create extension if not exists pgcrypto;

create table if not exists public.mofumori_saves (
  user_key text primary key,
  state jsonb not null,
  saved_at timestamptz not null default now()
);
create table if not exists public.mofumori_profiles (
  user_key text primary key,
  player_id text not null unique check (player_id ~ '^MF-[A-Z0-9]{8}$'),
  display_name text not null,
  score bigint not null default 0 check (score >= 0),
  character jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.mofumori_friendships (
  owner_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  friend_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_key, friend_key),
  check (owner_key <> friend_key)
);
create table if not exists public.mofumori_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  recipient_key text not null references public.mofumori_profiles(user_key) on delete cascade,
  item_code text not null check (item_code ~ '^[a-z_]{2,40}$'),
  quantity integer not null check (quantity between 1 and 5),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_key <> recipient_key)
);
create index if not exists mofumori_profiles_score_idx on public.mofumori_profiles(score desc);
create index if not exists mofumori_gifts_recipient_idx on public.mofumori_gifts(recipient_key, created_at desc);

alter table public.mofumori_saves enable row level security;
alter table public.mofumori_profiles enable row level security;
alter table public.mofumori_friendships enable row level security;
alter table public.mofumori_gifts enable row level security;

create or replace function public.mofumori_send_gift(p_sender text, p_recipient text, p_item text, p_quantity integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare current_state jsonb; current_count integer;
begin
  if not exists(select 1 from public.mofumori_friendships where owner_key=p_sender and friend_key=p_recipient) then raise exception 'not_friends'; end if;
  select state into current_state from public.mofumori_saves where user_key=p_sender for update;
  if current_state is null then raise exception 'save_missing'; end if;
  current_count := coalesce((current_state #>> array['data','inv',p_item])::integer,0);
  if current_count < p_quantity then raise exception 'not_enough'; end if;
  current_state := jsonb_set(current_state,array['data','inv',p_item],to_jsonb(current_count-p_quantity),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_sender;
  insert into public.mofumori_gifts(sender_key,recipient_key,item_code,quantity) values(p_sender,p_recipient,p_item,p_quantity);
  return current_state;
end $$;

create or replace function public.mofumori_claim_gift(p_recipient text, p_gift uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare gift_row public.mofumori_gifts%rowtype; current_state jsonb; current_count integer;
begin
  select * into gift_row from public.mofumori_gifts where id=p_gift and recipient_key=p_recipient for update;
  if gift_row.id is null then raise exception 'gift_missing'; end if;
  if gift_row.claimed_at is not null then raise exception 'already_claimed'; end if;
  select state into current_state from public.mofumori_saves where user_key=p_recipient for update;
  if current_state is null then raise exception 'save_missing'; end if;
  current_count := coalesce((current_state #>> array['data','inv',gift_row.item_code])::integer,0);
  current_state := jsonb_set(current_state,array['data','inv',gift_row.item_code],to_jsonb(current_count+gift_row.quantity),true);
  update public.mofumori_saves set state=current_state,saved_at=now() where user_key=p_recipient;
  update public.mofumori_gifts set claimed_at=now() where id=p_gift;
  return current_state;
end $$;

revoke all on function public.mofumori_send_gift(text,text,text,integer) from public;
revoke all on function public.mofumori_claim_gift(text,uuid) from public;
grant execute on function public.mofumori_send_gift(text,text,text,integer) to service_role;
grant execute on function public.mofumori_claim_gift(text,uuid) to service_role;
