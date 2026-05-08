import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { ComplaintRecord, ComplaintService } from '../complaint.service';
import { LanguageService } from '../language.service';

type ComplaintStatus = 'New' | 'In Review' | 'Assigned' | 'In Progress' | 'Resolved';
type ComplaintPriority = 'High' | 'Medium' | 'Low';

@Component({
  selector: 'app-student-dashboard',
  imports: [RouterLink],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
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

  protected complaints: ComplaintRecord[] = [];

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
    private readonly complaintService: ComplaintService,
    private readonly router: Router,
    private readonly language: LanguageService
  ) {
    this.username = this.authState.getCurrentStudent() ?? '';
    this.displayName = this.authState.getCurrentStudentName() ?? 'Student';

    if (!this.username) {
      this.router.navigate(['/login'], { queryParams: { role: 'student' } });
      return;
    }
    this.reload();
  }

  protected reload(): void {
    this.complaints = this.complaintService.listByCreator(this.username);
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

  protected get liveStatusUpdates(): string[] {
    const updates = this.complaints.flatMap((c) =>
      (c.updates ?? []).map((u) => `${c.id}: ${u.status} - ${u.message}${u.proofAttachment ? ' (with proof file)' : ''}`)
    );
    return updates.length > 0 ? updates.slice(-5).reverse() : ['No staff updates yet.'];
  }

  protected latestUpdateAt(c: ComplaintRecord): string {
    const latest = c.updates && c.updates.length > 0 ? c.updates[c.updates.length - 1].createdAt : c.createdAt;
    return this.formatDateTime(latest);
  }

  protected formatDate(rawIso: string): string {
    const date = new Date(rawIso);
    if (Number.isNaN(date.getTime())) return rawIso;
    return date.toISOString().slice(0, 10);
  }

  protected formatDateTime(rawIso?: string): string {
    if (!rawIso) return '-';
    const date = new Date(rawIso);
    if (Number.isNaN(date.getTime())) return rawIso;
    return date.toLocaleString();
  }

  protected get notificationCount(): number {
    return this.recentUpdates.length;
  }

  protected get unreadMessages(): number {
    return 2;
  }

  protected t(key: string): string {
    return this.language.t(key);
  }

  protected logout(): void {
    this.authState.logoutStudent();
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
  }

  protected statusText(status: ComplaintStatus): string {
    if (status === 'In Review') return this.t('sdStatusInReview');
    if (status === 'Assigned' || status === 'In Progress') return this.t('sdStatusActionOngoing');
    if (status === 'Resolved') return this.t('sdStatusResolved');
    return this.t('sdStatusNew');
  }
}
