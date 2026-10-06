import {
  Injectable,
  inject,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  RegistroRequest
} from '../../models/auth.models';

import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

private readonly API_URL =
  `${environment.apiUrl}/auth`;
  constructor(
    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {}

  // =========================================================
  // LOGIN
  // =========================================================

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/login`,
        request
      )
      .pipe(

        tap(response => {

          if (isPlatformBrowser(this.platformId)) {

            localStorage.setItem(
              'token',
              response.token
            );

            localStorage.setItem(
              'usuario',
              JSON.stringify(response)
            );

            localStorage.setItem(
              'rol',
              response.rol
            );

          }

        })

      );
  }

  // =========================================================
  // REGISTRO
  // =========================================================

  registrar(
    request: RegistroRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.API_URL}/registro`,
        request
      )
      .pipe(

        tap(response => {

          if (isPlatformBrowser(this.platformId)) {

            localStorage.setItem(
              'token',
              response.token
            );

            localStorage.setItem(
              'usuario',
              JSON.stringify(response)
            );

            localStorage.setItem(
              'rol',
              response.rol
            );

          }

        })

      );
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {

    if (isPlatformBrowser(this.platformId)) {

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('rol');

    }

  }

  // =========================================================
  // TOKEN
  // =========================================================

  getToken(): string | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem('token');
  }

  // =========================================================
  // USUARIO
  // =========================================================

  getUsuario(): LoginResponse | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const usuario =
      localStorage.getItem('usuario');

    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario) as LoginResponse;
  }

  // =========================================================
  // AUTENTICADO
  // =========================================================

  estaAutenticado(): boolean {

    return !!this.getToken();

  }

}