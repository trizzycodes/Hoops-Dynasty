
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_COINS, PACKS, generateBaseCard, COLLECTION_SETS } from './constants';
import { PlayerCard, ViewState, GameState, Pack, Rarity, Lineup, Quest, QuestType } from './types';
import { CardComponent } from './components/CardComponent';
import { PackOpener } from './components/PackOpener';

// Icons
const CoinsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
);

const ShopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);

const BinderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);

const GavelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>
);

const JerseyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
);

const DiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M16 8h.01"></path><path d="M8 8h.01"></path><path d="M8 16h.01"></path><path d="M16 16h.01"></path><path d="M12 12h.01"></path></svg>
);

const GoalsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 7-7 7-7-7 7-7z"></path><path d="M2 12l10 10 10-10"></path></svg>
);

// Wheel Configuration
const WHEEL_SEGMENTS = [
    { value: 500, color: '#64748b', probability: 0.30 }, // Slate
    { value: 1000, color: '#10b981', probability: 0.25 }, // Green
    { value: 2000, color: '#3b82f6', probability: 0.20 }, // Blue
    { value: 3000, color: '#8b5cf6', probability: 0.15 }, // Purple
    { value: 5000, color: '#f97316', probability: 0.08 }, // Orange
    { value: 20000, color: '#eab308', probability: 0.02 }, // Gold (Jackpot)
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('hoops_dynasty_save_v6');
    const defaultLineup: Lineup = { PG: null, SG: null, SF: null, PF: null, C: null, Bench: [] };
    
    if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.lineup) parsed.lineup = defaultLineup;
        if (!parsed.lastWheelSpin) parsed.lastWheelSpin = 0;
        if (!parsed.lastAuctionRefresh) parsed.lastAuctionRefresh = Date.now();
        if (!parsed.lastQuestRefresh) parsed.lastQuestRefresh = 0;
        if (!parsed.quests) parsed.quests = [];
        if (!parsed.claimedSets) parsed.claimedSets = [];
        if (!parsed.activeWagerOpponent) parsed.activeWagerOpponent = null;
        return parsed;
    }
    
    return {
      coins: INITIAL_COINS,
      inventory: [],
      lineup: defaultLineup,
      lastOpenTime: Date.now(),
      collectionScore: 0,
      totalPacksOpened: 0,
      wagerStats: { wins: 0, losses: 0, earnings: 0 },
      lastWheelSpin: 0,
      lastAuctionRefresh: Date.now(),
      lastQuestRefresh: 0,
      quests: [],
      claimedSets: [],
      activeWagerOpponent: null
    };
  });

  const [view, setView] = useState<ViewState>(ViewState.SHOP);
  const [activePack, setActivePack] = useState<Pack | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<{win: boolean, score: string, reward: number} | null>(null);
  
  // Wager Mode State
  const [wagerAmount, setWagerAmount] = useState<number>(1000);
  const [isSimulatingMatch, setIsSimulatingMatch] = useState(false);

  // Auction House State
  const [auctionListings, setAuctionListings] = useState<PlayerCard[]>([]);

  // Lineup Editing State
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  // Wheel State
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelReward, setWheelReward] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Persistence
  useEffect(() => {
    localStorage.setItem('hoops_dynasty_save_v6', JSON.stringify(gameState));
  }, [gameState]);

  // Generate initial opponent if in Wager view and none exists
  useEffect(() => {
      if (view === ViewState.WAGER && !gameState.activeWagerOpponent) {
          generateNewOpponent();
      }
  }, [view]);

  // Auction House Refresh Timer (15 mins)
  useEffect(() => {
    const checkAuctionRefresh = () => {
        const now = Date.now();
        if (now - gameState.lastAuctionRefresh > 900000 || auctionListings.length === 0) {
            refreshAuctionHouse();
            setGameState(prev => ({ ...prev, lastAuctionRefresh: now }));
        }
    };
    const interval = setInterval(checkAuctionRefresh, 10000); 
    checkAuctionRefresh(); 
    return () => clearInterval(interval);
  }, [gameState.lastAuctionRefresh]);

  // Quest Refresh Timer (Daily)
  useEffect(() => {
      const checkQuestRefresh = () => {
          const now = Date.now();
          if (now - gameState.lastQuestRefresh > 86400000 || gameState.quests.length === 0) {
              generateDailyQuests();
              setGameState(prev => ({ ...prev, lastQuestRefresh: now }));
          }
      };
      checkQuestRefresh();
  }, [gameState.lastQuestRefresh]);

  const refreshAuctionHouse = () => {
      const newListings: PlayerCard[] = [];
      for(let i=0; i<8; i++) {
          const card = generateBaseCard();
          card.price = Math.floor(card.price * (3 + Math.random() * 2)); 
          newListings.push(card);
      }
      setAuctionListings(newListings);
  };

  const generateDailyQuests = () => {
      const templates = [
          { desc: "Open 3 Packs", type: 'OPEN_PACKS' as QuestType, target: 3, reward: 500 },
          { desc: "Open 5 Packs", type: 'OPEN_PACKS' as QuestType, target: 5, reward: 1000 },
          { desc: "Collect 5 Cards", type: 'COLLECT_CARDS' as QuestType, target: 5, reward: 500 },
          { desc: "Collect 10 Cards", type: 'COLLECT_CARDS' as QuestType, target: 10, reward: 1200 },
          { desc: "Win 1 Wager", type: 'WIN_WAGER' as QuestType, target: 1, reward: 2000 },
          { desc: "Collect 3 Rare Cards", type: 'COLLECT_CARDS' as QuestType, target: 3, reward: 1500 },
      ];
      
      const shuffled = [...templates].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5).map((t, i) => ({
          id: `quest_${Date.now()}_${i}`,
          description: t.desc,
          type: t.type,
          target: t.target,
          current: 0,
          reward: t.reward,
          isClaimed: false
      }));

      setGameState(prev => ({ ...prev, quests: selected }));
  };

  const updateQuestProgress = (type: QuestType, amount: number = 1) => {
      setGameState(prev => {
          const updatedQuests = prev.quests.map(q => {
              if (q.type === type && !q.isClaimed && q.current < q.target) {
                  return { ...q, current: Math.min(q.target, q.current + amount) };
              }
              return q;
          });
          return { ...prev, quests: updatedQuests };
      });
  };

  // Helpers
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const calculateCollectionValue = () => {
    return gameState.inventory.reduce((acc, card) => acc + card.price, 0);
  };

  const getCardById = (id: string | null) => {
      if (!id) return null;
      return gameState.inventory.find(c => c.id === id) || null;
  };

  const calculateTeamRating = () => {
      const starters = [
          gameState.lineup.PG, gameState.lineup.SG, 
          gameState.lineup.SF, gameState.lineup.PF, 
          gameState.lineup.C
      ];
      const bench = gameState.lineup.Bench;
      
      const allIds = [...starters, ...bench].filter(id => id !== null) as string[];
      if (allIds.length === 0) return 0;

      const totalRating = allIds.reduce((acc, id) => {
          const card = getCardById(id);
          return acc + (card ? card.rating : 0);
      }, 0);

      return parseFloat((totalRating / allIds.length).toFixed(1));
  };

  const isCardInLineup = (id: string) => {
      const l = gameState.lineup;
      if (l.PG === id || l.SG === id || l.SF === id || l.PF === id || l.C === id) return true;
      if (l.Bench.includes(id)) return true;
      return false;
  };

  const isLineupComplete = () => {
      const l = gameState.lineup;
      return l.PG && l.SG && l.SF && l.PF && l.C && l.Bench.length === 8;
  };

  // Handlers
  const handleBuyPack = (pack: Pack) => {
    if (gameState.coins >= pack.price) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - pack.price,
        totalPacksOpened: prev.totalPacksOpened + 1
      }));
      setActivePack(pack);
      updateQuestProgress('OPEN_PACKS', 1);
    } else {
      showNotification("Not enough coins!");
    }
  };

  const handlePackClosed = (newCards: PlayerCard[]) => {
    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, ...newCards],
      collectionScore: prev.collectionScore + newCards.length * 10 
    }));
    setActivePack(null);
    updateQuestProgress('COLLECT_CARDS', newCards.length);
    showNotification(`Added ${newCards.length} cards to collection!`);
  };

  const handleSellCard = (cardId: string) => {
    const card = gameState.inventory.find(c => c.id === cardId);
    if (!card) return;

    if (card.isLocked) {
        showNotification("Cannot sell Locked cards! Unlock them first.");
        return;
    }

    if (isCardInLineup(cardId)) {
        showNotification("Cannot sell player in active Lineup!");
        return;
    }

    setGameState(prev => ({
      ...prev,
      coins: prev.coins + card.price,
      inventory: prev.inventory.filter(c => c.id !== cardId)
    }));
    showNotification(`Sold ${card.name} for ${card.price.toLocaleString()} coins`);
  };

  const handleToggleLock = (cardId: string) => {
      setGameState(prev => ({
          ...prev,
          inventory: prev.inventory.map(c => {
              if (c.id === cardId) {
                  const newStatus = !c.isLocked;
                  return { ...c, isLocked: newStatus };
              }
              return c;
          })
      }));
  };

  const handleBuyAuction = (card: PlayerCard) => {
      if (gameState.coins >= card.price) {
          const inventoryCard = {
              ...card,
              price: Math.floor(card.price / 4), 
              isLocked: true 
          };

          setGameState(prev => ({
              ...prev,
              coins: prev.coins - card.price,
              inventory: [inventoryCard, ...prev.inventory]
          }));
          setAuctionListings(prev => prev.filter(c => c.id !== card.id));
          updateQuestProgress('COLLECT_CARDS', 1);
          showNotification(`Purchased ${card.name} from Auction House!`);
      } else {
          showNotification("Not enough coins to buy this card!");
      }
  };

  const handleEquipCard = (cardId: string) => {
      if (!editingSlot) return;
      let currentLineup = { ...gameState.lineup };
      
      const removeFromSlots = (id: string, l: Lineup) => {
          if (l.PG === id) l.PG = null;
          if (l.SG === id) l.SG = null;
          if (l.SF === id) l.SF = null;
          if (l.PF === id) l.PF = null;
          if (l.C === id) l.C = null;
          l.Bench = l.Bench.filter(bid => bid !== id);
          return l;
      };

      currentLineup = removeFromSlots(cardId, currentLineup);

      if (editingSlot === 'Bench') {
          if (currentLineup.Bench.length < 8) {
              currentLineup.Bench.push(cardId);
          } else {
              showNotification("Bench is full! (Max 8)");
              return;
          }
      } else {
          // @ts-ignore
          currentLineup[editingSlot] = cardId;
      }

      setGameState(prev => ({ ...prev, lineup: currentLineup }));
      setEditingSlot(null);
      showNotification("Player added to lineup");
  };

  const handleUnequip = (slot: string, index?: number) => {
      setGameState(prev => {
          const l = { ...prev.lineup };
          if (slot === 'Bench' && typeof index === 'number') {
              l.Bench = l.Bench.filter((_, i) => i !== index);
          } else {
              // @ts-ignore
              l[slot] = null;
          }
          return { ...prev, lineup: l };
      });
  };

  const handleAutoOptimizeLineup = () => {
    const sortedInventory = [...gameState.inventory].sort((a, b) => b.rating - a.rating);
    const newLineup: Lineup = { PG: null, SG: null, SF: null, PF: null, C: null, Bench: [] };
    const usedIds = new Set<string>();

    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    positions.forEach(pos => {
        const bestFit = sortedInventory.find(c => c.position === pos && !usedIds.has(c.id));
        if (bestFit) {
            // @ts-ignore
            newLineup[pos] = bestFit.id;
            usedIds.add(bestFit.id);
        }
    });

    for (const card of sortedInventory) {
        if (newLineup.Bench.length >= 8) break;
        if (!usedIds.has(card.id)) {
            newLineup.Bench.push(card.id);
            usedIds.add(card.id);
        }
    }

    setGameState(prev => ({ ...prev, lineup: newLineup }));
    showNotification("Lineup optimized!");
  };

  // Wager Logic
  const generateNewOpponent = () => {
      const teamRating = calculateTeamRating();
      const cityNames = ["Gotham", "Metropolis", "Springfield", "South Beach", "Windy City", "Bay Area", "Brooklyn", "Sin City"];
      const mascotNames = ["Vipers", "Knights", "Ballers", "Sharks", "Phantoms", "Titans", "Dragons", "Wolves"];
      
      const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      const randomMascot = mascotNames[Math.floor(Math.random() * mascotNames.length)];
      
      // Opponent OVR is roughly user OVR +/- 5, capped 99
      const variance = (Math.random() * 10) - 5;
      const opponentOvr = Math.min(99, Math.max(60, parseFloat((teamRating + variance).toFixed(1))));

      setGameState(prev => ({
          ...prev,
          activeWagerOpponent: {
            name: `${randomCity} ${randomMascot}`,
            ovr: opponentOvr
          }
      }));
  };

  const handlePlaceWager = () => {
      if (!isLineupComplete()) {
          showNotification("Complete your lineup (5 Starters + 8 Bench) to wager!");
          return;
      }
      if (gameState.coins < wagerAmount) {
          showNotification("Not enough coins to place this bet!");
          return;
      }
      if (!gameState.activeWagerOpponent) {
          generateNewOpponent();
          return;
      }

      setIsSimulatingMatch(true);
      setGameState(prev => ({...prev, coins: prev.coins - wagerAmount}));

      setTimeout(() => {
          const userOvr = calculateTeamRating();
          const cpuOvr = gameState.activeWagerOpponent!.ovr;

          // Probability Logic with Upset Mechanic
          // Base 50% chance. Add 3% per point of OVR difference.
          const ovrDiff = userOvr - cpuOvr;
          let winChance = 0.50 + (ovrDiff * 0.03);
          
          // Cap chances so upsets are always possible
          winChance = Math.max(0.05, Math.min(0.95, winChance));

          // Roll the dice
          const roll = Math.random();
          const win = roll < winChance;
          
          const reward = win ? wagerAmount * 2 : 0;

          // Generate "Score" based on winner
          const baseScore = 100;
          const winnerScore = Math.floor(baseScore + (Math.random() * 20));
          const loserScore = Math.floor(winnerScore - (2 + Math.random() * 15));

          const userScoreStr = win ? winnerScore : loserScore;
          const cpuScoreStr = win ? loserScore : winnerScore;

          setMatchResult({
              win,
              score: `${userScoreStr} - ${cpuScoreStr}`,
              reward: reward
          });

          setGameState(prev => ({
              ...prev,
              coins: prev.coins + reward,
              wagerStats: {
                  wins: win ? prev.wagerStats.wins + 1 : prev.wagerStats.wins,
                  losses: !win ? prev.wagerStats.losses + 1 : prev.wagerStats.losses,
                  earnings: prev.wagerStats.earnings + (win ? wagerAmount : -wagerAmount)
              },
              // Clear opponent so a new one is generated next time the view loads or after match
              activeWagerOpponent: null 
          }));

          if (win) updateQuestProgress('WIN_WAGER', 1);
          
          // Generate new opponent immediately for next match
          generateNewOpponent();
          setIsSimulatingMatch(false);

      }, 2500);
  };

  // Wheel Logic
  const getCoordinatesForPercent = (percent: number, radius: number = 50) => {
      const x = Math.cos(2 * Math.PI * percent) * radius;
      const y = Math.sin(2 * Math.PI * percent) * radius;
      return [x, y];
  };

  // Helper to create SVG slice paths
  const getWheelSlices = () => {
      let accumulatedDegrees = 0;
      const radius = 50; // SVG viewbox 100x100, center 50,50
      
      // Geometry: 5 slices of ~68 degrees, 1 slice of 20 degrees (Jackpot)
      // Total 360. 
      // Standard Slices: 340 deg / 5 = 68 deg.
      // Jackpot Slice: 20 deg.
      
      // Let's map the WHEEL_SEGMENTS to degrees
      const segmentsWithAngles = WHEEL_SEGMENTS.map(seg => {
          const angle = seg.value === 20000 ? 20 : 68;
          return { ...seg, angle };
      });

      const paths = segmentsWithAngles.map((seg, i) => {
          const startAngle = accumulatedDegrees;
          const endAngle = startAngle + seg.angle;
          accumulatedDegrees = endAngle;

          // Convert angle to radians, subtract 90deg to start at 12 o'clock
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;

          const x1 = 50 + 50 * Math.cos(startRad);
          const y1 = 50 + 50 * Math.sin(startRad);
          const x2 = 50 + 50 * Math.cos(endRad);
          const y2 = 50 + 50 * Math.sin(endRad);

          // SVG Path Command
          // M center
          // L start point
          // A radius radius 0 large-arc-flag sweep-flag end point
          // Z (close)
          const largeArcFlag = seg.angle > 180 ? 1 : 0;

          // Calculate text position (centroid of slice)
          const midAngle = startAngle + (seg.angle / 2);
          const midRad = (midAngle - 90) * Math.PI / 180;
          const textRadius = 32; 
          const tx = 50 + textRadius * Math.cos(midRad);
          const ty = 50 + textRadius * Math.sin(midRad);

          return {
              ...seg,
              pathData: `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
              textX: tx,
              textY: ty,
              rotation: midAngle,
              startAngle, // Store for spin calculation
              endAngle
          };
      });

      return paths;
  };

  const handleSpinWheel = () => {
      const now = Date.now();
      if (now - gameState.lastWheelSpin < 3600000) return; // Cooldown

      setIsSpinning(true);

      // Weighted Random Selection
      const rand = Math.random();
      let cumulative = 0;
      let selectedSegment = WHEEL_SEGMENTS[0];

      for (const seg of WHEEL_SEGMENTS) {
          cumulative += seg.probability;
          if (rand < cumulative) {
              selectedSegment = seg;
              break;
          }
      }

      // Calculate Rotation to land on this segment
      // We need the specific angle of this segment from our geometry map
      const sliceGeometry = getWheelSlices().find(s => s.value === selectedSegment.value);
      
      if (sliceGeometry) {
        // Calculate target angle to point UP (0 deg or 360 deg)
        // Currently the slice is at sliceGeometry.rotation (midpoint).
        // We want to rotate such that this midpoint hits 360 (or 0).
        
        const segmentMid = sliceGeometry.rotation;
        const extraSpins = 360 * 10; // Spin 10 times
        // target rotation: minus the segment position to bring it to top
        const targetRotation = extraSpins + (360 - segmentMid);
        
        setWheelRotation(targetRotation);

        setTimeout(() => {
            setWheelReward(selectedSegment.value);
            setIsSpinning(false);
            
            setGameState(prev => ({
                ...prev,
                coins: prev.coins + selectedSegment.value,
                lastWheelSpin: Date.now()
            }));
        }, 3000);
      }
  };

  // Goals Handlers
  const handleClaimQuest = (questId: string) => {
      const quest = gameState.quests.find(q => q.id === questId);
      if (!quest || quest.isClaimed || quest.current < quest.target) return;

      setGameState(prev => ({
          ...prev,
          coins: prev.coins + quest.reward,
          quests: prev.quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q)
      }));
      showNotification(`Quest Complete! +${quest.reward} coins`);
  };

  const handleClaimSet = (setId: string) => {
      if (gameState.claimedSets.includes(setId)) return;
      const setDef = COLLECTION_SETS.find(s => s.id === setId);
      if (!setDef) return;

      setGameState(prev => ({
          ...prev,
          coins: prev.coins + setDef.reward,
          claimedSets: [...prev.claimedSets, setId]
      }));
      showNotification(`Set Completed! +${setDef.reward.toLocaleString()} coins`);
  };

  // Views
  const renderShop = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 p-10 animate-in fade-in duration-500 mb-20 justify-items-center">
      {PACKS.map(pack => (
        <div 
            key={pack.id} 
            onClick={() => handleBuyPack(pack)}
            className="relative w-56 h-80 group cursor-pointer transition-transform duration-300 hover:scale-105 hover:rotate-1 perspective-1000"
        >
            <div className="absolute -top-3 left-0 right-0 h-4 bg-gradient-to-b from-slate-300 to-slate-400 z-10 opacity-90"
                 style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}>
            </div>

            <div className={`w-full h-full bg-gradient-to-br ${pack.color} shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-sm flex flex-col items-center justify-center relative overflow-hidden border-x border-white/10`}>
                 <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none"></div>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 mix-blend-overlay"></div>

                 <div className="relative z-10 flex flex-col items-center text-center p-4 transform transition-transform group-hover:scale-105">
                    <div className="text-xs font-bold tracking-[0.2em] text-white/80 mb-2 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">TRADING CARDS</div>
                    <h3 className="text-4xl font-black text-white uppercase italic drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] rotate-[-5deg] leading-none mb-4">
                        {pack.name.split(' ').map((word, i) => (
                            <span key={i} className="block">{word}</span>
                        ))}
                    </h3>
                    
                    <div className="mt-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                        <div className="flex items-center justify-center gap-1 text-yellow-300 font-bold text-xl drop-shadow-md">
                             <CoinsIcon /> {pack.price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-white uppercase tracking-wider mt-1">{pack.cardCount} Cards</div>
                    </div>
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer skew-x-12"></div>
            </div>

            <div className="absolute -bottom-3 left-0 right-0 h-4 bg-gradient-to-t from-slate-300 to-slate-400 z-10 opacity-90"
                 style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}>
            </div>
        </div>
      ))}
    </div>
  );

  const renderCollection = () => {
    const filtered = gameState.inventory
      .filter(c => filterRarity === 'ALL' || c.rarity === filterRarity)
      .sort((a, b) => b.price - a.price);

    return (
      <div className="p-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar">
                {['ALL', ...Object.values(Rarity)].map(r => (
                    <button 
                        key={r}
                        onClick={() => setFilterRarity(r)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${filterRarity === r ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <div className="text-slate-400 text-sm">
                Total Value: <span className="text-green-400 font-mono">${calculateCollectionValue().toLocaleString()}</span>
            </div>
        </div>

        {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-600">
                <p className="text-xl mb-4">No cards found.</p>
                <button onClick={() => setView(ViewState.SHOP)} className="bg-hoops-accent px-6 py-2 rounded-full text-white">Go Buy Packs</button>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
                {filtered.map(card => (
                    <CardComponent 
                        key={card.id} 
                        card={card} 
                        showPrice 
                        isInLineup={isCardInLineup(card.id)}
                        onSell={() => handleSellCard(card.id)}
                        onToggleLock={() => handleToggleLock(card.id)}
                    />
                ))}
            </div>
        )}
      </div>
    );
  };

  const renderAuctionHouse = () => (
      <div className="p-6 animate-in fade-in duration-500 mb-20">
          <div className="flex justify-between items-center mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Auction House</h2>
                  <p className="text-slate-400 text-sm">Buy specific cards at premium market rates.</p>
                  <p className="text-slate-500 text-xs mt-1">Refreshes automatically every 15 mins.</p>
              </div>
              <button 
                onClick={refreshAuctionHouse}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                  Manual Refresh
              </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {auctionListings.map(card => (
                  <CardComponent 
                    key={card.id} 
                    card={card} 
                    showPrice 
                    isMarketplace 
                    onBuy={() => handleBuyAuction(card)}
                  />
              ))}
          </div>
      </div>
  );

  const renderGoals = () => (
      <div className="p-6 animate-in fade-in duration-500 mb-20 max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-white italic uppercase mb-8">Daily Goals & Sets</h2>

          {/* Daily Quests */}
          <div className="mb-12">
              <h3 className="text-xl font-bold text-hoops-gold mb-4 flex items-center gap-2">
                  <div className="w-2 h-8 bg-hoops-gold rounded-full"></div>
                  DAILY QUESTS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameState.quests.map(quest => (
                      <div key={quest.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-white">{quest.description}</h4>
                                  <span className="bg-slate-900 text-yellow-400 text-xs px-2 py-1 rounded font-mono font-bold">+{quest.reward}</span>
                              </div>
                              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                  <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(quest.current / quest.target) * 100}%` }}></div>
                              </div>
                              <div className="text-right text-xs text-slate-400 mt-1">{quest.current} / {quest.target}</div>
                          </div>
                          
                          <button 
                              disabled={quest.current < quest.target || quest.isClaimed}
                              onClick={() => handleClaimQuest(quest.id)}
                              className={`mt-4 w-full py-2 rounded font-bold text-sm uppercase tracking-wide
                                  ${quest.isClaimed ? 'bg-slate-700 text-slate-500' : 
                                    quest.current >= quest.target ? 'bg-green-500 text-white hover:bg-green-400 animate-pulse' : 'bg-slate-700 text-slate-500 opacity-50'}
                              `}
                          >
                              {quest.isClaimed ? 'Claimed' : 'Claim Reward'}
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Collection Sets */}
          <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-8 bg-blue-400 rounded-full"></div>
                  CARD SETS
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {COLLECTION_SETS.map(setDef => {
                      const uniqueCardsInSet = new Set();
                      gameState.inventory.forEach(card => {
                          let match = true;
                          if (setDef.criteria.team && card.team !== setDef.criteria.team) match = false;
                          if (setDef.criteria.set && card.set !== setDef.criteria.set) match = false;
                          if (setDef.criteria.rarity && card.rarity !== setDef.criteria.rarity) match = false;
                          
                          if (match) uniqueCardsInSet.add(card.name); 
                      });

                      const currentCount = uniqueCardsInSet.size;
                      const isComplete = currentCount >= setDef.criteria.count;
                      const isClaimed = gameState.claimedSets.includes(setDef.id);

                      return (
                          <div key={setDef.id} className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                              {isClaimed && (
                                  <div className="absolute top-2 right-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">COMPLETED</div>
                              )}
                              
                              <h4 className="text-2xl font-black text-white italic uppercase mb-1">{setDef.name}</h4>
                              <p className="text-slate-400 text-sm mb-4">{setDef.description}</p>
                              
                              <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs font-bold text-slate-500 uppercase">Progress</span>
                                  <span className="text-xl font-mono font-bold text-white">{currentCount} <span className="text-slate-500">/ {setDef.criteria.count}</span></span>
                              </div>
                              
                              <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden mb-6 border border-slate-600">
                                  <div className="bg-blue-500 h-full transition-all duration-700 relative" style={{ width: `${Math.min(100, (currentCount / setDef.criteria.count) * 100)}%` }}>
                                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                  </div>
                              </div>

                              <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                                      <CoinsIcon /> +{setDef.reward.toLocaleString()}
                                  </div>
                                  <button
                                      onClick={() => handleClaimSet(setDef.id)}
                                      disabled={!isComplete || isClaimed}
                                      className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wider shadow-lg transition-all
                                          ${isClaimed ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                                            isComplete ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}
                                      `}
                                  >
                                      {isClaimed ? 'Reward Claimed' : 'Claim Reward'}
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
  );

  const renderLineup = () => {
      const Slot = ({ role, id, onRemove }: { role: string, id: string | null, onRemove?: () => void }) => {
          const card = getCardById(id);
          return (
            <div className="flex flex-col items-center gap-2">
                <div 
                    onClick={() => !card && setEditingSlot(role)}
                    className={`w-32 h-48 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group
                        ${card ? 'border-hoops-gold bg-slate-900' : 'border-slate-700 bg-slate-800/50 hover:border-white hover:bg-slate-800'}
                    `}
                >
                    {card ? (
                        <>
                            <img src={card.nbaId 
                                ? `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${card.nbaId}.png`
                                : `https://api.dicebear.com/9.x/micah/svg?seed=${card.name}`} 
                                className="w-full h-full object-cover object-top opacity-80"
                                alt={card.name}
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-2">
                                <div className="text-white font-bold text-xs text-center truncate">{card.name}</div>
                                <div className="text-hoops-gold font-black text-center text-lg leading-none">{card.rating}</div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemove && onRemove(); }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-4xl text-slate-600">+</div>
                            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Add {role}</div>
                        </>
                    )}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded">{role}</div>
            </div>
          );
      };

      return (
          <div className="p-6 pb-20 animate-in fade-in duration-500 flex flex-col items-center">
             <div className="w-full max-w-4xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl mb-10 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white italic uppercase">Starting 5</h2>
                    <p className="text-slate-400 text-sm">Build your dynasty.</p>
                </div>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleAutoOptimizeLineup}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors shadow-lg"
                    >
                        Auto-Update
                    </button>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase font-bold">Team OVR</div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                            {calculateTeamRating()}
                        </div>
                    </div>
                </div>
             </div>

             <div className="w-full max-w-4xl relative mb-12">
                 <div className="flex justify-center gap-4 flex-wrap md:flex-nowrap">
                     <Slot role="PG" id={gameState.lineup.PG} onRemove={() => handleUnequip('PG')} />
                     <Slot role="SG" id={gameState.lineup.SG} onRemove={() => handleUnequip('SG')} />
                     <Slot role="SF" id={gameState.lineup.SF} onRemove={() => handleUnequip('SF')} />
                     <Slot role="PF" id={gameState.lineup.PF} onRemove={() => handleUnequip('PF')} />
                     <Slot role="C" id={gameState.lineup.C} onRemove={() => handleUnequip('C')} />
                 </div>
             </div>

             <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
                    <h3 className="text-lg font-bold text-slate-400">BENCH ROTATION (Max 8)</h3>
                    <span className="text-xs text-slate-500">{gameState.lineup.Bench.length}/8 Slots Filled</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {gameState.lineup.Bench.map((id, idx) => (
                        <Slot key={`bench-${idx}`} role="BENCH" id={id} onRemove={() => handleUnequip('Bench', idx)} />
                    ))}
                    {gameState.lineup.Bench.length < 8 && (
                        <div className="min-w-[8rem]">
                            <Slot role="Bench" id={null} />
                        </div>
                    )}
                </div>
             </div>

             {editingSlot && (
                 <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl">
                         <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                             <h3 className="text-xl font-bold text-white">Select {editingSlot}</h3>
                             <button onClick={() => setEditingSlot(null)} className="text-slate-400 hover:text-white">Close</button>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                             {gameState.inventory
                                .filter(c => !isCardInLineup(c.id))
                                .filter(c => editingSlot === 'Bench' ? true : c.position === editingSlot)
                                .sort((a,b) => b.rating - a.rating)
                                .map(card => (
                                    <div 
                                        key={card.id} 
                                        onClick={() => handleEquipCard(card.id)}
                                        className="cursor-pointer hover:scale-105 transition-transform"
                                    >
                                        <CardComponent card={card} size="sm" />
                                    </div>
                                ))
                             }
                             {gameState.inventory.filter(c => !isCardInLineup(c.id) && (editingSlot === 'Bench' ? true : c.position === editingSlot)).length === 0 && (
                                 <div className="col-span-full text-center py-10 text-slate-500">
                                     No available players for this position.
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             )}

          </div>
      );
  };

  const renderWagerMode = () => {
      const userOvr = calculateTeamRating();
      // Use persisted opponent OVR to prevent changing difficulties by upgrading team mid-wager
      const opponent = gameState.activeWagerOpponent;
      const cpuOvr = opponent ? opponent.ovr : 0;
      const ovrDiff = userOvr - cpuOvr;
      
      // Visual indicator of win probability (approximate for UI feedback)
      let winChance = 50 + (ovrDiff * 3);
      winChance = Math.max(5, Math.min(95, winChance));

      return (
        <div className="p-6 pb-20 animate-in fade-in duration-500 flex flex-col items-center max-w-3xl mx-auto">
          <div className="text-center mb-8">
              <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Wager Match</h2>
              <p className="text-slate-400 mt-2">Bet your coins. Anything can happen.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full mb-10">
              <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase">Wins</div>
                  <div className="text-2xl font-bold text-green-400">{gameState.wagerStats.wins}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase">Losses</div>
                  <div className="text-2xl font-bold text-red-400">{gameState.wagerStats.losses}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase">Earnings</div>
                  <div className={`text-2xl font-bold ${gameState.wagerStats.earnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {gameState.wagerStats.earnings >= 0 ? '+' : ''}{gameState.wagerStats.earnings.toLocaleString()}
                  </div>
              </div>
          </div>

          {/* Matchup Display */}
          <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 flex justify-between items-center relative overflow-hidden mb-8 shadow-2xl">
              <div className="relative z-10 text-center w-1/3">
                  <div className="text-sm text-slate-400 font-bold uppercase mb-2">My Team</div>
                  <div className="text-5xl font-black text-white">{userOvr}</div>
                  <div className="text-xs text-slate-500 mt-1">OVR</div>
              </div>

              <div className="relative z-10 flex flex-col items-center w-1/3">
                  <div className="text-4xl font-black text-white/20 italic mb-2">VS</div>
                  {!isSimulatingMatch && (
                     <div className="text-xs text-slate-500 bg-black/30 px-2 py-1 rounded">
                         Win Chance: <span className={winChance > 50 ? 'text-green-400' : 'text-red-400'}>~{Math.floor(winChance)}%</span>
                     </div>
                  )}
              </div>

              <div className="relative z-10 text-center w-1/3">
                  <div className="text-sm text-slate-400 font-bold uppercase mb-2">
                      {opponent ? opponent.name : 'Finding Opponent...'}
                  </div>
                  <div className="text-5xl font-black text-red-500">
                      {opponent ? opponent.ovr : '?'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">OVR</div>
              </div>
              
              {isSimulatingMatch && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                     <div className="text-4xl font-black text-white animate-bounce uppercase italic">Playing Match...</div>
                </div>
              )}
          </div>

          <div className="w-full bg-slate-800 rounded-xl p-6 border border-slate-600">
              <div className="flex justify-between mb-4">
                  <span className="text-slate-300 font-bold">Wager Amount</span>
                  <span className="text-yellow-400 font-mono font-bold">{wagerAmount.toLocaleString()} Coins</span>
              </div>
              <input 
                  type="range" 
                  min="100" 
                  max={gameState.coins} 
                  step="100"
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-6"
                  disabled={isSimulatingMatch}
              />
              
              <div className="flex justify-between gap-2 mb-6">
                  <button onClick={() => setWagerAmount(Math.min(1000, gameState.coins))} className="px-3 py-1 bg-slate-700 text-xs rounded text-white hover:bg-slate-600">1k</button>
                  <button onClick={() => setWagerAmount(Math.min(5000, gameState.coins))} className="px-3 py-1 bg-slate-700 text-xs rounded text-white hover:bg-slate-600">5k</button>
                  <button onClick={() => setWagerAmount(Math.min(10000, gameState.coins))} className="px-3 py-1 bg-slate-700 text-xs rounded text-white hover:bg-slate-600">10k</button>
                  <button onClick={() => setWagerAmount(gameState.coins)} className="px-3 py-1 bg-red-900/50 border border-red-500 text-xs rounded text-red-200 hover:bg-red-900">MAX</button>
              </div>

              <button 
                  onClick={handlePlaceWager}
                  disabled={isSimulatingMatch || gameState.coins < 100}
                  className={`w-full py-4 rounded-lg font-black text-xl uppercase tracking-widest transition-all transform hover:scale-105 hover:shadow-lg
                    ${gameState.coins < 100 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-400 hover:to-orange-500'}
                  `}
              >
                  {isSimulatingMatch ? 'Simulating...' : 'PLACE BET'}
              </button>
          </div>
      </div>
      );
  };

  return (
    <div className="min-h-screen flex flex-col bg-hoops-dark">
      <header className="sticky top-0 z-40 bg-hoops-dark/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-black italic text-white shadow-lg transform skew-x-[-10deg]">
                HD
            </div>
            <h1 className="text-2xl font-black tracking-tight hidden md:block italic">HOOPS <span className="text-hoops-accent">DYNASTY</span></h1>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => { setWheelReward(null); setShowWheel(true); }}
                className="hidden sm:flex bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:scale-105 transition-transform border border-white/20 shadow-lg items-center gap-2"
            >
                <span className="animate-spin-slow">🎡</span> Daily Spin
            </button>

            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
                <CoinsIcon />
                <span className="font-mono font-bold text-lg text-white tracking-wide">{gameState.coins.toLocaleString()}</span>
            </div>
        </div>
      </header>

      <nav className="flex justify-center gap-2 md:gap-6 py-4 border-b border-slate-800/50 bg-hoops-dark sticky top-[65px] z-30 shadow-md overflow-x-auto no-scrollbar px-4">
         <button 
            onClick={() => setView(ViewState.SHOP)}
            className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${view === ViewState.SHOP ? 'bg-hoops-accent text-white shadow-lg shadow-blue-500/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
         >
            <ShopIcon /> Shop
         </button>
         <button 
            onClick={() => setView(ViewState.LINEUP)}
            className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${view === ViewState.LINEUP ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
         >
            <JerseyIcon /> My Team
         </button>
         <button 
            onClick={() => setView(ViewState.WAGER)}
            className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${view === ViewState.WAGER ? 'bg-red-600 text-white shadow-lg shadow-red-500/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
         >
            <DiceIcon /> Wager Match
         </button>
         <button 
            onClick={() => setView(ViewState.GOALS)}
            className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${view === ViewState.GOALS ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
         >
            <GoalsIcon /> Goals
            {gameState.quests.some(q => !q.isClaimed && q.current >= q.target) && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1"></span>
            )}
         </button>
         <button 
            onClick={() => setView(ViewState.MARKET)}
            className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${view === ViewState.MARKET ? 'bg-green-600 text-white shadow-lg shadow-green-500/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
         >
            <GavelIcon /> Auction
         </button>
         <button 
            onClick={() => setView(ViewState.COLLECTION)}
            className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${view === ViewState.COLLECTION ? 'bg-hoops-accent text-white shadow-lg shadow-blue-500/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
         >
            <BinderIcon /> Binder <span className="ml-1 bg-black/30 px-1.5 py-0.5 rounded text-[10px]">{gameState.inventory.length}</span>
         </button>
      </nav>

      <main className="flex-1 bg-hoops-dark bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]">
        {view === ViewState.SHOP && renderShop()}
        {view === ViewState.COLLECTION && renderCollection()}
        {view === ViewState.MARKET && renderAuctionHouse()}
        {view === ViewState.LINEUP && renderLineup()}
        {view === ViewState.WAGER && renderWagerMode()}
        {view === ViewState.GOALS && renderGoals()}
      </main>

      {activePack && (
        <PackOpener pack={activePack} onClose={handlePackClosed} />
      )}

      {showWheel && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                  <button onClick={() => setShowWheel(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-20">✕</button>
                  
                  <h2 className="text-2xl font-black text-white uppercase italic mb-6">Money Wheel</h2>
                  
                  {Date.now() - gameState.lastWheelSpin < 3600000 && !wheelReward ? (
                      <div className="py-10">
                          <div className="text-4xl mb-4">⏳</div>
                          <h3 className="text-xl font-bold text-white mb-2">Cooling Down</h3>
                          <p className="text-slate-400">Come back in an hour!</p>
                          <p className="text-xs text-slate-500 mt-4">Time Remaining: {Math.ceil((3600000 - (Date.now() - gameState.lastWheelSpin)) / 60000)} mins</p>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center">
                          {/* Custom SVG Wheel */}
                          <div className="relative w-64 h-64 mb-8">
                                {/* Pointer */}
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 text-4xl text-white drop-shadow-lg">▼</div>
                                
                                {/* Rotating Container */}
                                <div 
                                    className="w-full h-full transition-transform duration-[3000ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
                                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                                >
                                    <svg viewBox="0 0 100 100" className="w-full h-full rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                        {getWheelSlices().map((slice, i) => (
                                            <g key={i}>
                                                <path d={slice.pathData} fill={slice.color} stroke="#1e293b" strokeWidth="0.5" />
                                                <text 
                                                    x={slice.textX} 
                                                    y={slice.textY} 
                                                    fill="white" 
                                                    fontSize="5" 
                                                    fontWeight="bold" 
                                                    textAnchor="middle" 
                                                    alignmentBaseline="middle"
                                                    transform={`rotate(${slice.rotation + 90}, ${slice.textX}, ${slice.textY})`}
                                                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                                                >
                                                    {slice.value}
                                                </text>
                                            </g>
                                        ))}
                                        {/* Center Cap */}
                                        <circle cx="50" cy="50" r="10" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
                                        <text x="50" y="50" fontSize="4" textAnchor="middle" alignmentBaseline="middle" fill="#334155" fontWeight="bold">HD</text>
                                    </svg>
                                </div>
                          </div>

                          {wheelReward ? (
                              <div className="animate-in zoom-in">
                                  <h3 className="text-lg text-slate-400 uppercase font-bold">You Won</h3>
                                  <div className="text-4xl font-black text-yellow-400 mb-6">+{wheelReward} Coins</div>
                                  <button 
                                    onClick={() => { setWheelReward(null); setShowWheel(false); }}
                                    className="bg-white text-black px-8 py-2 rounded-full font-bold hover:bg-slate-200"
                                  >
                                      Claim
                                  </button>
                              </div>
                          ) : (
                              <button 
                                onClick={handleSpinWheel}
                                disabled={isSpinning}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-3 rounded-full font-black text-white text-xl hover:scale-105 transition-transform shadow-lg"
                              >
                                  {isSpinning ? 'Spinning...' : 'SPIN!'}
                              </button>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}

      {matchResult && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                <div className="text-6xl mb-4">
                    {matchResult.win ? '🤑' : '💸'}
                </div>
                <h2 className={`text-3xl font-black uppercase italic mb-2 ${matchResult.win ? 'text-green-400' : 'text-red-400'}`}>
                    {matchResult.win ? 'PAYOUT!' : 'BUSTED'}
                </h2>
                <p className="text-slate-400 text-lg mb-6">Final Score: <span className="text-white font-mono font-bold">{matchResult.score}</span></p>
                
                {matchResult.win ? (
                    <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                        <div className="text-xs text-slate-500 uppercase">Winnings</div>
                        <div className="flex justify-center items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-yellow-400 font-bold text-2xl"><CoinsIcon /> +{matchResult.reward.toLocaleString()}</div>
                        </div>
                    </div>
                ) : (
                     <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                        <p className="text-slate-500">Better luck next time.</p>
                    </div>
                )}

                <button 
                    onClick={() => setMatchResult(null)}
                    className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-widest"
                >
                    Continue
                </button>
            </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl border-l-4 border-green-500 animate-in slide-in-from-right fade-in duration-300 z-50 flex items-center gap-3">
            <div className="bg-green-500/20 p-1.5 rounded-full text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="font-bold text-sm">{notification}</span>
        </div>
      )}
    </div>
  );
};

export default App;
