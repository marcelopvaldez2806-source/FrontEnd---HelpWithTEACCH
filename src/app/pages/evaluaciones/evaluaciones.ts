import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Navbar } from '../../layout/navbar/navbar';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [
    Navbar,
    Sidebar,
    Header
  ],
  templateUrl: './evaluaciones.html',
  styleUrl: './evaluaciones.css'
})
export class Evaluaciones {

  sidebarExpanded = false;

  constructor(private router: Router) {}

  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }

  hacerQChat(): void {
    this.router.navigate(['/evaluaciones/qchat']);
  }

  hacerKabc(): void {
    this.router.navigate(['/evaluaciones/kabc']);
  }
}