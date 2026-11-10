
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

export interface RespuestaEjercicio11 {
  valor: {
    estimulo: string;
    correcta: boolean;
    evaluadoPor: 'tutor';
  };
}

interface EstimuloVocabulario {
  id: string;
  emoji: string;
  nombre: string;
  pregunta: string;
}

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

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio11>();

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

  estimuloActual: EstimuloVocabulario = {
    id: '',
    emoji: '',
    nombre: '',
    pregunta: ''
  };

  mensaje = '';

  respuestaEnviada = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['serie'] ||
      changes['item'] ||
      changes['numeroSerie']
    ) {
      this.inicializarSerie();
    }
  }

  get indiceSerie(): number {
    return Math.max(
      0,
      Math.min(
        Number(this.numeroSerie) - 1,
        this.estimulosPorSerie.length - 1
      )
    );
  }

  get instruccion(): string {
    return this.item?.instruction ??
      'Observa la imagen y responde oralmente.';
  }

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

  /**
   * El tutor indica si el niño respondió correctamente.
   *
   * true  = respuesta correcta (1 punto).
   * false = respuesta incorrecta (0 puntos).
   */
  evaluarRespuesta(correcta: boolean): void {

    if (
      this.enviando ||
      this.respuestaEnviada
    ) {
      return;
    }

    const valor = {
      estimulo: this.estimuloActual.nombre,
      correcta: correcta,
      evaluadoPor: 'tutor' as const
    };

    this.respuestaEnviada = true;

    console.log(
      '[Ejercicio11] Resultado enviado:',
      valor
    );

    this.respuesta.emit({ valor });
  }
}
