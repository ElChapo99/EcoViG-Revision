import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import { 
  SURVEY_QUESTIONS, 
  SURVEY_OPTIONS, 
  calculateScore, 
  getRecommendedActivitiesForSurvey,
  SurveyOption,
  SurveyCategory,
  MAIN_ACTIVITIES,
  COMPLEMENTARY_ACTIVITIES,
} from './src/data/surveyData.js';
import { calculateLevel } from './src/lib/worldProgress.js';
import { sendPasswordResetOtp, sendAccountDeletionVerificationEmail } from './src/lib/mailer.js';
import {
  calculateMultiDayProgress,
  normalizeSequentialEvidences,
  PROJECT_TIME_ZONE,
  APP_PROJECT_TIMEZONE,
  MIN_EVIDENCE_NOTE_LENGTH,
  MAX_EVIDENCE_NOTE_LENGTH
} from './src/lib/multiDayMissionProgress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
let adminApp: App;
if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
} else {
  adminApp = getApp();
}

// 🔒 Safe startup check for Firebase Storage bucket
if (!firebaseConfig.storageBucket || typeof firebaseConfig.storageBucket !== 'string' || !firebaseConfig.storageBucket.trim()) {
  console.warn('Firebase Storage bucket is not configured');
} else {
  console.log(`Firebase Storage bucket configured: ${firebaseConfig.storageBucket}`);
}

const adminAuth = getAuth(adminApp);
const firestoreDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

const app = express();

// CORS configuration for EcoVig production and preview domains (Vercel, Cloud Run, localhost)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

/**
 * 🔒 AUTHORITATIVE SERVER REWARD CONSTANTS
 * Only the server holds authority over reward credit amounts.
 */
const INITIAL_SURVEY_REWARD_COINS = 500;
const INITIAL_SURVEY_REWARD_XP = 150;

/**
 * 🔒 NORMALIZATION HELPER FOR SCHOOL NAMES
 * Trims, converts to lowercase, removes accents and special characters to prevent duplicate variations.
 */
export function normalizeSchoolName(name: string): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s]/gi, '') // remove punctuation
    .replace(/\s+/g, ' '); // collapse extra spaces
}

/**
 * 🔒 CENTRALIZED AUTHORITATIVE ADMIN / CREATOR CHECK
 * Evaluates verified token custom claims, authoritative Firestore document roles, and legacy platform email fallbacks.
 */
async function isUserAdminOrCreator(authenticatedUser: any, userData?: any): Promise<boolean> {
  if (!authenticatedUser) return false;

  // 1. Check verified token claims
  if (
    authenticatedUser.admin === true || 
    authenticatedUser.role === 'admin' || 
    authenticatedUser.role === 'creator'
  ) {
    return true;
  }

  // 2. Check authoritative Firestore user document
  let role = userData?.role;
  if (!role && authenticatedUser.uid) {
    try {
      const userDoc = await firestoreDb.collection('users').doc(authenticatedUser.uid).get();
      role = userDoc.data()?.role;
    } catch (e) {
      console.error('Error reading user role for admin check:', e);
    }
  }

  if (role === 'admin' || role === 'creator') {
    return true;
  }

  // 3. Fallback compatibility for platform bootstrap
  const email = (authenticatedUser.email || '').toLowerCase().trim();
  if (email === 'jesusduran2504@outlook.com' || email === 'jearturo250@gmail.com') {
    return true;
  }

  return false;
}

/**
 * Middleware: Authenticate Bearer ID token from Firebase Auth
 * 🔒 Strictly handles authentication and prevents auth failures from turning into 500s.
 */
async function authenticateFirebaseUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[ADMIN AUTH] token present: no, status: 401');
    res.status(401).json({ error: 'No se proporcionó token de autenticación válido (Bearer token requerido)' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  if (!idToken) {
    console.warn('[ADMIN AUTH] token present: no (empty token), status: 401');
    res.status(401).json({ error: 'Token de autenticación vacío' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    (req as any).user = decodedToken;
    console.log('[ADMIN AUTH] token present: yes, verifyIdToken: success');
    next();
  } catch (error: any) {
    console.warn('[ADMIN AUTH] token present: yes, verifyIdToken: failure, reason:', error?.code || error?.message || 'invalid token');
    res.status(401).json({ 
      error: 'Token de autenticación inválido o expirado',
      code: error?.code || 'auth/invalid-token'
    });
  }
}

/**
 * 🔒 SERVER-SIDE SURVEY VERSIONING & QUESTION MANAGEMENT ENGINE
 */
interface ServerManagedSurveyQuestion {
  id: string;
  order: number;
  category: SurveyCategory;
  text: string;
  reverseScoring: boolean;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  retired?: boolean;
  wasEverPublished?: boolean;
  createdInVersionId?: string;
}

interface ServerSurveyVersion {
  versionId: string;
  versionNumber: number;
  name: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number | null;
  createdBy?: string;
  questionCount: number;
  questions: ServerManagedSurveyQuestion[];
  categoryCounts: Record<SurveyCategory, number>;
  scoreRanges: {
    minTotal: number;
    maxTotal: number;
    categories: Record<SurveyCategory, { minScore: number; maxScore: number; count: number }>;
  };
}

function computeVersionMetrics(questions: ServerManagedSurveyQuestion[]) {
  const active = questions.filter(q => !q.retired).sort((a, b) => a.order - b.order);
  const categoryCounts: Record<SurveyCategory, number> = {
    'Conducta Pro-Ambiental': active.filter(q => q.category === 'Conducta Pro-Ambiental').length,
    'Austeridad': active.filter(q => q.category === 'Austeridad').length,
    'Altruismo': active.filter(q => q.category === 'Altruismo').length,
    'Equidad': active.filter(q => q.category === 'Equidad').length,
  };

  const scoreRanges = {
    minTotal: active.length * 100,
    maxTotal: active.length * 400,
    categories: {
      'Conducta Pro-Ambiental': {
        minScore: categoryCounts['Conducta Pro-Ambiental'] * 100,
        maxScore: categoryCounts['Conducta Pro-Ambiental'] * 400,
        count: categoryCounts['Conducta Pro-Ambiental'],
      },
      'Austeridad': {
        minScore: categoryCounts['Austeridad'] * 100,
        maxScore: categoryCounts['Austeridad'] * 400,
        count: categoryCounts['Austeridad'],
      },
      'Altruismo': {
        minScore: categoryCounts['Altruismo'] * 100,
        maxScore: categoryCounts['Altruismo'] * 400,
        count: categoryCounts['Altruismo'],
      },
      'Equidad': {
        minScore: categoryCounts['Equidad'] * 100,
        maxScore: categoryCounts['Equidad'] * 400,
        count: categoryCounts['Equidad'],
      },
    }
  };

  return { active, categoryCounts, scoreRanges, questionCount: active.length };
}

function getBootstrapSurveyVersion(): ServerSurveyVersion {
  const questions: ServerManagedSurveyQuestion[] = SURVEY_QUESTIONS.map((q, idx) => ({
    id: q.id,
    order: idx + 1,
    category: q.category,
    text: q.text,
    reverseScoring: q.reverseScoring,
    imageUrl: null,
    imageStoragePath: null,
    retired: false,
    wasEverPublished: true,
    createdInVersionId: 'survey_v1',
  }));

  const metrics = computeVersionMetrics(questions);

  return {
    versionId: 'survey_v1',
    versionNumber: 1,
    name: 'Evaluación Oficial v1 (21 preguntas)',
    status: 'published',
    createdAt: 1728200000000,
    updatedAt: 1728200000000,
    publishedAt: 1728200000000,
    createdBy: 'system',
    questionCount: metrics.questionCount,
    questions,
    categoryCounts: metrics.categoryCounts,
    scoreRanges: metrics.scoreRanges,
  };
}

async function getPublishedSurveyVersion(): Promise<ServerSurveyVersion> {
  try {
    const configDoc = await firestoreDb.collection('surveySystem').doc('config').get();
    const publishedVersionId = configDoc.exists ? configDoc.data()?.currentPublishedVersionId : null;

    if (!publishedVersionId) {
      const bootstrap = getBootstrapSurveyVersion();
      await firestoreDb.collection('surveyVersions').doc(bootstrap.versionId).set(bootstrap);
      await firestoreDb.collection('surveySystem').doc('config').set({
        currentPublishedVersionId: bootstrap.versionId,
        activeDraftVersionId: null,
        publishedVersionCounter: 1,
        updatedAt: Date.now(),
      });
      return bootstrap;
    }

    const versionDoc = await firestoreDb.collection('surveyVersions').doc(publishedVersionId).get();
    if (!versionDoc.exists) {
      const bootstrap = getBootstrapSurveyVersion();
      await firestoreDb.collection('surveyVersions').doc(publishedVersionId).set(bootstrap);
      return bootstrap;
    }

    return versionDoc.data() as ServerSurveyVersion;
  } catch (err) {
    console.error('Error fetching published survey version from Firestore, using bootstrap fallback:', err);
    return getBootstrapSurveyVersion();
  }
}

async function getSurveyVersionById(versionId: string): Promise<ServerSurveyVersion | null> {
  if (!versionId || versionId === '1' || versionId === 'survey_v1') {
    return await getPublishedSurveyVersion();
  }
  try {
    const docSnap = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (docSnap.exists) {
      return docSnap.data() as ServerSurveyVersion;
    }
  } catch (err) {
    console.error(`Error reading survey version ${versionId}:`, err);
  }
  return await getPublishedSurveyVersion();
}

/**
 * 🔒 DYNAMIC DIAGNOSTIC VALIDATION AGAINST ACTIVE OR PINNED VERSION
 * Rejects missing questions, unknown IDs, empty answers, and invalid options.
 */
function validateSurveyAnswers(rawAnswers: any, version: ServerSurveyVersion): { 
  isValid: boolean; 
  errorMessage?: string; 
  validatedAnswers?: Record<string, SurveyOption> 
} {
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    return { 
      isValid: false, 
      errorMessage: 'No pudimos registrar la encuesta porque el formato de respuestas es inválido.' 
    };
  }

  const activeQuestions = version.questions.filter(q => !q.retired);
  const expectedQuestionIds = activeQuestions.map(q => q.id);
  const rawKeys = Object.keys(rawAnswers);

  // Check for unknown question IDs
  const unknownKeys = rawKeys.filter(k => !expectedQuestionIds.includes(k));
  if (unknownKeys.length > 0) {
    return { 
      isValid: false, 
      errorMessage: 'No pudimos registrar la encuesta porque contiene preguntas no reconocidas. Revisa tus respuestas e inténtalo nuevamente.' 
    };
  }

  // Check that all active questions are present
  const missingKeys = expectedQuestionIds.filter(id => !rawKeys.includes(id) || !rawAnswers[id]);
  if (missingKeys.length > 0) {
    return { 
      isValid: false, 
      errorMessage: `No pudimos registrar la encuesta porque faltan ${missingKeys.length} pregunta(s) por responder. Debes responder las ${expectedQuestionIds.length} preguntas obligatorias.` 
    };
  }

  // Validate that every answer is one of the permitted SURVEY_OPTIONS
  const validated: Record<string, SurveyOption> = {};
  for (const q of activeQuestions) {
    const val = rawAnswers[q.id];
    if (typeof val !== 'string' || !(SURVEY_OPTIONS as readonly string[]).includes(val.trim())) {
      return { 
        isValid: false, 
        errorMessage: 'No pudimos registrar la encuesta porque algunas opciones seleccionadas no son válidas. Revisa tus respuestas e inténtalo nuevamente.' 
      };
    }
    validated[q.id] = val.trim() as SurveyOption;
  }

  return { isValid: true, validatedAnswers: validated };
}

/**
 * 🔒 STRICT 21-QUESTION OFFICIAL EVALUATION VALIDATOR
 * Guarantees exact 21 questions from SURVEY_QUESTIONS (q2 to q22) are present and valid.
 */
function validateDiagnosticAnswers(rawAnswers: any): {
  isValid: boolean;
  errorMessage?: string;
  validatedAnswers?: Record<string, SurveyOption>;
} {
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    return { 
      isValid: false, 
      errorMessage: 'No pudimos registrar la encuesta porque el formato de respuestas es inválido.' 
    };
  }

  const expectedQuestionIds = SURVEY_QUESTIONS.map(q => q.id);
  const rawKeys = Object.keys(rawAnswers);

  // Check for unknown question IDs (including legacy q1)
  const unknownKeys = rawKeys.filter(k => !expectedQuestionIds.includes(k));
  if (unknownKeys.length > 0) {
    return { 
      isValid: false, 
      errorMessage: `No pudimos registrar la encuesta porque contiene preguntas no reconocidas (${unknownKeys.join(', ')}). Revisa tus respuestas e inténtalo nuevamente.` 
    };
  }

  // Check that all 21 questions are present
  const missingKeys = expectedQuestionIds.filter(id => !rawKeys.includes(id) || !rawAnswers[id]);
  if (missingKeys.length > 0) {
    return { 
      isValid: false, 
      errorMessage: `No pudimos registrar la encuesta porque faltan ${missingKeys.length} pregunta(s) por responder. Debes responder las ${expectedQuestionIds.length} preguntas obligatorias.` 
    };
  }

  // Validate that every answer is one of the permitted SURVEY_OPTIONS
  const validated: Record<string, SurveyOption> = {};
  for (const q of SURVEY_QUESTIONS) {
    const val = rawAnswers[q.id];
    if (typeof val !== 'string' || !(SURVEY_OPTIONS as readonly string[]).includes(val.trim())) {
      return { 
        isValid: false, 
        errorMessage: `No pudimos registrar la encuesta porque la respuesta para ${q.id} no es válida. Revisa tus respuestas e inténtalo nuevamente.` 
      };
    }
    validated[q.id] = val.trim() as SurveyOption;
  }

  return { isValid: true, validatedAnswers: validated };
}

/**
 * 🔒 AUTHORITATIVE ROLE VERIFICATION HELPER
 * Verifies if the user is an admin or creator by custom token claims, Firestore doc role, or verified email.
 */
async function verifyAdminOrCreatorRole(userOrUid: any, email?: string): Promise<boolean> {
  const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid?.uid;
  const userEmail = typeof userOrUid === 'object' ? userOrUid?.email : email;
  const customRole = typeof userOrUid === 'object' ? userOrUid?.role : undefined;
  const customAdmin = typeof userOrUid === 'object' ? userOrUid?.admin : undefined;

  if (customAdmin === true || customRole === 'admin' || customRole === 'creator') {
    console.log(`[ADMIN AUTH] role resolved: ${customRole || 'admin'} (via token claims)`);
    return true;
  }

  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  if (normalizedEmail === 'jesusduran2504@outlook.com' || normalizedEmail === 'jearturo250@gmail.com') {
    console.log('[ADMIN AUTH] role resolved: admin (via platform authorized email)');
    return true;
  }

  if (!uid) {
    console.warn('[ADMIN AUTH] role resolved: none (no uid provided)');
    return false;
  }

  try {
    const userDoc = await firestoreDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.warn('[ADMIN AUTH] role resolved: none (user document does not exist in Firestore)');
      return false;
    }
    const data = userDoc.data() || {};
    const docEmail = (data.email || '').toLowerCase().trim();
    if (docEmail === 'jesusduran2504@outlook.com' || docEmail === 'jearturo250@gmail.com') {
      console.log('[ADMIN AUTH] role resolved: admin (via user doc email)');
      return true;
    }
    if (data.role === 'admin' || data.role === 'creator') {
      console.log(`[ADMIN AUTH] role resolved: ${data.role} (via user doc role)`);
      return true;
    }
    console.warn(`[ADMIN AUTH] role resolved: none (user doc role is "${data.role || 'unassigned'}")`);
    return false;
  } catch (err) {
    console.error('[ADMIN AUTH] Error verifying admin/creator role in Firestore:', err);
    return false;
  }
}

/**
 * 🔒 Distributed Persistent Rate Limiting backed by Firestore
 * Ensures limits survive Cloud Run scaling across multiple instances and restarts.
 */
async function checkDistributedRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 5 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const docRef = firestoreDb.collection('rateLimits').doc(key);
  const now = Date.now();

  try {
    return await firestoreDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        const resetAt = now + windowMs;
        transaction.set(docRef, {
          attempts: 1,
          resetAt,
          updatedAt: now,
        });
        return { allowed: true, remaining: maxAttempts - 1, resetAt };
      }

      const data = doc.data() || {};
      const resetAt = data.resetAt || (now + windowMs);

      // If window expired, reset
      if (now > resetAt) {
        const newResetAt = now + windowMs;
        transaction.set(docRef, {
          attempts: 1,
          resetAt: newResetAt,
          updatedAt: now,
        });
        return { allowed: true, remaining: maxAttempts - 1, resetAt: newResetAt };
      }

      const attempts = (data.attempts || 0) + 1;
      if (attempts > maxAttempts) {
        transaction.update(docRef, {
          attempts,
          updatedAt: now,
        });
        return { allowed: false, remaining: 0, resetAt };
      }

      transaction.update(docRef, {
        attempts,
        updatedAt: now,
      });
      return { allowed: true, remaining: maxAttempts - attempts, resetAt };
    });
  } catch (err) {
    console.error('Error in checkDistributedRateLimit:', err);
    // Fail open conservatively on unexpected database error, but log
    return { allowed: true, remaining: maxAttempts, resetAt: now + windowMs };
  }
}

/**
 * 🔒 Centralized Authoritative Student Onboarding Verification
 * Verifies that students have selected an official school and linked to an active teacher.
 * Validates teacher document existence, role, active status, and institutional alignment.
 * Non-student roles (teacher, admin, creator, evaluator) pass through immediately.
 */
async function requireFullyOnboardedStudent(uid: string): Promise<{ authorized: boolean; errorStatus?: number; errorPayload?: any; userData?: any }> {
  try {
    const userRef = firestoreDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        authorized: false,
        errorStatus: 404,
        errorPayload: { error: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' }
      };
    }

    const userData = userDoc.data() || {};
    // If not student, skip student onboarding requirement
    if (userData.role !== 'student') {
      return { authorized: true, userData };
    }

    // 1. Mandatory School Check
    if (!userData.schoolId || typeof userData.schoolId !== 'string' || userData.schoolId.trim() === '') {
      return {
        authorized: false,
        errorStatus: 403,
        errorPayload: {
          error: 'ONBOARDING_REQUIRED',
          code: 'NEEDS_SCHOOL',
          message: 'Debes seleccionar tu escuela secundaria oficial antes de acceder a esta función.'
        },
        userData
      };
    }

    // 2. Mandatory Teacher Check
    if (!userData.teacherId || typeof userData.teacherId !== 'string' || userData.teacherId.trim() === '') {
      return {
        authorized: false,
        errorStatus: 403,
        errorPayload: {
          error: 'ONBOARDING_REQUIRED',
          code: 'NEEDS_TEACHER',
          message: 'Debes vincular tu cuenta con tu maestro mediante tu código de grupo antes de acceder a esta función.'
        },
        userData
      };
    }

    // 3. Deep Teacher Document Verification
    const teacherDoc = await firestoreDb.collection('users').doc(userData.teacherId).get();
    if (!teacherDoc.exists) {
      return {
        authorized: false,
        errorStatus: 403,
        errorPayload: {
          error: 'ONBOARDING_REQUIRED',
          code: 'NEEDS_TEACHER',
          message: 'La cuenta del maestro vinculado no fue encontrada. Por favor actualiza tu vinculación.'
        },
        userData
      };
    }

    const teacherData = teacherDoc.data() || {};
    if (teacherData.role !== 'teacher') {
      return {
        authorized: false,
        errorStatus: 403,
        errorPayload: {
          error: 'ONBOARDING_REQUIRED',
          code: 'NEEDS_TEACHER',
          message: 'El usuario vinculado ya no cuenta con rol de maestro. Contacta a tu escuela.'
        },
        userData
      };
    }

    if (teacherData.active === false) {
      return {
        authorized: false,
        errorStatus: 403,
        errorPayload: {
          error: 'ONBOARDING_REQUIRED',
          code: 'NEEDS_TEACHER',
          message: 'La cuenta del maestro vinculado se encuentra inactiva. Contacta a tu escuela.'
        },
        userData
      };
    }

    if (teacherData.schoolId && userData.schoolId && teacherData.schoolId !== userData.schoolId) {
      return {
        authorized: false,
        errorStatus: 403,
        errorPayload: {
          error: 'ONBOARDING_REQUIRED',
          code: 'NEEDS_TEACHER',
          message: 'La institución de tu maestro vinculado no coincide con tu escuela seleccionada.'
        },
        userData
      };
    }

    return { authorized: true, userData };
  } catch (err: any) {
    console.error('Error verifying student onboarding:', err);
    return {
      authorized: false,
      errorStatus: 500,
      errorPayload: { error: 'SERVER_ERROR', message: 'Error al verificar el estado de la cuenta.' }
    };
  }
}

/**
 * Endpoint: POST /api/survey/initial
 * 
 * 🔒 AUTHORITATIVE INITIAL SURVEY SUBMISSION
 */
app.post('/api/survey/initial', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  if (!uid) {
    res.status(401).json({ error: 'Identificador de usuario no encontrado en sesión' });
    return;
  }

  // 🔒 Gating: Student must be fully onboarded
  const onboardCheck = await requireFullyOnboardedStudent(uid);
  if (!onboardCheck.authorized) {
    res.status(onboardCheck.errorStatus || 403).json(onboardCheck.errorPayload);
    return;
  }

  const { answers: rawAnswers, surveyVersionId: clientVersionId } = req.body;

  // Retrieve student's assigned version or current published version
  const userDocSnapshot = await firestoreDb.collection('users').doc(uid).get();
  const userData = userDocSnapshot.data() || {};
  const assignedVersionId = userData.initialSurveyAssignedVersionId || userData.initialSurvey?.surveyVersionId;

  let targetVersion: ServerSurveyVersion;
  if (assignedVersionId) {
    targetVersion = await getSurveyVersionById(assignedVersionId);
  } else {
    targetVersion = await getPublishedSurveyVersion();
  }

  // If client supplied a versionId, it must match the server-assigned version
  if (clientVersionId && clientVersionId !== targetVersion.versionId) {
    res.status(409).json({
      error: 'SURVEY_VERSION_MISMATCH',
      message: `La versión de la evaluación enviada (${clientVersionId}) no coincide con la versión asignada oficialmente (${targetVersion.versionId}).`
    });
    return;
  }

  const validation = validateSurveyAnswers(rawAnswers, targetVersion);
  if (!validation.isValid || !validation.validatedAnswers) {
    res.status(400).json({ 
      error: 'INVALID_SURVEY_ANSWERS', 
      message: validation.errorMessage || 'No pudimos registrar la encuesta porque algunas respuestas no son válidas. Revisa tus respuestas e inténtalo nuevamente.' 
    });
    return;
  }

  const validAnswers = validation.validatedAnswers;

  // 1. Authoritative scoring calculation on the server using target version questions
  const answersRecord: Record<string, any> = {};
  const categoryScores: Record<SurveyCategory, number> = {
    'Conducta Pro-Ambiental': 0,
    'Austeridad': 0,
    'Altruismo': 0,
    'Equidad': 0,
  };

  let totalScore = 0;
  const activeQuestions = targetVersion.questions.filter(q => !q.retired);

  for (const q of activeQuestions) {
    const selected: SurveyOption = validAnswers[q.id];
    const score = calculateScore(selected, q.reverseScoring);

    answersRecord[q.id] = {
      questionId: q.id,
      category: q.category,
      questionText: q.text,
      selectedOption: selected,
      score,
      reverseScoring: q.reverseScoring,
      imageUrl: q.imageUrl || null,
    };

    categoryScores[q.category] += score;
    totalScore += score;
  }

  const recommendedActivityIds = getRecommendedActivitiesForSurvey(categoryScores, answersRecord);
  const serverTimestamp = Date.now();

  const diagnosticRecord = {
    completed: true,
    completedAt: serverTimestamp,
    rewardGranted: true,
    surveyVersion: targetVersion.versionNumber ? String(targetVersion.versionNumber) : '1',
    surveyVersionId: targetVersion.versionId,
    totalScore,
    categoryScores,
    answers: answersRecord,
    recommendedActivityIds,
  };

  const userDocRef = firestoreDb.collection('users').doc(uid);
  const ledgerDocRef = firestoreDb.collection('users').doc(uid).collection('rewardTransactions').doc('initial-survey');

  try {
    const txResult = await firestoreDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userDocRef);
      if (!userSnapshot.exists) {
        throw new Error('DOCUMENT_NOT_FOUND');
      }

      const userData = userSnapshot.data() || {};
      const ledgerSnapshot = await transaction.get(ledgerDocRef);

      // Check if the survey was already completed
      const isAlreadyCompleted = Boolean(
        userData.initialSurveyCompleted || 
        userData.initialSurvey?.completed
      );

      // Check if reward was already granted
      const isRewardAlreadyGranted = Boolean(
        ledgerSnapshot.exists || 
        userData.surveyRewardGranted || 
        userData.initialSurvey?.rewardGranted
      );

      // IMMUTABILITY: If already completed, do NOT overwrite historical answers
      if (isAlreadyCompleted) {
        // If reward was not yet granted (e.g. legacy account), grant reward without touching answers
        if (!isRewardAlreadyGranted) {
          const currentCoins = typeof userData.coins === 'number' ? userData.coins : 0;
          const currentXp = typeof userData.xp === 'number' ? userData.xp : 0;
          const currentLevel = typeof userData.level === 'number' ? userData.level : 1;

          const newCoins = currentCoins + INITIAL_SURVEY_REWARD_COINS;
          const newXp = currentXp + INITIAL_SURVEY_REWARD_XP;
          const newLevel = calculateLevel(newXp);

          transaction.set(ledgerDocRef, {
            id: 'initial-survey',
            type: 'initial_survey_reward',
            coins: INITIAL_SURVEY_REWARD_COINS,
            xp: INITIAL_SURVEY_REWARD_XP,
            grantedAt: serverTimestamp,
            userId: uid,
          });

          transaction.update(userDocRef, {
            coins: newCoins,
            xp: newXp,
            level: newLevel,
            surveyRewardGranted: true,
            'initialSurvey.rewardGranted': true,
            updatedAt: serverTimestamp,
          });

          return {
            isIdempotentReplay: true,
            rewardGranted: true,
            coinsAdded: INITIAL_SURVEY_REWARD_COINS,
            xpAdded: INITIAL_SURVEY_REWARD_XP,
            results: userData.initialSurvey || userData.surveyResults || diagnosticRecord,
            message: 'Recompensa de diagnóstico acreditada exitosamente.',
          };
        }

        // Already completed and already rewarded: return existing immutable record
        return {
          isIdempotentReplay: true,
          rewardGranted: false,
          coinsAdded: 0,
          xpAdded: 0,
          results: userData.initialSurvey || userData.surveyResults || diagnosticRecord,
          message: 'El diagnóstico inicial ya se encontraba completado y registrado.',
        };
      }

      // FIRST TIME SUBMISSION:
      const currentCoins = typeof userData.coins === 'number' ? userData.coins : 0;
      const currentXp = typeof userData.xp === 'number' ? userData.xp : 0;
      const currentEco = userData.ecosystem || { trees: 1, water: 0, animals: 0 };
      const currentActiveMissions = Array.isArray(userData.activeMissions) && userData.activeMissions.length > 0
        ? userData.activeMissions
        : recommendedActivityIds;

      const newCoins = currentCoins + INITIAL_SURVEY_REWARD_COINS;
      const newXp = currentXp + INITIAL_SURVEY_REWARD_XP;
      const newLevel = calculateLevel(newXp);

      // Write deterministic reward ledger
      transaction.set(ledgerDocRef, {
        id: 'initial-survey',
        type: 'initial_survey_reward',
        coins: INITIAL_SURVEY_REWARD_COINS,
        xp: INITIAL_SURVEY_REWARD_XP,
        grantedAt: serverTimestamp,
        userId: uid,
      });

      // Atomically update user document (pure modern canonical schema)
      transaction.update(userDocRef, {
        initialSurvey: diagnosticRecord,
        initialSurveyCompleted: true,
        surveyRewardGranted: true,
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        ecosystem: currentEco,
        activeMissions: currentActiveMissions,
        updatedAt: serverTimestamp,
      });

      return {
        isIdempotentReplay: false,
        rewardGranted: true,
        coinsAdded: INITIAL_SURVEY_REWARD_COINS,
        xpAdded: INITIAL_SURVEY_REWARD_XP,
        results: diagnosticRecord,
        message: 'Diagnóstico inicial completado con éxito. Recompensa acreditada.',
      };
    });

    res.json({
      success: true,
      ...txResult,
    });
  } catch (error: any) {
    console.error('Error in initial survey transaction:', error);
    if (error.message === 'DOCUMENT_NOT_FOUND') {
      res.status(404).json({ error: 'No se encontró el registro de usuario' });
      return;
    }
    res.status(500).json({ error: 'Error interno del servidor al procesar el diagnóstico' });
  }
});

/**
 * Helper to recursively sanitize objects for Firestore
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore).filter(x => x !== undefined);
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        clean[k] = sanitizeForFirestore(v);
      }
    }
    return clean;
  }
  return obj;
}

/**
 * Endpoint: POST /api/mission/complete
 * 
 * 🔒 AUTHORITATIVE MISSION COMPLETION & IDEMPOTENT REWARD ISSUANCE
 */
app.post('/api/mission/complete', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  if (!uid) {
    res.status(401).json({ error: 'Identificador de usuario no encontrado en sesión' });
    return;
  }

  // 🔒 Gating: Student must be fully onboarded
  const onboardCheck = await requireFullyOnboardedStudent(uid);
  if (!onboardCheck.authorized) {
    res.status(onboardCheck.errorStatus || 403).json(onboardCheck.errorPayload);
    return;
  }

  const { activityId, evidenceData } = req.body;

  if (!activityId || typeof activityId !== 'string') {
    res.status(400).json({ error: 'Identificador de actividad requerido' });
    return;
  }

  // Authoritative activity lookup
  const allActivities = [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES];
  const activity = allActivities.find(a => a.id === activityId);

  if (!activity) {
    res.status(404).json({ error: `Actividad con ID "${activityId}" no encontrada` });
    return;
  }

  const isMain = 'category' in activity && activity.category !== 'Complementaria';
  const durationDays = activity.durationDays || 1;
  const reqs = ('evidenceRequirements' in activity) ? activity.evidenceRequirements : null;
  const serverTimestamp = Date.now();

  // Validate photographic requirements if applicable
  if (reqs && reqs.type === 'photos') {
    const dailyEvidences: any[] = Array.isArray(evidenceData?.dailyEvidences) ? evidenceData.dailyEvidences : [];
    const validDailyEvidences = normalizeSequentialEvidences(dailyEvidences, activity.id, uid);

    if (durationDays > 1) {
      if (validDailyEvidences.length < durationDays) {
        res.status(400).json({ 
          error: `Esta actividad requiere ${durationDays} días de evidencias válidas con fotografía y nota obligatoria (se detectaron ${validDailyEvidences.length}).` 
        });
        return;
      }
    } else {
      const hasPhoto = Boolean(evidenceData?.photos?.[0] || validDailyEvidences[0]?.photoUrl);
      const noteStr = evidenceData?.notes || validDailyEvidences[0]?.note || '';
      if (!hasPhoto || !noteStr || noteStr.trim().length < 10) {
        res.status(400).json({ 
          error: 'La actividad requiere fotografía en tiempo real y nota descriptiva de al menos 10 caracteres.' 
        });
        return;
      }
    }

    if (reqs.reflectionQuestion && (!evidenceData?.reflectionAnswer || !evidenceData.reflectionAnswer.trim())) {
      res.status(400).json({ error: 'La respuesta de reflexión es obligatoria para completar la misión.' });
      return;
    }

    if (reqs.fillSentencePrompt && (!evidenceData?.sentenceCompletion || !evidenceData.sentenceCompletion.trim())) {
      res.status(400).json({ error: 'Por favor completa la frase de compromiso antes de finalizar.' });
      return;
    }
  }

  const xpReward = 'xpReward' in activity ? (activity as any).xpReward : 50;
  const pointsReward = 'pointsReward' in activity ? (activity as any).pointsReward : 10;
  const badgeEarned = activity.badge || undefined;

  const cleanEvidenceData = sanitizeForFirestore(evidenceData || {});

  const completedRecord: Record<string, any> = {
    activityId: activity.id,
    title: activity.title,
    category: activity.category,
    completedAt: serverTimestamp,
    pointsEarned: pointsReward,
    xpEarned: xpReward,
    evidenceType: reqs ? reqs.type : 'interactive',
    evidenceData: cleanEvidenceData,
    verifiedByServer: true,
    feedback: 'Completada exitosamente y verificada por el servidor'
  };

  if (badgeEarned) {
    completedRecord.badgeEarned = badgeEarned;
  }

  const userDocRef = firestoreDb.collection('users').doc(uid);
  const ledgerDocRef = firestoreDb.collection('users').doc(uid).collection('rewardTransactions').doc(activity.id);

  try {
    const txResult = await firestoreDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userDocRef);
      if (!userSnapshot.exists) {
        throw new Error('DOCUMENT_NOT_FOUND');
      }

      const userData = userSnapshot.data() || {};
      const ledgerSnapshot = await transaction.get(ledgerDocRef);
      const alreadyCompleted = Boolean(userData.completedActivities?.[activity.id]);

      // IDEMPOTENCY CHECK
      if (alreadyCompleted && ledgerSnapshot.exists) {
        return {
          isIdempotentReplay: true,
          rewardGranted: false,
          coinsAdded: 0,
          xpAdded: 0,
          level: userData.level || 1,
          completedRecord: userData.completedActivities[activity.id],
          message: 'Esta actividad ya había sido completada y recompensada previamente.'
        };
      }

      // Compute stats
      const currentCoins = typeof userData.coins === 'number' ? userData.coins : 0;
      const currentXp = typeof userData.xp === 'number' ? userData.xp : 0;
      const newCoins = currentCoins + pointsReward;
      const newXp = currentXp + xpReward;
      const newLevel = calculateLevel(newXp);

      const mainPts = (typeof userData.mainMissionPoints === 'number' ? userData.mainMissionPoints : 0) + (isMain ? pointsReward : 0);
      const compPts = (typeof userData.complementaryPoints === 'number' ? userData.complementaryPoints : 0) + (!isMain ? pointsReward : 0);

      const existingBadges: string[] = Array.isArray(userData.badges) ? [...userData.badges] : [];
      if (badgeEarned && !existingBadges.includes(badgeEarned)) {
        existingBadges.push(badgeEarned);
      }

      const currentEco = userData.ecosystem || { trees: 1, water: 0, animals: 0 };
      const newEco = { ...currentEco };
      if (isMain) {
        if (activity.category === 'Conducta Pro-Ambiental') newEco.trees = (newEco.trees || 0) + 1;
        if (activity.category === 'Austeridad') newEco.water = (newEco.water || 0) + 1;
        if (activity.category === 'Altruismo') newEco.animals = (newEco.animals || 0) + 1;
      }

      // Write to ledger
      transaction.set(ledgerDocRef, {
        id: activity.id,
        type: 'mission_completion_reward',
        activityId: activity.id,
        activityTitle: activity.title,
        coins: pointsReward,
        xp: xpReward,
        grantedAt: serverTimestamp,
        userId: uid,
      });

      // Update user doc atomically
      transaction.update(userDocRef, {
        [`completedActivities.${activity.id}`]: completedRecord,
        activeMission: null,
        coins: newCoins,
        xp: newXp,
        level: newLevel,
        mainMissionPoints: mainPts,
        complementaryPoints: compPts,
        badges: existingBadges,
        ecosystem: newEco,
        updatedAt: serverTimestamp,
      });

      return {
        isIdempotentReplay: false,
        rewardGranted: true,
        coinsAdded: pointsReward,
        xpAdded: xpReward,
        level: newLevel,
        badgeEarned,
        completedRecord,
        message: `¡Misión "${activity.title}" completada! +${pointsReward} EcoMonedas y +${xpReward} XP.`
      };
    });

    res.json({
      success: true,
      ...txResult
    });
  } catch (error: any) {
    console.error('Error in mission completion transaction:', error);
    if (error.message === 'DOCUMENT_NOT_FOUND') {
      res.status(404).json({ error: 'No se encontró el registro de usuario' });
      return;
    }
    res.status(500).json({ error: 'Error interno al procesar la finalización de la actividad' });
  }
});

/**
 * Endpoint: POST /api/mission/daily-checkin
 * 
 * 🔒 AUTHORITATIVE SEQUENTIAL MULTI-DAY EVIDENCE RECORDING
 * Implements strict ACID transaction:
 * 1. Authenticates student and validates onboarding
 * 2. Loads active mission and authoritative duration
 * 3. Normalizes existing valid evidences to determine completedDays
 * 4. expectedEvidenceDay = completedDays + 1 (Rule 1: strictly sequential)
 * 5. Validates eligibility:
 *    - completedDays < durationDays (not already completed)
 *    - today >= nextEligibleDate (Rule 3 & 4: at most 1 step per calendar day)
 * 6. Prevents race conditions / double click via firestoreDb.runTransaction
 * 7. Stores evidence record with sequential evidenceDay and authoritative server timestamp
 * 8. Updates user document and writes audit record to evidences collection
 */
app.post('/api/mission/daily-checkin', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  if (!uid) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  // 🔒 Gating: Student must be fully onboarded
  const onboardCheck = await requireFullyOnboardedStudent(uid);
  if (!onboardCheck.authorized) {
    res.status(onboardCheck.errorStatus || 403).json(onboardCheck.errorPayload);
    return;
  }

  const { activityId: reqActivityId, photoUrl, note } = req.body;

  if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.trim()) {
    res.status(400).json({ error: 'Fotografía en tiempo real requerida' });
    return;
  }

  const trimmedNote = (note || '').trim();
  if (trimmedNote.length < MIN_EVIDENCE_NOTE_LENGTH) {
    res.status(400).json({ 
      error: `La nota de la actividad debe tener al menos ${MIN_EVIDENCE_NOTE_LENGTH} caracteres` 
    });
    return;
  }
  if (trimmedNote.length > MAX_EVIDENCE_NOTE_LENGTH) {
    res.status(400).json({ 
      error: `La nota no debe superar los ${MAX_EVIDENCE_NOTE_LENGTH} caracteres` 
    });
    return;
  }

  const serverTimestamp = Date.now();
  const userDocRef = firestoreDb.collection('users').doc(uid);

  try {
    const txResult = await firestoreDb.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userDocRef);
      if (!userSnap.exists) {
        throw new Error('USER_NOT_FOUND');
      }

      const userData = userSnap.data() || {};
      const activeMission = userData.activeMission;

      if (!activeMission) {
        throw new Error('NO_ACTIVE_MISSION');
      }

      const activityId = activeMission.activityId;
      if (reqActivityId && reqActivityId !== activityId) {
        throw new Error('ACTIVITY_MISMATCH');
      }

      // Authoritative duration
      const allActivities = [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES];
      const activityDef = allActivities.find(a => a.id === activityId);
      const durationDays = activityDef?.durationDays || activeMission.durationDays || 1;

      // Extract existing evidences
      const rawEvidences: any[] = Array.isArray(activeMission.dailyEvidences) 
        ? activeMission.dailyEvidences 
        : (Array.isArray(activeMission.dailyCheckIns) ? activeMission.dailyCheckIns : []);

      const simOffset = typeof activeMission.simulatedDaysOffset === 'number' ? activeMission.simulatedDaysOffset : 0;

      // Compute sequential progress state
      const progress = calculateMultiDayProgress({
        requiredDays: durationDays,
        rawEvidences,
        serverTimestamp,
        simulatedDaysOffset: simOffset,
        timezone: PROJECT_TIME_ZONE,
        activityId,
        studentId: uid
      });

      // 1. Check if activity is already completed
      if (progress.isCompleted) {
        throw new Error('ACTIVITY_ALREADY_COMPLETED');
      }

      // 2. Check daily eligibility (at most 1 step per calendar day)
      if (!progress.canSubmitToday) {
        throw new Error('DAILY_LIMIT_REACHED');
      }

      // Expected sequential step
      const expectedDay = progress.expectedEvidenceDay; // completedDays + 1

      // Construct authoritative sequential record (Rule 6)
      const newEvidenceRecord = {
        activityId,
        studentId: uid,
        evidenceDay: expectedDay,
        day: expectedDay, // backward compatibility
        submittedAt: serverTimestamp,
        capturedAt: serverTimestamp,
        photoUrl,
        note: trimmedNote,
        status: 'completed' as const,
        verifiedByServer: true,
      };

      // Append new record to existing normalized evidences
      const normalizedExisting = normalizeSequentialEvidences(rawEvidences, activityId, uid);
      const updatedNormalized = [...normalizedExisting, newEvidenceRecord];
      const newCompletedDays = updatedNormalized.length;
      const isNowComplete = newCompletedDays >= durationDays;

      const updatedCheckIns = updatedNormalized.map(ev => ({
        day: ev.evidenceDay,
        timestamp: ev.submittedAt,
        photoUrl: ev.photoUrl,
        note: ev.note
      }));

      // Update user doc atomically
      transaction.update(userDocRef, {
        'activeMission.dailyEvidences': updatedNormalized,
        'activeMission.dailyCheckIns': updatedCheckIns,
        'activeMission.completedDays': newCompletedDays,
        'activeMission.lastEvidenceSubmittedAt': serverTimestamp,
        updatedAt: serverTimestamp,
      });

      // Also record in evidences root collection (Rule 6 / audit)
      const evidenceAuditDocRef = firestoreDb.collection('evidences').doc(`${uid}_${activityId}_day_${expectedDay}`);
      transaction.set(evidenceAuditDocRef, {
        ...newEvidenceRecord,
        createdAt: serverTimestamp
      });

      return {
        savedRecord: newEvidenceRecord,
        completedDays: newCompletedDays,
        currentDay: Math.min(newCompletedDays + 1, durationDays),
        durationDays,
        isCompleted: isNowComplete,
        canSubmitToday: false,
        message: isNowComplete
          ? `¡Día ${expectedDay} completado! Has cumplido todos los ${durationDays} días requeridos. Ahora puedes finalizar tu misión.`
          : `¡Día ${expectedDay} completado con éxito! El Día ${expectedDay + 1} se habilitará a partir de mañana.`
      };
    });

    res.json({
      success: true,
      ...txResult,
      serverTimestamp
    });
  } catch (error: any) {
    console.error('Error in daily checkin transaction:', error);
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    if (error.message === 'NO_ACTIVE_MISSION') {
      res.status(400).json({ error: 'No tienes ninguna misión activa en este momento' });
      return;
    }
    if (error.message === 'ACTIVITY_MISMATCH') {
      res.status(400).json({ error: 'La actividad especificada no coincide con la misión activa' });
      return;
    }
    if (error.message === 'ACTIVITY_ALREADY_COMPLETED') {
      res.status(400).json({ error: 'Ya has completado todas las evidencias requeridas para esta actividad.' });
      return;
    }
    if (error.message === 'DAILY_LIMIT_REACHED') {
      res.status(400).json({ 
        error: 'Ya registraste la evidencia de hoy para esta misión. La siguiente evidencia se habilitará a partir de mañana para preservar el seguimiento continuo.' 
      });
      return;
    }
    res.status(500).json({ error: 'Error al registrar la evidencia diaria en el servidor' });
  }
});

/**
 * Endpoint: GET /api/mission/active-status
 * 
 * 🔒 AUTHORITATIVE MULTI-DAY ACTIVE MISSION STATUS
 * Returns exact sequential completedDays, currentDay, canSubmitToday, and eligibility.
 */
app.get('/api/mission/active-status', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  if (!uid) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  const serverTimestamp = Date.now();
  const userDocRef = firestoreDb.collection('users').doc(uid);

  try {
    const userSnap = await userDocRef.get();
    if (!userSnap.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userData = userSnap.data() || {};
    const activeMission = userData.activeMission;

    if (!activeMission) {
      res.json({ hasActiveMission: false, serverTimestamp });
      return;
    }

    const activityId = activeMission.activityId;
    const allActivities = [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES];
    const activityDef = allActivities.find(a => a.id === activityId);
    const durationDays = activityDef?.durationDays || activeMission.durationDays || 1;

    const rawEvidences: any[] = Array.isArray(activeMission.dailyEvidences) 
      ? activeMission.dailyEvidences 
      : (Array.isArray(activeMission.dailyCheckIns) ? activeMission.dailyCheckIns : []);

    const simOffset = typeof activeMission.simulatedDaysOffset === 'number' ? activeMission.simulatedDaysOffset : 0;

    const progress = calculateMultiDayProgress({
      requiredDays: durationDays,
      rawEvidences,
      serverTimestamp,
      simulatedDaysOffset: simOffset,
      timezone: PROJECT_TIME_ZONE,
      activityId,
      studentId: uid
    });

    res.json({
      hasActiveMission: true,
      activityId,
      title: activeMission.title,
      durationDays,
      serverTimestamp,
      timezone: PROJECT_TIME_ZONE,
      ...progress
    });
  } catch (error: any) {
    console.error('Error fetching active mission status:', error);
    res.status(500).json({ error: 'Error al consultar el estado de la misión' });
  }
});

/**
 * Endpoint: POST /api/activities/:activityId/survey
 * 
 * 🔒 AUTHORITATIVE ACTIVITY SURVEY / QUESTIONNAIRE EVALUATION
 * Calculates dimension scores authoritatively on the backend.
 * 
 * Strict scoring rules:
 * - Evaluable survey answers: scored per official SURVEY_OPTIONS_CONFIG.
 * - Reflections: EXACTLY 0 points.
 * - Notes: EXACTLY 0 points.
 * - Photos / evidences: EXACTLY 0 socioenvironmental points.
 */
app.post('/api/activities/:activityId/survey', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  if (!uid) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  // 🔒 Gating: Student must be fully onboarded
  const onboardCheck = await requireFullyOnboardedStudent(uid);
  if (!onboardCheck.authorized) {
    res.status(onboardCheck.errorStatus || 403).json(onboardCheck.errorPayload);
    return;
  }

  const { activityId } = req.params;
  const { rawAnswers } = req.body;

  if (!activityId) {
    res.status(400).json({ error: 'Identificador de actividad requerido' });
    return;
  }

  const allActivities = [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES];
  const activity = allActivities.find(a => a.id === activityId);

  if (!activity) {
    res.status(404).json({ error: `Actividad con ID "${activityId}" no encontrada` });
    return;
  }

  if (!rawAnswers || typeof rawAnswers !== 'object') {
    res.status(400).json({ error: 'Formato de respuestas inválido' });
    return;
  }

  // Find associated questions or all questions matching category
  const associatedQIds = ('associatedQuestionIds' in activity && Array.isArray(activity.associatedQuestionIds))
    ? activity.associatedQuestionIds
    : [];

  const targetQuestions = associatedQIds.length > 0
    ? SURVEY_QUESTIONS.filter(q => associatedQIds.includes(q.id))
    : SURVEY_QUESTIONS.filter(q => q.category === activity.category);

  // Authoritative scoring on backend
  const answersRecord: Record<string, any> = {};
  const categoryScores: Record<SurveyCategory, number> = {
    'Conducta Pro-Ambiental': 0,
    'Austeridad': 0,
    'Altruismo': 0,
    'Equidad': 0,
  };

  let totalScore = 0;

  for (const q of targetQuestions) {
    const rawVal = rawAnswers[q.id];
    // Validate option domain
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

  const serverTimestamp = Date.now();
  const surveyResultRecord = {
    activityId,
    activityTitle: activity.title,
    category: activity.category,
    completedAt: serverTimestamp,
    totalScore,
    categoryScores,
    answers: answersRecord,
    verifiedByServer: true,
  };

  const userDocRef = firestoreDb.collection('users').doc(uid);

  try {
    await userDocRef.update({
      [`activitySurveys.${activityId}`]: surveyResultRecord,
      updatedAt: serverTimestamp,
    });

    res.json({
      success: true,
      results: surveyResultRecord,
      message: `Evaluación de la actividad "${activity.title}" procesada exitosamente.`,
    });
  } catch (error: any) {
    console.error('Error saving activity survey:', error);
    res.status(500).json({ error: 'Error al procesar la encuesta de la actividad' });
  }
});

/**
 * Endpoint: POST /api/survey/final
 * 
 * 🔒 AUTHORITATIVE FINAL COMPARATIVE SURVEY
 * Evaluates the 21 final diagnostic questions and saves `finalSurvey`
 * without overwriting `initialSurvey` for baseline comparison.
 * 
 * Requirements:
 * 1. Initial diagnostic survey MUST be completed.
 * 2. All 12 mandatory missions (MAIN_ACTIVITIES) MUST be completed.
 * 3. Final survey answers are strictly validated (exact 21 questions, permitted options).
 * 4. Inmutability: Once submitted, subsequent calls return the existing final survey.
 * 5. Evaluative role: No extra arbitrary rewards awarded unless configured.
 */
app.post('/api/survey/final', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  if (!uid) {
    res.status(401).json({ error: 'Identificador de usuario no encontrado en sesión' });
    return;
  }

  // 🔒 Gating: Student must be fully onboarded
  const onboardCheck = await requireFullyOnboardedStudent(uid);
  if (!onboardCheck.authorized) {
    res.status(onboardCheck.errorStatus || 403).json(onboardCheck.errorPayload);
    return;
  }

  const { answers: rawAnswers, surveyVersionId: clientVersionId } = req.body;

  // Retrieve student's initial survey version for exact comparative pinning
  let targetVersion: ServerSurveyVersion;
  try {
    const userDocSnapshot = await firestoreDb.collection('users').doc(uid).get();
    const existingUserData = userDocSnapshot.data() || {};
    const pinnedVersionId = existingUserData.initialSurvey?.surveyVersionId || existingUserData.surveyResults?.surveyVersionId || existingUserData.initialSurveyAssignedVersionId;
    targetVersion = await getSurveyVersionById(pinnedVersionId);
  } catch (versionErr) {
    targetVersion = await getPublishedSurveyVersion();
  }

  // If client supplied a versionId, it must match the pinned initial version
  if (clientVersionId && clientVersionId !== targetVersion.versionId) {
    res.status(409).json({
      error: 'SURVEY_VERSION_MISMATCH',
      message: `La versión de la evaluación final (${clientVersionId}) no coincide con la versión utilizada en tu diagnóstico inicial (${targetVersion.versionId}).`
    });
    return;
  }

  // Validate answers against the pinned version
  const validation = validateSurveyAnswers(rawAnswers, targetVersion);
  if (!validation.isValid || !validation.validatedAnswers) {
    res.status(400).json({ 
      error: 'INVALID_SURVEY_ANSWERS', 
      message: validation.errorMessage || 'No pudimos registrar la encuesta porque algunas respuestas no son válidas. Revisa tus respuestas e inténtalo nuevamente.' 
    });
    return;
  }

  const validAnswers = validation.validatedAnswers;

  // 1. Authoritative scoring calculation on the server using target version questions
  const answersRecord: Record<string, any> = {};
  const categoryScores: Record<SurveyCategory, number> = {
    'Conducta Pro-Ambiental': 0,
    'Austeridad': 0,
    'Altruismo': 0,
    'Equidad': 0,
  };

  let totalScore = 0;
  const activeQuestions = targetVersion.questions.filter(q => !q.retired);

  for (const q of activeQuestions) {
    const selected: SurveyOption = validAnswers[q.id];
    const score = calculateScore(selected, q.reverseScoring);

    answersRecord[q.id] = {
      questionId: q.id,
      category: q.category,
      questionText: q.text,
      selectedOption: selected,
      score,
      reverseScoring: q.reverseScoring,
      imageUrl: q.imageUrl || null,
    };

    categoryScores[q.category] += score;
    totalScore += score;
  }

  const serverTimestamp = Date.now();
  const finalSurveyRecord = {
    completed: true,
    completedAt: serverTimestamp,
    surveyVersion: targetVersion.versionNumber ? String(targetVersion.versionNumber) : '1',
    surveyVersionId: targetVersion.versionId,
    totalScore,
    categoryScores,
    answers: answersRecord,
  };

  const userDocRef = firestoreDb.collection('users').doc(uid);

  try {
    const txResult = await firestoreDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userDocRef);
      if (!userSnapshot.exists) {
        throw new Error('DOCUMENT_NOT_FOUND');
      }

      const userData = userSnapshot.data() || {};

      // 1. Check Initial Survey completion
      const hasInitialSurvey = Boolean(
        userData.initialSurveyCompleted || 
        userData.initialSurvey?.completed
      );

      if (!hasInitialSurvey) {
        throw new Error('INITIAL_SURVEY_REQUIRED');
      }

      // 2. Check all 12 mandatory missions completion
      const completedActivities = userData.completedActivities || {};
      const missingMandatoryMissions = MAIN_ACTIVITIES.filter(act => !completedActivities[act.id]);

      if (missingMandatoryMissions.length > 0) {
        const errorObj = new Error('FINAL_SURVEY_LOCKED');
        (errorObj as any).missingCount = missingMandatoryMissions.length;
        throw errorObj;
      }

      // 3. Immutability: If already completed, return existing final survey
      if (userData.finalSurveyCompleted && userData.finalSurvey) {
        return {
          isIdempotentReplay: true,
          rewardGranted: false,
          coinsAdded: 0,
          xpAdded: 0,
          results: userData.finalSurvey,
          message: 'La encuesta final ya se encontraba completada y registrada.',
        };
      }

      // 4. Save Final Survey (DO NOT touch initialSurvey)
      transaction.update(userDocRef, {
        finalSurvey: finalSurveyRecord,
        finalSurveyCompleted: true,
        updatedAt: serverTimestamp,
      });

      return {
        isIdempotentReplay: false,
        rewardGranted: false,
        coinsAdded: 0,
        xpAdded: 0,
        results: finalSurveyRecord,
        message: 'Encuesta final completada exitosamente. Comparativa de evolución socioambiental lista.',
      };
    });

    res.json({
      success: true,
      ...txResult,
    });
  } catch (error: any) {
    console.error('Error in final survey transaction:', error);
    if (error.message === 'DOCUMENT_NOT_FOUND') {
      res.status(404).json({ error: 'No se encontró el registro de usuario' });
      return;
    }
    if (error.message === 'INITIAL_SURVEY_REQUIRED') {
      res.status(403).json({ 
        error: 'INITIAL_SURVEY_REQUIRED', 
        message: 'Debes completar tu diagnóstico socioambiental inicial antes de acceder a la evaluación final.' 
      });
      return;
    }
    if (error.message === 'FINAL_SURVEY_LOCKED') {
      const missing = error.missingCount || 0;
      res.status(403).json({ 
        error: 'FINAL_SURVEY_LOCKED', 
        message: `La Encuesta Final está bloqueada. Debes completar las 12 misiones obligatorias antes de realizar tu evaluación final (faltan ${missing}).` 
      });
      return;
    }
    res.status(500).json({ error: 'Error interno del servidor al procesar la encuesta final' });
  }
});

/**
 * 🔒 HELPER: Build sanitized student summary for listings
 */
function sanitizeStudentSummary(id: string, data: any) {
  const completedMap = data.completedActivities || {};
  const completedMandatoryCount = Object.keys(completedMap).filter(k => 
    MAIN_ACTIVITIES.some(a => a.id === k)
  ).length;
  const completedComplementaryCount = Object.keys(completedMap).filter(k => 
    COMPLEMENTARY_ACTIVITIES.some(a => a.id === k)
  ).length;

  const hasInitial = Boolean(data.initialSurveyCompleted || data.initialSurvey?.completed || data.surveyResults);
  const hasFinal = Boolean(data.finalSurveyCompleted || data.finalSurvey?.completed);

  // Derived overall status
  let overallStatus: 'pending_initial' | 'in_progress' | 'final_available' | 'completed' = 'pending_initial';
  if (!hasInitial) {
    overallStatus = 'pending_initial';
  } else if (hasFinal) {
    overallStatus = 'completed';
  } else if (completedMandatoryCount >= MAIN_ACTIVITIES.length) {
    overallStatus = 'final_available';
  } else {
    overallStatus = 'in_progress';
  }

  return {
    uid: id,
    id: id,
    name: data.name || 'Estudiante',
    email: data.email || '',
    role: 'student',
    schoolId: data.schoolId || null,
    schoolName: data.schoolName || data.school || (data.schoolId ? `Escuela (${data.schoolId})` : 'Escuela no asignada'),
    grade: data.grade || null,
    group: data.group || null,
    teacherId: data.teacherId || null,
    xp: typeof data.xp === 'number' ? data.xp : 0,
    level: typeof data.level === 'number' ? data.level : 1,
    coins: typeof data.coins === 'number' ? data.coins : 0,
    streak: typeof data.streak === 'number' ? data.streak : 0,
    initialSurveyCompleted: hasInitial,
    finalSurveyCompleted: hasFinal,
    completedMandatoryCount,
    totalMandatoryCount: MAIN_ACTIVITIES.length, // 12
    completedComplementaryCount,
    totalCompletedActivities: Object.keys(completedMap).length,
    initialTotalScore: (data.initialSurvey || data.surveyResults)?.totalScore || 0,
    finalTotalScore: data.finalSurvey?.totalScore || 0,
    overallStatus,
    createdAt: data.createdAt || 0,
    updatedAt: data.updatedAt || 0,
  };
}

/**
 * 🔒 HELPER: Build sanitized detailed student profile for tracking
 */
function sanitizeStudentDetail(id: string, data: any) {
  const summary = sanitizeStudentSummary(id, data);
  return {
    ...summary,
    initialSurvey: data.initialSurvey || data.surveyResults || null,
    finalSurvey: data.finalSurvey || null,
    completedActivities: data.completedActivities || {},
    ecosystem: data.ecosystem || { trees: 0, water: 0, animals: 0 },
    activeMission: data.activeMission || null,
    badges: Array.isArray(data.badges) ? data.badges : [],
  };
}

/**
 * Endpoint: GET /api/teacher/students
 * 🔒 TEACHER STUDENTS LIST
 * Returns only students linked to the authenticated teacher.
 */
app.get('/api/teacher/students', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const userDoc = await firestoreDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userData = userDoc.data() || {};
    const isAdminUser = userData.role === 'admin' || 
      authenticatedUser.email === 'jesusduran2504@outlook.com' || 
      authenticatedUser.email === 'jearturo250@gmail.com';

    if (userData.role !== 'teacher' && !isAdminUser) {
      res.status(403).json({ error: 'Acceso denegado: solo docentes autorizados pueden acceder a este listado' });
      return;
    }

    // Query students linked to this teacher
    let studentsQuery: FirebaseFirestore.Query = firestoreDb.collection('users')
      .where('role', '==', 'student');

    if (!isAdminUser) {
      studentsQuery = studentsQuery.where('teacherId', '==', uid);
    }

    const snapshot = await studentsQuery.get();
    const students = snapshot.docs.map(doc => sanitizeStudentSummary(doc.id, doc.data()));

    res.json({
      success: true,
      teacher: {
        uid: userDoc.id,
        name: userData.name || '',
        email: userData.email || '',
        linkCode: userData.linkCode || '',
        schoolId: userData.schoolId || null,
      },
      students,
      totalCount: students.length,
      totalMandatoryActivities: MAIN_ACTIVITIES.length,
    });
  } catch (error: any) {
    console.error('Error in /api/teacher/students:', error);
    res.status(500).json({ error: 'Error al consultar los estudiantes del docente' });
  }
});

/**
 * Endpoint: GET /api/teacher/students/:studentId
 * 🔒 TEACHER STUDENT DETAIL
 * Returns detailed progress of a student if and only if assigned to the teacher.
 */
app.get('/api/teacher/students/:studentId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { studentId } = req.params;

  try {
    const teacherDoc = await firestoreDb.collection('users').doc(uid).get();
    if (!teacherDoc.exists) {
      res.status(404).json({ error: 'Docente no encontrado' });
      return;
    }

    const teacherData = teacherDoc.data() || {};
    const isAdminUser = teacherData.role === 'admin' || 
      authenticatedUser.email === 'jesusduran2504@outlook.com' || 
      authenticatedUser.email === 'jearturo250@gmail.com';

    if (teacherData.role !== 'teacher' && !isAdminUser) {
      res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
      return;
    }

    const studentDoc = await firestoreDb.collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      res.status(404).json({ error: 'Estudiante no encontrado' });
      return;
    }

    const studentData = studentDoc.data() || {};
    if (studentData.role !== 'student') {
      res.status(400).json({ error: 'El identificador no corresponde a un estudiante' });
      return;
    }

    // Security Check: Verify teacher assignment
    if (!isAdminUser && studentData.teacherId !== uid) {
      res.status(403).json({ 
        error: 'ACCESS_DENIED',
        message: 'No tienes autorización para consultar el expediente de este estudiante.' 
      });
      return;
    }

    const detail = sanitizeStudentDetail(studentDoc.id, studentData);

    res.json({
      success: true,
      student: detail,
    });
  } catch (error: any) {
    console.error('Error in /api/teacher/students/:studentId:', error);
    res.status(500).json({ error: 'Error al obtener el detalle del estudiante' });
  }
});

/**
 * Endpoint: GET /api/admin/students
 * 🔒 ADMIN / CREATOR GLOBAL STUDENTS LIST
 */
app.get('/api/admin/students', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    console.warn('[ADMIN STUDENTS] Access forbidden: user lacks admin/creator privileges', {
      authenticated: !!authenticatedUser,
      uid: authenticatedUser?.uid,
      status: 403,
    });
    res.status(403).json({ error: 'Acceso denegado: solo administradores/creadores pueden consultar todos los estudiantes' });
    return;
  }

  try {
    console.log('[ADMIN STUDENTS] request received, querying students from Firestore...');
    const snapshot = await firestoreDb.collection('users').where('role', '==', 'student').get();
    const students = snapshot.docs.map(doc => sanitizeStudentSummary(doc.id, doc.data()));

    console.log(`[ADMIN STUDENTS] students retrieved: ${students.length}, status code: 200`);
    res.json({
      success: true,
      students,
      totalCount: students.length,
      totalMandatoryActivities: MAIN_ACTIVITIES.length,
    });
  } catch (error: any) {
    console.error('[ADMIN STUDENTS] Error in /api/admin/students:', error);
    res.status(500).json({ error: 'Error al consultar el listado global de estudiantes' });
  }
});

/**
 * Endpoint: GET /api/admin/students/:studentId
 * 🔒 ADMIN / CREATOR GLOBAL STUDENT DETAIL
 */
app.get('/api/admin/students/:studentId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { studentId } = req.params;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdminUser = adminData.role === 'admin' || 
      authenticatedUser.email === 'jesusduran2504@outlook.com' || 
      authenticatedUser.email === 'jearturo250@gmail.com';

    if (!isAdminUser) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const studentDoc = await firestoreDb.collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      res.status(404).json({ error: 'Estudiante no encontrado' });
      return;
    }

    const studentData = studentDoc.data() || {};
    const detail = sanitizeStudentDetail(studentDoc.id, studentData);

    res.json({
      success: true,
      student: detail,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/students/:studentId:', error);
    res.status(500).json({ error: 'Error al consultar el detalle del estudiante' });
  }
});

/**
 * 🔒 SERVER-SIDE TEACHER UNIQUE LINK CODE GENERATOR
 */
function generateRandomTeacherCodeServer(): string {
  const prefixes = ['ECO', 'DOC', 'PROF', 'BIO', 'UNI', 'VERDE'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
}

async function generateUniqueTeacherCodeServer(): Promise<string> {
  let isUnique = false;
  let code = '';
  let attempts = 0;
  while (!isUnique && attempts < 20) {
    attempts++;
    code = generateRandomTeacherCodeServer();
    try {
      const [indexDoc, userSnap] = await Promise.all([
        firestoreDb.collection('teacherLinkCodes').doc(code).get(),
        firestoreDb.collection('users').where('linkCode', '==', code).limit(1).get()
      ]);
      if (!indexDoc.exists && userSnap.empty) {
        isUnique = true;
      }
    } catch (e) {
      console.error('Error checking unique code in Firestore:', e);
      isUnique = true;
    }
  }
  return code;
}

/**
 * 🔒 CANONICAL OFFICIAL SCHOOLS MAP (CABORCA, SONORA)
 */
const CANONICAL_OFFICIAL_SCHOOLS_MAP: Record<string, { id: string; name: string; educationLevel: string; city: string; state: string }> = {
  sch_sec_tec_1: {
    id: 'sch_sec_tec_1',
    name: 'Escuela Secundaria Técnica 1 Luis Donaldo Colosio',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
  },
  sch_sec_tec_8: {
    id: 'sch_sec_tec_8',
    name: 'Escuela Secundaria Técnica 8 "Profr Armando E. Estrella Ortega"',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
  },
  sch_sec_gral_caborca: {
    id: 'sch_sec_gral_caborca',
    name: 'Escuela Secundaria General Heroes De Caborca',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
  },
  sch_sec_est_6: {
    id: 'sch_sec_est_6',
    name: 'Escuela Secundaria Estatal No.6 Coronel José María Girón',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
  }
};

/**
 * Endpoint: GET /api/admin/teachers
 * 🔒 AUTHORITATIVE ADMIN TEACHER LIST (PURE READ - NO SIDE EFFECTS)
 */
app.get('/api/admin/teachers', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado: solo administradores pueden consultar los docentes' });
    return;
  }

  try {
    const teachersSnapshot = await firestoreDb.collection('users').where('role', '==', 'teacher').get();
    const studentsSnapshot = await firestoreDb.collection('users').where('role', '==', 'student').get();

    // Map student counts by teacherId
    const teacherStudentCounts: Record<string, number> = {};
    studentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const tId = data.teacherId;
      if (tId) {
        teacherStudentCounts[tId] = (teacherStudentCounts[tId] || 0) + 1;
      }
    });

    // Pure read without any background Firestore writes during query
    const teachers = teachersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid || doc.id,
        name: data.name || 'Docente',
        email: data.email || '',
        role: 'teacher',
        linkCode: data.linkCode || 'PENDIENTE',
        schoolId: data.schoolId || null,
        schoolName: data.schoolName || null,
        city: data.city || 'Caborca',
        state: data.state || 'Sonora',
        active: data.active !== false,
        studentCount: teacherStudentCounts[doc.id] || teacherStudentCounts[data.uid] || 0,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
        createdBy: data.createdBy || null,
      };
    });

    res.json({ success: true, teachers });
  } catch (error: any) {
    console.error('Error in GET /api/admin/teachers:', error);
    res.status(500).json({ error: 'Error al consultar docentes' });
  }
});

/**
 * Endpoint: POST /api/admin/teachers
 * 🔒 AUTHORITATIVE ADMIN TEACHER CREATION (ATOMIC LINKCODE RESERVATION + FIRESTORE TRANSACTION + AUTH ROLLBACK)
 */
app.post('/api/admin/teachers', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado: solo administradores pueden crear docentes' });
    return;
  }

  const { name, email, linkCode, schoolId } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'El nombre del docente es obligatorio.' });
    return;
  }

  if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
    res.status(400).json({ error: 'Un correo electrónico válido es obligatorio.' });
    return;
  }

  // 🔒 Strict Canonical School Validation
  const cleanSchoolId = (schoolId || '').trim();
  const canonicalSchool = CANONICAL_OFFICIAL_SCHOOLS_MAP[cleanSchoolId];
  if (!canonicalSchool) {
    res.status(400).json({ 
      error: 'INVALID_SCHOOL', 
      message: 'La escuela seleccionada no pertenece al catálogo oficial de Caborca, Sonora.' 
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  try {
    // 🔒 1. Check if email already registered in Firestore (Return appropriate 409 Conflict code)
    const existingSnap = await firestoreDb.collection('users').where('email', '==', normalizedEmail).limit(1).get();
    if (!existingSnap.empty) {
      const existingData = existingSnap.docs[0].data();
      const existingRole = existingData.role || 'usuario';
      if (existingRole === 'teacher') {
        res.status(409).json({ 
          error: 'TEACHER_ALREADY_EXISTS', 
          message: 'Ya existe un docente registrado con este correo electrónico.' 
        });
        return;
      }
      res.status(409).json({ 
        error: 'ACCOUNT_ROLE_CONFLICT', 
        message: `El correo ya pertenece a un usuario con el rol "${existingRole}". No se puede modificar ni asignar como docente.` 
      });
      return;
    }

    // 🔒 2. Firebase Auth Lookup / Provisioning with safe conflict detection
    let authUid: string | null = null;
    let createdNewAuthUser = false;

    try {
      const existingUserRecord = await adminAuth.getUserByEmail(normalizedEmail);
      authUid = existingUserRecord.uid;
      
      // If Auth account exists, check their Firestore profile
      const existingUidDoc = await firestoreDb.collection('users').doc(authUid).get();
      if (existingUidDoc.exists) {
        const existingData = existingUidDoc.data() || {};
        const existingRole = existingData.role || 'usuario';
        if (existingRole === 'teacher') {
          res.status(409).json({ 
            error: 'TEACHER_ALREADY_EXISTS', 
            message: 'Ya existe un docente registrado con este correo electrónico.' 
          });
          return;
        }
        res.status(409).json({ 
          error: 'ACCOUNT_ROLE_CONFLICT', 
          message: `El usuario ya existe en autenticación asociado al rol "${existingRole}".` 
        });
        return;
      } else {
        // Auth exists but Firestore profile is missing/incomplete -> Block silent role elevation
        res.status(409).json({ 
          error: 'ACCOUNT_PROFILE_INCOMPLETE', 
          message: 'Existe una cuenta de autenticación con este correo pero no tiene un perfil válido en la plataforma. Revísala antes de asignarle el rol docente.' 
        });
        return;
      }
    } catch (authLookupErr: any) {
      if (authLookupErr.code === 'auth/user-not-found') {
        try {
          const newUserRecord = await adminAuth.createUser({
            email: normalizedEmail,
            displayName: trimmedName,
          });
          authUid = newUserRecord.uid;
          createdNewAuthUser = true;
        } catch (authCreateErr: any) {
          console.error('[ADMIN TEACHERS] Error creating Auth record for teacher:', authCreateErr);
          res.status(500).json({ error: 'No se pudo crear la cuenta de autenticación del docente: ' + (authCreateErr?.message || 'Error desconocido') });
          return;
        }
      } else {
        console.error('[ADMIN TEACHERS] Auth lookup error:', authLookupErr);
        res.status(500).json({ error: 'Error al verificar autenticación: ' + (authLookupErr?.message || 'Error desconocido') });
        return;
      }
    }

    const teacherUid = authUid;
    const requestedCustomCode = (typeof linkCode === 'string' && linkCode.trim().length >= 4) ? linkCode.trim().toUpperCase() : '';
    const now = Date.now();
    const adminUid = authenticatedUser.uid || 'admin';
    const adminEmail = authenticatedUser.email || null;

    let assignedCode = '';
    let attempts = 0;

    // 🔒 3. Atomic Transaction for LinkCode Reservation and Teacher Creation with Rollback Support
    try {
      while (!assignedCode && attempts < 10) {
        attempts++;
        const candidateCode = (attempts === 1 && requestedCustomCode) ? requestedCustomCode : generateRandomTeacherCodeServer();

        try {
          await firestoreDb.runTransaction(async (transaction) => {
            // Check reservation collection
            const codeDocRef = firestoreDb.collection('teacherLinkCodes').doc(candidateCode);
            const codeSnap = await transaction.get(codeDocRef);
            if (codeSnap.exists) {
              throw new Error('CODE_TAKEN');
            }

            // Check user document
            const userDocRef = firestoreDb.collection('users').doc(teacherUid);
            const userSnap = await transaction.get(userDocRef);
            if (userSnap.exists) {
              throw new Error('USER_EXISTS');
            }

            const teacherDocData = {
              uid: teacherUid,
              name: trimmedName,
              email: normalizedEmail,
              role: 'teacher',
              schoolId: canonicalSchool.id,
              schoolName: canonicalSchool.name,
              city: canonicalSchool.city,
              state: canonicalSchool.state,
              linkCode: candidateCode,
              active: true,
              createdByUid: adminUid,
              createdByEmail: adminEmail,
              createdBy: adminUid,
              createdAt: now,
              updatedAt: now,
            };

            // Reserve code atomically
            transaction.set(codeDocRef, {
              code: candidateCode,
              teacherId: teacherUid,
              schoolId: canonicalSchool.id,
              createdAt: now,
              active: true,
            });

            // Create teacher document atomically
            transaction.set(userDocRef, teacherDocData);
          });

          assignedCode = candidateCode;
        } catch (txErr: any) {
          if (txErr.message === 'CODE_TAKEN') {
            if (requestedCustomCode && attempts === 1) {
              console.log(`[ADMIN TEACHERS] Requested code ${requestedCustomCode} was already taken, generating unique random code...`);
            }
            continue;
          }
          if (txErr.message === 'USER_EXISTS') {
            res.status(409).json({ 
              error: 'USER_ALREADY_EXISTS', 
              message: 'Ya existe un registro con este identificador en la base de datos.' 
            });
            return;
          }
          throw txErr;
        }
      }

      if (!assignedCode) {
        throw new Error('FAILED_TO_GENERATE_UNIQUE_CODE');
      }

      console.log(`[ADMIN TEACHERS] Atomically created teacher doc ${teacherUid} in ${canonicalSchool.name} with reserved code ${assignedCode} by ${adminEmail || adminUid}`);

      res.json({
        success: true,
        teacher: {
          id: teacherUid,
          uid: teacherUid,
          name: trimmedName,
          email: normalizedEmail,
          role: 'teacher',
          schoolId: canonicalSchool.id,
          schoolName: canonicalSchool.name,
          city: canonicalSchool.city,
          state: canonicalSchool.state,
          linkCode: assignedCode,
          active: true,
          studentCount: 0,
          createdByUid: adminUid,
          createdByEmail: adminEmail,
          createdBy: adminUid,
          createdAt: now,
          updatedAt: now,
        }
      });
    } catch (transactError: any) {
      // 🔒 Consistency Rollback: If we created a NEW Auth record in this request, delete it on Firestore failure
      if (createdNewAuthUser && authUid) {
        try {
          await adminAuth.deleteUser(authUid);
          console.warn(`[ADMIN TEACHERS] Rolled back newly created Auth user ${authUid} after Firestore transaction failure.`);
        } catch (rollbackErr: any) {
          console.error(`[ADMIN TEACHERS] Error rolling back Auth user ${authUid}:`, rollbackErr);
        }
      }
      throw transactError;
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/teachers:', error);
    res.status(500).json({ error: 'Error al registrar el docente en la base de datos: ' + (error?.message || 'Error desconocido') });
  }
});

/**
 * Endpoint: POST /api/admin/teachers/:teacherId/regenerate-code
 * 🔒 AUTHORITATIVE ATOMIC TEACHER LINK CODE REGENERATION
 */
app.post('/api/admin/teachers/:teacherId/regenerate-code', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { teacherId } = req.params;

  try {
    let newAssignedCode = '';
    let attempts = 0;

    while (!newAssignedCode && attempts < 10) {
      attempts++;
      const candidateCode = generateRandomTeacherCodeServer();

      try {
        await firestoreDb.runTransaction(async (transaction) => {
          const teacherRef = firestoreDb.collection('users').doc(teacherId);
          const teacherSnap = await transaction.get(teacherRef);
          if (!teacherSnap.exists) {
            throw new Error('TEACHER_NOT_FOUND');
          }

          const teacherData = teacherSnap.data() || {};
          const oldCode = (teacherData.linkCode || '').trim().toUpperCase();

          const newCodeRef = firestoreDb.collection('teacherLinkCodes').doc(candidateCode);
          const newCodeSnap = await transaction.get(newCodeRef);
          if (newCodeSnap.exists) {
            throw new Error('CODE_TAKEN');
          }

          // 1. Reserve new code index
          transaction.set(newCodeRef, {
            code: candidateCode,
            teacherId: teacherId,
            schoolId: teacherData.schoolId || null,
            createdAt: Date.now(),
            active: true,
          });

          // 2. Update teacher doc with new linkCode
          transaction.update(teacherRef, {
            linkCode: candidateCode,
            updatedAt: Date.now(),
          });

          // 3. Delete old code reservation from index if exists
          if (oldCode && oldCode !== candidateCode) {
            const oldCodeRef = firestoreDb.collection('teacherLinkCodes').doc(oldCode);
            transaction.delete(oldCodeRef);
          }
        });

        newAssignedCode = candidateCode;
      } catch (txErr: any) {
        if (txErr.message === 'CODE_TAKEN') {
          continue;
        }
        if (txErr.message === 'TEACHER_NOT_FOUND') {
          res.status(404).json({ error: 'Docente no encontrado' });
          return;
        }
        throw txErr;
      }
    }

    if (!newAssignedCode) {
      res.status(500).json({ error: 'No se pudo generar un nuevo código único. Inténtalo de nuevo.' });
      return;
    }

    console.log(`[ADMIN TEACHERS] Atomically regenerated linkCode for ${teacherId}: ${newAssignedCode}`);
    res.json({ success: true, linkCode: newAssignedCode });
  } catch (error: any) {
    console.error('Error in POST /api/admin/teachers/:teacherId/regenerate-code:', error);
    res.status(500).json({ error: 'Error al regenerar el código del docente' });
  }
});

/**
 * Endpoint: DELETE /api/admin/users/:userId
 * 🔒 AUTHORITATIVE USER DELETION (CONVERGENT IDEMPOTENT AUTH-FIRST WITH ATOMIC FIRESTORE CLEANUP)
 */
app.delete('/api/admin/users/:userId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado: solo administradores pueden eliminar usuarios' });
    return;
  }

  const { userId } = req.params;

  try {
    const userDocRef = firestoreDb.collection('users').doc(userId);

    // 1. Delete Firebase Auth User First (or verify already clean)
    try {
      await adminAuth.deleteUser(userId);
      console.log(`[ADMIN USERS] Firebase Auth account ${userId} deleted.`);
    } catch (authDeleteErr: any) {
      if (authDeleteErr.code === 'auth/user-not-found') {
        // Auth account already non-existent/cleaned; proceed safely to Firestore cleanup
        console.log(`[ADMIN USERS] Auth account ${userId} already non-existent, proceeding to Firestore cleanup.`);
      } else {
        // Real transient or internal Auth error: abort before modifying Firestore to allow clean retry
        console.error(`[ADMIN USERS] Error deleting Auth account for ${userId}:`, authDeleteErr);
        res.status(500).json({ 
          error: 'Error al eliminar la cuenta de autenticación del usuario: ' + (authDeleteErr?.message || 'Error de autenticación') 
        });
        return;
      }
    }

    // 2. Execute Atomic Firestore Cleanup (releases linkCode only if teacher, deletes user doc)
    await firestoreDb.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userDocRef);
      if (userSnap.exists) {
        const userData = userSnap.data() || {};
        const role = userData.role;
        const code = (userData.linkCode || '').trim().toUpperCase();

        // Release teacher link code only if user is a teacher with a valid linkCode
        if (role === 'teacher' && code) {
          const codeRef = firestoreDb.collection('teacherLinkCodes').doc(code);
          transaction.delete(codeRef);
        }

        transaction.delete(userDocRef);
      }
    });

    console.log(`[ADMIN USERS] User ${userId} successfully cleaned up by admin ${authenticatedUser.email || authenticatedUser.uid}`);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users/:userId:', error);
    res.status(500).json({ error: 'Error al eliminar usuario en la base de datos' });
  }
});

/**
 * Endpoint: GET /api/admin/role-requests
 * 🔒 AUTHORITATIVE ROLE REQUESTS LIST
 */
app.get('/api/admin/role-requests', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  try {
    const snap = await firestoreDb.collection('roleRequests').where('status', '==', 'pending').get();
    const requests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Error in GET /api/admin/role-requests:', error);
    res.status(500).json({ error: 'Error al consultar solicitudes de rol' });
  }
});

/**
 * Endpoint: POST /api/admin/role-requests/:requestId/approve
 * 🔒 AUTHORITATIVE ROLE REQUEST APPROVAL WITH ATOMIC CODE RESERVATION
 */
app.post('/api/admin/role-requests/:requestId/approve', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { requestId } = req.params;
  const { userId, newRole } = req.body;

  try {
    const roleReqDoc = await firestoreDb.collection('roleRequests').doc(requestId).get();
    const targetUserId = userId || roleReqDoc.data()?.userId;
    if (!targetUserId) {
      res.status(400).json({ error: 'ID de usuario no encontrado' });
      return;
    }

    const assignedRole = newRole || 'teacher';

    if (assignedRole === 'teacher') {
      let codeAssigned = '';
      let attempts = 0;
      while (!codeAssigned && attempts < 10) {
        attempts++;
        const candidateCode = generateRandomTeacherCodeServer();
        try {
          await firestoreDb.runTransaction(async (transaction) => {
            const userRef = firestoreDb.collection('users').doc(targetUserId);
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists) throw new Error('USER_NOT_FOUND');
            const userData = userSnap.data() || {};

            const codeRef = firestoreDb.collection('teacherLinkCodes').doc(candidateCode);
            const codeSnap = await transaction.get(codeRef);
            if (codeSnap.exists) throw new Error('CODE_TAKEN');

            transaction.set(codeRef, {
              code: candidateCode,
              teacherId: targetUserId,
              schoolId: userData.schoolId || null,
              createdAt: Date.now(),
              active: true,
            });

            transaction.update(userRef, {
              role: 'teacher',
              linkCode: candidateCode,
              updatedAt: Date.now(),
            });

            transaction.update(firestoreDb.collection('roleRequests').doc(requestId), {
              status: 'approved',
              updatedAt: Date.now(),
              approvedBy: authenticatedUser.email || authenticatedUser.uid,
            });
          });
          codeAssigned = candidateCode;
        } catch (txErr: any) {
          if (txErr.message === 'CODE_TAKEN') continue;
          throw txErr;
        }
      }
    } else {
      await firestoreDb.collection('roleRequests').doc(requestId).update({
        status: 'approved',
        updatedAt: Date.now(),
        approvedBy: authenticatedUser.email || authenticatedUser.uid,
      });
      await firestoreDb.collection('users').doc(targetUserId).update({
        role: assignedRole,
        updatedAt: Date.now(),
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in approve role request:', error);
    res.status(500).json({ error: 'Error al aprobar solicitud de rol' });
  }
});

/**
 * Endpoint: POST /api/admin/role-requests/:requestId/reject
 * 🔒 AUTHORITATIVE ROLE REQUEST REJECTION
 */
app.post('/api/admin/role-requests/:requestId/reject', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);

  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { requestId } = req.params;

  try {
    await firestoreDb.collection('roleRequests').doc(requestId).update({
      status: 'rejected',
      updatedAt: Date.now(),
      rejectedBy: authenticatedUser.email || authenticatedUser.uid,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in reject role request:', error);
    res.status(500).json({ error: 'Error al rechazar solicitud de rol' });
  }
});

/**
 * 🔒 OFFICIAL SCHOOLS CATALOG SEED DATA (CABORCA, SONORA)
 */
const DEFAULT_OFFICIAL_SCHOOLS = [
  {
    id: 'sch_sec_tec_1',
    name: 'Escuela Secundaria Técnica 1 Luis Donaldo Colosio',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
  {
    id: 'sch_sec_tec_8',
    name: 'Escuela Secundaria Técnica 8 "Profr Armando E. Estrella Ortega"',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
  {
    id: 'sch_sec_gral_caborca',
    name: 'Escuela Secundaria General Heroes De Caborca',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  },
  {
    id: 'sch_sec_est_6',
    name: 'Escuela Secundaria Estatal No.6 Coronel José María Girón',
    educationLevel: 'Secundaria',
    city: 'Caborca',
    state: 'Sonora',
    active: true,
    studentRegistrationAllowed: true,
  }
];

const ALLOWED_STUDENT_SCHOOL_IDS = [
  'sch_sec_tec_1',
  'sch_sec_tec_8',
  'sch_sec_gral_caborca',
  'sch_sec_est_6'
];

/**
 * Endpoint: GET /api/schools
 * 🔒 PUBLIC / AUTHENTICATED ACTIVE SCHOOLS LIST
 * Returns official active schools for dropdown selection.
 */
app.get('/api/schools', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  try {
    const snapshot = await firestoreDb.collection('schools').get();
    const now = Date.now();
    
    // Ensure all official default starter schools exist
    const existingIds = new Set(snapshot.docs.map(d => d.id));
    const missingOfficialSchools = DEFAULT_OFFICIAL_SCHOOLS.filter(s => !existingIds.has(s.id));

    if (missingOfficialSchools.length > 0) {
      const batch = firestoreDb.batch();
      for (const item of missingOfficialSchools) {
        const ref = firestoreDb.collection('schools').doc(item.id);
        batch.set(ref, {
          ...item,
          normalizedName: normalizeSchoolName(item.name),
          createdAt: now,
          updatedAt: now,
        }, { merge: true });
      }
      await batch.commit();
    }

    const finalSnap = await firestoreDb.collection('schools').get();
    const forStudents = req.query.forStudents === 'true';

    let schools = finalSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((s: any) => s.active !== false);

    if (forStudents) {
      schools = schools.filter((s: any) => 
        ALLOWED_STUDENT_SCHOOL_IDS.includes(s.id) || s.studentRegistrationAllowed === true
      );
    }

    schools.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

    res.json({
      success: true,
      schools,
    });
  } catch (error: any) {
    console.error('Error in GET /api/schools:', error);
    res.status(500).json({ error: 'Error al consultar el catálogo de escuelas' });
  }
});

/**
 * Endpoint: GET /api/admin/schools
 * 🔒 ADMIN / CREATOR FULL SCHOOLS CATALOG (Active & Inactive with student/teacher counts)
 */
app.get('/api/admin/schools', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador/creador' });
      return;
    }

    const [schoolsSnap, usersSnap] = await Promise.all([
      firestoreDb.collection('schools').get(),
      firestoreDb.collection('users').get(),
    ]);

    const allUsers = usersSnap.docs.map(d => d.data());
    const studentCountMap: Record<string, number> = {};
    const teacherCountMap: Record<string, number> = {};

    for (const u of allUsers) {
      if (u.schoolId) {
        if (u.role === 'student') {
          studentCountMap[u.schoolId] = (studentCountMap[u.schoolId] || 0) + 1;
        } else if (u.role === 'teacher') {
          teacherCountMap[u.schoolId] = (teacherCountMap[u.schoolId] || 0) + 1;
        }
      }
    }

    const schools = schoolsSnap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          studentCount: studentCountMap[d.id] || 0,
          teacherCount: teacherCountMap[d.id] || 0,
        };
      })
      .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

    res.json({
      success: true,
      schools,
      totalCount: schools.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/schools:', error);
    res.status(500).json({ error: 'Error al consultar el catálogo administrativo de escuelas' });
  }
});

/**
 * Endpoint: POST /api/admin/schools
 * 🔒 ADMIN / CREATOR CREATE OFFICIAL SCHOOL
 */
app.post('/api/admin/schools', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const { name, educationLevel, city, state, active } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      res.status(400).json({ error: 'El nombre de la escuela es obligatorio y debe tener al menos 3 caracteres.' });
      return;
    }

    const validLevels = ['Secundaria', 'Bachillerato', 'Universidad', 'Otro'];
    const level = validLevels.includes(educationLevel) ? educationLevel : 'Secundaria';
    const trimmedName = name.trim();
    const normalized = normalizeSchoolName(trimmedName);

    // Duplicate check on normalizedName
    const existingSnap = await firestoreDb.collection('schools').get();
    const duplicate = existingSnap.docs.find(d => {
      const dNorm = d.data().normalizedName || normalizeSchoolName(d.data().name);
      return dNorm === normalized;
    });

    if (duplicate) {
      res.status(400).json({ 
        error: `Ya existe una institución registrada con un nombre equivalente ("${duplicate.data().name}"). Evita registrar duplicados.` 
      });
      return;
    }

    // Generate unique school ID
    const slug = normalized.replace(/\s+/g, '-').substring(0, 30);
    const schoolId = `sch_${slug}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const newSchool = {
      id: schoolId,
      name: trimmedName,
      normalizedName: normalized,
      educationLevel: level,
      city: typeof city === 'string' ? city.trim() : '',
      state: typeof state === 'string' ? state.trim() : 'Sonora',
      active: active !== false,
      createdAt: now,
      updatedAt: now,
    };

    await firestoreDb.collection('schools').doc(schoolId).set(newSchool);

    res.json({
      success: true,
      school: newSchool,
      message: `Escuela "${trimmedName}" creada exitosamente en el catálogo oficial.`
    });
  } catch (error: any) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Error al crear la escuela en el catálogo' });
  }
});

/**
 * Endpoint: PATCH /api/admin/schools/:schoolId
 * 🔒 ADMIN / CREATOR UPDATE / TOGGLE SCHOOL
 */
app.patch('/api/admin/schools/:schoolId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { schoolId } = req.params;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const schoolRef = firestoreDb.collection('schools').doc(schoolId);
    const schoolDoc = await schoolRef.get();

    if (!schoolDoc.exists) {
      res.status(404).json({ error: 'Institución no encontrada' });
      return;
    }

    const { name, educationLevel, city, state, active } = req.body;
    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 3) {
        res.status(400).json({ error: 'El nombre de la escuela debe tener al menos 3 caracteres.' });
        return;
      }
      const trimmedName = name.trim();
      const normalized = normalizeSchoolName(trimmedName);

      // Check duplicates with other schools
      const allSchoolsSnap = await firestoreDb.collection('schools').get();
      const duplicate = allSchoolsSnap.docs.find(d => {
        if (d.id === schoolId) return false;
        const dNorm = d.data().normalizedName || normalizeSchoolName(d.data().name);
        return dNorm === normalized;
      });

      if (duplicate) {
        res.status(400).json({ 
          error: `Ya existe otra institución con nombre equivalente ("${duplicate.data().name}").` 
        });
        return;
      }

      updateData.name = trimmedName;
      updateData.normalizedName = normalized;
    }

    if (educationLevel !== undefined) {
      const validLevels = ['Secundaria', 'Bachillerato', 'Universidad', 'Otro'];
      if (validLevels.includes(educationLevel)) {
        updateData.educationLevel = educationLevel;
      }
    }

    if (city !== undefined) updateData.city = typeof city === 'string' ? city.trim() : '';
    if (state !== undefined) updateData.state = typeof state === 'string' ? state.trim() : '';
    if (active !== undefined) updateData.active = Boolean(active);

    await schoolRef.update(updateData);

    const updatedDoc = await schoolRef.get();
    res.json({
      success: true,
      school: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Institución actualizada exitosamente.'
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/schools/:schoolId:', error);
    res.status(500).json({ error: 'Error al actualizar la institución' });
  }
});

/**
 * Endpoint: POST /api/user/school
 * 🔒 USER (STUDENT / TEACHER) ASSIGN OFFICIAL SCHOOL
 * Validates that schoolId is valid and active in the official catalog.
 */
app.post('/api/user/school', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { schoolId } = req.body;

  if (!schoolId || typeof schoolId !== 'string') {
    res.status(400).json({ error: 'Identificador de escuela requerido' });
    return;
  }

  try {
    let schoolDoc = await firestoreDb.collection('schools').doc(schoolId).get();
    
    // Auto-bootstrap official school if document does not exist yet
    if (!schoolDoc.exists) {
      const officialFallback = DEFAULT_OFFICIAL_SCHOOLS.find(s => s.id === schoolId);
      if (officialFallback) {
        const now = Date.now();
        await firestoreDb.collection('schools').doc(officialFallback.id).set({
          ...officialFallback,
          normalizedName: normalizeSchoolName(officialFallback.name),
          createdAt: now,
          updatedAt: now,
        }, { merge: true });
        schoolDoc = await firestoreDb.collection('schools').doc(schoolId).get();
      }
    }

    if (!schoolDoc.exists) {
      res.status(404).json({ error: 'La escuela seleccionada no existe en el catálogo oficial' });
      return;
    }

    const schoolData = schoolDoc.data() || {};
    if (schoolData.active === false) {
      res.status(400).json({ error: 'La escuela seleccionada se encuentra inactiva para nuevas asignaciones' });
      return;
    }

    const userRef = firestoreDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userData = userDoc.data() || {};

    // 🔒 RESTRICTION: If student already has a teacher assigned and is trying to change their existing school
    if (
      userData.role === 'student' && 
      userData.teacherId && 
      userData.schoolId && 
      userData.schoolId !== schoolDoc.id
    ) {
      res.status(403).json({ 
        error: 'SCHOOL_CHANGE_RESTRICTED',
        message: 'Para cambiar tu escuela debes solicitar la actualización a tu maestro o administrador escolar.' 
      });
      return;
    }

    const now = Date.now();
    await userRef.update({
      schoolId: schoolDoc.id,
      schoolName: schoolData.name,
      updatedAt: now,
    });

    res.json({
      success: true,
      schoolId: schoolDoc.id,
      schoolName: schoolData.name,
      message: `Escuela "${schoolData.name}" asignada correctamente a tu cuenta.`
    });
  } catch (error: any) {
    console.error('Error in POST /api/user/school:', error);
    res.status(500).json({ error: 'Error al asignar la escuela' });
  }
});

// ============================================================================
// 🔒 SURVEY VERSIONING & QUESTION MANAGEMENT ENGINE (ADMIN / CREATOR)
// ============================================================================

/**
 * Endpoint: GET /api/survey/active-version
 * Returns active official survey version.
 * - Initial: Pins initialSurveyAssignedVersionId on first visit so that publishing a newer version does not disrupt an open session.
 * - Final: Uses the student's pinned initialSurvey.surveyVersionId for exact longitudinal comparability.
 */
app.get('/api/survey/active-version', async (req: express.Request, res: express.Response) => {
  try {
    const mode = req.query.mode === 'final' ? 'final' : 'initial';
    let targetVersion: ServerSurveyVersion | null = null;
    let isPinnedFromInitial = false;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userRef = firestoreDb.collection('users').doc(decodedToken.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data() || {};

        if (mode === 'final') {
          const pinnedVersionId = userData.initialSurvey?.surveyVersionId || userData.surveyResults?.surveyVersionId || userData.initialSurveyAssignedVersionId;
          if (pinnedVersionId) {
            targetVersion = await getSurveyVersionById(pinnedVersionId);
            isPinnedFromInitial = true;
          }
        } else {
          // Mode === 'initial'
          const existingAssignedId = userData.initialSurveyAssignedVersionId || userData.initialSurvey?.surveyVersionId;
          if (existingAssignedId) {
            targetVersion = await getSurveyVersionById(existingAssignedId);
          } else {
            // First time student opens initial survey: pin current published version
            const currentPublished = await getPublishedSurveyVersion();
            targetVersion = currentPublished;
            try {
              await userRef.set({
                initialSurveyAssignedVersionId: currentPublished.versionId,
                updatedAt: Date.now(),
              }, { merge: true });
            } catch (pinErr) {
              console.warn('Could not persist initialSurveyAssignedVersionId:', pinErr);
            }
          }
        }
      } catch (authErr) {
        // Fallback to published
      }
    }

    if (!targetVersion) {
      targetVersion = await getPublishedSurveyVersion();
    }

    const activeQuestions = targetVersion.questions
      .filter(q => !q.retired)
      .sort((a, b) => a.order - b.order);

    res.json({
      versionId: targetVersion.versionId,
      versionNumber: targetVersion.versionNumber,
      name: targetVersion.name,
      isPinnedFromInitial,
      questionCount: activeQuestions.length,
      questions: activeQuestions,
      categoryCounts: targetVersion.categoryCounts,
      scoreRanges: targetVersion.scoreRanges,
    });
  } catch (err: any) {
    console.error('Error in GET /api/survey/active-version:', err);
    const bootstrap = getBootstrapSurveyVersion();
    res.json({
      versionId: bootstrap.versionId,
      versionNumber: bootstrap.versionNumber,
      name: bootstrap.name,
      isPinnedFromInitial: false,
      questionCount: bootstrap.questions.length,
      questions: bootstrap.questions,
      categoryCounts: bootstrap.categoryCounts,
      scoreRanges: bootstrap.scoreRanges,
    });
  }
});

/**
 * Endpoint: GET /api/admin/survey-config
 * 🔒 Returns full survey config, active draft, published version, and versions history
 */
app.get('/api/admin/survey-config', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser);
  
  if (!isAdmin) {
    console.warn('[ADMIN SURVEY CONFIG] Access forbidden:', {
      authenticated: !!authenticatedUser,
      uid: authenticatedUser?.uid,
      status: 403,
    });
    res.status(403).json({ error: 'Acceso denegado: solo administradores o creadores pueden gestionar evaluaciones' });
    return;
  }

  try {
    console.log('[ADMIN SURVEY CONFIG] request received');
    console.log('[ADMIN SURVEY CONFIG] Firestore read started');

    const configDoc = await firestoreDb.collection('surveySystem').doc('config').get();
    let currentPublishedVersionId = configDoc.exists ? configDoc.data()?.currentPublishedVersionId : null;
    let activeDraftVersionId = configDoc.exists ? configDoc.data()?.activeDraftVersionId : null;

    let currentPublishedVersion: ServerSurveyVersion | null = null;
    if (currentPublishedVersionId) {
      const pubDoc = await firestoreDb.collection('surveyVersions').doc(currentPublishedVersionId).get();
      if (pubDoc.exists) {
        currentPublishedVersion = pubDoc.data() as ServerSurveyVersion;
      }
    }

    if (!currentPublishedVersion) {
      currentPublishedVersion = await getPublishedSurveyVersion();
      currentPublishedVersionId = currentPublishedVersion.versionId;
    }

    let activeDraftVersion: ServerSurveyVersion | null = null;
    if (activeDraftVersionId) {
      const draftDoc = await firestoreDb.collection('surveyVersions').doc(activeDraftVersionId).get();
      if (draftDoc.exists && draftDoc.data()?.status === 'draft') {
        activeDraftVersion = draftDoc.data() as ServerSurveyVersion;
      }
    }

    const allVersionsSnap = await firestoreDb.collection('surveyVersions').get();
    const allVersions = allVersionsSnap.docs.map(doc => {
      const d = doc.data() as ServerSurveyVersion;
      const activeQs = d.questions ? d.questions.filter(q => !q.retired) : [];
      return {
        versionId: d.versionId || doc.id,
        versionNumber: d.versionNumber || 1,
        name: d.name || `Versión ${d.versionNumber || 1}`,
        status: d.status || 'archived',
        createdAt: d.createdAt || 0,
        updatedAt: d.updatedAt || 0,
        publishedAt: d.publishedAt || null,
        questionCount: d.questionCount || activeQs.length,
        categoryCounts: d.categoryCounts || {
          'Conducta Pro-Ambiental': 0,
          'Austeridad': 0,
          'Altruismo': 0,
          'Equidad': 0,
        },
        scoreRanges: d.scoreRanges,
        isCurrentPublished: (d.versionId || doc.id) === currentPublishedVersionId,
        isActiveDraft: (d.versionId || doc.id) === activeDraftVersionId,
      };
    }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    console.log(`[ADMIN SURVEY CONFIG] currentPublishedVersionId: ${currentPublishedVersionId}, questionCount: ${currentPublishedVersion?.questions?.length ?? 0}, status code: 200`);

    res.json({
      currentPublishedVersion,
      activeDraftVersion,
      allVersions,
      currentPublishedVersionId,
    });
  } catch (error: any) {
    console.error('[ADMIN SURVEY CONFIG] Error in GET /api/admin/survey-config:', error);
    res.status(500).json({ error: 'Error al consultar la configuración de evaluaciones' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/draft
 * 🔒 Creates or retrieves active editable draft
 */
app.post('/api/admin/survey-versions/draft', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado: solo administradores o creadores pueden gestionar borradores' });
    return;
  }

  try {
    const configDoc = await firestoreDb.collection('surveySystem').doc('config').get();
    const activeDraftVersionId = configDoc.exists ? configDoc.data()?.activeDraftVersionId : null;

    if (activeDraftVersionId) {
      const existingDraftDoc = await firestoreDb.collection('surveyVersions').doc(activeDraftVersionId).get();
      if (existingDraftDoc.exists && existingDraftDoc.data()?.status === 'draft') {
        res.json({ draft: existingDraftDoc.data() as ServerSurveyVersion, createdNew: false });
        return;
      }
    }

    // Clone from current published version
    const published = await getPublishedSurveyVersion();
    const nextVersionNumber = (published.versionNumber || 1) + 1;
    const newDraftId = `draft_v${nextVersionNumber}_${Date.now()}`;
    const now = Date.now();

    const clonedQuestions: ServerManagedSurveyQuestion[] = published.questions.map((q, idx) => ({
      id: q.id,
      order: q.order || (idx + 1),
      category: q.category,
      text: q.text,
      reverseScoring: Boolean(q.reverseScoring),
      imageUrl: q.imageUrl || null,
      imageStoragePath: q.imageStoragePath || null,
      retired: Boolean(q.retired),
      wasEverPublished: q.wasEverPublished !== false, // Inherited from published version
      createdInVersionId: q.createdInVersionId || published.versionId,
    }));

    const metrics = computeVersionMetrics(clonedQuestions);

    const newDraft: ServerSurveyVersion = {
      versionId: newDraftId,
      versionNumber: nextVersionNumber,
      name: `Borrador v${nextVersionNumber}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      createdBy: authenticatedUser.uid,
      questionCount: metrics.questionCount,
      questions: clonedQuestions,
      categoryCounts: metrics.categoryCounts,
      scoreRanges: metrics.scoreRanges,
    };

    await firestoreDb.collection('surveyVersions').doc(newDraftId).set(newDraft);
    await firestoreDb.collection('surveySystem').doc('config').set({
      activeDraftVersionId: newDraftId,
      updatedAt: now,
    }, { merge: true });

    res.json({ draft: newDraft, createdNew: true });
  } catch (error: any) {
    console.error('Error in POST /api/admin/survey-versions/draft:', error);
    res.status(500).json({ error: 'Error al crear el borrador de evaluación' });
  }
});

/**
 * Endpoint: GET /api/admin/survey-versions/:versionId
 * 🔒 Returns complete survey version details
 */
app.get('/api/admin/survey-versions/:versionId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId } = req.params;
  try {
    const docSnap = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!docSnap.exists) {
      res.status(404).json({ error: 'Versión de evaluación no encontrada' });
      return;
    }
    res.json(docSnap.data());
  } catch (error: any) {
    console.error(`Error in GET /api/admin/survey-versions/${versionId}:`, error);
    res.status(500).json({ error: 'Error al consultar la versión de evaluación' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/:versionId/questions
 * 🔒 Adds a new question to the active draft with a stable ID
 */
app.post('/api/admin/survey-versions/:versionId/questions', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId } = req.params;
  const { category, text, reverseScoring, imageUrl } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'El texto de la pregunta es obligatorio' });
    return;
  }

  const validCategories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];
  if (!validCategories.includes(category)) {
    res.status(400).json({ error: 'Dimensión socioambiental inválida' });
    return;
  }

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden agregar preguntas a un borrador activo' });
      return;
    }

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      res.status(400).json({ error: 'No se permite almacenar imágenes en formato Data URI / Base64' });
      return;
    }

    const newQuestionId = `q_new_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const activeQuestions = version.questions.filter(q => !q.retired);
    const nextOrder = activeQuestions.length > 0 ? Math.max(...activeQuestions.map(q => q.order)) + 1 : 1;

    const newQuestion: ServerManagedSurveyQuestion = {
      id: newQuestionId,
      order: nextOrder,
      category,
      text: text.trim(),
      reverseScoring: Boolean(reverseScoring),
      imageUrl: imageUrl || null,
      imageStoragePath: null,
      retired: false,
      wasEverPublished: false,
      createdInVersionId: versionId,
    };

    version.questions.push(newQuestion);
    const metrics = computeVersionMetrics(version.questions);
    version.questionCount = metrics.questionCount;
    version.categoryCounts = metrics.categoryCounts;
    version.scoreRanges = metrics.scoreRanges;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      newQuestion,
      message: 'Pregunta agregada exitosamente al borrador.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/survey-versions/:versionId/questions:', error);
    res.status(500).json({ error: 'Error al agregar la pregunta' });
  }
});

/**
 * Endpoint: PATCH /api/admin/survey-versions/:versionId/questions/:questionId
 * 🔒 Updates question text, category, or scoring polarity in draft
 */
app.patch('/api/admin/survey-versions/:versionId/questions/:questionId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId, questionId } = req.params;
  const { text, category, reverseScoring, imageUrl } = req.body;

  if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
    res.status(400).json({ error: 'No se permite almacenar imágenes en formato Data URI / Base64' });
    return;
  }

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden editar preguntas en un borrador activo' });
      return;
    }

    const qIdx = version.questions.findIndex(q => q.id === questionId);
    if (qIdx === -1) {
      res.status(404).json({ error: 'Pregunta no encontrada' });
      return;
    }

    if (text !== undefined) version.questions[qIdx].text = String(text).trim();
    if (category !== undefined) version.questions[qIdx].category = category;
    if (reverseScoring !== undefined) version.questions[qIdx].reverseScoring = Boolean(reverseScoring);

    const metrics = computeVersionMetrics(version.questions);
    version.questionCount = metrics.questionCount;
    version.categoryCounts = metrics.categoryCounts;
    version.scoreRanges = metrics.scoreRanges;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      updatedQuestion: version.questions[qIdx],
      message: 'Pregunta actualizada exitosamente.',
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/survey-versions/:versionId/questions/:questionId:', error);
    res.status(500).json({ error: 'Error al actualizar la pregunta' });
  }
});

/**
 * Endpoint: DELETE /api/admin/survey-versions/:versionId/questions/:questionId
 * 🔒 Safely deletes or retires a question in the active draft:
 * - CASO B: If created only in this draft (starts with q_new_ or never published): physically removed from the draft.
 * - CASO A: If originated from a published version: marked as retired: true (preserved in history and previous versions).
 */
app.delete('/api/admin/survey-versions/:versionId/questions/:questionId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId, questionId } = req.params;

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden eliminar o retirar preguntas en un borrador activo' });
      return;
    }

    const qIdx = version.questions.findIndex(q => q.id === questionId);
    if (qIdx === -1) {
      res.status(404).json({ error: 'Pregunta no encontrada' });
      return;
    }

    const targetQuestion = version.questions[qIdx];
    let isHistoricallyPublished = Boolean(targetQuestion.wasEverPublished);

    // If wasEverPublished flag is not true, verify authoritatively against all published/archived versions in database
    if (!isHistoricallyPublished) {
      const publishedVersionsSnap = await firestoreDb.collection('surveyVersions')
        .where('status', 'in', ['published', 'archived'])
        .get();

      for (const pDoc of publishedVersionsSnap.docs) {
        const pData = pDoc.data() as ServerSurveyVersion;
        if (pData.questions && pData.questions.some(pq => pq.id === questionId)) {
          isHistoricallyPublished = true;
          break;
        }
      }
    }

    let actionTaken = 'retired';
    if (!isHistoricallyPublished) {
      // CASO B: Created only in this draft and never published -> physically remove from draft questions array
      version.questions.splice(qIdx, 1);
      actionTaken = 'deleted_permanently';
    } else {
      // CASO A: Belonged to a published version -> Mark as retired: true and seal wasEverPublished = true
      version.questions[qIdx].retired = true;
      version.questions[qIdx].wasEverPublished = true;
      actionTaken = 'retired';
    }

    // Recompute metrics without retired questions
    const metrics = computeVersionMetrics(version.questions);
    version.questionCount = metrics.questionCount;
    version.categoryCounts = metrics.categoryCounts;
    version.scoreRanges = metrics.scoreRanges;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      actionTaken,
      message: actionTaken === 'deleted_permanently' 
        ? 'Pregunta eliminada permanentemente del borrador.' 
        : 'Pregunta retirada del borrador. No formará parte de la nueva versión oficial.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/survey-versions/:versionId/questions/:questionId:', error);
    res.status(500).json({ error: 'Error al eliminar o retirar la pregunta' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/:versionId/questions/:questionId/restore
 * 🔒 Restores a retired question in the draft
 */
app.post('/api/admin/survey-versions/:versionId/questions/:questionId/restore', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId, questionId } = req.params;

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden restaurar preguntas en un borrador activo' });
      return;
    }

    const qIdx = version.questions.findIndex(q => q.id === questionId);
    if (qIdx === -1) {
      res.status(404).json({ error: 'Pregunta no encontrada' });
      return;
    }

    version.questions[qIdx].retired = false;

    const metrics = computeVersionMetrics(version.questions);
    version.questionCount = metrics.questionCount;
    version.categoryCounts = metrics.categoryCounts;
    version.scoreRanges = metrics.scoreRanges;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      message: 'Pregunta restaurada en el borrador.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/survey-versions/:versionId/questions/:questionId/restore:', error);
    res.status(500).json({ error: 'Error al restaurar la pregunta' });
  }
});

/**
 * Endpoint: GET /api/admin/survey-versions/:versionId/historical-pool
 * 🔒 Lists historical questions from past published/archived versions that are missing from the current draft
 */
app.get('/api/admin/survey-versions/:versionId/historical-pool', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId } = req.params;

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se puede consultar el banco histórico para un borrador activo' });
      return;
    }

    const currentQuestionIds = new Set(version.questions.map(q => q.id));

    const pastVersionsSnap = await firestoreDb.collection('surveyVersions')
      .where('status', 'in', ['published', 'archived'])
      .get();

    const historicalMap = new Map<string, ServerManagedSurveyQuestion>();

    // Also include bootstrap questions pool
    const bootstrap = getBootstrapSurveyVersion();
    bootstrap.questions.forEach(q => {
      if (!currentQuestionIds.has(q.id)) {
        historicalMap.set(q.id, {
          ...q,
          wasEverPublished: true,
        });
      }
    });

    pastVersionsSnap.docs.forEach(doc => {
      const vData = doc.data() as ServerSurveyVersion;
      if (vData.questions) {
        vData.questions.forEach(q => {
          if (!currentQuestionIds.has(q.id) && !historicalMap.has(q.id)) {
            historicalMap.set(q.id, {
              ...q,
              wasEverPublished: true,
              createdInVersionId: q.createdInVersionId || doc.id,
            });
          }
        });
      }
    });

    const historicalPool = Array.from(historicalMap.values());
    res.json({
      historicalQuestions: historicalPool,
      count: historicalPool.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/survey-versions/:versionId/historical-pool:', error);
    res.status(500).json({ error: 'Error al consultar preguntas históricas' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/:versionId/recover-historical/:questionId
 * 🔒 Safely recovers a historical question into the active draft with its exact original questionId and metadata
 */
app.post('/api/admin/survey-versions/:versionId/recover-historical/:questionId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId, questionId } = req.params;

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden reincorporar preguntas en un borrador activo' });
      return;
    }

    // Check if question already exists in draft
    const existingIdx = version.questions.findIndex(q => q.id === questionId);
    if (existingIdx !== -1) {
      version.questions[existingIdx].retired = false;
    } else {
      // Find in past versions or bootstrap
      let historicalQuestion: ServerManagedSurveyQuestion | null = null;
      const pastVersionsSnap = await firestoreDb.collection('surveyVersions')
        .where('status', 'in', ['published', 'archived'])
        .get();

      for (const doc of pastVersionsSnap.docs) {
        const vData = doc.data() as ServerSurveyVersion;
        const found = vData.questions?.find(q => q.id === questionId);
        if (found) {
          historicalQuestion = {
            id: found.id,
            order: found.order || (version.questions.length + 1),
            category: found.category,
            text: found.text,
            reverseScoring: Boolean(found.reverseScoring),
            imageUrl: null, // Keep null by default as per specification
            imageStoragePath: null,
            retired: false,
            wasEverPublished: true,
            createdInVersionId: found.createdInVersionId || doc.id,
          };
          break;
        }
      }

      if (!historicalQuestion) {
        // Check bootstrap
        const bootstrap = getBootstrapSurveyVersion();
        const found = bootstrap.questions.find(q => q.id === questionId);
        if (found) {
          historicalQuestion = {
            id: found.id,
            order: found.order || (version.questions.length + 1),
            category: found.category,
            text: found.text,
            reverseScoring: Boolean(found.reverseScoring),
            imageUrl: null,
            imageStoragePath: null,
            retired: false,
            wasEverPublished: true,
            createdInVersionId: 'survey_v1',
          };
        }
      }

      if (!historicalQuestion) {
        res.status(404).json({ error: `La pregunta histórica ${questionId} no fue encontrada en versiones anteriores` });
        return;
      }

      // Insert question maintaining natural question order
      version.questions.push(historicalQuestion);
    }

    // Sequence active question orders
    const activeQuestions = version.questions.filter(q => !q.retired);
    activeQuestions.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || a.order;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || b.order;
      return numA - numB;
    }).forEach((q, idx) => {
      q.order = idx + 1;
    });

    const metrics = computeVersionMetrics(version.questions);
    version.questionCount = metrics.questionCount;
    version.categoryCounts = metrics.categoryCounts;
    version.scoreRanges = metrics.scoreRanges;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      message: `Pregunta histórica ${questionId} reincorporada exitosamente al borrador.`,
    });
  } catch (error: any) {
    console.error(`Error in POST /api/admin/survey-versions/${versionId}/recover-historical/${questionId}:`, error);
    res.status(500).json({ error: 'Error al reincorporar la pregunta histórica' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/:versionId/reorder
 * 🔒 Reorders active questions in the draft
 */
app.post('/api/admin/survey-versions/:versionId/reorder', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId } = req.params;
  const { orderedQuestionIds } = req.body;

  if (!Array.isArray(orderedQuestionIds)) {
    res.status(400).json({ error: 'Formato inválido de ordenamiento' });
    return;
  }

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden reordenar preguntas en un borrador activo' });
      return;
    }

    orderedQuestionIds.forEach((qId: string, index: number) => {
      const q = version.questions.find(item => item.id === qId);
      if (q) {
        q.order = index + 1;
      }
    });

    version.updatedAt = Date.now();
    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      message: 'Orden actualizado exitosamente.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/survey-versions/:versionId/reorder:', error);
    res.status(500).json({ error: 'Error al reordenar las preguntas' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/:versionId/questions/:questionId/image
 * 🔒 Uploads image for a question in draft
 */
app.post('/api/admin/survey-versions/:versionId/questions/:questionId/image', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId, questionId } = req.params;
  const { imageBase64, filename, mimeType } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    res.status(400).json({ error: 'Debes proporcionar la imagen en formato Base64' });
    return;
  }

  const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const detectedMime = mimeType || (imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)?.[1] || 'image/png');
  if (!validMimes.includes(detectedMime.toLowerCase())) {
    res.status(400).json({ error: 'Formato no permitido. Solo se aceptan imágenes PNG, JPG o WEBP' });
    return;
  }

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    res.status(400).json({ error: 'La imagen excede el tamaño máximo permitido de 5MB' });
    return;
  }

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden editar imágenes en un borrador activo' });
      return;
    }

    const qIdx = version.questions.findIndex(q => q.id === questionId);
    if (qIdx === -1) {
      res.status(404).json({ error: 'Pregunta no encontrada en la versión' });
      return;
    }

    let imageUrl = '';
    let storagePath = '';
    const cleanName = (filename || 'image.png').replace(/[^a-zA-Z0-9._-]/g, '_');
    storagePath = `survey-question-images/${versionId}/${questionId}/${Date.now()}_${cleanName}`;

    if (!firebaseConfig.storageBucket) {
      res.status(500).json({ 
        error: 'STORAGE_BUCKET_NOT_CONFIGURED', 
        message: 'No pudimos subir la imagen: el bucket de Firebase Storage no está configurado.' 
      });
      return;
    }

    const bucket = getAdminStorage(adminApp).bucket(firebaseConfig.storageBucket);
    const file = bucket.file(storagePath);

    const downloadToken = crypto.randomUUID();

    try {
      await file.save(buffer, {
        metadata: { 
          contentType: detectedMime,
          cacheControl: 'public, max-age=31536000',
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });
    } catch (storageErr: any) {
      console.error('Firebase Storage upload failed:', storageErr);
      res.status(500).json({
        error: 'STORAGE_UPLOAD_FAILED',
        message: 'No pudimos subir la imagen a Firebase Storage. Inténtalo nuevamente.'
      });
      return;
    }

    const encodedPath = encodeURIComponent(storagePath);
    imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    // 🔒 STRICT INTEGRITY CHECK: Never allow Data URI or base64 to enter Firestore
    if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.length > 2048) {
      res.status(500).json({
        error: 'INVALID_STORAGE_URL',
        message: 'No pudimos generar la URL de la imagen en Storage. Inténtalo nuevamente.'
      });
      return;
    }

    version.questions[qIdx].imageUrl = imageUrl;
    version.questions[qIdx].imageStoragePath = storagePath;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      imageUrl,
      imageStoragePath: storagePath,
      message: 'Imagen asignada correctamente a la pregunta.'
    });
  } catch (error: any) {
    console.error('Error uploading question image:', error);
    res.status(500).json({ error: error.message || 'Error al guardar la imagen' });
  }
});

/**
 * Endpoint: DELETE /api/admin/survey-versions/:versionId/questions/:questionId/image
 * 🔒 Removes image reference from a question in draft without deleting historical physical storage files (copy-on-write preservation)
 */
app.delete('/api/admin/survey-versions/:versionId/questions/:questionId/image', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }

  const { versionId, questionId } = req.params;

  try {
    const versionDoc = await firestoreDb.collection('surveyVersions').doc(versionId).get();
    if (!versionDoc.exists) {
      res.status(404).json({ error: 'Versión no encontrada' });
      return;
    }
    const version = versionDoc.data() as ServerSurveyVersion;
    if (version.status !== 'draft') {
      res.status(400).json({ error: 'Solo se pueden remover imágenes en un borrador activo' });
      return;
    }

    const qIdx = version.questions.findIndex(q => q.id === questionId);
    if (qIdx === -1) {
      res.status(404).json({ error: 'Pregunta no encontrada' });
      return;
    }

    // 🔒 COPY-ON-WRITE: Do NOT delete physical storage file so historical versions referencing it remain intact
    version.questions[qIdx].imageUrl = null;
    version.questions[qIdx].imageStoragePath = null;
    version.updatedAt = Date.now();

    await firestoreDb.collection('surveyVersions').doc(versionId).set(version);

    res.json({
      success: true,
      version,
      message: 'Imagen removida de la pregunta.',
    });
  } catch (error: any) {
    console.error('Error removing question image:', error);
    res.status(500).json({ error: 'Error al quitar la imagen' });
  }
});

/**
 * Endpoint: POST /api/admin/survey-versions/:versionId/publish
 * 🔒 Transactionally publishes the draft as the new official published version with strict concurrency guarantees
 */
app.post('/api/admin/survey-versions/:versionId/publish', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const isAdmin = await verifyAdminOrCreatorRole(authenticatedUser.uid, authenticatedUser.email);
  if (!isAdmin) {
    res.status(403).json({ error: 'Acceso denegado: solo administradores o creadores pueden publicar evaluaciones' });
    return;
  }

  const { versionId } = req.params;

  try {
    const now = Date.now();
    let publishedVersion: ServerSurveyVersion;

    await firestoreDb.runTransaction(async (transaction) => {
      const configRef = firestoreDb.collection('surveySystem').doc('config');
      const draftRef = firestoreDb.collection('surveyVersions').doc(versionId);

      const [configDoc, draftDoc] = await Promise.all([
        transaction.get(configRef),
        transaction.get(draftRef)
      ]);

      if (!draftDoc.exists) {
        throw new Error('DRAFT_NOT_FOUND');
      }

      const draft = draftDoc.data() as ServerSurveyVersion;
      if (draft.status !== 'draft') {
        throw new Error('DRAFT_ALREADY_PUBLISHED');
      }

      const configData = configDoc.exists ? configDoc.data() || {} : {};
      if (configData.activeDraftVersionId && configData.activeDraftVersionId !== versionId) {
        throw new Error('CONCURRENT_PUBLICATION_CONFLICT');
      }

      const activeQuestions = draft.questions.filter(q => !q.retired);
      if (activeQuestions.length === 0) {
        throw new Error('NO_ACTIVE_QUESTIONS');
      }

      const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];
      for (const cat of categories) {
        const countInCat = activeQuestions.filter(q => q.category === cat).length;
        if (countInCat === 0) {
          throw new Error(`MISSING_DIMENSION_QUESTIONS_${cat}`);
        }
      }

      const previousPublishedId = configData.currentPublishedVersionId;
      const nextCounter = (configData.publishedVersionCounter || 1) + 1;
      const newOfficialVersionId = `survey_v${nextCounter}`;

      if (previousPublishedId && previousPublishedId !== newOfficialVersionId) {
        const prevRef = firestoreDb.collection('surveyVersions').doc(previousPublishedId);
        transaction.update(prevRef, {
          status: 'archived',
          updatedAt: now,
        });
      }

      // Re-order active questions sequentially 1..N and seal wasEverPublished = true
      const finalizedQuestions: ServerManagedSurveyQuestion[] = activeQuestions
        .sort((a, b) => a.order - b.order)
        .map((q, idx) => ({
          ...q,
          order: idx + 1,
          wasEverPublished: true,
          createdInVersionId: q.createdInVersionId || newOfficialVersionId,
        }));

      const metrics = computeVersionMetrics(finalizedQuestions);

      publishedVersion = {
        versionId: newOfficialVersionId,
        versionNumber: nextCounter,
        name: `Evaluación Oficial v${nextCounter} (${metrics.questionCount} preguntas)`,
        status: 'published',
        createdAt: draft.createdAt || now,
        updatedAt: now,
        publishedAt: now,
        createdBy: authenticatedUser.uid,
        questionCount: metrics.questionCount,
        questions: finalizedQuestions,
        categoryCounts: metrics.categoryCounts,
        scoreRanges: metrics.scoreRanges,
      };

      const newVersionRef = firestoreDb.collection('surveyVersions').doc(newOfficialVersionId);
      transaction.set(newVersionRef, publishedVersion);

      // Clean up the draft document if its ID was different
      if (versionId !== newOfficialVersionId) {
        transaction.delete(draftRef);
      }

      transaction.set(configRef, {
        currentPublishedVersionId: newOfficialVersionId,
        activeDraftVersionId: null,
        publishedVersionCounter: nextCounter,
        updatedAt: now,
      }, { merge: true });
    });

    res.json({
      success: true,
      publishedVersion: publishedVersion!,
      message: `¡Evaluación Oficial v${publishedVersion!.versionNumber} publicada exitosamente con ${publishedVersion!.questionCount} preguntas!`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/survey-versions/:versionId/publish:', error);
    let statusCode = 500;
    if (error.message === 'DRAFT_ALREADY_PUBLISHED' || error.message === 'CONCURRENT_PUBLICATION_CONFLICT') {
      statusCode = 409;
    } else if (error.message === 'DRAFT_NOT_FOUND') {
      statusCode = 404;
    } else if (error.message === 'NO_ACTIVE_QUESTIONS' || error.message?.startsWith('MISSING_DIMENSION_QUESTIONS')) {
      statusCode = 400;
    }
    res.status(statusCode).json({ error: error.message || 'Error al publicar la nueva versión' });
  }
});

/**
 * Endpoint: POST /api/user/link-teacher
 * 🔒 AUTHORITATIVE TEACHER LINKING FOR STUDENTS
 * Validates teacher linkCode, verifies strict school matching, and assigns teacherId without overwriting schoolId.
 * Protected by distributed persistent rate limiting in Firestore.
 */
app.post('/api/user/link-teacher', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { linkCode } = req.body;

  if (!linkCode || typeof linkCode !== 'string' || linkCode.trim().length < 3) {
    res.status(400).json({ 
      error: 'INVALID_TEACHER_CODE', 
      message: 'El código ingresado no es válido. Verifícalo con tu maestro e inténtalo nuevamente.' 
    });
    return;
  }

  // 🔒 Distributed Persistent Rate Limiting (10 attempts / 5 mins per user)
  const rateLimit = await checkDistributedRateLimit(`link_teacher_${uid}`, 10, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Has superado el límite de intentos permitidos. Por favor espera unos minutos antes de intentar de nuevo.'
    });
    return;
  }

  const cleanCode = linkCode.trim().toUpperCase();

  try {
    const studentRef = firestoreDb.collection('users').doc(uid);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuario no encontrado en el sistema.' });
      return;
    }

    const studentData = studentDoc.data() || {};
    if (studentData.role !== 'student') {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Solo los estudiantes pueden vincularse con un código de maestro.' });
      return;
    }

    // 🔒 1. Check if student already has a school selected
    if (!studentData.schoolId || typeof studentData.schoolId !== 'string' || studentData.schoolId.trim() === '') {
      res.status(400).json({
        error: 'NEEDS_SCHOOL_FIRST',
        message: 'Debes seleccionar tu escuela secundaria oficial antes de vincularte con un maestro.'
      });
      return;
    }

    // 🔒 2. Check if student is already linked to a teacher
    if (studentData.teacherId && typeof studentData.teacherId === 'string' && studentData.teacherId.trim() !== '') {
      res.status(400).json({
        error: 'ALREADY_LINKED',
        message: 'Tu cuenta ya se encuentra vinculada a un maestro oficial.'
      });
      return;
    }

    // 🔒 3. Query teacher by authoritative linkCode
    const teacherQuery = await firestoreDb
      .collection('users')
      .where('linkCode', '==', cleanCode)
      .where('role', '==', 'teacher')
      .limit(1)
      .get();

    if (teacherQuery.empty) {
      res.status(400).json({ 
        error: 'INVALID_TEACHER_CODE', 
        message: 'El código ingresado no es válido. Verifícalo con tu maestro e inténtalo nuevamente.' 
      });
      return;
    }

    const teacherDoc = teacherQuery.docs[0];
    const teacherData = teacherDoc.data() || {};

    if (teacherData.active === false) {
      res.status(400).json({ 
        error: 'INVALID_TEACHER_CODE', 
        message: 'El código ingresado no es válido. Verifícalo con tu maestro e inténtalo nuevamente.' 
      });
      return;
    }

    // 🔒 4. Strict School Matching: Teacher's schoolId MUST match Student's pre-selected schoolId
    const studentSchoolId = (studentData.schoolId || '').trim();
    const teacherSchoolId = (teacherData.schoolId || '').trim();

    if (!teacherSchoolId || studentSchoolId !== teacherSchoolId) {
      res.status(400).json({
        error: 'SCHOOL_MISMATCH',
        message: 'Este código no corresponde a la escuela que tienes seleccionada. Verifica tu escuela o consulta con tu maestro.'
      });
      return;
    }

    // 🔒 5. Atomic Transaction: Update ONLY teacherId without overwriting schoolId
    await firestoreDb.runTransaction(async (transaction) => {
      const freshStudentDoc = await transaction.get(studentRef);
      if (!freshStudentDoc.exists) throw new Error('STUDENT_NOT_FOUND');
      const freshData = freshStudentDoc.data() || {};
      
      if (freshData.teacherId) {
        throw new Error('ALREADY_LINKED');
      }

      transaction.update(studentRef, {
        teacherId: teacherDoc.id,
        updatedAt: Date.now(),
      });
    });

    res.json({
      success: true,
      teacherId: teacherDoc.id,
      message: '¡Cuenta vinculada exitosamente con tu maestro!'
    });
  } catch (error: any) {
    if (error.message === 'ALREADY_LINKED') {
      res.status(400).json({ error: 'ALREADY_LINKED', message: 'Tu cuenta ya se encuentra vinculada a un maestro.' });
      return;
    }
    console.error('Error in POST /api/user/link-teacher:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Error interno al procesar la vinculación.' });
  }
});

/**
 * Endpoint: POST /api/admin/schools/migrate-legacy
 * 🔒 NON-DESTRUCTIVE LEGACY SCHOOL AUDIT & MIGRATION TOOL
 */
app.post('/api/admin/schools/migrate-legacy', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const { applyMatches } = req.body;

    const [schoolsSnap, usersSnap] = await Promise.all([
      firestoreDb.collection('schools').get(),
      firestoreDb.collection('users').get(),
    ]);

    const activeSchools = schoolsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((s: any) => s.active !== false);

    const schoolNormMap = new Map<string, any>();
    for (const sch of activeSchools) {
      const norm = (sch as any).normalizedName || normalizeSchoolName((sch as any).name);
      schoolNormMap.set(norm, sch);
    }

    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const exactMatches: any[] = [];
    const ambiguousMatches: any[] = [];
    const unassigned: any[] = [];
    let updatedCount = 0;

    const now = Date.now();

    for (const u of users) {
      const userSchoolId = (u as any).schoolId;
      const legacyName = (u as any).schoolName || (u as any).school;

      if (!userSchoolId) {
        if (!legacyName || !legacyName.trim()) {
          unassigned.push({
            userId: (u as any).id,
            name: (u as any).name,
            role: (u as any).role,
            legacyName: 'Sin asignar',
          });
          continue;
        }

        const normLegacy = normalizeSchoolName(legacyName);
        const match = schoolNormMap.get(normLegacy);

        if (match) {
          exactMatches.push({
            userId: (u as any).id,
            name: (u as any).name,
            role: (u as any).role,
            legacyName,
            matchedSchoolId: match.id,
            matchedSchoolName: match.name,
          });

          if (applyMatches === true) {
            await firestoreDb.collection('users').doc((u as any).id).update({
              schoolId: match.id,
              schoolName: match.name,
              updatedAt: now,
            });
            updatedCount++;
          }
        } else {
          ambiguousMatches.push({
            userId: (u as any).id,
            name: (u as any).name,
            role: (u as any).role,
            legacyName,
            suggestedCandidates: activeSchools
              .filter((s: any) => normalizeSchoolName(s.name).includes(normLegacy) || normLegacy.includes(normalizeSchoolName(s.name)))
              .map((s: any) => ({ id: s.id, name: s.name })),
          });
        }
      }
    }

    res.json({
      success: true,
      auditReport: {
        totalUsersAudited: users.length,
        exactMatchesCount: exactMatches.length,
        ambiguousMatchesCount: ambiguousMatches.length,
        unassignedCount: unassigned.length,
        appliedUpdates: updatedCount,
        exactMatches: exactMatches.slice(0, 50),
        ambiguousMatches: ambiguousMatches.slice(0, 50),
      },
      message: applyMatches 
        ? `Migración no destructiva completada: ${updatedCount} usuarios vinculados inequívocamente al catálogo oficial.`
        : `Auditoría completada: ${exactMatches.length} coincidencias exactas listas para vincular.`
    });
  } catch (error: any) {
    console.error('Error in legacy school migration:', error);
    res.status(500).json({ error: 'Error al procesar la auditoría de escuelas' });
  }
});

/**
 * 🔒 CENTRALIZED STUDENT ACCOUNT DELETION FUNCTION
 * Authoritatively deletes:
 * 1. Firebase Authentication record
 * 2. Physical Firebase Storage files (evidences, profiles, avatars)
 * 3. All subcollections dynamically under users/{uid} (e.g. rewardTransactions, etc.)
 * 4. User role requests (roleRequests)
 * 5. User root missions / evidences
 * 6. User document in Firestore
 * 7. Handles errors idempotently without failing on already deleted resources
 */
async function deleteStudentAccount(uid: string): Promise<{ success: boolean; errors?: string[] }> {
  const errors: string[] = [];

  // 1. Delete Firebase Auth User
  try {
    await adminAuth.deleteUser(uid);
  } catch (err: any) {
    if (err.code !== 'auth/user-not-found') {
      console.warn(`Auth user delete warning for ${uid}:`, err.message);
      errors.push(`Auth: ${err.message}`);
    }
  }

  // 2. Delete Physical Files in Firebase Storage for this UID (Idempotent)
  try {
    const bucket = getAdminStorage(adminApp).bucket();
    const prefixes = [
      `evidences/${uid}/`,
      `evidence/${uid}/`,
      `profile/${uid}/`,
      `users/${uid}/`,
      `avatars/${uid}/`,
      `temp/${uid}/`
    ];

    for (const prefix of prefixes) {
      try {
        const [files] = await bucket.getFiles({ prefix });
        for (const file of files) {
          try {
            await file.delete({ ignoreNotFound: true });
          } catch (fileErr: any) {
            if (fileErr.code !== 404 && !fileErr.message?.includes('No such object')) {
              console.warn(`Warning deleting storage object ${file.name}:`, fileErr.message);
            }
          }
        }
      } catch (prefixErr: any) {
        // If storage bucket is not provisioned or prefix empty, continue idempotently
        console.warn(`Storage prefix cleanup notice for ${prefix}:`, prefixErr.message);
      }
    }
  } catch (storageErr: any) {
    console.warn(`Firebase Storage purge notice for ${uid}:`, storageErr.message);
  }

  // 3. Delete ALL dynamic subcollections under users/{uid}
  try {
    const userDocRef = firestoreDb.collection('users').doc(uid);
    const subcollections = await userDocRef.listCollections();
    for (const subcol of subcollections) {
      try {
        const snap = await subcol.get();
        if (!snap.empty) {
          const batch = firestoreDb.batch();
          snap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      } catch (subErr: any) {
        console.warn(`Error deleting subcollection ${subcol.id} for user ${uid}:`, subErr.message);
        errors.push(`Subcollection ${subcol.id}: ${subErr.message}`);
      }
    }
  } catch (err: any) {
    console.warn(`Error listing subcollections for ${uid}:`, err);
    errors.push(`Subcollections: ${err.message}`);
  }

  // 4. Delete student missions & evidences in root collections
  try {
    const [missionsSnap, evidencesSnap] = await Promise.all([
      firestoreDb.collection('missions').where('studentId', '==', uid).get(),
      firestoreDb.collection('evidences').where('studentId', '==', uid).get(),
    ]);

    const batch = firestoreDb.batch();
    missionsSnap.docs.forEach(d => batch.delete(d.ref));
    evidencesSnap.docs.forEach(d => batch.delete(d.ref));
    if (!missionsSnap.empty || !evidencesSnap.empty) {
      await batch.commit();
    }
  } catch (err: any) {
    console.warn(`Error deleting root missions/evidences for ${uid}:`, err);
    errors.push(`Missions/Evidences: ${err.message}`);
  }

  // 5. Delete role requests associated with this user
  try {
    const roleReqSnap = await firestoreDb.collection('roleRequests').where('userId', '==', uid).get();
    if (!roleReqSnap.empty) {
      const batch = firestoreDb.batch();
      roleReqSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err: any) {
    console.warn(`Error deleting role requests for ${uid}:`, err);
  }

  // 6. Delete user document from Firestore
  try {
    await firestoreDb.collection('users').doc(uid).delete();
  } catch (err: any) {
    console.warn(`Error deleting user doc ${uid}:`, err);
    errors.push(`UserDoc: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Endpoint: POST /api/account/deletion-request
 * 🔒 STUDENT REQUEST ACCOUNT DELETION
 */
app.post('/api/account/deletion-request', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const userDoc = await firestoreDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userData = userDoc.data() || {};
    if (userData.role !== 'student') {
      res.status(403).json({ error: 'Solo los estudiantes pueden solicitar eliminación a través de este flujo' });
      return;
    }

    const { reason, type } = req.body;
    const requestType: 'account_deletion' | 'academic_withdrawal' = 
      type === 'academic_withdrawal' ? 'academic_withdrawal' : 'account_deletion';

    // Check if there is already an active deletion/withdrawal request
    const activeReqsSnap = await firestoreDb.collection('accountDeletionRequests')
      .where('userId', '==', uid)
      .get();

    const existingActive = activeReqsSnap.docs.find(d => {
      const st = d.data().status;
      return st === 'pending' || st === 'approved' || st === 'processing' || st === 'pending_verification' || st === 'verified' || st === 'in_progress';
    });

    if (existingActive) {
      res.status(400).json({ 
        error: 'ACTIVE_REQUEST_EXISTS',
        message: 'Ya tienes una solicitud activa en proceso de revisión.' 
      });
      return;
    }

    // Resolve teacher name if teacherId is present
    let teacherName: string | null = null;
    if (userData.teacherId) {
      try {
        const teacherDoc = await firestoreDb.collection('users').doc(userData.teacherId).get();
        if (teacherDoc.exists) {
          teacherName = teacherDoc.data()?.name || null;
        }
      } catch (e) {
        // ignore
      }
    }

    const requestId = `del_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const trackingId = `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = Date.now();

    const newRequest = {
      id: requestId,
      userId: uid,
      userName: userData.name || 'Estudiante',
      userEmail: userData.email || authenticatedUser.email || '',
      type: requestType,
      teacherId: userData.teacherId || null,
      teacherName: teacherName,
      schoolId: userData.schoolId || null,
      schoolName: userData.schoolName || userData.school || null,
      grade: userData.grade || null,
      group: userData.group || null,
      status: 'pending',
      source: 'in_app',
      trackingId,
      reason: typeof reason === 'string' ? reason.trim().substring(0, 500) : '',
      createdAt: now,
      updatedAt: now,
    };

    await firestoreDb.collection('accountDeletionRequests').doc(requestId).set(newRequest);

    await firestoreDb.collection('users').doc(uid).update({
      accountDeletionRequested: true,
      activeDeletionRequestId: requestId,
      updatedAt: now,
    });

    res.json({
      success: true,
      request: newRequest,
      message: requestType === 'academic_withdrawal'
        ? 'Solicitud de baja académica enviada exitosamente a tu docente.'
        : 'Solicitud de eliminación de cuenta y datos personales enviada exitosamente. Tu identidad y trámite serán procesados por administración.'
    });
  } catch (error: any) {
    console.error('Error in POST /api/account/deletion-request:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud de eliminación' });
  }
});

/**
 * Endpoint: GET /api/account/deletion-request
 * 🔒 STUDENT GET ACTIVE DELETION REQUEST
 */
app.get('/api/account/deletion-request', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const snap = await firestoreDb.collection('accountDeletionRequests')
      .where('userId', '==', uid)
      .get();

    if (snap.empty) {
      res.json({ success: true, request: null });
      return;
    }

    // Get the most recent request
    const sorted = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json({
      success: true,
      request: sorted[0] || null,
    });
  } catch (error: any) {
    console.error('Error in GET /api/account/deletion-request:', error);
    res.status(500).json({ error: 'Error al consultar la solicitud de eliminación' });
  }
});

/**
 * Endpoint: POST /api/account/deletion-request/cancel
 * 🔒 STUDENT CANCEL PENDING REQUEST
 */
app.post('/api/account/deletion-request/cancel', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const snap = await firestoreDb.collection('accountDeletionRequests')
      .where('userId', '==', uid)
      .where('status', '==', 'pending')
      .get();

    if (snap.empty) {
      res.status(404).json({ error: 'No tienes ninguna solicitud pendiente para cancelar.' });
      return;
    }

    const reqDoc = snap.docs[0];
    const now = Date.now();

    await reqDoc.ref.update({
      status: 'cancelled',
      cancelledAt: now,
      updatedAt: now,
    });

    await firestoreDb.collection('users').doc(uid).update({
      accountDeletionRequested: false,
      activeDeletionRequestId: null,
      updatedAt: now,
    });

    const updatedDoc = await reqDoc.ref.get();

    res.json({
      success: true,
      request: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Tu solicitud de eliminación ha sido cancelada exitosamente.'
    });
  } catch (error: any) {
    console.error('Error in cancel deletion request:', error);
    res.status(500).json({ error: 'Error al cancelar la solicitud' });
  }
});

/**
 * Endpoint: GET /api/teacher/deletion-requests
 * 🔒 TEACHER GET ASSIGNED STUDENTS' DELETION REQUESTS
 */
app.get('/api/teacher/deletion-requests', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const teacherDoc = await firestoreDb.collection('users').doc(uid).get();
    const teacherData = teacherDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, teacherData);

    if (teacherData.role !== 'teacher' && !isAdmin) {
      res.status(403).json({ error: 'Acceso denegado: solo docentes autorizados' });
      return;
    }

    let q: FirebaseFirestore.Query = firestoreDb.collection('accountDeletionRequests');
    if (!isAdmin) {
      q = q.where('teacherId', '==', uid);
    }

    const snap = await q.get();
    const requests = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json({
      success: true,
      requests,
      totalCount: requests.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/teacher/deletion-requests:', error);
    res.status(500).json({ error: 'Error al consultar las solicitudes de eliminación' });
  }
});

/**
 * Endpoint: PATCH /api/teacher/deletion-requests/:requestId
 * 🔒 TEACHER REVIEW (APPROVE / REJECT) DELETION REQUEST
 */
app.patch('/api/teacher/deletion-requests/:requestId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { requestId } = req.params;
  const { status, reviewNote } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    res.status(400).json({ error: 'El estado debe ser "approved" o "rejected"' });
    return;
  }

  try {
    const teacherDoc = await firestoreDb.collection('users').doc(uid).get();
    const teacherData = teacherDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, teacherData);

    if (teacherData.role !== 'teacher' && !isAdmin) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const reqRef = firestoreDb.collection('accountDeletionRequests').doc(requestId);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }

    const reqData = reqDoc.data() || {};

    // 🔒 SECURITY CHECK: Ensure teacher owns this student's request
    if (!isAdmin && reqData.teacherId !== uid) {
      res.status(403).json({ 
        error: 'ACCESS_DENIED',
        message: 'No tienes autorización para gestionar solicitudes de alumnos ajenos a tu grupo.' 
      });
      return;
    }

    // State machine check: only pending requests can be reviewed by teacher
    if (reqData.status !== 'pending' && reqData.status !== 'pending_verification' && reqData.status !== 'verified') {
      res.status(400).json({ 
        error: 'INVALID_TRANSITION',
        message: `Esta solicitud ya se encuentra en estado "${reqData.status}" y no puede ser modificada.` 
      });
      return;
    }

    const isAccountDeletion = reqData.type === 'account_deletion' || !reqData.type;

    // 🔒 PROTECTION AGAINST ARBITRARY BLOCKING:
    // Teachers can approve or reject "academic_withdrawal" requests.
    // For "account_deletion", teachers can review, verify identity, and add administrative observations,
    // but cannot arbitrarily reject a valid account deletion request. If teacher marks observations,
    // status transitions to 'verified' / 'approved' or forwards with notes to administrator review.
    let finalStatus = status;
    if (isAccountDeletion && status === 'rejected' && !isAdmin) {
      // Re-route to administrative review with teacher observation instead of blocking student deletion
      finalStatus = 'requires_admin_review';
    }

    const now = Date.now();
    const updateData: Record<string, any> = {
      status: finalStatus,
      reviewedAt: now,
      reviewedBy: uid,
      reviewerName: teacherData.name || 'Docente',
      reviewerRole: 'teacher',
      reviewNote: typeof reviewNote === 'string' ? reviewNote.trim() : '',
      updatedAt: now,
    };

    await reqRef.update(updateData);

    const updatedDoc = await reqRef.get();

    let feedbackMessage = 'Solicitud tramitada por el docente.';
    if (finalStatus === 'approved') {
      feedbackMessage = 'Solicitud validada por el docente y turnada a administración para ejecución final.';
    } else if (finalStatus === 'rejected') {
      feedbackMessage = 'Solicitud de baja académica rechazada con nota explicativa.';
    } else if (finalStatus === 'requires_admin_review') {
      feedbackMessage = 'Observaciones docentes registradas. Por política de privacidad, la solicitud de eliminación pasa a revisión administrativa directa.';
    }

    res.json({
      success: true,
      request: { id: updatedDoc.id, ...updatedDoc.data() },
      message: feedbackMessage
    });
  } catch (error: any) {
    console.error('Error reviewing deletion request:', error);
    res.status(500).json({ error: 'Error al revisar la solicitud' });
  }
});

/**
 * Endpoint: GET /api/admin/deletion-requests
 * 🔒 ADMIN / CREATOR GET ALL DELETION REQUESTS
 */
app.get('/api/admin/deletion-requests', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos administrativos' });
      return;
    }

    const snap = await firestoreDb.collection('accountDeletionRequests').get();
    const requests = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json({
      success: true,
      requests,
      totalCount: requests.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/deletion-requests:', error);
    res.status(500).json({ error: 'Error al consultar las solicitudes de eliminación' });
  }
});

/**
 * Endpoint: PATCH /api/admin/deletion-requests/:requestId
 * 🔒 ADMIN / CREATOR REVIEW DELETION REQUEST
 */
app.patch('/api/admin/deletion-requests/:requestId', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { requestId } = req.params;
  const { status, reviewNote } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    res.status(400).json({ error: 'El estado debe ser "approved" o "rejected"' });
    return;
  }

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const reqRef = firestoreDb.collection('accountDeletionRequests').doc(requestId);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }

    const now = Date.now();
    await reqRef.update({
      status,
      reviewedAt: now,
      reviewedBy: uid,
      reviewerName: adminData.name || 'Administrador',
      reviewerRole: 'admin',
      reviewNote: typeof reviewNote === 'string' ? reviewNote.trim() : '',
      updatedAt: now,
    });

    const updatedDoc = await reqRef.get();

    res.json({
      success: true,
      request: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Solicitud actualizada por administración.'
    });
  } catch (error: any) {
    console.error('Error in admin review deletion request:', error);
    res.status(500).json({ error: 'Error al procesar la revisión' });
  }
});

/**
 * Endpoint: POST /api/admin/deletion-requests/:requestId/execute
 * 🔒 AUTHORITATIVE FINAL ACCOUNT DELETION EXECUTION
 * Executes complete, idempotent purge of user Auth, subcollections, evidences, and user document.
 */
app.post('/api/admin/deletion-requests/:requestId/execute', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { requestId } = req.params;

  try {
    const adminDoc = await firestoreDb.collection('users').doc(uid).get();
    const adminData = adminDoc.data() || {};
    const isAdmin = await isUserAdminOrCreator(authenticatedUser, adminData);

    if (!isAdmin) {
      res.status(403).json({ error: 'Acceso denegado: solo Creador/Admin puede ejecutar eliminación definitiva' });
      return;
    }

    const reqRef = firestoreDb.collection('accountDeletionRequests').doc(requestId);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      res.status(404).json({ error: 'Solicitud de eliminación no encontrada' });
      return;
    }

    const reqData = reqDoc.data() || {};

    // Check if already completed
    if (reqData.status === 'completed') {
      res.json({
        success: true,
        message: 'Esta cuenta ya había sido eliminada definitivamente con anterioridad.',
        request: { id: reqDoc.id, ...reqData }
      });
      return;
    }

    // Set status to processing
    await reqRef.update({
      status: 'processing',
      processingStartedAt: Date.now(),
      processingBy: uid,
    });

    const targetUserId = reqData.userId;

    // Execute centralized purge
    const deletionResult = await deleteStudentAccount(targetUserId);

    const now = Date.now();
    if (deletionResult.success) {
      // Mark completed & keep minimal non-identifying audit record (Zero PII & Anonymized Reference)
      await reqRef.update({
        status: 'completed',
        completedAt: now,
        completedBy: uid,
        updatedAt: now,
        userId: `anon_${Math.random().toString(36).substring(2, 12)}`,
        userName: 'Usuario Eliminado',
        userEmail: 'eliminado@ecovig.local',
        reason: '[Depurado por política de privacidad]',
        schoolName: null,
        grade: null,
        group: null,
        teacherName: null,
        anonymized: true,
      });

      const finalDoc = await reqRef.get();

      res.json({
        success: true,
        request: { id: finalDoc.id, ...finalDoc.data() },
        message: `Cuenta de estudiante eliminada definitivamente de forma segura (Auth + Firestore + Storage + Auditoría Anonimizada).`
      });
    } else {
      // Mark failed with error report for recovery
      await reqRef.update({
        status: 'failed',
        error: deletionResult.errors?.join(', ') || 'Error parcial en la purga',
        updatedAt: now,
      });

      res.status(500).json({
        error: 'DELETION_FAILED',
        message: 'Ocurrió un error parcial al purgar los registros de la cuenta.',
        details: deletionResult.errors,
      });
    }
  } catch (error: any) {
    console.error('Error executing account deletion:', error);
    res.status(500).json({ error: 'Error interno al ejecutar la eliminación definitiva' });
  }
});

/**
 * 🌐 PUBLIC ACCOUNT DELETION SYSTEM (Google Play Store Compliance)
 * - Publicly accessible without logging in at https://ecovig.net/eliminar-cuenta
 * - Secure identity verification via cryptographic email verification token
 * - Anti-enumeration: identical response whether email exists or not
 * - Rate limiting by IP and Email
 * - Tracking ID for status inquiry without exposing student files or personal data
 */

const PUBLIC_DELETION_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashPublicDeletionToken(token: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET environment variable is required');
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Endpoint: POST /api/public/account-deletion-request
 * 🌐 PUBLIC REQUEST ACCOUNT DELETION (Send verification email)
 */
app.post('/api/public/account-deletion-request', async (req: express.Request, res: express.Response) => {
  const { email, reason } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Debes proporcionar un correo electrónico válido.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  try {
    // 1. Rate limiting by IP (max 5 requests per 15 mins)
    const ipRateLimitDoc = await firestoreDb.collection('rateLimits').doc(`deletion_ip_${Buffer.from(clientIp).toString('hex').substring(0, 32)}`).get();
    if (ipRateLimitDoc.exists) {
      const data = ipRateLimitDoc.data() || {};
      if (data.count >= 5 && (now - (data.firstAttemptAt || 0)) < 15 * 60 * 1000) {
        res.status(429).json({
          error: 'Demasiadas solicitudes desde esta conexión. Por favor, intenta de nuevo en 15 minutos.'
        });
        return;
      }
    }

    // Update IP rate limit
    await firestoreDb.collection('rateLimits').doc(`deletion_ip_${Buffer.from(clientIp).toString('hex').substring(0, 32)}`).set({
      count: ((ipRateLimitDoc.data()?.count || 0) + 1),
      firstAttemptAt: ipRateLimitDoc.data()?.firstAttemptAt || now,
      lastAttemptAt: now,
    }, { merge: true });

    // 2. Find user by email in Firebase Auth or Firestore
    let targetUserRecord: any = null;
    try {
      const authUser = await adminAuth.getUserByEmail(normalizedEmail);
      if (authUser && authUser.uid) {
        const userDoc = await firestoreDb.collection('users').doc(authUser.uid).get();
        if (userDoc.exists) {
          targetUserRecord = { uid: authUser.uid, ...userDoc.data() };
        }
      }
    } catch (authErr: any) {
      if (authErr.code !== 'auth/user-not-found') {
        console.warn('Error querying auth user by email for public deletion:', authErr.message);
      }
    }

    // If user exists, create secure verification token and email link
    let trackingIdForResponse = `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (targetUserRecord) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashPublicDeletionToken(rawToken);
      const trackingId = trackingIdForResponse;
      const expiresAt = now + PUBLIC_DELETION_TOKEN_TTL_MS;

      // Save pending verification request
      await firestoreDb.collection('publicDeletionTokens').doc(tokenHash).set({
        tokenHash,
        trackingId,
        userId: targetUserRecord.uid,
        userName: targetUserRecord.name || 'Estudiante EcoViG',
        userEmail: normalizedEmail,
        schoolId: targetUserRecord.schoolId || null,
        schoolName: targetUserRecord.schoolName || null,
        teacherId: targetUserRecord.teacherId || null,
        reason: typeof reason === 'string' ? reason.trim().substring(0, 500) : '',
        status: 'pending_verification',
        createdAt: now,
        expiresAt,
      });

      // Send transactional verification email via Resend
      const mailResult = await sendAccountDeletionVerificationEmail({
        to: normalizedEmail,
        userName: targetUserRecord.name || 'Estudiante',
        verificationToken: rawToken,
        trackingId,
        expiresMinutes: 30,
      });

      console.log('[PUBLIC DELETION EMAIL DISPATCH]', {
        email: normalizedEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        success: mailResult.success,
        trackingId,
      });
    }

    // 3. Anti-enumeration response: always return identical success message
    res.json({
      success: true,
      message: 'Si el correo electrónico coincide con una cuenta activa en EcoViG, hemos enviado un enlace de confirmación seguro para verificar tu identidad.',
      trackingId: trackingIdForResponse,
    });
  } catch (error: any) {
    console.error('Error in POST /api/public/account-deletion-request:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de eliminación' });
  }
});

/**
 * Endpoint: POST /api/public/verify-deletion-token
 * 🌐 VERIFY PUBLIC DELETION LINK AND SUBMIT FORMAL DELETION REQUEST
 */
app.post('/api/public/verify-deletion-token', async (req: express.Request, res: express.Response) => {
  const { token, tracking } = req.body;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Token de confirmación ausente o inválido.' });
    return;
  }

  const tokenHash = hashPublicDeletionToken(token.trim());
  const now = Date.now();

  try {
    const tokenDocRef = firestoreDb.collection('publicDeletionTokens').doc(tokenHash);
    const tokenDoc = await tokenDocRef.get();

    if (!tokenDoc.exists) {
      res.status(404).json({ error: 'El enlace de confirmación es inválido o ya ha sido utilizado.' });
      return;
    }

    const tokenData = tokenDoc.data() || {};

    if (tokenData.expiresAt < now) {
      res.status(400).json({ error: 'El enlace de confirmación ha expirado. Por favor, solicita uno nuevo.' });
      return;
    }

    if (tokenData.status === 'verified' || tokenData.status === 'used') {
      res.status(400).json({ error: 'Este enlace de confirmación ya fue procesado anteriormente.' });
      return;
    }

    // Invalidate the public token to prevent replay
    await tokenDocRef.update({
      status: 'used',
      usedAt: now,
    });

    const uid = tokenData.userId;
    const trackingId = tokenData.trackingId || `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Check if user already has an active deletion request in accountDeletionRequests
    const existingSnap = await firestoreDb.collection('accountDeletionRequests')
      .where('userId', '==', uid)
      .get();

    const activeExisting = existingSnap.docs.find(d => {
      const st = d.data().status;
      return st === 'pending' || st === 'approved' || st === 'processing' || st === 'verified' || st === 'in_progress';
    });

    if (activeExisting) {
      // Update with verified timestamp and source
      await activeExisting.ref.update({
        verifiedAt: now,
        source: 'public_web',
        updatedAt: now,
      });

      res.json({
        success: true,
        message: 'Tu identidad ha sido verificada con éxito. Tu solicitud de eliminación se encuentra en trámite activo.',
        trackingId,
        request: { id: activeExisting.id, ...activeExisting.data() }
      });
      return;
    }

    // Resolve teacher name
    let teacherName: string | null = null;
    if (tokenData.teacherId) {
      try {
        const tDoc = await firestoreDb.collection('users').doc(tokenData.teacherId).get();
        if (tDoc.exists) teacherName = tDoc.data()?.name || null;
      } catch (e) {
        // ignore
      }
    }

    const requestId = `del_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRequest = {
      id: requestId,
      userId: uid,
      userName: tokenData.userName || 'Estudiante',
      userEmail: tokenData.userEmail || '',
      type: 'account_deletion',
      source: 'public_web',
      teacherId: tokenData.teacherId || null,
      teacherName,
      schoolId: tokenData.schoolId || null,
      schoolName: tokenData.schoolName || null,
      status: 'verified', // Identity verified via email
      trackingId,
      reason: tokenData.reason || '',
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await firestoreDb.collection('accountDeletionRequests').doc(requestId).set(newRequest);

    await firestoreDb.collection('users').doc(uid).update({
      accountDeletionRequested: true,
      activeDeletionRequestId: requestId,
      updatedAt: now,
    });

    res.json({
      success: true,
      message: '¡Identidad verificada exitosamente! Tu solicitud formal de eliminación de cuenta ha sido registrada y está siendo tramitada.',
      trackingId,
      request: newRequest,
    });
  } catch (error: any) {
    console.error('Error in POST /api/public/verify-deletion-token:', error);
    res.status(500).json({ error: 'Error al verificar la solicitud de eliminación' });
  }
});

/**
 * Endpoint: GET /api/public/deletion-status/:trackingId
 * 🌐 QUERY DELETION REQUEST STATUS BY TRACKING ID (No sensitive data exposed)
 */
app.get('/api/public/deletion-status/:trackingId', async (req: express.Request, res: express.Response) => {
  const { trackingId } = req.params;

  if (!trackingId || typeof trackingId !== 'string' || trackingId.trim().length < 4) {
    res.status(400).json({ error: 'Código de seguimiento no válido.' });
    return;
  }

  const cleanTracking = trackingId.trim().toUpperCase();

  try {
    const snap = await firestoreDb.collection('accountDeletionRequests')
      .where('trackingId', '==', cleanTracking)
      .limit(1)
      .get();

    if (snap.empty) {
      // Check in public tokens collection for pending verification
      const tokenSnap = await firestoreDb.collection('publicDeletionTokens')
        .where('trackingId', '==', cleanTracking)
        .limit(1)
        .get();

      if (!tokenSnap.empty) {
        const tokenDoc = tokenSnap.docs[0].data();
        res.json({
          success: true,
          status: 'pending_verification',
          statusLabel: 'Pendiente de verificación por correo',
          type: 'account_deletion',
          createdAt: tokenDoc.createdAt,
          message: 'Se envió un correo de confirmación. Revisa tu bandeja de entrada o spam para confirmar la solicitud.'
        });
        return;
      }

      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'No se encontró ninguna solicitud asociada a este código de seguimiento.'
      });
      return;
    }

    const data = snap.docs[0].data();
    let statusLabel = 'En trámite';
    let message = 'Tu solicitud está siendo revisada conforme a las políticas de privacidad.';

    switch (data.status) {
      case 'pending':
        statusLabel = 'Pendiente de revisión';
        message = 'La solicitud fue registrada y se encuentra en espera de revisión administrativa.';
        break;
      case 'pending_verification':
        statusLabel = 'Pendiente de verificación';
        message = 'En espera de que el titular confirme el enlace enviado a su correo.';
        break;
      case 'verified':
        statusLabel = 'Identidad verificada';
        message = 'Identidad del titular confirmada exitosamente. Lista para trámite final.';
        break;
      case 'approved':
        statusLabel = 'En trámite de baja';
        message = 'Solicitud aprobada y en cola para ejecución segura de eliminación.';
        break;
      case 'processing':
        statusLabel = 'Procesando purga de datos';
        message = 'Ejecutando la eliminación definitiva de datos y registros asociados.';
        break;
      case 'completed':
        statusLabel = 'Eliminación completada';
        message = 'La cuenta y los datos personales asociados han sido eliminados de forma definitiva.';
        break;
      case 'cancelled':
        statusLabel = 'Cancelada por el titular';
        message = 'La solicitud fue cancelada por el usuario.';
        break;
      case 'rejected':
        statusLabel = 'No aprobada';
        message = 'La solicitud fue revisada con observaciones administrativas.';
        break;
      case 'requires_admin_review':
        statusLabel = 'En revisión administrativa central';
        message = 'La solicitud se encuentra en supervisión directa por la administración de EcoViG.';
        break;
    }

    // 🔒 PRIVACY GUARANTEE: Never leak name, email, school, notes, or internal IDs in public status
    res.json({
      success: true,
      status: data.status,
      statusLabel,
      type: data.type || 'account_deletion',
      createdAt: data.createdAt,
      message,
    });
  } catch (error: any) {
    console.error('Error querying public deletion status:', error);
    res.status(500).json({ error: 'Error al consultar el estado de la solicitud' });
  }
});

/**
 * 🔒 AUTHORITATIVE PASSWORD RECOVERY & STATE MACHINE SYSTEM (BioOne Security Model)
 * - HMAC-SHA256 hashed OTPs (No plaintext OTP in Firestore)
 * - Server-side AUTH_SECRET
 * - 10-Minute OTP expiration (Server authoritative time: OTP_TTL_MS = 600000)
 * - 5-Minute Reset Session expiration (RESET_SESSION_TTL_MS = 300000)
 * - 25-Second Concurrency Processing Lock (PROCESSING_LOCK_MS = 25000)
 * - Distributed persistent rate limiting in Firestore (password_reset_email_*, password_reset_ip_*)
 * - Cryptographic high-entropy resetSessionToken (crypto.randomBytes(32), stored as tokenHash only)
 * - State machine: active -> processing -> completed with concurrency locks and abandoned lock recovery
 * - Authoritative Firebase Auth password update & adminAuth.revokeRefreshTokens(uid)
 * - Strict anti-enumeration responses and no sensitive data in logs
 */

const OTP_TTL_MS = 10 * 60 * 1000; // Exactly 600,000 ms (10 minutes)
const RESET_SESSION_TTL_MS = 5 * 60 * 1000; // Exactly 300,000 ms (5 minutes)
const PROCESSING_LOCK_MS = 25 * 1000; // Exactly 25,000 ms (25 seconds)
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // Exactly 60,000 ms (60 seconds)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // Exactly 900,000 ms (15 minutes)
const RATE_LIMIT_MAX_EMAIL_REQUESTS = 5;
const RATE_LIMIT_MAX_IP_REQUESTS = 30;

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.FIREBASE_AUTH_SECRET;
if (!AUTH_SECRET) throw new Error('AUTH_SECRET environment variable is required');

function computeOtpHmac(resetId: string, email: string, otp: string): string {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${resetId}:${email.toLowerCase().trim()}:${otp.trim()}`)
    .digest('hex');
}

function computeTokenHmac(sessionId: string, rawToken: string): string {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${sessionId}:${rawToken.trim()}`)
    .digest('hex');
}

function safeCompareHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

async function enforcePersistentRateLimit(
  type: 'email' | 'ip',
  identifier: string,
  options: { cooldownMs?: number; maxRequests: number; windowMs: number }
): Promise<{ allowed: boolean; retryAfterSeconds?: number; reason?: 'COOLDOWN' | 'MAX_REQUESTS' }> {
  const now = Date.now();
  const safeHash = crypto.createHash('sha256').update(identifier.toLowerCase().trim()).digest('hex').substring(0, 32);
  const docId = type === 'email' ? `password_reset_email_${safeHash}` : `password_reset_ip_${safeHash}`;
  const docRef = firestoreDb.collection('rateLimits').doc(docId);

  return await firestoreDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(docRef);
    const data = snap.exists ? (snap.data() || {}) : null;

    if (data) {
      // 1. Check strict cooldown (e.g. 60s for email)
      if (options.cooldownMs && data.lastRequestAt) {
        const timeSinceLast = now - Number(data.lastRequestAt);
        if (timeSinceLast < options.cooldownMs) {
          const remainingCooldown = Math.max(1, Math.ceil((options.cooldownMs - timeSinceLast) / 1000));
          return { allowed: false, retryAfterSeconds: remainingCooldown, reason: 'COOLDOWN' };
        }
      }

      // 2. Check window limits (e.g. 5 req / 15 min)
      const windowStart = Number(data.windowStart || now);
      if (now - windowStart < options.windowMs) {
        const currentCount = Number(data.requestCount || 0);
        if (currentCount >= options.maxRequests) {
          const remainingWindow = Math.max(1, Math.ceil((options.windowMs - (now - windowStart)) / 1000));
          return { allowed: false, retryAfterSeconds: remainingWindow, reason: 'MAX_REQUESTS' };
        }

        transaction.update(docRef, {
          requestCount: currentCount + 1,
          lastRequestAt: now,
          updatedAt: now,
        });
        return { allowed: true };
      }
    }

    // New window or fresh record
    transaction.set(docRef, {
      type,
      windowStart: now,
      lastRequestAt: now,
      requestCount: 1,
      updatedAt: now,
    });
    return { allowed: true };
  });
}

/**
 * Endpoint: POST /api/auth/forgot-password
 * 🔒 REQUEST STEP (Persistent Rate Limit + Anti-Enumeration + HMAC-Hashed OTP)
 */
app.post('/api/auth/forgot-password', async (req: express.Request, res: express.Response) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
    return;
  }

  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

  try {
    // 🔒 1. Persistent Rate limit by IP (Max 30 requests per 15 minutes) - Enforced unconditionally
    const ipLimit = await enforcePersistentRateLimit('ip', clientIp, {
      maxRequests: RATE_LIMIT_MAX_IP_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });

    if (!ipLimit.allowed) {
      res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Has superado el límite de solicitudes. Por favor espera unos minutos antes de intentar de nuevo.',
        retryAfter: ipLimit.retryAfterSeconds,
      });
      return;
    }

    // 🔒 2. Persistent Rate limit by Email (60s cooldown + Max 5 requests per 15 min) - Enforced unconditionally
    // Crucial for anti-enumeration: rate limit state is registered BEFORE & REGARDLESS of email existence
    const emailLimit = await enforcePersistentRateLimit('email', normalizedEmail, {
      cooldownMs: RATE_LIMIT_COOLDOWN_MS,
      maxRequests: RATE_LIMIT_MAX_EMAIL_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });

    if (!emailLimit.allowed) {
      if (emailLimit.reason === 'COOLDOWN') {
        res.status(429).json({
          error: 'RATE_LIMIT_COOLDOWN',
          message: `Por favor espera ${emailLimit.retryAfterSeconds} segundos antes de solicitar otro código.`,
          retryAfter: emailLimit.retryAfterSeconds,
        });
        return;
      }
      res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Has superado el límite de solicitudes para este correo. Por favor espera unos minutos.',
        retryAfter: emailLimit.retryAfterSeconds,
      });
      return;
    }

    // 3. Lookup user in Firebase Authentication authoritatively (Strict Single Source of Truth)
    let userRecord: any = null;
    let authResolved = false;
    try {
      userRecord = await adminAuth.getUserByEmail(normalizedEmail);
      authResolved = !!(userRecord && userRecord.uid);
    } catch (authErr: any) {
      if (authErr.code === 'auth/user-not-found') {
        // Expected anti-enumeration path: user is not registered in Firebase Auth
        authResolved = false;
      } else {
        // Log exact error for server diagnostics (e.g. Identity Toolkit API / IAM permissions)
        console.error('[Recovery] Firebase Auth getUserByEmail lookup error:', authErr.code, authErr.message);
      }
    }

    // 4. If authoritative user exists in Firebase Auth, proceed with OTP generation & delivery
    if (userRecord && userRecord.uid) {
      const targetUid = userRecord.uid;
      const targetEmail = String(userRecord.email || '').trim().toLowerCase();

      // Strict sanity check: resolved email must strictly match requested email
      if (targetEmail !== normalizedEmail) {
        console.error('[PASSWORD RESET ROUTING] Inconsistency detected: resolved email does not match requested email');
      } else {
        const requestedDomain = normalizedEmail.split('@')[1] || 'unknown';
        const resolvedDomain = targetEmail.split('@')[1] || 'unknown';

        console.log('[PASSWORD RESET ROUTING]', {
          requestedEmailDomain: requestedDomain,
          firebaseAuthResolved: true,
          resolvedEmailDomain: resolvedDomain,
          recipientEmailDomain: resolvedDomain,
          uidResolved: true,
        });

        const rawOtp = crypto.randomInt(100000, 1000000).toString();
        const createdAt = Date.now();
        const expiresAt = createdAt + OTP_TTL_MS; // Exactly 600,000 ms (10 minutes)
        const resetId = `rst_${createdAt}_${crypto.randomBytes(8).toString('hex')}`;
        const otpHash = computeOtpHmac(resetId, normalizedEmail, rawOtp);

        // Invalidate any existing active OTP codes for this email
        const oldCodesSnap = await firestoreDb.collection('passwordResetCodes')
          .where('email', '==', normalizedEmail)
          .where('status', '==', 'active')
          .get();

        const batch = firestoreDb.batch();
        oldCodesSnap.docs.forEach((d) => {
          batch.update(d.ref, {
            status: 'invalidated',
            invalidatedReason: 'superseded_by_new_request',
            invalidatedAt: createdAt,
            updatedAt: createdAt,
          });
        });

        // 🔒 Save ONLY the HMAC-SHA256 hash in Firestore. NO raw plaintext OTP is ever stored!
        const codeRef = firestoreDb.collection('passwordResetCodes').doc(resetId);
        batch.set(codeRef, {
          id: resetId,
          uid: targetUid,
          email: targetEmail,
          otpHash, // HMAC-SHA256 with server AUTH_SECRET
          createdAt,
          expiresAt,
          attempts: 0,
          maxAttempts: 5,
          status: 'active', // active -> verified -> completed / invalidated
        });

        await batch.commit();

        // 🔒 Dispatch transactional email via Resend strictly to targetEmail
        const mailResult = await sendPasswordResetOtp({
          to: targetEmail,
          otp: rawOtp,
          expiresMinutes: 10,
        });

        console.log('[PASSWORD RESET ROUTING]', {
          resendAccepted: mailResult.success,
          providerMessageId: mailResult.id || null,
        });

        if (!mailResult.success) {
          // If delivery fails, mark OTP as delivery_failed so an undelivered code cannot be used
          console.warn(`[PASSWORD RESET EMAIL] Delivery failure for user ${targetUid.substring(0, 6)}... (error: ${mailResult.error || 'unknown'})`);
          await codeRef.update({
            status: 'delivery_failed',
            deliveryError: mailResult.error || 'resend_delivery_failed',
            updatedAt: Date.now(),
          }).catch(() => {});
        }
      }
    }

    // 5. Anti-enumeration response: identical output regardless of email existence or delivery status
    res.json({
      success: true,
      message: 'Si el correo está registrado en EcoViG, recibirás un código de 6 dígitos para restablecer tu contraseña.',
      cooldown: 60,
      expiresIn: 600,
    });
  } catch (error: any) {
    console.error('Error in POST /api/auth/forgot-password:', error.message);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de recuperación' });
  }
});

/**
 * Endpoint: POST /api/auth/verify-reset-code
 * 🔒 VERIFY STEP (Timing-safe HMAC comparison + Max 5 attempts + Reset Session Token)
 */
app.post('/api/auth/verify-reset-code', async (req: express.Request, res: express.Response) => {
  const { email, code } = req.body;
  const normalizedEmail = (email || '').toLowerCase().trim();
  const trimmedCode = (code || '').toString().trim();

  if (!normalizedEmail || !trimmedCode || trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
    res.status(400).json({ error: 'Debes proporcionar tu correo y el código numérico de 6 dígitos.' });
    return;
  }

  try {
    const now = Date.now();
    const codesSnap = await firestoreDb.collection('passwordResetCodes')
      .where('email', '==', normalizedEmail)
      .where('status', '==', 'active')
      .get();

    if (codesSnap.empty) {
      res.status(400).json({
        error: 'INVALID_OR_EXPIRED_CODE',
        message: 'El código ingresado no existe o ya ha expirado. Solicita uno nuevo.',
      });
      return;
    }

    // Find active valid code by server expiration time
    const validDocs = codesSnap.docs
      .map((d) => ({ ref: d.ref, ...(d.data() as any) }))
      .filter((d) => d.expiresAt > now)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (validDocs.length === 0) {
      res.status(400).json({
        error: 'EXPIRED_CODE',
        message: 'El código de 6 dígitos ha expirado (validez de 10 minutos). Solicita un nuevo código.',
      });
      return;
    }

    const activeDoc = validDocs[0];

    // Check maximum attempts limit (5 attempts max)
    if ((activeDoc.attempts || 0) >= (activeDoc.maxAttempts || 5)) {
      await activeDoc.ref.update({
        status: 'invalidated',
        invalidatedReason: 'max_attempts_exceeded',
        updatedAt: now,
      });
      res.status(400).json({
        error: 'TOO_MANY_ATTEMPTS',
        message: 'Has superado el número máximo de intentos con este código. Solicita uno nuevo por seguridad.',
      });
      return;
    }

    // Timing-safe HMAC calculation and comparison
    const candidateHash = computeOtpHmac(activeDoc.id, normalizedEmail, trimmedCode);
    const isValidMatch = safeCompareHex(candidateHash, activeDoc.otpHash);

    if (!isValidMatch) {
      const newAttempts = (activeDoc.attempts || 0) + 1;
      const isNowInvalidated = newAttempts >= (activeDoc.maxAttempts || 5);

      await activeDoc.ref.update({
        attempts: newAttempts,
        status: isNowInvalidated ? 'invalidated' : 'active',
        invalidatedReason: isNowInvalidated ? 'max_attempts_exceeded' : undefined,
        updatedAt: now,
      });

      if (isNowInvalidated) {
        res.status(400).json({
          error: 'TOO_MANY_ATTEMPTS',
          message: 'Has superado el número máximo de 5 intentos fallidos. El código ha sido invalidado.',
        });
        return;
      }

      res.status(400).json({
        error: 'WRONG_CODE',
        message: `Código incorrecto. Te quedan ${5 - newAttempts} intento(s).`,
        remainingAttempts: 5 - newAttempts,
      });
      return;
    }

    // 🔒 Code Verified: Mark code as verified & create high-entropy reset session
    const rawResetToken = crypto.randomBytes(32).toString('hex'); // 256-bit cryptographic entropy
    const sessionId = `sess_${now}_${crypto.randomBytes(8).toString('hex')}`;
    const tokenHash = computeTokenHmac(sessionId, rawResetToken);
    const sessionExpiresAt = now + RESET_SESSION_TTL_MS; // Exactly 300,000 ms (5 minutes)

    const batch = firestoreDb.batch();

    // Mark OTP as verified
    batch.update(activeDoc.ref, {
      status: 'verified',
      verifiedAt: now,
      updatedAt: now,
    });

    // 🔒 Store ONLY tokenHash in Firestore passwordResetSessions. NO raw token is ever stored!
    const sessionRef = firestoreDb.collection('passwordResetSessions').doc(sessionId);
    batch.set(sessionRef, {
      sessionId,
      resetId: activeDoc.id,
      uid: activeDoc.uid,
      email: normalizedEmail,
      tokenHash,
      status: 'active', // active -> processing -> completed
      createdAt: now,
      expiresAt: sessionExpiresAt,
      processingStartedAt: null,
      operationId: null,
      completedAt: null,
      updatedAt: now,
    });

    await batch.commit();

    res.json({
      success: true,
      resetSessionId: sessionId,
      sessionId,
      resetSessionToken: rawResetToken,
      resetToken: rawResetToken, // Sent only once to client over HTTPS
      expiresIn: 300,
      message: 'Código de 6 dígitos verificado exitosamente. Procede a ingresar tu nueva contraseña.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/auth/verify-reset-code:', error.message);
    res.status(500).json({ error: 'Error interno al verificar el código de restablecimiento' });
  }
});

/**
 * Endpoint: POST /api/auth/reset-password
 * 🔒 CONFIRM STEP (State Machine active -> processing -> completed, Concurrency Lock, revokeRefreshTokens)
 */
app.post('/api/auth/reset-password', async (req: express.Request, res: express.Response) => {
  const {
    sessionId: inputSessionId,
    resetSessionId,
    resetToken: inputResetToken,
    resetSessionToken,
    newPassword
  } = req.body;
  
  // Note: Client email or UID (if sent) is completely IGNORED for security.
  // targetUid is retrieved exclusively and authoritatively from the validated passwordResetSessions document in Firestore.
  const effectiveSessionId = (resetSessionId || inputSessionId || '').toString().trim();
  const effectiveResetToken = (resetSessionToken || inputResetToken || '').toString().trim();

  if (!effectiveSessionId || !effectiveResetToken || !newPassword) {
    res.status(400).json({ error: 'resetSessionId, resetSessionToken y newPassword son requeridos para actualizar la contraseña.' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  try {
    const now = Date.now();
    let targetSessionDoc: any = null;
    const targetSessionId = effectiveSessionId;

    // 1. Authoritatively locate session document strictly by ID
    const snap = await firestoreDb.collection('passwordResetSessions').doc(targetSessionId).get();
    if (snap.exists) {
      targetSessionDoc = { ref: snap.ref, ...(snap.data() as any) };
    }

    if (!targetSessionDoc) {
      res.status(400).json({
        error: 'INVALID_RESET_SESSION',
        message: 'La sesión de restablecimiento es inválida o no fue encontrada.',
      });
      return;
    }

    // 2. Validate token hash & expiration
    const expectedTokenHash = computeTokenHmac(targetSessionId, effectiveResetToken);
    if (!safeCompareHex(expectedTokenHash, targetSessionDoc.tokenHash)) {
      res.status(400).json({
        error: 'INVALID_RESET_TOKEN',
        message: 'El token de restablecimiento es inválido o no corresponde a esta sesión.',
      });
      return;
    }

    if (targetSessionDoc.expiresAt < now) {
      res.status(400).json({
        error: 'EXPIRED_SESSION',
        message: 'La sesión de restablecimiento ha expirado (validez de 5 minutos). Por favor inicia el proceso nuevamente.',
      });
      return;
    }

    if (targetSessionDoc.status === 'completed') {
      res.status(400).json({
        error: 'SESSION_ALREADY_USED',
        message: 'Esta sesión de restablecimiento ya fue completada exitosamente.',
      });
      return;
    }

    const sessionRef = firestoreDb.collection('passwordResetSessions').doc(targetSessionId);
    const operationId = crypto.randomBytes(16).toString('hex');
    const lockAcquiredAt = Date.now();

    // 🔒 3. STATE MACHINE STEP 1: Acquire exclusive processing lock in atomic transaction
    await firestoreDb.runTransaction(async (transaction) => {
      const freshSnap = await transaction.get(sessionRef);
      if (!freshSnap.exists) throw new Error('SESSION_NOT_FOUND');
      const freshData = freshSnap.data() as any;

      if (freshData.status === 'completed') {
        throw new Error('SESSION_ALREADY_USED');
      }

      if (freshData.expiresAt < Date.now()) {
        throw new Error('SESSION_EXPIRED');
      }

      // Check active concurrency lock (PROCESSING_LOCK_MS = 25000 ms)
      if (freshData.status === 'processing') {
        const lockAge = Date.now() - (freshData.processingStartedAt || 0);
        if (lockAge < PROCESSING_LOCK_MS) {
          // Concurrency lock active (within 25s window)
          throw new Error('CONCURRENT_PROCESSING_LOCK');
        }
        // Abandoned lock recovery (> 25s): allowed
      }

      transaction.update(sessionRef, {
        status: 'processing',
        processingStartedAt: lockAcquiredAt,
        operationId,
        updatedAt: lockAcquiredAt,
      });
    });

    const targetUid = targetSessionDoc.uid;
    if (!targetUid) {
      res.status(400).json({ error: 'No se encontró la cuenta asociada al restablecimiento.' });
      return;
    }

    // 🔒 4. STATE MACHINE STEP 2: Authoritative Firebase Auth Password Update & Session Revocation
    try {
      await adminAuth.updateUser(targetUid, {
        password: newPassword,
      });

      // 🔒 Revoke all existing refresh tokens for this user
      await adminAuth.revokeRefreshTokens(targetUid);
    } catch (authError: any) {
      // On Firebase Auth failure: safely release processing lock so user can retry
      console.error('[Recovery] Firebase Auth updateUser failed:', authError.message);
      await sessionRef.update({
        status: 'active',
        processingStartedAt: null,
        operationId: null,
        lastError: authError.message || 'auth_failure',
        updatedAt: Date.now(),
      }).catch(() => {});

      res.status(500).json({
        error: 'AUTH_UPDATE_FAILED',
        message: 'No fue posible actualizar la contraseña en Firebase Authentication. Intenta de nuevo.',
      });
      return;
    }

    // 🔒 5. STATE MACHINE STEP 3: Mark session completed and invalidate OTP permanently
    const finalNow = Date.now();
    const batch = firestoreDb.batch();

    batch.update(sessionRef, {
      status: 'completed',
      completedAt: finalNow,
      updatedAt: finalNow,
    });

    if (targetSessionDoc.resetId) {
      const codeRef = firestoreDb.collection('passwordResetCodes').doc(targetSessionDoc.resetId);
      batch.update(codeRef, {
        status: 'completed',
        usedAt: finalNow,
        updatedAt: finalNow,
      });
    }

    await batch.commit();

    res.json({
      success: true,
      message: '¡Tu contraseña ha sido actualizada con éxito en Firebase Authentication! Ya puedes iniciar sesión con tus nuevas credenciales.',
    });
  } catch (error: any) {
    if (error.message === 'CONCURRENT_PROCESSING_LOCK') {
      res.status(409).json({
        error: 'CONCURRENT_REQUEST',
        message: 'Ya hay una solicitud de actualización en proceso para esta sesión. Por favor espera un momento.',
      });
      return;
    }
    if (error.message === 'SESSION_ALREADY_USED') {
      res.status(400).json({
        error: 'SESSION_ALREADY_USED',
        message: 'Esta sesión de restablecimiento ya fue utilizada.',
      });
      return;
    }
    if (error.message === 'SESSION_EXPIRED') {
      res.status(400).json({
        error: 'EXPIRED_SESSION',
        message: 'La sesión de restablecimiento ha expirado. Solicita un nuevo código.',
      });
      return;
    }

    console.error('Error in POST /api/auth/reset-password:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar la contraseña' });
  }
});

/**
 * Endpoint: POST /api/user/world-layout
 * 🔒 STUDENT SAVE CUSTOM WORLD LAYOUT POSITIONS WITH STRICT AUTHORITATIVE SECURITY
 */
app.post('/api/user/world-layout', authenticateFirebaseUser, async (req: express.Request, res: express.Response) => {
  const authenticatedUser = (req as any).user;
  const uid = authenticatedUser.uid;
  const { biomeId, layout } = req.body;

  if (!uid) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  // 🔒 Gating: Student must be fully onboarded
  const onboardCheck = await requireFullyOnboardedStudent(uid);
  if (!onboardCheck.authorized) {
    res.status(onboardCheck.errorStatus || 403).json(onboardCheck.errorPayload);
    return;
  }

  if (!biomeId || typeof biomeId !== 'string' || typeof layout !== 'object' || layout === null || Array.isArray(layout)) {
    res.status(400).json({ error: 'biomeId (string) y layout (objeto) son requeridos' });
    return;
  }

  try {
    const userRef = firestoreDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userData = userDoc.data() || {};

    // 🔒 1. DERIVE AUTHORITATIVE ALLOWED OBJECT IDS
    // Student can only position elements they actually own/unlocked
    const eco = userData.ecosystem || { trees: 1, water: 0, animals: 0 };
    const allowedObjectIds = new Set<string>();

    if (eco.trees > 0) allowedObjectIds.add('base_tree_1');
    if (eco.trees > 1) allowedObjectIds.add('base_tree_2');
    if (eco.trees > 2) allowedObjectIds.add('base_tree_3');
    if (eco.water > 0) allowedObjectIds.add('base_water');
    if (eco.animals > 0) allowedObjectIds.add('base_animal');

    // Unlocked and active store decorations
    const unlockedDecorations: string[] = Array.isArray(userData.unlockedDecorations) ? userData.unlockedDecorations : [];
    const activeDecorationsMap = userData.activeDecorations || {};
    const activeForBiome: string[] = Array.isArray(activeDecorationsMap[biomeId]) 
      ? activeDecorationsMap[biomeId] 
      : (Array.isArray(activeDecorationsMap) ? activeDecorationsMap : []);

    activeForBiome.forEach((itemId, idx) => {
      if (unlockedDecorations.includes(itemId)) {
        allowedObjectIds.add(`dec_${itemId}_${idx}`);
      }
    });

    // 🔒 2. BOUNDARY CONSTRAINTS & SANITIZATION
    const minX = 6, maxX = 94;
    const minY = 4, maxY = 42;

    const sanitizedLayout: Record<string, { x: number; y: number }> = {};

    for (const [key, rawPos] of Object.entries(layout)) {
      // Must be an authorized objectId
      if (!allowedObjectIds.has(key)) {
        continue; // Discard unauthorized or injected items
      }

      if (rawPos && typeof rawPos === 'object') {
        const rawX = (rawPos as any).x;
        const rawY = (rawPos as any).y;

        if (typeof rawX === 'number' && Number.isFinite(rawX) && !Number.isNaN(rawX) &&
            typeof rawY === 'number' && Number.isFinite(rawY) && !Number.isNaN(rawY)) {
          
          const clampedX = Math.max(minX, Math.min(maxX, Math.round(rawX * 10) / 10));
          const clampedY = Math.max(minY, Math.min(maxY, Math.round(rawY * 10) / 10));
          sanitizedLayout[key] = { x: clampedX, y: clampedY };
        }
      }
    }

    const now = Date.now();
    await userRef.update({
      [`worldLayouts.${biomeId}`]: sanitizedLayout,
      updatedAt: now,
    });

    res.json({
      success: true,
      message: 'Distribución de Mi Mundo validada y guardada exitosamente.',
      worldLayouts: {
        ...(userData.worldLayouts || {}),
        [biomeId]: sanitizedLayout,
      }
    });
  } catch (error: any) {
    console.error('Error saving world layout:', error);
    res.status(500).json({ error: 'Error al guardar la distribución del mundo' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Vite dev server mounting or static production build
async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 EcoVig full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
