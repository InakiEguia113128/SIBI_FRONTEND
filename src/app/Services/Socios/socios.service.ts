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

  modificarSocio(data: any, idUsuario:any): Observable<any> {
    return this.http.put(`${this.urlbase}Socios/modificar-socio/${idUsuario}`, data, { headers : this.headers});
  }

  tiposSexo(): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/tipos-sexo`, { headers : this.headers});
  }

  tiposDocumento(): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/tipos-documento`, { headers : this.headers});
  }

  obtenerSocio(idUsuario:string): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/obtener-socio/${idUsuario}`, { headers : this.headers});
  }

  activarSocio(idUsuario:string): Observable<any> {
    return this.http.put(`${this.urlbase}Socios/reactivar-socio/${idUsuario}`, null, { headers : this.headers});
  }

  desactivarSocio(idUsuario:string): Observable<any> {
    return this.http.put(`${this.urlbase}Socios/desactivar-socio/${idUsuario}`, null, { headers : this.headers});
  }

  obtenerRanking(): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/obtener-ranking`, { headers : this.headers});
  }

  obtenerSocioEnRanking(idSocio:string): Observable<any> {
    return this.http.get(`${this.urlbase}Socios/obtener-ranking/${idSocio}`, { headers : this.headers});
  }
}
