import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

export interface SerieKabc {
  id: number;
  stimulus?: any;
  options?: any;
  expectedAnswer?: any;
}

export interface ItemKabc {
  id: number;
  code?: string;
  subtest?: string;
  type?: string;
  question?: string;
  instruction?: string;
  series: SerieKabc[];
  scoringRule?: string;
  maxScore?: number;
}

export interface RespuestaEjercicio01 {
  valor: any;
  correcta: boolean;
}

@Component({
  selector: 'app-ejercicio-01',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-01.html',
  styleUrl: './ejercicio-01.css'
})
export class Ejercicio01 {

  // =========================================================
  // DATOS RECIBIDOS DEL COMPONENTE PADRE
  // =========================================================

  @Input() item!: ItemKabc;

  @Input() serie!: SerieKabc;

  @Input() numeroSerie = 1;

  @Input() totalSeries = 3;

  @Input() enviando = false;


  // =========================================================
  // EVENTO PARA ENVIAR LA RESPUESTA AL PADRE
  // =========================================================

  @Output()
  respuesta =
    new EventEmitter<RespuestaEjercicio01>();


  // =========================================================
  // ESTADO DE LA RESPUESTA
  // =========================================================

  respuestaSeleccionada:
    'correcta' |
    'incorrecta' |
    null = null;


  // =========================================================
  // MOVIMIENTOS VISUALES
  // =========================================================

  private readonly movimientos: {
    [key: string]: string;
  } = {

    movimiento_1: '👋',

    movimiento_2: '✊',

    movimiento_3: '🤲'

  };


  // =========================================================
  // OBTENER EMOJI DEL MOVIMIENTO
  // =========================================================

  obtenerEmojiMovimiento(
    movimiento: any
  ): string {

    if (
      movimiento === null ||
      movimiento === undefined
    ) {
      return '❓';
    }

    const clave =
      String(movimiento);

    return (
      this.movimientos[clave] ??
      '❓'
    );
  }


  // =========================================================
  // OBTENER SECUENCIA VISUAL
  // =========================================================

  obtenerSecuenciaVisual(): string[] {

    const expected =
      this.serie?.expectedAnswer;

    if (!Array.isArray(expected)) {

      return [];

    }

    return expected.map(
      movimiento =>
        this.obtenerEmojiMovimiento(
          movimiento
        )
    );
  }


  // =========================================================
  // SELECCIONAR "CORRECTA"
  // =========================================================

  seleccionarCorrecta(): void {

    if (this.enviando) {
      return;
    }

    this.respuestaSeleccionada =
      'correcta';
  }


  // =========================================================
  // SELECCIONAR "INCORRECTA"
  // =========================================================

  seleccionarIncorrecta(): void {

    if (this.enviando) {
      return;
    }

    this.respuestaSeleccionada =
      'incorrecta';
  }


  // =========================================================
  // ENVIAR RESPUESTA
  // =========================================================

  enviar(): void {

    if (
      this.enviando ||
      this.respuestaSeleccionada === null
    ) {
      return;
    }


    // -------------------------------------------------------
    // RESPUESTA CORRECTA
    // -------------------------------------------------------

    if (
      this.respuestaSeleccionada ===
      'correcta'
    ) {

      this.respuesta.emit({

        valor:
          this.serie.expectedAnswer,

        correcta: true

      });

      return;
    }


    // -------------------------------------------------------
    // RESPUESTA INCORRECTA
    // -------------------------------------------------------

    this.respuesta.emit({

      valor:
        this.obtenerRespuestaIncorrecta(),

      correcta: false

    });

  }


  // =========================================================
  // GENERAR RESPUESTA INCORRECTA
  // =========================================================

  private obtenerRespuestaIncorrecta(): any {

    const expected =
      this.serie?.expectedAnswer;


    if (Array.isArray(expected)) {

      return [
        ...expected,
        'respuesta_incorrecta'
      ];

    }


    if (
      typeof expected ===
      'string'
    ) {

      return (
        expected +
        '_incorrecta'
      );

    }


    if (
      typeof expected ===
      'number'
    ) {

      return expected + 999;

    }


    return 'respuesta_incorrecta';
  }


  // =========================================================
  // SABER SI ESTÁ SELECCIONADO
  // =========================================================

  estaSeleccionada(
    opcion:
      'correcta' |
      'incorrecta'
  ): boolean {

    return (
      this.respuestaSeleccionada ===
      opcion
    );

  }

}