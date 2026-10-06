import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
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

export interface RespuestaEjercicio02 {
  valor: number[];
  correcta: boolean;
}

@Component({
  selector: 'app-ejercicio-02',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-02.html',
  styleUrl: './ejercicio-02.css'
})
export class Ejercicio02 implements OnChanges {

  @Input() item!: ItemKabc;

  @Input() serie!: SerieKabc;

  @Input() numeroSerie = 1;

  @Input() totalSeries = 3;

  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio02>();


  @ViewChild('audioPlayer')
  audioPlayer?: ElementRef<HTMLAudioElement>;


  // ==========================================================
  // AUDIO
  // ==========================================================

  audioUrl = '';

  audioReproducido = false;

  reproduciendo = false;


  private readonly audios: Record<number, string> = {

    1: '/assets/kabc/serie_01.ogg',

    2: '/assets/kabc/serie_02.ogg',

    3: '/assets/kabc/serie_03.ogg'

  };


  // ==========================================================
  // RESPUESTA DEL NIÑO
  // ==========================================================

  numerosIngresados: number[] = [];


  // ==========================================================
  // CAMBIO DE SERIE
  // ==========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie']
    ) {

      this.numerosIngresados = [];

      this.audioReproducido = false;

      this.reproduciendo = false;

      this.audioUrl =
        this.audios[this.numeroSerie] ?? '';

      console.log(
        '================================='
      );

      console.log(
        'K-ABC - EJERCICIO 02'
      );

      console.log(
        'Serie:',
        this.numeroSerie
      );

      console.log(
        'Audio:',
        this.audioUrl
      );

      console.log(
        'Respuesta esperada:',
        this.serie?.expectedAnswer
      );

      console.log(
        '================================='
      );

      setTimeout(() => {

        if (this.audioPlayer?.nativeElement) {

          this.audioPlayer.nativeElement.load();

        }

      });

    }

  }


  // ==========================================================
  // AUDIO
  // ==========================================================

  escucharAudio(): void {

    const audio =
      this.audioPlayer?.nativeElement;


    if (!audio) {

      console.error(
        '❌ No se encontró el elemento <audio>.'
      );

      return;

    }


    console.log(
      '🔊 Intentando reproducir:',
      this.audioUrl
    );


    audio.load();


    const promise =
      audio.play();


    if (promise) {

      promise
        .then(() => {

          console.log(
            '✅ Audio reproduciéndose'
          );

          this.reproduciendo = true;

          this.audioReproducido = true;

        })

        .catch(error => {

          console.error(
            '❌ Error reproduciendo audio:',
            error
          );

          this.reproduciendo = false;

        });

    }

  }


  audioIniciado(): void {

    this.reproduciendo = true;

    this.audioReproducido = true;

  }


  audioTerminado(): void {

    this.reproduciendo = false;

    this.audioReproducido = true;

  }


  audioError(event: Event): void {

    console.error(
      '❌ ERROR CARGANDO AUDIO'
    );

    console.error(
      'Archivo:',
      this.audioUrl
    );

    console.error(
      event
    );

  }


  // ==========================================================
  // CONSOLA NUMÉRICA
  // ==========================================================

  agregarNumero(numero: number): void {

    if (this.enviando) {
      return;
    }


    /*
     * Permitimos agregar tantos números como
     * tenga la serie esperada.
     *
     * Serie 1 → 3 números
     * Serie 2 → 4 números
     * Serie 3 → 5 números
     */

    const cantidadEsperada =
      Array.isArray(this.serie?.expectedAnswer)
        ? this.serie.expectedAnswer.length
        : 99;


    if (
      this.numerosIngresados.length >=
      cantidadEsperada
    ) {

      return;

    }


    this.numerosIngresados = [
      ...this.numerosIngresados,
      numero
    ];

  }


  // ==========================================================
  // BORRAR ÚLTIMO
  // ==========================================================

  borrarNumero(): void {

    if (
      this.enviando ||
      this.numerosIngresados.length === 0
    ) {

      return;

    }


    this.numerosIngresados =
      this.numerosIngresados.slice(
        0,
        -1
      );

  }


  // ==========================================================
  // LIMPIAR
  // ==========================================================

  limpiarNumeros(): void {

    if (this.enviando) {
      return;
    }


    this.numerosIngresados = [];

  }


  // ==========================================================
  // ENVIAR RESPUESTA
  // ==========================================================

  enviar(): void {

    if (
      this.enviando ||
      this.numerosIngresados.length === 0
    ) {

      return;

    }


    const esperada =
      Array.isArray(
        this.serie?.expectedAnswer
      )
        ? this.serie.expectedAnswer
        : [];


    const correcta =
      this.compararArrays(
        this.numerosIngresados,
        esperada
      );


    console.log(
      '================================='
    );

    console.log(
      'RESPUESTA K-ABC'
    );

    console.log(
      'Ingresada:',
      this.numerosIngresados
    );

    console.log(
      'Esperada:',
      esperada
    );

    console.log(
      'Correcta:',
      correcta
    );

    console.log(
      '================================='
    );


    this.respuesta.emit({

      valor: [
        ...this.numerosIngresados
      ],

      correcta

    });

  }


  // ==========================================================
  // COMPARAR ARRAYS
  // ==========================================================

  private compararArrays(
    recibido: number[],
    esperado: number[]
  ): boolean {

    if (
      recibido.length !==
      esperado.length
    ) {

      return false;

    }


    return recibido.every(
      (numero, index) =>
        numero === esperado[index]
    );

  }

}