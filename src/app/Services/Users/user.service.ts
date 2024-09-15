import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/Models/Register/i-usuario';
import { environment } from 'src/environments/environment';

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

  PostRegistro(u:Usuario) : Observable<any>{
    debugger
    return this.http.post(this.urlbase + "Usuarios/registrar-usuario",u,{headers : this.headers})
  }
}
