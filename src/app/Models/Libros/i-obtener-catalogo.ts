export interface ObtenerCatalogo {
    titulo?: string | null,
    autos?: string | null,
    editorial?: string | null,
    fechaPublicacionDesde?: Date | null,
    fechaPublicacionHasta?: Date | null,
    idGenero?: string | null,
    nGenero?: string | null,
    precioDesde?: number | null,
    precioHasta?: number | null,
    isbn?: string | null,
    devolver?: number,
    salta?: number 
}
