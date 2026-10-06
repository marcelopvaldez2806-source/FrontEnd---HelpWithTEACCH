import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'evaluaciones/qchat/resultados/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'evaluaciones/resultados-finales/:idEvaluacion',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];