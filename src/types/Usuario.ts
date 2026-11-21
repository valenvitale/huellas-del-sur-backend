export type RolUsuario = "adoptante" | "refugio" | "administrador";

export interface Usuario{
    id: string;
    nombre: string;
    telefono: string;
    email: string;
    rol: RolUsuario;
    refugioId?: string;
}