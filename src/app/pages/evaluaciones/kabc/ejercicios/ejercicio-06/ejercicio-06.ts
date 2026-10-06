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
  options?: string[];
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

export interface RespuestaEjercicio06 {
  valor: string;
  correcta: boolean;
}

@Component({
  selector: 'app-ejercicio-06',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-06.html',
  styleUrl: './ejercicio-06.css'
})
export class Ejercicio06 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio06>();

  opcionSeleccionada: string | null = null;

  /**
   * Representaciones visuales provisionales.
   * Más adelante pueden reemplazarse por imágenes reales.
   */
  private readonly objetos: Record<string, string> = {

    perro: '🐶',
    casa: '🏠',
    flor: '🌸',
    auto: '🚗',

    gato: '🐱',
    bicicleta: '🚲',
    arbol: '🌳',
    pez: '🐟',

    manzana: '🍎',
    pelota: '⚽',
    sol: '☀️',
    cuchara: '🥄'

  };

  private readonly nombres: Record<string, string> = {

    perro: 'Perro',
    casa: 'Casa',
    flor: 'Flor',
    auto: 'Auto',

    gato: 'Gato',
    bicicleta: 'Bicicleta',
    arbol: 'Árbol',
    pez: 'Pez',

    manzana: 'Manzana',
    pelota: 'Pelota',
    sol: 'Sol',
    cuchara: 'Cuchara'

  };

  /**
   * Posición de la zona oculta.
   *
   * Cambiamos la posición entre series para
   * que la actividad no sea visualmente idéntica.
   */
  private readonly posicionesMascara: Record<
    number,
    string
  > = {

    1: 'top-right',
    2: 'bottom-left',
    3: 'top-left'

  };

  posicionMascara = 'top-right';

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie']
    ) {

      this.opcionSeleccionada = null;

      this.posicionMascara =
        this.posicionesMascara[
          this.numeroSerie
        ] ?? 'top-right';

      console.log('================================');
      console.log('K-ABC - EJERCICIO 06');
      console.log('Cierre gestáltico');
      console.log('Serie:', this.numeroSerie);

      console.log(
        'Estímulo:',
        this.serie?.stimulus
      );

      console.log(
        'Opciones:',
        this.serie?.options
      );

      console.log(
        'Respuesta esperada:',
        this.serie?.expectedAnswer
      );

      console.log(
        'Posición máscara:',
        this.posicionMascara
      );

      console.log('================================');
    }
  }

  obtenerObjeto(id: string): string {

    return this.objetos[id] ?? '❓';
  }

  obtenerNombre(id: string): string {

    return this.nombres[id] ?? id;
  }

  obtenerOpciones(): string[] {

    return Array.isArray(this.serie?.options)
      ? this.serie.options
      : [];
  }

  seleccionarOpcion(id: string): void {

    if (this.enviando) {
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
    console.log('RESPUESTA EJERCICIO 06');
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