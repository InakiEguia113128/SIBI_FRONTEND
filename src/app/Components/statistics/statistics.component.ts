import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables, ChartOptions, ChartData } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReporteService } from 'src/app/Services/Reportes/reporte.service';
import Swal from 'sweetalert2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  librosPorGenero: any[] = [];
  myChart: Chart<'doughnut'> | undefined; 
  fechaDesde: string = ''; 
  fechaHasta: string = '';  
  alquileres: any = [];
  mostrarFiltros: boolean = false;
  filtros: any = {
    fechaDesde: null,
    fechaHasta: null,
    idEstadoAlquiler: null,
    nroDocumentoSocio: null,
    nombre: null,
    apellido: null,
  };
  length = 0; 
  pageSize = 10; 
  pageIndex = 0; 
  recalcularToal: boolean = false;
  limpiarActivados : boolean = false;

  constructor(
    private servicioReportes: ReporteService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    const fechaActual = new Date();

    this.fechaDesde = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().substring(0, 10);
  
    this.fechaHasta = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().substring(0, 10);

    this.CargarLibrosPorGenero();
    this.obtenerAlquileresVencidos();
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
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400;
        canvas.height = 400;

        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        if (this.myChart) {
          this.myChart.destroy();
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

        this.myChart = new Chart(ctx, {
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
        this.alquileres = resp.resultado; 
        if(this.recalcularToal){
          this.length = (resp.resultado && resp.resultado.length > 0) ? resp.resultado[0].total : 0;
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
        doc.text(filtro, 10, startY + (index * 4)); 
        startY += 4; 
      });
  
      startY += 5; 
    }
  
    const data = this.alquileres.map((alquiler: { socio: { nombre: any; apellido: any; nroDocumento: any; }; montoTotal: { toLocaleString: (arg0: string, arg1: { style: string; currency: string; }) => any; }; descripcion: any; fechaDesde: string | number | Date; fechaHasta: string | number | Date; }) => ({
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
}