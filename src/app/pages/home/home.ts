import { Component } from '@angular/core';
import {Sidebar} from '../../layout/sidebar/sidebar';
import {Navbar} from '../../layout/navbar/navbar';

@Component({
  selector: 'app-home',
  imports: [
    Sidebar,
    Navbar
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  sidebarExpanded = false;


  onSidebarToggle(value: boolean): void {
    this.sidebarExpanded = value;
  }
}
