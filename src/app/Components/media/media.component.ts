import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AlquilerService } from 'src/app/Services/Alquileres/alquiler.service';
import { LibrosService } from 'src/app/Services/Libros/libros.service';
import { SociosService } from 'src/app/Services/Socios/socios.service';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {

  public formularioAltaPedido: FormGroup;
  public detalleAlquiler : any = [];
  public usuario : any = {};
  public socio : any = {};
  total: number = 0;
  alquilerCreado: boolean = false; 
  paymentUrl: string | null = null;

  constructor(
    public fb: FormBuilder,
    private servicioAlquileres: AlquilerService,
    private servicioLibros: LibrosService,
    private servicioSocio: SociosService,
    private servicioUsuario: UserService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.formularioAltaPedido = this.fb.group({
      montoTotal: [null, 0],
      fechaDesde: [formatDate(new Date(), 'yyyy-MM-dd', 'en'), [Validators.required]],
      fechaHasta: [formatDate(new Date(), 'yyyy-MM-dd', 'en'), [Validators.required]],
      puntosCanjeados: [0,],
      isbnLibro: [{ value: '', disabled: true }, this.validarISBN.bind(this)],
      detalleAlquilerDtos: [[]]
    }, {
      validators: [this.validarFechas.bind(this)] 
    });

    this.detectarCambiosFechas();
  }

  ngOnInit(): void {
    this.obtenerSocio();
  }


  detectarCambiosFechas(): void {
    const fechaDesdeControl = this.formularioAltaPedido.get('fechaDesde');
    const fechaHastaControl = this.formularioAltaPedido.get('fechaHasta');
    const isbnControl = this.formularioAltaPedido.get('isbnLibro');

    fechaDesdeControl?.valueChanges.subscribe(() => this.actualizarEstadoISBN());
    fechaHastaControl?.valueChanges.subscribe(() => this.actualizarEstadoISBN());
  }

  actualizarEstadoISBN(): void {
    const fechaDesde = this.formularioAltaPedido.get('fechaDesde')?.value;
    const fechaHasta = this.formularioAltaPedido.get('fechaHasta')?.value;
    const isbnControl = this.formularioAltaPedido.get('isbnLibro');

    if (fechaDesde && fechaHasta && new Date(fechaDesde) < new Date(fechaHasta)) {
      isbnControl?.enable();  
  } else {
      isbnControl?.disable(); 
  }
  }

  validarFechas(formGroup: FormGroup): ValidationErrors | null {
    const fechaDesde = formGroup.get('fechaDesde')?.value;
    const fechaHasta = formGroup.get('fechaHasta')?.value;

    if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
      return { fechasInvalidas: true }; 
    }

    return null;
  }

  agregarDetalle(): void {
    const isbnLibro = this.formularioAltaPedido.get('isbnLibro')?.value;

    const libroExistente = this.detalleAlquiler.find((detalle: { codigoIsbn: any; }) => detalle.codigoIsbn === isbnLibro);
    if (libroExistente) {
        Swal.fire('Error', 'El libro ya fue agregado.', 'error');
        return;
    }

    this.spinner.show();

    this.servicioLibros.ObtenerLibroISBN(isbnLibro).subscribe({
    next: (resp) => {
      this.spinner.hide();
      if (resp.resultado) {
        this.detalleAlquiler.push(resp.resultado); 

        this.toastr.success('Libro agregado con éxito', 'Genial!', {
          timeOut: 7000
        });

        this.formularioAltaPedido.get('fechaDesde')?.disable();
        this.formularioAltaPedido.get('fechaHasta')?.disable();

        this.formularioAltaPedido.get('isbnLibro')?.reset();
      }
    },
    error: (error) => {
      this.spinner.hide();
      Swal.fire('Error', error.error.error, 'error');
    }
  });
}

  removerDetallePedido(detalle: any): void {
    const index = this.detalleAlquiler.indexOf(detalle);

    if(this.alquilerCreado == false){
      this.detalleAlquiler.splice(index, 1);
      
      this.actualizarTotal();
      
      this.toastr.warning(detalle.titulo, 'Removiste un libro :"(', {
          timeOut: 3000
      });

      if (this.detalleAlquiler.length === 0) {
        this.formularioAltaPedido.get('fechaDesde')?.enable();
        this.formularioAltaPedido.get('fechaHasta')?.enable();
      }
    }
  }

  reset(): void {
    
  }

  validarISBN(control: AbstractControl): ValidationErrors | null {
    const isbn = control.value;
    if (!isbn) return null;
    if (isbn.length === 10) {
      return this.validarISBN10(isbn) ? null : { isbnInvalido: true };
    } else if (isbn.length === 13) {
      return this.validarISBN13(isbn) ? null : { isbnInvalido: true };
    } else {
      return { isbnInvalido: true };
    }
  }

  validarISBN13(isbn: string): boolean {
    let suma = 0;
    for (let i = 0; i < 12; i++) {
      suma += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const verificador = (10 - (suma % 10)) % 10;
    return verificador === parseInt(isbn[12], 10);
  }

  validarISBN10(isbn: string): boolean {
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      suma += (10 - i) * parseInt(isbn[i], 10);
    }
    const ultimoCaracter = isbn[9].toUpperCase();
    suma += ultimoCaracter === 'X' ? 10 : parseInt(ultimoCaracter, 10);
    return suma % 11 === 0;
  }

  obtenerUsuario() :any{
    this.spinner.show();
  }

  obtenerSocio() :any{
    this.spinner.show();

    this.servicioSocio.obtenerSocio(this.servicioUsuario.getUserIdFromLocalStorage()).subscribe({
      next: (resp) => 
      {
        this.spinner.hide();
        this.socio = resp.resultado;
        if (!this.socio.activo) {
          this.formularioAltaPedido.get('puntosCanjeados')?.disable();
          this.toastr.warning('Tu cuenta de socio está inactiva. No puedes acceder a descuentos ni beneficios.', 'Socio inactivo', {
            timeOut: 7000
          });
        } else if (this.socio.puntosAcumulados && this.socio.puntosAcumulados > 0) {
          this.formularioAltaPedido.get('puntosCanjeados')?.enable();
          this.toastr.success('Tienes puntos acumulados disponibles para canjear!', 'Eres socio!', {
            timeOut: 7000
          });
        } else {
          this.formularioAltaPedido.get('puntosCanjeados')?.disable();
          this.toastr.info('No tienes puntos acumulados actualmente. Al realizar alquileres, los puntos se acumularán.', 'Puntos no disponibles', {
            timeOut: 7000
          });
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.formularioAltaPedido.get('puntosCanjeados')?.disable();
        this.toastr.warning('No estás registrado como socio. No puedes acceder a descuentos ni beneficios.', '="(', {
          timeOut: 7000
        });
      }
    });
  }

  calcularSubtotal(detalle: any): number {
    const fechaDesde = new Date(this.formularioAltaPedido.get('fechaDesde')?.value);
    const fechaHasta = new Date(this.formularioAltaPedido.get('fechaHasta')?.value);
    const cantidadDias = (fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 3600 * 24);

    const subtotal = cantidadDias * detalle.precioAlquiler;
    detalle.subtotal = subtotal;

    this.actualizarTotal();

    return subtotal;
  }

  actualizarTotal(): void {
    this.total = this.detalleAlquiler.reduce((acc: any, detalle: { subtotal: any; }) => {
        return acc + (detalle.subtotal || 0); 
    }, 0);
}

crearAlquiler(): void {
  this.spinner.show();
  
  if (this.detalleAlquiler.length === 0) {
    this.spinner.hide();
    Swal.fire('CUIDADO', 'Debes agregar al menos un libro al alquiler.', 'warning');
    return;
  }

  const fechaDesde = this.formularioAltaPedido.get('fechaDesde')?.value;
  const fechaHasta = this.formularioAltaPedido.get('fechaHasta')?.value;

  if (!fechaDesde || !fechaHasta) {
    this.spinner.hide();
    Swal.fire('Error', 'Las fechas de inicio y fin son obligatorias.', 'error');
    return;
  }
  const alquilerData = {
    idSocio: this.socio.id || this.servicioUsuario.getUserIdFromLocalStorage(),
    fechaDesde: fechaDesde,
    fechaHasta: fechaHasta,
    montoTotal: this.total,
    puntosCanjeados: this.formularioAltaPedido.get('puntosCanjeados')?.value || 0,
    detalleAlquiler: this.detalleAlquiler.map((detalle: { idLibro: any; precioAlquiler: any; subtotal:any }) => ({
      idLibro: detalle.idLibro,
      precioAlquiler: detalle.precioAlquiler,
      subtotalDetalle: detalle.subtotal
    }))
  };

  //Lógica de Mercado Pago y alquiler
  this.servicioAlquileres.PostCrearPreferencia(alquilerData).subscribe({
    next: (respuesta) => {
            this.paymentUrl = respuesta.resultado.init_point;
            this.servicioAlquileres.PostRegistrarAlquiler(alquilerData).subscribe({
              next: (resp) => {
                this.spinner.hide();
                console.log(this.paymentUrl);
                Swal.fire({
                  icon: 'success',
                  title: 'Perfecto...',
                  text: 'Se registró su alquiler con éxito, Ahora puedes completar el pago.',
                }).then(() => {
                  const isbnControl = this.formularioAltaPedido.get('isbnLibro');
                  isbnControl?.disable(); 
                  this.alquilerCreado = true;
                });
              },
              error: (error) => {
                this.spinner.hide();
                Swal.fire('Error', error.error.error, 'error');
              }
            });
          },
    error: (error) => {
      this.spinner.hide();
      Swal.fire('Error', 'Hubo un problema al crear la preferencia.', 'error');
    }
  });
  }
}