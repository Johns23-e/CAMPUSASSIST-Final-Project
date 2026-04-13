import { Routes } from '@angular/router';
import { AuthPage } from './auth-page';
import { AdminDashboard } from './admin-dashboard';
import { HomePage } from './home-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', component: AuthPage, data: { mode: 'login' } },
  { path: 'signup', component: AuthPage, data: { mode: 'signup' } },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: '**', redirectTo: '' }
];
