import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RespuestaEjercicio09 {
  valor: string;
}

interface ObjetoMemoria {
  id: string;
  simbolo: string;
  posicionObjetivo: number;
  posicionUsuario: number | null;
}

@Component({
  selector: 'app-ejercicio-09',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-09.html',
  styleUrl: './ejercicio-09.css'
})
export class Ejercicio09 implements OnChanges {
  @Input() item: any;
  @Input() serie: any;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta = new EventEmitter<RespuestaEjercicio09>();

  readonly celdas = Array.from({ length: 16 }, (_, i) => i);

  private readonly simbolos = ['★', '●', '■', '▲', '◆'];

  // Posiciones provisionales para probar la interfaz.
  // Deben sustituirse por las posiciones de los estímulos reales.
  private readonly posicionesPorSerie: number[][] = [
    [1, 6, 11],
    [0, 3, 9, 14],
    [1, 4, 7, 10, 13]
  ];

  objetos: ObjetoMemoria[] = [];
  modoMemoria = true;
  objetoSeleccionado: string | null = null;
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

  private inicializarSerie(): void {
    console.log('[Ejercicio09] Item recibido:', this.item);
    console.log('[Ejercicio09] Serie recibida:', this.serie);

    const datos = this.serie;

    // Acepta objetos en la serie o en una propiedad anidada.
    const posiblesObjetos =
      datos?.objects ??
      datos?.objetos ??
      datos?.objectsIds ??
      datos?.configuracion?.objects ??
      datos?.contenido?.objects ??
      this.item?.objects ??
      this.item?.objetos;

    const indiceSerie = Math.max(
      0,
      Math.min(Number(this.numeroSerie) - 1, 2)
    );

    const posiciones = this.posicionesPorSerie[indiceSerie];

    let ids: string[];

    if (
      Array.isArray(posiblesObjetos) &&
      posiblesObjetos.length > 0
    ) {
      ids = posiblesObjetos.map((objeto: any, indice: number) => {
        if (typeof objeto === 'string') {
          return objeto;
        }

        return String(
          objeto?.id ??
          objeto?.codigo ??
          `objeto_${String(indice + 1).padStart(2, '0')}`
        );
      });
    } else {
      // Respaldo provisional: permite probar el ejercicio
      // aunque la API todavía no entregue los objetos.
      const cantidades = [3, 4, 5];
      const cantidad = cantidades[indiceSerie];

      ids = Array.from(
        { length: cantidad },
        (_, indice) =>
          `objeto_${String(indice + 1).padStart(2, '0')}`
      );

      console.warn(
        '[Ejercicio09] No se encontraron objetos en la configuración. ' +
        'Se utilizarán objetos de prueba.'
      );
    }

    this.objetos = ids.map((id, indice) => ({
      id,
      simbolo: this.simbolos[indice % this.simbolos.length],
      posicionObjetivo: posiciones[indice] ?? indice,
      posicionUsuario: null
    }));

    this.modoMemoria = true;
    this.objetoSeleccionado = null;
    this.mensaje = '';
    this.respuestaEnviada = false;

    console.log('[Ejercicio09] Objetos preparados:', this.objetos);
  }

  ocultarObjetos(): void {
    this.modoMemoria = false;
    this.objetoSeleccionado = null;
    this.mensaje = 'Selecciona un símbolo y luego su casilla.';
  }

  seleccionarObjeto(objeto: ObjetoMemoria): void {
    if (this.modoMemoria || this.enviando || this.respuestaEnviada) {
      return;
    }

    this.objetoSeleccionado = objeto.id;
    this.mensaje = `Seleccionaste el símbolo ${objeto.simbolo}.`;
  }

  colocarObjeto(posicion: number): void {
    if (this.modoMemoria || this.enviando || this.respuestaEnviada) {
      return;
    }

    if (!this.objetoSeleccionado) {
      this.mensaje = 'Primero selecciona un objeto.';
      return;
    }

    const ocupada = this.objetos.some(
      objeto =>
        objeto.posicionUsuario === posicion &&
        objeto.id !== this.objetoSeleccionado
    );

    if (ocupada) {
      this.mensaje = 'Esa casilla ya está ocupada. Elige otra.';
      return;
    }

    const objeto = this.objetos.find(
      actual => actual.id === this.objetoSeleccionado
    );

    if (!objeto) {
      return;
    }

    objeto.posicionUsuario = posicion;
    this.objetoSeleccionado = null;
    this.mensaje = 'Objeto colocado. Continúa con los demás.';
  }

  obtenerObjetoEnCasilla(posicion: number): ObjetoMemoria | undefined {
    return this.modoMemoria
      ? this.objetos.find(objeto => objeto.posicionObjetivo === posicion)
      : this.objetos.find(objeto => objeto.posicionUsuario === posicion);
  }

  estaColocado(objeto: ObjetoMemoria): boolean {
    return objeto.posicionUsuario !== null;
  }

  get todosColocados(): boolean {
    return (
      this.objetos.length > 0 &&
      this.objetos.every(objeto => objeto.posicionUsuario !== null)
    );
  }

  get cantidadColocados(): number {
    return this.objetos.filter(
      objeto => objeto.posicionUsuario !== null
    ).length;
  }

  reiniciarColocacion(): void {
    if (this.modoMemoria || this.enviando || this.respuestaEnviada) {
      return;
    }

    this.objetos.forEach(objeto => {
      objeto.posicionUsuario = null;
    });

    this.objetoSeleccionado = null;
    this.mensaje = 'Puedes volver a colocar los objetos.';
  }

  confirmarRespuesta(): void {
    if (this.enviando || this.respuestaEnviada) {
      return;
    }

    if (!this.todosColocados) {
      this.mensaje = 'Coloca todos los objetos antes de continuar.';
      return;
    }

    const correcta = this.objetos.every(
      objeto => objeto.posicionUsuario === objeto.posicionObjetivo
    );

    this.respuestaEnviada = true;

    const valor = correcta
      ? 'posiciones_originales'
      : JSON.stringify({
          posiciones: this.objetos.map(objeto => ({
            id: objeto.id,
            posicion: objeto.posicionUsuario
          }))
        });

    this.respuesta.emit({ valor });
  }

  trackById(_index: number, objeto: ObjetoMemoria): string {
    return objeto.id;
  }
}