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

// Rasgos de una cara ilustrada (se usa cuando no hay foto real).
export interface RasgosCara {
  piel: string;
  pelo: string;
  peinado: 'corto' | 'largo' | 'rizado' | 'calvo' | 'cola' | 'flequillo';
  ojos: 'redondos' | 'almendra';
  cejas: 'rectas' | 'arqueadas' | 'gruesas';
  rostro: 'ovalado' | 'redondo' | 'alargado';
  boca: 'sonrisa' | 'neutra';
  lentes: boolean;
  barba: boolean;
  ropa: string;
}

type FaseCaras = 'listo' | 'memorizar' | 'responder';

@Component({
  selector: 'app-ejercicio-05',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-05.html',
  styleUrl: './ejercicio-05.css'
})
export class Ejercicio05 implements OnChanges, OnDestroy {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output()
  respuesta = new EventEmitter<RespuestaEjercicio05>();

  // Tiempo de exposición de la cara, como en el K-ABC (5 s).
  readonly segundosExposicion = 5;

  fase: FaseCaras = 'listo';

  segundosRestantes = this.segundosExposicion;

  opcionSeleccionada: string | null = null;

  // Caras con foto real disponible en assets (ver rutaFoto).
  fotosCargadas = new Set<string>();

  private intervalo: ReturnType<typeof setInterval> | null = null;

  private zone = inject(NgZone);

  // Caras ilustradas. Dentro de cada serie se parecen entre sí
  // (cambian 1 o 2 rasgos) y todas llevan la misma ropa, para que
  // se reconozcan por la cara y no por el color de la camiseta.
  private readonly rasgos: Record<string, RasgosCara> = {
    // Serie 1: cara_01 a cara_04
    cara_01: { piel: '#F1C7A5', pelo: '#3B2A20', peinado: 'corto', ojos: 'redondos', cejas: 'rectas', rostro: 'ovalado', boca: 'neutra', lentes: false, barba: false, ropa: '#94A3B8' },
    cara_02: { piel: '#F1C7A5', pelo: '#3B2A20', peinado: 'largo', ojos: 'almendra', cejas: 'arqueadas', rostro: 'ovalado', boca: 'sonrisa', lentes: false, barba: false, ropa: '#94A3B8' },
    cara_03: { piel: '#F1C7A5', pelo: '#7A5230', peinado: 'flequillo', ojos: 'redondos', cejas: 'rectas', rostro: 'redondo', boca: 'sonrisa', lentes: false, barba: false, ropa: '#94A3B8' },
    cara_04: { piel: '#F1C7A5', pelo: '#3B2A20', peinado: 'largo', ojos: 'redondos', cejas: 'rectas', rostro: 'redondo', boca: 'neutra', lentes: true, barba: false, ropa: '#94A3B8' },
    // Serie 2: cara_04 a cara_07
    cara_05: { piel: '#C68C62', pelo: '#1F1712', peinado: 'rizado', ojos: 'almendra', cejas: 'gruesas', rostro: 'ovalado', boca: 'sonrisa', lentes: false, barba: false, ropa: '#94A3B8' },
    cara_06: { piel: '#C68C62', pelo: '#1F1712', peinado: 'corto', ojos: 'almendra', cejas: 'gruesas', rostro: 'alargado', boca: 'neutra', lentes: false, barba: true, ropa: '#94A3B8' },
    cara_07: { piel: '#C68C62', pelo: '#1F1712', peinado: 'cola', ojos: 'redondos', cejas: 'arqueadas', rostro: 'ovalado', boca: 'sonrisa', lentes: false, barba: false, ropa: '#94A3B8' },
    // Serie 3: cara_08 a cara_11
    cara_08: { piel: '#E8B48F', pelo: '#A0522D', peinado: 'corto', ojos: 'redondos', cejas: 'rectas', rostro: 'alargado', boca: 'neutra', lentes: true, barba: false, ropa: '#94A3B8' },
    cara_09: { piel: '#E8B48F', pelo: '#A0522D', peinado: 'largo', ojos: 'almendra', cejas: 'arqueadas', rostro: 'ovalado', boca: 'sonrisa', lentes: false, barba: false, ropa: '#94A3B8' },
    cara_10: { piel: '#E8B48F', pelo: '#2C1E16', peinado: 'cola', ojos: 'almendra', cejas: 'arqueadas', rostro: 'redondo', boca: 'sonrisa', lentes: false, barba: false, ropa: '#94A3B8' },
    cara_11: { piel: '#E8B48F', pelo: '#2C1E16', peinado: 'calvo', ojos: 'redondos', cejas: 'gruesas', rostro: 'redondo', boca: 'neutra', lentes: false, barba: true, ropa: '#94A3B8' }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['numeroSerie'] || changes['serie']) {
      this.reiniciar();
    }
  }

  ngOnDestroy(): void {
    this.limpiarIntervalo();
  }

  // -------------------------------------------------------
  // DATOS DE LA SERIE
  // -------------------------------------------------------

  // Cara que el niño debe memorizar: la respuesta esperada.
  // (El JSON lista 3 caras de estímulo, pero 2 de ellas también
  // aparecen como opciones sin ser la correcta; mostrar solo la
  // esperada evita que una cara "vista" cuente como error.)
  get caraObjetivo(): string {
    return typeof this.serie?.expectedAnswer === 'string'
      ? this.serie.expectedAnswer
      : '';
  }

  obtenerOpciones(): string[] {
    return Array.isArray(this.serie?.responseGrid)
      ? this.serie.responseGrid
      : [];
  }

  obtenerRasgos(id: string): RasgosCara {
    return this.rasgos[id] ?? this.rasgos['cara_01'];
  }

  // Si existe una foto real en esta ruta, se usa en lugar del dibujo.
  rutaFoto(id: string): string {
    return `assets/kabc/reconocimiento-caras/${id}.png`;
  }

  fotoCargada(id: string): void {
    this.fotosCargadas.add(id);
  }

  tieneFoto(id: string): boolean {
    return this.fotosCargadas.has(id);
  }

  numeroCara(id: string): string {
    return id.replace('cara_', '');
  }

  // -------------------------------------------------------
  // FASES
  // -------------------------------------------------------

  comenzar(): void {
    if (this.enviando || this.fase !== 'listo') {
      return;
    }

    this.fase = 'memorizar';
    this.segundosRestantes = this.segundosExposicion;

    this.limpiarIntervalo();

    this.intervalo = setInterval(() => {
      this.zone.run(() => {
        this.segundosRestantes--;

        if (this.segundosRestantes <= 0) {
          this.limpiarIntervalo();
          this.fase = 'responder';
        }
      });
    }, 1000);
  }

  seleccionarCara(id: string): void {
    if (this.enviando || this.fase !== 'responder') {
      return;
    }

    this.opcionSeleccionada = id;
  }

  estaSeleccionada(id: string): boolean {
    return this.opcionSeleccionada === id;
  }

  enviar(): void {
    if (
      this.enviando ||
      this.fase !== 'responder' ||
      !this.opcionSeleccionada
    ) {
      return;
    }

    this.respuesta.emit({
      valor: this.opcionSeleccionada,
      correcta: this.opcionSeleccionada === this.caraObjetivo
    });
  }

  // -------------------------------------------------------
  // AUXILIARES
  // -------------------------------------------------------

  private reiniciar(): void {
    this.limpiarIntervalo();
    this.fase = 'listo';
    this.segundosRestantes = this.segundosExposicion;
    this.opcionSeleccionada = null;
  }

  private limpiarIntervalo(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}
