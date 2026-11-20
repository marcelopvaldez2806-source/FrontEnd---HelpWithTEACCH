import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { Sidebar } from '../../layout/sidebar/sidebar';
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';

import {
  Ocupacion,
  PerfilResponse,
  PerfilService
} from '../../core/services/perfil.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, Sidebar, Navbar, Header],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {

  sidebarExpanded = false;

  cargando = true;
  errorCarga = '';

  perfil: PerfilResponse | null = null;

  // ---------------- Datos personales ----------------
  nombres = '';
  apellidos = '';
  email = '';
  ocupacion: Ocupacion = 'PADRE';

  guardandoDatos = false;
  mensajeDatos = '';
  errorDatos = '';

  // ---------------- Contraseña ----------------
  passwordActual = '';
  passwordNueva = '';
  confirmarPassword = '';
  mostrarPasswords = false;

  guardandoPassword = false;
  mensajePassword = '';
  errorPassword = '';

  readonly ocupaciones: { valor: Ocupacion; titulo: string; descripcion: string; icono: string }[] = [
    { valor: 'PADRE', titulo: 'Padre / madre de familia', descripcion: 'Evalúo a mi hijo o hija.', icono: '👨‍👩‍👧' },
    { valor: 'DOCENTE', titulo: 'Docente', descripcion: 'Evalúo a niños de mi aula o institución.', icono: '🧑‍🏫' }
  ];

  constructor(
    private perfilService: PerfilService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cargarPerfil();
  }

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }

  get esAdmin(): boolean {
    return this.perfil?.rol === 'ADMIN';
  }

  get iniciales(): string {
    const n = (this.nombres || this.perfil?.nombres || '').trim().charAt(0);
    const a = (this.apellidos || this.perfil?.apellidos || '').trim().charAt(0);
    return `${n}${a}`.toUpperCase() || '?';
  }

  get rolLegible(): string {
    switch (this.perfil?.rol) {
      case 'ADMIN': return 'Administrador';
      case 'DOCENTE': return 'Docente';
      case 'PADRE': return 'Padre / madre de familia';
      default: return this.perfil?.rol ?? '';
    }
  }

  // =========================================================
  // CARGA
  // =========================================================

  cargarPerfil(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.perfilService.obtener().subscribe({
      next: perfil => {
        this.aplicarPerfil(perfil);
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorCarga = this.extraerMensaje(error, 'No se pudo cargar tu perfil.');
        this.cargando = false;
      }
    });
  }

  private aplicarPerfil(perfil: PerfilResponse): void {
    this.perfil = perfil;
    this.nombres = perfil.nombres;
    this.apellidos = perfil.apellidos;
    this.email = perfil.email;

    if (perfil.rol === 'PADRE' || perfil.rol === 'DOCENTE') {
      this.ocupacion = perfil.rol;
    }
  }

  // =========================================================
  // DATOS PERSONALES
  // =========================================================

  get datosModificados(): boolean {
    if (!this.perfil) {
      return false;
    }

    return (
      this.nombres.trim() !== this.perfil.nombres ||
      this.apellidos.trim() !== this.perfil.apellidos ||
      this.email.trim() !== this.perfil.email ||
      (!this.esAdmin && this.ocupacion !== this.perfil.rol)
    );
  }

  get datosValidos(): boolean {
    return (
      this.nombres.trim().length > 0 &&
      this.apellidos.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())
    );
  }

  guardarDatos(): void {
    if (this.guardandoDatos || !this.datosValidos || !this.datosModificados) {
      return;
    }

    this.guardandoDatos = true;
    this.mensajeDatos = '';
    this.errorDatos = '';

    this.perfilService.actualizar({
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      email: this.email.trim(),
      ocupacion: this.esAdmin ? undefined : this.ocupacion
    }).subscribe({
      next: response => {
        this.aplicarPerfil({
          idUsuario: response.usuario.idUsuario,
          nombres: response.usuario.nombres,
          apellidos: response.usuario.apellidos,
          email: response.usuario.email,
          rol: response.rol,
          estado: response.usuario.estado
        });
        this.mensajeDatos = 'Tus datos se guardaron correctamente.';
        this.guardandoDatos = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorDatos = this.extraerMensaje(error, 'No se pudieron guardar tus datos.');
        this.guardandoDatos = false;
      }
    });
  }

  descartarCambios(): void {
    if (this.perfil) {
      this.aplicarPerfil(this.perfil);
    }
    this.mensajeDatos = '';
    this.errorDatos = '';
  }

  // =========================================================
  // CONTRASEÑA
  // =========================================================

  get passwordsCoinciden(): boolean {
    return this.passwordNueva === this.confirmarPassword;
  }

  get passwordValida(): boolean {
    return (
      this.passwordActual.length > 0 &&
      this.passwordNueva.length >= 8 &&
      this.passwordNueva.length <= 100 &&
      this.passwordsCoinciden
    );
  }

  cambiarPassword(): void {
    if (this.guardandoPassword || !this.passwordValida) {
      return;
    }

    this.guardandoPassword = true;
    this.mensajePassword = '';
    this.errorPassword = '';

    this.perfilService.cambiarPassword({
      passwordActual: this.passwordActual,
      passwordNueva: this.passwordNueva,
      confirmarPassword: this.confirmarPassword
    }).subscribe({
      next: () => {
        this.passwordActual = '';
        this.passwordNueva = '';
        this.confirmarPassword = '';
        this.mensajePassword = 'Tu contraseña se cambió correctamente.';
        this.guardandoPassword = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorPassword = this.extraerMensaje(error, 'No se pudo cambiar la contraseña.');
        this.guardandoPassword = false;
      }
    });
  }

  // =========================================================
  // AUXILIARES
  // =========================================================

  private extraerMensaje(error: HttpErrorResponse, porDefecto: string): string {
    const cuerpo = error?.error;

    if (cuerpo && typeof cuerpo === 'object') {
      // Errores de validación del backend: { errors: { campo: mensaje } }
      const valores = Object.values(cuerpo.errors ?? {});
      if (valores.length && typeof valores[0] === 'string') {
        return valores[0] as string;
      }

      if (typeof cuerpo.message === 'string' && cuerpo.message) {
        return cuerpo.message;
      }
    }

    if (typeof cuerpo === 'string' && cuerpo.length < 200) {
      return cuerpo;
    }

    return porDefecto;
  }
}
