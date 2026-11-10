
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

export interface RespuestaEjercicio14 {
  valor: string;
}

@Component({
  selector: 'app-ejercicio-14',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-14.html',
  styleUrl: './ejercicio-14.css'
})
export class Ejercicio14 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;

  @Input() numeroSerie: number = 1;
  @Input() totalSeries: number = 3;
  @Input() enviando: boolean = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio14>();

  respuestaUsuario: string = '';

  // Adivinanzas de las tres series.
  readonly adivinanzas: Record<number, string> = {
    1: 'Tengo cuatro patas, ladro y soy conocido como el mejor amigo del ser humano.',
    2: 'Tengo bigotes, digo miau y me gusta dormir en lugares cómodos.',
    3: 'Aparezco en el cielo durante el día y doy luz y calor a nuestro planeta.'
  };

  get adivinanzaActual(): string {
    return this.adivinanzas[this.numeroSerie] ?? '';
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['serie'] || changes['numeroSerie']) {
      this.respuestaUsuario = '';
    }

  }

  private normalizar(texto: string): string {
    return texto.trim().toLocaleLowerCase('es');
  }

  enviarRespuesta(): void {

    if (this.enviando) {
      return;
    }

    const respuestaIngresada =
      this.normalizar(this.respuestaUsuario);

    if (!respuestaIngresada) {
      return;
    }

    const respuestaEsperada = this.normalizar(
      String((this.serie as any)?.expectedAnswer ?? '')
    );

    // Si es correcta, se envía la respuesta esperada.
    // Si es incorrecta, se envía un valor diferente.
    const valorFinal =
      respuestaIngresada === respuestaEsperada
        ? respuestaEsperada
        : '__RESPUESTA_INCORRECTA__';

    this.respuesta.emit({
      valor: valorFinal
    });

  }

}
