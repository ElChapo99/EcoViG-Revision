import { auth } from './firebase';
import { apiFetch, safeReadJson } from './apiClient';
import { 
  SURVEY_QUESTIONS, 
  SURVEY_OPTIONS, 
  calculateScore, 
  getRecommendedActivitiesForSurvey,
  SurveyOption,
  SurveyCategory 
} from '../data/surveyData';
import { calculateLevel } from './worldProgress';
import { SurveyAnswer, SurveyResults, DiagnosticSurveyRecord, User } from '../types';

/**
 * 🔒 RECOMPENSAS DE REFERENCIA PARA LA INTERFAZ
 * Nota de seguridad: Estas constantes en el cliente solo se emplean para la respuesta visual (optimistic UI).
 * La acreditación y autoridad definitiva reside exclusivamente en el backend (/api/survey/initial)
 * y la base de datos de Firestore administrada.
 */
export const INITIAL_SURVEY_REWARD_COINS = 500;
export const INITIAL_SURVEY_REWARD_XP = 150;

export interface SurveyCalculationOutput {
  results: SurveyResults;
  diagnosticRecord: DiagnosticSurveyRecord;
}

export interface SurveySubmitResult {
  success: boolean;
  results: SurveyResults;
  rewardGranted: boolean;
  coinsAdded: number;
  xpAdded: number;
  isIdempotentReplay: boolean;
  message: string;
}

/**
 * Calcula de manera determinista las puntuaciones de la encuesta para el optimistic UI.
 */
export function computeAuthoritativeSurveyResults(
  rawAnswers: Record<string, SurveyOption>
): SurveyCalculationOutput {
  const answersRecord: Record<string, SurveyAnswer> = {};
  const categoryScores: Record<SurveyCategory, number> = {
    'Conducta Pro-Ambiental': 0,
    'Austeridad': 0,
    'Altruismo': 0,
    'Equidad': 0,
  };

  let totalScore = 0;

  for (const q of SURVEY_QUESTIONS) {
    const rawVal = rawAnswers[q.id];
    const selected: SurveyOption = (SURVEY_OPTIONS as readonly string[]).includes(rawVal) 
      ? (rawVal as SurveyOption) 
      : 'Nunca';
    const score = calculateScore(selected, q.reverseScoring);

    answersRecord[q.id] = {
      questionId: q.id,
      category: q.category,
      questionText: q.text,
      selectedOption: selected,
      score,
      reverseScoring: q.reverseScoring,
    };

    categoryScores[q.category] += score;
    totalScore += score;
  }

  const recommendedActivityIds = getRecommendedActivitiesForSurvey(categoryScores, answersRecord);
  const now = Date.now();

  const results: SurveyResults = {
    completedAt: now,
    totalScore,
    categoryScores,
    answers: answersRecord,
    recommendedActivityIds,
  };

  const diagnosticRecord: DiagnosticSurveyRecord = {
    completed: true,
    completedAt: now,
    rewardGranted: true,
    totalScore,
    categoryScores,
    answers: answersRecord,
    recommendedActivityIds,
  };

  return { results, diagnosticRecord };
}

/**
 * 🔒 Validador estricto para encuestas legacy (retrocompatibilidad exclusiva para cuentas históricas)
 */
export function isLegacyInitialSurveyCompleted(user: User | null | undefined): boolean {
  if (!user || !user.surveyResults) return false;
  const legacy = user.surveyResults;
  return Boolean(
    legacy &&
    (typeof legacy.completedAt === 'number' || (legacy as any).completed === true) &&
    typeof legacy.totalScore === 'number' &&
    legacy.totalScore > 0 &&
    legacy.categoryScores &&
    typeof legacy.categoryScores === 'object' &&
    Object.keys(legacy.categoryScores).length >= 4
  );
}

/**
 * 🔒 CANONICAL AUTHORITATIVE INITIAL SURVEY VALIDATOR
 * Strict Single Source of Truth:
 * 1. If user explicitly has initialSurveyCompleted === true, returns true.
 * 2. If user explicitly has initialSurveyCompleted === false, returns false.
 * 3. If modern initialSurvey.completed === true, returns true.
 * 4. Fallback exclusively for verified completed historical legacy documents.
 */
export function hasUserCompletedInitialSurvey(user: User | null | undefined): boolean {
  if (!user) return false;

  // 1. Highest Authority: Explicit modern boolean flag
  if (user.initialSurveyCompleted === true) {
    return true;
  }

  // 2. If modern flag is explicitly false, it is strictly NOT completed (even if a partial object exists)
  if (user.initialSurveyCompleted === false) {
    return false;
  }

  // 3. Modern initialSurvey object completed property
  if (user.initialSurvey && user.initialSurvey.completed === true) {
    return true;
  }

  // 4. Strict legacy fallback ONLY for verified historical completed surveys
  return isLegacyInitialSurveyCompleted(user);
}

export function getInitialSurveyData(user: User | null | undefined): (SurveyResults | DiagnosticSurveyRecord) | undefined {
  if (!user) return undefined;
  if (hasUserCompletedInitialSurvey(user)) {
    return user.initialSurvey || user.surveyResults;
  }
  return undefined;
}

/**
 * Genera el objeto de actualización optimista local para que la interfaz responda con actualización visual inmediata.
 * Guarda EXCLUSIVAMENTE el esquema canónico moderno (sin escribir surveyResults).
 */
export function buildOptimisticSurveyUserUpdate(
  currentUser: User | null,
  results: SurveyResults
): Partial<User> {
  const isAlreadyRewarded = Boolean(
    currentUser?.surveyRewardGranted || 
    currentUser?.initialSurvey?.rewardGranted
  );

  const currentCoins = currentUser?.coins || 0;
  const currentXp = currentUser?.xp || 0;
  const currentLevel = currentUser?.level || 1;

  const newCoins = isAlreadyRewarded ? currentCoins : currentCoins + INITIAL_SURVEY_REWARD_COINS;
  const newXp = isAlreadyRewarded ? currentXp : currentXp + INITIAL_SURVEY_REWARD_XP;
  const newLevel = calculateLevel(newXp);

  return {
    initialSurvey: {
      ...results,
      completed: true,
      rewardGranted: true,
    },
    initialSurveyCompleted: true,
    surveyRewardGranted: true,
    coins: newCoins,
    xp: newXp,
    level: newLevel,
    ecosystem: currentUser?.ecosystem || { trees: 1, water: 0, animals: 0 },
    activeMissions: results.recommendedActivityIds,
    updatedAt: Date.now(),
  };
}

/**
 * Envía de forma segura y autenticada ÚNICAMENTE las respuestas al backend autoritativo.
 * 
 * Garantías de Seguridad:
 * 1. El cliente NO envía ni decide monedas, XP, puntajes ni banderas de recompensa.
 * 2. Autenticación mediante Firebase ID Token (Bearer token).
 * 3. El backend verifica el token, extrae el UID, valida respuestas, calcula puntajes
 *    y ejecuta la transacción atómica e idempotente.
 */
export async function submitInitialSurveyAtomic(
  userId: string,
  rawAnswers: Record<string, SurveyOption>,
  surveyVersionId?: string
): Promise<SurveySubmitResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Debes iniciar sesión para registrar tu diagnóstico');
  }

  // Obtener Firebase ID Token fresco
  const idToken = await currentUser.getIdToken(true);

  // Enviar ÚNICAMENTE las respuestas y confirmación de versión al backend autoritativo
  const response = await apiFetch('/api/survey/initial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      answers: rawAnswers,
      ...(surveyVersionId ? { surveyVersionId } : {}),
    }),
  });

  const data = await safeReadJson<any>(
    response, 
    'No pudimos registrar la encuesta porque algunas respuestas no son válidas. Revisa tus respuestas e inténtalo nuevamente.'
  );
  return {
    success: true,
    results: data.results,
    rewardGranted: data.rewardGranted,
    coinsAdded: data.coinsAdded || 0,
    xpAdded: data.xpAdded || 0,
    isIdempotentReplay: Boolean(data.isIdempotentReplay),
    message: data.message || 'Diagnóstico procesado exitosamente',
  };
}

/**
 * 🔒 FINAL SURVEY ATOMIC SUBMISSION (For comparative assessment)
 * Submits answers to /api/survey/final to record post-intervention score.
 */
export async function submitFinalSurveyAtomic(
  rawAnswers: Record<string, SurveyOption>,
  surveyVersionId?: string
): Promise<SurveySubmitResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Debes iniciar sesión para registrar tu evaluación final');
  }

  const idToken = await currentUser.getIdToken(true);

  const response = await apiFetch('/api/survey/final', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      answers: rawAnswers,
      ...(surveyVersionId ? { surveyVersionId } : {}),
    }),
  });

  const data = await safeReadJson<any>(
    response,
    'No pudimos registrar la encuesta final. Revisa tus respuestas e inténtalo nuevamente.'
  );
  return {
    success: true,
    results: data.results,
    rewardGranted: false,
    coinsAdded: 0,
    xpAdded: 0,
    isIdempotentReplay: Boolean(data.isIdempotentReplay),
    message: data.message || 'Encuesta final procesada exitosamente',
  };
}

/**
 * Genera el objeto de actualización optimista para la encuesta final.
 */
export function buildOptimisticFinalSurveyUserUpdate(
  currentUser: User | null,
  results: SurveyResults
): Partial<User> {
  return {
    finalSurvey: {
      ...results,
      completed: true,
      rewardGranted: false,
    },
    finalSurveyCompleted: true,
    updatedAt: Date.now(),
  };
}

/**
 * Determina el estado de desbloqueo de la Encuesta Final con base en las reglas pedagógicas del programa.
 */
export function getFinalSurveyLockStatus(user: User | null): {
  hasInitialSurvey: boolean;
  mandatoryCompletedCount: number;
  totalMandatoryCount: number;
  missingCount: number;
  isUnlocked: boolean;
  isCompleted: boolean;
} {
  if (!user) {
    return {
      hasInitialSurvey: false,
      mandatoryCompletedCount: 0,
      totalMandatoryCount: 12,
      missingCount: 12,
      isUnlocked: false,
      isCompleted: false,
    };
  }

  const hasInitialSurvey = hasUserCompletedInitialSurvey(user);

  const completedActivities = user.completedActivities || {};
  const mandatoryCompletedCount = Object.keys(completedActivities).filter(id => id.startsWith('act_')).length;
  const totalMandatoryCount = 12;
  const missingCount = Math.max(0, totalMandatoryCount - mandatoryCompletedCount);
  const isUnlocked = hasInitialSurvey && missingCount === 0;
  const isCompleted = Boolean(user.finalSurveyCompleted || user.finalSurvey?.completed);

  return {
    hasInitialSurvey,
    mandatoryCompletedCount,
    totalMandatoryCount,
    missingCount,
    isUnlocked,
    isCompleted,
  };
}

/**
 * 🔒 ACTIVITY-SPECIFIC SURVEY SUBMISSION
 * Submits activity survey answers to /api/activities/:activityId/survey.
 */
export async function submitActivitySurveyAtomic(
  activityId: string,
  rawAnswers: Record<string, SurveyOption>
): Promise<{ success: boolean; results?: any; message: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Debes iniciar sesión para registrar las respuestas');
  }

  const idToken = await currentUser.getIdToken(true);

  const response = await apiFetch(`/api/activities/${encodeURIComponent(activityId)}/survey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      rawAnswers,
    }),
  });

  const data = await safeReadJson<any>(response, 'Error al procesar la encuesta de la actividad');
  return {
    success: true,
    results: data.results,
    message: data.message || 'Encuesta de actividad procesada',
  };
}

