import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { login } from 'src/app/Models/Login/i-login';
import { Usuario } from 'src/app/Models/Register/i-usuario';
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

  PostRegistro(u:Usuario) : Observable<any>{
    return this.http.post(this.urlbase + "Usuarios/registrar-usuario",u)
  }

  PostLogin(u:login) : Observable<any>{
    return this.http.post(this.urlbase+"Usuarios/iniciar-secion", u)
      .pipe(
        map((response: any) => {
          debugger
          const user = response;
          if (user) {
            localStorage.setItem('token', user.resultado);
            this.decodedToken = this.jwtHelper.decodeToken(user.resultado);
          }
        })
      );
  }
}
