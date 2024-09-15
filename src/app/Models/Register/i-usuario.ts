export interface Usuario{
    email: string;
    nombre: string ;
    apellido: string ;
    legajo: string ;
    contrasenia: string;
}

export interface UsuarioDTO{
    email: string;
    nombre: string ;
    apellido: string ;
    legajo: string ;
    contraseniaActual: string;
    contraseniaNuevo: string;
}