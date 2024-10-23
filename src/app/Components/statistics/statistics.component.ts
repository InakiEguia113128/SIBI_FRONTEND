import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chart, registerables, ChartOptions, ChartData } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReporteService } from 'src/app/Services/Reportes/reporte.service';
import Swal from 'sweetalert2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  librosPorGenero: any[] = [];
  myChart: Chart<'doughnut'> | undefined; 
  fechaDesde: string = ''; 
  fechaHasta: string = '';  

  constructor(
    private servicioReportes: ReporteService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    const fechaActual = new Date();

    this.fechaDesde = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().substring(0, 10);
  
    this.fechaHasta = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().substring(0, 10);

    this.CargarLibrosPorGenero();
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
}
