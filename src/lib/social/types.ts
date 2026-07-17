export type SocialBirdCard = {
  playerId: string;
  displayName: string;
  birdName: string;
  speciesId: string;
  birdAsset: string;
  birdLevel: number;
  score: number;
};

export type SocialGift = {
  id: string;
  senderName: string;
  senderPlayerId: string;
  itemCode: string;
  itemName: string;
  itemAsset: string;
  quantity: number;
  createdAt: string;
};

export type GrowthMission = {
  id: "care" | "mood" | "battle";
  label: string;
  detail: string;
  current: number;
  target: number;
  complete: boolean;
};

export type SocialDashboard = {
  me: SocialBirdCard & { rank: number };
  friends: SocialBirdCard[];
  leaderboard: Array<SocialBirdCard & { rank: number }>;
  inbox: SocialGift[];
  inventory: Array<{ itemCode: string; name: string; asset: string; quantity: number }>;
  missions: GrowthMission[];
  bond: { title: string; score: number; nextAt: number; streakDays: number };
  suggestedPlayerIds: string[];
  cloudEnabled: boolean;
};
