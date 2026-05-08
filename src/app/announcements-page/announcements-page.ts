import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AnnouncementRecord, AnnouncementService } from '../announcement.service';
import { LanguageCode, LanguageService } from '../language.service';

@Component({
  selector: 'app-announcements-page',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './announcements-page.html',
  styleUrls: ['./announcements-page.css']
})
export class AnnouncementsPage {
  constructor(
    private readonly announcements: AnnouncementService,
    private readonly language: LanguageService
  ) {
    this.reload();
  }

  protected logoFallback = false;
  protected readonly navItems: string[] = ['home', 'announcements', 'resources'];

  protected items: AnnouncementRecord[] = [];
  protected query = '';
  protected priority: 'All' | 'High' | 'Normal' | 'Low' = 'All';

  protected reload(): void {
    this.items = this.announcements.list();
  }

  protected get filtered(): AnnouncementRecord[] {
    const q = this.query.trim().toLowerCase();
    return this.items.filter((a) => {
      if (this.priority !== 'All' && a.priority !== this.priority) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.createdBy.name.toLowerCase().includes(q)
      );
    });
  }

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

  protected formatDateTime(rawIso: string): string {
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
}

