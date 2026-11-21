export type EstadoRefugio = "activo" | "inactivo";

export interface Refugio{
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    email?: string;
    descripcion: string;
    estado: EstadoRefugio;
}