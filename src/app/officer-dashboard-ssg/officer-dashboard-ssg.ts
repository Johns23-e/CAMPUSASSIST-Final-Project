import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ComplaintProofAttachment, ComplaintRecord, ComplaintService, ComplaintStatus } from '../complaint.service';
import { LanguageService } from '../language.service';
import { StaffAuthService } from '../staff-auth.service';

type SsgSection = 'dashboard' | 'assigned' | 'inProgress' | 'resolved' | 'reports' | 'profile';

@Component({
  selector: 'app-officer-dashboard-ssg',
  templateUrl: './officer-dashboard-ssg.html',
  styleUrls: ['./officer-dashboard-ssg.css']
})
export class OfficerDashboardSsg {
  constructor(
    private readonly language: LanguageService,
    private readonly staffAuth: StaffAuthService,
    private readonly complaintService: ComplaintService,
    private readonly router: Router
  ) {
    this.reload();
  }

  protected selectedSection: SsgSection = 'dashboard';
  protected statusDraft: Record<string, ComplaintStatus> = {};
  protected noteDraft: Record<string, string> = {};
  protected proofDraft: Record<string, ComplaintProofAttachment | undefined> = {};
  protected uploadErrorDraft: Record<string, string> = {};
  protected complaints: ComplaintRecord[] = [];

  protected readonly sidebarLinks: Array<{ key: SsgSection; label: string }> = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'assigned', label: 'My Assignments' },
    { key: 'inProgress', label: 'In-Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'reports', label: 'Reports' },
    { key: 'profile', label: 'Officer Profile' }
  ];

  protected logout(): void {
    this.staffAuth.logout();
    this.router.navigate(['/login'], { queryParams: { role: 'admin' } });
  }

  protected reload(): void {
    this.complaints = this.complaintService.list();
  }

  protected selectSection(section: SsgSection): void {
    this.selectedSection = section;
  }

  protected isSection(section: SsgSection): boolean {
    return this.selectedSection === section;
  }

  protected get officerUsername(): string {
    return this.staffAuth.getSession()?.username ?? '';
  }

  protected get officerName(): string {
    return this.staffAuth.getSession()?.displayName ?? 'SSG Officer';
  }

  protected get myAssignedComplaints(): ComplaintRecord[] {
    const me = this.officerUsername;
    return this.complaints.filter((c) => c.assignee.type === 'officer' && c.assignee.username === me);
  }

  protected get myInProgressComplaints(): ComplaintRecord[] {
    return this.myAssignedComplaints.filter((c) => c.status === 'Assigned' || c.status === 'In Review' || c.status === 'In Progress');
  }

  protected get myResolvedComplaints(): ComplaintRecord[] {
    return this.myAssignedComplaints.filter((c) => c.status === 'Resolved');
  }

  protected get metrics(): Array<{ label: string; value: string; meta: string; tone: string }> {
    const assigned = this.myAssignedComplaints.length;
    const active = this.myInProgressComplaints.length;
    const resolved = this.myResolvedComplaints.length;
    const highPriority = this.myInProgressComplaints.filter((c) => c.priority === 'High').length;
    const avgDays = this.averageResolutionDays.toFixed(1);
    const completion = assigned === 0 ? 0 : Math.round((resolved / assigned) * 100);

    return [
      { label: 'Assigned to Me', value: `${assigned}`, meta: 'Total workload', tone: 'brick' },
      { label: 'Active Cases', value: `${active}`, meta: 'Needs action', tone: 'gold' },
      { label: 'Resolved by Me', value: `${resolved}`, meta: `${completion}% completion`, tone: 'green' },
      { label: 'High Priority Open', value: `${highPriority}`, meta: 'Escalate quickly', tone: 'maroon' },
      { label: 'Avg Resolution Time', value: `${avgDays} days`, meta: 'Officer performance', tone: 'dark' },
      { label: 'Officer Satisfaction', value: `${Math.min(98, 74 + completion)}%`, meta: 'Service quality index', tone: 'light' }
    ];
  }

  protected get weeklyIntake(): Array<{ day: string; received: number; resolved: number }> {
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
      const received = this.myAssignedComplaints.filter((c) => this.isSameDay(c.createdAt, dayDate)).length;
      const resolved = this.myAssignedComplaints.filter((c) => this.isSameDay(c.resolvedAt, dayDate)).length;
      result.push({ day: label, received, resolved });
    }
    return result;
  }

  protected get maxWeeklyValue(): number {
    return Math.max(1, ...this.weeklyIntake.flatMap((item) => [item.received, item.resolved]));
  }

  protected get topCategories(): Array<{ name: string; value: number; tone: string }> {
    const tones = ['#7f0000', '#a73a2e', '#c79b2d', '#d8b97a', '#6f9f74', '#7fb089', '#a6bccb'];
    if (this.myAssignedComplaints.length === 0) {
      return [{ name: 'No assigned data', value: 0, tone: '#a6bccb' }];
    }
    const total = this.myAssignedComplaints.length;
    const counts = new Map<string, number>();
    for (const complaint of this.myAssignedComplaints) {
      counts.set(complaint.category, (counts.get(complaint.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        tone: tones[index % tones.length]
      }));
  }

  protected get recentNotes(): string[] {
    if (this.myAssignedComplaints.length === 0) {
      return ['No officer assignments yet.'];
    }
    return this.myAssignedComplaints
      .slice(0, 4)
      .map((c) => `${c.id}: ${c.status} - ${c.summary}`);
  }

  protected get averageResolutionDays(): number {
    const resolved = this.myResolvedComplaints.filter((c) => !!c.resolvedAt);
    if (resolved.length === 0) return 0;
    const totalDays = resolved.reduce((sum, c) => {
      const created = new Date(c.createdAt).getTime();
      const done = new Date(c.resolvedAt as string).getTime();
      return sum + Math.max(0, (done - created) / (1000 * 60 * 60 * 24));
    }, 0);
    return totalDays / resolved.length;
  }

  protected updateStatus(id: string, value: string): void {
    const status = value as ComplaintStatus;
    if (!['In Review', 'In Progress', 'Resolved'].includes(status)) return;
    if (status === 'Resolved') {
      this.resolveCase(id);
      return;
    }
    const note = (this.noteDraft[id] ?? '').trim();
    if (!note) return;
    this.complaintService.addUpdate(id, {
      status,
      message: note,
      proofAttachment: this.proofDraft[id],
      actor: { role: 'officer', name: this.officerName }
    });
    this.noteDraft[id] = '';
    this.proofDraft[id] = undefined;
    this.uploadErrorDraft[id] = '';
    this.reload();
  }

  protected setNoteDraft(id: string, value: string): void {
    this.noteDraft[id] = value;
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

  protected resolveCase(id: string): void {
    const note = (this.noteDraft[id] ?? '').trim() || `Resolved by ${this.officerName} (SSG).`;
    this.complaintService.addUpdate(id, {
      status: 'Resolved',
      message: note,
      proofAttachment: this.proofDraft[id],
      actor: { role: 'officer', name: this.officerName }
    });
    this.noteDraft[id] = '';
    this.proofDraft[id] = undefined;
    this.uploadErrorDraft[id] = '';
    this.reload();
  }

  protected assigneeLabel(record: ComplaintRecord): string {
    if (record.assignee.type === 'unassigned') return 'Unassigned';
    if (record.assignee.type === 'admin') return 'Admin';
    return record.assignee.displayName;
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

  protected formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

