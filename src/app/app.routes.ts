import { Routes } from '@angular/router';
import { AutoservicioLoginComponent } from './components/autoservicio-login.component';
import { DashboardComponent } from './components/dashboard.component';
import { AdminPanelComponent } from './components/admin-panel.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AutoservicioLoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'autoservicio-dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
