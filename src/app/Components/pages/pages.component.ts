import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SociosService } from 'src/app/Services/Socios/socios.service';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {

  form: FormGroup;
  tiposDocumento : any = [];
  tiposSexo : any = [];
  esSocioRegistrado : boolean = false;
  puntosDisponibles : number = 0;
  esSocioActivo : boolean = false;

  constructor(
    private fb: FormBuilder, 
    private servicioSocio: SociosService, 
    private servicioUsuario:UserService, 
    private spinner:NgxSpinnerService,
    private toastr: ToastrService) {
    this.form = this.fb.group({
      fechaNacimiento: ['', Validators.required],
      numeroTelefono: ['', [Validators.required, Validators.minLength(10)]],
      calle: ['', Validators.required],
      altura: [null, Validators.required],
      idSexo: ['', Validators.required],
      idTipoDocumento: ['', Validators.required],
      nroDocumento: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      activo: [false]
    });
  }

  ngOnInit(): void {
    this.obtenerTiposDocumento();
    this.obtenerTiposSexo();
    this.obtenerSocio();
    this.form.get('activo')?.disable(); 
  }

  crearSocio(): void {
    if (this.form.valid) {
      this.spinner.show();
      const socioData = { ...this.form.value };
      socioData.numeroTelefono = Number(socioData.numeroTelefono);
      socioData.nroDocumento = Number(socioData.nroDocumento);
      
      let idUsuario = this.servicioUsuario.getUserIdFromLocalStorage();
      this.servicioSocio.registrarSocio(socioData, idUsuario).subscribe({
        next: () => {
          this.form.patchValue({activo: true});
          this.esSocioRegistrado = true;
          this.esSocioActivo = true;
          this.spinner.hide();
          this.servicioUsuario.agregarRolUsuarioSocioActivo();
          Swal.fire('Perfecto...', 'Socio registrado correctamente', 'success');
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire('Error', 'No se pudo registrar el socio', 'error');
        }
      });
    }
  }

  obtenerTiposDocumento(){
    this.spinner.show();
    this.servicioSocio.tiposDocumento().subscribe(x=>{
      this.spinner.hide();
      this.tiposDocumento = x.resultado;
    });
  }

  obtenerTiposSexo(){
    this.spinner.show();
    this.servicioSocio.tiposSexo().subscribe(x=>{
      this.spinner.hide();
      this.tiposSexo = x.resultado;
    });
  }

  obtenerSocio(){
    this.spinner.show();

    const socioData = { ...this.form.value };
    socioData.numeroTelefono = Number(socioData.numeroTelefono);
    socioData.nroDocumento = Number(socioData.nroDocumento);

    let idUsuario = this.servicioUsuario.getUserIdFromLocalStorage();

    this.servicioSocio.obtenerSocio(idUsuario).subscribe({
      next: (response) => {
        if (response.ok && response.resultado) {
          this.form.patchValue({
            fechaNacimiento: response.resultado.fechaNacimiento,
            numeroTelefono: response.resultado.numeroTelefono || '',
            calle: response.resultado.calle || '',
            altura: response.resultado.altura || '',
            idSexo: response.resultado.idSexo || '',
            idTipoDocumento: response.resultado.idTipoDocumento || '',
            nroDocumento: response.resultado.nroDocumento || '',
            activo: response.resultado.activo || false
          });
        }
        this.puntosDisponibles = response.resultado.puntosAcumulados;
        this.esSocioRegistrado = true;
        this.esSocioActivo = response.resultado.activo;
        this.spinner.hide();
      },
      error: (error) => {
        this.toastr.success('Accederas a descuentos exclusivos', '¡Regístrate como socio!',{
          timeOut: 7000
        });
        this.esSocioRegistrado = false;
        this.spinner.hide();
      }
    });
  }

  desactivarSocio(){
    Swal.fire({
      title: '¿Deseas desactivar su asociación?',
      text: 'Perderá beneficios para proximos alquileres',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.servicioSocio.desactivarSocio(this.servicioUsuario.getUserIdFromLocalStorage()).subscribe({
            next: () => {
              this.form.patchValue({activo: false});
              this.esSocioRegistrado = true;
              this.esSocioActivo = false;
              this.spinner.hide();
              Swal.fire('Perfecto...', 'Socio desactivado correctamente', 'success');
            },
            error: (error) => {
              this.spinner.hide();
              Swal.fire('Error', 'No se pudo desactivar el socio', 'error');
            }
        });   
      }
    });
  }

  activarSocio(){
    this.spinner.show();   
    this.servicioSocio.activarSocio(this.servicioUsuario.getUserIdFromLocalStorage()).subscribe({
        next: () => {
          this.form.patchValue({activo: true});
          this.esSocioRegistrado = true;
          this.esSocioActivo = true;
          this.spinner.hide();
          Swal.fire('Perfecto...', 'Socio activado correctamente', 'success');
          this.obtenerSocio();
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire('Error', 'No se pudo activar el socio', 'error');
        }
    });   
  }

  modificarSocio() {
    Swal.fire({
      title: '¿Seguro que deseas modificar tus datos de socio?',
      text: 'No se podrán modificar de nuevo hasta el próximo mes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
  
        if (this.form.valid) {
          const socioData = { ...this.form.value };
          socioData.numeroTelefono = Number(socioData.numeroTelefono);
          socioData.nroDocumento = Number(socioData.nroDocumento);
  
          this.servicioSocio.modificarSocio(socioData, this.servicioUsuario.getUserIdFromLocalStorage()).subscribe({
            next: () => {
              Swal.fire('Perfecto...', 'Información modificada correctamente', 'success');
              this.spinner.hide();
            },
            error: (error) => {
              Swal.fire('Error', error.error.error, 'error');
              this.spinner.hide();
            }
          });
        } else {
          this.spinner.hide();
          Swal.fire('Error', 'Formulario inválido', 'error');
        }
      }
    });
  }  
}
