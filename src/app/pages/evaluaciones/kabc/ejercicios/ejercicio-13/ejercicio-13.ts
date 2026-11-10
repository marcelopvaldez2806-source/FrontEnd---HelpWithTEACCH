
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ItemKabc,
  SerieKabc
} from '../ejercicio-01/ejercicio-01';

// =========================================================
// RESPUESTA DEL EJERCICIO 13
// =========================================================

export interface RespuestaEjercicio13 {
  valor: string;
}

// =========================================================
// MODELO DE PREGUNTA ARITMÉTICA
// =========================================================

interface PreguntaAritmetica {

  tipo: 'conteo' | 'operacion' | 'problema';

  titulo: string;

  instruccion: string;

  pregunta: string;

  opciones: string[];

  respuestaCorrecta: string;

  emojis?: string[];

  operacion?: string;

  ilustracion?: string[];

}

// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector: 'app-ejercicio-13',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-13.html',
  styleUrl: './ejercicio-13.css'
})
export class Ejercicio13 implements OnChanges {

  // =======================================================
  // DATOS RECIBIDOS DEL COMPONENTE PADRE
  // =======================================================

  @Input() item!: ItemKabc;

  @Input() serie!: SerieKabc;

  @Input() numeroSerie = 1;

  @Input() totalSeries = 3;

  @Input() enviando = false;

  // =======================================================
  // EVENTO PARA ENVIAR LA RESPUESTA
  // =======================================================

  @Output()
  respuesta =
    new EventEmitter<RespuestaEjercicio13>();

  // =======================================================
  // ESTADO DE LA ACTIVIDAD
  // =======================================================

  preguntaActual!: PreguntaAritmetica;

  respuestaSeleccionada: string | null = null;

  // =======================================================
  // PREGUNTAS DE LAS TRES SERIES
  // =======================================================

  private readonly preguntas: PreguntaAritmetica[] = [

    // -----------------------------------------------------
    // SERIE 1: CONTEO
    // -----------------------------------------------------

    {
      tipo: 'conteo',

      titulo: '¡Vamos a contar!',

      instruccion:
        'Observa los dibujos y cuenta cuidadosamente.',

      pregunta:
        '¿Cuántas manzanas hay?',

      emojis: [
        '🍎', '🍎', '🍎', '🍎',
        '🍎', '🍎', '🍎'
      ],

      opciones: [
        '5', '6', '7', '8'
      ],

      respuestaCorrecta: '7'
    },

    // -----------------------------------------------------
    // SERIE 2: OPERACIÓN MATEMÁTICA
    // -----------------------------------------------------

    {
      tipo: 'operacion',

      titulo: '¡Resolvamos la operación!',

      instruccion:
        'Observa la operación y selecciona el resultado.',

      pregunta:
        '¿Cuánto es?',

      operacion:
        '8 + 4 = ?',

      opciones: [
        '10', '11', '12', '13'
      ],

      respuestaCorrecta: '12'
    },

    // -----------------------------------------------------
    // SERIE 3: PROBLEMA MATEMÁTICO
    // -----------------------------------------------------

    {
      tipo: 'problema',

      titulo: '¡Resolvamos el problema!',

      instruccion:
        'Lee atentamente y piensa en la respuesta.',

      pregunta:
        'Hay 5 globos. Dos se fueron volando. ¿Cuántos globos quedan?',

      ilustracion: [
        '🎈', '🎈', '🎈', '🎈', '🎈'
      ],

      opciones: [
        '2', '3', '4', '5'
      ],

      respuestaCorrecta: '3'
    }

  ];

  // =======================================================
  // DETECTAR CAMBIOS DE SERIE
  // =======================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie'] ||
      changes['item']
    ) {

      this.inicializarActividad();

    }

  }

  // =======================================================
  // INICIALIZAR ACTIVIDAD
  // =======================================================

  private inicializarActividad(): void {

    const indice = Math.min(
      Math.max(Number(this.numeroSerie) - 1, 0),
      this.preguntas.length - 1
    );

    this.preguntaActual =
      this.preguntas[indice];

    this.respuestaSeleccionada = null;

    console.log(
      '[Ejercicio13] Actividad inicializada:',
      {
        serie: this.numeroSerie,
        pregunta: this.preguntaActual,
        expectedAnswer: this.serie?.expectedAnswer
      }
    );

  }

  // =======================================================
  // SELECCIONAR RESPUESTA
  // =======================================================

  seleccionarRespuesta(opcion: string): void {

    if (this.enviando) {
      return;
    }

    this.respuestaSeleccionada = opcion;

  }

  // =======================================================
  // COMPROBAR SELECCIÓN
  // =======================================================

  estaSeleccionada(opcion: string): boolean {

    return this.respuestaSeleccionada === opcion;

  }

  // =======================================================
  // GENERAR RESPUESTA INCORRECTA
  // =======================================================

  private obtenerRespuestaIncorrecta(): string {

    const expected =
      this.serie?.expectedAnswer;

    if (Array.isArray(expected)) {

      return JSON.stringify([
        ...expected,
        '__respuesta_incorrecta__'
      ]);

    }

    if (typeof expected === 'string') {

      return `${expected}__incorrecta`;

    }

    if (typeof expected === 'number') {

      return String(expected + 999);

    }

    return '__respuesta_incorrecta__';

  }

  // =======================================================
  // CONFIRMAR RESPUESTA
  // =======================================================

  confirmarRespuesta(): void {

    if (
      this.enviando ||
      this.respuestaSeleccionada === null ||
      !this.preguntaActual ||
      !this.serie
    ) {

      return;

    }

    // -----------------------------------------------------
    // COMPROBAR RESPUESTA
    // -----------------------------------------------------

    const correcta =
      this.respuestaSeleccionada ===
      this.preguntaActual.respuestaCorrecta;

    // -----------------------------------------------------
    // RESULTADO DETALLADO PARA DEPURACIÓN
    // -----------------------------------------------------

    const resultado = {

      numeroSerie: this.numeroSerie,

      tipo: this.preguntaActual.tipo,

      pregunta: this.preguntaActual.pregunta,

      operacion:
        this.preguntaActual.operacion ?? null,

      respuestaSeleccionada:
        this.respuestaSeleccionada,

      respuestaCorrecta:
        this.preguntaActual.respuestaCorrecta,

      correcta,

      opciones:
        this.preguntaActual.opciones

    };

    console.log(
      '[Ejercicio13] Resultado:',
      resultado
    );

    // -----------------------------------------------------
    // ENVIAR VALOR COMPATIBLE CON EL BACKEND
    // -----------------------------------------------------

    const valor = correcta
      ? this.serie.expectedAnswer
      : this.obtenerRespuestaIncorrecta();

    const valorFinal =
      typeof valor === 'string'
        ? valor
        : JSON.stringify(valor);

    console.log(
      '[Ejercicio13] Valor enviado al backend:',
      {
        correcta,
        valor: valorFinal
      }
    );

    this.respuesta.emit({

      valor: valorFinal

    });

  }

  // =======================================================
  // HABILITAR BOTÓN DE CONFIRMACIÓN
  // =======================================================

  get puedeConfirmar(): boolean {

    return (
      this.respuestaSeleccionada !== null &&
      !this.enviando
    );

  }

}
