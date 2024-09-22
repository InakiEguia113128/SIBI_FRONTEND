import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { ProductsComponent } from './Components/products/products.component';
import { StatisticsComponent } from './Components/statistics/statistics.component';
import { CoupensComponent } from './Components/coupens/coupens.component';
import { PagesComponent } from './Components/pages/pages.component';
import { MediaComponent } from './Components/media/media.component';
import { SettingsComponent } from './Components/settings/settings.component';
import { RegisterComponent } from './Components/register/register.component';
import { CatalogComponent } from './Components/catalog/catalog.component';
import { AuthGuard } from './Guards/guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent , canActivate: [AuthGuard]},
  { path: 'coupens', component: CoupensComponent, canActivate: [AuthGuard] },
  { path: 'pages', component: PagesComponent, canActivate: [AuthGuard] },
  { path: 'media', component: MediaComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'catalog', component: CatalogComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { };