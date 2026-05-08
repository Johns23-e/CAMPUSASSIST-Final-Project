import { Injectable } from '@angular/core';

export type AnnouncementPriority = 'High' | 'Normal' | 'Low';
export type AnnouncementAuthorRole = 'admin' | 'officer';

export interface AnnouncementAttachment {
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl: string;
}

export interface AnnouncementRecord {
  id: string;
  createdAt: string;
  createdBy: { role: AnnouncementAuthorRole; name: string };
  priority: AnnouncementPriority;
  title: string;
  message: string;
  attachments?: AnnouncementAttachment[];
}

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly key = 'campusassist_announcements';

  list(): AnnouncementRecord[] {
    return this.read();
  }

  create(input: Omit<AnnouncementRecord, 'id' | 'createdAt'>): AnnouncementRecord {
    const now = new Date();
    const record: AnnouncementRecord = {
      ...input,
      id: this.generateId(now),
      createdAt: now.toISOString(),
      attachments: input.attachments ?? []
    };
    const all = this.read();
    all.unshift(record);
    this.write(all);
    return record;
  }

  private read(): AnnouncementRecord[] {
    if (!this.canUseStorage()) return [];
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as AnnouncementRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private write(items: AnnouncementRecord[]): void {
    if (!this.canUseStorage()) return;
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }

  private generateId(now: Date): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `ANN-${y}${m}${d}-${rand}`;
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}

