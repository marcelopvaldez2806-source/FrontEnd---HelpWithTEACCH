import {Component, Input } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {KpiItem} from '../../models/SelectOption';

@Component({
  selector: 'app-kpi-grid',
  imports: [
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './kpi-grid.html',
  styleUrl: './kpi-grid.css',
})
export class KpiGrid {
  @Input() items: KpiItem[] = [];
}
