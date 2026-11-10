
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

export interface RespuestaEjercicio15 {
  valor: string;
}

@Component({
  selector: 'app-ejercicio-15',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-15.html',
  styleUrl: './ejercicio-15.css'
})
export class Ejercicio15 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;

  @Input() numeroSerie: number = 1;
  @Input() totalSeries: number = 3;
  @Input() enviando: boolean = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio15>();

  // Tres palabras por serie, con dificultad progresiva.
  readonly palabrasPorSerie: Record<number, string[]> = {
    1: ['CASA', 'MESA', 'PATO'],
    2: ['CAMINO', 'VENTANA', 'CONEJO'],
    3: ['MARIPOSA', 'BIBLIOTECA', 'CHOCOLATE']
  };

  get palabrasActuales(): string[] {
    return this.palabrasPorSerie[this.numeroSerie] ?? [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    // No se requiere estado adicional al cambiar de serie.
  }

  responder(correcto: boolean): void {

    if (this.enviando) {
      return;
    }

    const respuestaEsperada = String(
      (this.serie as any)?.expectedAnswer ?? ''
    );

    this.respuesta.emit({
      valor: correcto
        ? respuestaEsperada
        : '__RESPUESTA_INCORRECTA__'
    });

  }

}
