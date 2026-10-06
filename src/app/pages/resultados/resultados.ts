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

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';

import { AsignarNinoService } from '../../core/services/asignar-nino.service';
import { NinoService } from '../../core/services/nino.service';

import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
/* =========================================================
   INTERFACES
   ========================================================= */

interface Evaluacion {
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

interface Nino {
  idNino: number;
  nombres: string;
  apellidos: string;
}

interface ResultadoQChat {
  idEvaluacion: number;
  idNino: number;
  nombreNino: string;
  fechaEvaluacion: string;
  estado: string;
}


/* =========================================================
   COMPONENTE
   ========================================================= */

@Component({
  selector: 'app-resultados',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    Sidebar
  ],

  templateUrl: './resultados.html',
  styleUrl: './resultados.css'
})
export class Resultados implements OnInit {

  /* =======================================================
     SIDEBAR
     ======================================================= */

  sidebarExpanded = false;


  /* =======================================================
     USUARIO
     ======================================================= */

  usuarioId: number | null = null;


  /* =======================================================
     RESULTADOS
     ======================================================= */

  resultados: ResultadoQChat[] = [];

  resultadosFiltrados:
    ResultadoQChat[] = [];


  /* =======================================================
     BUSCADOR
     ======================================================= */

  textoBusqueda = '';


  /* =======================================================
     ESTADOS
     ======================================================= */

  cargando = true;

  mensajeError = '';


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
     OBTENER USUARIO
     ======================================================= */

  private obtenerUsuario(): void {

    try {

      const usuarioGuardado =
        localStorage.getItem('usuario');

      if (!usuarioGuardado) {

        this.mensajeError =
          'No se encontró la información del usuario.';

        this.cargando = false;

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

        this.cargando = false;

        return;
      }

      this.cargarResultados();

    } catch (error) {

      console.error(
        'Error obteniendo usuario:',
        error
      );

      this.mensajeError =
        'No se pudo obtener la información del usuario.';

      this.cargando = false;
    }
  }


  /* =======================================================
     CARGAR RESULTADOS
     ======================================================= */

  cargarResultados(): void {

    if (!this.usuarioId) {
      return;
    }

    this.cargando = true;

    this.mensajeError = '';

    const token =
      localStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {

      headers['Authorization'] =
        `Bearer ${token}`;
    }


    /*
     * Obtenemos únicamente evaluaciones:
     *
     * - del usuario actual
     * - COMPLETADAS
     */

    const url =
  `${environment.apiUrl}/evaluaciones` +
  `?page=0` +
  `&size=50` +
  `&idUsuario=${this.usuarioId}` +
  `&estado=COMPLETADA`;


    fetch(
      url,
      {
        method: 'GET',
        headers
      }
    )

      .then(async response => {

        if (!response.ok) {

          throw new Error(
            `Error al obtener evaluaciones (${response.status})`
          );
        }

        return response.json();
      })

      .then(data => {

        const evaluaciones:
          Evaluacion[] =
          data?.content ?? [];


        /*
         * Actualmente Q-CHAT utiliza:
         *
         * idVersion = 1
         *
         * Esto nos permite listar correctamente
         * tus evaluaciones Q-CHAT actuales.
         */

        const evaluacionesQChat =
          evaluaciones.filter(
            evaluacion =>
              evaluacion.idVersion === 1
          );


        if (
          evaluacionesQChat.length === 0
        ) {

          this.resultados = [];

          this.resultadosFiltrados = [];

          this.cargando = false;

          return;
        }


        this.cargarNombresNinos(
          evaluacionesQChat
        );

      })

      .catch(error => {

        console.error(
          'Error cargando evaluaciones:',
          error
        );

        this.mensajeError =
          'No se pudieron cargar los resultados.';

        this.cargando = false;
      });
  }


  /* =======================================================
     CARGAR NOMBRES DE NIÑOS
     ======================================================= */

  private async cargarNombresNinos(
    evaluaciones: Evaluacion[]
  ): Promise<void> {

    try {

      const solicitudes =
        evaluaciones.map(
          async evaluacion => {

            try {

              const nino =
                await firstValueFrom(
                  this.ninoService
                    .obtenerPorId(
                      evaluacion.idNino
                    )
                ) as Nino;


              return {

                idEvaluacion:
                  evaluacion.idEvaluacion,

                idNino:
                  evaluacion.idNino,

                nombreNino:
                  nino
                    ? `${nino.nombres} ${nino.apellidos}`
                    : `Niño #${evaluacion.idNino}`,

                fechaEvaluacion:
                  evaluacion.fechaEvaluacion,

                estado:
                  evaluacion.estado

              } as ResultadoQChat;

            } catch {

              return {

                idEvaluacion:
                  evaluacion.idEvaluacion,

                idNino:
                  evaluacion.idNino,

                nombreNino:
                  `Niño #${evaluacion.idNino}`,

                fechaEvaluacion:
                  evaluacion.fechaEvaluacion,

                estado:
                  evaluacion.estado

              } as ResultadoQChat;
            }
          }
        );


      this.resultados =
        await Promise.all(
          solicitudes
        );


      this.aplicarFiltro();

      this.cargando = false;

    } catch (error) {

      console.error(
        'Error obteniendo nombres:',
        error
      );

      this.mensajeError =
        'No se pudieron cargar los datos de los niños.';

      this.cargando = false;
    }
  }


  /* =======================================================
     BUSCADOR
     ======================================================= */

  buscar(): void {

    this.aplicarFiltro();
  }


  private aplicarFiltro(): void {

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    if (!texto) {

      this.resultadosFiltrados =
        [...this.resultados];

      return;
    }


    this.resultadosFiltrados =
      this.resultados.filter(
        resultado =>

          resultado.nombreNino
            .toLowerCase()
            .includes(texto)

          ||

          resultado.idEvaluacion
            .toString()
            .includes(texto)
      );
  }


  /* =======================================================
     VER RESULTADO
     ======================================================= */

  verResultado(
    idEvaluacion: number
  ): void {

    this.router.navigate([
      '/evaluaciones/qchat/resultados',
      idEvaluacion
    ]);
  }


  /* =======================================================
     FORMATEAR FECHA
     ======================================================= */

  formatearFecha(
    fecha: string
  ): string {

    if (!fecha) {
      return '-';
    }

    const fechaObj =
      new Date(fecha);

    return fechaObj.toLocaleDateString(
      'es-PE',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }


  /* =======================================================
     FORMATEAR HORA
     ======================================================= */

  formatearHora(
    fecha: string
  ): string {

    if (!fecha) {
      return '';
    }

    const fechaObj =
      new Date(fecha);

    return fechaObj.toLocaleTimeString(
      'es-PE',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }


  /* =======================================================
     TEXTO DEL ESTADO
     ======================================================= */

  obtenerTextoEstado(
    estado: string
  ): string {

    switch (estado) {

      case 'COMPLETADA':
        return 'Completada';

      case 'EN_PROGRESO':
        return 'En progreso';

      case 'PAUSADA':
        return 'Pausada';

      case 'CANCELADA':
        return 'Cancelada';

      default:
        return estado;
    }
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

  volverInicio(): void {

    this.router.navigate([
      '/home'
    ]);
  }
}