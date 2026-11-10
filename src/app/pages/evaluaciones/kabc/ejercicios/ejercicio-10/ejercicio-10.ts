
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RespuestaEjercicio10 {
  valor: string;
}

interface FotoSerie {
  id: string;
  numero: number;
  emoji: string;
  descripcion: string;
  posicion: number | null;
}

@Component({
  selector: 'app-ejercicio-10',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-10.html',
  styleUrl: './ejercicio-10.css'
})
export class Ejercicio10 implements OnChanges {

  @Input() item: any;
  @Input() serie: any;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio10>();

  private readonly contenidoPorSerie: {
    emoji: string[];
    descripciones: string[];
    ordenOpciones: number[];
  }[] = [
    {
      emoji: ['🌱', '🌿', '🪴', '🌻'],
      descripciones: [
        'Brote inicial',
        'Planta creciendo',
        'Planta en maceta',
        'Planta florecida'
      ],
      ordenOpciones: [2, 0, 3, 1]
    },
    {
      emoji: ['🍎', '🔪', '🍽️', '😋'],
      descripciones: [
        'Alimento inicial',
        'Preparación',
        'Alimento servido',
        'Alimento consumido'
      ],
      ordenOpciones: [2, 3, 0, 1]
    },
    {
      emoji: ['👕', '👖', '👟', '🚪'],
      descripciones: [
        'Camisa',
        'Pantalón',
        'Zapatos',
        'Puerta de salida'
      ],
      ordenOpciones: [3, 1, 0, 2]
    }
  ];

  fotos: FotoSerie[] = [];

  fotoSeleccionada: string | null = null;

  mensaje = '';
  respuestaEnviada = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['serie'] ||
      changes['item'] ||
      changes['numeroSerie']
    ) {
      this.inicializarSerie();
    }
  }

  get indiceSerie(): number {
    return Math.max(
      0,
      Math.min(Number(this.numeroSerie) - 1, 2)
    );
  }

  get configuracion() {
    return this.contenidoPorSerie[this.indiceSerie];
  }

  get instruccion(): string {
    return this.item?.instruction ??
      'Observa las fotografías y ordénalas según la secuencia correcta.';
  }

  get opciones(): FotoSerie[] {
    return this.configuracion.ordenOpciones
      .map(numero => this.fotos[numero])
      .filter((foto): foto is FotoSerie => !!foto);
  }

  get cantidadColocadas(): number {
    return this.fotos.filter(
      foto => foto.posicion !== null
    ).length;
  }

  get todosColocados(): boolean {
    return (
      this.fotos.length === 4 &&
      this.fotos.every(foto => foto.posicion !== null)
    );
  }

  private inicializarSerie(): void {
    const configuracion = this.configuracion;

    this.fotos = configuracion.emoji.map(
      (emoji, indice) => ({
        id: `foto_${String(
          ((this.indiceSerie * 4) + indice + 1)
        ).padStart(2, '0')}`,
        numero: indice + 1,
        emoji,
        descripcion: configuracion.descripciones[indice],
        posicion: null
      })
    );

    this.fotoSeleccionada = null;
    this.mensaje = '';
    this.respuestaEnviada = false;

    console.log(
      '[Ejercicio10] Serie inicializada:',
      this.numeroSerie
    );

    console.log(
      '[Ejercicio10] Fotografías:',
      this.fotos
    );
  }

  seleccionarFoto(foto: FotoSerie): void {
    if (this.enviando || this.respuestaEnviada) {
      return;
    }

    if (this.fotoSeleccionada === foto.id) {
      this.fotoSeleccionada = null;
      this.mensaje = '';
      return;
    }

    this.fotoSeleccionada = foto.id;
    this.mensaje = `Seleccionaste: ${foto.descripcion}.`;
  }

  colocarFoto(posicion: number): void {
    if (this.enviando || this.respuestaEnviada) {
      return;
    }

    const fotoActual = this.obtenerFotoEnPosicion(posicion);

    // Si no hay fotografía seleccionada,
    // se permite retirar la fotografía de la casilla.
    if (!this.fotoSeleccionada) {
      if (fotoActual) {
        fotoActual.posicion = null;
        this.mensaje = 'Fotografía retirada correctamente.';
      } else {
        this.mensaje = 'Primero selecciona una fotografía.';
      }

      return;
    }

    const fotoSeleccionada = this.fotos.find(
      foto => foto.id === this.fotoSeleccionada
    );

    if (!fotoSeleccionada) {
      return;
    }

    // Si se selecciona una fotografía que ya estaba colocada,
    // se libera su posición anterior.
    fotoSeleccionada.posicion = null;

    // Si la posición está ocupada, la fotografía anterior
    // regresa automáticamente a la zona de selección.
    if (fotoActual && fotoActual.id !== fotoSeleccionada.id) {
      fotoActual.posicion = null;
    }

    // Se coloca la fotografía en la nueva posición.
    fotoSeleccionada.posicion = posicion;

    this.fotoSeleccionada = null;

    this.mensaje = 'Fotografía colocada correctamente.';
  }

  obtenerFotoEnPosicion(
    posicion: number
  ): FotoSerie | undefined {
    return this.fotos.find(
      foto => foto.posicion === posicion
    );
  }

  estaColocada(foto: FotoSerie): boolean {
    return foto.posicion !== null;
  }

  reiniciar(): void {
    if (this.enviando || this.respuestaEnviada) {
      return;
    }

    this.fotos.forEach(foto => {
      foto.posicion = null;
    });

    this.fotoSeleccionada = null;
    this.mensaje = 'Puedes volver a ordenar las fotografías.';
  }

  confirmarRespuesta(): void {
    if (this.enviando || this.respuestaEnviada) {
      return;
    }

    if (!this.todosColocados) {
      this.mensaje =
        'Debes colocar todas las fotografías antes de continuar.';
      return;
    }

    // El arreglo representa la posición de cada fotografía
    // según su identificador original.
    const posiciones = this.fotos.map(
      foto => foto.posicion
    );

    this.respuestaEnviada = true;

    const valor = JSON.stringify(posiciones);

    console.log(
      '[Ejercicio10] Respuesta enviada:',
      valor
    );

    this.respuesta.emit({ valor });
  }

  trackByFoto(
    _index: number,
    foto: FotoSerie
  ): string {
    return foto.id;
  }

  trackByPosicion(
    _index: number,
    posicion: number
  ): number {
    return posicion;
  }
}
