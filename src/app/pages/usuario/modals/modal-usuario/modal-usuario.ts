import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { NgIf } from '@angular/common';

import { UsuarioService } from '../../../../core/services/usuario.service';
import { UsuarioRequest } from '../../../../models/UsuarioRequest';

import { CustomImput } from '../../../../layout/custom-imput/custom-imput';
import { CustomSelect } from '../../../../layout/custom-select/custom-select';

interface SelectOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-modal-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    CustomImput,
    CustomSelect
  ],
  templateUrl: './modal-usuario.html',
  styleUrl: './modal-usuario.css'
})
export class ModalUsuario {

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  @Input() visible = false;

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() usuarioCreado = new EventEmitter<void>();

  closing = false;
  submitted = false;
  guardando = false;

  mostrarPassword = false;

  form: FormGroup = this.fb.group({

    nombres: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    apellidos: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]
    ],

    idRol: [
      null,
      [
        Validators.required
      ]
    ]

  });

  opcionesRol: SelectOption[] = [
    {
      label: 'Administrador',
      value: 1
    },
    {
      label: 'Docente',
      value: 2
    },
    {
      label: 'Padre o madre de familia',
      value: 3
    }
  ];

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  guardar(): void {

    this.submitted = true;

    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const request: UsuarioRequest = {
      idRol: this.form.get('idRol')?.value,
      nombres: this.form.get('nombres')?.value.trim(),
      apellidos: this.form.get('apellidos')?.value.trim(),
      email: this.form.get('email')?.value.trim(),
      password: this.form.get('password')?.value
    };

    this.usuarioService.crear(request).subscribe({

      next: (response) => {

        console.log(
          'Usuario creado correctamente:',
          response
        );

        this.guardando = false;

        this.usuarioCreado.emit();

        this.limpiarFormulario();
        this.cancelar();

      },

      error: (error) => {

        console.error(
          'Error al crear usuario:',
          error
        );

        this.guardando = false;

      }

    });

  }

  limpiarFormulario(): void {

    this.form.reset({
      nombres: '',
      apellidos: '',
      email: '',
      password: '',
      idRol: null
    });

    this.submitted = false;
    this.mostrarPassword = false;

  }

  cancelar(): void {

    this.closing = true;

    setTimeout(() => {

      this.closing = false;
      this.limpiarFormulario();

      this.cerrarModal.emit();

    }, 200);

  }

}