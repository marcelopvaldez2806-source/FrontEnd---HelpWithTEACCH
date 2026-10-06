export interface CambiarEstadoRequest {
  items: {
    id: number;
    estado: string;
  }[];
}
