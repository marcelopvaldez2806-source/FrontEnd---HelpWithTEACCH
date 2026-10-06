import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';

import { Router } from '@angular/router';
import { isPlatformBrowser, NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [NgIf],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  isExpanded = false;

  usuario = 'Usuario';
  rol = '';

  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      const usuarioGuardado = localStorage.getItem('usuario');
      const rolGuardado = localStorage.getItem('rol');

      // Obtener nombre y apellidos desde el LoginResponse
      if (usuarioGuardado) {
        try {
          const response = JSON.parse(usuarioGuardado);

          if (response.usuario) {
            this.usuario =
              `${response.usuario.nombres} ${response.usuario.apellidos}`;
          }
        } catch (error) {
          console.error('Error al leer usuario del localStorage:', error);
        }
      }

      // Obtener rol
      this.rol = rolGuardado
        ?.replace('ROLE_', '')
        .toUpperCase() || '';

      // Recuperar estado del sidebar
      this.isExpanded =
        localStorage.getItem('sidebar-expanded') === 'true';
    }

    this.sidebarToggle.emit(this.isExpanded);
  }

  get isAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  get isDocente(): boolean {
    return this.rol === 'DOCENTE';
  }

  get isPadre(): boolean {
    return this.rol === 'PADRE';
  }

  toggleSidebar(): void {

    this.isExpanded = !this.isExpanded;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(
        'sidebar-expanded',
        String(this.isExpanded)
      );
    }

    this.sidebarToggle.emit(this.isExpanded);
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

 isActive(route: string): boolean {
  return this.router.url === route ||
         this.router.url.startsWith(route + '/');
}
}