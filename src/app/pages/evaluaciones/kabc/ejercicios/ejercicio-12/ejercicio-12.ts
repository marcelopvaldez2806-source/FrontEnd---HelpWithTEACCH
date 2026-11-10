
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

// =========================================================
// MODELO DE LOS ESTÍMULOS VISUALES
// =========================================================

interface EstimuloLugar {
  id: string;
  nombre: string;
  imagen: string;
  esObjetivo: boolean;
}

// =========================================================
// RESPUESTA DEL EJERCICIO 12
// =========================================================

export interface RespuestaEjercicio12 {
  valor: string;
}

// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector: 'app-ejercicio-12',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-12.html',
  styleUrl: './ejercicio-12.css'
})
export class Ejercicio12 implements OnChanges {

  // =======================================================
  // DATOS RECIBIDOS DEL COMPONENTE PADRE
  // =======================================================

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;

  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;

  @Input() enviando = false;

  // =======================================================
  // EVENTO PARA ENVIAR LA RESPUESTA
  // =======================================================

  @Output()
  respuesta = new EventEmitter<RespuestaEjercicio12>();

  // =======================================================
  // FASES DE LA ACTIVIDAD
  // =======================================================

  fase: 'observacion' | 'reconocimiento' = 'observacion';

  // =======================================================
  // ESTÍMULOS VISUALES
  // =======================================================

  imagenesObservacion: EstimuloLugar[] = [];

  opcionesReconocimiento: EstimuloLugar[] = [];

  // =======================================================
  // SELECCIONES DEL NIÑO
  // =======================================================

  seleccionadas: string[] = [];

  // =======================================================
  // RUTA DE LAS IMÁGENES
  // =======================================================

  private readonly rutaImagenes =
    'assets/kabc/ejercicios/ejercicio-12/lugares/';

  // =======================================================
  // CONFIGURACIÓN DE LAS TRES SERIES
  // =======================================================

  private readonly configuracionSeries = [
    {
      objetivos: [
        'escuela',
        'parque'
      ],
      distractores: [
        'restaurante',
        'estacion-tren'
      ]
    },
    {
      objetivos: [
        'supermercado',
        'hospital',
        'playa'
      ],
      distractores: [
        'museo',
        'panaderia',
        'bomberos'
      ]
    },
    {
      objetivos: [
        'biblioteca',
        'cine',
        'museo',
        'restaurante'
      ],
      distractores: [
        'panaderia',
        'bomberos',
        'estacion-tren',
        'supermercado'
      ]
    }
  ];

  // =======================================================
  // NOMBRES DE LOS LUGARES
  // =======================================================

  private readonly nombresLugares: Record<string, string> = {

    biblioteca: 'Biblioteca',

    bomberos: 'Estación de bomberos',

    cine: 'Cine',

    escuela: 'Escuela',

    'estacion-tren': 'Estación de tren',

    hospital: 'Hospital',

    museo: 'Museo',

    panaderia: 'Panadería',

    parque: 'Parque',

    playa: 'Playa',

    restaurante: 'Restaurante',

    supermercado: 'Supermercado'

  };

  // =======================================================
  // DETECTAR CAMBIOS EN LA SERIE
  // =======================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['numeroSerie'] ||
      changes['serie'] ||
      changes['item']
    ) {

      this.inicializarActividad();

    }

  }

  // =======================================================
  // CONSTRUIR UN ESTÍMULO
  // =======================================================

  private crearEstimulo(
    id: string,
    esObjetivo: boolean
  ): EstimuloLugar {

    return {

      id,

      nombre:
        this.nombresLugares[id] ?? id,

      imagen:
        `${this.rutaImagenes}${id}.jpg`,

      esObjetivo

    };

  }

  // =======================================================
  // MEZCLAR ALEATORIAMENTE LAS OPCIONES
  // =======================================================

  private mezclar<T>(elementos: T[]): T[] {

    const resultado = [...elementos];

    for (
      let i = resultado.length - 1;
      i > 0;
      i--
    ) {

      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [
        resultado[i],
        resultado[j]
      ] = [
        resultado[j],
        resultado[i]
      ];

    }

    return resultado;

  }

  // =======================================================
  // INICIALIZAR LA ACTIVIDAD
  // =======================================================

  private inicializarActividad(): void {

    const indice = Math.min(
      Math.max(Number(this.numeroSerie) - 1, 0),
      this.configuracionSeries.length - 1
    );

    const configuracion =
      this.configuracionSeries[indice];

    if (!configuracion) {

      console.error(
        '[Ejercicio12] No existe configuración para la serie:',
        this.numeroSerie
      );

      return;

    }

    // Estímulos que el niño debe memorizar.

    this.imagenesObservacion =
      configuracion.objetivos.map(id =>
        this.crearEstimulo(id, true)
      );

    // Opciones correctas.

    const objetivos =
      configuracion.objetivos.map(id =>
        this.crearEstimulo(id, true)
      );

    // Opciones distractoras.

    const distractores =
      configuracion.distractores.map(id =>
        this.crearEstimulo(id, false)
      );

    // Combinar y mezclar las opciones.

    this.opcionesReconocimiento = this.mezclar([
      ...objetivos,
      ...distractores
    ]);

    // Reiniciar la actividad.

    this.seleccionadas = [];

    this.fase = 'observacion';

    console.log(
      '[Ejercicio12] Actividad inicializada:',
      {
        serie: this.numeroSerie,
        objetivos: this.imagenesObservacion,
        opciones: this.opcionesReconocimiento
      }
    );

  }

  // =======================================================
  // COMENZAR LA FASE DE RECONOCIMIENTO
  // =======================================================

  comenzarReconocimiento(): void {

    if (this.enviando) {
      return;
    }

    this.fase = 'reconocimiento';

  }

  // =======================================================
  // SELECCIONAR O DESELECCIONAR UNA IMAGEN
  // =======================================================

  alternarSeleccion(id: string): void {

    if (
      this.enviando ||
      this.fase !== 'reconocimiento'
    ) {

      return;

    }

    if (this.seleccionadas.includes(id)) {

      this.seleccionadas =
        this.seleccionadas.filter(
          seleccionado => seleccionado !== id
        );

    } else {

      this.seleccionadas = [
        ...this.seleccionadas,
        id
      ];

    }

  }

  // =======================================================
  // COMPROBAR SI UNA IMAGEN ESTÁ SELECCIONADA
  // =======================================================

  estaSeleccionada(id: string): boolean {

    return this.seleccionadas.includes(id);

  }

  // =======================================================
  // GENERAR UNA RESPUESTA INCORRECTA
  // =======================================================

  private obtenerRespuestaIncorrecta(): string {

    const expected = this.serie?.expectedAnswer;

    // Si se esperaba un array, agregamos un elemento diferente.

    if (Array.isArray(expected)) {

      return JSON.stringify([
        ...expected,
        '__respuesta_incorrecta__'
      ]);

    }

    // Si se esperaba un texto, modificamos su contenido.

    if (typeof expected === 'string') {

      return `${expected}__incorrecta`;

    }

    // Respaldo para cualquier otro formato.

    return '__respuesta_incorrecta__';

  }

  // =======================================================
  // CONFIRMAR Y ENVIAR LA RESPUESTA
  // =======================================================

  confirmarRespuesta(): void {

    if (
      this.enviando ||
      this.fase !== 'reconocimiento' ||
      this.seleccionadas.length === 0
    ) {

      return;

    }

    // Lugares que el niño debía recordar.

    const objetivos =
      this.imagenesObservacion.map(
        imagen => imagen.id
      );

    // Lugares reconocidos correctamente.

    const aciertos =
      this.seleccionadas.filter(
        id => objetivos.includes(id)
      );

    // Lugares incorrectos seleccionados.

    const falsosPositivos =
      this.seleccionadas.filter(
        id => !objetivos.includes(id)
      );

    // Lugares que no fueron reconocidos.

    const omisiones =
      objetivos.filter(
        id => !this.seleccionadas.includes(id)
      );

    // =====================================================
    // EVALUACIÓN DE LA SERIE
    // =====================================================

    const correcta =
      aciertos.length === objetivos.length &&
      omisiones.length === 0 &&
      falsosPositivos.length === 0 &&
      this.seleccionadas.length === objetivos.length;

    // =====================================================
    // RESULTADO DETALLADO
    // =====================================================

    const resultado = {

      numeroSerie: this.numeroSerie,

      estimulosObservados: objetivos,

      selecciones: [...this.seleccionadas],

      aciertos: aciertos.length,

      omisiones: omisiones.length,

      falsosPositivos: falsosPositivos.length,

      totalObjetivos: objetivos.length,

      totalSeleccionadas: this.seleccionadas.length,

      porcentajeReconocimiento: Math.round(
        (aciertos.length / objetivos.length) * 100
      ),

      correcta

    };

    console.log(
      '[Ejercicio12] Resultado de la serie:',
      resultado
    );

    // =====================================================
    // ENVIAR RESPUESTA COMPATIBLE CON EL BACKEND
    // =====================================================

    // Si todos los lugares fueron reconocidos,
    // enviamos exactamente el expectedAnswer.

    // Si existe algún error,
    // enviamos un valor diferente.

    const valor = correcta
      ? this.serie.expectedAnswer
      : this.obtenerRespuestaIncorrecta();

    const valorFinal =
      typeof valor === 'string'
        ? valor
        : JSON.stringify(valor);

    console.log(
      '[Ejercicio12] Valor enviado al backend:',
      {
        correcta,
        valor: valorFinal
      }
    );

    this.respuesta.emit({

      valor: valorFinal

    });

  }

  // =======================================================
  // CANTIDAD DE LUGARES QUE DEBE RECORDAR
  // =======================================================

  get cantidadObjetivos(): number {

    return this.imagenesObservacion.length;

  }

  // =======================================================
  // VALIDAR SI PUEDE CONFIRMAR
  // =======================================================

  get puedeConfirmar(): boolean {

    return (
      this.seleccionadas.length > 0 &&
      !this.enviando
    );

  }

}
