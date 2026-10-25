
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RespuestaEjercicio08 {
  valor: string;
}

interface OpcionMatriz {
  id: string;
  etiqueta: string;
  figuras: string[];
  relleno?: boolean;
}

@Component({
  selector: 'app-ejercicio-08',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-08.html',
  styleUrl: './ejercicio-08.css'
})
export class Ejercicio08 implements OnChanges {

  @Input() item: any;
  @Input() serie: any;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio08>();

  opcionSeleccionada: string | null = null;
  mensaje = '';

  private readonly opcionesPorSerie: OpcionMatriz[][] = [
    [
      { id: 'dos_circulos', etiqueta: 'Dos círculos', figuras: ['circulo', 'circulo'] },
      { id: 'dos_triangulos', etiqueta: 'Dos triángulos', figuras: ['triangulo', 'triangulo'] },
      { id: 'tres_cuadrados', etiqueta: 'Tres cuadrados', figuras: ['cuadrado', 'cuadrado', 'cuadrado'] },
      { id: 'un_circulo', etiqueta: 'Un círculo', figuras: ['circulo'] }
    ],
    [
      { id: 'transformacion_vacio_relleno', etiqueta: 'De vacío a relleno', figuras: ['cuadrado', 'cuadrado_relleno'] },
      { id: 'transformacion_relleno_vacio', etiqueta: 'De relleno a vacío', figuras: ['cuadrado_relleno', 'cuadrado'] },
      { id: 'rotacion', etiqueta: 'Rotación', figuras: ['triangulo', 'triangulo_rotado'] },
      { id: 'sin_cambio', etiqueta: 'Sin cambio', figuras: ['circulo', 'circulo'] }
    ],
    [
      { id: 'dos_circulos', etiqueta: 'Dos círculos', figuras: ['circulo', 'circulo'] },
      { id: 'tres_circulos', etiqueta: 'Tres círculos', figuras: ['circulo', 'circulo', 'circulo'] },
      { id: 'cuatro_cuadrados', etiqueta: 'Cuatro cuadrados', figuras: ['cuadrado', 'cuadrado', 'cuadrado', 'cuadrado'] },
      { id: 'un_triangulo', etiqueta: 'Un triángulo', figuras: ['triangulo'] }
    ]
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serie'] || changes['numeroSerie']) {
      this.opcionSeleccionada = null;
      this.mensaje = '';
    }
  }

  get indiceSerie(): number {
    return Math.max(0, Math.min(2, this.numeroSerie - 1));
  }

  get opciones(): OpcionMatriz[] {
    const configuradas = this.serie?.options;

    if (!Array.isArray(configuradas)) {
      return this.opcionesPorSerie[this.indiceSerie];
    }

    // Conserva las opciones e identificadores definidos en el JSON.
    return configuradas.map((id: string) => {
      return this.opcionesPorSerie[this.indiceSerie]
        .find(opcion => opcion.id === id) ?? {
          id,
          etiqueta: this.formatearTexto(id),
          figuras: ['circulo']
        };
    });
  }

  get instruccion(): string {
    return this.item?.instruction ??
      'Observa la matriz y selecciona la opción que completa el patrón.';
  }

  seleccionarOpcion(id: string): void {
    if (this.enviando) return;

    this.opcionSeleccionada = id;
    this.mensaje = '';
  }

  confirmarRespuesta(): void {
    if (this.enviando) return;

    if (!this.opcionSeleccionada) {
      this.mensaje = 'Selecciona una alternativa antes de continuar.';
      return;
    }

    this.respuesta.emit({
      valor: this.opcionSeleccionada
    });
  }

  limpiarSeleccion(): void {
    if (this.enviando) return;

    this.opcionSeleccionada = null;
    this.mensaje = '';
  }

  formatearTexto(texto: string): string {
    return texto
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letra => letra.toUpperCase());
  }

  trackByOpcion(_index: number, opcion: OpcionMatriz): string {
    return opcion.id;
  }
}
