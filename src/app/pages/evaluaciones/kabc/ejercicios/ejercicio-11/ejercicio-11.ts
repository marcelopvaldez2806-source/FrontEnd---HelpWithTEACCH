
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

// ======================================================
// RESPUESTA DEL EJERCICIO 11
// ======================================================

export interface RespuestaEjercicio11 {
  valor: string;
}

// ======================================================
// MODELO DE LOS ESTÍMULOS
// ======================================================

interface EstimuloVocabulario {
  id: string;
  emoji: string;
  nombre: string;
  pregunta: string;
}

// ======================================================
// COMPONENTE
// ======================================================

@Component({
  selector: 'app-ejercicio-11',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-11.html',
  styleUrl: './ejercicio-11.css'
})
export class Ejercicio11 implements OnChanges {

  @Input() item: any;
  @Input() serie: any;

  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;

  @Input() enviando = false;

  @Output()
  respuesta = new EventEmitter<RespuestaEjercicio11>();

  // ======================================================
  // ESTÍMULOS DE LAS TRES SERIES
  // ======================================================

  private readonly estimulosPorSerie: EstimuloVocabulario[] = [
    {
      id: 'vocabulario_01',
      emoji: '🍎',
      nombre: 'manzana',
      pregunta: '¿Qué es esto?'
    },
    {
      id: 'vocabulario_02',
      emoji: '🐶',
      nombre: 'perro',
      pregunta: '¿Qué animal es?'
    },
    {
      id: 'vocabulario_03',
      emoji: '🥄',
      nombre: 'cuchara',
      pregunta: '¿Qué objeto es?'
    }
  ];

  // ======================================================
  // ESTADO DEL EJERCICIO
  // ======================================================

  estimuloActual: EstimuloVocabulario = {
    id: '',
    emoji: '',
    nombre: '',
    pregunta: ''
  };

  mensaje = '';

  respuestaEnviada = false;

  // ======================================================
  // DETECTAR CAMBIOS
  // ======================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['serie'] ||
      changes['item'] ||
      changes['numeroSerie']
    ) {
      this.inicializarSerie();
    }
  }

  // ======================================================
  // ÍNDICE DE LA SERIE ACTUAL
  // ======================================================

  get indiceSerie(): number {

    return Math.max(
      0,
      Math.min(
        Number(this.numeroSerie) - 1,
        this.estimulosPorSerie.length - 1
      )
    );
  }

  // ======================================================
  // INSTRUCCIÓN
  // ======================================================

  get instruccion(): string {

    return this.item?.instruction ??
      'Observa la imagen y responde oralmente.';
  }

  // ======================================================
  // INICIALIZAR SERIE
  // ======================================================

  private inicializarSerie(): void {

    const configuracion =
      this.estimulosPorSerie[this.indiceSerie];

    this.estimuloActual = { ...configuracion };

    this.mensaje = '';

    this.respuestaEnviada = false;

    console.log(
      '[Ejercicio11] Estímulo inicializado:',
      this.estimuloActual
    );
  }

  // ======================================================
  // EVALUAR RESPUESTA DEL NIÑO
  // ======================================================

  /**
   * El tutor determina si el niño respondió correctamente.
   *
   * true  = respuesta correcta.
   * false = respuesta incorrecta.
   *
   * Se envía una cadena compatible con expectedAnswer.
   */

  evaluarRespuesta(correcta: boolean): void {

    if (
      this.enviando ||
      this.respuestaEnviada
    ) {
      return;
    }

    const valor = correcta
      ? String(
          this.serie?.expectedAnswer ??
          this.estimuloActual.nombre
        )
      : '__RESPUESTA_INCORRECTA__';

    this.respuestaEnviada = true;

    console.log(
      '[Ejercicio11] Resultado enviado:',
      {
        valor,
        correcta,
        estimulo: this.estimuloActual.nombre
      }
    );

    this.respuesta.emit({
      valor
    });
  }

}
