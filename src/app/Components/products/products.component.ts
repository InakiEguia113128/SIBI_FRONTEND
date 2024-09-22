import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Libro } from 'src/app/Models/Libros/i-libro';
import { LibrosService } from 'src/app/Services/Libros/libros.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  form!: FormGroup;
  imagenBase64:string = "";
  generos: any = [];
  mostrarOtroGenero: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private fb: FormBuilder, private servicio:LibrosService, private spinner: NgxSpinnerService) { }
  
  ngOnInit(): void {
    this.servicio.GetGeneros().subscribe({
      next: (resp) => {
        this.generos = resp.resultado;
      },
      error : (error) =>{
        Swal.fire({
          icon: 'error',
          title: 'Error al recuperar los generos...',
          text: 'Algo salio mal',
        });
      }
    });

    this.form = this.fb.group({
      codigoIsbn: ['', [Validators.required, this.validarISBN]],
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

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.form.patchValue({
          imagenPortadaBase64: base64String
        });
      };
      reader.readAsDataURL(file);
    }
    this.form.get('imagenPortadaBase64')?.updateValueAndValidity();
  }

  registrarLibro() : void {
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      console.log(`${key} - Valid: ${control.valid}, Invalid: ${control.invalid}, Errors: ${JSON.stringify(control.errors)}`);
    });
    
    if (this.form.valid) {
      var libro: Libro = {
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
        activo: true,
        precioAlquiler: this.form.get('precioAlquiler')?.value
      };
      this.spinner.show();

      this.servicio.PostRegistrarLibro(libro).subscribe({
        next: (resp) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'success',
            title: 'Perfecto...',
            text: 'Se registró su libro con éxito',
          }).then(() => { });

          this.resetForm();
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

  resetForm(): void {
    this.form.reset();
    this.imagenBase64 = ""; 
    this.mostrarOtroGenero = false; 
    this.fileInput.nativeElement.value = '';
  }

  // Función de validación personalizada para ISBN
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

  // Validación para ISBN-10
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

  // Validación para ISBN-13
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
}