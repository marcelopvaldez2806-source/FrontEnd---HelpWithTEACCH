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
  responseGrid?: string[];
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

export interface RespuestaEjercicio05 {
  valor: string;
  correcta: boolean;
}

@Component({
  selector: 'app-ejercicio-05',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-05.html',
  styleUrl: './ejercicio-05.css'
})
export class Ejercicio05 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio05>();

  opcionSeleccionada: string | null = null;

  private readonly caras: Record<string, string> = {

    cara_01: '👨🏻',
    cara_02: '👩🏻',
    cara_03: '👦🏻',
    cara_04: '👧🏻',

    cara_05: '👨🏽',
    cara_06: '👩🏽',
    cara_07: '👦🏽',

    cara_08: '👨🏼',
    cara_09: '👩🏼',
    cara_10: '👧🏼',
    cara_11: '👦🏼'

  };

  private readonly nombresCaras: Record<string, string> = {

    cara_01: 'Cara 1',
    cara_02: 'Cara 2',
    cara_03: 'Cara 3',
    cara_04: 'Cara 4',
    cara_05: 'Cara 5',
    cara_06: 'Cara 6',
    cara_07: 'Cara 7',
    cara_08: 'Cara 8',
    cara_09: 'Cara 9',
    cara_10: 'Cara 10',
    cara_11: 'Cara 11'

  };

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie']
    ) {

      this.opcionSeleccionada = null;

      console.log('================================');
      console.log('K-ABC - EJERCICIO 05');
      console.log('Reconocimiento de caras');
      console.log('Serie:', this.numeroSerie);

      console.log(
        'Estímulo:',
        this.serie?.stimulus
      );

      console.log(
        'Opciones:',
        this.serie?.responseGrid
      );

      console.log(
        'Respuesta esperada:',
        this.serie?.expectedAnswer
      );

      console.log('================================');
    }
  }

  obtenerCara(id: string): string {

    return this.caras[id] ?? '❓';
  }

  obtenerNombreCara(id: string): string {

    return this.nombresCaras[id] ?? id;
  }

  obtenerOpciones(): string[] {

    if (
      Array.isArray(this.serie?.responseGrid)
    ) {
      return this.serie.responseGrid;
    }

    return [];
  }

  obtenerEstimulos(): string[] {

    const archivos =
      this.serie?.stimulus?.files;

    if (Array.isArray(archivos)) {

      return archivos.map(
        (archivo: string) => {

          const nombre =
            archivo
              .split('/')
              .pop()
              ?.replace('.png', '')
              ?? '';

          return nombre;
        }
      );
    }

    return [];
  }

  seleccionarCara(id: string): void {

    if (this.enviando) {
      return;
    }

    this.opcionSeleccionada = id;

    console.log(
      'Cara seleccionada:',
      id
    );
  }

  estaSeleccionada(id: string): boolean {

    return this.opcionSeleccionada === id;
  }

  enviar(): void {

    if (
      this.enviando ||
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
    console.log('RESPUESTA EJERCICIO 05');
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