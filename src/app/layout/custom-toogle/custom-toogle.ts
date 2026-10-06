import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-custom-toogle',
  templateUrl: './custom-toogle.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./custom-toogle.css']
})

export class CustomToggle {
  @Input() value: boolean | null = null;
  @Input() label = '';
  @Input() mode: 'boolean' | 'action' = 'boolean';
  @Input() disabled = false;
  @Input() activeLabel = 'Sí';
  @Input() inactiveLabel = 'No';
  @Input() variant: 'default' | 'button' = 'default';
  @Input() showIcon: boolean = true;
  @Output() valueChange = new EventEmitter<boolean>();
  @Output() activated = new EventEmitter<void>();
  @Output() deactivated = new EventEmitter<void>();

  toggle(): void {
    if (this.disabled) {
      return;
    }

    const newValue = this.value !== true;

    this.value = newValue;

    if (this.mode === 'boolean') {
      this.valueChange.emit(newValue);
      return;
    }

    if (newValue) {
      this.activated.emit();
    } else {
      this.deactivated.emit();
    }
  }

  get displayLabel(): string {
    return this.value === true
      ? this.activeLabel
      : this.inactiveLabel;
  }
}
