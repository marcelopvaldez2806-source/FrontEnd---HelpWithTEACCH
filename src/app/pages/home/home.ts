import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Sidebar } from '../../layout/sidebar/sidebar';
import { Navbar } from '../../layout/navbar/navbar';

import {
  ResultadoIntegrado,
  ResultadosIntegradosService
} from '../../core/services/resultados-integrados.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    Navbar
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  sidebarExpanded = false;

  cargando = true;
  error = '';

  textoBusqueda = '';

  resultados: ResultadoIntegrado[] = [];
  resultadosFiltrados: ResultadoIntegrado[] = [];

  constructor(
    private resultadosService: ResultadosIntegradosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cargarResultados();
  }

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }

  // =========================================================
  // LISTADO
  // =========================================================

  async cargarResultados(): Promise<void> {

    this.cargando = true;
    this.error = '';

    const idUsuario = this.obtenerIdUsuario();

    if (!idUsuario) {
      this.error = 'No se pudo identificar al usuario.';
      this.cargando = false;
      return;
    }

    try {
      this.resultados = await this.resultadosService.listar(idUsuario);
      this.buscar();
    } catch {
      this.error = 'No se pudieron cargar los resultados.';
    } finally {
      this.cargando = false;
    }
  }

  buscar(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    this.resultadosFiltrados = !texto
      ? [...this.resultados]
      : this.resultados.filter(r =>
          r.nombreNino.toLowerCase().includes(texto) ||
          r.idNino.toString().includes(texto)
        );
  }

  verResultado(resultado: ResultadoIntegrado): void {
    this.router.navigate([
      '/evaluaciones/resultados-finales',
      resultado.idEvaluacionQChat
    ]);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '-';
    }

    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private obtenerIdUsuario(): number | null {
    try {
      const datos = JSON.parse(localStorage.getItem('usuario') ?? 'null');
      return datos?.usuario?.idUsuario ?? datos?.idUsuario ?? null;
    } catch {
      return null;
    }
  }
}
