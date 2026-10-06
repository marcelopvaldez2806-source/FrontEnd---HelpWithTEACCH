import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PrediccionMLResponse {
  idPrediccion: number;
  idEvaluacion: number;
  modelo: string;
  resultado: string;
  probabilidad: number;
  fechaPrediccion: string | null;

  creadoPor?: string | null;
  fechaCreacion?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
  versionLock?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class PrediccionMLService {

private readonly API_URL =
  `${environment.apiUrl}/predicciones-ml`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Genera las predicciones ML de una evaluación Q-CHAT.
   *
   * Backend:
   * POST /api/predicciones-ml/evaluacion/{idEvaluacion}
   */
  generar(
    idEvaluacion: number
  ): Observable<PrediccionMLResponse[]> {

    return this.http.post<PrediccionMLResponse[]>(
      `${this.API_URL}/evaluacion/${idEvaluacion}`,
      {}
    );
  }

  /**
   * Obtiene las predicciones ML ya generadas
   * para una evaluación.
   *
   * Backend:
   * GET /api/predicciones-ml/evaluacion/{idEvaluacion}
   */
  listarPorEvaluacion(
    idEvaluacion: number
  ): Observable<PrediccionMLResponse[]> {

    return this.http.get<PrediccionMLResponse[]>(
      `${this.API_URL}/evaluacion/${idEvaluacion}`
    );
  }
}