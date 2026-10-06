import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  LoginRequest,
  RegistroRequest
} from '../../models/auth.models';

import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    NgIf
  ],

  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private fb = inject(FormBuilder);

  private authService =
    inject(AuthService);

  private router =
    inject(Router);


  loginForm: FormGroup;

  registerForm: FormGroup;


  modoRegistro = false;


  errorLogin = '';

  successLogin = '';


  hidePassword = true;

  hideRegisterPassword = true;


  animandoLogin = false;


  constructor() {

    // =====================================================
    // LOGIN
    // =====================================================

    this.loginForm =
      this.fb.group({

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ]
        ]

      });


    // =====================================================
    // REGISTRO
    // =====================================================

    this.registerForm =
      this.fb.group({

        nombres: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100)
          ]
        ],

        apellidos: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
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

        // 3 = Padre / Madre
        idRol: [
          3,
          [
            Validators.required
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

        confirmarPassword: [
          '',
          [
            Validators.required
          ]
        ]

      });

  }


  // =====================================================
  // PASSWORD LOGIN
  // =====================================================

  togglePassword(): void {

    this.hidePassword =
      !this.hidePassword;

  }


  // =====================================================
  // PASSWORD REGISTRO
  // =====================================================

  toggleRegisterPassword(): void {

    this.hideRegisterPassword =
      !this.hideRegisterPassword;

  }


  // =====================================================
  // CAMBIAR MODO
  // =====================================================

  cambiarModo(): void {

    this.modoRegistro =
      !this.modoRegistro;

    this.errorLogin = '';

    this.successLogin = '';


    this.loginForm.reset();


    this.registerForm.reset({
      idRol: 3
    });

  }


  // =====================================================
  // LOGIN
  // =====================================================

  login(): void {

    if (
      this.loginForm.invalid
    ) {

      this.loginForm.markAllAsTouched();

      this.errorLogin =
        'Ingresa un correo y una contraseña válidos.';

      return;

    }


    this.errorLogin = '';

    this.successLogin = '';

    this.animandoLogin = true;


    const request: LoginRequest = {

      email:
        this.loginForm.value.email,

      password:
        this.loginForm.value.password

    };


    this.authService
      .login(request)
      .subscribe({

        next: (response) => {

          console.log(
            'Login exitoso:',
            response
          );


          this.successLogin =
            this.successLogin =
  `Bienvenido, ${response.usuario.nombres}`;


          setTimeout(() => {

            this.router.navigate([
              '/home'
            ]);

          }, 1200);

        },


        error: (err) => {

          console.error(
            'Error de login:',
            err
          );


          this.animandoLogin = false;


          if (
            err?.status === 401
          ) {

            this.errorLogin =
              'Correo o contraseña incorrectos.';

          }

          else if (
            err?.status === 400
          ) {

            this.errorLogin =
              'Los datos ingresados no son válidos.';

          }

          else {

            this.errorLogin =
              'No se pudo conectar con el servidor.';

          }

        }

      });

  }


  // =====================================================
  // REGISTRO
  // =====================================================

  register(): void {

    this.errorLogin = '';

    this.successLogin = '';


    // Validar formulario

    if (
      this.registerForm.invalid
    ) {

      this.registerForm.markAllAsTouched();

      this.errorLogin =
        'Completa correctamente todos los campos.';

      return;

    }


    // Obtener contraseñas

    const password =
      this.registerForm.value.password;

    const confirmarPassword =
      this.registerForm.value.confirmarPassword;


    // Validar contraseñas

    if (
      password !== confirmarPassword
    ) {

      this.errorLogin =
        'Las contraseñas no coinciden.';

      return;

    }


    // Crear request

    const request: RegistroRequest = {

      nombres:
        this.registerForm.value.nombres.trim(),

      apellidos:
        this.registerForm.value.apellidos.trim(),

      email:
        this.registerForm.value.email.trim(),

      idRol:
        this.registerForm.value.idRol,

      password:
        password,

      confirmarPassword:
        confirmarPassword

    };


    console.log(
      'Registro enviado:',
      request
    );


    // Enviar al backend

    this.authService
      .registrar(request)
      .subscribe({

        next: (response) => {

          console.log(
            'Registro exitoso:',
            response
          );


          this.successLogin =
            'Cuenta creada correctamente.';


          this.registerForm.reset({
            idRol: 3
          });


          setTimeout(() => {

            this.modoRegistro = false;

            this.successLogin = '';

          }, 1500);

        },


        error: (err) => {

          console.error(
            'Error de registro:',
            err
          );


          if (
            err?.status === 409
          ) {

            this.errorLogin =
              'El correo electrónico ya está registrado.';

          }

          else if (
            err?.status === 400
          ) {

            this.errorLogin =
              'Los datos ingresados no son válidos.';

          }

          else {

            this.errorLogin =
              'No se pudo crear la cuenta.';

          }

        }

      });

  }

}