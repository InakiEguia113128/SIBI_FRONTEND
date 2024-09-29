import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Libro, LibroModificar } from 'src/app/Models/Libros/i-libro';
import { ObtenerCatalogo } from 'src/app/Models/Libros/i-obtener-catalogo';
import { LibrosService } from 'src/app/Services/Libros/libros.service';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  eliminarVisible : boolean = false;
  ususario: any = {};
  libros: any = [];
  generos: any = [];
  librosPorPagina: number = 9; 
  paginaActual: number = 1;
  mostrarFiltros: boolean = false; 
  editarProductos: boolean = false; 
  mostrarOtroGenero:boolean = false;
  form!: FormGroup;
  libroEditar: any = {};
  selectedFileName: string = '';
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

  constructor(private fb: FormBuilder, private servicio: LibrosService, private spinner: NgxSpinnerService, private servicioUsuario:UserService, private router:Router) {
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
  
  ngOnInit(): void {
    this.form = this.fb.group({
      codigoIsbn: ['', [Validators.required, this.validarISBN.bind(this)]],
      titulo: ['', [Validators.required]],
      cantidadEjemplares: [0, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      nombreAutor: ['', [Validators.required]],
      editorial: ['', [Validators.required]],
      fechaPublicacion: ['', [Validators.required]],
      nroEdicion: [null, [Validators.minLength(1)]],
      nroVolumen: [null,[Validators.minLength(1)]],
      codUbicacion: ['', [Validators.required]],
      idGenero: ['', [Validators.required]],
      otroGenero : [''],
      precioAlquiler: ['', [Validators.required, Validators.min(1)]],
      imagenPortadaBase64: ['', [Validators.required]]
    });
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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
    this.eliminarVisible = this.ususario.roles.some((role: string) => role === 'Empleado' || role === 'Administrador')
  }

  editarProducto(id:any){
    this.spinner.show();
    this.servicio.ObtenerLibro(id).subscribe({
      next: (resp) =>{
        this.spinner.hide();
        this.libroEditar = resp.resultado;
        this.form.patchValue({
          codigoIsbn: this.libroEditar.codigoIsbn,
          titulo: this.libroEditar.titulo,
          cantidadEjemplares: this.libroEditar.cantidadEjemplares,
          descripcion: this.libroEditar.descripcion,
          nombreAutor: this.libroEditar.nombreAutor,
          editorial: this.libroEditar.editorial,
          fechaPublicacion: this.libroEditar.fechaPublicacion,
          nroEdicion: this.libroEditar.nroEdicion,
          nroVolumen: this.libroEditar.nroVolumen,
          codUbicacion: this.libroEditar.codUbicacion,
          idGenero: this.libroEditar.idGenero,
          otroGenero: this.libroEditar.nGenero,
          precioAlquiler: this.libroEditar.precioAlquiler,
          imagenPortadaBase64: this.libroEditar.imagenPortadaBase64
        });
      },
      error: (error) =>{
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error al recuperar el libro...',
          text: error.error.error,
        });
      }
    });
    this.editarProductos = true;
  }

  validarISBN(control: AbstractControl): ValidationErrors | null {
    const isbn = control.value;

    if (!isbn) {
      return null;
    }

    if (isbn.length === 10) {
      return this.validarISBN10(isbn) ? null : { isbnInvalido: true };
    } else if (isbn.length === 13) {
      return this.validarISBN13(isbn) ? null : { isbnInvalido: true };
    } else {
      return { isbnInvalido: true };
    }
  }

  validarISBN13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) {
      return false;
    }

    let suma = 0;
    for (let i = 0; i < 12; i++) {
      suma += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
    }

    const verificador = (10 - (suma % 10)) % 10;
    return verificador === parseInt(isbn[12], 10);
  }

  validarISBN10(isbn: string): boolean {
    if (!/^\d{9}[\dX]$/.test(isbn)) {
      return false;
    }

    let suma = 0;
    for (let i = 0; i < 9; i++) {
      suma += (10 - i) * parseInt(isbn[i], 10);
    }

    const ultimoCaracter = isbn[9].toUpperCase();
    suma += ultimoCaracter === 'X' ? 10 : parseInt(ultimoCaracter, 10);

    return suma % 11 === 0;
  }

  onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // Solo la parte base64
        this.form.patchValue({
          imagenPortadaBase64: base64String
        });
      };
  
      reader.readAsDataURL(file); // Convierte el archivo a base64
    }
  }

  onGeneroChange(event: any) {
    if (event.target.value === '579b1226-f092-4fb2-9eb2-4747aeace3c8') {
      this.mostrarOtroGenero = true;
      this.form.get('otroGenero')?.setValidators([Validators.required]);
    } else {
      this.mostrarOtroGenero = false;
      this.form.get('otroGenero')?.clearValidators();
      this.form.get('otroGenero')?.setValue('');
    }
    this.form.get('otroGenero')?.updateValueAndValidity();
  }

  editarLibro() : void {
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      console.log(`${key} - Valid: ${control.valid}, Invalid: ${control.invalid}, Errors: ${JSON.stringify(control.errors)}`);
    });
    
    if (this.form.valid) {
      var libro: LibroModificar = {
        codigoIsbn: this.form.get('codigoIsbn')?.value,
        titulo: this.form.get('titulo')?.value,
        cantidadEjemplares: this.form.get('cantidadEjemplares')?.value,
        descripcion: this.form.get('descripcion')?.value,
        nombreAutor: this.form.get('nombreAutor')?.value,
        editorial: this.form.get('editorial')?.value,
        fechaPublicacion: this.form.get('fechaPublicacion')?.value,
        nroEdicion: this.form.get('nroEdicion')?.value,
        nroVolumen: this.form.get('nroVolumen')?.value,
        codUbicacion: this.form.get('codUbicacion')?.value,
        idGenero: this.form.get('idGenero')?.value,
        nGenero: this.form.get('otroGenero')?.value,
        imagenPortadaBase64: this.form.get('imagenPortadaBase64')?.value,
        precioAlquiler: this.form.get('precioAlquiler')?.value
      };

      this.spinner.show();

      this.servicio.ModificarLibro(this.libroEditar.idLibro,libro).subscribe({
        next: (resp) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'success',
            title: 'Perfecto...',
            text: 'Se actualizo su libro con éxito',
          }).then(() => { 
            this.editarProductos = false;
            this.aplicarFiltros();
          });
        },
        error : (error) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Cuidado...',
            text: error.error.error,
          });
        }
      });
    } 
  }

  cancelarEdicion(){
    this.editarProductos = false;
  }

  removerDelCatalogo(idLibro: string, titulo: string) {
    Swal.fire({
      title: `¿Deseas eliminar del catálogo el libro ${titulo}?`,
      text: 'El libro no será visible',
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