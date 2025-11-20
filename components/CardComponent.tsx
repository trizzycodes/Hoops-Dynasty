import React from 'react';
import { PlayerCard, Rarity } from '../types';
import { RARITY_COLORS } from '../constants';

interface CardProps {
  card: PlayerCard;
  onSell?: () => void;
  onToggleLock?: () => void;
  onBuy?: () => void; // For auction house
  size?: 'sm' | 'md' | 'lg';
  showPrice?: boolean;
  isMarketplace?: boolean;
  isInLineup?: boolean;
  className?: string;
}

export const CardComponent: React.FC<CardProps> = ({ 
  card, 
  onSell, 
  onToggleLock,
  onBuy,
  size = 'md', 
  showPrice = false, 
  isMarketplace = false,
  isInLineup = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: "w-28 h-40 text-xs",
    md: "w-56 h-80 text-sm",
    lg: "w-72 h-96 text-base"
  };

  // Dynamic Theme Styles
  const getThemeStyles = () => {
    switch (card.set) {
      case 'Rookie':
        return {
          bg: 'bg-gradient-to-b from-green-900 via-emerald-800 to-green-950',
          border: 'border-emerald-400',
          text: 'text-emerald-100',
          accent: 'bg-emerald-500',
          badge: 'ROOKIE',
          icon: null
        };
      case 'All-Star':
        return {
          bg: 'bg-gradient-to-br from-blue-900 via-indigo-800 to-red-900',
          border: 'border-indigo-400',
          text: 'text-indigo-100',
          accent: 'bg-indigo-500',
          badge: 'ALL-STAR',
          icon: '★'
        };
      case 'Summer':
        return {
          bg: 'bg-gradient-to-b from-cyan-500 via-yellow-500 to-orange-500',
          border: 'border-yellow-300',
          text: 'text-yellow-100',
          accent: 'bg-orange-400',
          badge: 'SUMMER',
          icon: '☀'
        };
      case 'Halloween':
        return {
          bg: 'bg-gradient-to-b from-purple-900 via-black to-orange-900',
          border: 'border-orange-500',
          text: 'text-orange-100',
          accent: 'bg-purple-600',
          badge: 'SPOOKY',
          icon: '🎃'
        };
      case 'Christmas':
        return {
          bg: 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-red-700 via-green-800 to-red-900',
          border: 'border-red-200',
          text: 'text-red-100',
          accent: 'bg-green-600',
          badge: 'FESTIVE',
          icon: '❄'
        };
      case 'Playoffs':
        return {
          bg: 'bg-gradient-to-b from-slate-800 via-red-900 to-slate-900',
          border: 'border-red-500',
          text: 'text-red-100',
          accent: 'bg-red-600',
          badge: 'PLAYOFFS',
          icon: '🏆'
        };
      case 'Finals MVP':
        return {
          bg: 'bg-gradient-to-br from-yellow-800 via-amber-600 to-yellow-900',
          border: 'border-yellow-400',
          text: 'text-yellow-100',
          accent: 'bg-yellow-500',
          badge: 'FINALS MVP',
          icon: '👑'
        };
      case 'Hall of Fame':
        return {
          bg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-500 via-slate-900 to-black',
          border: 'border-white/50',
          text: 'text-slate-100',
          accent: 'bg-slate-200 text-black',
          badge: 'H.O.F.',
          icon: '🏛'
        };
      default: // Base
        return {
          bg: 'bg-gradient-to-b from-slate-700 to-slate-900',
          border: 'border-slate-600',
          text: 'text-slate-200',
          accent: 'bg-slate-500',
          badge: 'BASE',
          icon: null
        };
    }
  };

  const theme = getThemeStyles();

  // Image Source
  // Use real NBA headshot if available, otherwise fallback to DiceBear avatar
  const imageUrl = card.nbaId 
    ? `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${card.nbaId}.png`
    : `https://api.dicebear.com/9.x/micah/svg?seed=${card.name}&backgroundColor=transparent`;

  const isHolo = card.rarity === Rarity.LEGENDARY || card.rarity === Rarity.GOAT || card.set === 'Hall of Fame';

  return (
    <div 
      className={`relative group rounded-xl transition-all duration-300 transform hover:-translate-y-2 select-none flex flex-col ${sizeClasses[size]} ${className} hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]`}
    >
      {/* Main Card Frame */}
      <div className={`absolute inset-0 rounded-xl border-2 ${theme.border} ${theme.bg} overflow-hidden shadow-xl`}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} 
        />

        {/* Player Image Container */}
        <div className="absolute top-8 left-0 right-0 bottom-20 z-10 flex items-center justify-center overflow-hidden">
             {/* Colored Glow behind player */}
             <div className={`absolute w-32 h-32 rounded-full blur-3xl opacity-40 ${theme.accent}`} />
             
             {/* Theme Icon Background */}
             {theme.icon && (
                 <div className="absolute text-9xl opacity-20 select-none animate-pulse">{theme.icon}</div>
             )}
             
             <img 
                src={imageUrl} 
                alt={card.name}
                className="h-[110%] w-auto object-cover object-top drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110"
             />

             {/* Themed Art Overlays around Face */}
             {card.set === 'Halloween' && (
                 <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full blur-md scale-75 pointer-events-none mix-blend-color-dodge" />
             )}
             {card.set === 'Christmas' && (
                 <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-90 pointer-events-none animate-pulse" />
             )}
             {card.set === 'Summer' && (
                 <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl scale-90 pointer-events-none" />
             )}

        </div>

        {/* Holographic Shine Overlay */}
        {isHolo && (
            <div className="absolute inset-0 pointer-events-none z-20 card-shine opacity-40 mix-blend-color-dodge" />
        )}

        {/* Top Badge & Rating */}
        <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent h-16">
            <div className="flex flex-col">
                <div className={`text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded shadow-sm border border-white/10 ${theme.accent} ${card.set === 'Hall of Fame' ? 'text-black' : 'text-white'}`}>
                    {theme.badge}
                </div>
                {card.isAiGenerated && (
                    <div className="text-[8px] font-bold text-cyan-400 mt-1 uppercase tracking-tighter">AI Scouted</div>
                )}
            </div>
            
            <div className="flex flex-col items-center">
                <div className={`text-lg font-black leading-none ${theme.text} text-shadow-lg`}>
                    {card.rating}
                </div>
                <div className="text-[8px] uppercase opacity-75">OVR</div>
            </div>
        </div>

        {/* Bottom Info Panel */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-2 px-3">
            
            {/* Stats Row */}
            <div className="flex justify-between items-center mb-2 px-1 border-b border-white/10 pb-1">
                <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider">OFF</span>
                    <span className="text-xs font-bold text-white">{card.stats.offense}</span>
                </div>
                <div className="w-px h-5 bg-white/10"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider">DEF</span>
                    <span className="text-xs font-bold text-white">{card.stats.defense}</span>
                </div>
                <div className="w-px h-5 bg-white/10"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider">POT</span>
                    <span className="text-xs font-bold text-green-400">{card.stats.potential}</span>
                </div>
            </div>

            <h3 className="font-black text-white text-lg uppercase italic leading-none tracking-tight truncate text-shadow-lg">
                {card.name}
            </h3>
            <div className="flex justify-between items-end mt-1 pt-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/60 font-bold uppercase">{card.team}</span>
                    <span className="text-[10px] text-white/40 font-mono">{card.position}</span>
                </div>
                
                <div className={`w-3 h-3 rounded-full ${RARITY_COLORS[card.rarity]} border border-white/30 shadow-sm`} title={card.rarity} />
            </div>

            {/* Market/Sell Price Display */}
            {showPrice && (
                <div className="mt-1.5 bg-black/40 rounded px-2 py-1 flex justify-between items-center border border-white/5">
                    <span className="text-[10px] text-white/50 uppercase">{isMarketplace ? 'Cost' : 'Value'}</span>
                    <span className="text-xs font-bold text-green-400 tracking-wide">$ {card.price.toLocaleString()}</span>
                </div>
            )}
        </div>

        {/* Lineup Indicator */}
        {isInLineup && !isMarketplace && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 px-3 py-1 rounded border border-hoops-gold shadow-xl">
             <span className="text-hoops-gold text-[10px] font-black uppercase tracking-widest">IN LINEUP</span>
           </div>
        )}

        {/* Lock Icon */}
        {!isMarketplace && (
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleLock && onToggleLock(); }}
                className="absolute top-2 right-8 z-30 opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
                {card.isLocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 drop-shadow-md"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 hover:text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                )}
            </button>
        )}
      </div>

      {/* Action Buttons (Slide Up on Hover) */}
      <div className="absolute bottom-4 left-2 right-2 z-30 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
            {isMarketplace ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); onBuy && onBuy(); }}
                    className="w-full bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded shadow-lg uppercase tracking-wider border border-green-400"
                >
                    Buy
                </button>
            ) : (
                !card.isLocked && !isInLineup && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSell && onSell(); }}
                        className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded shadow-lg uppercase tracking-wider border border-red-400"
                    >
                        Quick Sell
                    </button>
                )
            )}
      </div>
    </div>
  );
};