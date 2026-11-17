// =========================================================
// UTILIDADES DEL TOKEN JWT
// =========================================================

/**
 * Devuelve true si el token no tiene formato válido
 * o si su fecha de expiración (claim "exp") ya pasó.
 */
export function tokenVencido(token: string | null): boolean {

  if (!token) {
    return true;
  }

  try {

    const partes = token.split('.');

    if (partes.length !== 3) {
      return true;
    }

    const base64 = partes[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const payload = JSON.parse(atob(base64));

    if (typeof payload.exp !== 'number') {
      // Sin "exp": se deja pasar y el backend decide.
      return false;
    }

    return payload.exp * 1000 <= Date.now();

  } catch {
    return true;
  }
}

/**
 * Borra la sesión guardada en el navegador.
 */
export function limpiarSesion(): void {

  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
}
