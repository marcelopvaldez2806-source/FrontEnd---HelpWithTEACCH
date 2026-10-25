
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
import { CommonModule } from '@angular/common';

export interface RespuestaEjercicio07 {
  valor: string;
}

interface PuntoObjetivo {
  x: number;
  y: number;
  rotacion: number;
}

interface PiezaTriangulo {
  id: string;
  color: string;
  x: number;
  y: number;
  rotacion: number;
  colocada: boolean;
}

@Component({
  selector: 'app-ejercicio-07',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-07.html',
  styleUrl: './ejercicio-07.css'
})
export class Ejercicio07 implements OnChanges {
  @Input() item: any;
  @Input() serie: any;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta =
    new EventEmitter<RespuestaEjercicio07>();

  @ViewChild('tableroSvg')
  tableroSvg?: ElementRef<SVGSVGElement>;

  readonly anchoPieza = 80;
  readonly altoPieza = 70;

  readonly colores = ['#64A9E8', '#F4C542', '#F08B72'];

  piezas: PiezaTriangulo[] = [];
  piezaSeleccionada: string | null = null;
  mensaje = '';
  mensajeTipo: 'error' | 'exito' | 'info' = 'info';

  private arrastrando: string | null = null;
  private offsetX = 0;
  private offsetY = 0;

  /*
   * Modelos SVG propios.
   * Cada pieza tiene una posición y rotación objetivo.
   * Las coordenadas se expresan en el viewBox del tablero.
   */
  private readonly modelos: PuntoObjetivo[][] = [
    [
      { x: 180, y: 80, rotacion: 0 },
      { x: 220, y: 149, rotacion: 180 },
      { x: 260, y: 80, rotacion: 0 }
    ],
    [
      { x: 160, y: 110, rotacion: 90 },
      { x: 240, y: 110, rotacion: 270 },
      { x: 200, y: 180, rotacion: 0 }
    ],
    [
      { x: 190, y: 65, rotacion: 0 },
      { x: 230, y: 65, rotacion: 180 },
      { x: 210, y: 134, rotacion: 180 }
    ]
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serie'] || changes['numeroSerie']) {
      this.inicializarSerie();
    }
  }

  private inicializarSerie(): void {
    this.piezaSeleccionada = null;
    this.arrastrando = null;
    this.mensaje = '';

    this.piezas = this.colores.map((color, i) => ({
      id: `pieza_${i + 1}`,
      color,
      x: 25 + i * 125,
      y: 35,
      rotacion: 0,
      colocada: false
    }));
  }

  get modeloActual(): PuntoObjetivo[] {
    const indice = Math.max(
      0,
      Math.min(2, this.numeroSerie - 1)
    );

    return this.modelos[indice];
  }

  get piezasColocadas(): number {
    return this.piezas.filter(p => p.colocada).length;
  }

  get todasColocadas(): boolean {
    return this.piezas.length === 3 &&
      this.piezas.every(p => p.colocada);
  }

  private obtenerPunto(
    event: PointerEvent
  ): { x: number; y: number } | null {
    const svg = this.tableroSvg?.nativeElement;
    const matriz = svg?.getScreenCTM();

    if (!svg || !matriz) return null;

    const punto = svg.createSVGPoint();
    punto.x = event.clientX;
    punto.y = event.clientY;

    const local = punto.matrixTransform(matriz.inverse());

    return { x: local.x, y: local.y };
  }

  seleccionarPieza(id: string): void {
    if (this.enviando) return;

    this.piezaSeleccionada = id;
    this.mensaje = '';
  }

  iniciarArrastre(
    event: PointerEvent,
    pieza: PiezaTriangulo
  ): void {
    if (this.enviando) return;

    event.preventDefault();

    const punto = this.obtenerPunto(event);
    if (!punto) return;

    this.piezaSeleccionada = pieza.id;
    this.arrastrando = pieza.id;

    this.offsetX = punto.x - pieza.x;
    this.offsetY = punto.y - pieza.y;

    try {
      this.tableroSvg?.nativeElement
        .setPointerCapture(event.pointerId);
    } catch {
      // Algunos navegadores pueden no admitir captura en este caso.
    }

    this.mensaje = '';
  }

  moverArrastre(event: PointerEvent): void {
    if (!this.arrastrando || this.enviando) return;

    const punto = this.obtenerPunto(event);
    if (!punto) return;

    const pieza = this.piezas.find(
      p => p.id === this.arrastrando
    );

    if (!pieza) return;

    pieza.x = Math.max(
      0,
      Math.min(520, punto.x - this.offsetX)
    );

    pieza.y = Math.max(
      0,
      Math.min(285, punto.y - this.offsetY)
    );
  }

  terminarArrastre(event: PointerEvent): void {
    if (!this.arrastrando) return;

    const pieza = this.piezas.find(
      p => p.id === this.arrastrando
    );

    if (pieza) {
      pieza.colocada = true;
    }

    try {
      this.tableroSvg?.nativeElement
        .releasePointerCapture(event.pointerId);
    } catch {
      // La captura puede haberse liberado previamente.
    }

    this.arrastrando = null;
  }

  girarSeleccionada(): void {
    if (!this.piezaSeleccionada || this.enviando) return;

    const pieza = this.piezas.find(
      p => p.id === this.piezaSeleccionada
    );

    if (!pieza) return;

    pieza.rotacion = (pieza.rotacion + 45) % 360;
    this.mensaje = '';
  }

  retirarSeleccionada(): void {
    if (!this.piezaSeleccionada || this.enviando) return;

    const pieza = this.piezas.find(
      p => p.id === this.piezaSeleccionada
    );

    if (!pieza) return;

    pieza.colocada = false;
    pieza.x = 25 + this.piezas.indexOf(pieza) * 125;
    pieza.y = 35;
    pieza.rotacion = 0;
    this.mensaje = '';
  }

  reiniciar(): void {
    if (this.enviando) return;
    this.inicializarSerie();
  }

  private diferenciaAngular(
    a: number,
    b: number
  ): number {
    const diferencia = Math.abs(
      ((a - b) % 360 + 360) % 360
    );

    return Math.min(diferencia, 360 - diferencia);
  }

  private validarGeometria(): boolean {
    if (!this.todasColocadas) return false;

    const objetivos = this.modeloActual;

    return this.piezas.every((pieza, indice) => {
      const objetivo = objetivos[indice];

      const distancia = Math.hypot(
        pieza.x - objetivo.x,
        pieza.y - objetivo.y
      );

      const diferenciaRotacion = this.diferenciaAngular(
        pieza.rotacion,
        objetivo.rotacion
      );

      return distancia <= 14 &&
        diferenciaRotacion <= 10;
    });
  }

  confirmarConstruccion(): void {
  if (this.enviando) return;

  if (!this.todasColocadas) {
    this.mensajeTipo = 'error';
    this.mensaje =
      'Coloca las tres piezas antes de continuar.';
    return;
  }

  const correcta = this.validarGeometria();

  // El JSON define la respuesta esperada de cada serie.
  // No se inventa una respuesta correcta si la figura falla.
  const valor = correcta
    ? this.serie?.expectedAnswer
    : `construccion_incorrecta_modelo_${this.numeroSerie}`;

  if (correcta) {
    this.mensajeTipo = 'exito';
    this.mensaje = '¡Construcción correcta!';
  } else {
    this.mensajeTipo = 'error';
    this.mensaje =
      'La construcción no coincide. Se registrará el intento y continuarás.';
  }

  this.respuesta.emit({
    valor: JSON.stringify({
      actividad: this.item?.code ?? 'TR_01',
      serieId: this.serie?.id ?? this.numeroSerie,
      numeroSerie: this.numeroSerie,
      correcta,
      respuesta: valor,
      piezas: this.piezas.map(p => ({
        id: p.id,
        x: Math.round(p.x),
        y: Math.round(p.y),
        rotacion: p.rotacion
      }))
    })
  });
}
}
