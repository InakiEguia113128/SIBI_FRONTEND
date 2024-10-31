import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables, ChartOptions, ChartData } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReporteService } from 'src/app/Services/Reportes/reporte.service';
import Swal from 'sweetalert2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserService } from 'src/app/Services/Users/user.service';
import { LibrosService } from 'src/app/Services/Libros/libros.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  recalcularTotalLibro = false;
  mostrarFiltrosLibro = false;
  librosRelevantes : any = [];
  librosRelevantesPDF : any = [];
  filtrosLibrosRelevantes: any = {
    titulo: null,
    autor: null,
    editorial: null,
    fechaPublicacionDesde: null,
    fechaPublicacionHasta: null,
    idGenero: null,
    nGenero: null,
    devolver: 10,
    salta:0
  };
  lengthLibros = 0; 
  pageSizeLibros = 10; 
  pageIndexLibros = 0; 
  generos: any = [];
  esEmpleado : boolean = false;
  rolesUsuario: any = [];
  librosPorGenero: any[] = [];
  sociosActivos: any[] = [];
  fechaDesdeSociosActivos: string = ''; 
  fechaHastaSociosActivos: string = '';  
  librosGeneroChart: Chart<'doughnut'> | undefined; 
  sociosActivosChart: Chart<'polarArea'>  | undefined;
  fechaDesde: string = ''; 
  fechaHasta: string = '';  
  alquileres: any = [];
  alquileresPDF: any = [];
  mostrarFiltros: boolean = false;
  filtros: any = {
    fechaDesde: null,
    fechaHasta: null,
    idEstadoAlquiler: null,
    nroDocumentoSocio: null,
    nombre: null,
    apellido: null
  };
  length = 0; 
  pageSize = 10; 
  pageIndex = 0; 
  recalcularToal: boolean = false;
  limpiarActivados : boolean = false;

  constructor(
    private servicioReportes: ReporteService,
    private spinner: NgxSpinnerService,
    private servicioLibros: LibrosService,
    private servicioUsuario: UserService
  ) {}

  ngOnInit(): void {
    const fechaActual = new Date();

    this.fechaDesde = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().substring(0, 10);
  
    this.fechaHasta = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().substring(0, 10);

    const tresMesesAtras = new Date(fechaActual.setMonth(fechaActual.getMonth() - 5));

    this.fechaHastaSociosActivos = new Date().toISOString().split('T')[0];

    this.fechaDesdeSociosActivos = tresMesesAtras.toISOString().split('T')[0]; 

    this.rolesUsuario = this.servicioUsuario.obtenerRolesUsuarioActivo();

    this.esEmpleado = !this.rolesUsuario.roles.includes("Administrador");

    this.servicioLibros.GetGeneros().subscribe({
      next: (resp) => {
        this.generos = resp.resultado;
      },
      error: (error) => {}
    });

    if(this.esEmpleado === true){
      this.obtenerAlquileresVencidos();
      this.CargarSociosActivos();
    }else{
      this.CargarLibrosPorGenero();
      this.CargarLibrosRelevantes();
    }
  }

  CargarLibrosPorGenero() {
    this.spinner.show();
  
    const payload = {
      fechaDesde: this.fechaDesde ? this.fechaDesde : undefined,
      fechaHasta: this.fechaHasta ? this.fechaHasta : undefined
    };
    this.servicioReportes.ReporteLibrosGenero(payload).subscribe({
      next: (resp) => {
        this.spinner.hide();
        this.librosPorGenero = resp.resultado;
        this.dibujarGraficoLibrosPorGenero();
      },
      error: (error) => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error.error,
        });
      },
    });
  }

  ngAfterViewInit() {
    Chart.register(...registerables, ChartDataLabels);
  }

  dibujarGraficoLibrosPorGenero() {
    const canvas = document.getElementById('librosGeneroChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400;
        canvas.height = 400;

        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        if (this.librosGeneroChart) {
          this.librosGeneroChart.destroy();
        }

        const labels = this.librosPorGenero.map((item) => item.genero);
        const data = this.librosPorGenero.map(
          (item) => item.cantidadAlquilados
        );

        const backgroundColors = this.generarColores(labels.length);

        const chartData: ChartData<'doughnut', number[], unknown> = {
          labels: labels,
          datasets: [
            {
              label: 'Cantidad de libros alquilados por Género',
              data: data,
              backgroundColor: backgroundColors,
              borderColor: 'rgba(255, 255, 255, 1)',
              borderWidth: 4,
              hoverOffset: 10,
            },
          ],
        };

        const chartOptions: ChartOptions<'doughnut'> = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Cantidad de libros alquilados por Género',
              font: {
                size: 18,
                weight: 'bold',
              },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw || 0;
                  return `${label}: ${value}`;
                },
              },
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: 'rgba(0, 0, 0, 0.7)',
              bodyColor: 'rgba(0, 0, 0, 0.8)',
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              color: 'rgba(0, 0, 0, 0.9)',
              font: {
                size: 14,
                weight: 'bold',
              },
              formatter: (value, context) => {
                const labels = context.chart.data.labels;
                return labels
                  ? `${labels[context.dataIndex]}: ${value}`
                  : value;
              },
            },
          },
        };

        this.librosGeneroChart = new Chart(ctx, {
          type: 'doughnut',
          data: chartData,
          options: chartOptions,
        });
      } else {
        console.error('No se pudo obtener el contexto 2D del canvas.');
      }
    } else {
      console.error(
        'No se pudo encontrar el elemento canvas con el id "myChart".'
      );
    }
  }

  generarColores(cantidad: number): string[] {
    const colores: string[] = [];
    for (let i = 0; i < cantidad; i++) {
      const color = this.generarColorAleatorio();
      colores.push(color);
    }
    return colores;
  }

  generarColorAleatorio(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  }

  limpiarFiltros() {
    const fechaActual = new Date();

    this.fechaDesde = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().substring(0, 10);
  
    this.fechaHasta = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().substring(0, 10);
    this.CargarLibrosPorGenero();  
  }

  abrirFiltro() {
    this.mostrarFiltros = true;
  }

  cerrarFiltro() {
    this.mostrarFiltros = false;
  }

  obtenerAlquileresVencidos(pagina: number = this.pageIndex, cantidad: number = this.pageSize, recalcularLength:boolean = this.recalcularToal) {

    this.spinner.show();
    
    const saltar = pagina * cantidad;

    this.servicioReportes.ListadoAlquileresVencidos({
      ...this.filtros,
      devolver: cantidad,
      salta: saltar 
    }).subscribe({
      next: (resp) => {
        this.spinner.hide();
        this.alquileres = resp.resultado.resultado; 
        this.alquileresPDF = resp.resultado.resultadoPDF; 
          if(this.recalcularToal){
            this.length = resp.resultado.resultado[0].total;
          }else{
            this.length = resp.resultado.resultado[0].total;
          }
        this.recalcularToal = false;

      },
      error: (error) => {
        this.spinner.hide();
        Swal.fire('Error', 'No se pudo recuperar los alquileres', 'error');
      }
    });
  }

  aplicarFiltros() {
    this.irAPaginaUno();
    this.limpiarActivados = true;
    this.recalcularToal = true
    this.obtenerAlquileresVencidos();
    this.cerrarFiltro();
  }

  irAPaginaUno() {
    this.paginator.firstPage();
  }

  cambiarPagina(event: PageEvent) {
    this.pageIndex = event.pageIndex; 
    this.pageSize = event.pageSize; 
    this.obtenerAlquileresVencidos(this.pageIndex, this.pageSize);
  }

  limpiarFiltrosListado() {
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
    this.obtenerAlquileresVencidos();
    this.mostrarFiltros = false;
  }

  nombreFiltros: any = {
    fechaDesde: 'Fecha desde',
    fechaHasta: 'Fecha hasta',
    idEstadoAlquiler: 'Estado del alquiler',
    nroDocumentoSocio: 'Nro. de documento del socio',
    nombre: 'Nombre del socio',
    apellido: 'Apellido del socio',
  };
  
  exportarPDFAlquileresVencidos() {
    const doc = new jsPDF();
    doc.setFontSize(18);

    const title = 'Listado de alquileres vencidos';
    const titleWidth = doc.getTextWidth(title);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    const lineY = 25; 
    doc.setLineWidth(0.5);
    doc.line(10, lineY, pageWidth - 10, lineY);

    const filtrosAplicados = this.generarTextoFiltros();
    let startY = lineY + 10; 

    if (filtrosAplicados.length > 0) {
        doc.setFontSize(12);
        doc.text('Filtros aplicados', 10, startY);
        startY += 10; 

        filtrosAplicados.forEach((filtro, index) => {
            doc.text(filtro, 10, startY + (index * 6)); 
        });

        startY += filtrosAplicados.length * 6; 
        startY += 5; 
    }

    const data = this.alquileresPDF.map((alquiler: { socio: { nombre: any; apellido: any; nroDocumento: any; }; montoTotal: { toLocaleString: (arg0: string, arg1: { style: string; currency: string; }) => any; }; descripcion: any; fechaDesde: string | number | Date; fechaHasta: string | number | Date; }) => ({
        nombre: `${alquiler.socio.nombre} ${alquiler.socio.apellido}`,
        nroDocumento: alquiler.socio?.nroDocumento || '-',
        subtotal: alquiler.montoTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
        estado: alquiler.descripcion,
        fechaEntrega: new Date(alquiler.fechaDesde).toLocaleDateString('es-AR'),
        fechaDevolucion: new Date(alquiler.fechaHasta).toLocaleDateString('es-AR'),
    }));

    const columns = [
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Nro documento', dataKey: 'nroDocumento' },
        { header: 'Subtotal', dataKey: 'subtotal' },
        { header: 'Estado', dataKey: 'estado' },
        { header: 'Fecha de entrega', dataKey: 'fechaEntrega' },
        { header: 'Fecha de devolución', dataKey: 'fechaDevolucion' },
    ];

    autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: data.map((item: { [x: string]: any; }) => columns.map(col => item[col.dataKey])),
        startY: startY, 
    });

    doc.save('listado_alquileres_vencidos.pdf');
}
  
  
  generarTextoFiltros() {
    const filtrosTexto: string[] = [];
    
    for (const [key, value] of Object.entries(this.filtros)) {
      if (value) {
        const filtroNombre = this.nombreFiltros[key] || key;
        filtrosTexto.push(`${filtroNombre}: ${value}`);
      }
    }
  
    return filtrosTexto;
  }

    dibujarGraficoSociosActivosPorMes() {
      const canvas = document.getElementById('sociosActivosChart') as HTMLCanvasElement;

      if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
              canvas.width = 400;
              canvas.height = 400;

              const dpr = window.devicePixelRatio || 1;
              ctx.scale(dpr, dpr);

              if (this.sociosActivosChart) {
                  this.sociosActivosChart.destroy();
              }

              const labels = this.sociosActivos.map((item) => `${item.mes} ${item.año}`);
              const data = this.sociosActivos.map((item) => item.cantidadSociosActivos);

              const backgroundColors = this.generarColores2(labels.length);

              const chartData: ChartData<'polarArea', number[], unknown> = {
                  labels: labels,
                  datasets: [
                      {
                          label: 'Cantidad de socios activos por mes',
                          data: data,
                          backgroundColor: backgroundColors,
                          borderColor: 'rgba(255, 255, 255, 1)',
                          borderWidth: 4,
                          hoverOffset: 10,
                      },
                  ],
              };

              const chartOptions: ChartOptions<'polarArea'> = {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      r: {
                          beginAtZero: true,
                          ticks: {
                              callback: function(tickValue) {
                                  return typeof tickValue === 'number' ? tickValue : ''; 
                              },
                          },
                      },
                  },
                  plugins: {
                      title: {
                          display: true,
                          text: 'Cantidad de socios activos por mes',
                          font: {
                              size: 18,
                              weight: 'bold',
                          },
                      },
                      tooltip: {
                          callbacks: {
                              label: (tooltipItem) => {
                                  const label = tooltipItem.label || '';
                                  const value = tooltipItem.raw as number; 
                                  return `${label}: ${Math.round(value)}`;
                              },
                          },
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          titleColor: 'rgba(0, 0, 0, 0.7)',
                          bodyColor: 'rgba(0, 0, 0, 0.8)',
                      },
                      datalabels: {
                          anchor: 'end',
                          align: 'end',
                          color: 'rgba(0, 0, 0, 0.9)',
                          font: {
                              size: 14,
                              weight: 'bold',
                          },
                          formatter: (value: number, context) => {
                              const labels = context.chart.data.labels;
                              return labels ? `${labels[context.dataIndex]}: ${Math.round(value)}` : value;
                          },
                      },
                  },
              };

              this.sociosActivosChart = new Chart(ctx, {
                  type: 'polarArea',
                  data: chartData,
                  options: chartOptions,
              });
          } else {
              console.error('No se pudo obtener el contexto 2D del canvas.');
          }
      } else {
          console.error('No se pudo encontrar el elemento canvas con el id "sociosActivosChart".');
      }
  }

    CargarSociosActivos() {
      this.spinner.show();
    
      const payload = {
        fechaDesde: this.fechaDesdeSociosActivos ? this.fechaDesdeSociosActivos : undefined,
        fechaHasta: this.fechaHastaSociosActivos ? this.fechaHastaSociosActivos : undefined
      };
      
      this.servicioReportes.SociosActivosPorMes(payload).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.sociosActivos = resp.resultado;
          this.dibujarGraficoSociosActivosPorMes();
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error.error,
          });
        },
      });
    } 
    
    generarColores2(cantidad: number): string[] {
      const colores: string[] = [];
      for (let i = 0; i < cantidad; i++) {
          colores.push(this.generarColorCalido(0.5));
      }
      return colores;
  }

  generarColorCalido(opacidad: number): string {
      const r = Math.floor(Math.random() * 156 + 100); 
      const g = Math.floor(Math.random() * 156); 
      const b = Math.floor(Math.random() * 56);
      return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
  }


  limpiarSociosActivos(){
    const fechaActual = new Date();
    
    const tresMesesAtras = new Date(fechaActual.setMonth(fechaActual.getMonth() - 5));

    this.fechaHastaSociosActivos = new Date().toISOString().split('T')[0];

    this.fechaDesdeSociosActivos = tresMesesAtras.toISOString().split('T')[0]; 

    this.CargarSociosActivos();
  }


  CargarLibrosRelevantes(pagina: number = this.pageIndexLibros, cantidad: number = this.pageSizeLibros, recalcularLength:boolean = this.recalcularTotalLibro){
      this.spinner.show();
  
      const saltar = pagina * cantidad;
      this.filtrosLibrosRelevantes.devolver = cantidad;
      this.filtrosLibrosRelevantes.salta = saltar;

      this.servicioReportes.LibrosMasAlquilados({ ...this.filtrosLibrosRelevantes}).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.librosRelevantes = resp.resultado.resultado;
          this.librosRelevantesPDF = resp.resultado.resultadoPDF;

          if(this.recalcularTotalLibro){
            this.lengthLibros = resp.resultado.resultado[0].count;
          }else{
            this.lengthLibros = resp.resultado.resultado[0].count;
          }

          this.recalcularTotalLibro = false;
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error.error,
          });
        },
      });
  }

  abrirFiltroLibros() {
    this.mostrarFiltrosLibro = true;
  }

  cerrarFiltroLibros() {
    this.mostrarFiltrosLibro = false;
  }

  limpiarFiltrosLibros() {
    this.filtrosLibrosRelevantes = {
      titulo: null,
      autor: null,
      editorial: null,
      fechaPublicacionDesde: null,
      fechaPublicacionHasta: null,
      idGenero: null,
      nGenero: null,
      precioDesde: null,
      precioHasta: null,
    };
    this.recalcularTotalLibro = true; 
    this.CargarLibrosRelevantes();
    this.cerrarFiltroLibros();
  }

  aplicarFiltrosLibros(){
    this.recalcularTotalLibro = true; 
    this.CargarLibrosRelevantes();
    this.cerrarFiltroLibros();
  }

  getGeneroDescripcion(libro: any): string {
    if (libro.genero === 'Otro') {
      return libro.otroGenero || 'Sin especificar';
    }
    
    return libro.genero;
  }

  cambiarPaginaLibros(event: PageEvent) {
    this.pageIndexLibros = event.pageIndex; 
    this.pageSizeLibros = event.pageSize; 
    this.CargarLibrosRelevantes(this.pageIndexLibros, this.pageSizeLibros);
  }

  exportarPDFLibrosRelevantes() {
    const doc = new jsPDF();
    doc.setFontSize(18);

    const title = 'Listado de libros relevantes';
    const titleWidth = doc.getTextWidth(title);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    const lineY = 25; 
    doc.setLineWidth(0.5);
    doc.line(10, lineY, pageWidth - 10, lineY);

    const filtrosAplicados = this.generarTextoFiltrosLibros();
    let startY = lineY + 10; 

    if (filtrosAplicados.length > 0) {
        doc.setFontSize(12); 
        doc.text('Filtros aplicados', 10, startY);
        startY += 10;

        filtrosAplicados.forEach((filtro, index) => {
            doc.text(filtro, 10, startY + (index * 6)); 
        });

        startY += filtrosAplicados.length * 6; 
        startY += 5; 
    }

    const data = this.librosRelevantesPDF.map((libro: { titulo: any; nombreAutor: any; editorial: any; cantidadAlquilados: any; cantidadEjemplares: any; fechaPublicacion: string | number | Date; }) => ({
        titulo: libro.titulo,
        nombreAutor: libro.nombreAutor,
        genero: this.getGeneroDescripcion(libro),
        editorial: libro.editorial,
        cantidadAlquilados: libro.cantidadAlquilados,
        cantidadEjemplares: libro.cantidadEjemplares,
        fechaPublicacion: new Date(libro.fechaPublicacion).toLocaleDateString('es-AR'),
    }));

    const columns = [
        { header: 'Título', dataKey: 'titulo' },
        { header: 'Autor', dataKey: 'nombreAutor' },
        { header: 'Género', dataKey: 'genero' },
        { header: 'Editorial', dataKey: 'editorial' },
        { header: 'Cantidad alquilados', dataKey: 'cantidadAlquilados' },
        { header: 'Cantidad disponibles', dataKey: 'cantidadEjemplares' },
        { header: 'Fecha de publicación', dataKey: 'fechaPublicacion' },
    ];

    autoTable(doc, {
        head: [columns.map(col => col.header)],
        body: data.map((item: { [x: string]: any; }) => columns.map(col => item[col.dataKey])),
        startY: startY, 
        margin: { top: 10 },
        theme: 'striped',
    });

    doc.save('listado_libros_relevantes.pdf');
}


  generarTextoFiltrosLibros() {
      const filtrosTexto: string[] = [];

      if (this.filtrosLibrosRelevantes.titulo) {
          filtrosTexto.push(`Título: ${this.filtrosLibrosRelevantes.titulo}`);
      }
      if (this.filtrosLibrosRelevantes.autor) {
          filtrosTexto.push(`Autor: ${this.filtrosLibrosRelevantes.autor}`);
      }
      if (this.filtrosLibrosRelevantes.editorial) {
          filtrosTexto.push(`Editorial: ${this.filtrosLibrosRelevantes.editorial}`);
      }
      if (this.filtrosLibrosRelevantes.fechaPublicacionDesde) {
          filtrosTexto.push(`Fecha de Publicación Desde: ${new Date(this.filtrosLibrosRelevantes.fechaPublicacionDesde).toLocaleDateString('es-AR')}`);
      }
      if (this.filtrosLibrosRelevantes.fechaPublicacionHasta) {
          filtrosTexto.push(`Fecha de Publicación Hasta: ${new Date(this.filtrosLibrosRelevantes.fechaPublicacionHasta).toLocaleDateString('es-AR')}`);
      }
      if (this.filtrosLibrosRelevantes.nGenero) {
          filtrosTexto.push(`Género: ${this.filtrosLibrosRelevantes.nGenero}`);
      }
      if (this.filtrosLibrosRelevantes.idGenero) {
        const genero = this.generos.find((g: { idGenero: any; }) => g.idGenero === this.filtrosLibrosRelevantes.idGenero);
        filtrosTexto.push(`Género: ${genero.descripcion}`);
    }

      return filtrosTexto;
  }
}