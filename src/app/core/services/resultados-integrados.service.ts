import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { EvaluacionResponse, EvaluacionService } from './evaluacion.service';
import { NinoService } from './nino.service';

// =========================================================
// RESULTADOS INTEGRADOS (Q-CHAT + K-ABC)
// Niños cuyas dos evaluaciones están COMPLETADAS.
// =========================================================

export interface ResultadoIntegrado {
  idNino: number;
  nombreNino: string;
  idEvaluacionQChat: number;
  idEvaluacionKabc: number;
  fechaQChat: string;
  fechaKabc: string;
}

// Mismos IDs de versión que usa la pantalla Resultados finales.
export const ID_VERSION_QCHAT = 1;
export const ID_VERSION_KABC = 2;

@Injectable({
  providedIn: 'root'
})
export class ResultadosIntegradosService {

  private evaluacionService = inject(EvaluacionService);
  private ninoService = inject(NinoService);

  /**
   * Devuelve los niños con Q-CHAT y K-ABC completadas
   * por el usuario indicado (la última de cada una).
   */
  async listar(idUsuario: number): Promise<ResultadoIntegrado[]> {

    const page = await firstValueFrom(
      this.evaluacionService.listar(
        undefined,
        idUsuario,
        undefined,
        'COMPLETADA',
        0,
        100
      )
    );

    const evaluaciones: EvaluacionResponse[] = page?.content ?? [];

    const masReciente = (idNino: number, idVersion: number) =>
      evaluaciones
        .filter(e =>
          e.idNino === idNino &&
          Number(e.idVersion) === idVersion
        )
        .sort((a, b) =>
          new Date(b.fechaEvaluacion ?? 0).getTime() -
          new Date(a.fechaEvaluacion ?? 0).getTime()
        )[0];

    const idsNinos: number[] = Array.from(
      new Set(evaluaciones.map(e => e.idNino))
    );

    const resultados = await Promise.all(
      idsNinos.map(async idNino => {

        const qchat = masReciente(idNino, ID_VERSION_QCHAT);
        const kabc = masReciente(idNino, ID_VERSION_KABC);

        if (!qchat || !kabc) {
          return null;
        }

        let nombreNino = `Niño #${idNino}`;

        try {
          const nino = await firstValueFrom(
            this.ninoService.obtenerPorId(idNino)
          );

          if (nino) {
            nombreNino = `${nino.nombres} ${nino.apellidos}`.trim();
          }
        } catch {
          // Si falla, se muestra el código del niño.
        }

        const resultado: ResultadoIntegrado = {
          idNino,
          nombreNino,
          idEvaluacionQChat: qchat.idEvaluacion,
          idEvaluacionKabc: kabc.idEvaluacion,
          fechaQChat: qchat.fechaEvaluacion ?? '',
          fechaKabc: kabc.fechaEvaluacion ?? ''
        };

        return resultado;
      })
    );

    return resultados
      .filter((r): r is ResultadoIntegrado => r !== null)
      .sort((a, b) => a.nombreNino.localeCompare(b.nombreNino));
  }
}
