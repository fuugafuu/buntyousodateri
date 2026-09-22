-- Mofumori v7.3.3 server latency indexes
create index if not exists mofumori_admin_audit_admin_key_idx on public.mofumori_admin_audit(admin_key);
create index if not exists mofumori_arena_challenges_match_id_idx on public.mofumori_arena_challenges(match_id);
create index if not exists mofumori_arena_challenges_recipient_pet_id_idx on public.mofumori_arena_challenges(recipient_pet_id);
create index if not exists mofumori_arena_challenges_sender_pet_id_idx on public.mofumori_arena_challenges(sender_pet_id);
create index if not exists mofumori_arena_matches_pet1_id_idx on public.mofumori_arena_matches(pet1_id);
create index if not exists mofumori_arena_matches_pet2_id_idx on public.mofumori_arena_matches(pet2_id);
create index if not exists mofumori_arena_matches_winner_key_idx on public.mofumori_arena_matches(winner_key);
create index if not exists mofumori_arena_queue_pet_id_idx on public.mofumori_arena_queue(pet_id);
create index if not exists mofumori_friendships_friend_key_idx on public.mofumori_friendships(friend_key);
create index if not exists mofumori_gifts_sender_key_idx on public.mofumori_gifts(sender_key);
create index if not exists mofumori_profiles_active_pet_id_idx on public.mofumori_profiles(active_pet_id);
create index if not exists mofumori_visit_actions_actor_key_idx on public.mofumori_visit_actions(actor_key);
create index if not exists mofumori_friend_requests_pending_sender_recipient_idx on public.mofumori_friend_requests(status,sender_key,recipient_key) where status='pending';
create index if not exists mofumori_visits_active_host_expires_idx on public.mofumori_visits(host_key,expires_at desc) where ended_at is null;
create index if not exists mofumori_visits_active_visitor_expires_idx on public.mofumori_visits(visitor_key,expires_at desc) where ended_at is null;
