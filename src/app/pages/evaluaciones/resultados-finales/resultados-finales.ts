import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Navbar } from '../../../layout/navbar/navbar';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';
import { environment } from '../../../../environments/environment';

import {
  RespuestaService
} from '../../../core/services/respuesta.service';


// =========================================================
// INTERFAZ DEL PERFIL K-ABC
// =========================================================

interface PerfilKabc {

  codigo: string;

  nombre: string;

  porcentaje: number;

  prioridad: 'Alta' | 'Media' | 'Baja';

  estrategia: string;

}


// =========================================================
// INTERFAZ DE RESPUESTA K-ABC
// =========================================================

interface RespuestaKabc {

  idRespuesta?: number;

  idEvaluacion?: number;

  itemId: number;

  serieId: number;

  correcta: boolean;

  puntaje?: number;

  tipo?: string;

  valor?: any;

}


// =========================================================
// COMPONENTE
// =========================================================

@Component({

  selector: 'app-resultados-finales',

  standalone: true,

  imports: [

    CommonModule,

    Navbar,

    Sidebar,

    Header

  ],

  templateUrl: './resultados-finales.html',

  styleUrl: './resultados-finales.css'

})


export class ResultadosFinales implements OnInit {


  // =========================================================
  // SIDEBAR
  // =========================================================

  sidebarExpanded = false;


  // =========================================================
  // ESTADO
  // =========================================================

  cargando = true;

  error = '';

  idEvaluacion = 0;


  // =========================================================
  // Q-CHAT
  // =========================================================

  /*
   * Por ahora mantenemos el porcentaje de demostración
   * del Q-CHAT.
   *
   * El Q-CHAT ya tiene su propio flujo funcionando.
   * Posteriormente podemos obtener aquí el resultado
   * correspondiente a la misma evaluación/niño.
   */

  porcentajeQChat = 78;


  // =========================================================
  // PERFIL K-ABC
  // =========================================================

  perfilKabc: PerfilKabc[] = [];


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private respuestaService: RespuestaService,

    @Inject(PLATFORM_ID)
    private platformId: Object

  ) {}


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {


    // -------------------------------------------------------
    // Obtener ID de evaluación desde la URL
    // -------------------------------------------------------

    this.idEvaluacion = Number(

      this.route.snapshot.paramMap.get(
        'idEvaluacion'
      )

    );


    console.log(
      '========================================'
    );

    console.log(
      'RESULTADOS FINALES'
    );

    console.log(
      'ID EVALUACIÓN:',
      this.idEvaluacion
    );

    console.log(
      'PLATAFORMA:',
      isPlatformBrowser(
        this.platformId
      )
        ? 'BROWSER'
        : 'SERVER'
    );

    console.log(
      '========================================'
    );


    // -------------------------------------------------------
    // Validar ID
    // -------------------------------------------------------

    if (!this.idEvaluacion) {

      this.error =
        'No se encontró el ID de la evaluación.';

      this.cargando = false;

      return;

    }


    // -------------------------------------------------------
    // IMPORTANTE:
    //
    // Durante SSR no existe localStorage.
    //
    // El JWT que utiliza la aplicación está guardado
    // en localStorage, por lo que no podemos realizar
    // la petición autenticada durante SSR.
    // -------------------------------------------------------

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      console.log(
        'SSR detectado.'
      );

      console.log(
        'Se omite temporalmente la petición K-ABC.'
      );

      this.cargando = false;

      return;

    }


    // -------------------------------------------------------
    // Ya estamos en el navegador.
    // Podemos obtener las respuestas reales.
    // -------------------------------------------------------

    this.cargarResultadosKabc();

  }


  // =========================================================
  // CARGAR RESULTADOS K-ABC
  // =========================================================

  cargarResultadosKabc(): void {


    this.cargando = true;

    this.error = '';


    console.log(
      '========================================'
    );

    console.log(
      'CONSULTANDO RESPUESTAS K-ABC'
    );

    console.log(
      'ID EVALUACIÓN:',
      this.idEvaluacion
    );

    console.log(
      '========================================'
    );


    this.respuestaService

      .obtenerPorEvaluacion(
        this.idEvaluacion
      )

      .subscribe({

        // ===================================================
        // RESPUESTA EXITOSA
        // ===================================================

        next: (
          respuestas: RespuestaKabc[]
        ) => {


          console.log(
            '========================================'
          );

          console.log(
            'RESPUESTAS K-ABC RECIBIDAS'
          );

          console.log(
            respuestas
          );

          console.log(
            'TOTAL RESPUESTAS:',
            respuestas.length
          );

          console.log(
            '========================================'
          );


          // -------------------------------------------------
          // Calcular perfil
          // -------------------------------------------------

          this.calcularPerfilKabc(
            respuestas
          );


          this.cargando = false;

        },


        // ===================================================
        // ERROR
        // ===================================================

        error: (
          error: any
        ) => {


          console.error(
            '========================================'
          );

          console.error(
            'ERROR OBTENIENDO RESPUESTAS K-ABC'
          );

          console.error(
            error
          );

          console.error(
            '========================================'
          );


          // -------------------------------------------------
          // Mensaje amigable
          // -------------------------------------------------

          if (
            error?.status === 403
          ) {

            this.error =
              'No tienes permisos para consultar los resultados de esta evaluación.';

          }

          else if (
            error?.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          }

          else {

            this.error =
              'No se pudieron cargar los resultados K-ABC.';

          }


          this.cargando = false;

        }

      });

  }


  // =========================================================
  // CALCULAR PERFIL K-ABC
  // =========================================================

  private calcularPerfilKabc(

    respuestas: RespuestaKabc[]

  ): void {


    /*
     * Actualmente tenemos implementadas
     * 6 actividades K-ABC.
     *
     * Cada actividad tiene 3 series.
     */


    const actividades = [


      // -----------------------------------------------------
      // EJERCICIO 01
      // -----------------------------------------------------

      {

        itemId: 1,

        codigo: 'MM_01',

        nombre: 'Movimientos de manos',

        estrategia:
          'Utilizar secuencias visuales paso a paso, modelado de la actividad y una estructura clara de inicio y finalización.'

      },


      // -----------------------------------------------------
      // EJERCICIO 02
      // -----------------------------------------------------

      {

        itemId: 2,

        codigo: 'RN_01',

        nombre: 'Recuerdo de números',

        estrategia:
          'Presentar instrucciones breves, dividir la información en pequeñas unidades y utilizar repetición y apoyos visuales.'

      },


      // -----------------------------------------------------
      // EJERCICIO 03
      // -----------------------------------------------------

      {

        itemId: 3,

        codigo: 'OP_01',

        nombre: 'Orden de palabras',

        estrategia:
          'Utilizar tarjetas visuales para representar primero, después y finalmente, reforzando la secuencia de acciones.'

      },


      // -----------------------------------------------------
      // EJERCICIO 04
      // -----------------------------------------------------

      {

        itemId: 4,

        codigo: 'VM_01',

        nombre: 'Ventana mágica',

        estrategia:
          'Presentar estímulos visuales de manera progresiva y reducir elementos distractores durante la actividad.'

      },


      // -----------------------------------------------------
      // EJERCICIO 05
      // -----------------------------------------------------

      {

        itemId: 5,

        codigo: 'RC_01',

        nombre: 'Reconocimiento de caras',

        estrategia:
          'Mantener apoyos visuales organizados y utilizar actividades de asociación y reconocimiento de manera gradual.'

      },


      // -----------------------------------------------------
      // EJERCICIO 06
      // -----------------------------------------------------

      {

        itemId: 6,

        codigo: 'CG_01',

        nombre: 'Cierre gestáltico',

        estrategia:
          'Utilizar imágenes parcialmente ocultas y proporcionar claves visuales progresivas para facilitar el reconocimiento del todo.'

      }

    ];


    // =======================================================
    // GENERAR PERFIL
    // =======================================================

    this.perfilKabc = actividades.map(

      actividad => {


        // ---------------------------------------------------
        // Buscar respuestas del item
        // ---------------------------------------------------

        const respuestasItem =

          respuestas.filter(

            respuesta =>

              Number(
                respuesta.itemId
              ) === actividad.itemId

          );


        // ---------------------------------------------------
        // Contar respuestas correctas
        // ---------------------------------------------------

        const correctas =

          respuestasItem.filter(

            respuesta =>

              respuesta.correcta === true

          ).length;


        // ---------------------------------------------------
        // Calcular porcentaje
        // ---------------------------------------------------

        const porcentaje =

          respuestasItem.length > 0

            ? Math.round(

                (

                  correctas /

                  respuestasItem.length

                ) * 100

              )

            : 0;


        // ---------------------------------------------------
        // Determinar prioridad
        // ---------------------------------------------------

        const prioridad =

          this.obtenerPrioridad(
            porcentaje
          );


        return {


          codigo:
            actividad.codigo,


          nombre:
            actividad.nombre,


          porcentaje,


          prioridad,


          estrategia:
            actividad.estrategia

        };

      }

    );


    // =======================================================
    // MOSTRAR RESULTADO EN CONSOLA
    // =======================================================

    console.log(
      '========================================'
    );

    console.log(
      'PERFIL K-ABC REAL CALCULADO'
    );

    console.table(
      this.perfilKabc
    );

    console.log(
      'PROMEDIO K-ABC:',
      this.obtenerPromedioKabc()
    );

    console.log(
      '========================================'
    );

  }


  // =========================================================
  // DETERMINAR PRIORIDAD
  // =========================================================

  obtenerPrioridad(

    porcentaje: number

  ): 'Alta' | 'Media' | 'Baja' {


    if (
      porcentaje < 60
    ) {

      return 'Alta';

    }


    if (
      porcentaje < 80
    ) {

      return 'Media';

    }


    return 'Baja';

  }


  // =========================================================
  // SIDEBAR TOGGLE
  // =========================================================

  onSidebarToggle(

    expanded: boolean

  ): void {


    this.sidebarExpanded =
      expanded;

  }


  // =========================================================
  // VOLVER AL LISTADO
  // =========================================================

  volverListado(): void {


    this.router.navigate([
      '/resultados'
    ]);

  }


  // =========================================================
  // RADAR
  // =========================================================

  readonly radarCentro = 200;

  readonly radarRadio = 140;


  // =========================================================
  // OBTENER ÁNGULO
  // =========================================================

  obtenerAngulo(

    indice: number

  ): number {


    const total =
      this.perfilKabc.length;


    if (
      total === 0
    ) {

      return 0;

    }


    return (

      -Math.PI / 2 +

      (

        2 *

        Math.PI *

        indice

      ) /

      total

    );

  }


  // =========================================================
  // OBTENER X
  // =========================================================

  obtenerX(

    indice: number,

    porcentaje: number,

    radio = this.radarRadio

  ): number {


    const angulo =
      this.obtenerAngulo(
        indice
      );


    const distancia =

      radio *

      (
        porcentaje /
        100
      );


    return (

      this.radarCentro +

      Math.cos(
        angulo
      ) *

      distancia

    );

  }


  // =========================================================
  // OBTENER Y
  // =========================================================

  obtenerY(

    indice: number,

    porcentaje: number,

    radio = this.radarRadio

  ): number {


    const angulo =
      this.obtenerAngulo(
        indice
      );


    const distancia =

      radio *

      (
        porcentaje /
        100
      );


    return (

      this.radarCentro +

      Math.sin(
        angulo
      ) *

      distancia

    );

  }


  // =========================================================
  // PUNTOS DEL PERFIL
  // =========================================================

  obtenerPuntosPerfil(): string {


    return this.perfilKabc

      .map(

        (
          item,

          indice

        ) => {


          const x =
            this.obtenerX(

              indice,

              item.porcentaje

            );


          const y =
            this.obtenerY(

              indice,

              item.porcentaje

            );


          return `${x},${y}`;

        }

      )

      .join(' ');

  }


  // =========================================================
  // PUNTOS DE NIVEL DEL RADAR
  // =========================================================

  obtenerPuntosNivel(

    porcentaje: number

  ): string {


    return this.perfilKabc

      .map(

        (

          _,

          indice

        ) => {


          const x =
            this.obtenerX(

              indice,

              porcentaje

            );


          const y =
            this.obtenerY(

              indice,

              porcentaje

            );


          return `${x},${y}`;

        }

      )

      .join(' ');

  }


  // =========================================================
  // LABEL X
  // =========================================================

  obtenerLabelX(

    indice: number

  ): number {


    const angulo =
      this.obtenerAngulo(
        indice
      );


    const radio =
      165;


    return (

      this.radarCentro +

      Math.cos(
        angulo
      ) *

      radio

    );

  }


  // =========================================================
  // LABEL Y
  // =========================================================

  obtenerLabelY(

    indice: number

  ): number {


    const angulo =
      this.obtenerAngulo(
        indice
      );


    const radio =
      165;


    return (

      this.radarCentro +

      Math.sin(
        angulo
      ) *

      radio

    );

  }


  // =========================================================
  // CLASE DE PRIORIDAD
  // =========================================================

  obtenerClasePrioridad(

    prioridad: string

  ): string {


    switch (
      prioridad
    ) {


      case 'Alta':

        return 'priority-high';


      case 'Media':

        return 'priority-medium';


      default:

        return 'priority-low';

    }

  }


  // =========================================================
  // PROMEDIO K-ABC
  // =========================================================

  obtenerPromedioKabc(): number {


    if (
      !this.perfilKabc.length
    ) {

      return 0;

    }


    const suma =

      this.perfilKabc.reduce(

        (

          total,

          item

        ) =>

          total +
          item.porcentaje,

        0

      );


    return Math.round(

      suma /
      this.perfilKabc.length

    );

  }


  // =========================================================
  // ÁREAS PRIORITARIAS
  // =========================================================

  obtenerAreasPrioritarias():

    PerfilKabc[] {


    return this.perfilKabc

      .filter(

        item =>

          item.prioridad === 'Alta' ||

          item.prioridad === 'Media'

      )

      .sort(

        (

          a,

          b

        ) =>

          a.porcentaje -
          b.porcentaje

      );

  }

}