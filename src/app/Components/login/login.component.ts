import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { login } from 'src/app/Models/Login/i-login';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';


export interface Login  {
  email: string;
  contrasenia: string;
  roles: string[];
  token: string;
  activo: boolean; 
  nombre: string;
  apellido: string;
  message: string;
  ok: boolean;
  error: string
  codigoEstado: number;
}

interface LoginI{
  visible: boolean;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private Subscription = new Subscription();
  public loginForm!: FormGroup
  log = {} as Login;
  changeType: boolean = true;
  visible: boolean = true;
  @Output() onLogin : EventEmitter<LoginI> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder, 
    private router: Router,  
    private spinner: NgxSpinnerService, 
    private servicio: UserService,) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.Subscription.unsubscribe();
  }

  login() {
    this.spinner.show();
    
    const login: login = {
      email: this.loginForm.get('email')?.value,
      contrasenia: this.loginForm.get('contrasenia')?.value,
    };

    this.Subscription.add(
      this.servicio.PostLogin(login).subscribe(next => {
        debugger
        this.spinner.hide();
        Swal.fire({
          icon: 'success',
          title: `Bienvenido`,
          confirmButtonColor: '#2c5672',
          text: 'Inicio de sesión...',
          timer: 5000
        }).then(x => {
          this.onLogin.emit({visible : true});
          this.router.navigate(["/dashboard"]);
        });
      }, error => {
        debugger
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: '¡Ups, algo salió mal!',
          confirmButtonColor: '#2c5672',
          text: error.error.error,
        });
      })
    );
  }

  viewpass() {
    this.visible = !this.visible;
    this.changeType = !this.changeType;
  }

  registrar() {
    this.onLogin.emit({visible : false});
    this.router.navigateByUrl("/register")
  }
}
