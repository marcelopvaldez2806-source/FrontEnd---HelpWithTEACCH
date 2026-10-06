import { Component } from '@angular/core';

import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';

import { ModalUsuario } from './modals/modal-usuario/modal-usuario';
import { ModalAsignarNino } from './modals/modal-asignar-nino/modal-asignar-nino';

@Component({
  selector: 'app-usuario',

  imports: [
    Navbar,
    Sidebar,
    Header,
    ModalUsuario,
    ModalAsignarNino
  ],

  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class Usuario {

  // =========================================================
  // SIDEBAR
  // =========================================================

  sidebarExpanded = false;

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }


  // =========================================================
  // MODAL CREAR USUARIO
  // =========================================================

  mostrarModalUsuario = false;

  abrirModalUsuario(): void {
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
  }

  usuarioCreado(): void {

    console.log(
      'Usuario creado correctamente.'
    );

    this.cerrarModalUsuario();
  }


  // =========================================================
  // MODAL ASIGNAR NIÑOS
  // =========================================================

  mostrarModalAsignarNino = false;

  abrirModalAsignarNino(): void {
    this.mostrarModalAsignarNino = true;
  }

  cerrarModalAsignarNino(): void {
    this.mostrarModalAsignarNino = false;
  }

  asignacionRealizada(): void {

    console.log(
      'Niños asignados correctamente.'
    );

    this.cerrarModalAsignarNino();
  }

}