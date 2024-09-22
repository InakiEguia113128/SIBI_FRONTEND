import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ObtenerCatalogo } from 'src/app/Models/Libros/i-obtener-catalogo';
import { LibrosService } from 'src/app/Services/Libros/libros.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent {
  libros: any = [];
  generos: any = [];
  librosPorPagina: number = 9; // Número de libros por página
  paginaActual: number = 1;
  mostrarFiltros: boolean = false; // Controla la visibilidad del formulario de filtros
  filtros: any = { // Define los filtros iniciales
    titulo: null,
    autos: null,
    editorial: null,
    fechaPublicacionDesde: null,
    fechaPublicacionHasta: null,
    idGenero: null,
    nGenero: null,
    precioDesde: null,
    precioHasta: null,
    isbn: null,
  };

  constructor(private fb: FormBuilder, private servicio: LibrosService, private spinner: NgxSpinnerService) {
    const prefijo = "data:image/jpeg;base64,";

    this.servicio.GetGeneros().subscribe({
      next: (resp) => {
        this.generos = resp.resultado;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al recuperar los géneros...',
          text: 'Algo salió mal',
        });
      }
    });

    this.cargarLibros(prefijo);
  }

  cargarLibros(prefijo: string) {
    this.spinner.show();
    this.servicio.GetCatalogo({ ...this.filtros, devolver: this.librosPorPagina, salta: (this.paginaActual - 1) * this.librosPorPagina }).subscribe({
      next: (resp) => {
        this.spinner.hide();
        this.libros = resp.resultado.map((libro: any) => ({
          ...libro,
          imagenPortadaBase64: `${prefijo}${libro.imagenPortadaBase64}`
        }));
      },
      error: (error) => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error al recuperar los libros...',
          text: 'Algo salió mal',
        });
      }
    });
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.cargarLibros("data:image/jpeg;base64,");
  }

  obtenerTotalPaginas(totalLibros: number): number {
    return Math.ceil(totalLibros / this.librosPorPagina);
  }

  getGeneroDescripcion(libro: any): string {
    const genero = this.generos.find((g: any) => g.idGenero === libro.idGenero);
    
    if (genero && genero.descripcion === 'Otro') {
      return libro.nGenero || 'Sin especificar';
    }
    
    return genero ? genero.descripcion : 'Desconocido';
  }

  aplicarFiltros() {
    this.paginaActual = 1; 
    this.cargarLibros("data:image/jpeg;base64,");
    this.cerrarFiltro();
  }

  abrirFiltro() {
    this.mostrarFiltros = true;
  }

  cerrarFiltro() {
    this.mostrarFiltros = false;
  }

  limpiarFiltros() {
    this.filtros = {
      titulo: null,
      autos: null,
      editorial: null,
      fechaPublicacionDesde: null,
      fechaPublicacionHasta: null,
      idGenero: null,
      nGenero: null,
      precioDesde: null,
      precioHasta: null,
      isbn: null,
      devolver: this.librosPorPagina,
      salta: 0
    };
    this.cargarLibros("data:image/jpeg;base64,");
  } 
}