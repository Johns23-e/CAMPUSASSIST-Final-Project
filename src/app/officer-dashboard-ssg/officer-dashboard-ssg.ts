import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageCode, LanguageService } from '../language.service';
import { StaffAuthService } from '../staff-auth.service';

type MetricTone = 'maroon' | 'gold' | 'green' | 'light' | 'dark' | 'brick';

@Component({
  selector: 'app-officer-dashboard-ssg',
  templateUrl: './officer-dashboard-ssg.html',
  styleUrl: './officer-dashboard-ssg.css'
})
export class OfficerDashboardSsg {
  constructor(
    private readonly language: LanguageService,
    private readonly staffAuth: StaffAuthService,
    private readonly router: Router
  ) {}

  protected logout(): void {
    this.staffAuth.logout();
    this.router.navigate(['/login'], { queryParams: { role: 'admin' } });
  }

  protected readonly sidebarLinks = [
    { label: 'Dashboard', active: true },
    { label: 'Assignments & Cases', active: false },
    { label: 'My Investigations', active: false },
    { label: 'SSG Announcements', active: false },
    { label: 'SSG Resources', active: false },
    { label: 'Faculty Liaison', active: false },
    { label: 'Officer Profile', active: false }
  ];

  protected readonly metrics: Array<{
    label: string;
    value: string;
    meta?: string;
    tone: MetricTone;
  }> = [
    { label: 'Assigned To Me', value: '15', tone: 'brick' },
    { label: 'My Active Investigations', value: '4', tone: 'gold' },
    { label: 'Resolved By SSG', value: '10', tone: 'green' },
    { label: 'Student Feedback Score', value: '91%', meta: '4.7 / 5', tone: 'light' },
    { label: 'Priority Notifications', value: '8', tone: 'maroon' },
    { label: 'System Broadcasts', value: '3', tone: 'dark' }
  ];

  protected readonly intakeTrend = [
    { month: 'Jan', total: 28, campusA: 18, campusB: 10 },
    { month: 'Feb', total: 18, campusA: 12, campusB: 6 },
    { month: 'Mar', total: 15, campusA: 9, campusB: 6 },
    { month: 'Apr', total: 16, campusA: 11, campusB: 5 },
    { month: 'May', total: 28, campusA: 16, campusB: 12 },
    { month: 'Jun', total: 16, campusA: 10, campusB: 6 }
  ];

  protected readonly concerns = [
    { title: 'Grading Policy Inquiry', age: '2 hours ago', tone: 'dark' },
    { title: 'Campus Safety Issues', age: '2 hours ago', tone: 'light' },
    { title: 'Facilities Maintenance Request', age: '2 hours ago', tone: 'dark' },
    { title: 'Academic Advising Access', age: '2 hours ago', tone: 'light' }
  ];

  protected readonly broadcasts = [
    { message: 'New High Priority Complaint from Campus A', date: '2024-05-18' },
    { message: 'Reminder: 3 InProgress cases', date: '2024-05-18' },
    { message: 'Reminder: 3 InProgress cases approaching B', date: '2024-05-18' }
  ];

  protected readonly assignedCases = [
    { id: 'REF00456', priority: 'HIGH', title: 'Class Conflict', complainant: 'JOHN ROQUE ABINA', dateAssigned: '2024-06-01', status: 'Active\nInvestigation', action: 'View Details /\nMessage' },
    { id: 'REF00789', priority: 'MED', title: 'Security Concern', complainant: 'MALQUISTO CHERWYN', dateAssigned: '2024-06-05', status: 'Awaiting\nReview', action: 'Assign to\nOfficer' }
  ];

  protected readonly investigationUpdates = [
    'New High Priority Complaint from Campus A - Oct 12',
    'Reminder: 3 InProgress cases approaching deadline'
  ];

  protected readonly officerMessages = [
    'New High Priority Complaint from Complainants or Other'
  ];

  protected readonly maxIntakeValue = Math.max(...this.intakeTrend.map((x) => x.total), 1);

  protected currentLanguage(): LanguageCode {
    return this.language.currentLanguage();
  }

  protected setLanguage(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as LanguageCode;
    this.language.setLanguage(value);
  }

  protected t(key: string): string {
    return this.language.t(key);
  }
}

