export interface NinoRequest {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  etnia?: string;
  ictericia: boolean;
  familiarConTea: boolean;
  fotoUrl?: string;
}
