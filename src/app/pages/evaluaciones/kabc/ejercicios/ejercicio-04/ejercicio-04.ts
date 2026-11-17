import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject
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

type FaseVentana = 'listo' | 'mostrando' | 'respuesta';

@Component({
  selector: 'app-ejercicio-04',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-04.html',
  styleUrl: './ejercicio-04.css'
})
export class Ejercicio04 implements OnChanges, OnDestroy {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output()
  respuesta = new EventEmitter<RespuestaEjercicio04>();

  // Duración del paso de la imagen detrás de la rendija (ms).
  // Igual que en el K-ABC, la imagen se presenta una sola vez.
  readonly duracionMs = 7000;

  fase: FaseVentana = 'listo';

  opcionSeleccionada: string | null = null;

  private temporizador: ReturnType<typeof setTimeout> | null = null;

  private zone = inject(NgZone);

  // Las opciones se muestran como palabras (no como dibujos),
  // para que el niño tenga que integrar lo que vio por la rendija
  // y no solo emparejar dos imágenes iguales.
  private readonly nombresOpciones: Record<string, string> = {
    opcion_a: 'Gato',
    opcion_b: 'Perro',
    opcion_c: 'Conejo',
    opcion_d: 'Zorro'
  };

  // Imagen que pasa detrás de la ventana en cada serie
  // (coincide con el expectedAnswer del JSON).
  private readonly estimulos: Record<number, string> = {
    1: '🐶',
    2: '🐰',
    3: '🐱'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['numeroSerie'] || changes['serie']) {
      this.reiniciar();
    }
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
    this.detenerVoz();
  }

  get imagenRevelada(): boolean {
    return this.fase === 'respuesta';
  }

  obtenerEstimulo(): string {
    return this.estimulos[this.numeroSerie] ?? '❓';
  }

  obtenerNombreOpcion(id: string): string {
    return this.nombresOpciones[id] ?? id;
  }

  letraOpcion(id: string): string {
    return id.replace('opcion_', '').toUpperCase();
  }

  // -------------------------------------------------------
  // PRESENTACIÓN
  // -------------------------------------------------------

  comenzar(): void {
    if (this.enviando || this.fase !== 'listo') {
      return;
    }

    this.fase = 'mostrando';

    this.limpiarTemporizador();

    this.temporizador = setTimeout(() => {
      this.zone.run(() => {
        this.fase = 'respuesta';
      });
    }, this.duracionMs);
  }

  // -------------------------------------------------------
  // RESPUESTA
  // -------------------------------------------------------

  seleccionarOpcion(id: string): void {
    if (this.enviando || this.fase !== 'respuesta') {
      return;
    }

    this.opcionSeleccionada = id;
  }

  estaSeleccionada(id: string): boolean {
    return this.opcionSeleccionada === id;
  }

  // Lee las opciones en voz alta, para niños que aún no leen.
  leerOpciones(): void {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      return;
    }

    this.detenerVoz();

    const opciones: string[] = this.serie?.options ?? [];

    opciones.forEach(opcion => {
      const enunciado = new SpeechSynthesisUtterance(
        `${this.letraOpcion(opcion)}: ${this.obtenerNombreOpcion(opcion)}`
      );
      enunciado.lang = 'es-ES';
      enunciado.rate = 0.8;
      window.speechSynthesis.speak(enunciado);
    });
  }

  enviar(): void {
    if (
      this.enviando ||
      this.fase !== 'respuesta' ||
      !this.opcionSeleccionada
    ) {
      return;
    }

    const esperada =
      typeof this.serie?.expectedAnswer === 'string'
        ? this.serie.expectedAnswer
        : '';

    this.respuesta.emit({
      valor: this.opcionSeleccionada,
      correcta: this.opcionSeleccionada === esperada
    });
  }

  // -------------------------------------------------------
  // AUXILIARES
  // -------------------------------------------------------

  private reiniciar(): void {
    this.limpiarTemporizador();
    this.detenerVoz();
    this.fase = 'listo';
    this.opcionSeleccionada = null;
  }

  private limpiarTemporizador(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  private detenerVoz(): void {
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }
  }
}
