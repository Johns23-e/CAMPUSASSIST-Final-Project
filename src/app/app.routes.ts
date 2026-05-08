import { Routes } from '@angular/router';
import { AuthPage } from './auth-page/auth-page';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AnnouncementsPage } from './announcements-page/announcements-page';
import { HomePage } from './home-page/home-page';
import { ComplaintFormPage } from './complaint-form-page/complaint-form-page';
import { ResourcesPage } from './resources-page/resources-page';
import { StudentDashboard } from './student-dashboard/student-dashboard';
import { OfficerDashboardSsg } from './officer-dashboard-ssg/officer-dashboard-ssg';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'announcements', component: AnnouncementsPage },
  { path: 'resources', component: ResourcesPage },
  { path: 'login', component: AuthPage, data: { mode: 'login' } },
  { path: 'signup', component: AuthPage, data: { mode: 'signup' } },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'student-dashboard', component: StudentDashboard },
  { path: 'officer-dashboard', component: OfficerDashboardSsg },
  { path: 'complaints/new', component: ComplaintFormPage },
  { path: '**', redirectTo: '' }
];
