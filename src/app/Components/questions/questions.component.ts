import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/Services/Users/user.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  esSocio : boolean = false;

  constructor(
    private readonly servicioUsuario: UserService,
    private readonly spinner: NgxSpinnerService,
  ) { }
  
  ngOnInit(): void {
    debugger
    const rolesUsuario = this.servicioUsuario.obtenerRolesUsuarioActivo();
    const rolesValidos = ['Socio', 'Socio registrado'];
    this.esSocio = rolesUsuario.roles.some((rol: any) => rolesValidos.includes(rol));
  }
}
