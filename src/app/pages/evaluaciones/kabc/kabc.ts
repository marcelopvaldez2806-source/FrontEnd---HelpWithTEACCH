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
import { RespuestaService } from '../../../core/services/respuesta.service';
import { EvaluacionService } from '../../../core/services/evaluacion.service';
import { environment } from '../../../../environments/environment';



import {
  Ejercicio01,
  ItemKabc,
  SerieKabc,
  RespuestaEjercicio01
} from './ejercicios/ejercicio-01/ejercicio-01';
import {
  Ejercicio02,
  RespuestaEjercicio02
} from './ejercicios/ejercicio-02/ejercicio-02';
import {
  Ejercicio03,
  RespuestaEjercicio03
} from './ejercicios/ejercicio-03/ejercicio-03';
import {
  Ejercicio04,
  RespuestaEjercicio04
} from './ejercicios/ejercicio-04/ejercicio-04';
import {
  Ejercicio05,
  RespuestaEjercicio05
} from './ejercicios/ejercicio-05/ejercicio-05';
import {
  Ejercicio06,
  RespuestaEjercicio06
} from './ejercicios/ejercicio-06/ejercicio-06';


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


@Component({
  selector: 'app-kabc',
  standalone: true,

  imports: [
    CommonModule,
    Navbar,
    Sidebar,
    Header,
    Ejercicio01,
    Ejercicio02,
    Ejercicio03,
    Ejercicio04,
    Ejercicio05,
    Ejercicio06
  ],

  templateUrl: './kabc.html',
  styleUrl: './kabc.css'
})
export class Kabc implements OnInit {

  private readonly API_URL =
    `${environment.apiUrl}`;

  /**
   * K-ABC = idVersion 2
   */
  private readonly ID_VERSION_KABC = 2;


  // =========================================================
  // SIDEBAR
  // =========================================================

  sidebarExpanded = false;


  // =========================================================
  // USUARIO
  // =========================================================

  usuarioId: number | null = null;


  // =========================================================
  // NIÑOS
  // =========================================================

  ninos: Nino[] = [];

  ninoSeleccionado: Nino | null = null;


  // =========================================================
  // EVALUACIÓN
  // =========================================================

  evaluacionId: number | null = null;

  evaluacionCreada = false;

  estadoEvaluacion = '';

  evaluacionCompletada = false;


  // =========================================================
  // CONFIGURACIÓN K-ABC
  // =========================================================

  items: ItemKabc[] = [];

  indiceItem = 0;

  indiceSerie = 0;


  // =========================================================
  // ESTADOS
  // =========================================================

  enviandoRespuesta = false;

  cargando = false;

  cargandoEvaluacion = false;

  cargandoConfiguracion = false;


  // =========================================================
  // MENSAJES
  // =========================================================

  mensajeError = '';

  mensajeExito = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

 constructor(
  private router: Router,
  private asignarNinoService: AsignarNinoService,
  private ninoService: NinoService,
  private respuestaService: RespuestaService,
  private evaluacionService: EvaluacionService,

  @Inject(PLATFORM_ID)
  private platformId: object
) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.obtenerUsuario();

  }


  // =========================================================
  // HEADERS
  // =========================================================

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


  // =========================================================
  // OBTENER USUARIO
  // =========================================================

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


  // =========================================================
  // CARGAR NIÑOS
  // =========================================================

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

          const asignaciones:
            Asignacion[] =
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


  // =========================================================
  // SELECCIONAR NIÑO
  // =========================================================

  seleccionarNino(
    nino: Nino
  ): void {

    this.ninoSeleccionado = nino;

    this.evaluacionId = null;

    this.evaluacionCreada = false;

    this.estadoEvaluacion = '';

    this.evaluacionCompletada = false;

    this.items = [];

    this.indiceItem = 0;

    this.indiceSerie = 0;

    this.mensajeError = '';

    this.mensajeExito = '';

  }


 /* =======================================================
   COMENZAR K-ABC
   ======================================================= */

comenzarKabc(): void {

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
  this.mensajeExito = '';

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

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          `Error obteniendo evaluaciones (${response.status})`
        );
      }

      return response.json();
    })

    .then(data => {

      /*
       * El backend devuelve normalmente:
       *
       * {
       *   content: [...]
       * }
       *
       * Pero dejamos soporte también
       * por si devuelve directamente un array.
       */

      const evaluaciones: EvaluacionResponse[] =
        Array.isArray(data)
          ? data
          : (data?.content ?? []);

      console.log(
        'Evaluaciones encontradas para el niño:',
        evaluaciones
      );

      /*
       * Buscamos específicamente una evaluación
       * K-ABC en progreso.
       *
       * K-ABC = idVersion 2
       */

      const evaluacionKabcEnCurso =
        evaluaciones.find(evaluacion => {

          const estado =
            String(evaluacion.estado ?? '')
              .trim()
              .toUpperCase()
              .replace(/ /g, '_');

          return (
            estado === 'EN_PROGRESO' &&
            Number(evaluacion.idVersion) ===
              this.ID_VERSION_KABC
          );

        });

      /*
       * Si ya existe una evaluación K-ABC
       * en progreso, la recuperamos.
       */

      if (evaluacionKabcEnCurso) {

        console.log(
          'Recuperando evaluación K-ABC:',
          evaluacionKabcEnCurso
        );

        this.evaluacionId =
          evaluacionKabcEnCurso.idEvaluacion;

        this.estadoEvaluacion =
          evaluacionKabcEnCurso.estado;

        this.evaluacionCreada = true;

        this.evaluacionCompletada =
          evaluacionKabcEnCurso.estado ===
          'COMPLETADA';

        /*
         * Recuperamos la configuración K-ABC.
         */

        return this.cargarConfiguracion();
      }

      /*
       * Revisamos si existe OTRA evaluación
       * en progreso para el mismo niño.
       *
       * El backend actualmente impide crear
       * una segunda evaluación mientras exista
       * otra en progreso.
       */

      const otraEvaluacionEnCurso =
        evaluaciones.find(evaluacion => {

          const estado =
            String(evaluacion.estado ?? '')
              .trim()
              .toUpperCase()
              .replace(/ /g, '_');

          return (
            estado === 'EN_PROGRESO' &&
            Number(evaluacion.idVersion) !==
              this.ID_VERSION_KABC
          );

        });

      if (otraEvaluacionEnCurso) {

        console.warn(
          'Existe otra evaluación en progreso:',
          otraEvaluacionEnCurso
        );

        this.mensajeError =
          'Este niño tiene otra evaluación en progreso. ' +
          'Debes finalizarla o cancelarla antes de iniciar el K-ABC.';

        return;
      }

      /*
       * No existe ninguna evaluación en progreso.
       * Podemos crear una nueva K-ABC.
       */

      return this.crearEvaluacion();

    })

    .catch(error => {

      console.error(
        'Error iniciando K-ABC:',
        error
      );

      /*
       * El backend puede detectar la evaluación
       * en progreso incluso si el GET no la encontró.
       *
       * Mostramos un mensaje más amigable.
       */

      let mensaje =
        error?.message ||
        '';

      try {

        const json =
          JSON.parse(mensaje);

        if (
          json?.message?.includes(
            'evaluación en progreso'
          )
        ) {

          mensaje =
            'Este niño ya tiene una evaluación en progreso. ' +
            'Debes finalizarla o cancelarla antes de iniciar el K-ABC.';

        }

      } catch {
        // El mensaje no era JSON.
      }

      this.mensajeError =
        mensaje ||
        'No se pudo iniciar la evaluación K-ABC.';

    })

    .finally(() => {

      this.cargandoEvaluacion = false;

    });

}

  // =========================================================
  // CREAR EVALUACIÓN
  // =========================================================

  private crearEvaluacion(): Promise<void> {

    if (
      !this.ninoSeleccionado ||
      !this.usuarioId
    ) {

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
        this.ID_VERSION_KABC

    };


    console.log(
      'Creando evaluación K-ABC:',
      body
    );


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


      .then(
        (
          evaluacion:
            EvaluacionResponse
        ) => {

          console.log(
            'Evaluación K-ABC creada:',
            evaluacion
          );


          this.evaluacionId =
            evaluacion.idEvaluacion;

          this.estadoEvaluacion =
            evaluacion.estado;

          this.evaluacionCreada =
            true;

          this.evaluacionCompletada =
            evaluacion.estado ===
            'COMPLETADA';


          return this.cargarConfiguracion();

        }
      );

  }

// =========================================================
// CARGAR CONFIGURACIÓN
// =========================================================

private cargarConfiguracion(): Promise<void> {

  if (!this.evaluacionId) {

    return Promise.reject(
      new Error(
        'No existe una evaluación seleccionada.'
      )
    );

  }


  this.cargandoConfiguracion =
    true;


  return fetch(
    `${this.API_URL}/evaluaciones/${this.evaluacionId}/configuracion`,
    {
      method: 'GET',
      headers: this.obtenerHeaders()
    }
  )

    .then(async response => {

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          `Error cargando configuración (${response.status})`
        );
      }

      return response.json();

    })


    .then(data => {

      console.log(
        '========== K-ABC CONFIGURACIÓN =========='
      );

      console.log(
        'Respuesta completa:',
        data
      );

      console.log(
        'Assessment:',
        data?.assessment
      );

      console.log(
        'Items:',
        data?.assessment?.items
      );


      // =====================================================
      // POR AHORA SOLO USAMOS LOS 6 EJERCICIOS IMPLEMENTADOS
      // =====================================================

      const items =
        (data?.assessment?.items ?? []).slice(0, 6);


      this.items =
        items.map(
          (item: any): ItemKabc => ({

            id:
              item.id,

            code:
              item.code ??
              item.codigo ??
              '',

            subtest:
              item.subtest ??
              '',

            type:
              item.type ??
              '',

            question:
              item.question ??
              item.text ??
              '',

            instruction:
              item.instruction ??
              '',

            series:
              item.series ??
              [],

            scoringRule:
              item.scoringRule ??
              '',

            maxScore:
              item.maxScore ??
              1

          })
        );


      console.log(
        'Items cargados:',
        this.items
      );

      console.log(
        'Total de ejercicios implementados:',
        this.items.length
      );

      console.log(
        'Total de series implementadas:',
        this.items.reduce(
          (total, item) =>
            total + (item.series?.length ?? 0),
          0
        )
      );


      this.indiceItem = 0;

      this.indiceSerie = 0;


      if (
        this.items.length === 0
      ) {

        this.mensajeError =
          'La configuración K-ABC no contiene actividades.';

      }

    })


    .catch(error => {

      console.error(
        'Error cargando configuración K-ABC:',
        error
      );

      this.mensajeError =
        error?.message ||
        'No se pudo cargar la configuración K-ABC.';

      throw error;

    })


    .finally(() => {

      this.cargandoConfiguracion =
        false;

    });

}

  // =========================================================
  // ITEM ACTUAL
  // =========================================================

  get itemActual(): ItemKabc | null {

    if (!this.items.length) {
      return null;
    }

    return (
      this.items[this.indiceItem] ??
      null
    );

  }


  // =========================================================
  // SERIE ACTUAL
  // =========================================================

  get serieActual(): SerieKabc | null {

    const item =
      this.itemActual;

    if (!item) {
      return null;
    }

    return (
      item.series[this.indiceSerie] ??
      null
    );

  }


  // =========================================================
  // TOTAL SERIES
  // =========================================================

  get totalSeries(): number {

    return this.items.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.series?.length ??
          0
        ),
      0
    );

  }


  // =========================================================
  // SERIE GLOBAL
  // =========================================================

  get serieGlobalActual(): number {

    let contador = 0;


    for (
      let i = 0;
      i < this.indiceItem;
      i++
    ) {

      contador +=
        this.items[i]?.series?.length ??
        0;

    }


    return (
      contador +
      this.indiceSerie +
      1
    );

  }


  // =========================================================
  // PROGRESO
  // =========================================================

  get progresoVisual(): number {

    if (!this.totalSeries) {
      return 0;
    }


    return Math.round(
      (
        this.serieGlobalActual /
        this.totalSeries
      ) * 100
    );

  }


  // =========================================================
  // EJERCICIO 01 ACTUAL
  // =========================================================

  get ejercicio01Item(): ItemKabc | null {

    if (
      this.indiceItem !== 0
    ) {
      return null;
    }

    return this.itemActual;

  }


  get ejercicio01Serie(): SerieKabc | null {

    if (
      this.indiceItem !== 0
    ) {
      return null;
    }

    return this.serieActual;

  }


  // =========================================================
  // RECIBIR RESPUESTA DEL EJERCICIO 01
  // =========================================================

  guardarRespuestaEjercicio01(
  respuesta: RespuestaEjercicio01
): void {

  if (!this.evaluacionId) {
    this.mensajeError = 'No existe una evaluación activa.';
    return;
  }

  const item = this.itemActual;
  const serie = this.serieActual;

  if (!item || !serie) {
    this.mensajeError = 'No se encontró la actividad actual.';
    return;
  }

  this.enviandoRespuesta = true;
  this.mensajeError = '';
  this.mensajeExito = '';

  const body = {
    idEvaluacion: this.evaluacionId,
    items: [
      {
        itemId: item.id,
        serieId: serie.id,
        tipo: item.type ?? 'KABC',

        // El backend espera "valor" como String.
        // Si la respuesta es un array/objeto, se serializa
        // como JSON dentro del String.
        valor:
          typeof respuesta.valor === 'string'
            ? respuesta.valor
            : JSON.stringify(respuesta.valor)
      }
    ]
  };

  console.log(
    'Enviando respuesta K-ABC:',
    body
  );

  fetch(
    `${this.API_URL}/respuestas`,
    {
      method: 'POST',
      headers: this.obtenerHeaders(),
      body: JSON.stringify(body)
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

      return response
        .json()
        .catch(() => null);

    })

    .then(() => {

      this.mensajeExito =
        'Respuesta registrada correctamente.';

      this.avanzarSerie();

    })

    .catch(error => {

      console.error(
        'Error guardando respuesta K-ABC:',
        error
      );

      this.mensajeError =
        error?.message ||
        'No se pudo guardar la respuesta.';

    })

    .finally(() => {

      this.enviandoRespuesta = false;

    });
}

// =========================================================
// RECIBIR RESPUESTA DEL EJERCICIO 02
// =========================================================

guardarRespuestaEjercicio02(
  respuesta: RespuestaEjercicio02
): void {

  if (!this.evaluacionId) {

    this.mensajeError =
      'No existe una evaluación activa.';

    return;
  }

  const item =
    this.itemActual;

  const serie =
    this.serieActual;

  if (!item || !serie) {

    this.mensajeError =
      'No se encontró la actividad actual.';

    return;
  }

  this.enviandoRespuesta = true;

  this.mensajeError = '';
  this.mensajeExito = '';

  const body = {

    idEvaluacion:
      this.evaluacionId,

    items: [

      {

        itemId:
          item.id,

        serieId:
          serie.id,

        tipo:
          item.type ??
          'AUDIO_SEQUENCE',

        valor:
          respuesta.valor

      }

    ]

  };

  console.log(
    'Enviando respuesta K-ABC - Ejercicio 02:',
    body
  );

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

      return response
        .json()
        .catch(
          () => null
        );

    })

    .then(() => {

      this.mensajeExito =
        'Respuesta registrada correctamente.';

      this.avanzarSerie();

    })

    .catch(error => {

      console.error(
        'Error guardando respuesta K-ABC - Ejercicio 02:',
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
guardarRespuestaEjercicio03(
  respuesta: RespuestaEjercicio03
): void {
  if (this.enviandoRespuesta || !this.evaluacionId) {
    return;
  }

  const item = this.itemActual;
  const serie = this.serieActual;

  if (!item || !serie) {
    console.error('No existe item o serie actual.');
    return;
  }

  this.enviandoRespuesta = true;
  this.mensajeError = '';

  const body = {
    idEvaluacion: this.evaluacionId,
    items: [
      {
        itemId: item.id,
        serieId: serie.id,
        tipo: item.type ?? 'SEQUENCE_SELECTION',
        valor: respuesta.valor
      }
    ]
  };

  console.log(
    'Enviando respuesta Ejercicio 03:',
    body
  );

  this.respuestaService
    .guardarRespuestas(body)
    .subscribe({
      next: () => {
        console.log(
          'Respuesta Ejercicio 03 guardada correctamente.'
        );

        this.enviandoRespuesta = false;

        this.avanzarSerie();
      },

      error: (error: unknown) => {
        console.error(
          'Error guardando Ejercicio 03:',
          error
        );

        this.enviandoRespuesta = false;

        this.mensajeError =
          'No se pudo guardar la respuesta. Inténtalo nuevamente.';
      }
    });
}
guardarRespuestaEjercicio04(
  respuesta: RespuestaEjercicio04
): void {

  if (
    this.enviandoRespuesta ||
    !this.evaluacionId
  ) {
    return;
  }

  const item = this.itemActual;
  const serie = this.serieActual;

  if (!item || !serie) {
    console.error(
      'No existe item o serie actual.'
    );
    return;
  }

  this.enviandoRespuesta = true;
  this.mensajeError = '';

  const body = {
    idEvaluacion: this.evaluacionId,

    items: [
      {
        itemId: item.id,
        serieId: serie.id,
        tipo: item.type ?? 'PROGRESSIVE_REVEAL',
        valor: respuesta.valor
      }
    ]
  };

  console.log(
    'Enviando respuesta Ejercicio 04:',
    body
  );

  this.respuestaService
    .guardarRespuestas(body)
    .subscribe({

      next: () => {

        console.log(
          'Respuesta Ejercicio 04 guardada correctamente.'
        );

        this.enviandoRespuesta = false;

        this.avanzarSerie();
      },

      error: (error: unknown) => {

        console.error(
          'Error guardando Ejercicio 04:',
          error
        );

        this.enviandoRespuesta = false;

        this.mensajeError =
          'No se pudo guardar la respuesta. Inténtalo nuevamente.';
      }

    });
}
guardarRespuestaEjercicio05(
  respuesta: RespuestaEjercicio05
): void {

  if (
    this.enviandoRespuesta ||
    !this.evaluacionId
  ) {
    return;
  }

  const item = this.itemActual;
  const serie = this.serieActual;

  if (!item || !serie) {
    console.error(
      'No existe item o serie actual.'
    );
    return;
  }

  this.enviandoRespuesta = true;
  this.mensajeError = '';

  const body = {
    idEvaluacion: this.evaluacionId,

    items: [
      {
        itemId: item.id,
        serieId: serie.id,
        tipo: item.type ?? 'FACE_RECOGNITION',
        valor: respuesta.valor
      }
    ]
  };

  console.log(
    'Enviando respuesta Ejercicio 05:',
    body
  );

  this.respuestaService
    .guardarRespuestas(body)
    .subscribe({
      next: () => {

        console.log(
          'Respuesta Ejercicio 05 guardada correctamente.'
        );

        this.enviandoRespuesta = false;

        this.avanzarSerie();
      },

      error: (error: unknown) => {

        console.error(
          'Error guardando Ejercicio 05:',
          error
        );

        this.enviandoRespuesta = false;

        this.mensajeError =
          'No se pudo guardar la respuesta. Inténtalo nuevamente.';
      }
    });
}
guardarRespuestaEjercicio06(
  respuesta: RespuestaEjercicio06
): void {

  if (
    this.enviandoRespuesta ||
    !this.evaluacionId
  ) {
    return;
  }

  const item = this.itemActual;
  const serie = this.serieActual;

  if (!item || !serie) {
    console.error(
      'No existe item o serie actual.'
    );
    return;
  }

  this.enviandoRespuesta = true;
  this.mensajeError = '';

  const body = {
    idEvaluacion: this.evaluacionId,

    items: [
      {
        itemId: item.id,
        serieId: serie.id,
        tipo: item.type ?? 'IMAGE_SELECTION',
        valor: respuesta.valor
      }
    ]
  };

  console.log(
    'Enviando respuesta Ejercicio 06:',
    body
  );

  this.respuestaService
    .guardarRespuestas(body)
    .subscribe({

      next: () => {

        console.log(
          'Respuesta Ejercicio 06 guardada correctamente.'
        );

        this.enviandoRespuesta = false;

        this.avanzarSerie();
      },

      error: (error: unknown) => {

        console.error(
          'Error guardando Ejercicio 06:',
          error
        );

        this.enviandoRespuesta = false;

        this.mensajeError =
          'No se pudo guardar la respuesta. Inténtalo nuevamente.';
      }

    });
}






  // =========================================================
  // AVANZAR
  // =========================================================

  private avanzarSerie(): void {

  const item =
    this.itemActual;

  if (!item) {
    return;
  }


  // -----------------------------------------------
  // SIGUIENTE SERIE
  // -----------------------------------------------

  if (
    this.indiceSerie <
    item.series.length - 1
  ) {

    this.indiceSerie++;

    return;
  }


  // -----------------------------------------------
  // SIGUIENTE ITEM
  // -----------------------------------------------

  if (
    this.indiceItem <
    this.items.length - 1
  ) {

    this.indiceItem++;

    this.indiceSerie = 0;

    this.mensajeExito = '';

    return;
  }


  // -----------------------------------------------
  // FIN DE LA EVALUACIÓN
  // -----------------------------------------------

  this.finalizarEvaluacion();

}
// =========================================================
// FINALIZAR EVALUACIÓN
// =========================================================

private finalizarEvaluacion(): void {

  if (!this.evaluacionId) {

    console.error(
      'No existe ID de evaluación para finalizar.'
    );

    this.mensajeError =
      'No se pudo finalizar la evaluación.';

    return;
  }


  this.enviandoRespuesta = true;

  this.mensajeError = '';


  console.log(
    'Finalizando evaluación K-ABC:',
    this.evaluacionId
  );


  this.evaluacionService
    .finalizar(this.evaluacionId)
    .subscribe({

      next: (respuesta) => {

        console.log(
          'Evaluación K-ABC finalizada correctamente:',
          respuesta
        );


        this.enviandoRespuesta =
          false;


        this.evaluacionCompletada =
          true;


        this.estadoEvaluacion =
          respuesta.estado ??
          'COMPLETADA';


        this.mensajeExito =
          'Evaluación K-ABC completada correctamente.';

      },


      error: (error: unknown) => {

        console.error(
          'Error finalizando evaluación K-ABC:',
          error
        );


        this.enviandoRespuesta =
          false;


        this.evaluacionCompletada =
          false;


        this.mensajeError =
          'No se pudo finalizar la evaluación. Inténtalo nuevamente.';

      }

    });

}


  // =========================================================
  // SIDEBAR
  // =========================================================

  onSidebarToggle(
    expanded: boolean
  ): void {

    this.sidebarExpanded =
      expanded;

  }


  // =========================================================
  // VOLVER
  // =========================================================

  volver(): void {

    this.router.navigate(
      ['/evaluaciones']
    );

  }

}