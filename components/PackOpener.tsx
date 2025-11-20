import React, { useState, useEffect } from 'react';
import { Pack, PlayerCard, Rarity } from '../types';
import { CardComponent } from './CardComponent';
import { generateBaseCard } from '../constants';

interface PackOpenerProps {
  pack: Pack;
  onClose: (cards: PlayerCard[]) => void;
}

export const PackOpener: React.FC<PackOpenerProps> = ({ pack, onClose }) => {
  const [stage, setStage] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [cards, setCards] = useState<PlayerCard[]>([]);

  useEffect(() => {
    // Generate cards when component mounts
    const newCards: PlayerCard[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      // Simple probability logic
      let card = generateBaseCard();
      const rand = Math.random();
      
      // Override rarity based on pack probabilities
      let cumulative = 0;
      let selectedRarity = Rarity.COMMON;
      
      // Force guaranteed rarity for the last card if applicable
      if (i === pack.cardCount - 1 && pack.guaranteedRarity) {
         // Re-roll until we hit at least the guaranteed rarity
         let safety = 0;
         while (RARITY_VALUES[card.rarity] < RARITY_VALUES[pack.guaranteedRarity] && safety < 50) {
             card = generateBaseCard();
             safety++;
         }
         // Hard force if RNG fails
         if (RARITY_VALUES[card.rarity] < RARITY_VALUES[pack.guaranteedRarity]) {
            card.rarity = pack.guaranteedRarity;
            card.rating = 85; // baseline for forced
         }
      } else {
        // Standard pack probability
        for (const [rarity, prob] of Object.entries(pack.probabilities)) {
            cumulative += prob;
            if (rand < cumulative) {
                selectedRarity = rarity as Rarity;
                break;
            }
        }
        // Attempt to generate a card of that rarity (basic rejection sampling)
        let attempts = 0;
        while (card.rarity !== selectedRarity && attempts < 10) {
            card = generateBaseCard();
            attempts++;
        }
      }
      
      newCards.push(card);
    }
    setCards(newCards);
  }, [pack]);

  // Helper to compare rarity order
  const RARITY_VALUES = {
      [Rarity.COMMON]: 1,
      [Rarity.RARE]: 2,
      [Rarity.EPIC]: 3,
      [Rarity.LEGENDARY]: 4,
      [Rarity.GOAT]: 5
  };

  const handlePackClick = () => {
    if (stage === 'idle') {
      setStage('opening');
      setTimeout(() => {
        setStage('revealed');
      }, 2000);
    }
  };

  const handleFinish = () => {
    onClose(cards);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto backdrop-blur-md">
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
      
        {stage !== 'revealed' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div 
                onClick={handlePackClick}
                className={`relative w-64 h-96 rounded-xl shadow-2xl cursor-pointer transition-transform duration-500 bg-gradient-to-br ${pack.color} border-4 border-white/10 flex items-center justify-center flex-col gap-4 ${stage === 'opening' ? 'animate-bounce-slight' : 'hover:scale-105'}`}
                >
                    <div className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg text-center px-4">
                        {pack.name}
                    </div>
                    <div className="text-white/80 font-mono text-sm">Tap to Open</div>
                    
                    {stage === 'opening' && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                    )}
                </div>
                {stage === 'idle' && (
                    <p className="text-slate-400 mt-8 animate-pulse">Tap the pack to break the seal</p>
                )}
            </div>
        )}

        {stage === 'revealed' && (
            <div className="w-full max-w-6xl flex flex-col items-center animate-in fade-in duration-500 py-8">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8 tracking-wide uppercase italic">Pack Results</h2>
                
                <div className="flex flex-wrap justify-center gap-8 mb-12 w-full">
                    {cards.map((card, idx) => (
                        <div 
                            key={card.id} 
                            className="animate-in zoom-in slide-in-from-bottom-10 duration-700"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <CardComponent card={card} size="md" />
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-6 z-50 animate-in slide-in-from-bottom-20 fade-in duration-1000 delay-500">
                    <button 
                        onClick={handleFinish}
                        className="px-16 py-4 bg-gradient-to-r from-hoops-gold to-orange-500 text-white text-xl font-black rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all shadow-2xl border-2 border-white/20 uppercase tracking-widest"
                    >
                        Claim Cards
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
