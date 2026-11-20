import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../models/auth.models';

// =========================================================
// PERFIL DEL USUARIO QUE INICIÓ SESIÓN  (/api/perfil)
// =========================================================

export type Ocupacion = 'PADRE' | 'DOCENTE';

export interface PerfilResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: 'ADMIN' | 'DOCENTE' | 'PADRE' | string;
  estado: string;
}

export interface PerfilRequest {
  nombres: string;
  apellidos: string;
  email: string;
  ocupacion?: Ocupacion;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

// Evento para que la barra superior refresque el nombre al instante.
export const EVENTO_PERFIL_ACTUALIZADO = 'perfil-actualizado';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/perfil`;

  obtener(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(this.apiUrl);
  }

  /**
   * El backend devuelve un token nuevo (el correo es parte del token),
   * así que se guarda igual que al iniciar sesión.
   */
  actualizar(request: PerfilRequest): Observable<LoginResponse> {
    return this.http.put<LoginResponse>(this.apiUrl, request).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  cambiarPassword(request: CambiarPasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/password`, request);
  }

  private guardarSesion(response: LoginResponse): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem('token', response.token);
    localStorage.setItem('usuario', JSON.stringify(response));
    localStorage.setItem('rol', response.rol);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(EVENTO_PERFIL_ACTUALIZADO));
    }
  }
}
