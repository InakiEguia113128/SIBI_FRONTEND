import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { login } from 'src/app/Models/Login/i-login';
import { ModicarUsuario, Usuario } from 'src/app/Models/Register/i-usuario';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  headers = new HttpHeaders({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });
  
  constructor(private http: HttpClient) { }

  urlbase = environment.baseApiUrl;
  jwtHelper = new JwtHelperService();
  decodedToken: any;

  getUserIdFromLocalStorage() : string {
    let json = localStorage.getItem('usuario');
    let object = json != null ? JSON.parse(json) : null;
    return object.idUsuario;
  }

  PostRegistro(u:Usuario) : Observable<any>{
    return this.http.post(this.urlbase + "Usuarios/registrar-usuario",u)
  }

  PostLogin(u:login) : Observable<any>{
    return this.http.post(this.urlbase+"Usuarios/iniciar-secion", u)
      .pipe(
        map((response: any) => {
          const user = response;
          if (user) {
            localStorage.setItem('token', user.resultado.token);
            localStorage.setItem('usuario', JSON.stringify(user.resultado.usuario));
            this.decodedToken = this.jwtHelper.decodeToken(user.resultado.token);
          }
        })
      );
  }

  GetUsuarioById(id:string) : Observable<any>{
    return this.http.get(this.urlbase + "Usuarios/obtener-usuario/"+id, { headers: this.headers });
  }

  PutUsuario(u:ModicarUsuario) : Observable<any>{
    return this.http.put(this.urlbase+"Usuarios/modificar-usuario", u, { headers: this.headers })
  }

  desloguearUsuario() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.decodedToken = null;
  }

  obtenerRolesUsuarioActivo(): any {
    let json = localStorage.getItem('usuario');
    let usuario = json != null ? JSON.parse(json) : null;

    return usuario;
  }

  agregarRolUsuarioSocioActivo(): any {
    let json = localStorage.getItem('usuario');
    let usuario = json != null ? JSON.parse(json) : null;

    if (usuario && usuario.roles) {
      if (!usuario.roles.includes("Socio registrado")) {
          usuario.roles.push("Socio registrado");        
          localStorage.setItem('usuario', JSON.stringify(usuario));
      }
    }
    return usuario;
  }
}
