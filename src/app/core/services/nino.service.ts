import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {NinoRequest} from '../../models/NinoRequest';
import {NinoResponse} from '../../models/NinoResponse';
import {PageResponse} from '../../models/PageResponse';
import {CambiarEstadoRequest} from '../../models/estado.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NinoService {
  private http = inject(HttpClient);
  private readonly API_URL =
  `${environment.apiUrl}/ninos`;

  crear(request: NinoRequest): Observable<NinoResponse> {
    return this.http.post<NinoResponse>(this.API_URL, request);
  }

  editar(idNino: number, request: NinoRequest): Observable<NinoResponse> {
    return this.http.put<NinoResponse>(`${this.API_URL}/${idNino}`, request);
  }

  cambiarEstado(request: CambiarEstadoRequest): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/estado`, request);
  }

  obtenerPorId(idNino: number): Observable<NinoResponse> {
    return this.http.get<NinoResponse>(`${this.API_URL}/${idNino}`);
  }

  listar(
    page: number = 0,
    size: number = 10,
    nombres?: string,
    apellidos?: string,
    sexo?: string,
    estado?: string
  ): Observable<PageResponse<NinoResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (nombres) {
      params = params.set('nombres', nombres);
    }

    if (apellidos) {
      params = params.set('apellidos', apellidos);
    }

    if (sexo) {
      params = params.set('sexo', sexo);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<PageResponse<NinoResponse>>(this.API_URL, { params });
  }
}
