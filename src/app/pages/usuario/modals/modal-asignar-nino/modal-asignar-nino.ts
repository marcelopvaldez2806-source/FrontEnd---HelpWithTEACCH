import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { NinoService } from '../../../../core/services/nino.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AsignarNinoService } from '../../../../core/services/asignar-nino.service';

import { NinoResponse } from '../../../../models/NinoResponse';
import { UsuarioResponse } from '../../../../models/UsuarioResponse';
import { AsignarNinoRequest } from '../../../../models/AsignarNinoRequest';

@Component({
  selector: 'app-modal-asignar-nino',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './modal-asignar-nino.html',
  styleUrl: './modal-asignar-nino.css'
})
export class ModalAsignarNino implements OnInit {

  // =========================================================
  // OUTPUTS
  // =========================================================

  @Output() cerrarModal =
    new EventEmitter<void>();

  @Output() asignacionRealizada =
    new EventEmitter<void>();


  // =========================================================
  // SERVICIOS
  // =========================================================

  private usuarioService =
    inject(UsuarioService);

  private ninoService =
    inject(NinoService);

  private asignarNinoService =
    inject(AsignarNinoService);


  // =========================================================
  // USUARIOS
  // =========================================================

  usuarios: UsuarioResponse[] = [];

  usuarioSeleccionadoId: number | null = null;

  usuarioSeleccionadoNombre = '';


  // =========================================================
  // NIÑOS
  // =========================================================

  ninos: NinoResponse[] = [];

  idsNinosAsignados =
    new Set<number>();

  idsNinosSeleccionados =
    new Set<number>();


  // =========================================================
  // ESTADOS
  // =========================================================

  cargandoUsuarios = true;

  cargandoNinos = false;

  cargandoAsignaciones = false;

  guardando = false;

  mensajeError = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.cargarUsuarios();

  }


  // =========================================================
  // CARGAR USUARIOS
  // =========================================================

  cargarUsuarios(): void {

    this.cargandoUsuarios = true;
    this.mensajeError = '';

    this.usuarioService
      .listar(0, 100)
      .subscribe({

        next: (respuesta) => {

          this.usuarios =
            respuesta.content.filter(
              usuario =>
                usuario.estado === 'ACTIVO'
            );

          this.cargandoUsuarios = false;

        },

        error: (error) => {

          console.error(
            'Error al cargar usuarios:',
            error
          );

          this.mensajeError =
            'No se pudieron cargar los usuarios disponibles.';

          this.cargandoUsuarios = false;

        }

      });

  }


  // =========================================================
  // SELECCIONAR USUARIO
  // =========================================================

  seleccionarUsuario(
    usuario: UsuarioResponse
  ): void {

    if (
      this.guardando ||
      usuario.estado !== 'ACTIVO'
    ) {
      return;
    }

    this.usuarioSeleccionadoId =
      usuario.idUsuario;

    this.usuarioSeleccionadoNombre =
      `${usuario.nombres} ${usuario.apellidos}`;

    this.idsNinosSeleccionados.clear();

    this.idsNinosAsignados.clear();

    this.cargarNinos();

  }


  // =========================================================
  // CARGAR NIÑOS
  // =========================================================

  cargarNinos(): void {

    if (
      this.usuarioSeleccionadoId === null
    ) {
      return;
    }

    this.cargandoNinos = true;
    this.mensajeError = '';

    this.ninoService
      .listar(
        0,
        100,
        undefined,
        undefined,
        undefined,
        'ACTIVO'
      )
      .subscribe({

        next: (respuesta) => {

          this.ninos =
            respuesta.content;

          this.cargarAsignaciones();

        },

        error: (error) => {

          console.error(
            'Error al cargar los niños:',
            error
          );

          this.mensajeError =
            'No se pudieron cargar los niños disponibles.';

          this.cargandoNinos = false;

        }

      });

  }


  // =========================================================
  // CARGAR ASIGNACIONES ACTUALES
  // =========================================================

  cargarAsignaciones(): void {

    if (
      this.usuarioSeleccionadoId === null
    ) {
      return;
    }

    this.cargandoAsignaciones = true;

    this.asignarNinoService
      .listarPorUsuario(
        this.usuarioSeleccionadoId,
        'ACTIVO',
        0,
        100
      )
      .subscribe({

        next: (respuesta) => {

          this.idsNinosAsignados =
            new Set(
              respuesta.content.map(
                asignacion =>
                  asignacion.idNino
              )
            );

          this.cargandoAsignaciones =
            false;

          this.cargandoNinos =
            false;

        },

        error: (error) => {

          console.error(
            'Error al cargar asignaciones:',
            error
          );

          this.mensajeError =
            'No se pudieron consultar las asignaciones actuales.';

          this.cargandoAsignaciones =
            false;

          this.cargandoNinos =
            false;

        }

      });

  }


  // =========================================================
  // ESTADOS DE NIÑOS
  // =========================================================

  estaAsignado(
    idNino: number
  ): boolean {

    return this.idsNinosAsignados
      .has(idNino);

  }


  estaSeleccionado(
    idNino: number
  ): boolean {

    return this.idsNinosSeleccionados
      .has(idNino);

  }


  // =========================================================
  // SELECCIONAR NIÑO
  // =========================================================

  alternarSeleccion(
    nino: NinoResponse
  ): void {

    if (
      this.guardando ||
      this.estaAsignado(
        nino.idNino
      )
    ) {
      return;
    }

    if (
      this.idsNinosSeleccionados
        .has(nino.idNino)
    ) {

      this.idsNinosSeleccionados
        .delete(nino.idNino);

    } else {

      this.idsNinosSeleccionados
        .add(nino.idNino);

    }

  }


  // =========================================================
  // CANTIDAD
  // =========================================================

  cantidadSeleccionados(): number {

    return this.idsNinosSeleccionados
      .size;

  }


  // =========================================================
  // EDAD
  // =========================================================

  obtenerEdad(
    fechaNacimiento: string
  ): number {

    const fechaNacimientoDate =
      new Date(fechaNacimiento);

    const hoy = new Date();

    let edad =
      hoy.getFullYear() -
      fechaNacimientoDate.getFullYear();

    const mes =
      hoy.getMonth() -
      fechaNacimientoDate.getMonth();

    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() <
        fechaNacimientoDate.getDate()
      )
    ) {

      edad--;

    }

    return edad;

  }


  // =========================================================
  // ASIGNAR
  // =========================================================

  asignarNinos(): void {

    if (
      this.usuarioSeleccionadoId === null ||
      this.idsNinosSeleccionados.size === 0 ||
      this.guardando
    ) {
      return;
    }

    const request: AsignarNinoRequest = {

      idUsuario:
        this.usuarioSeleccionadoId,

      items:
        Array
          .from(
            this.idsNinosSeleccionados
          )
          .map(idNino => ({
            idNino
          }))

    };

    this.guardando = true;

    this.mensajeError = '';

    this.asignarNinoService
      .asignar(request)
      .subscribe({

        next: () => {

          this.guardando = false;

          this.asignacionRealizada
            .emit();

          this.cerrarModal
            .emit();

        },

        error: (error) => {

          console.error(
            'Error al asignar niños:',
            error
          );

          this.guardando = false;

          if (
            error.status === 409
          ) {

            this.mensajeError =
              'Uno de los niños seleccionados ya se encuentra asignado.';

          } else {

            this.mensajeError =
              'No se pudieron asignar los niños seleccionados.';

          }

        }

      });

  }


  // =========================================================
  // CERRAR
  // =========================================================

  cerrar(): void {

    if (!this.guardando) {

      this.cerrarModal.emit();

    }

  }


  detenerPropagacion(
    event: MouseEvent
  ): void {

    event.stopPropagation();

  }

}