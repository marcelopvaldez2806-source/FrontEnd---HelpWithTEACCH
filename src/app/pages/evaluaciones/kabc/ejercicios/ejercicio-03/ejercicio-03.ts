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

export interface RespuestaEjercicio03 {
  valor: string[];
  correcta: boolean;
}

@Component({
  selector: 'app-ejercicio-03',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-03.html',
  styleUrl: './ejercicio-03.css'
})
export class Ejercicio03 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio03>();


  // ==========================================================
  // RESPUESTA
  // ==========================================================

  imagenesSeleccionadas: string[] = [];


  // ==========================================================
  // EMOJIS
  // ==========================================================

  private readonly emojis: Record<string, string> = {

    imagen_1: '🍎',

    imagen_2: '⚽',

    imagen_3: '🐱',

    imagen_4: '🏠'

  };


  private readonly nombres: Record<string, string> = {

    imagen_1: 'Manzana',

    imagen_2: 'Pelota',

    imagen_3: 'Gato',

    imagen_4: 'Casa'

  };


  // ==========================================================
  // AUDIO
  // ==========================================================

  audioUrl = '';

  audioReproducido = false;

  private audio: HTMLAudioElement | null = null;


  private readonly audios: Record<number, string> = {

    1: 'assets/kabc/orden-palabras/serie_01.ogg',

    2: 'assets/kabc/orden-palabras/serie_02.ogg',

    3: 'assets/kabc/orden-palabras/serie_03.ogg'

  };


  // ==========================================================
  // CAMBIO DE SERIE
  // ==========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie']
    ) {

      this.imagenesSeleccionadas = [];

      this.audioReproducido = false;

      this.audioUrl =
        this.audios[this.numeroSerie] ?? '';

      this.detenerAudio();


      console.log(
        '--------------------------------'
      );

      console.log(
        'K-ABC - EJERCICIO 03'
      );

      console.log(
        'Serie:',
        this.numeroSerie
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
        'Audio:',
        this.audioUrl
      );

      console.log(
        '--------------------------------'
      );

    }

  }


  // ==========================================================
  // OBTENER EMOJI
  // ==========================================================

  obtenerEmoji(id: string): string {

    return this.emojis[id] ?? '❓';

  }


  // ==========================================================
  // OBTENER NOMBRE
  // ==========================================================

  obtenerNombre(id: string): string {

    return this.nombres[id] ?? id;

  }


  // ==========================================================
  // REPRODUCIR AUDIO
  // ==========================================================

  reproducirAudio(): void {

    if (this.enviando) {
      return;
    }


    if (!this.audioUrl) {

      console.warn(
        'No existe audio para esta serie.'
      );

      return;

    }


    this.detenerAudio();


    this.audio =
      new Audio(this.audioUrl);


    this.audio.preload = 'auto';


    this.audio.onended = () => {

      this.audioReproducido = true;

    };


    this.audio.onerror = () => {

      console.error(
        'Error cargando audio:',
        this.audioUrl
      );

      this.audioReproducido = false;

    };


    this.audio.play()
      .then(() => {

        this.audioReproducido = true;

      })
      .catch(error => {

        console.error(
          'No se pudo reproducir el audio:',
          error
        );

      });

  }


  // ==========================================================
  // DETENER AUDIO
  // ==========================================================

  private detenerAudio(): void {

    if (this.audio) {

      this.audio.pause();

      this.audio.currentTime = 0;

      this.audio = null;

    }

  }


  // ==========================================================
  // SELECCIONAR EMOJI
  // ==========================================================

  seleccionarImagen(id: string): void {

    if (this.enviando) {
      return;
    }


    if (
      this.imagenesSeleccionadas
        .includes(id)
    ) {

      return;

    }


    const cantidadEsperada =
      Array.isArray(
        this.serie?.expectedAnswer
      )
        ? this.serie.expectedAnswer.length
        : 0;


    if (
      this.imagenesSeleccionadas.length >=
      cantidadEsperada
    ) {

      return;

    }


    this.imagenesSeleccionadas = [

      ...this.imagenesSeleccionadas,

      id

    ];

  }


  // ==========================================================
  // DESHACER
  // ==========================================================

  deshacerUltima(): void {

    if (
      this.enviando ||
      this.imagenesSeleccionadas.length === 0
    ) {

      return;

    }


    this.imagenesSeleccionadas =
      this.imagenesSeleccionadas.slice(
        0,
        -1
      );

  }


  // ==========================================================
  // LIMPIAR
  // ==========================================================

  limpiarSeleccion(): void {

    if (this.enviando) {
      return;
    }


    this.imagenesSeleccionadas = [];

  }


  // ==========================================================
  // ESTÁ SELECCIONADA
  // ==========================================================

  estaSeleccionada(id: string): boolean {

    return this.imagenesSeleccionadas
      .includes(id);

  }


  // ==========================================================
  // POSICIÓN
  // ==========================================================

  obtenerPosicion(id: string): number {

    const posicion =
      this.imagenesSeleccionadas
        .indexOf(id);


    return posicion === -1
      ? 0
      : posicion + 1;

  }


  // ==========================================================
  // ENVIAR
  // ==========================================================

  enviar(): void {

    if (
      this.enviando ||
      this.imagenesSeleccionadas.length === 0
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
        this.imagenesSeleccionadas,
        esperada
      );


    console.log(
      'RESPUESTA EJERCICIO 03'
    );

    console.log(
      'Respuesta:',
      this.imagenesSeleccionadas
    );

    console.log(
      'Esperada:',
      esperada
    );

    console.log(
      'Correcta:',
      correcta
    );


    this.respuesta.emit({

      valor: [
        ...this.imagenesSeleccionadas
      ],

      correcta

    });

  }


  // ==========================================================
  // COMPARAR
  // ==========================================================

  private compararArrays(
    recibido: string[],
    esperado: string[]
  ): boolean {

    if (
      recibido.length !==
      esperado.length
    ) {

      return false;

    }


    return recibido.every(
      (valor, index) =>
        valor === esperado[index]
    );

  }

}