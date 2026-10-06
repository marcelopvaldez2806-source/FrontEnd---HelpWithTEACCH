export interface CambiarEstadoItemRequest {
  id: number;
  estado: string;
}

export interface CambiarEstadoRequest {
  items: CambiarEstadoItemRequest[];
}
