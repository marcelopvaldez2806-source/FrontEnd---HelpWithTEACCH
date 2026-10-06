import {AuditoriaResponse} from './AuditoriaResponse';

export interface NinoResponse extends AuditoriaResponse {
  idNino: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  etnia: string | null;
  ictericia: boolean;
  familiarConTea: boolean;
  fotoUrl: string | null;
  estado: string;
}
