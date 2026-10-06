import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-custom-date',
  templateUrl: './custom-date.html',
  imports: [
    NgForOf,
    NgIf
  ],
  styleUrls: ['./custom-date.css']
})
export class CustomDate {

  constructor(private elementRef: ElementRef) {}

  @Input()
  placeholder = 'Seleccionar fecha';

  @Input()
  value: string | null = null;

  @Output()
  valueChange = new EventEmitter<string | null>();

  open = false;

  vista: 'dias' | 'anios' = 'dias';

  viewDate = new Date();

  readonly diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  readonly meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  toggle(event: Event): void {

    event.stopPropagation();

    if (!this.open) {
      this.closePrevious();
    } else {
      (window as any).__openedDropdown = null;
    }

    this.open = !this.open;

    if (this.open) {

      this.viewDate = this.value
        ? new Date(this.value + 'T00:00:00')
        : new Date();

      this.vista = 'dias';

    }

  }

  private closePrevious(): void {

    const current = (window as any).__openedDropdown;

    if (current && current !== this) {
      current.open = false;

      if ('vista' in current) {
        current.vista = 'dias';
      }
    }

    (window as any).__openedDropdown = this;

  }

  readonly mesesCortos = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  get selectedLabel(): string {

    if (!this.value) {
      return this.placeholder;
    }

    const fecha = new Date(this.value + 'T00:00:00');

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = this.mesesCortos[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${dia} ${mes} ${anio}`;
  }

  get etiquetaMes(): string {
    return `${this.meses[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
  }

  get diasDelMes(): (Date | null)[] {

    const anio = this.viewDate.getFullYear();
    const mes = this.viewDate.getMonth();

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    const offsetInicio = primerDia.getDay();

    const dias: (Date | null)[] = [];

    for (let i = 0; i < offsetInicio; i++) {
      dias.push(null);
    }

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(anio, mes, d));
    }

    return dias;
  }

  // --- NUEVO: vista de años ---

  get rangoAnios(): number[] {

    // Bloque de 12 años, centrado en décadas (ej: 2020-2031)
    const anioActual = this.viewDate.getFullYear();
    const inicioBloque = Math.floor(anioActual / 12) * 12;

    const anios: number[] = [];

    for (let i = 0; i < 12; i++) {
      anios.push(inicioBloque + i);
    }

    return anios;
  }

  get etiquetaRangoAnios(): string {

    const anios = this.rangoAnios;

    return `${anios[0]} - ${anios[anios.length - 1]}`;
  }

  abrirVistaAnios(event: Event): void {

    event.stopPropagation();

    this.vista = this.vista === 'dias' ? 'anios' : 'dias';
  }

  esAnioSeleccionado(anio: number): boolean {

    return this.viewDate.getFullYear() === anio;
  }

  esAnioActual(anio: number): boolean {

    return new Date().getFullYear() === anio;
  }

  seleccionarAnio(anio: number, event: Event): void {

    event.stopPropagation();

    this.viewDate = new Date(anio, this.viewDate.getMonth(), 1);
    this.vista = 'dias';
  }

  bloqueAnioAnterior(event: Event): void {

    event.stopPropagation();

    this.viewDate = new Date(
      this.viewDate.getFullYear() - 12,
      this.viewDate.getMonth(),
      1
    );
  }

  bloqueAnioSiguiente(event: Event): void {

    event.stopPropagation();

    this.viewDate = new Date(
      this.viewDate.getFullYear() + 12,
      this.viewDate.getMonth(),
      1
    );
  }

  // --- navegación normal de meses ---

  mesAnterior(event: Event): void {

    event.stopPropagation();

    this.viewDate = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() - 1,
      1
    );
  }

  mesSiguiente(event: Event): void {

    event.stopPropagation();

    this.viewDate = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() + 1,
      1
    );
  }

  esSeleccionado(dia: Date | null): boolean {

    if (!dia || !this.value) {
      return false;
    }

    return this.toIsoDate(dia) === this.value;
  }

  esHoy(dia: Date | null): boolean {

    if (!dia) {
      return false;
    }

    const hoy = new Date();

    return dia.getDate() === hoy.getDate()
      && dia.getMonth() === hoy.getMonth()
      && dia.getFullYear() === hoy.getFullYear();
  }

  seleccionarDia(dia: Date | null, event: Event): void {

    event.stopPropagation();

    if (!dia) {
      return;
    }

    const iso = this.toIsoDate(dia);

    this.value = iso;
    this.valueChange.emit(iso);

    this.open = false;
    this.vista = 'dias';

    if ((window as any).__openedDropdown === this) {
      (window as any).__openedDropdown = null;
    }

  }

  limpiar(event: Event): void {

    event.stopPropagation();

    this.value = null;
    this.valueChange.emit(null);

    this.open = false;
    this.vista = 'dias';

    if ((window as any).__openedDropdown === this) {
      (window as any).__openedDropdown = null;
    }

  }

  private toIsoDate(d: Date): string {

    const anio = d.getFullYear();
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const dia = d.getDate().toString().padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  @HostListener('document:click', ['$event'])
  close(event: MouseEvent): void {

    if (!this.elementRef.nativeElement.contains(event.target)) {

      this.open = false;
      this.vista = 'dias';

      if ((window as any).__openedDropdown === this) {
        (window as any).__openedDropdown = null;
      }

    }

  }
}
