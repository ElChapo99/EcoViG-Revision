import { auth, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { apiFetch, safeReadJson } from './apiClient';
import { DailyCheckInRecord } from '../types';

export interface MissionSubmitResult {
  success: boolean;
  rewardGranted: boolean;
  coinsAdded: number;
  xpAdded: number;
  level?: number;
  badgeEarned?: string;
  isIdempotentReplay?: boolean;
  completedRecord?: any;
  message: string;
}

/**
 * 🔒 AUTHORITATIVE ATOMIC MISSION COMPLETION
 * Communicates with backend /api/mission/complete using Firebase Bearer auth token.
 * Ensures strict server-side validation, server timestamping, and idempotent reward delivery.
 */
export async function submitMissionCompletionAtomic(
  activityId: string,
  evidenceData: any
): Promise<MissionSubmitResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Debes iniciar sesión para completar tu actividad');
  }

  // Get fresh Firebase ID Token
  const idToken = await currentUser.getIdToken(true);

  const response = await apiFetch('/api/mission/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      activityId,
      evidenceData,
    }),
  });

  const data = await safeReadJson<any>(response, 'Error en el servidor al completar la misión');
  return {
    success: true,
    rewardGranted: Boolean(data.rewardGranted),
    coinsAdded: typeof data.coinsAdded === 'number' ? data.coinsAdded : 0,
    xpAdded: typeof data.xpAdded === 'number' ? data.xpAdded : 0,
    level: data.level,
    badgeEarned: data.badgeEarned,
    isIdempotentReplay: Boolean(data.isIdempotentReplay),
    completedRecord: data.completedRecord,
    message: data.message || 'Misión completada exitosamente',
  };
}

/**
 * 🔒 SECURE AUTHORITATIVE DAILY EVIDENCE RECORDING
 * Submits daily evidence to backend /api/mission/daily-checkin with server timestamp & transaction.
 * Strictly respects backend eligibility validation (Rule 5 & Rule 10).
 */
export async function saveDailyEvidenceAtomic(
  day: number,
  photoUrl: string,
  note: string,
  currentUserId?: string,
  currentActiveMission?: any
): Promise<{ 
  success: boolean; 
  savedRecord?: DailyCheckInRecord; 
  completedDays?: number;
  currentDay?: number;
  durationDays?: number;
  isCompleted?: boolean;
  canSubmitToday?: boolean;
  message?: string;
}> {
  const currentUser = auth.currentUser;
  const uid = currentUserId || currentUser?.uid;

  if (!uid) {
    throw new Error('Usuario no autenticado');
  }

  const trimmedNote = (note || '').trim();
  if (trimmedNote.length < 10) {
    throw new Error('La nota de la actividad debe tener al menos 10 caracteres');
  }

  if (!currentUser) {
    throw new Error('Sesión de usuario requerida para enviar evidencia');
  }

  const idToken = await currentUser.getIdToken(true);
  const response = await apiFetch('/api/mission/daily-checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      activityId: currentActiveMission?.activityId,
      day,
      photoUrl,
      note: trimmedNote,
    }),
  });

  const data = await safeReadJson<any>(response, 'Error al registrar la evidencia diaria en el servidor');
  return {
    success: true,
    savedRecord: data.savedRecord,
    completedDays: data.completedDays,
    currentDay: data.currentDay,
    durationDays: data.durationDays,
    isCompleted: data.isCompleted,
    canSubmitToday: data.canSubmitToday,
    message: data.message
  };
}

/**
 * 🔒 FETCH ACTIVE MISSION STATUS AUTHORITATIVELY
 */
export async function fetchActiveMissionStatusAtomic(): Promise<any> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const idToken = await currentUser.getIdToken(false);
    const response = await apiFetch('/api/mission/active-status', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    return await safeReadJson<any>(response, 'Error al consultar estado de misión activa');
  } catch (err) {
    console.warn('Could not fetch active mission status from API:', err);
  }
  return null;
}
