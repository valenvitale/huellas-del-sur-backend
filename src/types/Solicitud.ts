export type EstadoSolicitud = "aprobada" | "pendiente" | "rechazada"

export interface Solicitud{
    id: string;
    usuarioId: string;
    animalId: string;
    estado: EstadoSolicitud;
}