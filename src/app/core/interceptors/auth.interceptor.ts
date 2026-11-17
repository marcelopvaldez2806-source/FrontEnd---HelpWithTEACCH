import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { limpiarSesion, tokenVencido } from '../utils/token.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // SSR: localStorage no existe en el servidor
  if (typeof localStorage === 'undefined') {
    return next(req);
  }

  const router = inject(Router);

  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(

    catchError((error: HttpErrorResponse) => {

      const esLogin = req.url.includes('/auth/');

      // 401 = sin autenticación.
      // 403 con token vencido = sesión expirada (Spring responde 403 por defecto).
      const sesionExpirada =
        error.status === 401 ||
        (error.status === 403 && tokenVencido(token));

      if (!esLogin && sesionExpirada) {
        limpiarSesion();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })

  );
};
