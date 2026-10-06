import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../../layout/navbar/navbar';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { environment } from '../../../../environments/environment';

interface PrediccionML {
  idPrediccion: number;
  idEvaluacion: number;
  modelo: string;
  resultado: string;
  probabilidad: number;
  fechaPrediccion: string;
}

@Component({
  selector: 'app-qchat-resultados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    Sidebar
  ],
  templateUrl: './qchat-resultados.html',
  styleUrl: './qchat-resultados.css'
})
export class QChatResultados {

  // =========================================================
  // CONFIGURACIÓN
  // =========================================================

  private readonly API_URL = environment.apiUrl;

  // =========================================================
  // ESTADO
  // =========================================================

  sidebarAbierto = true;

  evaluacionId!: number;

  predicciones: PrediccionML[] = [];

  randomForest: PrediccionML | null = null;
  xgboost: PrediccionML | null = null;

  cargando = true;
  error = '';

  // =========================================================
  // ENSEMBLE LEARNING
  // =========================================================

  probabilidadEnsemble = 0;

  resultadoEnsemble = '';

  // Pesos actuales del Soft Voting
  // 50% Random Forest
  // 50% XGBoost
  pesoRandomForest = 0.5;
  pesoXGBoost = 0.5;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {
        this.error = 'No se encontró el ID de la evaluación.';
        this.cargando = false;
        return;
      }

      this.evaluacionId = Number(id);

      this.cargarPredicciones();
    });
  }

  // =========================================================
  // SIDEBAR
  // =========================================================

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  // =========================================================
  // CARGAR PREDICCIONES
  // =========================================================

  async cargarPredicciones(): Promise<void> {

    this.cargando = true;
    this.error = '';

    try {

      const token = localStorage.getItem('token');

      const response = await fetch(
        `${this.API_URL}/predicciones-ml/evaluacion/${this.evaluacionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {})
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error HTTP ${response.status}`
        );
      }

      const data: PrediccionML[] = await response.json();

      this.predicciones = data;

      // -----------------------------------------------------
      // Separar modelos
      // -----------------------------------------------------

      this.randomForest =
        data.find(
          p => p.modelo?.toUpperCase() === 'RANDOM_FOREST'
        ) ?? null;

      this.xgboost =
        data.find(
          p => p.modelo?.toUpperCase() === 'XGBOOST'
        ) ?? null;

      // -----------------------------------------------------
      // Calcular Ensemble
      // -----------------------------------------------------

      this.calcularEnsemble();

    } catch (error) {

      console.error(
        'Error al cargar las predicciones:',
        error
      );

      this.error =
        'No se pudieron cargar los resultados de la evaluación.';

    } finally {

      this.cargando = false;
    }
  }

  // =========================================================
  // CALCULAR ENSEMBLE LEARNING
  // =========================================================

  calcularEnsemble(): void {

    // Necesitamos ambos modelos
    if (!this.randomForest || !this.xgboost) {

      this.probabilidadEnsemble = 0;
      this.resultadoEnsemble = '';

      return;
    }

    const probabilidadRF =
      Number(this.randomForest.probabilidad);

    const probabilidadXGB =
      Number(this.xgboost.probabilidad);

    // -------------------------------------------------------
    // SOFT VOTING
    //
    // Ensemble =
    // (RF × pesoRF) + (XGBoost × pesoXGBoost)
    // -------------------------------------------------------

    this.probabilidadEnsemble =
      (probabilidadRF * this.pesoRandomForest) +
      (probabilidadXGB * this.pesoXGBoost);

    // -------------------------------------------------------
    // Clasificación final
    //
    // Umbral:
    // >= 50% → ASD
    // < 50%  → No ASD
    // -------------------------------------------------------

    this.resultadoEnsemble =
      this.probabilidadEnsemble >= 0.5
        ? 'ASD'
        : 'No ASD';

    console.log(
      '===== ENSEMBLE LEARNING ====='
    );

    console.log(
      'Random Forest:',
      probabilidadRF
    );

    console.log(
      'XGBoost:',
      probabilidadXGB
    );

    console.log(
      'Peso RF:',
      this.pesoRandomForest
    );

    console.log(
      'Peso XGBoost:',
      this.pesoXGBoost
    );

    console.log(
      'Probabilidad Ensemble:',
      this.probabilidadEnsemble
    );

    console.log(
      'Resultado Ensemble:',
      this.resultadoEnsemble
    );
  }

  // =========================================================
  // PORCENTAJE ENSEMBLE
  // =========================================================

  get porcentajeEnsemble(): number {

    return this.probabilidadEnsemble * 100;
  }

  // =========================================================
  // PORCENTAJE RANDOM FOREST
  // =========================================================

  get porcentajeRandomForest(): number {

    if (!this.randomForest) {
      return 0;
    }

    return Number(this.randomForest.probabilidad) * 100;
  }

  // =========================================================
  // PORCENTAJE XGBOOST
  // =========================================================

  get porcentajeXGBoost(): number {

    if (!this.xgboost) {
      return 0;
    }

    return Number(this.xgboost.probabilidad) * 100;
  }

  // =========================================================
  // CLASE RESULTADO ENSEMBLE
  // =========================================================

  get claseResultadoEnsemble(): string {

    return this.resultadoEnsemble === 'ASD'
      ? 'resultado-asd'
      : 'resultado-no-asd';
  }

  // =========================================================
  // CLASE RANDOM FOREST
  // =========================================================

  get claseRandomForest(): string {

    if (!this.randomForest) {
      return '';
    }

    return this.randomForest.resultado === 'ASD'
      ? 'resultado-asd'
      : 'resultado-no-asd';
  }

  // =========================================================
  // CLASE XGBOOST
  // =========================================================

  get claseXGBoost(): string {

    if (!this.xgboost) {
      return '';
    }

    return this.xgboost.resultado === 'ASD'
      ? 'resultado-asd'
      : 'resultado-no-asd';
  }

  // =========================================================
  // VOLVER
  // =========================================================

  volver(): void {

    this.router.navigate([
      '/evaluaciones/qchat'
    ]);
  }

  // =========================================================
  // VOLVER A RESULTADOS
  // =========================================================

  volverResultados(): void {

    this.router.navigate([
      '/resultados'
    ]);
  }
}