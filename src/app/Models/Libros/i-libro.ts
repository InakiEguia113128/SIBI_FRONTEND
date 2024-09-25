export interface Libro {
    codigoIsbn: string;
    titulo: string;
    cantidadEjemplares: number;
    descripcion: string;
    nombreAutor: string;
    editorial: string;
    fechaPublicacion: string;
    nroEdicion: number | null;
    nroVolumen: number | null;
    codUbicacion: string;
    idGenero: string;
    nGenero: string | null;
    precioAlquiler: number;
    imagenPortadaBase64: string;
    activo: boolean;
  }
  
  export interface LibroModificar {
    codigoIsbn: string;
    titulo: string;
    cantidadEjemplares: number;
    descripcion: string;
    nombreAutor: string;
    editorial: string;
    fechaPublicacion: string;
    nroEdicion: number | null;
    nroVolumen: number | null;
    codUbicacion: string;
    idGenero: string;
    nGenero: string | null;
    precioAlquiler: number;
    imagenPortadaBase64: string;
  }