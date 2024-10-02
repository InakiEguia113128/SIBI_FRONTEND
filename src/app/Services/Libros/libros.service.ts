import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Libro, LibroModificar } from 'src/app/Models/Libros/i-libro';
import { ObtenerCatalogo } from 'src/app/Models/Libros/i-obtener-catalogo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {

  
  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });
  
  urlbase = environment.baseApiUrl;

  PostRegistrarLibro(l:Libro) : Observable<any>{
    return this.http.post(this.urlbase + "Libros/registrar-libro", l, { headers : this.headers });
  }

  GetGeneros() : Observable<any>{
    return this.http.get(this.urlbase+"Libros/generos-libro", { headers : this.headers });
  }

  GetCatalogo(f:ObtenerCatalogo) : Observable<any>{
    return this.http.post(this.urlbase+"Libros/obtener-catalogo", f, { headers : this.headers });
  }

  EliminarLibroCatalogo(id:string) : Observable<any>{
    return this.http.delete(this.urlbase+`Libros/eliminar-libro/${id}`, { headers : this.headers });
  }

  ObtenerLibro(id:string) : Observable<any>{
    return this.http.get(this.urlbase+`Libros/obtener-libro/${id}`, { headers : this.headers });
  }

  ObtenerLibroISBN(isbn:string) : Observable<any>{
    return this.http.get(this.urlbase+`Libros/obtener-libro-isbn/${isbn}`, { headers : this.headers });
  }

  ModificarLibro(id:string, l:LibroModificar) : Observable<any>{
    return this.http.put(this.urlbase+`Libros/actualizar-libro/${id}`, l,{ headers : this.headers });
  }
}