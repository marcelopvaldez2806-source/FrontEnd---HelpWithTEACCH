
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

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Navbar } from '../../../layout/navbar/navbar';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Header } from '../../../layout/header/header';

import { NinoService } from '../../../core/services/nino.service';
import { RespuestaService } from '../../../core/services/respuesta.service';

import { environment } from '../../../../environments/environment';

// =====================================================
// INTERFACES
// =====================================================

interface Evaluacion {
  idEvaluacion: number;
  idNino: number;
  idUsuario: number;
  idVersion: number;
  fechaEvaluacion: string;
  estado: string;
}

interface Nino {
  idNino: number;
  nombres: string;
  apellidos: string;
}

interface ResultadoIntegrado {
  idNino: number;
  nombreNino: string;
  idEvaluacionQChat: number;
  idEvaluacionKabc: number;
  fechaQChat: string;
  fechaKabc: string;
}

interface RespuestaKabc {
  idRespuesta?: number;
  idEvaluacion?: number;
  itemId: number;
  serieId: number;
  correcta: boolean | null;
  puntaje?: number;
  tipo?: string;
  valor?: any;
}

interface SerieConfiguracion {
  id: number;
}

interface ItemConfiguracion {
  id: number;
  subtest: string;
  series?: SerieConfiguracion[];
}

interface PrediccionML {
  idPrediccion?: number;
  idEvaluacion?: number;
  modelo: string;
  resultado: string;
  probabilidad: number;
  fechaPrediccion?: string;
}

interface ResultadoModelo {
  nombre: string;
  resultado: string;
  probabilidad: number;
}

interface ResultadoSubtest {
  codigo: string;
  nombre: string;
  totalItems: number;
  itemsCorrectos: number;
  itemsIncorrectos: number;
  porcentaje: number;
  estado: 'APROBADO' | 'NECESITA APOYO' | 'SIN DATOS';
  recomendacion: string;
}

// =====================================================
// COMPONENTE
// =====================================================

@Component({
  selector: 'app-resultados-finales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    Sidebar,
    Header
  ],
  templateUrl: './resultados-finales.html',
  styleUrl: './resultados-finales.css'
})
export class ResultadosFinales implements OnInit {

  private readonly API_URL = environment.apiUrl;

  // IMPORTANTE: conservar estos identificadores
  // únicamente si corresponden a los IDs reales de Version.
  private readonly ID_VERSION_QCHAT = 1;
  private readonly ID_VERSION_KABC = 2;

  // =====================================================
  // ESTADO DEL COMPONENTE
  // =====================================================

  sidebarExpanded = false;

  usuarioId: number | null = null;

  cargando = true;
  cargandoDetalle = false;

  error = '';
  errorDetalle = '';

  textoBusqueda = '';

  resultados: ResultadoIntegrado[] = [];
  resultadosFiltrados: ResultadoIntegrado[] = [];

  resultadoSeleccionado: ResultadoIntegrado | null = null;

  // =====================================================
  // RESULTADOS Q-CHAT / MACHINE LEARNING
  // =====================================================

  modelosML: ResultadoModelo[] = [];

  promedioML: number | null = null;

  // =====================================================
  // RESULTADOS K-ABC
  // =====================================================

  resultadosSubtests: ResultadoSubtest[] = [];

  // =====================================================
  // CONFIGURACIÓN DEL GRÁFICO DE ARAÑA
  // =====================================================

  public readonly radarCentro = 250;
  public readonly radarRadio = 145;

  constructor(
    private ninoService: NinoService,
    private respuestaService: RespuestaService,
    private route: ActivatedRoute,
    private router: Router,

    @Inject(PLATFORM_ID)
    private platformId: object
  ) {}

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.obtenerUsuario();
  }

  // =====================================================
  // OBTENER USUARIO
  // =====================================================

  private obtenerUsuario(): void {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');

      if (!usuarioGuardado) {
        this.error = 'No se encontró la información del usuario.';
        this.cargando = false;
        return;
      }

      const datos = JSON.parse(usuarioGuardado);

      this.usuarioId =
        datos?.usuario?.idUsuario ??
        datos?.idUsuario ??
        null;

      if (!this.usuarioId) {
        this.error = 'No se pudo identificar al usuario.';
        this.cargando = false;
        return;
      }

      this.cargarResultadosIntegrados();

    } catch (error) {
      console.error('Error obteniendo usuario:', error);

      this.error = 'No se pudo obtener la información del usuario.';
      this.cargando = false;
    }
  }

  // =====================================================
  // HEADERS HTTP
  // =====================================================

  private obtenerHeaders(): HeadersInit {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // =====================================================
  // LISTADO DE RESULTADOS INTEGRADOS
  // =====================================================

  async cargarResultadosIntegrados(): Promise<void> {
    if (!this.usuarioId) {
      return;
    }

    this.cargando = true;
    this.error = '';

    try {
      const url =
        `${this.API_URL}/evaluaciones` +
        `?page=0&size=100` +
        `&idUsuario=${this.usuarioId}` +
        `&estado=COMPLETADA`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders()
      });

      if (!response.ok) {
        throw new Error(
          `No se pudieron obtener las evaluaciones (${response.status}).`
        );
      }

      const data = await response.json();

      const evaluaciones: Evaluacion[] =
        data?.content ?? [];

      const evaluacionesQChat = evaluaciones.filter(
        e => Number(e.idVersion) === this.ID_VERSION_QCHAT
      );

      const evaluacionesKabc = evaluaciones.filter(
        e => Number(e.idVersion) === this.ID_VERSION_KABC
      );

      // Agrupar evaluaciones por niño.
      const idsNinos = new Set<number>([
        ...evaluacionesQChat.map(e => e.idNino),
        ...evaluacionesKabc.map(e => e.idNino)
      ]);

      const resultadosIntegrados: ResultadoIntegrado[] = [];

      for (const idNino of idsNinos) {

        // Última evaluación Q-CHAT completada.
        const qchat = evaluacionesQChat
          .filter(e => e.idNino === idNino)
          .sort(
            (a, b) =>
              new Date(b.fechaEvaluacion).getTime() -
              new Date(a.fechaEvaluacion).getTime()
          )[0];

        // Última evaluación K-ABC completada.
        const kabc = evaluacionesKabc
          .filter(e => e.idNino === idNino)
          .sort(
            (a, b) =>
              new Date(b.fechaEvaluacion).getTime() -
              new Date(a.fechaEvaluacion).getTime()
          )[0];

        // Solo mostrar niños con ambas evaluaciones.
        if (!qchat || !kabc) {
          continue;
        }

        let nombreNino = `Niño #${idNino}`;

        try {
          const nino = await firstValueFrom(
            this.ninoService.obtenerPorId(idNino)
          ) as Nino;

          if (nino) {
            nombreNino =
              `${nino.nombres} ${nino.apellidos}`.trim();
          }

        } catch (error) {
          console.warn(
            `No se pudo obtener el nombre del niño ${idNino}:`,
            error
          );
        }

        resultadosIntegrados.push({
          idNino,
          nombreNino,
          idEvaluacionQChat: qchat.idEvaluacion,
          idEvaluacionKabc: kabc.idEvaluacion,
          fechaQChat: qchat.fechaEvaluacion,
          fechaKabc: kabc.fechaEvaluacion
        });
      }

      this.resultados = resultadosIntegrados;

      this.aplicarFiltro();

      this.abrirDesdeRuta();

    } catch (error: any) {
      console.error(
        'Error cargando resultados integrados:',
        error
      );

      this.error =
        error?.message ??
        'No se pudieron cargar los resultados integrados.';

    } finally {
      this.cargando = false;
    }
  }

  // =====================================================
  // ABRIR UN RESULTADO DESDE LA URL
  // /evaluaciones/resultados-finales/:idEvaluacion
  // (acepta el id de la evaluación Q-CHAT o K-ABC)
  // =====================================================

  private abrirDesdeRuta(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('idEvaluacion')
    );

    if (!id) {
      return;
    }

    const resultado = this.resultados.find(r =>
      r.idEvaluacionQChat === id ||
      r.idEvaluacionKabc === id
    );

    if (resultado) {
      this.verResultado(resultado);
    }
  }

  // =====================================================
  // BUSCADOR
  // =====================================================

  buscar(): void {
    this.aplicarFiltro();
  }

  private aplicarFiltro(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      this.resultadosFiltrados = [...this.resultados];
      return;
    }

    this.resultadosFiltrados = this.resultados.filter(resultado =>
      resultado.nombreNino.toLowerCase().includes(texto) ||
      resultado.idNino.toString().includes(texto)
    );
  }

  // =====================================================
  // ABRIR DETALLE INTEGRADO
  // =====================================================

  async verResultado(resultado: ResultadoIntegrado): Promise<void> {
    this.resultadoSeleccionado = resultado;

    this.cargandoDetalle = true;
    this.errorDetalle = '';

    this.modelosML = [];
    this.promedioML = null;
    this.resultadosSubtests = [];

    await Promise.all([
      this.cargarResultadosML(resultado.idEvaluacionQChat),
      this.cargarResultadosKabc(resultado.idEvaluacionKabc)
    ]);

    this.cargandoDetalle = false;
  }

  // =====================================================
  // RESULTADOS Q-CHAT / MACHINE LEARNING
  // =====================================================

  private async cargarResultadosML(
    idEvaluacion: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_URL}/predicciones-ml/evaluacion/${idEvaluacion}`,
        {
          method: 'GET',
          headers: this.obtenerHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(
          `No se pudieron obtener las predicciones (${response.status}).`
        );
      }

      const predicciones: PrediccionML[] =
        await response.json();

      const normalizadas = (predicciones ?? []).map(p => ({
        nombre: this.normalizarNombreModelo(p.modelo),
        resultado: p.resultado ?? 'Sin resultado',
        probabilidad: this.normalizarProbabilidad(p.probabilidad)
      }));

      // Conservar la predicción más reciente de cada modelo.
      const modelos = new Map<string, ResultadoModelo>();

      for (const prediccion of normalizadas) {
        modelos.set(prediccion.nombre, prediccion);
      }

      this.modelosML = Array.from(modelos.values());

      const probabilidades = this.modelosML
        .map(m => m.probabilidad)
        .filter(p => Number.isFinite(p));

      if (probabilidades.length > 0) {
        this.promedioML =
          probabilidades.reduce((total, p) => total + p, 0) /
          probabilidades.length;
      }

    } catch (error) {
      console.error(
        'Error obteniendo resultados ML:',
        error
      );

      this.errorDetalle =
        'No se pudieron cargar las predicciones de Q-CHAT.';
    }
  }

  private normalizarNombreModelo(modelo: string): string {
    const nombre = (modelo ?? '').toLowerCase();

    if (nombre.includes('random')) {
      return 'Random Forest';
    }

    if (nombre.includes('xgboost') || nombre.includes('xg')) {
      return 'XGBoost';
    }

    return modelo || 'Modelo ML';
  }

  private normalizarProbabilidad(valor: number): number {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return 0;
    }

    // Normalizar probabilidades de 0-1 o de 0-100.
    const porcentaje = numero <= 1
      ? numero * 100
      : numero;

    return Math.max(0, Math.min(100, porcentaje));
  }

  // =====================================================
  // RESULTADOS K-ABC
  // =====================================================

  private async cargarResultadosKabc(
    idEvaluacion: number
  ): Promise<void> {
    try {
      const [respuestas, configuracion] = await Promise.all([
        firstValueFrom(
          this.respuestaService.obtenerPorEvaluacion(idEvaluacion)
        ) as Promise<RespuestaKabc[]>,

        this.obtenerConfiguracionKabc(idEvaluacion)
      ]);

      const items: ItemConfiguracion[] =
        configuracion?.assessment?.items ?? [];

      this.calcularSubtests(
        respuestas ?? [],
        items
      );

    } catch (error) {
      console.error(
        'Error obteniendo resultados K-ABC:',
        error
      );

      this.errorDetalle =
        'No se pudieron cargar las respuestas o la configuración K-ABC.';
    }
  }

  private async obtenerConfiguracionKabc(
    idEvaluacion: number
  ): Promise<any> {
    const response = await fetch(
      `${this.API_URL}/evaluaciones/${idEvaluacion}/configuracion`,
      {
        method: 'GET',
        headers: this.obtenerHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(
        `No se pudo obtener la configuración K-ABC (${response.status}).`
      );
    }

    return response.json();
  }

  // =====================================================
  // AGRUPAR RESPUESTAS POR SUBTEST / ACTIVIDAD
  // =====================================================

  private calcularSubtests(
    respuestas: RespuestaKabc[],
    items: ItemConfiguracion[]
  ): void {

    const recomendaciones: Record<string, string> = {
      PROCESAMIENTO_SECUENCIAL:
        'Practicar actividades de secuenciación, seguimiento de instrucciones paso a paso y organización de acontecimientos.',

      PROCESAMIENTO_SIMULTANEO:
        'Utilizar rompecabezas, asociación de imágenes, reconocimiento de patrones y actividades visoespaciales.',

      PROCESAMIENTO_MENTAL:
        'Reforzar actividades de razonamiento, resolución de problemas y establecimiento de relaciones.',

      CONOCIMIENTOS:
        'Promover actividades de vocabulario, reconocimiento de conceptos y asociación de palabras.'
    };

    const nombres: Record<string, string> = {
      PROCESAMIENTO_SECUENCIAL: 'Procesamiento secuencial',
      PROCESAMIENTO_SIMULTANEO: 'Procesamiento simultáneo',
      PROCESAMIENTO_MENTAL: 'Procesamiento mental',
      CONOCIMIENTOS: 'Conocimientos'
    };

    const grupos = new Map<string, {
      totalSeries: number;
      seriesCorrectas: number;
      seriesIncorrectas: number;
      itemFallido: boolean;
      totalItems: number;
      sinDatos: boolean;
    }>();

    for (const item of items) {

      const codigo = this.normalizarCodigoSubtest(item.subtest);

      if (!codigo) {
        continue;
      }

      if (!grupos.has(codigo)) {
        grupos.set(codigo, {
          totalSeries: 0,
          seriesCorrectas: 0,
          seriesIncorrectas: 0,
          itemFallido: false,
          totalItems: 0,
          sinDatos: false
        });
      }

      const grupo = grupos.get(codigo)!;

      grupo.totalItems++;

      const series = item.series ?? [];

      grupo.totalSeries += series.length;

      const respuestasItem = respuestas.filter(
        r => Number(r.itemId) === Number(item.id)
      );

      let itemCompleto = series.length > 0;
      let itemTieneError = false;

      for (const serie of series) {

        const respuestaSerie = respuestasItem.find(
          r => Number(r.serieId) === Number(serie.id)
        );

        if (!respuestaSerie) {
          itemCompleto = false;
          continue;
        }

        if (respuestaSerie.correcta === true) {
          grupo.seriesCorrectas++;

        } else if (respuestaSerie.correcta === false) {
          grupo.seriesIncorrectas++;
          itemTieneError = true;

        } else {
          itemCompleto = false;
        }
      }

      // ALL_SERIES_CORRECT:
      // Si una serie falla, el ítem completo falla.
      if (itemTieneError) {
        grupo.itemFallido = true;
      }

      // Si falta alguna respuesta, no se considera aprobado.
      if (!itemCompleto) {
        grupo.itemFallido = true;
        grupo.sinDatos = true;
      }
    }

    this.resultadosSubtests = Array.from(grupos.entries()).map(
      ([codigo, grupo]) => {

        let estado: ResultadoSubtest['estado'];

        if (grupo.sinDatos && grupo.seriesCorrectas === 0 &&
            grupo.seriesIncorrectas === 0) {
          estado = 'SIN DATOS';

        } else if (grupo.itemFallido) {
          estado = 'NECESITA APOYO';

        } else if (grupo.totalSeries > 0) {
          estado = 'APROBADO';

        } else {
          estado = 'SIN DATOS';
        }

        const porcentaje = grupo.totalSeries > 0
          ? (grupo.seriesCorrectas / grupo.totalSeries) * 100
          : 0;

        return {
          codigo,

          nombre:
            nombres[codigo] ??
            this.formatearNombreActividad(codigo),

          totalItems: grupo.totalSeries,

          itemsCorrectos: grupo.seriesCorrectas,

          itemsIncorrectos: grupo.seriesIncorrectas,

          porcentaje,

          estado,

          recomendacion:
            recomendaciones[codigo] ??
            'Reforzar las actividades relacionadas con esta área mediante ejercicios estructurados, apoyos visuales y práctica guiada.'
        };
      }
    );
  }

  // =====================================================
  // NORMALIZAR CÓDIGO DE SUBTEST
  // =====================================================

  private normalizarCodigoSubtest(valor: string): string {
    return (valor ?? '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
  }

  // =====================================================
  // FORMATEAR NOMBRES DE ACTIVIDADES
  // =====================================================

  private formatearNombreActividad(codigo: string): string {
    return codigo
      .toLowerCase()
      .split('_')
      .map(palabra =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1)
      )
      .join(' ');
  }

  // =====================================================
  // UTILIDADES DE PRESENTACIÓN
  // =====================================================

  obtenerTextoEstado(estado: string): string {
    switch (estado) {
      case 'APROBADO':
        return 'Desempeño logrado';

      case 'NECESITA APOYO':
        return 'Requiere apoyo';

      default:
        return 'Sin datos suficientes';
    }
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

  onSidebarToggle(expanded: boolean): void {
    this.sidebarExpanded = expanded;
  }

  volverListado(): void {
    this.resultadoSeleccionado = null;

    this.modelosML = [];
    this.promedioML = null;
    this.resultadosSubtests = [];

    this.errorDetalle = '';

    // Si se llegó desde un enlace directo, volver a la URL del listado.
    if (this.route.snapshot.paramMap.has('idEvaluacion')) {
      this.router.navigate(['/evaluaciones/resultados-finales']);
    }
  }

  // =====================================================
  // GRÁFICO DE ARAÑA K-ABC
  // =====================================================

  get radarEjes() {
    const total = this.resultadosSubtests.length;

    if (total === 0) {
      return [];
    }

    return this.resultadosSubtests.map((subtest, index) => {

      const angulo =
        (2 * Math.PI * index / total) - Math.PI / 2;

      const porcentaje = Math.max(
        0,
        Math.min(100, Number(subtest.porcentaje) || 0)
      );

      return {
        numero: index + 1,

        nombre: subtest.nombre,

        porcentaje,

        // Centro del gráfico
        x1: this.radarCentro,
        y1: this.radarCentro,

        // Extremos de los ejes
        x2: this.radarCentro +
          this.radarRadio * Math.cos(angulo),

        y2: this.radarCentro +
          this.radarRadio * Math.sin(angulo),

        // Posición de los números
        labelX: this.radarCentro +
          (this.radarRadio + 23) * Math.cos(angulo),

        labelY: this.radarCentro +
          (this.radarRadio + 23) * Math.sin(angulo),

        // Posición de los puntos según porcentaje
        puntoX: this.radarCentro +
          this.radarRadio *
          (porcentaje / 100) *
          Math.cos(angulo),

        puntoY: this.radarCentro +
          this.radarRadio *
          (porcentaje / 100) *
          Math.sin(angulo)
      };
    });
  }

  // =====================================================
  // POLÍGONO DEL GRÁFICO
  // =====================================================

  get radarPoligono(): string {
    return this.radarEjes
      .map(eje => `${eje.puntoX},${eje.puntoY}`)
      .join(' ');
  }

  // =====================================================
  // NIVELES DEL GRÁFICO
  // =====================================================

  radarNivel(nivel: number): string {
    const total = this.resultadosSubtests.length;

    if (total === 0) {
      return '';
    }

    return this.resultadosSubtests.map((_, index) => {

      const angulo =
        (2 * Math.PI * index / total) - Math.PI / 2;

      const radio =
        this.radarRadio * (nivel / 100);

      const x =
        this.radarCentro + radio * Math.cos(angulo);

      const y =
        this.radarCentro + radio * Math.sin(angulo);

      return `${x},${y}`;

    }).join(' ');
  }

}
