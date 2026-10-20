import { auth } from './firebase';
import { getAuthHeader } from './authHeader';
import { apiFetch, safeReadJson, parseApiError } from './apiClient';

export interface AdminTeacher {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: 'teacher';
  schoolId?: string;
  schoolName?: string;
  linkCode?: string;
  codeUsesCount?: number;
  assignedStudentsCount?: number;
  status: 'active' | 'suspended';
  createdAt?: number;
}

export interface AdminRoleRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  requestedRole: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Consulta la lista de todos los docentes registrados mediante endpoint administrativo autoritativo.
 */
export async function fetchAdminTeachers(): Promise<AdminTeacher[]> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/teachers', { headers });
  const data = await safeReadJson<{ teachers?: AdminTeacher[] }>(res, 'Error al consultar la lista de docentes');
  return data.teachers || [];
}

/**
 * Crea un docente autoritativamente en el backend mediante Firebase Admin SDK.
 */
export async function createAdminTeacher(teacherData: {
  name: string;
  email: string;
  schoolId: string;
  linkCode?: string;
}): Promise<AdminTeacher> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/teachers', {
    method: 'POST',
    headers,
    body: JSON.stringify(teacherData),
  });

  const data = await safeReadJson<{ teacher: AdminTeacher }>(res, 'Error al crear docente en el servidor');
  return data.teacher;
}

/**
 * Regenera un código único de vinculación para un docente mediante endpoint administrativo.
 */
export async function regenerateTeacherLinkCode(teacherId: string): Promise<string> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/teachers/${encodeURIComponent(teacherId)}/regenerate-code`, {
    method: 'POST',
    headers,
  });

  const data = await safeReadJson<{ linkCode: string }>(res, 'Error al regenerar código de vinculación');
  return data.linkCode;
}

/**
 * Elimina un usuario (alumno, docente, etc.) mediante endpoint administrativo autoritativo.
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    throw await parseApiError(res, 'Error al eliminar usuario');
  }
}

/**
 * Consulta las solicitudes de cambio de rol pendientes.
 */
export async function fetchAdminRoleRequests(): Promise<AdminRoleRequest[]> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/role-requests', { headers });
  const data = await safeReadJson<{ requests?: AdminRoleRequest[] }>(res, 'Error al consultar solicitudes de rol');
  return data.requests || [];
}

/**
 * Aprueba una solicitud de rol autoritativamente en el backend.
 */
export async function approveAdminRoleRequest(requestId: string, userId: string, newRole: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/role-requests/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, newRole }),
  });

  if (!res.ok) {
    throw await parseApiError(res, 'Error al aprobar solicitud de rol');
  }
}

/**
 * Rechaza una solicitud de rol.
 */
export async function rejectAdminRoleRequest(requestId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/role-requests/${encodeURIComponent(requestId)}/reject`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    throw await parseApiError(res, 'Error al rechazar solicitud de rol');
  }
}
