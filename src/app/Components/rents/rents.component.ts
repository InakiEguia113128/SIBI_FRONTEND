import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AlquilerService } from 'src/app/Services/Alquileres/alquiler.service';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-rents',
  templateUrl: './rents.component.html',
  styleUrls: ['./rents.component.css']
})
export class RentsComponent implements OnInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  alquilerSeleccionado : any = {};
  modoVistaAlquiler: boolean = false;
  esSocioRegistrado: boolean = false;
  detalleAlquiler: any = [];
  alquilerCreado: boolean = true;
  total : any = undefined
  rolesUsuario: any = {};
  alquileres: any = [];
  length = 0; 
  pageSize = 10; 
  pageIndex = 0; 
  estadosAlquiler: any = [];
  mostrarFiltros: boolean = false;
  idUsuario: string | undefined;
  esSocio: boolean = false;
  recalcularToal: boolean = false;
  limpiarActivados : boolean = false;
  public formularioAltaPedido: FormGroup;
  filtros: any = {
    fechaDesde: null,
    fechaHasta: null,
    idEstadoAlquiler: null,
    nroDocumentoSocio: null,
    nombre: null,
    apellido: null,
  };

  ngOnInit(): void {
    this.obtenerEstadosAlquiler();
    this.recalcularToal = true;
    this.obtenerAlquileres();
  }

  constructor(
    private readonly servicioAlquileres: AlquilerService,
    private readonly servicioUsuario: UserService,
    private readonly spinner: NgxSpinnerService,
    private readonly fb:FormBuilder
  ) { 
    this.formularioAltaPedido = this.fb.group({
      montoTotal: [null, 0],
      fechaDesde: [formatDate(new Date(), 'yyyy-MM-dd', 'en'), [Validators.required]],
      fechaHasta: [formatDate(new Date(), 'yyyy-MM-dd', 'en'), [Validators.required]],
      puntosCanjeados: [0,],
      isbnLibro: [{ value: '', disabled: true }],
      detalleAlquilerDtos: [[]]});
  }

  obtenerEstadosAlquiler() {
    this.spinner.show();
    this.servicioAlquileres.ObtenerEstadosAlquiler().subscribe({
      next: (resp) => {
        this.spinner.hide();
        this.estadosAlquiler = resp.resultado;
      },
      error: (error) => {
        this.spinner.hide();
      }
    });
  }

  obtenerAlquileres(pagina: number = this.pageIndex, cantidad: number = this.pageSize, recalcularLength:boolean = this.recalcularToal) {
    this.rolesUsuario = this.servicioUsuario.obtenerRolesUsuarioActivo();
    const rolesValidos = ['Socio', 'Socio registrado'];
    this.esSocio = this.rolesUsuario.roles.some((rol: any) => rolesValidos.includes(rol));
    this.idUsuario = this.esSocio ? this.servicioUsuario.getUserIdFromLocalStorage() : undefined;

    this.spinner.show();
    
    const saltar = pagina * cantidad;

    this.servicioAlquileres.ObtenerAlquileres({
      ...this.filtros,
      idUsuario: this.idUsuario,
      devolver: cantidad,
      salta: saltar 
    }).subscribe({
      next: (resp) => {
        
        this.spinner.hide();
        this.alquileres = resp.resultado; 
        if(this.recalcularToal){
          this.length = resp.resultado[0].total; 
        }
        this.recalcularToal = false;

      },
      error: (error) => {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo recuperar los alquileres', 'error');
      }
    });
  }

  cambiarPagina(event: PageEvent) {
    this.pageIndex = event.pageIndex; 
    this.pageSize = event.pageSize; 
    this.obtenerAlquileres(this.pageIndex, this.pageSize);
  }

  abrirFiltro() {
    this.mostrarFiltros = true;
  }

  cerrarFiltro() {
    this.mostrarFiltros = false;
  }

  aplicarFiltros() {
    this.irAPaginaUno();
    this.limpiarActivados = true;
    this.recalcularToal = true
    this.obtenerAlquileres();
    this.cerrarFiltro();
  }

  irAPaginaUno() {
    this.paginator.firstPage();
  }

  limpiarFiltros() {
    this.irAPaginaUno();
    this.limpiarActivados = false;
    this.pageSize = 10;
    this.pageIndex = 0;
    this.recalcularToal = true;
    this.filtros = {
      fechaDesde: null,
      fechaHasta: null,
      idEstadoAlquiler: null,
      nroDocumentoSocio: null,
      nombre: null,
      apellido: null,
      devolver: this.pageSize,
      salta: 0
    };
    this.obtenerAlquileres();
    this.mostrarFiltros = false;
  }


  verAlquiler(alquiler:any){
    this.spinner.show();
    this.modoVistaAlquiler = true
    this.alquilerSeleccionado = alquiler;
    this.esSocioRegistrado = alquiler.socio.socioRegistrado;
  
    this.formularioAltaPedido.setValue({
      montoTotal: alquiler.montoTotal,
      fechaDesde: alquiler.fechaDesde,
      fechaHasta: alquiler.fechaHasta,
      puntosCanjeados: alquiler.puntosCanjeados,
      isbnLibro : '',
      detalleAlquilerDtos : this.detalleAlquiler
    });

    this.formularioAltaPedido.disable();
    this.detalleAlquiler = alquiler.detallesAlquiler;
    this.spinner.hide();
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

  volver(){
    this.modoVistaAlquiler = false;
  }
}
