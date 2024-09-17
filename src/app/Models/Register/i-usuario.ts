export interface Usuario{
    email: string;
    nombre: string ;
    apellido: string ;
    contrasenia: string;
}

export interface UsuarioDTO{
legajo: any;
    email: string;
    nombre: string ;
    apellido: string ;
    contraseniaActual: string;
    contraseniaNuevo: string;
}

export interface ModicarUsuario {
    idUsuario: string;
    nombre: string;
    apellido: string;
    email: string;
    contrasenia: string;
  }