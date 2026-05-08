import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { ComplaintAssignee, ComplaintProofAttachment, ComplaintRecord, ComplaintService } from '../complaint.service';
import { LanguageService } from '../language.service';

type AdminSection = 'dashboard' | 'newComplaints' | 'inProgress' | 'resolved' | 'userManagement' | 'reports';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard {
  constructor(
    private readonly language: LanguageService,
    private readonly authState: AuthStateService,
    private readonly complaintService: ComplaintService
  ) {
    this.reload();
  }

  protected complaints: ComplaintRecord[] = [];
  protected students: Array<{ fullName: string; username: string }> = [];

  protected readonly officers = [
    { username: 'johnroque.abina@evsu.edu.ph', displayName: 'Vicepresident' }
  ];

  protected readonly resolutionDraft: Record<string, string> = {};
  protected readonly progressDraft: Record<string, string> = {};
  protected readonly proofDraft: Record<string, ComplaintProofAttachment | undefined> = {};
  protected readonly uploadErrorDraft: Record<string, string> = {};

  protected reload(): void {
    this.complaints = this.complaintService.list();
    this.students = this.authState
      .listRegisteredStudents()
      .map((s) => ({ fullName: s.fullName, username: s.username }));
  }

  protected readonly sidebarItems: Array<{ key: AdminSection }> = [
    { key: 'dashboard' },
    { key: 'newComplaints' },
    { key: 'inProgress' },
    { key: 'resolved' },
    { key: 'userManagement' },
    { key: 'reports' }
  ];
  protected selectedSection: AdminSection = 'dashboard';

  protected get stats() {
    const total = this.complaints.length;
    const today = this.complaints.filter((c) => this.isToday(c.createdAt)).length;
    const active = this.inProgressComplaints.length;
    const unassigned = this.complaints.filter((c) => c.assignee.type === 'unassigned' && c.status !== 'Resolved').length;
    const resolved = this.resolvedComplaints.length;
    const resolvedThisMonth = this.resolvedComplaints.filter((c) => this.isThisMonth(c.resolvedAt)).length;
    const avgDays = this.averageResolutionDays;
    const satisfaction = Math.min(98, 70 + Math.round(this.resolutionRateNumber * 0.28));
    const rating = (3 + (satisfaction / 100) * 2).toFixed(1);

    return [
      { label: this.t('totalComplaintsReceived'), value: this.formatNumber(total), meta: `Today: ${today}`, tone: 'red' },
      { label: this.t('currentActiveComplaints'), value: this.formatNumber(active), meta: 'Needs review', tone: 'dark' },
      { label: this.t('newUnassignedComplaints'), value: this.formatNumber(unassigned), meta: 'Priority queue', tone: 'gold' },
      { label: this.t('resolvedComplaints'), value: this.formatNumber(resolved), meta: `This month: ${resolvedThisMonth}`, tone: 'green' },
      { label: this.t('avgResolutionTime'), value: `${avgDays.toFixed(1)} Days`, meta: 'Target: below 4 days', tone: 'maroon' },
      { label: this.t('studentSatisfaction'), value: `${satisfaction}%`, meta: `${rating} / 5 rating`, tone: 'amber' }
    ];
  }

  protected get monthlySubmissions(): Array<{ month: string; value: number }> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((month, index) => ({
      month,
      value: this.complaints.filter((c) => new Date(c.createdAt).getMonth() === index).length
    }));
  }

  protected get statusBreakdown(): Array<{ month: string; new: number; inProgress: number; review: number; resolved: number }> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((month, index) => {
      const monthComplaints = this.complaints.filter((c) => new Date(c.createdAt).getMonth() === index);
      const newCount = monthComplaints.filter((c) => c.status === 'New').length;
      const assignedCount = monthComplaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
      const reviewCount = monthComplaints.filter((c) => c.status === 'In Review').length;
      const resolvedCount = monthComplaints.filter((c) => c.status === 'Resolved').length;
      return { month, new: newCount, inProgress: assignedCount, review: reviewCount, resolved: resolvedCount };
    });
  }

  protected get topCategories(): Array<{ name: string; value: number; tone: string }> {
    const tones = ['#7f0000', '#a73a2e', '#c79b2d', '#d8b97a', '#6f9f74', '#7fb089', '#a6bccb'];
    const total = this.complaints.length;
    if (total === 0) {
      return [{ name: 'No Data', value: 0, tone: '#a6bccb' }];
    }

    const counts = new Map<string, number>();
    for (const complaint of this.complaints) {
      counts.set(complaint.category, (counts.get(complaint.category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        tone: tones[index % tones.length]
      }));
  }

  protected get priorityComplaints(): Array<{ id: string; priority: string; title: string; date: string; assignee: string; status: string }> {
    const rank = { High: 3, Medium: 2, Low: 1 } as const;
    return [...this.complaints]
      .sort((a, b) => {
        const priorityDiff = rank[b.priority] - rank[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        priority: c.priority,
        title: c.summary,
        date: this.formatDate(c.createdAt),
        assignee: this.assigneeLabel(c.assignee),
        status: c.status
      }));
  }

  protected readonly recentAssignments = [
    'New high-priority complaint from EVSU Dulag Campus - Oct 12',
    'Reminder: 3 in-progress cases overdue',
    'Assigned 5 new cases to Student Services',
    'Forwarded 2 facilities issues to Engineering Office'
  ];

  protected readonly notifications = [
    'New high-priority complaint from EVSU Dulag Campus',
    '3 complaints approaching deadline',
    '2 users submitted follow-up evidence',
    'System generated weekly analytics report'
  ];

  protected get weeklyTrend(): Array<{ day: string; received: number; resolved: number }> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const result: Array<{ day: string; received: number; resolved: number }> = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + i);
      const label = days[dayDate.getDay()];
      const received = this.complaints.filter((c) => this.isSameDay(c.createdAt, dayDate)).length;
      const resolved = this.complaints.filter((c) => this.isSameDay(c.resolvedAt, dayDate)).length;
      result.push({ day: label, received, resolved });
    }
    return result;
  }

  protected readonly dulagUnitWorkload = [
    { unit: 'Student Affairs', volume: 42 },
    { unit: 'Registrar', volume: 31 },
    { unit: 'Facilities', volume: 24 },
    { unit: 'Guidance Office', volume: 16 }
  ];

  protected readonly resolutionSla = [
    { label: '< 24h', value: 22, tone: '#2f7e2f' },
    { label: '1-3 days', value: 44, tone: '#b18419' },
    { label: '4-7 days', value: 23, tone: '#8a1f1f' },
    { label: '> 7 days', value: 11, tone: '#5d0b17' }
  ];

  protected get maxMonthlyValue(): number {
    return Math.max(1, ...this.monthlySubmissions.map((item) => item.value));
  }

  protected get maxStatusTotal(): number {
    return Math.max(1, ...this.statusBreakdown.map((item) => item.new + item.inProgress + item.review + item.resolved));
  }

  protected get maxWeeklyValue(): number {
    return Math.max(1, ...this.weeklyTrend.flatMap((item) => [item.received, item.resolved]));
  }

  protected get maxDulagUnitVolume(): number {
    return Math.max(1, ...this.dulagUnitWorkload.map((item) => item.volume));
  }

  protected assign(id: string, raw: string): void {
    const next: ComplaintAssignee =
      raw === 'unassigned'
        ? { type: 'unassigned' }
        : raw === 'admin'
          ? { type: 'admin' }
          : { type: 'officer', username: raw, displayName: this.officers.find((o) => o.username === raw)?.displayName ?? raw };

    this.complaintService.assign(id, next);
    this.reload();
  }

  protected setDraft(id: string, value: string): void {
    this.resolutionDraft[id] = value;
  }

  protected setProgressDraft(id: string, value: string): void {
    this.progressDraft[id] = value;
  }

  protected async handleProofFile(id: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.proofDraft[id] = undefined;
      this.uploadErrorDraft[id] = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.uploadErrorDraft[id] = 'File too large. Please upload 2MB or smaller.';
      input.value = '';
      return;
    }
    try {
      const dataUrl = await this.readFileAsDataUrl(file);
      this.proofDraft[id] = {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        dataUrl
      };
      this.uploadErrorDraft[id] = '';
    } catch {
      this.uploadErrorDraft[id] = 'Failed to read file. Please try another file.';
    }
  }

  protected resolve(id: string): void {
    const notes = (this.resolutionDraft[id] ?? '').trim() || 'Resolved by admin.';
    this.complaintService.resolve(id, notes, { type: 'admin' });
    this.resolutionDraft[id] = '';
    this.reload();
  }

  protected sendUpdate(id: string, status: 'In Review' | 'In Progress' | 'Resolved'): void {
    const message = (this.progressDraft[id] ?? '').trim();
    if (!message) return;

    this.complaintService.addUpdate(id, {
      status,
      message,
      proofAttachment: this.proofDraft[id],
      actor: { role: 'admin', name: 'Administrator' }
    });

    this.progressDraft[id] = '';
    this.proofDraft[id] = undefined;
    this.uploadErrorDraft[id] = '';
    this.reload();
  }

  protected formatDateTime(rawIso?: string): string {
    if (!rawIso) return '-';
    const date = new Date(rawIso);
    if (Number.isNaN(date.getTime())) return rawIso;
    return date.toLocaleString();
  }

  protected formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected removeStudent(username: string): void {
    this.authState.removeRegisteredStudent(username);
    this.reload();
  }

  protected selectSection(key: AdminSection): void {
    this.selectedSection = key;
  }

  protected isSection(key: AdminSection): boolean {
    return this.selectedSection === key;
  }

  protected get newComplaints(): ComplaintRecord[] {
    return this.complaints.filter((c) => c.status === 'New');
  }

  protected get inProgressComplaints(): ComplaintRecord[] {
    return this.complaints.filter((c) => c.status === 'In Review' || c.status === 'Assigned' || c.status === 'In Progress');
  }

  protected get resolvedComplaints(): ComplaintRecord[] {
    return this.complaints.filter((c) => c.status === 'Resolved');
  }

  protected get totalOpenComplaints(): number {
    return this.newComplaints.length + this.inProgressComplaints.length;
  }

  protected get highPriorityOpen(): number {
    return this.inProgressComplaints.filter((c) => c.priority === 'High').length + this.newComplaints.filter((c) => c.priority === 'High').length;
  }

  protected get anonymousRate(): string {
    if (this.complaints.length === 0) return '0%';
    const anonymous = this.complaints.filter((c) => 'anonymous' in c.createdBy).length;
    return `${Math.round((anonymous / this.complaints.length) * 100)}%`;
  }

  protected get resolutionRate(): string {
    if (this.complaints.length === 0) return '0%';
    return `${Math.round((this.resolvedComplaints.length / this.complaints.length) * 100)}%`;
  }

  protected get resolutionRateNumber(): number {
    if (this.complaints.length === 0) return 0;
    return Math.round((this.resolvedComplaints.length / this.complaints.length) * 100);
  }

  protected get averageResolutionDays(): number {
    const resolvedWithDates = this.resolvedComplaints.filter((c) => !!c.resolvedAt);
    if (resolvedWithDates.length === 0) return 0;

    const totalDays = resolvedWithDates.reduce((sum, c) => {
      const created = new Date(c.createdAt).getTime();
      const resolved = new Date(c.resolvedAt as string).getTime();
      const diffDays = Math.max(0, (resolved - created) / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return totalDays / resolvedWithDates.length;
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatDate(rawIso: string): string {
    const date = new Date(rawIso);
    if (Number.isNaN(date.getTime())) return rawIso;
    return date.toISOString().slice(0, 10);
  }

  private isToday(rawIso: string): boolean {
    const date = new Date(rawIso);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  }

  private isThisMonth(rawIso?: string): boolean {
    if (!rawIso) return false;
    const date = new Date(rawIso);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  private isSameDay(rawIso: string | undefined, dayDate: Date): boolean {
    if (!rawIso) return false;
    const date = new Date(rawIso);
    return (
      date.getFullYear() === dayDate.getFullYear() &&
      date.getMonth() === dayDate.getMonth() &&
      date.getDate() === dayDate.getDate()
    );
  }

  private assigneeLabel(assignee: ComplaintAssignee): string {
    if (assignee.type === 'unassigned') return 'Unassigned';
    if (assignee.type === 'admin') return 'Admin';
    return assignee.displayName;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  protected t(key: string): string {
    return this.language.t(key);
  }

}
