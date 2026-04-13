import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageCode, LanguageService } from './language.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  constructor(private readonly language: LanguageService) {}

  protected readonly sidebarItems = [
    { key: 'dashboard', active: true },
    { key: 'newComplaints', active: false },
    { key: 'inProgress', active: false },
    { key: 'resolved', active: false },
    { key: 'userManagement', active: false },
    { key: 'reports', active: false }
  ];

  protected get stats() {
    return [
      { label: this.t('totalComplaintsReceived'), value: '2,450', meta: 'Today: 15', tone: 'red' },
      { label: this.t('currentActiveComplaints'), value: '415', meta: 'Needs review', tone: 'dark' },
      { label: this.t('newUnassignedComplaints'), value: '58', meta: 'Priority queue', tone: 'gold' },
      { label: this.t('resolvedComplaints'), value: '1,977', meta: '+4.3% this month', tone: 'green' },
      { label: this.t('avgResolutionTime'), value: '3.1 Days', meta: 'Target: below 4 days', tone: 'maroon' },
      { label: this.t('studentSatisfaction'), value: '92%', meta: '4.6 / 5 rating', tone: 'amber' }
    ];
  }

  protected readonly monthlySubmissions = [
    { month: 'Jan', value: 98 },
    { month: 'Feb', value: 67 },
    { month: 'Mar', value: 115 },
    { month: 'Apr', value: 139 },
    { month: 'May', value: 103 },
    { month: 'Jun', value: 124 },
    { month: 'Jul', value: 280 },
    { month: 'Aug', value: 200 },
    { month: 'Sep', value: 170 },
    { month: 'Oct', value: 92 },
    { month: 'Nov', value: 175 },
    { month: 'Dec', value: 73 }
  ];

  protected readonly statusBreakdown = [
    { month: 'Jan', new: 40, inProgress: 34, review: 24, resolved: 38 },
    { month: 'Feb', new: 45, inProgress: 39, review: 27, resolved: 52 },
    { month: 'Mar', new: 50, inProgress: 45, review: 30, resolved: 60 },
    { month: 'Apr', new: 42, inProgress: 41, review: 32, resolved: 58 },
    { month: 'May', new: 44, inProgress: 40, review: 30, resolved: 54 },
    { month: 'Jun', new: 48, inProgress: 43, review: 31, resolved: 55 },
    { month: 'Jul', new: 51, inProgress: 47, review: 35, resolved: 62 },
    { month: 'Aug', new: 49, inProgress: 42, review: 33, resolved: 60 },
    { month: 'Sep', new: 38, inProgress: 35, review: 26, resolved: 50 },
    { month: 'Oct', new: 35, inProgress: 33, review: 24, resolved: 45 },
    { month: 'Nov', new: 46, inProgress: 40, review: 30, resolved: 64 },
    { month: 'Dec', new: 58, inProgress: 44, review: 33, resolved: 92 }
  ];

  protected readonly topCategories = [
    { name: 'Academic', value: 28, tone: '#7f0000' },
    { name: 'Administrative', value: 20, tone: '#a73a2e' },
    { name: 'Facilities', value: 14, tone: '#c79b2d' },
    { name: 'Student Affairs', value: 12, tone: '#d8b97a' },
    { name: 'Security', value: 10, tone: '#6f9f74' },
    { name: 'Services', value: 8, tone: '#7fb089' },
    { name: 'Others', value: 8, tone: '#a6bccb' }
  ];

  protected readonly priorityComplaints = [
    { id: 'ID00123', priority: 'High', title: 'Grading Discrepancy', date: '2024-05-18', assignee: 'Prof. Gomez', status: 'Under Review' },
    { id: 'ID00124', priority: 'Medium', title: 'Late Enrollment Concern', date: '2024-05-18', assignee: 'Registrar Office', status: 'For Action' },
    { id: 'ID00125', priority: 'High', title: 'Scholarship Delay', date: '2024-05-19', assignee: 'Student Services', status: 'In Progress' }
  ];

  protected readonly recentAssignments = [
    'New high-priority complaint from Campus A - Oct 12',
    'Reminder: 3 in-progress cases overdue',
    'Assigned 5 new cases to Student Services',
    'Forwarded 2 facilities issues to Engineering Office'
  ];

  protected readonly notifications = [
    'New high-priority complaint from Campus A',
    '3 complaints approaching deadline',
    '2 users submitted follow-up evidence',
    'System generated weekly analytics report'
  ];

  protected maxMonthlyValue = Math.max(...this.monthlySubmissions.map((item) => item.value));

  protected maxStatusTotal = Math.max(
    ...this.statusBreakdown.map((item) => item.new + item.inProgress + item.review + item.resolved)
  );

  protected t(key: string): string {
    return this.language.t(key);
  }

  protected currentLanguage(): LanguageCode {
    return this.language.currentLanguage();
  }

  protected setLanguage(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as LanguageCode;
    this.language.setLanguage(value);
  }
}
