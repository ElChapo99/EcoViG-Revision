import { auth } from './firebase';
import { getAuthHeader } from './authHeader';
import { apiFetch, safeReadJson } from './apiClient';
import { School, EducationLevel } from '../types';

/**
 * Consulta la lista de escuelas activas para selectores en registro y perfil.
 */
export async function fetchActiveSchools(): Promise<School[]> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/schools', { headers });
  const data = await safeReadJson<{ schools?: School[] }>(res, 'Error al cargar catálogo de escuelas');
  return data.schools || [];
}

/**
 * Consulta el catálogo administrativo completo con métricas de alumnos/docentes vinculados.
 */
export async function fetchAdminSchools(): Promise<{ schools: School[]; totalCount: number }> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/schools', { headers });
  const data = await safeReadJson<{ schools?: School[]; totalCount?: number }>(res, 'Error al cargar catálogo administrativo de escuelas');
  return {
    schools: data.schools || [],
    totalCount: data.totalCount || 0,
  };
}

export interface CreateSchoolPayload {
  name: string;
  educationLevel: EducationLevel;
  city?: string;
  state?: string;
  active?: boolean;
}

/**
 * Crea una nueva institución oficial en el catálogo centralizado.
 */
export async function createSchool(payload: CreateSchoolPayload): Promise<School> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/schools', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await safeReadJson<{ school: School }>(res, 'Error al crear la escuela en el catálogo');
  return data.school;
}

export interface UpdateSchoolPayload {
  name?: string;
  educationLevel?: EducationLevel;
  city?: string;
  state?: string;
  active?: boolean;
}

/**
 * Actualiza los datos de una institución o su estado activo/inactivo.
 */
export async function updateSchool(schoolId: string, payload: UpdateSchoolPayload): Promise<School> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/schools/${encodeURIComponent(schoolId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await safeReadJson<{ school: School }>(res, 'Error al actualizar la institución');
  return data.school;
}

/**
 * Asigna una escuela oficial del catálogo a la cuenta autenticada.
 */
export async function assignUserSchool(schoolId: string): Promise<{ schoolId: string; schoolName: string }> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/user/school', {
    method: 'POST',
    headers,
    body: JSON.stringify({ schoolId }),
  });

  return await safeReadJson<{ schoolId: string; schoolName: string }>(res, 'Error al asignar la escuela a tu cuenta');
}

export interface LegacyMigrationReport {
  totalUsersAudited: number;
  exactMatchesCount: number;
  ambiguousMatchesCount: number;
  unassignedCount: number;
  appliedUpdates: number;
  exactMatches: any[];
  ambiguousMatches: any[];
}

/**
 * Ejecuta una auditoría o migración no destructiva de nombres legacy a IDs oficiales.
 */
export async function migrateLegacySchools(applyMatches: boolean = false): Promise<{
  auditReport: LegacyMigrationReport;
  message: string;
}> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/schools/migrate-legacy', {
    method: 'POST',
    headers,
    body: JSON.stringify({ applyMatches }),
  });

  return await safeReadJson<{ auditReport: LegacyMigrationReport; message: string }>(res, 'Error en la auditoría de escuelas legacy');
}
