-- Mofumori v5.1: one-time legacy migration marker, reward pets, longer player IDs
-- Run after mofumori_v5.sql.

alter table public.mofumori_profiles
  add column if not exists pets_migrated_at timestamptz;

alter table public.mofumori_pets
  drop constraint if exists mofumori_pets_source_check;

alter table public.mofumori_pets
  add constraint mofumori_pets_source_check
  check (source in ('starter','legacy','gacha','reward'));

alter table public.mofumori_profiles
  drop constraint if exists mofumori_profiles_player_id_check;

alter table public.mofumori_profiles
  add constraint mofumori_profiles_player_id_check
  check (player_id ~ '^MF-[A-Z0-9]{8,12}$');
