import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ObtenerCatalogo } from 'src/app/Models/Libros/i-obtener-catalogo';
import { LibrosService } from 'src/app/Services/Libros/libros.service';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent {
  eliminarVisible : boolean = false;
  ususario: any = {};
  libros: any = [];
  generos: any = [];
  librosPorPagina: number = 9; 
  paginaActual: number = 1;
  mostrarFiltros: boolean = false; 
  filtros: any = {
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

  constructor(private fb: FormBuilder, private servicio: LibrosService, private spinner: NgxSpinnerService, private servicioUsuario:UserService) {
    const prefijo = "data:image/jpeg;base64,";

    this.obtenerUsuario();

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
    this.mostrarFiltros = false;
  } 

  obtenerUsuario() {
    this.ususario = this.servicioUsuario.obtenerRolesUsuarioActivo()
    this.eliminarVisible = this.ususario.roles.some((role: string) => role === 'Empleado')
  }

  removerDelCatalogo(idLibro: string, titulo: string) {
    debugger
    Swal.fire({
      title: `¿Deseas eliminar del catálogo el libro ${titulo}?`,
      text: 'El libro no sera visible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      this.spinner.show();
      this.servicio.EliminarLibroCatalogo(idLibro).subscribe({
        next: (resp) => {
          this.cargarLibros("data:image/jpeg;base64,");
          
          this.spinner.hide();

          Swal.fire({
            icon: 'success',
            title: 'Perfecto...',
            text: 'Se elimino el libro con éxito',
          }).then(() => { });
        },
        error: (error) =>{
          this.spinner.hide();

          Swal.fire({
            icon: 'error',
            title: 'Cuidado...',
            text: error.error.error,
          });
        }
      });
    });
  }
}