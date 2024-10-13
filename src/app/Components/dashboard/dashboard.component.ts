import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SociosService } from 'src/app/Services/Socios/socios.service';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  ranking : any = [];
  socioActivo: any ={};
  esSocioActivo =false;

  constructor(
    private readonly servicioUsuario: UserService,
    private readonly servicioSocio: SociosService,
    private readonly spinner: NgxSpinnerService,
  ){}

  ngOnInit(): void {
    this.obtenerRanking();
  }

  obtenerRanking(){
    this.spinner.show();

    this.servicioSocio.obtenerRanking().subscribe({
      next : (respuesta) => {
        this.ranking = respuesta.resultado;

        const rolesValidos = ['Socio registrado'];
        let rolesUsuario = this.servicioUsuario.obtenerRolesUsuarioActivo();     
        let validar_puesto = rolesUsuario.roles.some((rol: any) => rolesValidos.includes(rol));
        if(validar_puesto)
          {
          this.esSocioActivo = true;

          this.servicioSocio.obtenerSocioEnRanking(this.servicioUsuario.getUserIdFromLocalStorage()).subscribe({
            next : (respuesta) => {
              this.spinner.hide();
              this.socioActivo = respuesta.resultado
            },
            error : (error) => {
              this.spinner.hide();
              this.esSocioActivo = false;
            }
          });       
        }else
        {
          this.spinner.hide();
          this.esSocioActivo = false;
        }
      },
      error : (error) => {
        this.spinner.hide();
        Swal.fire('Error', error.error.error, 'error');
      }
    })
  }

  getSocioClass(index: number): string {
    if (index === 0) {
      return 'primer-lugar';
    } else if (index === 1) {
      return 'segundo-lugar';
    } else if (index === 2) {
      return 'tercer-lugar';
    } else {
      return 'otros-lugares';
    }
  }

}
