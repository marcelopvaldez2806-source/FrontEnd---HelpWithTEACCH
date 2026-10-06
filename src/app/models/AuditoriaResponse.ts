export interface AuditoriaResponse {
  creadoPor: string;
  fechaCreacion: string;
  modificadoPor: string | null;
  fechaModificacion: string | null;
  versionLock: number;
}
