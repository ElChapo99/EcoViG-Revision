import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { apiFetch, parseApiError } from './apiClient';
import { BiomeWorldLayout, ElementPosition } from '../types';
import { TERRAIN_SLOTS } from '../data/terrainSlots';

// Safe boundary limits in percentage of the scenery viewport
export const BOUNDS = {
  minX: 6,
  maxX: 94,
  minY: 4,  // 4% from bottom (foreground)
  maxY: 42, // 42% from bottom (background hillcrest)
};

/**
 * Clamps coordinates to safe visual landscape boundaries
 */
export function clampPosition(x: number, y: number): ElementPosition {
  return {
    x: Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, Math.round(x * 10) / 10)),
    y: Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, Math.round(y * 10) / 10)),
  };
}

/**
 * Calculates isometric depth z-index based on Y (bottom percentage).
 * Items lower on screen (smaller bottom %) are closer to the camera and have higher z-index.
 */
export function calculateZIndex(y: number): number {
  // y ranges from ~4% to ~42%.
  // Inverse mapping: y=4 -> z=48, y=40 -> z=12
  const normalizedY = Math.max(0, Math.min(50, y));
  return 50 - Math.round(normalizedY);
}

/**
 * Default coordinate mappings for base ecosystem elements
 */
export function getBaseElementDefaultPosition(type: string, biomeId: string): ElementPosition {
  switch (type) {
    case 'tree_1':
      return { x: 10, y: 25 };
    case 'tree_2':
      return { x: 22, y: 24 };
    case 'tree_3':
      return { x: 84, y: 26 };
    case 'water':
      return { x: 78, y: 15 };
    case 'animal':
      return biomeId === 'forest' ? { x: 30, y: 6 } : { x: 32, y: 14 };
    default:
      return { x: 50, y: 20 };
  }
}

/**
 * Computes default layout dictionary for all current active elements in a biome
 */
export function computeDefaultBiomeLayout(
  biomeId: string,
  eco: { trees: number; water: number; animals: number },
  activeDecorations: string[]
): BiomeWorldLayout {
  const layout: BiomeWorldLayout = {};

  if (eco.trees > 0) layout['base_tree_1'] = getBaseElementDefaultPosition('tree_1', biomeId);
  if (eco.trees > 1) layout['base_tree_2'] = getBaseElementDefaultPosition('tree_2', biomeId);
  if (eco.trees > 2) layout['base_tree_3'] = getBaseElementDefaultPosition('tree_3', biomeId);
  if (eco.water > 0) layout['base_water'] = getBaseElementDefaultPosition('water', biomeId);
  if (eco.animals > 0) layout['base_animal'] = getBaseElementDefaultPosition('animal', biomeId);

  // Equipped store items
  const occupiedSlots = new Set([13, 14, 18, 11, 8]);
  const freeSlots = TERRAIN_SLOTS.filter(s => !occupiedSlots.has(s.id));

  activeDecorations.forEach((itemId, idx) => {
    const slot = freeSlots[idx % freeSlots.length];
    const elementKey = `dec_${itemId}_${idx}`;
    if (slot) {
      const parsedX = parseFloat(slot.left.replace('%', '')) || 50;
      const parsedY = parseFloat(slot.bottom.replace('%', '')) || 15;
      layout[elementKey] = { x: parsedX, y: parsedY };
    } else {
      layout[elementKey] = { x: 15 + (idx * 15) % 70, y: 12 + (idx * 6) % 20 };
    }
  });

  return layout;
}

/**
 * Saves world layout to Firestore (with API backup)
 */
export async function saveStudentWorldLayout(
  userId: string,
  biomeId: string,
  layout: BiomeWorldLayout
): Promise<{ success: boolean }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`worldLayouts.${biomeId}`]: layout,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (firestoreErr: any) {
    console.warn('Direct firestore layout save warning, trying API fallback:', firestoreErr);
    // API fallback
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      const res = await apiFetch('/api/user/world-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ biomeId, layout })
      });
      if (!res.ok) {
        throw await parseApiError(res, 'Error guardando la distribución en el servidor');
      }
      return { success: true };
    }
    throw firestoreErr;
  }
}
