import { SurveyCategory } from './surveyData';
import { hasUserCompletedInitialSurvey } from '../lib/surveyService';

export type AchievementCategory = 'all' | 'General' | SurveyCategory | 'Minijuegos';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  requirement: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  coinReward: number;
  badgeName?: string;
  // Dynamic progress evaluation function
  checkUnlocked: (user: any) => boolean;
  getProgress: (user: any) => { current: number; total: number; progressText: string };
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // --- GENERAL & DIAGNÓSTICO ---
  {
    id: 'survey_completed',
    title: 'Pionero del Diagnóstico',
    desc: 'Completaste la encuesta diagnóstica inicial de 21 preguntas socioambientales.',
    requirement: 'Finaliza tu encuesta de diagnóstico.',
    category: 'General',
    icon: '🌱',
    xpReward: 150,
    coinReward: 50,
    badgeName: 'Diagnóstico Completado',
    checkUnlocked: (user) => hasUserCompletedInitialSurvey(user),
    getProgress: (user) => {
      const isDone = hasUserCompletedInitialSurvey(user);
      return {
        current: isDone ? 1 : 0,
        total: 1,
        progressText: isDone ? '1/1 Encuesta' : '0/1 Encuesta'
      };
    }
  },
  {
    id: 'first_mission',
    title: 'Primer Paso Verde',
    desc: 'Completaste tu primera misión práctica o interactiva en la plataforma.',
    requirement: 'Finaliza al menos 1 misión principal o complementaria.',
    category: 'General',
    icon: '🎯',
    xpReward: 80,
    coinReward: 30,
    badgeName: 'Primer Paso Verde',
    checkUnlocked: (user) => Object.keys(user?.completedActivities || {}).length >= 1,
    getProgress: (user) => {
      const count = Object.keys(user?.completedActivities || {}).length;
      return {
        current: Math.min(count, 1),
        total: 1,
        progressText: `${Math.min(count, 1)}/1 Misión`
      };
    }
  },
  {
    id: 'streak_3',
    title: 'Hábito en Marcha',
    desc: 'Mantuviste una racha de constancia activa de al menos 3 días.',
    requirement: 'Alcanza una racha de 3 días consecutivos.',
    category: 'General',
    icon: '🔥',
    xpReward: 100,
    coinReward: 40,
    badgeName: 'Hábito en Marcha',
    checkUnlocked: (user) => (user?.streak || 0) >= 3,
    getProgress: (user) => ({
      current: Math.min(user?.streak || 1, 3),
      total: 3,
      progressText: `${Math.min(user?.streak || 1, 3)}/3 Días`
    })
  },
  {
    id: 'four_dimensions',
    title: 'Maestro Holístico',
    desc: 'Completaste al menos una actividad en cada una de las 4 dimensiones socioambientales.',
    requirement: 'Completa al menos 1 actividad de Conducta Pro-Ambiental, 1 de Austeridad, 1 de Altruismo y 1 de Equidad.',
    category: 'General',
    icon: '🌐',
    xpReward: 300,
    coinReward: 150,
    badgeName: 'Maestro Holístico',
    checkUnlocked: (user) => {
      const completed = Object.keys(user?.completedActivities || {});
      const hasEnv = completed.some(id => id.startsWith('act_env'));
      const hasAus = completed.some(id => id.startsWith('act_aus'));
      const hasAlt = completed.some(id => id.startsWith('act_alt'));
      const hasEqu = completed.some(id => id.startsWith('act_equ'));
      return hasEnv && hasAus && hasAlt && hasEqu;
    },
    getProgress: (user) => {
      const completed = Object.keys(user?.completedActivities || {});
      let count = 0;
      if (completed.some(id => id.startsWith('act_env'))) count++;
      if (completed.some(id => id.startsWith('act_aus'))) count++;
      if (completed.some(id => id.startsWith('act_alt'))) count++;
      if (completed.some(id => id.startsWith('act_equ'))) count++;
      return {
        current: count,
        total: 4,
        progressText: `${count}/4 Dimensiones`
      };
    }
  },
  {
    id: 'daily_evidence_master',
    title: 'Cronista en Tiempo Real',
    desc: 'Completaste una misión multidiaria registrando todas tus fotos en tiempo real día por día.',
    requirement: 'Finaliza una misión de 2 o 4 días con evidencias fotográficas diarias verificadas.',
    category: 'General',
    icon: '📸',
    xpReward: 200,
    coinReward: 100,
    badgeName: 'Cronista en Tiempo Real',
    checkUnlocked: (user) => {
      const completedMap = user?.completedActivities || {};
      return Object.entries(completedMap).some(([id, record]: [string, any]) => {
        return (
          id.startsWith('act_env_') ||
          id.startsWith('act_aus_1') ||
          id.startsWith('act_aus_3') ||
          id.startsWith('act_alt_') ||
          id.startsWith('act_equ_1')
        );
      });
    },
    getProgress: (user) => {
      const completedMap = user?.completedActivities || {};
      const count = Object.keys(completedMap).filter(id => 
        id.startsWith('act_env_') || id.startsWith('act_aus_1') || id.startsWith('act_aus_3') || id.startsWith('act_alt_') || id.startsWith('act_equ_1')
      ).length;
      return {
        current: Math.min(count, 1),
        total: 1,
        progressText: count >= 1 ? '1/1 Misión multidiaria' : '0/1 Misión multidiaria'
      };
    }
  },

  // --- ETIQUETA 1: CONDUCTA PRO-AMBIENTAL ---
  {
    id: 'act_env_1_badge',
    title: 'Guardián del Grifo',
    desc: 'Completaste el reto de 2 días "Cierra la llave" con registro fotográfico en tiempo real.',
    requirement: 'Completa la actividad "Reto: Cierra la llave" (2 días).',
    category: 'Conducta Pro-Ambiental',
    icon: '💧',
    xpReward: 150,
    coinReward: 50,
    badgeName: 'Ahorrador de agua',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_env_1']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_env_1'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_env_1'] ? 'Completado' : '0/2 Días'
    })
  },
  {
    id: 'act_env_2_badge',
    title: 'Cero Desperdicio',
    desc: 'Aprovechaste al máximo tus alimentos y materiales durante 4 días continuos.',
    requirement: 'Completa la actividad "Misión: Cero desperdicio" (4 días).',
    category: 'Conducta Pro-Ambiental',
    icon: '♻️',
    xpReward: 160,
    coinReward: 50,
    badgeName: 'Maestro de reutilización',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_env_2']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_env_2'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_env_2'] ? 'Completado' : '0/4 Días'
    })
  },
  {
    id: 'act_env_3_badge',
    title: 'Voz Ecológica',
    desc: 'Contagiaste hábitos verdes y comunicaste la importancia de cuidar la naturaleza.',
    requirement: 'Completa el reto "Influencer verde" (2 días).',
    category: 'Conducta Pro-Ambiental',
    icon: '📢',
    xpReward: 180,
    coinReward: 60,
    badgeName: 'Voz Ecológica',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_env_3']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_env_3'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_env_3'] ? 'Completado' : '0/2 Días'
    })
  },
  {
    id: 'env_master',
    title: 'Paladín Pro-Ambiental',
    desc: 'Dominaste las 3 misiones principales de Conducta Pro-Ambiental.',
    requirement: 'Completa las 3 actividades de la dimensión Conducta Pro-Ambiental.',
    category: 'Conducta Pro-Ambiental',
    icon: '🌳',
    xpReward: 300,
    coinReward: 120,
    badgeName: 'Paladín Pro-Ambiental',
    checkUnlocked: (user) => {
      const c = user?.completedActivities || {};
      return Boolean(c['act_env_1'] && c['act_env_2'] && c['act_env_3']);
    },
    getProgress: (user) => {
      const c = user?.completedActivities || {};
      let count = 0;
      if (c['act_env_1']) count++;
      if (c['act_env_2']) count++;
      if (c['act_env_3']) count++;
      return {
        current: count,
        total: 3,
        progressText: `${count}/3 Misiones`
      };
    }
  },

  // --- ETIQUETA 2: AUSTERIDAD ---
  {
    id: 'act_aus_1_badge',
    title: 'Estilo Sustentable',
    desc: 'Reutilizaste y combinaste tu guardarropa durante 4 días sin compras innecesarias.',
    requirement: 'Completa la actividad "Reto: Dale otra vida" (4 días).',
    category: 'Austeridad',
    icon: '👕',
    xpReward: 150,
    coinReward: 50,
    badgeName: 'Estilo Sustentable',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_aus_1']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_aus_1'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_aus_1'] ? 'Completado' : '0/4 Días'
    })
  },
  {
    id: 'act_aus_2_badge',
    title: 'Presupuesto Sabio',
    desc: 'Demostraste juicio crítico diferenciando necesidades de deseos en el simulador.',
    requirement: 'Supera el simulador interactivo "¿Lo quiero o lo necesito?".',
    category: 'Austeridad',
    icon: '💰',
    xpReward: 160,
    coinReward: 50,
    badgeName: 'Presupuesto Sabio',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_aus_2']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_aus_2'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_aus_2'] ? 'Completado' : 'Pendiente'
    })
  },
  {
    id: 'act_aus_3_badge',
    title: 'Movilidad y Consumo Local',
    desc: 'Practicaste la movilidad limpia y el consumo de alimentos preparados en casa.',
    requirement: 'Completa el reto "Muévete y consume local" (2 días).',
    category: 'Austeridad',
    icon: '🚲',
    xpReward: 170,
    coinReward: 50,
    badgeName: 'Movilidad y Consumo Local',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_aus_3']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_aus_3'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_aus_3'] ? 'Completado' : '0/2 Días'
    })
  },
  {
    id: 'aus_master',
    title: 'Maestro de la Austeridad',
    desc: 'Completaste todas las misiones de consumo reflexivo y ahorro de recursos.',
    requirement: 'Completa las 3 actividades de la dimensión Austeridad.',
    category: 'Austeridad',
    icon: '💡',
    xpReward: 300,
    coinReward: 120,
    badgeName: 'Maestro de la Austeridad',
    checkUnlocked: (user) => {
      const c = user?.completedActivities || {};
      return Boolean(c['act_aus_1'] && c['act_aus_2'] && c['act_aus_3']);
    },
    getProgress: (user) => {
      const c = user?.completedActivities || {};
      let count = 0;
      if (c['act_aus_1']) count++;
      if (c['act_aus_2']) count++;
      if (c['act_aus_3']) count++;
      return {
        current: count,
        total: 3,
        progressText: `${count}/3 Misiones`
      };
    }
  },

  // --- ETIQUETA 3: ALTRUISMO ---
  {
    id: 'act_alt_1_badge',
    title: 'Manos que Comparten',
    desc: 'Clasificaste y preparaste artículos en buen estado para donación comunitaria.',
    requirement: 'Completa la actividad "Lo que ya no uso puede ayudar" (4 días).',
    category: 'Altruismo',
    icon: '🎁',
    xpReward: 180,
    coinReward: 60,
    badgeName: 'Manos que Comparten',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_alt_1']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_alt_1'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_alt_1'] ? 'Completado' : '0/4 Días'
    })
  },
  {
    id: 'act_alt_2_badge',
    title: 'Solidaridad Cotidiana',
    desc: 'Realizaste acciones desinteresadas de ayuda cívica en tu entorno.',
    requirement: 'Completa la misión "Una acción para ayudar" (4 días).',
    category: 'Altruismo',
    icon: '🌟',
    xpReward: 160,
    coinReward: 50,
    badgeName: 'Solidaridad Cotidiana',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_alt_2']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_alt_2'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_alt_2'] ? 'Completado' : '0/4 Días'
    })
  },
  {
    id: 'act_alt_3_badge',
    title: 'Apoyo y Tutoría',
    desc: 'Compartiste tu tiempo, conocimiento o recursos con compañeros o comunidad.',
    requirement: 'Completa el reto "Ayudar también es compartir" (4 días).',
    category: 'Altruismo',
    icon: '🤝',
    xpReward: 170,
    coinReward: 50,
    badgeName: 'Agente solidario',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_alt_3']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_alt_3'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_alt_3'] ? 'Completado' : '0/4 Días'
    })
  },
  {
    id: 'alt_master',
    title: 'Líder Altruista',
    desc: 'Cumpliste todas las misiones de solidaridad, donación y ayuda comunitaria.',
    requirement: 'Completa las 3 actividades de la dimensión Altruismo.',
    category: 'Altruismo',
    icon: '❤️',
    xpReward: 300,
    coinReward: 120,
    badgeName: 'Líder Altruista',
    checkUnlocked: (user) => {
      const c = user?.completedActivities || {};
      return Boolean(c['act_alt_1'] && c['act_alt_2'] && c['act_alt_3']);
    },
    getProgress: (user) => {
      const c = user?.completedActivities || {};
      let count = 0;
      if (c['act_alt_1']) count++;
      if (c['act_alt_2']) count++;
      if (c['act_alt_3']) count++;
      return {
        current: count,
        total: 3,
        progressText: `${count}/3 Misiones`
      };
    }
  },

  // --- ETIQUETA 4: EQUIDAD ---
  {
    id: 'act_equ_1_badge',
    title: 'Hogar Equitativo',
    desc: 'Participaste en la corresponsabilidad de labores domésticas sin distinción de género.',
    requirement: 'Completa la actividad "En casa, las tareas son de todos" (4 días).',
    category: 'Equidad',
    icon: '🏠',
    xpReward: 160,
    coinReward: 50,
    badgeName: 'Hogar Equitativo',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_equ_1']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_equ_1'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_equ_1'] ? 'Completado' : '0/4 Días'
    })
  },
  {
    id: 'act_equ_2_badge',
    title: 'Decisión Sin Sesgos',
    desc: 'Asignaste oportunidades basándote exclusivamente en capacidades y mérito.',
    requirement: 'Completa el simulador interactivo "Mismas oportunidades".',
    category: 'Equidad',
    icon: '⚖️',
    xpReward: 170,
    coinReward: 50,
    badgeName: 'Decisión Sin Sesgos',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_equ_2']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_equ_2'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_equ_2'] ? 'Completado' : 'Pendiente'
    })
  },
  {
    id: 'act_equ_3_badge',
    title: 'Voz Equitativa',
    desc: 'Analizaste cómo equilibrar las opiniones de estudiantes y docentes democráticamente.',
    requirement: 'Supera el juego de deliberación "¿Quién tiene voz?".',
    category: 'Equidad',
    icon: '🗣️',
    xpReward: 200,
    coinReward: 60,
    badgeName: 'Voz equitativa',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['act_equ_3']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['act_equ_3'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['act_equ_3'] ? 'Completado' : 'Pendiente'
    })
  },
  {
    id: 'equ_master',
    title: 'Defensor de la Equidad',
    desc: 'Culminaste todas las actividades orientadas a la justicia social e inclusión.',
    requirement: 'Completa las 3 actividades de la dimensión Equidad.',
    category: 'Equidad',
    icon: '🏛️',
    xpReward: 300,
    coinReward: 120,
    badgeName: 'Defensor de la Equidad',
    checkUnlocked: (user) => {
      const c = user?.completedActivities || {};
      return Boolean(c['act_equ_1'] && c['act_equ_2'] && c['act_equ_3']);
    },
    getProgress: (user) => {
      const c = user?.completedActivities || {};
      let count = 0;
      if (c['act_equ_1']) count++;
      if (c['act_equ_2']) count++;
      if (c['act_equ_3']) count++;
      return {
        current: count,
        total: 3,
        progressText: `${count}/3 Misiones`
      };
    }
  },

  // --- MINIJUEGOS & RETOS COMPLEMENTARIOS ---
  {
    id: 'comp_5_badge',
    title: 'Ecoescape Maestro',
    desc: 'Superaste los 5 dilemas contrarreloj en el desafío de emergencia ambiental.',
    requirement: 'Completa la actividad complementaria "Ecoescape: salva el planeta".',
    category: 'Minijuegos',
    icon: '⏳',
    xpReward: 120,
    coinReward: 40,
    badgeName: 'Ecoescape Maestro',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['comp_5']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['comp_5'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['comp_5'] ? 'Completado' : 'Pendiente'
    })
  },
  {
    id: 'comp_7_badge',
    title: 'Decisiones que Ayudan',
    desc: 'Demostraste alta empatía social en los escenarios interactivos de dilemas éticos.',
    requirement: 'Completa la actividad "¿Qué harías tú?".',
    category: 'Minijuegos',
    icon: '💚',
    xpReward: 100,
    coinReward: 40,
    badgeName: 'Decisiones que ayudan',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['comp_7']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['comp_7'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['comp_7'] ? 'Completado' : 'Pendiente'
    })
  },
  {
    id: 'comp_10_badge',
    title: 'Superpoder Planetario',
    desc: 'Mantuviste tu compromiso de superpoder sostenible durante 3 días.',
    requirement: 'Completa la actividad "Mi superpoder sostenible" (3 días).',
    category: 'Minijuegos',
    icon: '⚡',
    xpReward: 140,
    coinReward: 50,
    badgeName: 'Superpoder Planetario',
    checkUnlocked: (user) => Boolean(user?.completedActivities?.['comp_10']),
    getProgress: (user) => ({
      current: user?.completedActivities?.['comp_10'] ? 1 : 0,
      total: 1,
      progressText: user?.completedActivities?.['comp_10'] ? 'Completado' : '0/3 Días'
    })
  },

  // --- DESBLOQUEO DE MUNDOS Y BIOMAS ---
  {
    id: 'world_desert_unlocked',
    title: 'Guardián del Desierto',
    desc: 'Desbloqueaste el bioma Desértico completando al menos 4 misiones obligatorias y acumulando 500 XP.',
    requirement: 'Completa 4 misiones obligatorias y alcanza 500 XP.',
    category: 'General',
    icon: '🌵',
    xpReward: 200,
    coinReward: 80,
    badgeName: 'Explorador del Desierto',
    checkUnlocked: (user) => {
      const completed = user?.completedActivities || {};
      const mainCount = Object.keys(completed).filter(id => id.startsWith('act_')).length;
      return mainCount >= 4 && (user?.xp || 0) >= 500;
    },
    getProgress: (user) => {
      const completed = user?.completedActivities || {};
      const mainCount = Object.keys(completed).filter(id => id.startsWith('act_')).length;
      return {
        current: Math.min(mainCount, 4),
        total: 4,
        progressText: `${Math.min(mainCount, 4)}/4 Misiones Obligatorias`
      };
    }
  },
  {
    id: 'world_mountain_unlocked',
    title: 'Centinela de Cumbres',
    desc: 'Desbloqueaste el bioma Montañas completando al menos 8 misiones obligatorias y acumulando 1,100 XP.',
    requirement: 'Completa 8 misiones obligatorias y alcanza 1,100 XP.',
    category: 'General',
    icon: '⛰️',
    xpReward: 300,
    coinReward: 120,
    badgeName: 'Centinela de Cumbres',
    checkUnlocked: (user) => {
      const completed = user?.completedActivities || {};
      const mainCount = Object.keys(completed).filter(id => id.startsWith('act_')).length;
      return mainCount >= 8 && (user?.xp || 0) >= 1100;
    },
    getProgress: (user) => {
      const completed = user?.completedActivities || {};
      const mainCount = Object.keys(completed).filter(id => id.startsWith('act_')).length;
      return {
        current: Math.min(mainCount, 8),
        total: 8,
        progressText: `${Math.min(mainCount, 8)}/8 Misiones Obligatorias`
      };
    }
  },
  {
    id: 'world_city_unlocked',
    title: 'Restaurador de la Ciudad Verde',
    desc: '¡Completaste las 12 misiones obligatorias de las 4 dimensiones socioambientales y restauraste la Ciudad Verde!',
    requirement: 'Completa las 12 misiones obligatorias y acumula 1,800 XP.',
    category: 'General',
    icon: '🏙️',
    xpReward: 500,
    coinReward: 250,
    badgeName: 'Restaurador Ciudad Verde',
    checkUnlocked: (user) => {
      const completed = user?.completedActivities || {};
      const mainCount = Object.keys(completed).filter(id => id.startsWith('act_')).length;
      return mainCount >= 12 && (user?.xp || 0) >= 1800;
    },
    getProgress: (user) => {
      const completed = user?.completedActivities || {};
      const mainCount = Object.keys(completed).filter(id => id.startsWith('act_')).length;
      return {
        current: Math.min(mainCount, 12),
        total: 12,
        progressText: `${Math.min(mainCount, 12)}/12 Misiones Obligatorias (100%)`
      };
    }
  }
];
