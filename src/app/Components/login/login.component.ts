import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


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

  constructor(private formBuilder: FormBuilder, private router: Router, private http: HttpClient) {
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
    this.router.navigateByUrl("/dashboard")
    this.onLogin.emit({visible : true});
    const login: Login = {
      email: this.loginForm.get('email')?.value,
      contrasenia: this.loginForm.get('contrasenia')?.value,
      roles: [],
      token: "",
      activo: false,
      nombre: "",
      apellido: "",
      message: "",
      ok: false,
      error: "",
      codigoEstado: 1
    };
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
