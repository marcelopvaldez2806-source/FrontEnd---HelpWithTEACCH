export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  email: string;
  idRol: number;
  password: string;
  confirmarPassword: string;
}

export interface UsuarioLogin {
  idUsuario: number;
  idRol: number;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
  creadoPor?: string;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
  versionLock?: number;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: UsuarioLogin;
  rol: string;

  // Compatibilidad con el código actual
  idUsuario: number;
  nombres: string;
  apellidos: string;
  email: string;
}