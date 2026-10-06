import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input, OnDestroy,
  Output
} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {SelectOption} from '../../model/SelectOption';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  imports: [
    NgForOf,
    NgIf
  ],
  styleUrls: ['./custom-select.css']
})
export class CustomSelect implements OnDestroy {

  @Input() variant: 'default' | 'compact' | 'paginator' = 'default';
  @Input() invalid = false;

  @Input()
  placeholder = 'Seleccionar';

  @Input()
  options: SelectOption[] = [];

  @Input()
  value: any = null;

  @Output()
  valueChange = new EventEmitter<any>();

  open = false;

  constructor(private elementRef: ElementRef) {}

  toggle(event: Event): void {

    event.stopPropagation();

    if (!this.open) {
      this.closePrevious();
    } else {
      (window as any).__openedDropdown = null;
    }

    this.open = !this.open;

  }

  select(option: SelectOption): void {

    if (this.value === option.value) {
      this.value = null;
      this.valueChange.emit(null);
    } else {
      this.value = option.value;
      this.valueChange.emit(option.value);
    }

    this.open = false;

    if ((window as any).__openedDropdown === this) {
      (window as any).__openedDropdown = null;
    }

  }

  get selectedLabel(): string {

    return this.options.find(x => x.value === this.value)?.label
      ?? this.placeholder;

  }

  private closePrevious(): void {

    const current = (window as any).__openedDropdown;

    if (current && current !== this) {
      current.open = false;
    }

    (window as any).__openedDropdown = this;

  }

  @HostListener('document:click', ['$event'])
  close(event: MouseEvent): void {

    if (!this.elementRef.nativeElement.contains(event.target)) {

      this.open = false;

      if ((window as any).__openedDropdown === this) {
        (window as any).__openedDropdown = null;
      }

    }

  }

  ngOnDestroy(): void {

    if ((window as any).__openedDropdown === this) {
      (window as any).__openedDropdown = null;
    }

  }

}
