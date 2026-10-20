/**
 * 🔒 EcoViG Centralized API Client & Safe Error Handler
 * 
 * Provides:
 * 1. Safe relative URL resolution with optional VITE_API_BASE_URL override for Vercel/Cloud Run.
 * 2. Guaranteed safe JSON parsing: verifies Content-Type BEFORE attempting JSON deserialization.
 * 3. Prevention of "Unexpected token '<', '<!doctype '..." syntax errors when receiving HTML.
 * 4. Security-conscious error diagnosis distinguishing HTTP 404, 401, 403, 500 and network drops.
 * 5. Zero exposure of internal stack traces, tokens or raw HTML to client UI.
 */

/**
 * Resolves an API endpoint path.
 * Defaults to relative path (e.g. "/api/admin/survey-config") which is proxied
 * by Vercel's rewrite rule in vercel.json to the authoritative Cloud Run backend.
 * Optionally allows setting VITE_API_BASE_URL if direct cross-origin access is required.
 */
export function resolveApiUrl(path: string): string {
  const customBase = (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.trim();
  if (customBase) {
    const cleanBase = customBase.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  return path;
}

/**
 * Analyzes an HTTP error response and constructs a human-readable, safe Error.
 * Distinguishes 404, 401, 403, 500 without leaking credentials, HTML or database structures.
 */
export async function parseApiError(res: Response, fallbackMessage: string): Promise<Error> {
  let customError = '';

  try {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (typeof data?.error === 'string' && data.error.trim() && data.error !== 'Error desconocido') {
        customError = data.error.trim();
      } else if (typeof data?.message === 'string' && data.message.trim() && data.message !== 'Error desconocido') {
        customError = data.message.trim();
      }
    }
  } catch {
    // Response could not be parsed as JSON, proceed to standard status checks
  }

  // Safe developer logging only in development mode
  if (import.meta.env.DEV) {
    console.warn(`[EcoViG API] HTTP ${res.status} ${res.statusText} en ${res.url}`);
  }

  if (customError) {
    return new Error(customError);
  }

  switch (res.status) {
    case 401:
      return new Error('Sesión no autorizada o expirada (HTTP 401). Por favor, inicia sesión nuevamente.');
    case 403:
      return new Error('Acceso denegado (HTTP 403). No tienes los permisos necesarios para realizar esta acción.');
    case 404:
      return new Error(
        `El servidor devolvió una respuesta no válida (HTTP 404). Recurso no encontrado o proxy desconfigurado.`
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new Error(`Error en el servidor backend (HTTP ${res.status}). Intenta nuevamente más tarde.`);
    default:
      return new Error(fallbackMessage || `El servidor devolvió una respuesta no válida (HTTP ${res.status})`);
  }
}

/**
 * Safely parses the JSON response from an API call.
 * Validates Content-Type and HTTP status before attempting JSON parsing.
 * If the response is not valid JSON (e.g. an HTML fallback from Vercel or proxy error page),
 * it returns a controlled, safe diagnostic error without exposing raw HTML or throwing
 * "Unexpected token '<'".
 */
export async function safeReadJson<T = any>(res: Response, fallbackMessage: string): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    throw await parseApiError(res, fallbackMessage);
  }

  if (!contentType.includes('application/json')) {
    if (contentType.includes('text/html')) {
      throw new Error(
        `El servidor devolvió una respuesta no válida (HTTP ${res.status}). La ruta API devolvió contenido HTML en vez de datos JSON.`
      );
    }
    throw new Error(
      `El servidor devolvió un tipo de contenido no válido (${contentType.split(';')[0] || 'desconocido'}) en vez de JSON.`
    );
  }

  try {
    return await res.json();
  } catch {
    throw new Error(
      `El servidor devolvió una respuesta no válida (HTTP ${res.status}). No se pudo interpretar como datos JSON estructurados.`
    );
  }
}

/**
 * Handles lower-level network or connection drop errors (e.g. Failed to fetch).
 */
export function handleNetworkError(err: any, fallbackMessage: string): Error {
  if (err instanceof TypeError && (
    err.message.includes('fetch') || 
    err.message.includes('NetworkError') || 
    err.message.includes('Failed to fetch')
  )) {
    return new Error('No fue posible conectar con el servidor backend de Cloud Run. Revisa tu conexión o el proxy de la aplicación.');
  }
  return err instanceof Error ? err : new Error(fallbackMessage);
}

/**
 * Standard fetch wrapper that automatically resolves endpoint paths
 * and provides friendly network error handling.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = resolveApiUrl(path);
  try {
    return await fetch(url, init);
  } catch (err: any) {
    throw handleNetworkError(err, 'Error de red al comunicarse con el servidor backend');
  }
}

/**
 * Performs a fetch and safely parses the JSON response, verifying Content-Type
 * and preventing any "Unexpected token '<'" exceptions.
 */
export async function apiFetchJson<T = any>(
  path: string, 
  init?: RequestInit, 
  fallbackMessage = 'Error al comunicarse con el servidor'
): Promise<T> {
  const res = await apiFetch(path, init);
  return await safeReadJson<T>(res, fallbackMessage);
}
