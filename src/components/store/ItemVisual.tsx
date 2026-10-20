import React from 'react';
import { StoreItem } from '../../data/storeItems';
import { Sparkles, Zap, Flame, Shield, Star } from 'lucide-react';
import ItemIllustration from './ItemIllustration';

interface ItemVisualProps {
  item: StoreItem;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isEquipped?: boolean;
}

// Background theme styling per biome & rarity
export const getItemVisualStyles = (item: StoreItem) => {
  const { biomeId, rarity, category } = item;

  // Gradients based on Biome & Rarity
  let haloGradient = 'from-emerald-500/20 via-teal-500/10 to-transparent';
  let borderColor = 'border-emerald-500/30';
  let glowShadow = 'shadow-[0_0_25px_rgba(16,185,129,0.25)]';
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let accentColor = '#34d399';

  if (biomeId === 'desert') {
    haloGradient = 'from-amber-500/25 via-orange-500/15 to-transparent';
    borderColor = 'border-amber-500/40';
    glowShadow = 'shadow-[0_0_25px_rgba(245,158,11,0.25)]';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    accentColor = '#f59e0b';
  } else if (biomeId === 'mountain') {
    haloGradient = 'from-blue-500/25 via-indigo-500/15 to-transparent';
    borderColor = 'border-blue-500/40';
    glowShadow = 'shadow-[0_0_25px_rgba(59,130,246,0.25)]';
    badgeBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    accentColor = '#60a5fa';
  } else if (biomeId === 'city') {
    haloGradient = 'from-teal-400/25 via-emerald-500/15 to-transparent';
    borderColor = 'border-teal-400/40';
    glowShadow = 'shadow-[0_0_25px_rgba(45,212,191,0.25)]';
    badgeBg = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    accentColor = '#2dd4bf';
  }

  // Rarity Overrides
  if (rarity === 'legendary') {
    haloGradient = 'from-amber-400/35 via-purple-500/20 to-pink-500/10';
    borderColor = 'border-amber-400/60 ring-1 ring-amber-400/40';
    glowShadow = 'shadow-[0_0_35px_rgba(245,158,11,0.4)]';
    accentColor = '#fbbf24';
  } else if (rarity === 'epic') {
    haloGradient = 'from-purple-500/30 via-pink-500/15 to-transparent';
    borderColor = 'border-purple-500/50';
    glowShadow = 'shadow-[0_0_30px_rgba(168,85,247,0.3)]';
    accentColor = '#c084fc';
  }

  return { haloGradient, borderColor, glowShadow, badgeBg, accentColor };
};

export default function ItemVisual({ item, size = 'md', isEquipped }: ItemVisualProps) {
  const { haloGradient, borderColor, glowShadow, accentColor } = getItemVisualStyles(item);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
    hero: 'w-44 h-44 sm:w-52 sm:h-52'
  };

  const isHighTier = item.rarity === 'epic' || item.rarity === 'legendary';

  return (
    <div className="relative flex items-center justify-center group/visual">
      {/* Outer ambient glow */}
      <div 
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${haloGradient} blur-xl opacity-70 group-hover/visual:opacity-100 transition-opacity duration-300`}
      />

      {/* Main Illustration Container Frame */}
      <div 
        className={`relative ${sizeClasses[size]} rounded-[26px] bg-gradient-to-b from-white/10 via-black/40 to-black/70 border ${borderColor} ${glowShadow} flex items-center justify-center backdrop-blur-xl overflow-hidden transition-transform duration-300 group-hover/visual:scale-105 p-3`}
      >
        {/* Decorative Grid / Mesh background pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
            backgroundSize: '12px 12px'
          }}
        />

        {/* Ambient Top Light Flare */}
        <div className="absolute -top-6 inset-x-0 h-10 bg-white/20 rounded-full blur-md pointer-events-none" />

        {/* High tier animated sparkle orbs */}
        {isHighTier && (
          <>
            <span className="absolute top-2 left-2 text-[10px] animate-pulse text-amber-300">✨</span>
            <span className="absolute bottom-2 right-2 text-[10px] animate-pulse text-teal-300 delay-300">✦</span>
          </>
        )}

        {/* The Animated Vector Item Artwork */}
        <div className="relative z-10 drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)] transform transition-transform duration-300 group-hover/visual:-translate-y-1 w-full h-full flex items-center justify-center">
          <ItemIllustration itemId={item.id} size={size === 'hero' ? 'lg' : size === 'lg' ? 'md' : 'sm'} />
        </div>

        {/* Pedestal Shadow */}
        <div className="absolute bottom-2 inset-x-4 h-2 bg-black/50 rounded-full blur-sm -z-0" />
      </div>
    </div>
  );
}

/**
 * Visual renderer for decorations inside the Interactive Ecosystem Landscape
 */
export function SceneItemVisual({ item }: { item: StoreItem }) {
  const { accentColor } = getItemVisualStyles(item);
  const isLegendary = item.rarity === 'legendary';
  const isEpic = item.rarity === 'epic';

  return (
    <div className="relative flex flex-col items-center group cursor-pointer select-none">
      {/* Hover Floating Name Tag */}
      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap bg-black/90 border border-white/20 px-2.5 py-1 rounded-xl text-[11px] font-bold text-white shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
        <span>{item.icon}</span>
        <span>{item.name}</span>
        {isLegendary && <Sparkles className="w-3 h-3 text-amber-400" />}
      </div>

      {/* Aura for Epic / Legendary items in scene */}
      {(isLegendary || isEpic) && (
        <div 
          className="absolute -inset-3 rounded-full blur-md opacity-40 animate-pulse pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Main Animated Vector Artwork */}
      <div className="relative z-10 drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)] transform transition-transform duration-300 group-hover:scale-120 group-hover:-translate-y-2">
        <ItemIllustration itemId={item.id} size="scene" />
      </div>

      {/* Grounding Shadow / Pedestal */}
      <div className="w-12 h-3 bg-black/60 rounded-full blur-[2px] mt-[-4px] z-0 transition-transform duration-300 group-hover:scale-75 opacity-75" />
    </div>
  );
}
