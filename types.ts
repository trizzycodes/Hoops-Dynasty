
export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  GOAT = 'GOAT'
}

export type CardSet = 'Base' | 'Rookie' | 'All-Star' | 'Playoffs' | 'Finals MVP' | 'Hall of Fame' | 'Summer' | 'Halloween' | 'Christmas';

export interface PlayerCard {
  id: string;
  nbaId?: string; // Real NBA ID for headshots
  name: string;
  team: string;
  position: string;
  rarity: Rarity;
  set: CardSet;
  rating: number;
  price: number; // Sell price
  imageSeed: number; // Fallback for non-real players
  isAiGenerated?: boolean;
  isLocked: boolean; // Prevents selling
  description?: string; // AI generated lore
  stats: {
    offense: number;
    defense: number;
    potential: number;
  };
}

export interface Pack {
  id: string;
  name: string;
  price: number;
  cardCount: number;
  guaranteedRarity?: Rarity;
  probabilities: {
    [key in Rarity]: number;
  };
  color: string;
  description: string;
}

export enum ViewState {
  SHOP = 'SHOP',
  COLLECTION = 'COLLECTION',
  SCOUT = 'SCOUT', // AI Gen
  MARKET = 'MARKET',
  LINEUP = 'LINEUP',
  WAGER = 'WAGER',
  GOALS = 'GOALS'
}

export interface Lineup {
  PG: string | null;
  SG: string | null;
  SF: string | null;
  PF: string | null;
  C: string | null;
  Bench: string[]; // Array of IDs (max 8)
}

export type QuestType = 'OPEN_PACKS' | 'COLLECT_CARDS' | 'WIN_WAGER';

export interface Quest {
  id: string;
  description: string;
  type: QuestType;
  target: number;
  current: number;
  reward: number;
  isClaimed: boolean;
}

export interface CollectionSetDefinition {
  id: string;
  name: string;
  description: string;
  reward: number;
  criteria: {
    team?: string;
    set?: CardSet;
    rarity?: Rarity;
    count: number; // How many unique cards needed matching criteria
  };
}

export interface GameState {
  coins: number;
  inventory: PlayerCard[];
  lineup: Lineup;
  lastOpenTime: number;
  collectionScore: number;
  totalPacksOpened: number;
  wagerStats: {
    wins: number;
    losses: number;
    earnings: number;
  };
  // New features
  lastWheelSpin: number;
  lastAuctionRefresh: number;
  lastQuestRefresh: number;
  quests: Quest[];
  claimedSets: string[]; // IDs of completed sets
  activeWagerOpponent: { name: string, ovr: number } | null;
}
