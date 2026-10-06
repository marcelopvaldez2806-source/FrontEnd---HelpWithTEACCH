import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomSelect} from '../../../../layout/custom-select/custom-select';
import {CustomImput} from '../../../../layout/custom-imput/custom-imput';
import {SelectOption} from '../../../../models/SelectOption';
import {DatePipe, NgIf} from '@angular/common';
import {NinoService} from '../../../../core/services/nino.service';
import {CustomToggle} from '../../../../layout/custom-toogle/custom-toogle';
import {NinoRequest} from '../../../../models/NinoRequest';
import {CustomDate} from '../../../../layout/custom-date/custom-date';

@Component({
  selector: 'app-modal-nino',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CustomImput,
    DatePipe,
    NgIf,
    CustomSelect,
    CustomToggle,
    CustomDate,
  ],
  templateUrl: './modal-nino.html',
  styleUrl: './modal-nino.css',
})
export class ModalNino implements OnInit {

  private datosOriginales = '';

  @Input() modoEdicion = false;
  @Input() idNino: number | null = null;
  @Input() datosNino: any = null;

  @Output() modalClose = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;

  submitted = false;
  closing = false;
  guardando: boolean = false;

  fechaActual = '';

  opcionesSexo: SelectOption[] = [
    { label: 'Masculino', value: 'MASCULINO' },
    { label: 'Femenino', value: 'FEMENINO' }
  ];

  opcionesEtnia: SelectOption[] = [
    { label: 'Middle Eastern', value: 'Middle Eastern' },
    { label: 'White European', value: 'White-European' },
    { label: 'Hispanic', value: 'Hispanic' },
    { label: 'Black', value: 'Black' },
    { label: 'Asian', value: 'Asian' },
    { label: 'South Asian', value: 'South Asian' },
    { label: 'Native Indian', value: 'Native Indian' },
    { label: 'Others', value: 'Others' },
    { label: 'Latino', value: 'Latino' },
    { label: 'Mixed', value: 'Mixed' },
    { label: 'Pacifica', value: 'Pacifica' },
    { label: 'Turkish', value: 'Turkish' },
    { label: 'No especificado', value: '?' }
  ];

  constructor(
    private fb: FormBuilder,
    private ninoService: NinoService
  ) {}

  ngOnInit(): void {

    this.fechaActual = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    this.form = this.fb.group({
      nombres: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      apellidos: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],

      fechaNacimiento: ['', [
        Validators.required
      ]],

      sexo: ['', [
        Validators.required,
        Validators.maxLength(20)
      ]],

      etnia: ['', [
        Validators.maxLength(100)
      ]],


        ictericia: [false],
        familiarConTea: [false],


      fotoUrl: ['', [
        Validators.maxLength(500)
      ]]
    });

    if (this.modoEdicion && this.datosNino) {
      this.cargarDatosNino();
    }
  }

  private cargarDatosNino(): void {
    this.form.patchValue({
      nombres: this.datosNino.nombres ?? '',
      apellidos: this.datosNino.apellidos ?? '',
      fechaNacimiento: this.datosNino.fechaNacimiento ? this.datosNino.fechaNacimiento.substring(0, 10) : '',
      sexo: this.datosNino.sexo ?? '',
      etnia: this.datosNino.etnia ?? '',
      ictericia: this.datosNino.ictericia ?? null,
      familiarConTea: this.datosNino.familiarConTea ?? null,
      fotoUrl: this.datosNino.fotoUrl ?? ''
    });

    this.datosOriginales = JSON.stringify(
      this.form.getRawValue()
    );

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  guardar(): void {

    this.submitted = true;
    
    console.log('FORMULARIO:', this.form.getRawValue());
    console.log('FORM VÁLIDO:', this.form.valid);
    console.log('ERRORES DE CAMPOS:', {
  nombres: this.form.get('nombres')?.errors,
  apellidos: this.form.get('apellidos')?.errors,
  fechaNacimiento: this.form.get('fechaNacimiento')?.errors,
  sexo: this.form.get('sexo')?.errors,
  etnia: this.form.get('etnia')?.errors,
  ictericia: this.form.get('ictericia')?.errors,
  familiarConTea: this.form.get('familiarConTea')?.errors,
  fotoUrl: this.form.get('fotoUrl')?.errors
});


    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.guardando) {
      return;
    }

    if (this.modoEdicion && !this.formularioModificado()) {
      this.saved.emit();
      return;
    }

    const request: NinoRequest = {
      nombres: this.form.get('nombres')?.value,
      apellidos: this.form.get('apellidos')?.value,
      fechaNacimiento: this.form.get('fechaNacimiento')?.value,
      sexo: this.form.get('sexo')?.value,
      etnia: this.form.get('etnia')?.value || undefined,
      ictericia: this.form.get('ictericia')?.value,
      familiarConTea: this.form.get('familiarConTea')?.value,
      fotoUrl: this.form.get('fotoUrl')?.value || undefined
    };

    this.guardando = true;

    if (this.modoEdicion && this.idNino !== null) {
      this.editar(this.idNino, request);
    } else {
      this.registrar(request);
    }
  }

  private registrar(request: NinoRequest): void {

    this.ninoService.crear(request).subscribe({
      next: () => {
        this.guardando = false;
        this.saved.emit();
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al registrar niño:', error);
      }
    });
  }

  private editar(idNino: number, request: NinoRequest): void {

    this.ninoService.editar(idNino, request).subscribe({
      next: () => {
        this.guardando = false;
        this.saved.emit();
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al editar niño:', error);
      }
    });
  }

  private formularioModificado(): boolean {
    return JSON.stringify(this.form.getRawValue()) !== this.datosOriginales;
  }

  limpiarFormulario(): void {

    this.submitted = false;

    this.form.reset({
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      sexo: '',
      etnia: '',
      ictericia: null,
      familiarConTea: null,
      fotoUrl: ''
    });

    this.datosOriginales = '';
    this.guardando = false;
  }

  cancelar(): void {
    this.cerrarModal();
  }

  cerrarModal(limpiar = true): void {

    if (this.closing) {
      return;
    }

    if (limpiar) {
      this.limpiarFormulario();
    }

    this.closing = true;

    setTimeout(() => {
      this.modalClose.emit();
    }, 250);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelar();
  }

  esUrlValida(url: string): boolean {

    if (!url) {
      return false;
    }

    try {
      const parsed = new URL(url);

      return (
        parsed.protocol === 'http:' ||
        parsed.protocol === 'https:'
      );
    } catch {
      return false;
    }
  }

  fotoPreview: string | null = null;
  fotoArchivo: File | null = null;

  onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      return;
    }

    this.fotoArchivo = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.fotoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.fotoArchivo = null;
    this.fotoPreview = null;

    this.form.patchValue({
      imagenUrl: null
    });
  }
}
