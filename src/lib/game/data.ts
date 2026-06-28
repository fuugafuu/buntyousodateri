import type { BirdSpecies, CareAction, ItemMaster, Rarity } from "@/lib/game/types";

export const MAX_STAT = 100;

export const rarities: Rarity[] = ["Common", "Rare", "Super Rare", "Ultra Rare"];

export const rarityWeights: Record<Rarity, number> = {
  Common: 64,
  Rare: 25,
  "Super Rare": 9,
  "Ultra Rare": 2,
};

export const species: BirdSpecies[] = [
  {
    id: "sakura",
    name: "さくら文鳥",
    rarity: "Common",
    description: "はじめての相棒に向いた、明るく人なつっこい文鳥。",
    asset: "/images/birds/sakura.svg",
    silhouetteAsset: "/images/birds/silhouette.svg",
    baseStats: { speed: 48, voice: 44, flight: 46, clingy: 52, appetite: 50 },
    personality: "人なつっこい",
    specialty: "初速ダッシュ",
    hobby: "止まり木パトロール",
    favoriteActivity: "なでられること",
    acquisitionHint: "最初に1羽配布されます。",
  },
  {
    id: "white",
    name: "白文鳥",
    rarity: "Rare",
    description: "落ち着いた身のこなしで、長い勝負に強い文鳥。",
    asset: "/images/birds/white.svg",
    silhouetteAsset: "/images/birds/silhouette.svg",
    baseStats: { speed: 53, voice: 42, flight: 57, clingy: 45, appetite: 49 },
    personality: "おっとり",
    specialty: "安定食べ",
    hobby: "水浴び",
    favoriteActivity: "静かな日なたぼっこ",
    acquisitionHint: "ガチャから排出されます。",
  },
  {
    id: "cinnamon",
    name: "シナモン文鳥",
    rarity: "Super Rare",
    description: "食欲と素早さの伸びがよく、短期決戦に向いた文鳥。",
    asset: "/images/birds/cinnamon.svg",
    silhouetteAsset: "/images/birds/silhouette.svg",
    baseStats: { speed: 62, voice: 47, flight: 58, clingy: 50, appetite: 64 },
    personality: "負けず嫌い",
    specialty: "高速ついばみ",
    hobby: "豆苗チェック",
    favoriteActivity: "小松菜を選ぶこと",
    acquisitionHint: "Rare以上確定枠で狙いやすくなります。",
  },
  {
    id: "sakura-white-mix",
    name: "桜白ミックス",
    rarity: "Ultra Rare",
    description: "飛行速度と甘えん坊度が高い、珍しいミックス系の文鳥。",
    asset: "/images/birds/sakura-white-mix.svg",
    silhouetteAsset: "/images/birds/silhouette.svg",
    baseStats: { speed: 70, voice: 55, flight: 72, clingy: 68, appetite: 61 },
    personality: "スター気質",
    specialty: "ふわり先制",
    hobby: "ガチャ演出を眺める",
    favoriteActivity: "ほめられること",
    acquisitionHint: "Ultra Rareとして低確率で排出されます。",
  },
];

export const items: ItemMaster[] = [
  {
    code: "komatsuna",
    name: "小松菜",
    description: "体力とエネルギーを回復。完食まで少し時間がかかる。",
    consumeTimeSec: 45,
    priceCoin: 90,
    asset: "/images/items/komatsuna.svg",
    effect: { stamina: 18, energy: 16, fullness: 12, mood: 4 },
  },
  {
    code: "toumyou",
    name: "豆苗",
    description: "体力とエネルギーを回復。小松菜高速食べの気分が上がる。",
    consumeTimeSec: 50,
    priceCoin: 100,
    asset: "/images/items/toumyou.svg",
    effect: { stamina: 16, energy: 18, fullness: 14, mood: 6 },
  },
  {
    code: "canary_seed",
    name: "カナリーシード",
    description: "少量回復だが、すぐ食べられる。",
    consumeTimeSec: 0,
    priceCoin: 60,
    asset: "/images/items/canary-seed.svg",
    effect: { stamina: 8, energy: 8, fullness: 8 },
  },
  {
    code: "super_komatsuna",
    name: "スーパー小松菜",
    description: "全ステータスを大きく回復。完食まで少し時間がかかる。",
    consumeTimeSec: 75,
    priceCoin: 220,
    asset: "/images/items/super-komatsuna.svg",
    effect: { stamina: 35, energy: 35, fullness: 25, hydration: 12, mood: 18 },
  },
];

export const careEffects: Record<
  CareAction,
  { label: string; coinReward: number; effect: { fullness?: number; hydration?: number; stamina?: number; mood?: number; energy?: number; exp?: number } }
> = {
  feed: {
    label: "餌を与える",
    coinReward: 16,
    effect: { fullness: 16, energy: 8, mood: 3, exp: 4 },
  },
  water: {
    label: "水を与える",
    coinReward: 14,
    effect: { hydration: 20, mood: 2, exp: 3 },
  },
  rest: {
    label: "休ませる",
    coinReward: 10,
    effect: { stamina: 20, energy: 12, exp: 2 },
  },
  pet: {
    label: "なでる",
    coinReward: 12,
    effect: { mood: 18, energy: 4, exp: 3 },
  },
};

export const battleConstants = {
  durationMs: 15_000,
  baseMaxTapsPerSec: 4.2,
  speedCoefficient: 0.032,
  appetiteCoefficient: 0.026,
  minPacketMs: 100,
  packetGraceTaps: 1,
  suspiciousPacketLimit: 4,
  scorePerTap: 12,
};

