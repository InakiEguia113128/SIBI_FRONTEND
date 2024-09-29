import { Component, EventEmitter, HostListener, OnInit, OnDestroy, Output } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { navbarData } from './nav-data';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit, OnDestroy {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData = navbarData;
  navVisible = false;
  loginVisible = true;
  usuario : any = {};
  private routerSubscription: Subscription | undefined;

  constructor(private router: Router, private servicio: UserService) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
    }
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.navVisible = !this.shouldHideNavbar(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  closeSideNav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  onLogin(event: any): void {
    this.navVisible = event.visible;
  }

  onRegister(event: any): void {
    this.navVisible = event.visible;
  }

  private shouldHideNavbar(url: string): boolean {
    const hiddenRoutes = ['/','/register'];
    if(url == '/register')
    {
      this.navData = navbarData
      this.loginVisible = false;
    }
    else if(url == '/')
    {
      this.navData = navbarData
      this.loginVisible = true;
    }
    else
    {
      this.usuario = this.servicio.obtenerRolesUsuarioActivo();
      const rolesUsuario = this.usuario.roles;
      this.navData = this.navData.filter(item => item.roles.some(role => rolesUsuario.includes(role)));
    }

    return hiddenRoutes.includes(url);
  }

  cerrarSesion(c:boolean){
    if(c){
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas cerrar la sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.servicio.desloguearUsuario();
          this.router.navigateByUrl("");         
        }
      });
    }
  }
}
