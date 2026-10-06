import { Component } from '@angular/core';
import {Navbar} from '../../layout/navbar/navbar';
import {Sidebar} from '../../layout/sidebar/sidebar';
import {Header} from '../../layout/header/header';
import {KpiGrid} from '../../layout/kpi-grid/kpi-grid';
import {KpiItem} from '../../models/SelectOption';
import {LoginResponse} from '../../models/auth.models';
import {ModalNino} from './modals/modal-nino/modal-nino';
import {NgIf} from '@angular/common';
import {NinoResponse} from '../../models/NinoResponse';

@Component({
  selector: 'app-nino',
  imports: [
    Navbar,
    Sidebar,
    Header,
    KpiGrid,
    ModalNino,
    NgIf
  ],
  templateUrl: './nino.html',
  styleUrl: './nino.css',
})
export class Nino {

  sidebarExpanded = false;

  kpis: LoginResponse | null = null;

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }

  get items(): KpiItem[] {

    if (!this.kpis) {
      return [];
    }

    return [
      {
        title: 'Total prendas',
        value: this.kpis.rol,
        footer: `+ ${this.kpis.rol} registradas este mes`,
        icon: 'fi fi-bs-shirt-long-sleeve'
      },
      {
        title: 'Disponibles',
        value: this.kpis.nombres,
        footer: `+ ${this.kpis.nombres} esta semana`,
        icon: 'fi fi-br-check-circle',
        iconClass: 'success'
      },
      {
        title: 'Agotadas',
        value: this.kpis.apellidos,
        footer: `${this.kpis.apellidos} esta semana`,
        icon: 'fi fi-br-cross-circle',
        iconClass: 'danger'
      },
      {
        title: 'Lotes activos',
        value: this.kpis.email,
        footer: `+ ${this.kpis.email} nuevos este mes`,
        icon: 'fi fi-br-box-open-full',
        iconClass: 'warning'
      },
      {
        title: 'Valor inventario',
        value: `S/ ${this.kpis.idUsuario}`,
        footer: `S/ ${this.kpis.idUsuario} este mes`,
        icon: 'fi fi-br-sack-dollar',
        iconClass: 'money'
      }
    ];
  }

  private bloquearScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private restaurarScroll(): void {
    document.body.style.overflow = '';
  }

  modoEdicion = false;
  ninoSeleccionado: NinoResponse | null = null;
  mostrarModalNino = false;


  abrirModalNino(): void {
    console.log('ABRIR MODAL');
    this.modoEdicion = false;
    this.ninoSeleccionado = null;
    this.mostrarModalNino = true;
    this.bloquearScroll();
  }

  cerrarModalNino(): void {
    this.mostrarModalNino = false;
    this.ninoSeleccionado = null;
    this.modoEdicion = false;
    this.restaurarScroll();
  }

  onNinoGuardado(): void {
    this.cerrarModalNino();
    this.reloadNinos();
  }

  reloadNinos(): void {
    console.log('reloadNinos');

  }

}
