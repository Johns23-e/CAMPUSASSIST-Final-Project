import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { LanguageCode, LanguageService } from '../language.service';

type ComplaintStatus = 'New' | 'In Review' | 'Action Ongoing' | 'Resolved';
type ComplaintPriority = 'High' | 'Medium' | 'Low';

@Component({
  selector: 'app-student-dashboard',
  imports: [RouterLink],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css'
})
export class StudentDashboard {
  protected readonly username: string;
  protected readonly displayName: string;
  protected readonly sidebarLinks = [
    'sdSidebarDashboard',
    'sdSidebarLodgeComplaint',
    'sdSidebarMyComplaints',
    'sdSidebarMyUpdates',
    'sdSidebarUserProfile',
    'sdSidebarCommunityForum',
    'sdSidebarResources'
  ];

  protected readonly complaints: Array<{
    id: string;
    title: string;
    category: string;
    dateFiled: string;
    office: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    dueBy: string;
    nextAction: string;
    updatedAt: string;
  }> = [
    {
      id: 'CAS-2026-0012',
      title: 'Grade discrepancy concern in IT 304',
      category: 'Academic Concern',
      dateFiled: '2026-03-28',
      office: 'College Dean Office',
      status: 'In Review',
      priority: 'High',
      dueBy: '2026-04-18',
      nextAction: 'Upload grade computation screenshot requested by Dean Office.',
      updatedAt: '2026-04-12 09:40 AM'
    },
    {
      id: 'CAS-2026-0018',
      title: 'Water supply interruption in CEA Building',
      category: 'Facilities and Maintenance',
      dateFiled: '2026-04-05',
      office: 'Campus Engineering Office',
      status: 'Action Ongoing',
      priority: 'Medium',
      dueBy: '2026-04-20',
      nextAction: 'Wait for facilities completion update from Engineering Office.',
      updatedAt: '2026-04-13 02:20 PM'
    },
    {
      id: 'CAS-2026-0004',
      title: 'Delayed scholarship posting concern',
      category: 'Financial, Scholarship, or Billing',
      dateFiled: '2026-02-18',
      office: 'Student Services',
      status: 'Resolved',
      priority: 'Low',
      dueBy: '2026-03-02',
      nextAction: 'No further action needed. Case already closed.',
      updatedAt: '2026-03-01 11:15 AM'
    }
  ];

  protected readonly recentUpdates: string[] = [
    'sdAnnouncement1',
    'sdAnnouncement2',
    'sdAnnouncement3'
  ];
  protected readonly statusUpdates = [
    'sdStatusUpdate1',
    'sdStatusUpdate2'
  ];
  protected readonly myMessages = [
    'sdMessage1',
    'sdMessage2'
  ];

  protected readonly featuredTopics = [
    { title: 'sdTopicAcademicPolicy', age: 'sdAge2Hours', tone: 'maroon' },
    { title: 'sdTopicFacilities', age: 'sdAge2Hours', tone: 'light' },
    { title: 'sdTopicScholarship', age: 'sdAge3Hours', tone: 'light' },
    { title: 'sdTopicStudentServices', age: 'sdAge5Hours', tone: 'light' }
  ];
  protected readonly submissionsTrend = [
    { month: 'sdMonthJan', value: 28 },
    { month: 'sdMonthFeb', value: 18 },
    { month: 'sdMonthMar', value: 15 },
    { month: 'sdMonthApr', value: 16 },
    { month: 'sdMonthMay', value: 28 },
    { month: 'sdMonthJun', value: 16 }
  ];

  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router,
    private readonly language: LanguageService
  ) {
    this.username = this.authState.getCurrentStudent() ?? '';
    this.displayName = this.authState.getCurrentStudentName() ?? 'Student';

    if (!this.username) {
      this.router.navigate(['/login'], { queryParams: { role: 'student' } });
    }
  }

  protected get totalComplaints(): number {
    return this.complaints.length;
  }

  protected get activeComplaints(): number {
    return this.complaints.filter((item) => item.status !== 'Resolved').length;
  }

  protected get resolvedComplaints(): number {
    return this.complaints.filter((item) => item.status === 'Resolved').length;
  }

  protected get latestStatus(): string {
    return this.complaints[0]?.status ?? 'No records yet';
  }

  protected get maxTrendValue(): number {
    return Math.max(...this.submissionsTrend.map((item) => item.value), 1);
  }

  protected get highPriorityCount(): number {
    return this.complaints.filter((item) => item.priority === 'High' && item.status !== 'Resolved').length;
  }

  protected get notificationCount(): number {
    return this.recentUpdates.length;
  }

  protected get unreadMessages(): number {
    return 2;
  }

  protected currentLanguage(): LanguageCode {
    return this.language.currentLanguage();
  }

  protected t(key: string): string {
    return this.language.t(key);
  }

  protected setLanguage(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as LanguageCode;
    this.language.setLanguage(value);
  }

  protected logout(): void {
    this.authState.logoutStudent();
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
  }

  protected statusText(status: ComplaintStatus): string {
    if (status === 'In Review') return this.t('sdStatusInReview');
    if (status === 'Action Ongoing') return this.t('sdStatusActionOngoing');
    if (status === 'Resolved') return this.t('sdStatusResolved');
    return this.t('sdStatusNew');
  }
}
