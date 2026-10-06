import { AsignarNinoItemRequest } from './AsignarNinoItemRequest';

export interface AsignarNinoRequest {
  idUsuario: number;
  items: AsignarNinoItemRequest[];
}