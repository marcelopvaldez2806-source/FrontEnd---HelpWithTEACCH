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
export class Ejercicio03 implements OnChanges, OnDestroy {

  private zone = inject(NgZone);


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

  reproduciendo = false;

  errorAudio = '';

  private temporizador: ReturnType<typeof setTimeout> | null = null;



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

    if (this.enviando || this.reproduciendo) {
      return;
    }

    // Los archivos de audio de esta actividad no existen en el
    // proyecto, así que las palabras se leen con la voz del
    // navegador (Web Speech API), en el orden del JSON.
    const palabras = this.obtenerPalabrasEnOrden();

    if (
      palabras.length === 0 ||
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      this.errorAudio =
        'Este navegador no puede leer las palabras en voz alta.';
      return;
    }

    this.detenerAudio();
    this.errorAudio = '';
    this.reproduciendo = true;

    const voz = this.obtenerVozEspanol();

    // Respaldo por si el navegador no avisa que terminó.
    this.temporizador = setTimeout(() => {
      this.zone.run(() => {
        this.reproduciendo = false;
        this.audioReproducido = true;
      });
    }, palabras.length * 2000 + 2000);

    palabras.forEach((palabra, indice) => {

      const enunciado =
        new SpeechSynthesisUtterance(palabra);

      enunciado.lang = voz?.lang ?? 'es-ES';
      enunciado.rate = 0.75;

      if (voz) {
        enunciado.voice = voz;
      }

      if (indice === palabras.length - 1) {
        enunciado.onend = () => {
          this.zone.run(() => {
            this.reproduciendo = false;
            this.audioReproducido = true;
          });
        };
      }

      enunciado.onerror = () => {
        this.zone.run(() => {
          this.reproduciendo = false;
          this.audioReproducido = true;
        });
      };

      window.speechSynthesis.speak(enunciado);

      // Pausa breve entre palabras.
      if (indice < palabras.length - 1) {
        const pausa = new SpeechSynthesisUtterance(' ');
        pausa.volume = 0;
        pausa.rate = 0.5;
        window.speechSynthesis.speak(pausa);
      }
    });
  }


  // Palabras de la serie, en el orden en que el niño debe tocarlas.
  private obtenerPalabrasEnOrden(): string[] {

    const esperada = Array.isArray(this.serie?.expectedAnswer)
      ? this.serie.expectedAnswer
      : [];

    return esperada.map(
      (id: string) => this.obtenerNombre(id).toLowerCase()
    );
  }


  private obtenerVozEspanol(): SpeechSynthesisVoice | null {

    const voces = window.speechSynthesis.getVoices();

    return (
      voces.find(v => v.lang?.toLowerCase().startsWith('es-pe')) ??
      voces.find(v => v.lang?.toLowerCase().startsWith('es-419')) ??
      voces.find(v => v.lang?.toLowerCase().startsWith('es')) ??
      null
    );
  }


  // ==========================================================
  // DETENER AUDIO
  // ==========================================================

  private detenerAudio(): void {

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }

    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }

    this.reproduciendo = false;
  }


  ngOnDestroy(): void {
    this.detenerAudio();
  }



  // ==========================================================
  // SELECCIONAR EMOJI
  // ==========================================================

  seleccionarImagen(id: string): void {

    // Primero hay que escuchar las palabras.
    if (this.enviando || !this.audioReproducido) {
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