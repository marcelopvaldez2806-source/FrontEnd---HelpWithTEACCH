import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import { Router } from '@angular/router';

import { Navbar } from '../../../layout/navbar/navbar';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';

import { AsignarNinoService } from '../../../core/services/asignar-nino.service';
import { NinoService } from '../../../core/services/nino.service';
import { environment } from '../../../../environments/environment';


/* =========================================================
   INTERFACES
   ========================================================= */

interface Nino {
  idNino: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  sexo?: string;
  etnia?: string;
  estado?: string;
}

interface Asignacion {
  idAsignarNino?: number;
  idNino: number;
  idUsuario: number;
  estado?: string;
}

interface OpcionPregunta {
  codigo?: string;
  valor: number;
  texto: string;
}

interface Pregunta {
  id: number;
  codigo?: string;
  texto: string;

  // Se utiliza en qchat.html
  categoria?: string;

  opciones: OpcionPregunta[];
}

interface EvaluacionResponse {
  idEvaluacion: number;
  idNino: number;
  idUsuario: number;
  idVersion: number;
  fechaEvaluacion: string;
  estado: string;
  itemActual: number;
  serieActual: number;
  progreso: number;
  fechaUltimoAcceso: string | null;
  fechaInicio: string | null;
  fechaFinalizacion: string | null;
}

interface RespuestaRegistrada {
  itemId: number;
  serieId: number;
  tipo: string;
  valor: number;
}

interface PrediccionML {
  idPrediccion?: number;
  idEvaluacion?: number;
  modelo: string;
  resultado: string;
  probabilidad: number;
  fechaPrediccion?: string;
}


/* =========================================================
   COMPONENTE
   ========================================================= */

@Component({
  selector: 'app-qchat',
  standalone: true,

  imports: [
    CommonModule,
    Navbar,
    Sidebar,
    Header
  ],

  templateUrl: './qchat.html',
  styleUrl: './qchat.css'
})
export class QChat implements OnInit {

  /* =======================================================
     CONFIGURACIÓN
     ======================================================= */

  private readonly API_URL =
  environment.apiUrl;

  private readonly ID_VERSION_QCHAT = 1;


  /* =======================================================
     SIDEBAR
     ======================================================= */

  sidebarExpanded = false;


  /* =======================================================
     USUARIO
     ======================================================= */

  usuarioId: number | null = null;


  /* =======================================================
     NIÑOS
     ======================================================= */

  ninos: Nino[] = [];

  ninoSeleccionado: Nino | null = null;


  /* =======================================================
     EVALUACIÓN
     ======================================================= */

  evaluacionId: number | null = null;

  evaluacionCreada = false;

  estadoEvaluacion = '';

  evaluacionCompletada = false;


  /* =======================================================
     PREGUNTAS
     ======================================================= */

  preguntas: Pregunta[] = [];

  indicePregunta = 0;

  respuestaSeleccionada: number | null = null;


  /* =======================================================
     RESPUESTAS
     ======================================================= */

  respuestasRegistradas: {
    [itemId: number]: number
  } = {};

  respuestas: RespuestaRegistrada[] = [];


  /* =======================================================
     MACHINE LEARNING
     ======================================================= */

  prediccionesML: PrediccionML[] = [];

  generandoPrediccion = false;

  prediccionGenerada = false;


  /* =======================================================
     ESTADOS DE CARGA
     ======================================================= */

  cargando = false;

  cargandoEvaluacion = false;

  cargandoPreguntas = false;

  enviandoRespuesta = false;


  /* =======================================================
     MENSAJES
     ======================================================= */

  mensajeError = '';

  mensajeExito = '';


  /* =======================================================
     CONSTRUCTOR
     ======================================================= */

  constructor(
    private router: Router,
    private asignarNinoService: AsignarNinoService,
    private ninoService: NinoService,

    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}


  /* =======================================================
     INIT
     ======================================================= */

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.obtenerUsuario();
  }


  /* =======================================================
     TOKEN / HEADERS
     ======================================================= */

  private obtenerHeaders(): HeadersInit {

    const token =
      localStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] =
        `Bearer ${token}`;
    }

    return headers;
  }


  /* =======================================================
     OBTENER USUARIO
     ======================================================= */

  private obtenerUsuario(): void {

    try {

      const usuarioGuardado =
        localStorage.getItem('usuario');

      if (!usuarioGuardado) {

        this.mensajeError =
          'No se encontró la información del usuario.';

        return;
      }

      const datos =
        JSON.parse(usuarioGuardado);

      this.usuarioId =
        datos?.usuario?.idUsuario ??
        datos?.idUsuario ??
        null;

      if (!this.usuarioId) {

        this.mensajeError =
          'No se pudo identificar al usuario.';

        return;
      }

      this.cargarNinos();

    } catch (error) {

      console.error(
        'Error obteniendo usuario:',
        error
      );

      this.mensajeError =
        'No se pudo obtener la información del usuario.';
    }
  }


  /* =======================================================
     CARGAR NIÑOS ASIGNADOS
     ======================================================= */

  cargarNinos(): void {

    if (!this.usuarioId) {
      return;
    }

    this.cargando = true;

    this.mensajeError = '';

    this.asignarNinoService
      .listarPorUsuario(
        this.usuarioId,
        'ACTIVO',
        0,
        50
      )
      .subscribe({

        next: (response: any) => {

          const asignaciones: Asignacion[] =
            response?.content ??
            response ??
            [];

          if (!asignaciones.length) {

            this.ninos = [];

            this.cargando = false;

            return;
          }

          const solicitudes =
            asignaciones.map(
              asignacion =>
                this.ninoService
                  .obtenerPorId(
                    asignacion.idNino
                  )
                  .toPromise()
                  .catch(() => null)
            );

          Promise.all(solicitudes)
            .then((ninos: any[]) => {

              this.ninos =
                ninos.filter(
                  (nino): nino is Nino =>
                    nino !== null
                );

              this.cargando = false;

            })
            .catch(error => {

              console.error(
                'Error cargando niños:',
                error
              );

              this.mensajeError =
                'No se pudieron cargar los niños.';

              this.cargando = false;
            });
        },

        error: error => {

          console.error(
            'Error obteniendo asignaciones:',
            error
          );

          this.mensajeError =
            'No se pudieron cargar los niños.';

          this.cargando = false;
        }

      });
  }


  /* =======================================================
     SELECCIONAR NIÑO
     ======================================================= */

  seleccionarNino(nino: Nino): void {

    this.ninoSeleccionado = nino;

    this.evaluacionId = null;

    this.evaluacionCreada = false;

    this.estadoEvaluacion = '';

    this.evaluacionCompletada = false;

    this.preguntas = [];

    this.indicePregunta = 0;

    this.respuestaSeleccionada = null;

    this.respuestasRegistradas = {};

    this.respuestas = [];

    this.prediccionesML = [];

    this.prediccionGenerada = false;

    this.mensajeError = '';

    this.mensajeExito = '';
  }


  /* =======================================================
     COMENZAR Q-CHAT
     ======================================================= */

  comenzarQChat(): void {

    if (!this.ninoSeleccionado) {

      this.mensajeError =
        'Selecciona un niño antes de comenzar.';

      return;
    }

    if (!this.usuarioId) {

      this.mensajeError =
        'No se pudo identificar al usuario.';

      return;
    }

    this.cargandoEvaluacion = true;

    this.mensajeError = '';

    const url =
      `${this.API_URL}/evaluaciones` +
      `?page=0` +
      `&size=50` +
      `&idNino=${this.ninoSeleccionado.idNino}` +
      `&idUsuario=${this.usuarioId}`;

    fetch(url, {
      method: 'GET',
      headers: this.obtenerHeaders()
    })
      .then(async response => {

        if (!response.ok) {

          throw new Error(
            `Error obteniendo evaluaciones (${response.status})`
          );
        }

        return response.json();
      })

      .then(data => {

        const evaluaciones:
          EvaluacionResponse[] =
          data?.content ?? [];

        const evaluacionEnCurso =
  evaluaciones.find(
    evaluacion =>
      evaluacion.estado === 'EN_PROGRESO' &&
      evaluacion.idVersion === this.ID_VERSION_QCHAT
  );

        if (evaluacionEnCurso) {

          this.evaluacionId =
            evaluacionEnCurso.idEvaluacion;

          this.estadoEvaluacion =
            evaluacionEnCurso.estado;

          this.evaluacionCreada = true;

          return this.cargarConfiguracion();
        }

        return this.crearEvaluacion();
      })

      .catch(error => {

        console.error(
          'Error iniciando Q-CHAT:',
          error
        );

        this.mensajeError =
          'No se pudo iniciar la evaluación.';

      })

      .finally(() => {

        this.cargandoEvaluacion = false;

      });
  }


  /* =======================================================
     CREAR EVALUACIÓN
     ======================================================= */

  private crearEvaluacion(): Promise<void> {

    if (!this.ninoSeleccionado ||
        !this.usuarioId) {

      return Promise.reject(
        new Error(
          'Faltan datos para crear la evaluación.'
        )
      );
    }

    const body = {

      idNino:
        this.ninoSeleccionado.idNino,

      idUsuario:
        this.usuarioId,

      idVersion:
        this.ID_VERSION_QCHAT

    };

    return fetch(
      `${this.API_URL}/evaluaciones`,
      {
        method: 'POST',

        headers:
          this.obtenerHeaders(),

        body:
          JSON.stringify(body)
      }
    )
      .then(async response => {

        if (!response.ok) {

          const errorText =
            await response.text();

          throw new Error(
            errorText ||
            `Error creando evaluación (${response.status})`
          );
        }

        return response.json();
      })

      .then((evaluacion:
        EvaluacionResponse) => {

        this.evaluacionId =
          evaluacion.idEvaluacion;

        this.estadoEvaluacion =
          evaluacion.estado;

        this.evaluacionCreada = true;

        this.evaluacionCompletada =
          evaluacion.estado === 'COMPLETADA';

        return this.cargarConfiguracion();
      });
  }


  /* =======================================================
     CARGAR CONFIGURACIÓN
     ======================================================= */

  private cargarConfiguracion(): Promise<void> {

    if (!this.evaluacionId) {

      return Promise.reject(
        new Error(
          'No existe una evaluación seleccionada.'
        )
      );
    }

    this.cargandoPreguntas = true;

    return fetch(
      `${this.API_URL}/evaluaciones/${this.evaluacionId}/configuracion`,
      {
        method: 'GET',
        headers: this.obtenerHeaders()
      }
    )
      .then(async response => {

        if (!response.ok) {

          throw new Error(
            `Error cargando configuración (${response.status})`
          );
        }

        return response.json();
      })

      .then(data => {

        const items =
          data?.assessment?.items ?? [];

        this.preguntas =
          items.map((item: any) => {

            const opciones =
              item.options ??
              item.opciones ??
              [];

            return {

              id: item.id,

              codigo:
                item.code ??
                item.codigo ??
                '',

              texto:
                item.text ??
                item.texto ??
                '',

              categoria:
                item.category ??
                item.categoria ??
                '',

              opciones:
                opciones.map(
                  (opcion: any) => ({

                    codigo:
                      opcion.code ??
                      opcion.codigo ??
                      '',

                    valor:
                      Number(
                        opcion.value ??
                        opcion.valor ??
                        0
                      ),

                    texto:
                      opcion.label ??
                      opcion.text ??
                      opcion.texto ??
                      ''

                  })
                )

            } as Pregunta;
          });

        this.indicePregunta = 0;

        this.cargarRespuestaActual();

      })

      .catch(error => {

        console.error(
          'Error cargando configuración:',
          error
        );

        this.mensajeError =
          'No se pudieron cargar las preguntas.';

        throw error;

      })

      .finally(() => {

        this.cargandoPreguntas = false;

      });
  }


  /* =======================================================
     PREGUNTA ACTUAL
     ======================================================= */

  get preguntaActual():
    Pregunta | null {

    if (!this.preguntas.length) {
      return null;
    }

    return (
      this.preguntas[
        this.indicePregunta
      ] ?? null
    );
  }


  /* =======================================================
     NÚMERO DE PREGUNTA
     ======================================================= */

  get numeroPreguntaActual(): number {

    return this.indicePregunta + 1;
  }


  /* =======================================================
     PROGRESO VISUAL
     ======================================================= */

  get progresoVisual(): number {

    if (!this.preguntas.length) {
      return 0;
    }

    return Math.round(
      (
        (this.indicePregunta + 1) /
        this.preguntas.length
      ) * 100
    );
  }


  /* =======================================================
     SELECCIONAR RESPUESTA
     ======================================================= */

  seleccionarRespuesta(
    valor: number
  ): void {

    this.respuestaSeleccionada =
      Number(valor);
  }


  /* =======================================================
     COMPROBAR RESPUESTA
     ======================================================= */

  esRespuestaSeleccionada(
    valor: number
  ): boolean {

    return (
      this.respuestaSeleccionada !== null &&
      Number(
        this.respuestaSeleccionada
      ) === Number(valor)
    );
  }


  /* =======================================================
     CARGAR RESPUESTA ACTUAL
     ======================================================= */

  private cargarRespuestaActual(): void {

    const pregunta =
      this.preguntaActual;

    if (!pregunta) {

      this.respuestaSeleccionada =
        null;

      return;
    }

    const respuesta =
      this.respuestasRegistradas[
        pregunta.id
      ];

    this.respuestaSeleccionada =
      respuesta !== undefined
        ? respuesta
        : null;
  }


  /* =======================================================
     GUARDAR RESPUESTA
     ======================================================= */

  guardarRespuesta(): void {

    if (!this.evaluacionId) {

      this.mensajeError =
        'No existe una evaluación activa.';

      return;
    }

    const pregunta =
      this.preguntaActual;

    if (!pregunta) {

      this.mensajeError =
        'No se encontró la pregunta actual.';

      return;
    }

    if (this.respuestaSeleccionada === null) {

      this.mensajeError =
        'Selecciona una respuesta antes de continuar.';

      return;
    }

    this.enviandoRespuesta = true;

    this.mensajeError = '';

    const valor =
      Number(this.respuestaSeleccionada);

    const body = {

      idEvaluacion:
        this.evaluacionId,

      items: [

        {

          itemId:
            pregunta.id,

          serieId:
            1,

          tipo:
            'SINGLE_CHOICE',

          valor:
            valor

        }

      ]

    };

    fetch(
      `${this.API_URL}/respuestas`,
      {
        method: 'POST',

        headers:
          this.obtenerHeaders(),

        body:
          JSON.stringify(body)
      }
    )
      .then(async response => {

        if (!response.ok) {

          const errorText =
            await response.text();

          throw new Error(
            errorText ||
            `Error guardando respuesta (${response.status})`
          );
        }

        return response.json().catch(
          () => null
        );
      })

      .then(() => {

        this.respuestasRegistradas[
          pregunta.id
        ] = valor;

        const respuestaExistente =
          this.respuestas.find(
            respuesta =>
              respuesta.itemId === pregunta.id
          );

        if (respuestaExistente) {

          respuestaExistente.valor =
            valor;

        } else {

          this.respuestas.push({

            itemId:
              pregunta.id,

            serieId:
              1,

            tipo:
              'SINGLE_CHOICE',

            valor:
              valor

          });

        }

        if (
          this.indicePregunta ===
          this.preguntas.length - 1
        ) {

          this.evaluacionCompletada =
            true;

          this.estadoEvaluacion =
            'COMPLETADA';

          this.mensajeExito =
            'Evaluación completada correctamente.';

          this.generarPrediccionML();

          return;
        }

        this.indicePregunta++;

        this.cargarRespuestaActual();

      })
      .catch(error => {

        console.error(
          'Error guardando respuesta:',
          error
        );

        this.mensajeError =
          error?.message ||
          'No se pudo guardar la respuesta.';

      })
      .finally(() => {

        this.enviandoRespuesta =
          false;

      });
  }


  /* =======================================================
     SIGUIENTE
     ======================================================= */

  siguientePregunta(): void {

    this.guardarRespuesta();
  }


  /* =======================================================
     ANTERIOR
     ======================================================= */

  anteriorPregunta(): void {

    if (
      this.indicePregunta <= 0
    ) {

      return;
    }

    this.indicePregunta--;

    this.cargarRespuestaActual();
  }


  /* =======================================================
     IR A PREGUNTA
     ======================================================= */

  irPregunta(
    indice: number
  ): void {

    if (
      indice < 0 ||
      indice >= this.preguntas.length
    ) {

      return;
    }

    this.indicePregunta =
      indice;

    this.cargarRespuestaActual();
  }


  /* =======================================================
     GENERAR PREDICCIÓN ML
     ======================================================= */

  generarPrediccionML(): void {

    if (!this.evaluacionId) {
      return;
    }

    this.generandoPrediccion = true;

    this.prediccionGenerada = false;

    fetch(
      `${this.API_URL}/predicciones-ml/evaluacion/${this.evaluacionId}`,
      {
        method: 'POST',

        headers:
          this.obtenerHeaders()
      }
    )
      .then(async response => {

        if (!response.ok) {

          const errorText =
            await response.text();

          throw new Error(
            errorText ||
            `Error generando predicción (${response.status})`
          );
        }

        return response.json();
      })

      .then(data => {

        this.prediccionesML =
          Array.isArray(data)
            ? data
            : data?.content ?? [];

        this.prediccionGenerada =
          true;

        if (this.evaluacionId) {

          this.router.navigate([
            '/evaluaciones/qchat/resultados',
            this.evaluacionId
          ]);

        }

      })
      .catch(error => {

        console.error(
          'Error generando predicción ML:',
          error
        );

        this.mensajeError =
          error?.message ||
          'No se pudo generar la predicción mediante Machine Learning.';

      })
      .finally(() => {

        this.generandoPrediccion =
          false;

      });
  }


  /* =======================================================
     CARGAR PREDICCIONES ML
     ======================================================= */

  cargarPrediccionesML(): void {

    if (!this.evaluacionId) {
      return;
    }

    fetch(
      `${this.API_URL}/predicciones-ml/evaluacion/${this.evaluacionId}`,
      {
        method: 'GET',

        headers:
          this.obtenerHeaders()
      }
    )
      .then(async response => {

        if (!response.ok) {

          throw new Error(
            `Error obteniendo predicciones (${response.status})`
          );
        }

        return response.json();
      })

      .then(data => {

        this.prediccionesML =
          Array.isArray(data)
            ? data
            : data?.content ?? [];

        this.prediccionGenerada =
          this.prediccionesML.length > 0;

      })
      .catch(error => {

        console.error(
          'Error cargando predicciones:',
          error
        );

      });
  }


  /* =======================================================
     SIDEBAR
     ======================================================= */

  onSidebarToggle(
    expanded: boolean
  ): void {

    this.sidebarExpanded =
      expanded;
  }


  /* =======================================================
     VOLVER
     ======================================================= */

  volver(): void {

    this.router.navigate([
      '/evaluaciones'
    ]);
  }

}