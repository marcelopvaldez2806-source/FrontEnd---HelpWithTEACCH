import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ============================================================
// MODELOS
// ============================================================

export interface EvaluacionRequest {
  idNino: number;
  idUsuario: number;
  idVersion: number;
}


export interface EvaluacionResponse {
  idEvaluacion: number;

  idNino: number;
  idUsuario: number;
  idVersion: number;

  fechaEvaluacion?: string | null;

  estado?: string | null;

  itemActual?: number | null;
  serieActual?: number | null;
  progreso?: number | null;

  fechaUltimoAcceso?: string | null;
  fechaInicio?: string | null;
  fechaFinalizacion?: string | null;

  creadoPor?: string | null;
  fechaCreacion?: string | null;
  modificadoPor?: string | null;
  fechaModificacion?: string | null;
  versionLock?: number | null;
}


export interface RespuestaItemRequest {
  itemId: number;
  serieId: number;
  tipo: string;
  valor: number;
}


export interface RespuestasRequest {
  idEvaluacion: number;
  items: RespuestaItemRequest[];
}


export interface PageResponse<T> {
  content: T[];

  totalElements?: number;
  totalPages?: number;

  size?: number;
  number?: number;

  first?: boolean;
  last?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {

 private readonly API_URL =
  `${environment.apiUrl}/evaluaciones`;

private readonly RESPUESTAS_URL =
  `${environment.apiUrl}/respuestas`;

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================================
  // CREAR EVALUACIÓN
  // ==========================================================

  crear(
    request: EvaluacionRequest
  ): Observable<EvaluacionResponse> {

    return this.http.post<EvaluacionResponse>(
      this.API_URL,
      request
    );

  }


  // ==========================================================
  // OBTENER EVALUACIÓN POR ID
  // ==========================================================

  obtenerPorId(
    idEvaluacion: number
  ): Observable<EvaluacionResponse> {

    return this.http.get<EvaluacionResponse>(
      `${this.API_URL}/${idEvaluacion}`
    );

  }


  // ==========================================================
  // LISTAR EVALUACIONES
  // ==========================================================

  listar(
    idNino?: number,
    idUsuario?: number,
    idPrueba?: number,
    estado?: string,
    page: number = 0,
    size: number = 50
  ): Observable<PageResponse<EvaluacionResponse>> {

    let params =
      new HttpParams()
        .set(
          'page',
          page.toString()
        )
        .set(
          'size',
          size.toString()
        );


    if (
      idNino !== undefined &&
      idNino !== null
    ) {

      params =
        params.set(
          'idNino',
          idNino.toString()
        );

    }


    if (
      idUsuario !== undefined &&
      idUsuario !== null
    ) {

      params =
        params.set(
          'idUsuario',
          idUsuario.toString()
        );

    }


    if (
      idPrueba !== undefined &&
      idPrueba !== null
    ) {

      params =
        params.set(
          'idPrueba',
          idPrueba.toString()
        );

    }


    if (
      estado !== undefined &&
      estado !== null &&
      estado !== ''
    ) {

      params =
        params.set(
          'estado',
          estado
        );

    }


    return this.http.get<
      PageResponse<EvaluacionResponse>
    >(
      this.API_URL,
      {
        params
      }
    );

  }


  // ==========================================================
  // OBTENER CONFIGURACIÓN DE LA EVALUACIÓN
  // ==========================================================

  obtenerConfiguracion(
    idEvaluacion: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.API_URL}/${idEvaluacion}/configuracion`
    );

  }


  // ==========================================================
  // ACTUALIZAR PROGRESO
  // ==========================================================

  actualizarProgreso(
    idEvaluacion: number,
    itemActual: number,
    serieActual: number
  ): Observable<EvaluacionResponse> {

    return this.http.put<EvaluacionResponse>(
      `${this.API_URL}/${idEvaluacion}/progreso`,
      {
        itemActual,
        serieActual
      }
    );

  }


  // ==========================================================
  // PAUSAR
  // ==========================================================

  pausar(
    idEvaluacion: number
  ): Observable<EvaluacionResponse> {

    return this.http.patch<EvaluacionResponse>(
      `${this.API_URL}/${idEvaluacion}/pausar`,
      {}
    );

  }


  // ==========================================================
  // REANUDAR
  // ==========================================================

  reanudar(
    idEvaluacion: number
  ): Observable<EvaluacionResponse> {

    return this.http.patch<EvaluacionResponse>(
      `${this.API_URL}/${idEvaluacion}/reanudar`,
      {}
    );

  }


  // ==========================================================
  // CANCELAR
  // ==========================================================

  cancelar(
    idEvaluacion: number
  ): Observable<EvaluacionResponse> {

    return this.http.patch<EvaluacionResponse>(
      `${this.API_URL}/${idEvaluacion}/cancelar`,
      {}
    );

  }
  // ==========================================================
// FINALIZAR
// ==========================================================

finalizar(
  idEvaluacion: number
): Observable<EvaluacionResponse> {

  return this.http.patch<EvaluacionResponse>(
    `${this.API_URL}/${idEvaluacion}/finalizar`,
    {}
  );

}


  // ==========================================================
  // GUARDAR RESPUESTAS
  // ==========================================================

  guardarRespuestas(
    request: RespuestasRequest
  ): Observable<any> {

    return this.http.post<any>(
      this.RESPUESTAS_URL,
      request
    );

  }

}