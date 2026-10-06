import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  AsignarNinoRequest
} from '../../models/AsignarNinoRequest';

import {
  AsignarNinoResponse
} from '../../models/AsignarNinoResponse';

import { environment } from '../../../environments/environment';


export interface PageResponse<T> {

  content: T[];

  totalElements: number;

  totalPages: number;

  size: number;

  number: number;

  first: boolean;

  last: boolean;

  numberOfElements: number;

  empty: boolean;

}


export interface CambiarEstadoItem {

  id: number;

  estado: string;

}


export interface CambiarEstadoRequest {

  items: CambiarEstadoItem[];

}


@Injectable({
  providedIn: 'root'
})
export class AsignarNinoService {

  private http = inject(HttpClient);

private readonly API_URL =
  `${environment.apiUrl}/asignaciones`;
  asignar(
    request: AsignarNinoRequest
  ): Observable<void> {

    return this.http.post<void>(
      this.API_URL,
      request
    );

  }


  listarPorUsuario(
    idUsuario: number,
    estado?: string,
    page: number = 0,
    size: number = 50
  ): Observable<
    PageResponse<AsignarNinoResponse>
  > {

    let params =
      new HttpParams()
        .set('idUsuario', idUsuario)
        .set('page', page)
        .set('size', size);

    if (estado) {

      params =
        params.set(
          'estado',
          estado
        );

    }

    return this.http.get<
      PageResponse<AsignarNinoResponse>
    >(
      this.API_URL,
      {
        params
      }
    );

  }


  obtenerPorId(
    idAsignarNino: number
  ): Observable<AsignarNinoResponse> {

    return this.http.get<AsignarNinoResponse>(
      `${this.API_URL}/${idAsignarNino}`
    );

  }


  editar(
    idAsignarNino: number,
    request: {
      idUsuario: number;
      idNino: number;
    }
  ): Observable<AsignarNinoResponse> {

    return this.http.put<AsignarNinoResponse>(
      `${this.API_URL}/${idAsignarNino}`,
      request
    );

  }


  cambiarEstado(
    request: CambiarEstadoRequest
  ): Observable<void> {

    return this.http.patch<void>(
      `${this.API_URL}/estado`,
      request
    );

  }

}