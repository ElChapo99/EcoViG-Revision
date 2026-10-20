// Guaranteed Non-Overlapping Staggered Terrain Slots (Isometric 3-Tier Depth Layout)
export interface TerrainSlot {
  id: number;
  bottom: string;
  left: string;
  zIndex: number;
  scale: string;
  isReserved?: boolean;
}

export const TERRAIN_SLOTS: TerrainSlot[] = [
  // --- FRONT TIER (Foreground: bottom 4% - 11%, zIndex 40-49, scale 1.05) ---
  { id: 1, bottom: '5%', left: '8%', zIndex: 44, scale: 'scale-90 sm:scale-105' },
  { id: 2, bottom: '8%', left: '22%', zIndex: 42, scale: 'scale-90 sm:scale-105' },
  { id: 3, bottom: '4%', left: '38%', zIndex: 45, scale: 'scale-90 sm:scale-105' },
  { id: 4, bottom: '7%', left: '54%', zIndex: 43, scale: 'scale-90 sm:scale-105' },
  { id: 5, bottom: '5%', left: '70%', zIndex: 44, scale: 'scale-90 sm:scale-105' },
  { id: 6, bottom: '8%', left: '86%', zIndex: 42, scale: 'scale-90 sm:scale-105' },

  // --- MID TIER (Midground: bottom 14% - 21%, zIndex 30-39, scale 0.95) ---
  { id: 7, bottom: '15%', left: '14%', zIndex: 34, scale: 'scale-85 sm:scale-95' },
  { id: 8, bottom: '18%', left: '30%', zIndex: 32, scale: 'scale-85 sm:scale-95' },
  { id: 9, bottom: '14%', left: '46%', zIndex: 35, scale: 'scale-85 sm:scale-95' },
  { id: 10, bottom: '19%', left: '62%', zIndex: 31, scale: 'scale-85 sm:scale-95' },
  { id: 11, bottom: '15%', left: '78%', zIndex: 34, scale: 'scale-85 sm:scale-95' },
  { id: 12, bottom: '20%', left: '92%', zIndex: 30, scale: 'scale-80 sm:scale-90' },

  // --- BACK TIER (Background / Upper Terrain: bottom 25% - 31%, zIndex 20-29, scale 0.85) ---
  { id: 13, bottom: '27%', left: '6%', zIndex: 23, scale: 'scale-75 sm:scale-85' },
  { id: 14, bottom: '25%', left: '20%', zIndex: 25, scale: 'scale-75 sm:scale-85' },
  { id: 15, bottom: '29%', left: '36%', zIndex: 21, scale: 'scale-75 sm:scale-85' },
  { id: 16, bottom: '26%', left: '52%', zIndex: 24, scale: 'scale-75 sm:scale-85' },
  { id: 17, bottom: '30%', left: '68%', zIndex: 20, scale: 'scale-75 sm:scale-85' },
  { id: 18, bottom: '26%', left: '84%', zIndex: 24, scale: 'scale-75 sm:scale-85' },
];
