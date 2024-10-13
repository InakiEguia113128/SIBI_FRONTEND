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
  rolUsuario : string ='';

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
    this.spinner.show();
    this.servicio.GetUsuarioById(id).subscribe({
      next: (data) => {   
        this.spinner.hide();
        let usuario = data.resultado;
        this.form.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          apellido: usuario.apellido,
        });
        this.rolUsuario = usuario.roles[0]
      },
      error: (error) => {
        this.spinner.hide(); 
        Swal.fire({
          icon: 'error',
          title: 'Cuidado...',
          text: error.error.error,
        });
      }
    })
  }

  Actualizar() {
    if (this.form.value.contraseniaActual != this.form.value.contraseniaNuevo) {
      Swal.fire({
        icon: 'error',
        title: 'Cuidado...',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas modificar los datos del usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const usuario: ModicarUsuario = {
          idUsuario : this.idUsuario,
          nombre : this.form.get('nombre')?.value,
          apellido: this.form.get('apellido')?.value,
          email: this.form.get('email')?.value,
          contrasenia: this.form.get('contraseniaNuevo')?.value,
        };
  
        this.spinner.show();  
        this.servicio.PutUsuario(usuario).subscribe((data) => {
          this.spinner.hide();
          if (data.error) {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: data.error,
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Perfecto...',
              text: 'Se actualizó su usuario con éxito',
            }).then(() => { });
          }
        });
      }
    });
  }  

  viewpass(){
    this.visible = !this.visible;
    this.changeType= !this.changeType;
  }
}