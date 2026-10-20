import { MAIN_ACTIVITIES } from '../data/surveyData';
import { User } from '../types';

export interface BiomeConfig {
  id: 'forest' | 'desert' | 'mountain' | 'city';
  name: string;
  icon: string;
  requiredMissions: number;
  requiredXp: number;
  requiredLevel: number;
  description: string;
  unlockRequirementText: string;
  sky: string;
  sun: string;
  ground: string;
  border: string;
  flora: string;
  fauna: string;
}

export const BIOMES: BiomeConfig[] = [
  {
    id: 'forest',
    name: 'Bosque',
    icon: '🌲',
    requiredMissions: 0,
    requiredXp: 0,
    requiredLevel: 1,
    description: 'Ecosistema inicial para todos los guardianes socioambientales.',
    unlockRequirementText: 'Desbloqueado desde el inicio',
    sky: 'from-sky-900 to-emerald-950',
    sun: 'bg-emerald-400/20 shadow-[0_0_60px_rgba(52,211,153,0.5)]',
    ground: 'from-emerald-950 to-green-950',
    border: 'border-emerald-500/30',
    flora: '🌳',
    fauna: '🦊'
  },
  {
    id: 'desert',
    name: 'Desértico',
    icon: '🌵',
    requiredMissions: 4,
    requiredXp: 500,
    requiredLevel: 3,
    description: 'Ecosistema árido que florece con hábitos sostenibles de ahorro.',
    unlockRequirementText: '4 misiones obligatorias y 500 XP',
    sky: 'from-orange-950 to-amber-900',
    sun: 'bg-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.6)]',
    ground: 'from-amber-950 to-orange-950',
    border: 'border-amber-500/30',
    flora: '🌵',
    fauna: '🦎'
  },
  {
    id: 'mountain',
    name: 'Montañas',
    icon: '⛰️',
    requiredMissions: 8,
    requiredXp: 1100,
    requiredLevel: 5,
    description: 'Cumbres majestuosas preservadas por tu altruismo y constancia.',
    unlockRequirementText: '8 misiones obligatorias y 1,100 XP',
    sky: 'from-slate-900 to-indigo-950',
    sun: 'bg-slate-300/20 shadow-[0_0_60px_rgba(203,213,225,0.4)]',
    ground: 'from-slate-900 to-slate-950',
    border: 'border-slate-500/30',
    flora: '🌲',
    fauna: '🦅'
  },
  {
    id: 'city',
    name: 'Ciudad Verde',
    icon: '🏙️',
    requiredMissions: 12,
    requiredXp: 1800,
    requiredLevel: 7,
    description: '¡La metrópoli ecológica utópica! Requiere completar TODAS las misiones obligatorias.',
    unlockRequirementText: 'Todas las 12 misiones obligatorias completadas y 1,800 XP',
    sky: 'from-teal-950 to-cyan-950',
    sun: 'bg-teal-400/20 shadow-[0_0_60px_rgba(45,212,191,0.5)]',
    ground: 'from-teal-900 to-teal-950',
    border: 'border-teal-500/30',
    flora: '🌿',
    fauna: '🕊️'
  }
];

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, title: 'Iniciado Verde' },
  { level: 2, minXp: 250, title: 'Explorador Ecológico' },
  { level: 3, minXp: 500, title: 'Guardián del Desierto' },
  { level: 4, minXp: 800, title: 'Defensor de Recursos' },
  { level: 5, minXp: 1100, title: 'Centinela de Cumbres' },
  { level: 6, minXp: 1450, title: 'Líder Socioambiental' },
  { level: 7, minXp: 1800, title: 'Maestro de la Ciudad Verde' },
  { level: 8, minXp: 2300, title: 'Héroe Planetario' },
];

export function calculateLevel(xp: number = 0): number {
  let level = 1;
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.minXp) {
      level = t.level;
    } else {
      break;
    }
  }
  return level;
}

export function getCompletedMandatoryMissionsCount(user: Partial<User> | null | undefined): number {
  if (!user || !user.completedActivities) return 0;
  const completedMap = user.completedActivities;
  return MAIN_ACTIVITIES.filter(act => Boolean(completedMap[act.id])).length;
}

export interface BiomeUnlockStatus {
  biome: BiomeConfig;
  isUnlocked: boolean;
  currentMissions: number;
  requiredMissions: number;
  missionsMet: boolean;
  currentXp: number;
  requiredXp: number;
  xpMet: boolean;
  currentLevel: number;
  requiredLevel: number;
  percentProgress: number;
}

export function getBiomeUnlockStatus(user: Partial<User> | null | undefined, biomeId: string): BiomeUnlockStatus {
  const biome = BIOMES.find(b => b.id === biomeId) || BIOMES[0];
  const currentMissions = getCompletedMandatoryMissionsCount(user);
  const currentXp = user?.xp || 0;
  const currentLevel = calculateLevel(currentXp);

  if (biome.id === 'forest') {
    return {
      biome,
      isUnlocked: true,
      currentMissions,
      requiredMissions: 0,
      missionsMet: true,
      currentXp,
      requiredXp: 0,
      xpMet: true,
      currentLevel,
      requiredLevel: 1,
      percentProgress: 100,
    };
  }

  const missionsMet = currentMissions >= biome.requiredMissions;
  const xpMet = currentXp >= biome.requiredXp;
  // Unlocked when mandatory missions requirement is fulfilled AND XP requirement is reached
  const isUnlocked = missionsMet && xpMet;

  // Calculate composite percentage
  const missionProgress = Math.min(100, (currentMissions / biome.requiredMissions) * 100);
  const xpProgress = Math.min(100, (currentXp / biome.requiredXp) * 100);
  const percentProgress = Math.round((missionProgress * 0.6) + (xpProgress * 0.4));

  return {
    biome,
    isUnlocked,
    currentMissions,
    requiredMissions: biome.requiredMissions,
    missionsMet,
    currentXp,
    requiredXp: biome.requiredXp,
    xpMet,
    currentLevel,
    requiredLevel: biome.requiredLevel,
    percentProgress: isUnlocked ? 100 : percentProgress,
  };
}
