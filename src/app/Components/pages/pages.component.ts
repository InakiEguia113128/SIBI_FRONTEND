import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
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

  constructor(private fb: FormBuilder, private servicioSocio: SociosService, private servicioUsuario:UserService, private spinner:NgxSpinnerService) {
    this.form = this.fb.group({
      fechaNacimiento: ['', Validators.required],
      numeroTelefono: ['', [Validators.required, Validators.minLength(10)]],
      calle: ['', Validators.required],
      altura: [null, Validators.required],
      idSexo: ['', Validators.required],
      idTipoDocumento: ['', Validators.required],
      nroDocumento: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
    });
  }

  ngOnInit(): void {
    this.obtenerTiposDocumento();
    this.obtenerTiposSexo();
  }

  crearSocio(): void {
    if (this.form.valid) {
      const socioData = { ...this.form.value };
      socioData.numeroTelefono = Number(socioData.numeroTelefono);
      socioData.nroDocumento = Number(socioData.nroDocumento);

      let idUsuario = this.servicioUsuario.getUserIdFromLocalStorage();
      this.servicioSocio.registrarSocio(socioData, idUsuario).subscribe({
        next: () => {
          Swal.fire('ÉxiPerfecto...', 'Socio registrado correctamente', 'success');
        },
        error: (error) => {
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
}
