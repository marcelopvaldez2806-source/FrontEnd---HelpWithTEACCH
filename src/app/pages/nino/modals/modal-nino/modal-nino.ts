import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PrendaService} from '../../../../services/prenda-service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {CategoriaResponseDTO} from '../../../../model/CategoriaResponseDTO';
import {MarcaResponseDTO} from '../../../../model/MarcaResponseDTO';
import {CategoriaService} from '../../../../services/categoria-service';
import {MarcaService} from '../../../../services/marca-service';
import {PrendaUpdateDTO} from '../../../../model/PrendaUpdateDTO';
import {PrendaRegistroDTO} from '../../../../model/PrendaRegistroDTO';
import {SelectOption} from '../../../../model/SelectOption';
import {CustomSelect} from '../../../../layout/custom-select/custom-select';
import {CustomImput} from '../../../../layout/custom-imput/custom-imput';

@Component({
  selector: 'app-modal-prenda',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgIf,
    DatePipe,
    CustomSelect,
    CustomImput
  ],
  templateUrl: './modal-prenda.html',
  styleUrl: './modal-prenda.css',
})
export class ModalPrenda  implements OnInit {
  private datosOriginales = '';

  categoriaOptions: SelectOption[] = [];
  marcaOptions: SelectOption[] = [];

  @Output()
  buscar = new EventEmitter<any>();

  buscarPrenda(): void {

    const nombre = this.form.value.nombre?.trim() ?? '';

    const categoria = this.categorias.find(
      c => c.idCategoria === this.form.value.categoriaId
    )?.nombre ?? '';

    const marca = this.marcas.find(
      m => m.idMarca === this.form.value.marcaId
    )?.nombre ?? '';

    if (!nombre && !categoria && !marca) {
      return;
    }

    this.buscar.emit({
      search: nombre,
      categoria,
      marca
    });

    this.cerrarModal();

  }

  puedeBuscar(): boolean {
    return (
      this.form.value.nombre?.trim().length > 0 &&
      this.form.value.categoriaId !== null &&
      this.form.value.marcaId !== null
    );
  }

  @Input() modoEdicion = false;

  @Input() idPrenda: number | null = null;

  @Input() datosPrenda: any = null;

  @Output() modalClose = new EventEmitter<void>();

  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;

  categorias: CategoriaResponseDTO[] = [];

  marcas: MarcaResponseDTO[] = [];

  colores: string[] = [];

  submitted = false;

  closing = false;

  loading = false;

  fechaActual = '';

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private marcaService: MarcaService,
    private prendaService: PrendaService
  ) {}


  ngOnInit(): void {
    this.fechaActual = new Date().toLocaleString(
      'es-PE',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      material: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
      imagenUrl: ['', [Validators.maxLength(500), Validators.pattern(/^https?:\/\/.+/i)]],
      categoriaId: [null, Validators.required],
      marcaId: [null, Validators.required]
    });
    this.loadCategorias();
    this.loadMarcas();
    if (this.datosPrenda) {
      this.form.patchValue({
        nombre: this.datosPrenda.nombre ?? '',
        material: this.datosPrenda.material ?? '',
        descripcion: this.datosPrenda.descripcion ?? '',
        imagenUrl: this.datosPrenda.imagenUrl ?? '',
        categoriaId: this.datosPrenda.categoriaId ?? null,
        marcaId: this.datosPrenda.marcaId ?? null
      });
      this.colores = [...(this.datosPrenda.colores || [])];
      this.datosOriginales = JSON.stringify({...this.form.getRawValue(),
        colores: [...this.colores]
      });
    }
  }

  private huboCambios(): boolean {

    const actual = JSON.stringify({

      ...this.form.getRawValue(),

      colores: [...this.colores]

    });

    return actual !== this.datosOriginales;

  }

  loadCategorias(): void {

    this.categoriaService.listarCategorias().subscribe({

      next: data => {

        this.categorias = data;

        this.categoriaOptions = data.map(c => ({
          label: c.nombre,
          value: c.idCategoria
        }));

        if (this.modoEdicion && this.datosPrenda) {
          this.form.patchValue({
            categoriaId: this.datosPrenda.categoriaId
          });
        }

      },

      error: error => console.error(error)

    });

  }

  loadMarcas(): void {

    this.marcaService.listarMarcas().subscribe({

      next: data => {

        this.marcas = data;

        this.marcaOptions = data.map(m => ({
          label: m.nombre,
          value: m.idMarca
        }));

        if (this.modoEdicion && this.datosPrenda) {
          this.form.patchValue({
            marcaId: this.datosPrenda.marcaId
          });
        }

      },

      error: error => console.error(error)

    });

  }

  onCategoriaChange(value: number | null): void {

    this.form.get('categoriaId')?.setValue(value);

  }

  onMarcaChange(value: number | null): void {

    this.form.get('marcaId')?.setValue(value);

  }

  animAgregar = false;
  animEliminar = false;

  agregarColor(): void {
    this.colores.push('');

    this.animAgregar = true;

    setTimeout(() => {
      this.animAgregar = false;
    }, 180);
  }

  eliminarColor(index: number): void {
    this.colores.splice(index, 1);

    this.animEliminar = true;

    setTimeout(() => {
      this.animEliminar = false;
    }, 180);
  }

  eliminarImagen(): void {
    this.form.patchValue({
      imagenUrl: ''
    });
  }

  limpiarFormulario(): void {
    this.submitted = false;
    this.colores = [];
    this.form.reset({
      nombre: '',
      material: '',
      descripcion: '',
      imagenUrl: '',
      categoriaId: null,
      marcaId: null
    });
  }

  cancelar(): void {
    this.cerrarModal();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.submitted = false;

      setTimeout(() => {
        this.submitted = true;
        this.form.markAllAsTouched();
      });

      return;
    }

    this.submitted = true;

    let imagenUrl =
      this.form.value.imagenUrl?.trim() ?? '';

    if (
      imagenUrl &&
      !this.esUrlValida(imagenUrl)
    ) {

      imagenUrl = '';

      this.form.patchValue({
        imagenUrl: ''
      });

    }

    if (
      this.modoEdicion &&
      this.idPrenda
    ) {

      if (!this.huboCambios()) {

        this.cerrarModal(false);

        return;

      }

    }

    this.loading = true;

    if (
      this.modoEdicion &&
      this.idPrenda
    ) {

      const dto: PrendaUpdateDTO = {

        nombre:
        this.form.value.nombre,

        material:
        this.form.value.material,

        descripcion:
        this.form.value.descripcion,

        imagenUrl:
        imagenUrl,

        categoriaId:
        this.form.value.categoriaId,

        marcaId:
        this.form.value.marcaId,

        colores:
          this.colores
            .filter(
              c => c.trim() !== ''
            )
            .map(
              c => c.trim()
            )

      };

      this.prendaService
        .actualizarPrenda(
          this.idPrenda,
          dto
        )
        .subscribe({

          next: () => {

            this.loading = false;

            this.saved.emit();

            this.limpiarFormulario();

            this.cerrarModal();

          },

          error: error => {

            console.error(error);

            this.loading = false;

          }

        });

    } else {

      const dto: PrendaRegistroDTO = {

        nombre:
        this.form.value.nombre,

        material:
        this.form.value.material,

        descripcion:
        this.form.value.descripcion,

        imagenUrl:
        imagenUrl,

        categoriaId:
        this.form.value.categoriaId,

        marcaId:
        this.form.value.marcaId,

        colores:
          this.colores
            .filter(
              c => c.trim() !== ''
            )
            .map(
              c => c.trim()
            )

      };

      this.prendaService
        .registrarPrenda(dto)
        .subscribe({

          next: () => {

            this.loading = false;

            this.saved.emit();

            this.limpiarFormulario();

            this.cerrarModal();

          },

          error: error => {

            console.error(error);

            this.loading = false;

          }

        });

    }

  }

  cerrarModal(limpiar = true): void {

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

      const parsed =
        new URL(url);

      return (
        parsed.protocol === 'http:' ||
        parsed.protocol === 'https:'
      );

    } catch {

      return false;

    }

  }

  trackByIndex(index: number): number {
    return index;
  }

  protected readonly Math = Math;
}
