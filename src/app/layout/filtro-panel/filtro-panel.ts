import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgForOf, NgIf} from '@angular/common';
import {CustomSelect} from '../custom-select/custom-select';
import {CustomDate} from '../custom-date/custom-date';
import {CustomImput} from '../custom-imput/custom-imput';
import {AdvancedField, SelectOption} from '../../models/SelectOption';

@Component({
  selector: 'app-filtro-panel',
  imports: [
    FormsModule,
    NgForOf,
    CustomSelect,
    CustomDate,
    NgIf,
    CustomImput,
  ],
  templateUrl: './filtro-panel.html',
  styleUrl: './filtro-panel.css',
})
export class FiltroPanel {

  @Input()
  searchPlaceholder = 'Buscar...';

  @Input()
  select1Placeholder = '';

  @Input()
  select2Placeholder = '';

  @Input()
  select3Placeholder = '';

  @Input()
  select1Options: SelectOption[] = [];

  @Input()
  select2Options: SelectOption[] = [];

  @Input()
  select3Options: SelectOption[] = [];

  @Input()
  select3Type: 'select' | 'date' = 'select';

  @Input()
  advancedFields: AdvancedField[] = [];

  @Output()
  filtersChange = new EventEmitter<any>();

  search = '';

  select1: any = '';

  select2: any = '';

  select3: any = '';

  showAdvanced = false;

  private timeout: any;

  emitFilters(): void {

    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {

      this.filtersChange.emit({

        search: this.search,

        select1: this.select1,

        select2: this.select2,

        select3: this.select3,

        advanced: this.advancedFields

      });

    }, 500);

  }

  toggleAdvancedFilters() {
    this.showAdvanced = !this.showAdvanced;
  }


  clearFilters(emit = true): void {
    console.log('clearFilters', emit);
    this.search = '';
    this.select1 = '';
    this.select2 = '';
    this.select3 = this.select3Type === 'date' ? null : '';

    this.advancedFields.forEach(field => field.value = null);

    if (emit) {
      this.emitFilters();
    }
  }

  setFilters(data: {
    search?: string;
    select1?: any;
    select2?: any;
    select3?: any;
  }): void {

    this.search = data.search ?? '';
    this.select1 = data.select1 ?? '';
    this.select2 = data.select2 ?? '';
    this.select3 = data.select3 ?? (this.select3Type === 'date' ? null : '');

    this.emitFilters();
  }
}
