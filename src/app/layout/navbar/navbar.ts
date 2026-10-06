import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {filter} from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  showUserMenu = false;
  showThemes = false;
  currentSection = 'General';
  currentPage = 'Dashboard';
  usuario: string = '';
  rol: string = '';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {

  const usuarioGuardado = localStorage.getItem('usuario');
  const rolGuardado = localStorage.getItem('rol');

  if (usuarioGuardado) {
    try {
      const response = JSON.parse(usuarioGuardado);

      if (response.usuario) {
        this.usuario =
          `${response.usuario.nombres} ${response.usuario.apellidos}`;
      }
    } catch (error) {
      console.error('Error al leer el usuario:', error);
    }
  }

  this.rol = rolGuardado
    ?.replace('ROLE_', '')
    .toUpperCase() || '';

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    document.body.className = savedTheme;
  }
}

    this.updateBreadcrumb();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumb();
        this.showThemes = false;
        this.showUserMenu = false;
      });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showThemes = false;
    }
  }

  toggleThemes(): void {
    this.showThemes = !this.showThemes;
    if (this.showThemes) {
      this.showUserMenu = false;
    }
  }

  changeTheme(theme: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.className = theme;
      localStorage.setItem('theme', theme);
    }
    this.showThemes = false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
    }

    this.router.navigate(['/']);
  }

  updateBreadcrumb(): void {
    switch (this.router.url) {
      case '/home':
        this.currentSection = 'General';
        this.currentPage = 'Dashboard';
        break;
      case '/PrendaHome':
        this.currentSection = 'Gestión';
        this.currentPage = 'Prendas';
        break;
      case '/CatalogoHome':
        this.currentSection = 'Gestión';
        this.currentPage = 'Catálogo';
        break;
      case '/XDD':
        this.currentSection = 'Gestión';
        this.currentPage = 'Lotes FIFO';
        break;
      case '/VentaHome':
        this.currentSection = 'Operaciones';
        this.currentPage = 'Ventas';
        break;
      case '/reportes':
        this.currentSection = 'Operaciones';
        this.currentPage = 'Reportes';
        break;
      default:
        this.currentSection = 'General';
        this.currentPage = 'Dashboard';
        break;
    }
  }
}
