import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModicarUsuario, Usuario, UsuarioDTO } from 'src/app/Models/Register/i-usuario';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  idUsuario: string = "";
  form: FormGroup;
  changeType: boolean = true;
  visible : boolean = true;
  isDisabled : boolean = true;

  constructor(
    private servicio: UserService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private formBuilder: FormBuilder) 
    { 
      this.form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        contraseniaActual: ['', [Validators.minLength(6)]],
        nombre: ['', Validators.required],
        contraseniaNuevo: ['', [Validators.minLength(6)]],
        apellido: ['', Validators.required]
      });
    }

  ngOnInit(): void {
    this.idUsuario = this.servicio.getUserIdFromLocalStorage();
    this.form.get('email')?.disable();
    this.getUser(this.idUsuario);
  }


  getUser(id: string) {
    this.servicio.GetUsuarioById(id).subscribe({
      next: (data) => {   
        let usuario = data.resultado;
        this.form.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          apellido: usuario.apellido,
        });
      },
      error: (error) => { console.log(error) }
    })
  }

  Actualizar() {
    if (this.form.value.contraseniaActual != this.form.value.contraseniaNuevo) {
      Swal.fire({
        icon: 'error',
        title: 'Cuidado...',
        text: 'Las contraseñas no coinciden',
      });
    }

    const usuario: ModicarUsuario = {
      idUsuario : this.idUsuario,
      nombre : this.form.get('nombre')?.value,
      apellido: this.form.get('apellido')?.value,
      email: this.form.get('email')?.value,
      contrasenia: this.form.get('contraseniaNuevo')?.value,
    };
    
    this.spinner.show();  
    this.servicio.PutUsuario(usuario).subscribe((data) => {
      if (data.error) {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Cuidado...',
          text: data.error,
        });
      } else {
        this.spinner.hide();
        Swal.fire({
          icon: 'success',
          title: 'Perfecto...',
          text: 'Se actualizo su usuario con éxito',
        }).then(() => { 
        });
      }
    });
  }

  viewpass(){
    this.visible = !this.visible;
    this.changeType= !this.changeType;
  }
}