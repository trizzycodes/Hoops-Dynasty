
import { Pack, Rarity, PlayerCard, CardSet, CollectionSetDefinition, Quest } from './types';

export const INITIAL_COINS = 1000;

// Real Player Database with IDs for images
// IDs are based on official NBA.com player IDs
export const REAL_NBA_PLAYERS = [
  { name: "LeBron James", team: "L.A. Lakers", pos: "SF", id: "2544" },
  { name: "Stephen Curry", team: "Golden State", pos: "PG", id: "201939" },
  { name: "Kevin Durant", team: "Phoenix", pos: "PF", id: "201142" },
  { name: "Giannis Antetokounmpo", team: "Milwaukee", pos: "PF", id: "203507" },
  { name: "Nikola Jokic", team: "Denver", pos: "C", id: "203999" },
  { name: "Luka Doncic", team: "Dallas", pos: "PG", id: "1629029" },
  { name: "Jayson Tatum", team: "Boston", pos: "SF", id: "1628369" },
  { name: "Joel Embiid", team: "Philadelphia", pos: "C", id: "203954" },
  { name: "Shai Gilgeous-Alexander", team: "Oklahoma City", pos: "SG", id: "1628983" },
  { name: "Anthony Edwards", team: "Minnesota", pos: "SG", id: "1630162" },
  { name: "Devin Booker", team: "Phoenix", pos: "SG", id: "1626164" },
  { name: "Jimmy Butler", team: "Miami", pos: "SF", id: "202710" },
  { name: "Tyrese Haliburton", team: "Indiana", pos: "PG", id: "1630169" },
  { name: "Victor Wembanyama", team: "San Antonio", pos: "C", id: "1641705" },
  { name: "Ja Morant", team: "Memphis", pos: "PG", id: "1629630" },
  { name: "Damian Lillard", team: "Milwaukee", pos: "PG", id: "203081" },
  { name: "Kawhi Leonard", team: "L.A. Clippers", pos: "SF", id: "202695" },
  { name: "Paul George", team: "Philadelphia", pos: "SF", id: "202331" },
  { name: "Kyrie Irving", team: "Dallas", pos: "SG", id: "202681" },
  { name: "Anthony Davis", team: "L.A. Lakers", pos: "C", id: "203076" },
  { name: "Bam Adebayo", team: "Miami", pos: "C", id: "1628389" },
  { name: "Donovan Mitchell", team: "Cleveland", pos: "SG", id: "1628378" },
  { name: "Jaylen Brown", team: "Boston", pos: "SG", id: "1627759" },
  { name: "Jalen Brunson", team: "New York", pos: "PG", id: "1628973" },
  { name: "Trae Young", team: "Atlanta", pos: "PG", id: "1629027" },
  { name: "Zion Williamson", team: "New Orleans", pos: "PF", id: "1629627" },
  { name: "De'Aaron Fox", team: "Sacramento", pos: "PG", id: "1628368" },
  { name: "Domantas Sabonis", team: "Sacramento", pos: "C", id: "1627734" },
  { name: "LaMelo Ball", team: "Charlotte", pos: "PG", id: "1630163" },
  { name: "Cade Cunningham", team: "Detroit", pos: "PG", id: "1630595" }
];

export const CARD_SETS: Record<string, { rarityMod: number, ratingMod: number }> = {
  'Base': { rarityMod: 0, ratingMod: 0 },
  'Rookie': { rarityMod: 1, ratingMod: -3 },
  'All-Star': { rarityMod: 2, ratingMod: 4 },
  'Summer': { rarityMod: 2, ratingMod: 5 },
  'Halloween': { rarityMod: 3, ratingMod: 7 },
  'Christmas': { rarityMod: 4, ratingMod: 10 },
  'Playoffs': { rarityMod: 3, ratingMod: 8 },
  'Finals MVP': { rarityMod: 4, ratingMod: 12 },
  'Hall of Fame': { rarityMod: 5, ratingMod: 15 }
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: "bg-slate-500",
  [Rarity.RARE]: "bg-blue-500",
  [Rarity.EPIC]: "bg-purple-600",
  [Rarity.LEGENDARY]: "bg-orange-500",
  [Rarity.GOAT]: "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
};

export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  [Rarity.COMMON]: 1,
  [Rarity.RARE]: 5,
  [Rarity.EPIC]: 20,
  [Rarity.LEGENDARY]: 100,
  [Rarity.GOAT]: 500,
};

export const COLLECTION_SETS: CollectionSetDefinition[] = [
  {
    id: 'set_lakers',
    name: 'Lakers Dynasty',
    description: 'Collect 3 unique players from the L.A. Lakers.',
    reward: 5000,
    criteria: { team: 'L.A. Lakers', count: 3 }
  },
  {
    id: 'set_rookies',
    name: 'Future Stars',
    description: 'Collect 5 unique cards from the Rookie set.',
    reward: 15000,
    criteria: { set: 'Rookie', count: 5 }
  },
  {
    id: 'set_summer',
    name: 'Summer Heat',
    description: 'Collect 3 unique cards from the Summer set.',
    reward: 25000,
    criteria: { set: 'Summer', count: 3 }
  },
  {
    id: 'set_legends',
    name: 'Legendary Status',
    description: 'Collect 2 unique Legendary cards.',
    reward: 50000,
    criteria: { rarity: Rarity.LEGENDARY, count: 2 }
  },
  {
    id: 'set_halloween',
    name: 'Monster Squad',
    description: 'Collect 4 unique Halloween cards.',
    reward: 30000,
    criteria: { set: 'Halloween', count: 4 }
  },
  {
    id: 'set_starter',
    name: 'Starter Pack',
    description: 'Collect 10 Common cards.',
    reward: 1000,
    criteria: { rarity: Rarity.COMMON, count: 10 }
  }
];

export const PACKS: Pack[] = [
  {
    id: 'rookie_pack',
    name: 'Rookie Class',
    price: 500,
    cardCount: 3,
    color: 'from-slate-700 to-slate-900',
    description: 'Standard issue cards. Start your journey here.',
    probabilities: {
      [Rarity.COMMON]: 0.80,
      [Rarity.RARE]: 0.18,
      [Rarity.EPIC]: 0.02,
      [Rarity.LEGENDARY]: 0,
      [Rarity.GOAT]: 0
    }
  },
  {
    id: 'allstar_pack',
    name: 'All-Star Weekend',
    price: 2500,
    cardCount: 5,
    color: 'from-blue-700 to-blue-900',
    description: 'Higher chance of special event cards.',
    guaranteedRarity: Rarity.RARE,
    probabilities: {
      [Rarity.COMMON]: 0.40,
      [Rarity.RARE]: 0.45,
      [Rarity.EPIC]: 0.12,
      [Rarity.LEGENDARY]: 0.03,
      [Rarity.GOAT]: 0
    }
  },
  {
    id: 'summer_pack',
    name: 'Summer Vibes',
    price: 5000,
    cardCount: 4,
    color: 'from-cyan-500 to-yellow-500',
    description: 'Heat up the court with limited Summer cards.',
    guaranteedRarity: Rarity.RARE,
    probabilities: {
      [Rarity.COMMON]: 0.20,
      [Rarity.RARE]: 0.50,
      [Rarity.EPIC]: 0.25,
      [Rarity.LEGENDARY]: 0.05,
      [Rarity.GOAT]: 0
    }
  },
  {
    id: 'halloween_pack',
    name: 'Spooky Season',
    price: 12500,
    cardCount: 5,
    color: 'from-purple-900 to-orange-600',
    description: 'Terrifyingly good players. Trick or Treat?',
    guaranteedRarity: Rarity.EPIC,
    probabilities: {
      [Rarity.COMMON]: 0.10,
      [Rarity.RARE]: 0.30,
      [Rarity.EPIC]: 0.50,
      [Rarity.LEGENDARY]: 0.09,
      [Rarity.GOAT]: 0.01
    }
  },
  {
    id: 'christmas_pack',
    name: 'Winter Holiday',
    price: 25000,
    cardCount: 6,
    color: 'from-red-700 to-green-800',
    description: 'The gift of buckets. Very high value.',
    guaranteedRarity: Rarity.EPIC,
    probabilities: {
      [Rarity.COMMON]: 0.05,
      [Rarity.RARE]: 0.20,
      [Rarity.EPIC]: 0.55,
      [Rarity.LEGENDARY]: 0.15,
      [Rarity.GOAT]: 0.05
    }
  },
  {
    id: 'goat_pack',
    name: 'Hall of Fame',
    price: 50000,
    cardCount: 4,
    color: 'from-yellow-600 to-red-900',
    description: 'The most expensive pack. Highest GOAT chance.',
    guaranteedRarity: Rarity.LEGENDARY,
    probabilities: {
      [Rarity.COMMON]: 0,
      [Rarity.RARE]: 0.10,
      [Rarity.EPIC]: 0.40,
      [Rarity.LEGENDARY]: 0.40,
      [Rarity.GOAT]: 0.10
    }
  }
];

// Consistent hashing for image stability
const stringToSeed = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Helper to generate non-AI cards
export const generateBaseCard = (): PlayerCard => {
  const id = Math.random().toString(36).substring(7);
  const playerBase = REAL_NBA_PLAYERS[Math.floor(Math.random() * REAL_NBA_PLAYERS.length)];
  
  // Determine Set
  const rand = Math.random();
  let set: CardSet = 'Base';
  if (rand > 0.50) set = 'Rookie';
  if (rand > 0.70) set = 'Summer';
  if (rand > 0.80) set = 'All-Star';
  if (rand > 0.88) set = 'Halloween';
  if (rand > 0.94) set = 'Playoffs';
  if (rand > 0.97) set = 'Christmas';
  if (rand > 0.98) set = 'Finals MVP';
  if (rand > 0.995) set = 'Hall of Fame';

  const setConfig = CARD_SETS[set];

  // Base rating logic (Real players have base 75-95)
  let baseRating = 75 + Math.floor(Math.random() * 20) + setConfig.ratingMod;
  baseRating = Math.min(99, baseRating);

  // Determine Rarity based on Rating + Set
  let rarity = Rarity.COMMON;
  if (baseRating >= 80) rarity = Rarity.RARE;
  if (baseRating >= 88) rarity = Rarity.EPIC;
  if (baseRating >= 94) rarity = Rarity.LEGENDARY;
  if (baseRating >= 98) rarity = Rarity.GOAT;

  // Calculate Price
  const price = Math.floor(baseRating * RARITY_MULTIPLIERS[rarity] * (0.9 + Math.random() * 0.2));

  // Auto-lock high value cards
  const isLocked = rarity === Rarity.LEGENDARY || rarity === Rarity.GOAT;

  // Image seed based on player name for consistency
  const imageSeed = stringToSeed(playerBase.name);

  return {
    id,
    nbaId: playerBase.id,
    name: playerBase.name,
    team: playerBase.team,
    position: playerBase.pos,
    rarity,
    set,
    rating: baseRating,
    price,
    imageSeed, 
    isLocked,
    stats: {
      offense: Math.min(99, Math.floor(baseRating * (0.85 + Math.random() * 0.3))),
      defense: Math.min(99, Math.floor(baseRating * (0.7 + Math.random() * 0.5))),
      potential: Math.floor(Math.random() * 99)
    }
  };
};
