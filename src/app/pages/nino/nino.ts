import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {Navbar} from '../../layout/navbar/navbar';
import {Sidebar} from '../../layout/sidebar/sidebar';
import {Header} from '../../layout/header/header';
import {ModalNino} from './modals/modal-nino/modal-nino';
import {NgFor, NgIf, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {firstValueFrom} from 'rxjs';
import {NinoService} from '../../core/services/nino.service';
import {EvaluacionResponse, EvaluacionService} from '../../core/services/evaluacion.service';
import {NinoResponse} from '../../models/NinoResponse';

// Mismos IDs de versión que usa la pantalla Resultados finales.
const ID_VERSION_QCHAT = 1;
const ID_VERSION_KABC = 2;

// Fila de la tabla de niños registrados
interface FilaNino {
  idNino: number;
  nombre: string;
  edad: string;
  qchat: boolean;
  kabc: boolean;
}

@Component({
  selector: 'app-nino',
  imports: [
    Navbar,
    Sidebar,
    Header,
    ModalNino,
    NgIf,
    NgFor,
    FormsModule
  ],
  templateUrl: './nino.html',
  styleUrl: './nino.css',
})
export class Nino implements OnInit {

  // =========================================================
  // LISTADO DE NIÑOS
  // =========================================================

  cargandoNinos = true;
  errorNinos = '';
  textoBusqueda = '';

  filas: FilaNino[] = [];
  filasFiltradas: FilaNino[] = [];

  constructor(
    private ninoService: NinoService,
    private evaluacionService: EvaluacionService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cargarNinos();
  }

  async cargarNinos(): Promise<void> {

    this.cargandoNinos = true;
    this.errorNinos = '';

    try {
      const [ninosPage, evaluacionesPage] = await Promise.all([
        firstValueFrom(this.ninoService.listar(0, 200)),
        firstValueFrom(
          this.evaluacionService.listar(
            undefined,
            undefined,
            undefined,
            'COMPLETADA',
            0,
            1000
          )
        )
      ]);

      const ninos: NinoResponse[] = ninosPage?.content ?? [];
      const evaluaciones: EvaluacionResponse[] = evaluacionesPage?.content ?? [];

      const completo = (idNino: number, idVersion: number): boolean =>
        evaluaciones.some(e =>
          e.idNino === idNino &&
          Number(e.idVersion) === idVersion
        );

      this.filas = ninos
        .map(n => ({
          idNino: n.idNino,
          nombre: `${n.nombres} ${n.apellidos}`.trim(),
          edad: this.calcularEdad(n.fechaNacimiento),
          qchat: completo(n.idNino, ID_VERSION_QCHAT),
          kabc: completo(n.idNino, ID_VERSION_KABC)
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      this.buscar();

    } catch {
      this.errorNinos = 'No se pudo cargar el listado de niños.';
    } finally {
      this.cargandoNinos = false;
    }
  }

  buscar(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    this.filasFiltradas = !texto
      ? [...this.filas]
      : this.filas.filter(f =>
          f.nombre.toLowerCase().includes(texto) ||
          f.idNino.toString().includes(texto)
        );
  }

  private calcularEdad(fechaNacimiento: string): string {
    if (!fechaNacimiento) {
      return '-';
    }

    // Se leen año, mes y día del texto para evitar desfases de zona horaria.
    const [anio, mes, dia] = fechaNacimiento
      .slice(0, 10)
      .split('-')
      .map(Number);

    if (!anio || !mes || !dia) {
      return '-';
    }

    const hoy = new Date();

    let edad = hoy.getFullYear() - anio;

    const yaCumplio =
      hoy.getMonth() + 1 > mes ||
      (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);

    if (!yaCumplio) {
      edad--;
    }

    return edad === 1 ? '1 año' : `${edad} años`;
  }


  sidebarExpanded = false;

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
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
    this.cargarNinos();
  }

}
