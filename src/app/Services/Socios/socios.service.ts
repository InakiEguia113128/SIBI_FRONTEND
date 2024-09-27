import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SociosService {

  headers = new HttpHeaders({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });
  
  urlbase = environment.baseApiUrl;
  
  constructor(private http: HttpClient) {}

  registrarSocio(data: any, idUsuario:any): Observable<any> {
    return this.http.post(`${this.urlbase}Socios/registrar-socio/${idUsuario}`, data, { headers : this.headers});
  }

  tiposSexo(): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/tipos-sexo`, { headers : this.headers});
  }

  tiposDocumento(): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/tipos-documento`, { headers : this.headers});
  }
}
