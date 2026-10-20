import { DailyCheckInRecord } from '../types';

/**
 * Canonical Project Time Zone for EcoViG: Caborca, Sonora, México
 * America/Hermosillo does not observe DST (UTC-7 all year round).
 */
export const PROJECT_TIME_ZONE = 'America/Hermosillo';
export const APP_PROJECT_TIMEZONE = PROJECT_TIME_ZONE; // Backward compatibility alias
export const MIN_EVIDENCE_NOTE_LENGTH = 10;
export const MAX_EVIDENCE_NOTE_LENGTH = 500;

export interface NormalizedEvidenceRecord {
  activityId?: string;
  studentId?: string;
  evidenceDay: number; // Strictly sequential: 1, 2, 3...
  day: number; // Backward compatibility with legacy day property
  timestamp: number;
  submittedAt: number; // Authoritative server timestamp (ms)
  capturedAt?: number;
  photoUrl: string;
  note: string;
  status: 'completed' | 'accepted';
  verifiedByServer?: boolean;
}

export interface DayStepInfo {
  dayNumber: number;
  status: 'completed' | 'current_available' | 'current_locked_today' | 'locked_future';
  statusLabel: string; // e.g. "✓ Listo", "⚡ Cámara disponible", "⏳ Próxima evidencia disponible mañana", "🔒 Bloqueado"
  evidence?: NormalizedEvidenceRecord;
}

export interface MultiDayProgressState {
  activityId?: string;
  requiredDays: number;
  completedDays: number; // Count of valid sequential evidences
  currentDay: number; // Math.min(completedDays + 1, requiredDays)
  expectedEvidenceDay: number; // Next sequential step to complete (completedDays + 1)
  isCompleted: boolean; // completedDays >= requiredDays
  canSubmitToday: boolean; // True if eligible to capture camera evidence today
  statusBadge: 'completed' | 'available' | 'locked_today';
  statusMessage: string; // "Cámara disponible", "Próxima evidencia disponible mañana", "Completada"
  lastAcceptedEvidence: NormalizedEvidenceRecord | null;
  lastSubmissionDateKey: string | null; // YYYY-MM-DD
  currentDateKey: string; // YYYY-MM-DD
  nextEligibleDateFormatted: string | null;
  evidencesMap: Record<number, NormalizedEvidenceRecord>;
  stepperDays: DayStepInfo[];
}

/**
 * Computes calendar date string "YYYY-MM-DD" in the authoritative project timezone.
 * Uses PROJECT_TIME_ZONE ('America/Hermosillo' - Caborca, Sonora).
 * Supports adding days offset for simulated advancement in testing/demo.
 */
export function getCalendarDateKey(
  timestamp: number,
  timezone: string = PROJECT_TIME_ZONE,
  simulatedDaysOffset: number = 0
): string {
  const effectiveMs = timestamp + (simulatedDaysOffset * 24 * 60 * 60 * 1000);
  const date = new Date(effectiveMs);
  
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Formats a timestamp into date string using PROJECT_TIME_ZONE (America/Hermosillo).
 */
export function formatProjectDate(
  timestamp: number = Date.now(),
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-MX', {
    timeZone: PROJECT_TIME_ZONE,
    ...options
  });
}

/**
 * Formats a timestamp into date-time string using PROJECT_TIME_ZONE (America/Hermosillo).
 */
export function formatProjectDateTime(
  timestamp: number = Date.now(),
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(timestamp);
  return date.toLocaleString('es-MX', {
    timeZone: PROJECT_TIME_ZONE,
    ...options
  });
}

/**
 * Tests whether an evidence record qualifies as valid.
 * Must have a valid photoUrl and note >= MIN_EVIDENCE_NOTE_LENGTH characters.
 */
export function isValidEvidenceRecord(record: any): boolean {
  if (!record || typeof record !== 'object') return false;
  const hasPhoto = Boolean(record.photoUrl && typeof record.photoUrl === 'string' && record.photoUrl.trim().length > 0);
  const note = record.note;
  const hasNote = Boolean(typeof note === 'string' && note.trim().length >= MIN_EVIDENCE_NOTE_LENGTH);
  return hasPhoto && hasNote;
}

/**
 * Normalizes existing evidence records into a strictly sequential list.
 * Preserves existing evidences safely without penalizing the student for historical skips/gaps.
 * Rule 14: "preservar evidencias válidas y construir el completedDays secuencial de forma segura.
 * Si existen huecos producidos por la lógica anterior: no penalizar al estudiante."
 */
export function normalizeSequentialEvidences(
  rawEvidences: any[] = [],
  activityId?: string,
  studentId?: string
): NormalizedEvidenceRecord[] {
  if (!Array.isArray(rawEvidences)) return [];

  // Filter only records that possess valid photographic evidence and notes
  const validRecords = rawEvidences.filter(isValidEvidenceRecord);

  // Sort chronologically by submittedAt or timestamp ascending
  validRecords.sort((a, b) => {
    const timeA = a.submittedAt || a.capturedAt || a.timestamp || 0;
    const timeB = b.submittedAt || b.capturedAt || b.timestamp || 0;
    return timeA - timeB;
  });

  // Assign sequential evidenceDay: 1, 2, 3...
  return validRecords.map((rec, index) => {
    const sequentialDay = index + 1;
    const time = rec.submittedAt || rec.capturedAt || rec.timestamp || Date.now();
    return {
      activityId: rec.activityId || activityId,
      studentId: rec.studentId || studentId,
      evidenceDay: sequentialDay,
      day: sequentialDay,
      timestamp: time,
      submittedAt: time,
      capturedAt: rec.capturedAt || time,
      photoUrl: rec.photoUrl,
      note: typeof rec.note === 'string' ? rec.note.trim() : '',
      status: 'completed',
      verifiedByServer: rec.verifiedByServer ?? true
    };
  });
}

/**
 * Authoritative sequential multi-day progress calculator.
 * Strictly adheres to rules:
 * 1. completedDays = count of valid sequential evidences
 * 2. currentDay = min(completedDays + 1, requiredDays)
 * 3. Next evidence unlocked starting on next calendar day (today >= nextEligibleDate)
 * 4. Skipping days does NOT forfeit sequential progress (step remains waiting)
 * 5. Cannot complete multiple days on the same calendar day
 */
export function calculateMultiDayProgress({
  requiredDays,
  rawEvidences = [],
  serverTimestamp = Date.now(),
  simulatedDaysOffset = 0,
  timezone = PROJECT_TIME_ZONE,
  activityId,
  studentId
}: {
  requiredDays: number;
  rawEvidences: any[];
  serverTimestamp?: number;
  simulatedDaysOffset?: number;
  timezone?: string;
  activityId?: string;
  studentId?: string;
}): MultiDayProgressState {
  const safeRequiredDays = Math.max(1, requiredDays || 1);
  const normalizedEvidences = normalizeSequentialEvidences(rawEvidences, activityId, studentId);
  const completedDays = normalizedEvidences.length;
  const isCompleted = completedDays >= safeRequiredDays;
  
  // Rule 1 & 7: currentDay = min(completedDays + 1, requiredDays)
  const currentDay = Math.min(completedDays + 1, safeRequiredDays);
  const expectedEvidenceDay = completedDays + 1;

  // Last accepted evidence in chronological order
  const lastAcceptedEvidence = completedDays > 0 ? normalizedEvidences[completedDays - 1] : null;

  // Current calendar date in authoritative timezone (with simulated days offset if applicable)
  const currentDateKey = getCalendarDateKey(serverTimestamp, timezone, simulatedDaysOffset);
  
  // Calendar date of the last accepted evidence (real calendar date when submitted)
  const lastSubmissionDateKey = lastAcceptedEvidence 
    ? getCalendarDateKey(lastAcceptedEvidence.submittedAt, timezone, 0)
    : null;

  // Eligibility evaluation:
  // - If isCompleted: false (all days finished)
  // - If completedDays === 0: true (Day 1 is immediately available per Rule 9)
  // - If completedDays > 0:
  //   Rule 8: nextEligibleDate = calendar day following lastAcceptedEvidence.submittedAt
  //   today < nextEligibleDate => currentDateKey <= lastSubmissionDateKey (camera locked)
  //   today >= nextEligibleDate => currentDateKey > lastSubmissionDateKey (camera available)
  let canSubmitToday = false;
  if (!isCompleted) {
    if (completedDays === 0) {
      canSubmitToday = true;
    } else if (lastSubmissionDateKey) {
      canSubmitToday = currentDateKey > lastSubmissionDateKey;
    } else {
      canSubmitToday = true;
    }
  }

  const statusBadge = isCompleted 
    ? 'completed' 
    : canSubmitToday 
    ? 'available' 
    : 'locked_today';

  const statusMessage = isCompleted
    ? 'Actividad completada'
    : canSubmitToday
    ? 'Cámara disponible'
    : 'Próxima evidencia disponible mañana';

  // Map of evidences by day number
  const evidencesMap: Record<number, NormalizedEvidenceRecord> = {};
  normalizedEvidences.forEach(ev => {
    evidencesMap[ev.evidenceDay] = ev;
  });

  // Build stepper days array (Rule 12 & 13)
  const stepperDays: DayStepInfo[] = [];
  for (let d = 1; d <= safeRequiredDays; d++) {
    if (d <= completedDays) {
      stepperDays.push({
        dayNumber: d,
        status: 'completed',
        statusLabel: '✓ Listo',
        evidence: evidencesMap[d]
      });
    } else if (d === currentDay) {
      if (canSubmitToday) {
        stepperDays.push({
          dayNumber: d,
          status: 'current_available',
          statusLabel: '⚡ Cámara disponible'
        });
      } else {
        stepperDays.push({
          dayNumber: d,
          status: 'current_locked_today',
          statusLabel: '⏳ Próxima evidencia disponible mañana'
        });
      }
    } else {
      stepperDays.push({
        dayNumber: d,
        status: 'locked_future',
        statusLabel: '🔒 Bloqueado'
      });
    }
  }

  return {
    activityId,
    requiredDays: safeRequiredDays,
    completedDays,
    currentDay,
    expectedEvidenceDay,
    isCompleted,
    canSubmitToday,
    statusBadge,
    statusMessage,
    lastAcceptedEvidence,
    lastSubmissionDateKey,
    currentDateKey,
    nextEligibleDateFormatted: lastAcceptedEvidence ? 'Mañana' : null,
    evidencesMap,
    stepperDays
  };
}
