import { randomInt, randomUUID } from "node:crypto";
import { ApiError } from "@/lib/api";
import { battleConstants, careEffects, items, MAX_STAT, rarityWeights, species } from "@/lib/game/data";
import type {
  BattleLog,
  BattleMode,
  BattleRoom,
  BattleResult,
  BirdCondition,
  BirdStats,
  CareAction,
  GameState,
  GachaLog,
  InventoryEntry,
  OwnedBird,
  PendingConsumption,
  Profile,
  Rarity,
} from "@/lib/game/types";

interface UserRecord {
  profile: Profile;
  ownedBirds: OwnedBird[];
  inventory: InventoryEntry[];
  careLogs: GameState["careLogs"];
  gachaLogs: GachaLog[];
  pendingConsumptions: PendingConsumption[];
  battleRooms: BattleRoom[];
  battleLogs: BattleLog[];
}

const globalForGame = globalThis as typeof globalThis & {
  __bunchoGameStore?: Map<string, UserRecord>;
};

const store = globalForGame.__bunchoGameStore ?? new Map<string, UserRecord>();
globalForGame.__bunchoGameStore = store;

const opponentNames = ["もちもち部屋", "青菜クラブ", "高速ついばみ隊", "止まり木リーグ"];

function nowIso() {
  return new Date().toISOString();
}

function clamp(value: number, min = 0, max = MAX_STAT) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function defaultCondition(): BirdCondition {
  return {
    fullness: 82,
    hydration: 86,
    stamina: 78,
    mood: 84,
    energy: 76,
    lastUpdatedAt: nowIso(),
  };
}

function statWithVariance(base: BirdStats, rarity: Rarity): BirdStats {
  const rarityBoost = rarity === "Ultra Rare" ? 11 : rarity === "Super Rare" ? 7 : rarity === "Rare" ? 4 : 0;
  return {
    speed: clamp(base.speed + rarityBoost + randomInt(-4, 6)),
    voice: clamp(base.voice + rarityBoost + randomInt(-4, 6)),
    flight: clamp(base.flight + rarityBoost + randomInt(-4, 6)),
    clingy: clamp(base.clingy + rarityBoost + randomInt(-4, 6)),
    appetite: clamp(base.appetite + rarityBoost + randomInt(-4, 6)),
  };
}

function makeOwnedBird(userId: string, speciesId: string, selected = false): OwnedBird {
  const birdSpecies = species.find((entry) => entry.id === speciesId);
  if (!birdSpecies) {
    throw new Error(`Unknown species: ${speciesId}`);
  }

  return {
    id: randomUUID(),
    userId,
    speciesId,
    nickname: birdSpecies.name,
    level: 1,
    exp: 0,
    stats: statWithVariance(birdSpecies.baseStats, birdSpecies.rarity),
    condition: defaultCondition(),
    personality: birdSpecies.personality,
    specialty: birdSpecies.specialty,
    hobby: birdSpecies.hobby,
    favoriteActivity: birdSpecies.favoriteActivity,
    selected,
    createdAt: nowIso(),
  };
}

function createRecord(userId: string): UserRecord {
  const createdAt = nowIso();
  return {
    profile: {
      userId,
      displayName: userId === "demo-user" ? "デモ飼い主" : "飼い主",
      coins: 620,
      createdAt,
      updatedAt: createdAt,
    },
    ownedBirds: [makeOwnedBird(userId, "sakura", true)],
    inventory: [
      { itemCode: "komatsuna", quantity: 1 },
      { itemCode: "toumyou", quantity: 1 },
      { itemCode: "canary_seed", quantity: 2 },
    ],
    careLogs: [],
    gachaLogs: [],
    pendingConsumptions: [],
    battleRooms: [],
    battleLogs: [],
  };
}

function getRecord(userId: string) {
  const existing = store.get(userId);
  if (existing) {
    applyTimeEffects(existing);
    return existing;
  }

  const record = createRecord(userId);
  store.set(userId, record);
  return record;
}

function mutateCondition(condition: BirdCondition, effect: Partial<BirdCondition>) {
  condition.fullness = clamp(condition.fullness + (effect.fullness ?? 0));
  condition.hydration = clamp(condition.hydration + (effect.hydration ?? 0));
  condition.stamina = clamp(condition.stamina + (effect.stamina ?? 0));
  condition.mood = clamp(condition.mood + (effect.mood ?? 0));
  condition.energy = clamp(condition.energy + (effect.energy ?? 0));
  condition.lastUpdatedAt = nowIso();
}

function applyTimeEffects(record: UserRecord) {
  const current = Date.now();

  for (const bird of record.ownedBirds) {
    const last = new Date(bird.condition.lastUpdatedAt).getTime();
    const elapsedMinutes = Math.max(0, (current - last) / 60_000);
    if (elapsedMinutes >= 1) {
      bird.condition.fullness = clamp(bird.condition.fullness - elapsedMinutes * 0.34);
      bird.condition.hydration = clamp(bird.condition.hydration - elapsedMinutes * 0.27);
      bird.condition.stamina = clamp(bird.condition.stamina - elapsedMinutes * 0.18);
      bird.condition.energy = clamp(bird.condition.energy - elapsedMinutes * 0.2);
      bird.condition.mood = clamp(bird.condition.mood - elapsedMinutes * 0.12);
      bird.condition.lastUpdatedAt = new Date(current).toISOString();
    }
  }

  const readyConsumptions = record.pendingConsumptions.filter(
    (entry) => new Date(entry.completesAt).getTime() <= current,
  );

  for (const pending of readyConsumptions) {
    const target = record.ownedBirds.find((bird) => bird.id === pending.birdId);
    const master = items.find((item) => item.code === pending.itemCode);
    if (target && master) {
      mutateCondition(target.condition, master.effect);
    }
  }

  if (readyConsumptions.length > 0) {
    const done = new Set(readyConsumptions.map((entry) => entry.id));
    record.pendingConsumptions = record.pendingConsumptions.filter((entry) => !done.has(entry.id));
  }
}

function selectedBird(record: UserRecord) {
  const bird = record.ownedBirds.find((entry) => entry.selected) ?? record.ownedBirds[0];
  if (!bird) {
    throw new ApiError(500, "文鳥データがありません。");
  }

  return bird;
}

function addExp(bird: OwnedBird, exp: number) {
  bird.exp += exp;
  while (bird.exp >= bird.level * 30) {
    bird.exp -= bird.level * 30;
    bird.level += 1;
    bird.stats.speed = clamp(bird.stats.speed + 1);
    bird.stats.appetite = clamp(bird.stats.appetite + 1);
  }
}

export function getGameState(userId: string): GameState {
  const record = getRecord(userId);

  return {
    profile: record.profile,
    species,
    ownedBirds: record.ownedBirds,
    selectedBird: selectedBird(record),
    items,
    inventory: record.inventory,
    careLogs: record.careLogs.slice(-8).reverse(),
    gachaLogs: record.gachaLogs.slice(-6).reverse(),
    pendingConsumptions: record.pendingConsumptions,
    battleRooms: record.battleRooms.slice(-4).reverse(),
    battleLogs: record.battleLogs.slice(-10).reverse(),
    serverTime: nowIso(),
    demoMode: userId === "demo-user",
  };
}

export function applyCare(userId: string, action: CareAction) {
  const record = getRecord(userId);
  const config = careEffects[action];
  if (!config) {
    throw new ApiError(400, "不明なお世話です。");
  }

  const bird = selectedBird(record);
  mutateCondition(bird.condition, config.effect);
  addExp(bird, config.effect.exp ?? 0);
  record.profile.coins += config.coinReward;
  record.profile.updatedAt = nowIso();
  record.careLogs.push({
    id: randomUUID(),
    action,
    birdId: bird.id,
    coinReward: config.coinReward,
    createdAt: nowIso(),
  });

  return getGameState(userId);
}

function pickRarity(minimum: Rarity = "Common"): Rarity {
  const allowed = Object.entries(rarityWeights).filter(([rarity]) => {
    const rarityIndex = speciesRarityRank(rarity as Rarity);
    return rarityIndex >= speciesRarityRank(minimum);
  }) as [Rarity, number][];
  const total = allowed.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = randomInt(1, total + 1);

  for (const [rarity, weight] of allowed) {
    roll -= weight;
    if (roll <= 0) {
      return rarity;
    }
  }

  return allowed[0][0];
}

function speciesRarityRank(rarity: Rarity) {
  return rarity === "Ultra Rare" ? 3 : rarity === "Super Rare" ? 2 : rarity === "Rare" ? 1 : 0;
}

function pickSpeciesForRarity(rarity: Rarity) {
  const candidates = species.filter((entry) => entry.rarity === rarity);
  return candidates[randomInt(0, candidates.length)];
}

export function performGacha(userId: string, pulls: 1 | 10) {
  const record = getRecord(userId);
  const cost = pulls === 10 ? 1200 : 250;
  if (record.profile.coins < cost) {
    throw new ApiError(400, "コインが足りません。");
  }

  record.profile.coins -= cost;
  record.profile.updatedAt = nowIso();
  const resultBirds: OwnedBird[] = [];

  for (let index = 0; index < pulls; index += 1) {
    const guaranteedMinimum: Rarity = pulls === 10 && index === pulls - 1 ? "Rare" : "Common";
    const rarity = pickRarity(guaranteedMinimum);
    const picked = pickSpeciesForRarity(rarity);
    const bird = makeOwnedBird(userId, picked.id, false);
    record.ownedBirds.push(bird);
    resultBirds.push(bird);
  }

  record.gachaLogs.push({
    id: randomUUID(),
    pulls,
    cost,
    resultBirdIds: resultBirds.map((bird) => bird.id),
    createdAt: nowIso(),
  });

  return { state: getGameState(userId), resultBirds };
}

export function renameBird(userId: string, birdId: string, nickname: string) {
  const record = getRecord(userId);
  const bird = record.ownedBirds.find((entry) => entry.id === birdId);
  if (!bird) {
    throw new ApiError(404, "文鳥が見つかりません。");
  }

  const cleaned = nickname.trim().replace(/\s+/g, " ");
  if (cleaned.length < 1 || cleaned.length > 16) {
    throw new ApiError(400, "ニックネームは1〜16文字で入力してください。");
  }

  bird.nickname = cleaned;
  record.profile.updatedAt = nowIso();
  return getGameState(userId);
}

export function selectBird(userId: string, birdId: string) {
  const record = getRecord(userId);
  if (!record.ownedBirds.some((entry) => entry.id === birdId)) {
    throw new ApiError(404, "文鳥が見つかりません。");
  }

  for (const bird of record.ownedBirds) {
    bird.selected = bird.id === birdId;
  }

  return getGameState(userId);
}

export function purchaseItem(userId: string, itemCode: string) {
  const record = getRecord(userId);
  const master = items.find((item) => item.code === itemCode);
  if (!master) {
    throw new ApiError(404, "アイテムが見つかりません。");
  }

  if (record.profile.coins < master.priceCoin) {
    throw new ApiError(400, "コインが足りません。");
  }

  record.profile.coins -= master.priceCoin;
  const existing = record.inventory.find((entry) => entry.itemCode === itemCode);
  if (existing) {
    existing.quantity += 1;
  } else {
    record.inventory.push({ itemCode, quantity: 1 });
  }

  record.profile.updatedAt = nowIso();
  return getGameState(userId);
}

export function useItem(userId: string, itemCode: string, birdId?: string) {
  const record = getRecord(userId);
  const master = items.find((item) => item.code === itemCode);
  const inventory = record.inventory.find((entry) => entry.itemCode === itemCode);
  const target = birdId
    ? record.ownedBirds.find((bird) => bird.id === birdId)
    : selectedBird(record);

  if (!master || !inventory || inventory.quantity < 1) {
    throw new ApiError(400, "そのアイテムは所持していません。");
  }

  if (!target) {
    throw new ApiError(404, "文鳥が見つかりません。");
  }

  inventory.quantity -= 1;
  if (master.consumeTimeSec <= 0) {
    mutateCondition(target.condition, master.effect);
  } else {
    const started = Date.now();
    record.pendingConsumptions.push({
      id: randomUUID(),
      birdId: target.id,
      itemCode,
      startedAt: new Date(started).toISOString(),
      completesAt: new Date(started + master.consumeTimeSec * 1_000).toISOString(),
    });
  }

  record.profile.updatedAt = nowIso();
  return getGameState(userId);
}

function calculateMaxTapsPerSec(stats: BirdStats) {
  return Number(
    (
      battleConstants.baseMaxTapsPerSec +
      stats.speed * battleConstants.speedCoefficient +
      stats.appetite * battleConstants.appetiteCoefficient
    ).toFixed(2),
  );
}

export function createBattleRoom(userId: string, mode: BattleMode) {
  const record = getRecord(userId);
  const bird = selectedBird(record);
  const startedAt = Date.now();
  const room: BattleRoom = {
    id: randomUUID(),
    userId,
    mode,
    status: "running",
    result: "pending",
    selectedBirdId: bird.id,
    opponentName: mode === "online" ? opponentNames[randomInt(0, opponentNames.length)] : "練習スコア",
    opponentScore: 0,
    rewardCoin: 0,
    maxTapsPerSec: calculateMaxTapsPerSec(bird.stats),
    rawTaps: 0,
    acceptedTaps: 0,
    score: 0,
    suspiciousPackets: 0,
    lastSeq: 0,
    lastReceivedAt: new Date(startedAt).toISOString(),
    startedAt: new Date(startedAt).toISOString(),
    finishesAt: new Date(startedAt + battleConstants.durationMs).toISOString(),
  };

  record.battleRooms.push(room);
  return { state: getGameState(userId), room };
}

export function submitBattleTaps(userId: string, roomId: string, delta: number, seq: number) {
  const record = getRecord(userId);
  const room = record.battleRooms.find((entry) => entry.id === roomId && entry.userId === userId);
  if (!room) {
    throw new ApiError(404, "バトルルームが見つかりません。");
  }

  if (room.status !== "running") {
    throw new ApiError(400, "このバトルは入力を受け付けていません。");
  }

  const now = Date.now();
  if (now > new Date(room.finishesAt).getTime()) {
    room.status = "finished";
    return { state: getGameState(userId), room, acceptedDelta: 0 };
  }

  if (seq <= room.lastSeq) {
    room.suspiciousPackets += 1;
    addBattleLog(record, room.id, "duplicate_seq", `duplicate seq ${seq}`);
    return { state: getGameState(userId), room, acceptedDelta: 0 };
  }

  const previous = new Date(room.lastReceivedAt).getTime();
  const elapsedMs = Math.max(now - previous, battleConstants.minPacketMs);
  const allowedDelta = Math.ceil((room.maxTapsPerSec * elapsedMs) / 1_000) + battleConstants.packetGraceTaps;
  const acceptedDelta = Math.max(0, Math.min(delta, allowedDelta));

  room.rawTaps += delta;
  room.acceptedTaps += acceptedDelta;
  room.score = Math.round(room.acceptedTaps * battleConstants.scorePerTap);
  room.lastSeq = seq;
  room.lastReceivedAt = new Date(now).toISOString();

  if (delta > allowedDelta) {
    room.suspiciousPackets += 1;
    addBattleLog(record, room.id, "tap_clamped", `delta ${delta} clamped to ${acceptedDelta}`);
  }

  if (room.suspiciousPackets >= battleConstants.suspiciousPacketLimit) {
    room.status = "disqualified";
    addBattleLog(record, room.id, "disqualified", "too many impossible tap packets");
  }

  return { state: getGameState(userId), room, acceptedDelta };
}

export function finalizeBattle(userId: string, roomId: string) {
  const record = getRecord(userId);
  const room = record.battleRooms.find((entry) => entry.id === roomId && entry.userId === userId);
  if (!room) {
    throw new ApiError(404, "バトルルームが見つかりません。");
  }

  if (room.status === "running") {
    room.status = "finished";
  }

  settleBattleReward(record, room);
  addBattleLog(
    record,
    room.id,
    "finalized",
    `score ${room.score}, opponent ${room.opponentScore}, result ${room.result}, reward ${room.rewardCoin}`,
  );
  return { state: getGameState(userId), room };
}

function settleBattleReward(record: UserRecord, room: BattleRoom) {
  if (room.result !== "pending") {
    return;
  }

  const bird = record.ownedBirds.find((entry) => entry.id === room.selectedBirdId) ?? selectedBird(record);

  if (room.status === "disqualified") {
    room.result = "disqualified";
    room.rewardCoin = 0;
    room.opponentScore = calculateOpponentScore(room, 1);
    return;
  }

  if (room.mode === "offline") {
    room.result = "practice";
    room.rewardCoin = 0;
    room.opponentScore = calculateOpponentScore(room, 0.62);
    addExp(bird, 2);
    return;
  }

  room.opponentScore = calculateOpponentScore(room, 0.78 + randomInt(0, 18) / 100);
  room.result = compareScores(room.score, room.opponentScore);
  room.rewardCoin = room.result === "win" ? 150 : room.result === "draw" ? 80 : 35;
  record.profile.coins += room.rewardCoin;
  record.profile.updatedAt = nowIso();
  addExp(bird, room.result === "win" ? 14 : room.result === "draw" ? 9 : 5);
}

function calculateOpponentScore(room: BattleRoom, ratio: number) {
  const durationSec = battleConstants.durationMs / 1_000;
  return Math.round(room.maxTapsPerSec * durationSec * battleConstants.scorePerTap * ratio);
}

function compareScores(score: number, opponentScore: number): BattleResult {
  if (score > opponentScore) {
    return "win";
  }

  if (score < opponentScore) {
    return "lose";
  }

  return "draw";
}

function addBattleLog(record: UserRecord, roomId: string, kind: BattleLog["kind"], detail: string) {
  record.battleLogs.push({
    id: randomUUID(),
    roomId,
    kind,
    detail,
    createdAt: nowIso(),
  });
}
