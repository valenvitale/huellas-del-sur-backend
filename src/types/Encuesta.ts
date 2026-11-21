export type EstadoEncuesta = "activa" | "inactiva";

export interface Encuesta{
    id: string;
    titulo: string;
    estado: EstadoEncuesta;
}