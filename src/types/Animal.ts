export type EstadoAnimal =
  | "disponible"
  | "en_proceso"
  | "adoptado";

export type SexoAnimal = "macho" | "hembra";

export interface Animal {
  id: string;
  refugioId: string;
  nombre: string;
  especie: string;
  raza?: string;
  edad: number;
  sexo: SexoAnimal;
  tamanio: "pequeno" | "mediano" | "grande";
  descripcion: string;
  imagenUrl?: string;
  estado: EstadoAnimal;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface AnimalCatalogo extends Animal {
    refugio: {
        id: string;
        nombre: string;
        localidad: string;
    } | null;
}
