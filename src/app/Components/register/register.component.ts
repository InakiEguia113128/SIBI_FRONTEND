import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Usuario } from 'src/app/Models/Register/i-usuario';
import Swal from 'sweetalert2';

interface RegI{
  visible: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Output() onRegister : EventEmitter<RegI> = new EventEmitter();
  usuario!: Usuario;
  form!: FormGroup;
  visible : boolean = true;
  changeType: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    //private servicio: RegistoService,
    private spinner: NgxSpinnerService,
    private router: Router,
    ) {
    this.form = this.formBuilder.group({
      nombre: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z ]{2,254}')],
      ],
      apellido: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z ]{2,254}')],
      ],
      legajo: [
        '',
        [Validators.required, Validators.pattern('^([1-9]\\d*)|[0]')], Validators.minLength(5)
      ],
      email: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required]],
      contraseniaC: ['', [Validators.required]],
    });
  }
  
  ngOnInit(): void {
  }

  validar() {
    if (this.form.value.contrasenia != this.form.value.contraseniaC) {
      Swal.fire({
        icon: 'error',
        title: 'Cuidado...',
        text: 'Las contraseñas no coinciden',
      });
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.spinner.show();
    const usuario: Usuario = {
      nombre: this.form.get('nombre')?.value,
      apellido: this.form.get('apellido')?.value,
      legajo: this.form.get('legajo')?.value,
      email: this.form.get('email')?.value,
      contrasenia: this.form.get('contrasenia')?.value,
    };

    // this.servicio.PostRegistro(usuario).subscribe((data) => {
    //   if (data.error) {
    //     this.spinner.hide();
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Cuidado...',
    //       text: data.error,
    //     });
    //   } else {
    //     this.spinner.hide();
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'Perfecto...',
    //       text: 'Se registró con éxito, espere su activación',
    //     }).then(() => { 
    //       this.router.navigateByUrl("/seguridad/login");
    //     });
    //   }
    // });
  }

  viewpass(){
    this.visible = !this.visible;
    this.changeType= !this.changeType;
  }
}
