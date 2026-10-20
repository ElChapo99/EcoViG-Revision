import { db } from './firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export const COMPLETED_STUDENT_PROFILE_DATA = {
  surveyResults: {
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    totalScore: 7200,
    categoryScores: {
      'Conducta Pro-Ambiental': 2200,
      'Austeridad': 1800,
      'Altruismo': 2200,
      'Equidad': 1900
    },
    answers: {},
    recommendedActivityIds: ['act_env_1', 'act_aus_1', 'act_alt_1', 'act_equ_1']
  },
  completedActivities: {
    'act_env_1': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
      pointsEarned: 50,
      badgeEarned: 'Ahorrador de agua',
      evidenceType: 'photos',
      feedback: '¡Excelente ahorro de agua con evidencias diarias!'
    },
    'act_env_2': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 22,
      pointsEarned: 50,
      badgeEarned: 'Maestro de reutilización',
      evidenceType: 'photos',
      feedback: '¡Cero desperdicio aplicado consistentemente!'
    },
    'act_env_3': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
      pointsEarned: 60,
      badgeEarned: 'Voz Ecológica',
      evidenceType: 'photos',
      feedback: '¡Gran difusión e impacto de hábitos verdes!'
    },
    'act_aus_1': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
      pointsEarned: 50,
      badgeEarned: 'Estilo Sustentable',
      evidenceType: 'photos',
      feedback: '¡Reutilización creativa del guardarropa!'
    },
    'act_aus_2': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
      pointsEarned: 50,
      badgeEarned: 'Presupuesto Sabio',
      evidenceType: 'decision_game',
      feedback: '¡Toma de decisiones presupuestales impecable!'
    },
    'act_aus_3': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 11,
      pointsEarned: 50,
      badgeEarned: 'Movilidad Activa',
      evidenceType: 'photos',
      feedback: '¡Consumo austero y movilidad activa constante!'
    },
    'act_alt_1': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
      pointsEarned: 60,
      badgeEarned: 'Corazón Solidario',
      evidenceType: 'photos',
      feedback: '¡Donación responsable y solidaria completada!'
    },
    'act_alt_2': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      pointsEarned: 50,
      badgeEarned: 'Héroe Cotidiano',
      evidenceType: 'photos',
      feedback: '¡Acciones solidarias cívicas de alto impacto!'
    },
    'act_alt_3': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      pointsEarned: 50,
      badgeEarned: 'Tutor Solidario',
      evidenceType: 'photos',
      feedback: '¡Colaboración y ayuda comunitaria ejemplar!'
    },
    'act_equ_1': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      pointsEarned: 50,
      badgeEarned: 'Equidad en el Hogar',
      evidenceType: 'photos',
      feedback: '¡Corresponsabilidad doméstica en el hogar!'
    },
    'act_equ_2': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      pointsEarned: 50,
      badgeEarned: 'Justicia Social',
      evidenceType: 'decision_game',
      feedback: '¡Decisiones fundamentadas en igualdad de oportunidades!'
    },
    'act_equ_3': {
      completedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
      pointsEarned: 60,
      badgeEarned: 'Voz equitativa',
      evidenceType: 'decision_game',
      feedback: '¡Diálogo participativo y equidad democrática!'
    }
  },
  xp: 2200,
  coins: 1200,
  surveyPoints: 500,
  mainMissionPoints: 650,
  complementaryPoints: 0,
  level: 7,
  streak: 14,
  activeMission: null,
  ecosystem: {
    trees: 3,
    water: 3,
    animals: 3
  },
  badges: [
    'Diagnóstico Completado',
    'Primer Paso Verde',
    'Hábito en Marcha',
    'Maestro Holístico',
    'Cronista en Tiempo Real',
    'Ahorrador de agua',
    'Maestro de reutilización',
    'Voz Ecológica',
    'Paladín Pro-Ambiental',
    'Estilo Sustentable',
    'Presupuesto Sabio',
    'Movilidad Activa',
    'Maestro de la Austeridad',
    'Corazón Solidario',
    'Héroe Cotidiano',
    'Tutor Solidario',
    'Campeón del Altruismo',
    'Equidad en el Hogar',
    'Justicia Social',
    'Voz equitativa',
    'Paladín de la Equidad',
    'Explorador del Desierto',
    'Centinela de Cumbres',
    'Restaurador Ciudad Verde'
  ],
  unlockedDecorations: [
    'forest_cat', 'forest_dog', 'forest_owl', 'forest_hiker',
    'desert_cat', 'desert_dog', 'desert_camel', 'desert_nomad',
    'mountain_goat', 'mountain_eagle', 'mountain_bear', 'mountain_climber',
    'city_cat', 'city_dog', 'city_pigeon', 'city_cyclist'
  ],
  activeDecorations: {
    'forest': ['forest_cat', 'forest_dog', 'forest_owl'],
    'desert': ['desert_cat', 'desert_camel'],
    'mountain': ['mountain_goat', 'mountain_eagle'],
    'city': ['city_cat', 'city_cyclist', 'city_pigeon']
  }
};

export async function bootstrapSpecialStudentProfile(uid: string, currentData: any) {
  try {
    const userRef = doc(db, 'users', uid);
    // Check if the user already has all 12 completed missions
    const completedCount = Object.keys(currentData?.completedActivities || {}).filter(k => k.startsWith('act_')).length;
    if (completedCount < 12 || (currentData.xp || 0) < 2200) {
      await updateDoc(userRef, {
        ...COMPLETED_STUDENT_PROFILE_DATA,
        updatedAt: Date.now()
      });
      return {
        ...currentData,
        ...COMPLETED_STUDENT_PROFILE_DATA
      };
    }
  } catch (error) {
    console.error('Error bootstrapping special student profile:', error);
  }
  return currentData;
}
