import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });
  
  urlbase = environment.baseApiUrl;

  ReporteLibrosGenero(filtros:any) : Observable<any>{
    return this.http.put(this.urlbase + "Reportes/libros-genero", filtros, { headers : this.headers });
  }

  ListadoAlquileresVencidos(filtros:any) : Observable<any>{
    return this.http.put(this.urlbase + "Reportes/alquileres-vencidos", filtros, { headers : this.headers });
  }
}
