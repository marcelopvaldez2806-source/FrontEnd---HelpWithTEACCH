import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
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

export interface RespuestaEjercicio04 {
  valor: string;
  correcta: boolean;
}

@Component({
  selector: 'app-ejercicio-04',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-04.html',
  styleUrl: './ejercicio-04.css'
})
export class Ejercicio04 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio04>();

  opcionSeleccionada: string | null = null;

  imagenRevelada = false;

  /**
   * Representación visual provisional.
   *
   * IMPORTANTE:
   * Los IDs reales siguen siendo opcion_a, opcion_b,
   * opcion_c y opcion_d.
   */
  private readonly opcionesVisuales: Record<string, string> = {
    opcion_a: '🐱',
    opcion_b: '🐶',
    opcion_c: '🐰',
    opcion_d: '🦊'
  };

  private readonly nombresOpciones: Record<string, string> = {
    opcion_a: 'Gato',
    opcion_b: 'Perro',
    opcion_c: 'Conejo',
    opcion_d: 'Zorro'
  };

  /**
   * Representación visual provisional del estímulo.
   *
   * El JSON original únicamente define los archivos
   * serie_01.png, serie_02.png y serie_03.png,
   * no el contenido visual de dichas imágenes.
   */
  private readonly estimulos: Record<number, string> = {
    1: '🐶',
    2: '🐰',
    3: '🐱'
  };

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie']
    ) {

      this.opcionSeleccionada = null;
      this.imagenRevelada = false;

      console.log('================================');
      console.log('K-ABC - EJERCICIO 04');
      console.log('Ventana mágica');
      console.log('Serie:', this.numeroSerie);
      console.log('Estímulo:', this.serie?.stimulus);
      console.log('Opciones:', this.serie?.options);
      console.log(
        'Respuesta esperada:',
        this.serie?.expectedAnswer
      );
      console.log('================================');
    }
  }

  obtenerVisualOpcion(id: string): string {
    return this.opcionesVisuales[id] ?? '❓';
  }

  obtenerNombreOpcion(id: string): string {
    return this.nombresOpciones[id] ?? id;
  }

  obtenerEstimulo(): string {
    return this.estimulos[this.numeroSerie] ?? '❓';
  }

  /**
   * Revela progresivamente el estímulo.
   */
  revelarImagen(): void {

    if (this.enviando) {
      return;
    }

    this.imagenRevelada = true;
  }

  seleccionarOpcion(id: string): void {

    if (this.enviando) {
      return;
    }

    if (!this.imagenRevelada) {
      return;
    }

    this.opcionSeleccionada = id;

    console.log(
      'Opción seleccionada:',
      id
    );
  }

  estaSeleccionada(id: string): boolean {
    return this.opcionSeleccionada === id;
  }

  enviar(): void {

    if (
      this.enviando ||
      !this.imagenRevelada ||
      !this.opcionSeleccionada
    ) {
      return;
    }

    const esperada =
      typeof this.serie?.expectedAnswer === 'string'
        ? this.serie.expectedAnswer
        : '';

    const correcta =
      this.opcionSeleccionada === esperada;

    console.log('================================');
    console.log('RESPUESTA EJERCICIO 04');
    console.log('Serie:', this.numeroSerie);
    console.log(
      'Ingresada:',
      this.opcionSeleccionada
    );
    console.log(
      'Esperada:',
      esperada
    );
    console.log(
      'Correcta:',
      correcta
    );
    console.log('================================');

    this.respuesta.emit({
      valor: this.opcionSeleccionada,
      correcta
    });
  }
}