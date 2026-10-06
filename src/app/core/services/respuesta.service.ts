import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RespuestaService {

private readonly API_URL =
  `${environment.apiUrl}/respuestas`;


  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // GUARDAR RESPUESTAS
  // =========================================================

  guardarRespuestas(
    body: any
  ): Observable<any> {

    return this.http.post<any>(
      this.API_URL,
      body
    );

  }


  // =========================================================
  // OBTENER RESPUESTAS DE UNA EVALUACIÓN
  // =========================================================

  obtenerPorEvaluacion(
    idEvaluacion: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.API_URL}/evaluacion/${idEvaluacion}`
    );

  }


  // =========================================================
  // OBTENER UNA RESPUESTA
  // =========================================================

  obtenerPorId(
    idRespuesta: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.API_URL}/${idRespuesta}`
    );

  }

}