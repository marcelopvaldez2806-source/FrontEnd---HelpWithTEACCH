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

import { UsuarioRequest } from '../../models/UsuarioRequest';
import { UsuarioResponse } from '../../models/UsuarioResponse';


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
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);

 private readonly API_URL =
  `${environment.apiUrl}/admin/usuarios`;

  crear(
    request: UsuarioRequest
  ): Observable<UsuarioResponse> {

    return this.http.post<UsuarioResponse>(
      this.API_URL,
      request
    );
  }


  listar(
    page: number = 0,
    size: number = 50
  ): Observable<PageResponse<UsuarioResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<UsuarioResponse>>(
      this.API_URL,
      { params }
    );
  }

}