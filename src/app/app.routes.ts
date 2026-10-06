import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Nino } from './pages/nino/nino';
import { Usuario } from './pages/usuario/usuario';
import { Evaluaciones } from './pages/evaluaciones/evaluaciones';

import { QChat } from './pages/evaluaciones/qchat/qchat';
import { QChatResultados } from './pages/evaluaciones/qchat-resultados/qchat-resultados';

import { Kabc } from './pages/evaluaciones/kabc/kabc';

import { Resultados } from './pages/resultados/resultados';

import { ResultadosFinales } from './pages/evaluaciones/resultados-finales/resultados-finales';


export const routes: Routes = [

  // =========================================================
  // LOGIN
  // =========================================================

  {
    path: 'login',
    component: Login
  },


  // =========================================================
  // HOME
  // =========================================================

  {
    path: 'home',
    component: Home
  },


  // =========================================================
  // NIÑOS
  // =========================================================

  {
    path: 'nino',
    component: Nino
  },


  // =========================================================
  // USUARIOS
  // =========================================================

  {
    path: 'usuario',
    component: Usuario
  },


  // =========================================================
  // EVALUACIONES
  // =========================================================

  {
    path: 'evaluaciones',
    component: Evaluaciones
  },


  // =========================================================
  // Q-CHAT
  // =========================================================

  {
    path: 'evaluaciones/qchat',
    component: QChat
  },

  {
    path: 'evaluaciones/qchat/resultados/:id',
    component: QChatResultados
  },


  // =========================================================
  // K-ABC
  // =========================================================

  {
    path: 'evaluaciones/kabc',
    component: Kabc
  },


  // =========================================================
  // RESULTADOS Q-CHAT
  // Pantalla existente
  // =========================================================

  {
    path: 'resultados',
    component: Resultados
  },


  // =========================================================
  // RESULTADOS FINALES
  // Listado de evaluaciones Q-CHAT + K-ABC
  // =========================================================

  {
    path: 'evaluaciones/resultados-finales',
    component: ResultadosFinales
  },


  // =========================================================
  // RESULTADO FINAL INDIVIDUAL
  // Q-CHAT + K-ABC + RADAR + ESTRATEGIAS
  // =========================================================

  {
    path: 'evaluaciones/resultados-finales/:idEvaluacion',
    component: ResultadosFinales
  },


  // =========================================================
  // RUTA INICIAL
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =========================================================
  // RUTA NO ENCONTRADA
  // =========================================================

  {
    path: '**',
    redirectTo: 'login'
  }

];