export type Rarity = "Common" | "Rare" | "Super Rare" | "Ultra Rare";

export type NumericStatKey = "speed" | "voice" | "flight" | "clingy" | "appetite";

export type CareAction = "feed" | "water" | "rest" | "pet";

export type BattleMode = "online" | "offline";

export type BattleStatus = "waiting" | "running" | "finished" | "disqualified";

export type BattleResult = "pending" | "practice" | "win" | "lose" | "draw" | "disqualified";

export interface BirdStats {
  speed: number;
  voice: number;
  flight: number;
  clingy: number;
  appetite: number;
}

export interface BirdCondition {
  fullness: number;
  hydration: number;
  stamina: number;
  mood: number;
  energy: number;
  lastUpdatedAt: string;
}

export interface BirdSpecies {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  asset: string;
  silhouetteAsset: string;
  baseStats: BirdStats;
  personality: string;
  specialty: string;
  hobby: string;
  favoriteActivity: string;
  acquisitionHint: string;
}

export interface OwnedBird {
  id: string;
  userId: string;
  speciesId: string;
  nickname: string;
  level: number;
  exp: number;
  stats: BirdStats;
  condition: BirdCondition;
  personality: string;
  specialty: string;
  hobby: string;
  favoriteActivity: string;
  selected: boolean;
  createdAt: string;
}

export interface ItemMaster {
  code: string;
  name: string;
  description: string;
  consumeTimeSec: number;
  priceCoin: number;
  asset: string;
  effect: Partial<BirdCondition>;
}

export interface InventoryEntry {
  itemCode: string;
  quantity: number;
}

export interface Profile {
  userId: string;
  displayName: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
}

export interface CareLog {
  id: string;
  action: CareAction;
  birdId: string;
  coinReward: number;
  createdAt: string;
}

export interface GachaLog {
  id: string;
  pulls: 1 | 10;
  cost: number;
  resultBirdIds: string[];
  createdAt: string;
}

export interface PendingConsumption {
  id: string;
  birdId: string;
  itemCode: string;
  startedAt: string;
  completesAt: string;
}

export interface BattleRoom {
  id: string;
  userId: string;
  mode: BattleMode;
  status: BattleStatus;
  result: BattleResult;
  selectedBirdId: string;
  opponentName: string;
  opponentScore: number;
  rewardCoin: number;
  maxTapsPerSec: number;
  rawTaps: number;
  acceptedTaps: number;
  score: number;
  suspiciousPackets: number;
  lastSeq: number;
  lastReceivedAt: string;
  startedAt: string;
  finishesAt: string;
}

export interface BattleLog {
  id: string;
  roomId: string;
  kind: "tap_clamped" | "duplicate_seq" | "finalized" | "disqualified";
  detail: string;
  createdAt: string;
}

export interface GameState {
  profile: Profile;
  species: BirdSpecies[];
  ownedBirds: OwnedBird[];
  selectedBird: OwnedBird;
  items: ItemMaster[];
  inventory: InventoryEntry[];
  careLogs: CareLog[];
  gachaLogs: GachaLog[];
  pendingConsumptions: PendingConsumption[];
  battleRooms: BattleRoom[];
  battleLogs: BattleLog[];
  serverTime: string;
  demoMode: boolean;
}
