import {
  Component,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { environment } from '../../../environments/environment';

/**
 * Cronómetro de evaluación.
 *
 * - Cuenta el tiempo ACTIVO de una evaluación (se pausa si la pestaña
 *   no está visible) y lo guarda en el backend cada 15 s, al terminar
 *   y al salir de la pantalla (PATCH /evaluaciones/{id}/tiempo).
 * - Retoma el tiempo ya guardado si la evaluación se reanuda.
 * - Con [idNinoBase] suma además el tiempo de la Q-CHAT completada de
 *   ese niño, para que en K-ABC el contador continúe desde Q-CHAT.
 */
@Component({
  selector: 'app-cronometro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cronometro.html',
  styleUrl: './cronometro.css'
})
export class Cronometro implements OnChanges, OnDestroy {

  /** Evaluación cuyo tiempo se mide. */
  @Input() idEvaluacion: number | null = null;

  /** true mientras el niño está respondiendo. */
  @Input() activo = false;

  /** Si se indica, se suma el tiempo de su Q-CHAT completada. */
  @Input() idNinoBase: number | null = null;

  /** ID de versión de Q-CHAT (para buscar el tiempo base). */
  @Input() idVersionBase = 1;

  @Input() etiqueta = 'Tiempo';

  segundosEvaluacion = 0;
  segundosBase = 0;

  cargado = false;

  private intervalo: ReturnType<typeof setInterval> | null = null;
  private segundosGuardados = 0;
  private visible = true;
  private readonly cadaCuantoGuardar = 15;
  private readonly API_URL = environment.apiUrl;
  private readonly esNavegador: boolean;

  private readonly alCambiarVisibilidad = () => {
    this.visible = document.visibilityState === 'visible';
    if (!this.visible) {
      this.guardar(true);
    }
  };

  private readonly alSalir = () => this.guardar(true);

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.esNavegador = isPlatformBrowser(platformId);

    if (this.esNavegador) {
      document.addEventListener('visibilitychange', this.alCambiarVisibilidad);
      window.addEventListener('pagehide', this.alSalir);
    }
  }

  get totalSegundos(): number {
    return this.segundosBase + this.segundosEvaluacion;
  }

  get tiempoFormateado(): string {
    return Cronometro.formatear(this.totalSegundos);
  }

  get tieneBase(): boolean {
    return this.segundosBase > 0;
  }

  get baseFormateada(): string {
    return Cronometro.formatear(this.segundosBase);
  }

  /** 754 → "12:34"; 3754 → "1:02:34" */
  static formatear(segundos: number | null | undefined): string {
    const total = Math.max(0, Math.floor(segundos ?? 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const dos = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.esNavegador) {
      return;
    }

    if (changes['idEvaluacion']) {
      const anterior = changes['idEvaluacion'].previousValue as number | null;

      if (anterior && anterior !== this.idEvaluacion) {
        this.guardar(true, anterior);
      }

      this.detenerIntervalo();
      this.cargado = false;
      this.segundosEvaluacion = 0;
      this.segundosGuardados = 0;

      if (this.idEvaluacion) {
        this.cargarTiempos();
      }
    }

    if (changes['idNinoBase'] && !changes['idEvaluacion']) {
      this.cargarBase();
    }

    if (changes['activo']) {
      if (this.activo) {
        this.iniciarIntervalo();
      } else {
        this.detenerIntervalo();
        this.guardar(true);
      }
    }
  }

  ngOnDestroy(): void {
    this.detenerIntervalo();
    this.guardar(true);

    if (this.esNavegador) {
      document.removeEventListener('visibilitychange', this.alCambiarVisibilidad);
      window.removeEventListener('pagehide', this.alSalir);
    }
  }

  // =========================================================
  // CARGA
  // =========================================================

  private async cargarTiempos(): Promise<void> {
    const id = this.idEvaluacion;

    try {
      const respuesta = await fetch(`${this.API_URL}/evaluaciones/${id}`, {
        headers: this.headers()
      });

      if (respuesta.ok && id === this.idEvaluacion) {
        const evaluacion = await respuesta.json();
        const guardados = Number(evaluacion?.tiempoActivoSegundos ?? 0);

        // Si ya empezó a contar mientras cargaba, se conserva lo mayor.
        this.segundosEvaluacion = Math.max(this.segundosEvaluacion, guardados);
        this.segundosGuardados = guardados;
      }
    } catch {
      // Sin conexión: se cuenta desde 0 y se guarda cuando se pueda.
    }

    await this.cargarBase();

    this.cargado = true;

    if (this.activo) {
      this.iniciarIntervalo();
    }
  }

  private async cargarBase(): Promise<void> {
    this.segundosBase = 0;

    if (!this.idNinoBase) {
      return;
    }

    try {
      const params = new URLSearchParams({
        idNino: String(this.idNinoBase),
        estado: 'COMPLETADA',
        page: '0',
        size: '50'
      });

      const respuesta = await fetch(`${this.API_URL}/evaluaciones?${params}`, {
        headers: this.headers()
      });

      if (!respuesta.ok) {
        return;
      }

      const pagina = await respuesta.json();
      const evaluaciones: any[] = pagina?.content ?? [];

      const ultimaQChat = evaluaciones
        .filter(e => Number(e.idVersion) === this.idVersionBase)
        .sort((a, b) =>
          new Date(b.fechaEvaluacion ?? 0).getTime() -
          new Date(a.fechaEvaluacion ?? 0).getTime()
        )[0];

      this.segundosBase = Number(ultimaQChat?.tiempoActivoSegundos ?? 0);
    } catch {
      this.segundosBase = 0;
    }
  }

  // =========================================================
  // CONTEO
  // =========================================================

  private iniciarIntervalo(): void {
    if (this.intervalo || !this.idEvaluacion || !this.esNavegador) {
      return;
    }

    this.visible = document.visibilityState === 'visible';

    this.zone.runOutsideAngular(() => {
      this.intervalo = setInterval(() => {
        if (!this.visible || !this.activo) {
          return;
        }

        this.zone.run(() => {
          this.segundosEvaluacion++;

          if (this.segundosEvaluacion - this.segundosGuardados >= this.cadaCuantoGuardar) {
            this.guardar(false);
          }
        });
      }, 1000);
    });
  }

  private detenerIntervalo(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  // =========================================================
  // GUARDADO EN EL BACKEND
  // =========================================================

  private guardar(alSalir: boolean, idEvaluacion: number | null = this.idEvaluacion): void {
    if (!this.esNavegador || !idEvaluacion) {
      return;
    }

    const segundos = this.segundosEvaluacion;

    if (segundos <= this.segundosGuardados && idEvaluacion === this.idEvaluacion) {
      return;
    }

    if (idEvaluacion === this.idEvaluacion) {
      this.segundosGuardados = segundos;
    }

    fetch(`${this.API_URL}/evaluaciones/${idEvaluacion}/tiempo`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ segundos }),
      // keepalive permite que la petición termine aunque se cierre la pestaña
      keepalive: alSalir
    }).catch(() => {
      // Se reintenta en el siguiente guardado.
      if (idEvaluacion === this.idEvaluacion) {
        this.segundosGuardados = Math.min(this.segundosGuardados, segundos - 1);
      }
    });
  }

  private headers(): HeadersInit {
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }
}
