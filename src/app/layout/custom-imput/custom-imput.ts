import {booleanAttribute, Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-custom-imput',
  imports: [
    NgIf
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomImput),
      multi: true
    }
  ],
  templateUrl: './custom-imput.html',
  styleUrl: './custom-imput.css',
})
export class CustomImput  implements ControlValueAccessor {
  @Input({transform: booleanAttribute}) invalid = false;
  @Input() placeholder = '';
  @Input() type: 'default' | 'number' | 'password' | 'email' | 'text' = 'default';
  @Input() icon?: string;
  @Input() variant: 'default' | 'outline' = 'default';

  // Compatibilidad con [(value)]
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  disabled = false;
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }
}
