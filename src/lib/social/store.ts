import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api";
import { items, species } from "@/lib/game/data";
import { persistGameState, prepareGameState } from "@/lib/game/persistence";
import { addInventoryItem, getGameState, takeInventoryItem } from "@/lib/game/store";
import type { GameState } from "@/lib/game/types";
import type { GrowthMission, SocialBirdCard, SocialDashboard, SocialGift } from "@/lib/social/types";
import { getSupabaseServiceClient, hasSupabaseConfig } from "@/lib/supabase/server";

type StoredProfile = SocialBirdCard & { userKey: string };
type StoredGift = {
  id: string;
  senderKey: string;
  recipientKey: string;
  itemCode: string;
  quantity: number;
  claimedAt: string | null;
  createdAt: string;
};

type SocialMemory = {
  profiles: Map<string, StoredProfile>;
  friends: Map<string, Set<string>>;
  gifts: StoredGift[];
};

const globalForSocial = globalThis as typeof globalThis & { __bunchoSocialStore?: SocialMemory };
const memory = globalForSocial.__bunchoSocialStore ?? {
  profiles: new Map<string, StoredProfile>(),
  friends: new Map<string, Set<string>>(),
  gifts: [],
};
globalForSocial.__bunchoSocialStore = memory;

const demoProfiles: StoredProfile[] = [
  { userKey: "bot:mochi", playerId: "BF-MOCHI01", displayName: "もち飼い", birdName: "もち", speciesId: "white", birdAsset: "/images/birds/white.svg", birdLevel: 18, score: 4820 },
  { userKey: "bot:kinako", playerId: "BF-KINAKO2", displayName: "きなこ部", birdName: "きなこ", speciesId: "cinnamon", birdAsset: "/images/birds/cinnamon.svg", birdLevel: 15, score: 4210 },
  { userKey: "bot:sora", playerId: "BF-SORA003", displayName: "空の止まり木", birdName: "そら", speciesId: "sakura-white-mix", birdAsset: "/images/birds/sakura-white-mix.svg", birdLevel: 12, score: 3690 },
];

function seedMemory() {
  for (const profile of demoProfiles) memory.profiles.set(profile.userKey, profile);
}

function normalizePlayerId(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function createPlayerId(userId: string) {
  const token = createHash("sha256").update(`mofumori:${userId}`).digest("hex").slice(0, 8).toUpperCase();
  return `BF-${token}`;
}

function scoreFor(state: GameState) {
  const birdScore = state.ownedBirds.reduce((sum, bird) => sum + bird.level * 120 + bird.exp * 2, 0);
  return Math.round(birdScore + state.profile.coins + state.careLogs.length * 18 + state.battleRooms.filter((room) => room.result === "win").length * 160);
}

function profileFor(userId: string, state: GameState): StoredProfile {
  const selected = state.selectedBird;
  const birdSpecies = state.species.find((entry) => entry.id === selected.speciesId) ?? species[0];
  return {
    userKey: userId,
    playerId: createPlayerId(userId),
    displayName: state.profile.displayName,
    birdName: selected.nickname,
    speciesId: selected.speciesId,
    birdAsset: birdSpecies.asset,
    birdLevel: selected.level,
    score: scoreFor(state),
  };
}

function publicProfile(profile: StoredProfile): SocialBirdCard {
  return {
    playerId: profile.playerId,
    displayName: profile.displayName,
    birdName: profile.birdName,
    speciesId: profile.speciesId,
    birdAsset: profile.birdAsset,
    birdLevel: profile.birdLevel,
    score: profile.score,
  };
}

async function syncProfile(userId: string, state: GameState) {
  const profile = profileFor(userId, state);
  memory.profiles.set(userId, profile);
  if (hasSupabaseConfig()) {
    const { error } = await getSupabaseServiceClient().from("social_profiles").upsert({
      user_key: userId,
      player_id: profile.playerId,
      display_name: profile.displayName,
      score: profile.score,
      bird_name: profile.birdName,
      bird_species_id: profile.speciesId,
      bird_asset: profile.birdAsset,
      bird_level: profile.birdLevel,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_key" });
    if (error) throw new Error(`プロフィール同期に失敗しました: ${error.message}`);
  }
  return profile;
}

function fromDatabaseProfile(row: Record<string, unknown>): StoredProfile {
  return {
    userKey: String(row.user_key),
    playerId: String(row.player_id),
    displayName: String(row.display_name),
    birdName: String(row.bird_name),
    speciesId: String(row.bird_species_id),
    birdAsset: String(row.bird_asset),
    birdLevel: Number(row.bird_level),
    score: Number(row.score),
  };
}

function buildMissions(state: GameState): GrowthMission[] {
  const today = new Date().toISOString().slice(0, 10);
  const careToday = state.careLogs.filter((log) => log.createdAt.startsWith(today)).length;
  const battlesToday = state.battleRooms.filter((room) => room.startedAt.startsWith(today)).length;
  const mood = state.selectedBird.condition.mood;
  return [
    { id: "care", label: "3回お世話", detail: "毎日のふれあいで絆ポイント", current: Math.min(careToday, 3), target: 3, complete: careToday >= 3 },
    { id: "mood", label: "ごきげん80以上", detail: "なでたり好物をあげよう", current: Math.min(mood, 80), target: 80, complete: mood >= 80 },
    { id: "battle", label: "バトルに1回挑戦", detail: "練習モードでも達成", current: Math.min(battlesToday, 1), target: 1, complete: battlesToday >= 1 },
  ];
}

function streakDays(state: GameState) {
  const days = new Set(state.careLogs.map((log) => log.createdAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function bondFor(state: GameState) {
  const score = state.ownedBirds.reduce((sum, bird) => sum + bird.level * 100 + bird.exp, 0) + state.careLogs.length * 12;
  const titles = ["はじめまして", "なかよし", "大切な相棒", "ずっと一緒"];
  const tier = Math.min(3, Math.floor(score / 1000));
  return { title: titles[tier], score, nextAt: (tier + 1) * 1000, streakDays: streakDays(state) };
}

function giftView(gift: StoredGift, sender: StoredProfile): SocialGift {
  const master = items.find((item) => item.code === gift.itemCode);
  return {
    id: gift.id,
    senderName: sender.displayName,
    senderPlayerId: sender.playerId,
    itemCode: gift.itemCode,
    itemName: master?.name ?? gift.itemCode,
    itemAsset: master?.asset ?? "/images/items/canary-seed.svg",
    quantity: gift.quantity,
    createdAt: gift.createdAt,
  };
}

export async function getSocialDashboard(userId: string): Promise<SocialDashboard> {
  seedMemory();
  const state = await prepareGameState(userId);
  const me = await syncProfile(userId, state);
  let profiles: StoredProfile[];
  let friendProfiles: StoredProfile[];
  let inbox: SocialGift[];

  if (hasSupabaseConfig()) {
    const client = getSupabaseServiceClient();
    const [{ data: ranked, error: rankError }, { data: friendRows, error: friendError }, { data: giftRows, error: giftError }] = await Promise.all([
      client.from("social_profiles").select("*").order("score", { ascending: false }).limit(50),
      client.from("friendships").select("friend_key").eq("owner_key", userId),
      client.from("gifts").select("*").eq("recipient_key", userId).is("claimed_at", null).order("created_at", { ascending: false }).limit(20),
    ]);
    if (rankError || friendError || giftError) throw new Error(rankError?.message ?? friendError?.message ?? giftError?.message);
    profiles = (ranked ?? []).map((row) => fromDatabaseProfile(row));
    const friendKeys = (friendRows ?? []).map((row) => String(row.friend_key));
    if (friendKeys.length) {
      const { data, error } = await client.from("social_profiles").select("*").in("user_key", friendKeys);
      if (error) throw new Error(error.message);
      friendProfiles = (data ?? []).map((row) => fromDatabaseProfile(row));
    } else friendProfiles = [];
    const senderKeys = [...new Set((giftRows ?? []).map((row) => String(row.sender_key)))];
    const senderMap = new Map<string, StoredProfile>();
    if (senderKeys.length) {
      const { data, error } = await client.from("social_profiles").select("*").in("user_key", senderKeys);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) senderMap.set(String(row.user_key), fromDatabaseProfile(row));
    }
    inbox = (giftRows ?? []).flatMap((row) => {
      const sender = senderMap.get(String(row.sender_key));
      return sender ? [giftView({ id: String(row.id), senderKey: String(row.sender_key), recipientKey: userId, itemCode: String(row.item_code), quantity: Number(row.quantity), claimedAt: null, createdAt: String(row.created_at) }, sender)] : [];
    });
  } else {
    profiles = [...memory.profiles.values()];
    const friendKeys = memory.friends.get(userId) ?? new Set<string>();
    friendProfiles = [...friendKeys].flatMap((key) => memory.profiles.get(key) ?? []);
    inbox = memory.gifts.filter((gift) => gift.recipientKey === userId && !gift.claimedAt).flatMap((gift) => {
      const sender = memory.profiles.get(gift.senderKey);
      return sender ? [giftView(gift, sender)] : [];
    });
  }

  const leaderboard = profiles.sort((a, b) => b.score - a.score).slice(0, 20).map((profile, index) => ({ ...publicProfile(profile), rank: index + 1 }));
  const meRank = leaderboard.find((entry) => entry.playerId === me.playerId)?.rank ?? Math.max(1, leaderboard.length + 1);

  return {
    me: { ...publicProfile(me), rank: meRank },
    friends: friendProfiles.map(publicProfile),
    leaderboard,
    inbox,
    inventory: state.inventory.filter((entry) => entry.quantity > 0).flatMap((entry) => {
      const master = items.find((item) => item.code === entry.itemCode);
      return master ? [{ itemCode: entry.itemCode, name: master.name, asset: master.asset, quantity: entry.quantity }] : [];
    }),
    missions: buildMissions(state),
    bond: bondFor(state),
    suggestedPlayerIds: demoProfiles.map((profile) => profile.playerId),
    cloudEnabled: hasSupabaseConfig(),
  };
}

async function findProfileByPlayerId(playerId: string) {
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseServiceClient().from("social_profiles").select("*").eq("player_id", playerId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromDatabaseProfile(data) : null;
  }
  return [...memory.profiles.values()].find((profile) => profile.playerId === playerId) ?? null;
}

export async function addFriend(userId: string, inputPlayerId: string) {
  await getSocialDashboard(userId);
  const playerId = normalizePlayerId(inputPlayerId);
  const target = await findProfileByPlayerId(playerId);
  const me = memory.profiles.get(userId) ?? profileFor(userId, getGameState(userId));
  if (!target) throw new ApiError(404, "そのプレイヤーIDは見つかりません。");
  if (target.userKey === userId) throw new ApiError(400, "自分自身はフレンドに追加できません。");

  if (hasSupabaseConfig()) {
    const { error } = await getSupabaseServiceClient().from("friendships").upsert([
      { owner_key: userId, friend_key: target.userKey },
      { owner_key: target.userKey, friend_key: userId },
    ], { onConflict: "owner_key,friend_key" });
    if (error) throw new Error(error.message);
  } else {
    const mine = memory.friends.get(userId) ?? new Set<string>();
    mine.add(target.userKey);
    memory.friends.set(userId, mine);
    const theirs = memory.friends.get(target.userKey) ?? new Set<string>();
    theirs.add(userId);
    memory.friends.set(target.userKey, theirs);
    memory.profiles.set(userId, me);
  }
  return getSocialDashboard(userId);
}

async function assertFriend(userId: string, targetKey: string) {
  if (hasSupabaseConfig()) {
    const { data, error } = await getSupabaseServiceClient().from("friendships").select("owner_key").eq("owner_key", userId).eq("friend_key", targetKey).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new ApiError(403, "フレンドにだけ仕送りできます。");
  } else if (!memory.friends.get(userId)?.has(targetKey)) {
    throw new ApiError(403, "フレンドにだけ仕送りできます。");
  }
}

export async function sendGift(userId: string, friendPlayerId: string, itemCode: string, quantity: number) {
  await getSocialDashboard(userId);
  const target = await findProfileByPlayerId(normalizePlayerId(friendPlayerId));
  if (!target) throw new ApiError(404, "送り先が見つかりません。");
  await assertFriend(userId, target.userKey);
  takeInventoryItem(userId, itemCode, quantity);
  await persistGameState(userId);

  try {
    if (hasSupabaseConfig()) {
      const { error } = await getSupabaseServiceClient().from("gifts").insert({ sender_key: userId, recipient_key: target.userKey, item_code: itemCode, quantity });
      if (error) throw new Error(error.message);
    } else {
      memory.gifts.push({ id: randomUUID(), senderKey: userId, recipientKey: target.userKey, itemCode, quantity, claimedAt: null, createdAt: new Date().toISOString() });
    }
  } catch (error) {
    addInventoryItem(userId, itemCode, quantity);
    await persistGameState(userId);
    throw error;
  }
  return getSocialDashboard(userId);
}

export async function claimGift(userId: string, giftId: string) {
  await getSocialDashboard(userId);
  let itemCode: string;
  let quantity: number;
  if (hasSupabaseConfig()) {
    const client = getSupabaseServiceClient();
    const { data, error } = await client.from("gifts").update({ claimed_at: new Date().toISOString() }).eq("id", giftId).eq("recipient_key", userId).is("claimed_at", null).select("item_code,quantity").maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new ApiError(404, "仕送りが見つからないか、受取済みです。");
    itemCode = String(data.item_code);
    quantity = Number(data.quantity);
  } else {
    const gift = memory.gifts.find((entry) => entry.id === giftId && entry.recipientKey === userId && !entry.claimedAt);
    if (!gift) throw new ApiError(404, "仕送りが見つからないか、受取済みです。");
    gift.claimedAt = new Date().toISOString();
    itemCode = gift.itemCode;
    quantity = gift.quantity;
  }
  addInventoryItem(userId, itemCode, quantity);
  await persistGameState(userId);
  return getSocialDashboard(userId);
}
