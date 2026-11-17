import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { limpiarSesion, tokenVencido } from '../utils/token.util';

// =========================================================
// AUTH GUARD
// Sin sesión válida, redirige a /login.
// =========================================================

export const authGuard: CanActivateFn = () => {

  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // En el servidor (SSR / prerender) no existe localStorage:
  // se deja pasar y la verificación ocurre en el navegador.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (token && !tokenVencido(token)) {
    return true;
  }

  limpiarSesion();

  return router.createUrlTree(['/login']);
};
