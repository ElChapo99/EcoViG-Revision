import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

/**
 * Espera a que Firebase Auth termine de restaurar la sesión persistente
 * desde IndexedDB/localStorage y retorna el usuario autenticado actual.
 */
export async function waitForAuthUser(timeoutMs = 4000): Promise<FirebaseUser | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // 1. API moderna de Firebase v9/v10/v11/v12: authStateReady()
  if (typeof (auth as any).authStateReady === 'function') {
    try {
      await (auth as any).authStateReady();
    } catch (e) {
      // ignore
    }
    if (auth.currentUser) {
      return auth.currentUser;
    }
  }

  // 2. Listener reactivo como fallback con timeout de seguridad
  return new Promise<FirebaseUser | null>((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        unsubscribe();
        resolve(auth.currentUser);
      }
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(user);
      }
    });
  });
}

/**
 * Obtiene el header de autorización seguro con Bearer ID Token de Firebase.
 * Resuelve condiciones de carrera esperando a que Firebase Auth esté listo
 * antes de validar o rechazar la sesión.
 */
export async function getAuthHeader(forceRefresh = false): Promise<Record<string, string>> {
  const user = await waitForAuthUser();
  if (!user) {
    throw new Error('Debes iniciar sesión para realizar esta acción');
  }

  try {
    const token = await user.getIdToken(forceRefresh);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (err: any) {
    console.warn('[AUTH] Error obteniendo ID token, reintentando con forceRefresh=true:', err?.message || err);
    try {
      const refreshedToken = await user.getIdToken(true);
      return {
        'Authorization': `Bearer ${refreshedToken}`,
        'Content-Type': 'application/json',
      };
    } catch (retryErr: any) {
      console.error('[AUTH] Falló la obtención del ID token:', retryErr?.message || retryErr);
      throw new Error('Sesión de autenticación expirada o inválida. Inicia sesión nuevamente.');
    }
  }
}

export default getAuthHeader;
