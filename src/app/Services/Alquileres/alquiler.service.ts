import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlquilerService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });
  
  urlbase = environment.baseApiUrl;

  PostRegistrarAlquiler(a:any) : Observable<any>{
    return this.http.post(this.urlbase + "Alquileres/registrar-alquiler", a, { headers : this.headers });
  }

  PostCrearPreferencia(a:any) : Observable<any>{
    return this.http.post(this.urlbase + "MercadoPago/crear-preferencia", a, { headers : this.headers });
  }

  ObtenerAlquileres(a:any) : Observable<any>{
    return this.http.post(this.urlbase + "Alquileres/obtener-alquileres", a, { headers : this.headers });
  }

  ObtenerAlquiler(id:any) : Observable<any>{
    return this.http.get(this.urlbase + `Alquileres/obtener-alquiler/${id}`, { headers : this.headers });
  }

  ObtenerEstadosAlquiler() : Observable<any>{
    return this.http.get(this.urlbase + `Alquileres/obtener-estados-alquiler`, { headers : this.headers });
  }

  CambiarEstadoAlquiler(p:any) : Observable<any>{
    return this.http.put(this.urlbase + `Alquileres/cambiar-estado`, p, { headers : this.headers });
  }
}
