import { auth } from './firebase';
import { getAuthHeader } from './authHeader';
import { apiFetch, safeReadJson } from './apiClient';
import { 
  SurveyVersion, 
  SurveyVersionSummary, 
  ManagedSurveyQuestion, 
  SurveyCategory,
  SurveyScoreRanges,
  SurveyResults
} from '../types';

export interface AdminSurveyConfigResponse {
  currentPublishedVersion: SurveyVersion;
  activeDraftVersion: SurveyVersion | null;
  allVersions: SurveyVersionSummary[];
  officialScoreRanges?: SurveyScoreRanges;
  isFirstInitialization?: boolean;
}

export interface ActiveStudentSurveyResponse {
  versionId: string;
  versionNumber: number;
  mode: 'initial' | 'final';
  questions: ManagedSurveyQuestion[];
  isImmutable: boolean;
}

/**
 * 🔒 Obtiene la configuración general y lista de versiones para el administrador
 */
export async function fetchAdminSurveyConfig(): Promise<AdminSurveyConfigResponse> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/survey-config', {
    method: 'GET',
    headers,
  });

  const data = await safeReadJson<AdminSurveyConfigResponse>(res, 'Error al obtener la configuración de evaluaciones');
  if (data?.currentPublishedVersion) {
    if (!Array.isArray(data.currentPublishedVersion.questions)) {
      throw new Error('INVALID_SURVEY_CONFIG_RESPONSE: currentPublishedVersion.questions no es un arreglo');
    }
  }

  return data;
}

/**
 * 🔒 Crea o recupera el borrador activo basado en la última versión publicada
 */
export async function createOrGetSurveyDraft(): Promise<{ draft: SurveyVersion; createdNew: boolean }> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/survey-versions/draft', {
    method: 'POST',
    headers,
  });

  return await safeReadJson<{ draft: SurveyVersion; createdNew: boolean }>(res, 'Error al crear o recuperar el borrador');
}

/**
 * 🔒 Obtiene el detalle completo de una versión de evaluación
 */
export async function fetchSurveyVersion(versionId: string): Promise<SurveyVersion> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}`, {
    method: 'GET',
    headers,
  });

  return await safeReadJson<SurveyVersion>(res, 'Error al obtener la versión de evaluación');
}

/**
 * 🔒 Agrega una nueva pregunta al borrador
 */
export async function addSurveyQuestion(
  versionId: string, 
  data: {
    category: SurveyCategory;
    text: string;
    reverseScoring: boolean;
    imageUrl?: string | null;
  }
): Promise<{ version: SurveyVersion; newQuestion: ManagedSurveyQuestion }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/questions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  return await safeReadJson<{ version: SurveyVersion; newQuestion: ManagedSurveyQuestion }>(res, 'Error al agregar la nueva pregunta');
}

/**
 * 🔒 Actualiza una pregunta existente en el borrador
 */
export async function updateSurveyQuestion(
  versionId: string,
  questionId: string,
  updates: Partial<ManagedSurveyQuestion>
): Promise<{ version: SurveyVersion; updatedQuestion: ManagedSurveyQuestion }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/questions/${encodeURIComponent(questionId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });

  return await safeReadJson<{ version: SurveyVersion; updatedQuestion: ManagedSurveyQuestion }>(res, 'Error al actualizar la pregunta');
}

/**
 * 🔒 Elimina o retira una pregunta en el borrador
 * - Si fue creada solo en el borrador, se elimina físicamente.
 * - Si proviene de una versión publicada, se marca como retirada (retired: true).
 */
export async function deleteSurveyQuestion(
  versionId: string,
  questionId: string
): Promise<{ version: SurveyVersion; actionTaken?: string; message?: string }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/questions/${encodeURIComponent(questionId)}`, {
    method: 'DELETE',
    headers,
  });

  return await safeReadJson<{ version: SurveyVersion; actionTaken?: string; message?: string }>(res, 'Error al eliminar la pregunta');
}

/**
 * 🔒 Alias para compatibilidad
 */
export const retireSurveyQuestion = deleteSurveyQuestion;

/**
 * 🔒 Restaura una pregunta retirada en el borrador
 */
export async function restoreSurveyQuestion(
  versionId: string,
  questionId: string
): Promise<{ version: SurveyVersion }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/questions/${encodeURIComponent(questionId)}/restore`, {
    method: 'POST',
    headers,
  });

  return await safeReadJson<{ version: SurveyVersion }>(res, 'Error al restaurar la pregunta');
}

/**
 * 🔒 Consulta el banco de preguntas históricas de versiones anteriores no presentes en el borrador
 */
export async function fetchHistoricalPool(
  versionId: string
): Promise<{ historicalQuestions: ManagedSurveyQuestion[]; count: number }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/historical-pool`, {
    method: 'GET',
    headers,
  });

  return await safeReadJson<{ historicalQuestions: ManagedSurveyQuestion[]; count: number }>(res, 'Error al consultar el banco de preguntas históricas');
}

/**
 * 🔒 Reincorpora una pregunta histórica al borrador manteniendo su questionId original
 */
export async function recoverHistoricalQuestion(
  versionId: string,
  questionId: string
): Promise<{ version: SurveyVersion; message?: string }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/recover-historical/${encodeURIComponent(questionId)}`, {
    method: 'POST',
    headers,
  });

  return await safeReadJson<{ version: SurveyVersion; message?: string }>(res, 'Error al reincorporar la pregunta histórica');
}

/**
 * 🔒 Reordena las preguntas del borrador
 */
export async function reorderSurveyQuestions(
  versionId: string,
  orderedQuestionIds: string[]
): Promise<{ version: SurveyVersion }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/reorder`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ orderedQuestionIds }),
  });

  return await safeReadJson<{ version: SurveyVersion }>(res, 'Error al reordenar las preguntas');
}

/**
 * 🔒 Sube o reemplaza una imagen para una pregunta del borrador
 */
export async function uploadQuestionImage(
  versionId: string,
  questionId: string,
  file: File
): Promise<{ version: SurveyVersion; imageUrl: string }> {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Formato de imagen no permitido. Por favor selecciona un archivo PNG, JPG o WEBP.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen excede el límite máximo de 5MB.');
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });

  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/questions/${encodeURIComponent(questionId)}/image`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64: base64,
      filename: file.name,
      mimeType: file.type,
    }),
  });

  return await safeReadJson<{ version: SurveyVersion; imageUrl: string }>(res, 'Error al subir la imagen');
}

/**
 * 🔒 Quita la imagen asociada a una pregunta del borrador
 */
export async function removeQuestionImage(
  versionId: string,
  questionId: string
): Promise<{ version: SurveyVersion }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/questions/${encodeURIComponent(questionId)}/image`, {
    method: 'DELETE',
    headers,
  });

  return await safeReadJson<{ version: SurveyVersion }>(res, 'Error al quitar la imagen');
}

/**
 * 🔒 Publica el borrador como nueva versión oficial
 */
export async function publishSurveyVersion(versionId: string): Promise<{ publishedVersion: SurveyVersion; message: string }> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/survey-versions/${encodeURIComponent(versionId)}/publish`, {
    method: 'POST',
    headers,
  });

  return await safeReadJson<{ publishedVersion: SurveyVersion; message: string }>(res, 'Error al publicar la versión de evaluación');
}

/**
 * 🔒 Obtiene la versión activa de evaluación para un estudiante (Inicial o Final)
 */
export async function fetchActiveStudentSurveyVersion(mode: 'initial' | 'final' = 'initial'): Promise<ActiveStudentSurveyResponse> {
  const currentUser = auth.currentUser;
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await apiFetch(`/api/survey/active-version?mode=${mode}`, {
    method: 'GET',
    headers,
  });

  return await safeReadJson<ActiveStudentSurveyResponse>(res, 'Error al cargar las preguntas oficiales');
}
