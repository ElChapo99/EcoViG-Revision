import { auth } from './firebase';
import { getAuthHeader } from './authHeader';
import { apiFetch, safeReadJson } from './apiClient';
import { AccountDeletionRequest } from '../types';

/**
 * 🔒 El estudiante solicita la baja académica o la eliminación de su cuenta y datos personales.
 */
export async function createAccountDeletionRequest(
  reason?: string,
  type: 'account_deletion' | 'academic_withdrawal' = 'account_deletion'
): Promise<AccountDeletionRequest> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/account/deletion-request', {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason, type }),
  });

  const data = await safeReadJson<{ success: boolean; request: AccountDeletionRequest }>(
    res, 
    'No pudimos procesar la solicitud en este momento. Inténtalo nuevamente.'
  );

  if (!data.success || !data.request) {
    throw new Error('No se pudo confirmar la creación de la solicitud. Inténtalo nuevamente.');
  }
  return data.request;
}

/**
 * 🔒 Consulta la solicitud activa del estudiante autenticado desde el backend autoritativo.
 */
export async function fetchActiveDeletionRequest(): Promise<AccountDeletionRequest | null> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/account/deletion-request', { headers });

  const data = await safeReadJson<{ request?: AccountDeletionRequest }>(
    res, 
    'No pudimos consultar el estado de tu solicitud. Inténtalo nuevamente.'
  );

  return data.request || null;
}

/**
 * 🔒 Cancela una solicitud en estado 'pending' o 'pending_verification' a través del backend autoritativo.
 */
export async function cancelAccountDeletionRequest(): Promise<AccountDeletionRequest> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/account/deletion-request/cancel', {
    method: 'POST',
    headers,
  });

  const data = await safeReadJson<{ success: boolean; request: AccountDeletionRequest }>(
    res, 
    'No pudimos cancelar la solicitud en este momento. Inténtalo nuevamente.'
  );

  if (!data.success || !data.request) {
    throw new Error('No se pudo confirmar la cancelación de la solicitud.');
  }
  return data.request;
}

/**
 * 🌐 Envía solicitud pública de eliminación de cuenta (vía correo de verificación).
 * No revela si la cuenta existe o no (anti-enumeración).
 */
export async function submitPublicDeletionRequest(email: string, reason?: string): Promise<{
  success: boolean;
  message: string;
  trackingId?: string;
}> {
  const res = await apiFetch('/api/public/account-deletion-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, reason }),
  });

  return await safeReadJson<{ success: boolean; message: string; trackingId?: string }>(
    res,
    'No se pudo registrar la solicitud en este momento. Inténtalo más tarde.'
  );
}

/**
 * 🌐 Confirma el enlace de verificación de eliminación recibido por correo.
 */
export async function verifyPublicDeletionToken(token: string, tracking: string): Promise<{
  success: boolean;
  message: string;
  request?: AccountDeletionRequest;
}> {
  const res = await apiFetch('/api/public/verify-deletion-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, tracking }),
  });

  return await safeReadJson<{ success: boolean; message: string; request?: AccountDeletionRequest }>(
    res,
    'No se pudo validar el enlace de confirmación.'
  );
}

/**
 * 🌐 Consulta el estado público de una solicitud mediante su ID de seguimiento.
 */
export async function queryPublicDeletionStatus(trackingId: string): Promise<{
  success: boolean;
  status?: string;
  statusLabel?: string;
  type?: string;
  createdAt?: number;
  message?: string;
}> {
  const res = await apiFetch(`/api/public/deletion-status/${encodeURIComponent(trackingId.trim())}`);
  return await safeReadJson<{
    success: boolean;
    status?: string;
    statusLabel?: string;
    type?: string;
    createdAt?: number;
    message?: string;
  }>(res, 'No se pudo consultar el estado de la solicitud.');
}

/**
 * 🔒 El docente consulta las solicitudes de sus alumnos vinculados desde el backend autoritativo.
 */
export async function fetchTeacherDeletionRequests(): Promise<AccountDeletionRequest[]> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/teacher/deletion-requests', { headers });

  const data = await safeReadJson<{ requests?: AccountDeletionRequest[] }>(
    res, 
    'No pudimos consultar las solicitudes de tus alumnos. Inténtalo nuevamente.'
  );

  return data.requests || [];
}

/**
 * 🔒 El docente aprueba o rechaza una solicitud de su alumno mediante backend autoritativo.
 */
export async function reviewTeacherDeletionRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewNote?: string
): Promise<AccountDeletionRequest> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/teacher/deletion-requests/${encodeURIComponent(requestId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, reviewNote }),
  });

  const data = await safeReadJson<{ success: boolean; request: AccountDeletionRequest }>(
    res, 
    'No pudimos procesar la revisión de la solicitud. Inténtalo nuevamente.'
  );

  if (!data.success || !data.request) {
    throw new Error('No se pudo confirmar la revisión de la solicitud.');
  }
  return data.request;
}

/**
 * 🔒 El Creador/Admin consulta todas las solicitudes globales del sistema mediante backend autoritativo.
 */
export async function fetchAdminDeletionRequests(): Promise<AccountDeletionRequest[]> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/deletion-requests', { headers });

  const data = await safeReadJson<{ requests?: AccountDeletionRequest[] }>(
    res, 
    'No pudimos consultar las solicitudes administrativas. Inténtalo nuevamente.'
  );

  return data.requests || [];
}

/**
 * 🔒 El Creador/Admin aprueba o rechaza una solicitud mediante backend autoritativo.
 */
export async function reviewAdminDeletionRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewNote?: string
): Promise<AccountDeletionRequest> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/deletion-requests/${encodeURIComponent(requestId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, reviewNote }),
  });

  const data = await safeReadJson<{ success: boolean; request: AccountDeletionRequest }>(
    res, 
    'No pudimos registrar la revisión administrativa. Inténtalo nuevamente.'
  );

  if (!data.success || !data.request) {
    throw new Error('No se pudo confirmar la revisión de la solicitud.');
  }
  return data.request;
}

/**
 * 🔒 El Creador/Admin ejecuta la eliminación definitiva de la cuenta mediante backend autoritativo.
 */
export async function executeAdminAccountDeletion(requestId: string): Promise<{
  success: boolean;
  message: string;
  request: AccountDeletionRequest;
}> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/deletion-requests/${encodeURIComponent(requestId)}/execute`, {
    method: 'POST',
    headers,
  });

  const data = await safeReadJson<{
    success: boolean;
    message: string;
    request: AccountDeletionRequest;
  }>(res, 'No pudimos ejecutar la eliminación definitiva. Inténtalo nuevamente.');

  if (!data.success || !data.request) {
    throw new Error('No se pudo confirmar la ejecución de la eliminación.');
  }
  return data;
}
