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
}
