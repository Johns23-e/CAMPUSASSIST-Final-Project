import { Injectable } from '@angular/core';

export type ComplaintPriority = 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'New' | 'In Review' | 'Assigned' | 'In Progress' | 'Resolved';

export type ComplaintAssignee =
  | { type: 'unassigned' }
  | { type: 'admin' }
  | { type: 'officer'; username: string; displayName: string };

export interface ComplaintUpdate {
  id: string;
  createdAt: string;
  createdBy: 'admin' | 'officer';
  actorName: string;
  status: ComplaintStatus;
  message: string;
  proofAttachment?: ComplaintProofAttachment;
}

export interface ComplaintProofAttachment {
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl: string;
}

export interface ComplaintRecord {
  id: string;
  createdAt: string; // ISO
  createdBy: { username: string } | { anonymous: true };
  reporter?: { fullName: string; email: string };
  category: string;
  incidentDate: string;
  location: string;
  summary: string;
  narrative: string;
  requestedAction: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignee: ComplaintAssignee;
  resolvedAt?: string;
  resolutionNotes?: string;
  updates?: ComplaintUpdate[];
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly key = 'campusassist_complaints';

  list(): ComplaintRecord[] {
    return this.read();
  }

  listByCreator(username: string): ComplaintRecord[] {
    const normalized = username.trim().toLowerCase();
    return this.read().filter((c) => 'username' in c.createdBy && c.createdBy.username === normalized);
  }

  create(input: Omit<ComplaintRecord, 'id' | 'createdAt' | 'status' | 'assignee'>): ComplaintRecord {
    const now = new Date();
    const record: ComplaintRecord = {
      ...input,
      id: this.generateId(now),
      createdAt: now.toISOString(),
      status: 'New',
      assignee: { type: 'unassigned' },
      updates: []
    };
    const all = this.read();
    all.unshift(record);
    this.write(all);
    return record;
  }

  assign(id: string, assignee: ComplaintAssignee): void {
    const all = this.read();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx] = {
      ...all[idx],
      assignee,
      status: assignee.type === 'unassigned' ? 'In Review' : 'Assigned'
    };
    this.write(all);
  }

  setStatus(id: string, status: ComplaintStatus): void {
    const all = this.read();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx] = { ...all[idx], status };
    this.write(all);
  }

  resolve(id: string, resolutionNotes: string, resolvedBy: ComplaintAssignee): void {
    const all = this.read();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const actorName =
      resolvedBy.type === 'admin' ? 'Administrator' : resolvedBy.type === 'officer' ? resolvedBy.displayName : 'Staff';
    const update: ComplaintUpdate = {
      id: this.generateUpdateId(),
      createdAt: new Date().toISOString(),
      createdBy: resolvedBy.type === 'officer' ? 'officer' : 'admin',
      actorName,
      status: 'Resolved',
      message: resolutionNotes.trim() || 'Complaint resolved.',
      proofAttachment: undefined
    };

    all[idx] = {
      ...all[idx],
      assignee: resolvedBy,
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNotes: resolutionNotes.trim(),
      updates: [...(all[idx].updates ?? []), update]
    };
    this.write(all);
  }

  addUpdate(
    id: string,
    payload: {
      status: ComplaintStatus;
      message: string;
      proofAttachment?: ComplaintProofAttachment;
      actor: { role: 'admin' | 'officer'; name: string };
    }
  ): void {
    const all = this.read();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;

    const nextStatus = payload.status;
    const update: ComplaintUpdate = {
      id: this.generateUpdateId(),
      createdAt: new Date().toISOString(),
      createdBy: payload.actor.role,
      actorName: payload.actor.name,
      status: nextStatus,
      message: payload.message.trim(),
      proofAttachment: payload.proofAttachment
    };

    all[idx] = {
      ...all[idx],
      status: nextStatus,
      resolvedAt: nextStatus === 'Resolved' ? new Date().toISOString() : all[idx].resolvedAt,
      resolutionNotes: nextStatus === 'Resolved' ? payload.message.trim() : all[idx].resolutionNotes,
      updates: [...(all[idx].updates ?? []), update]
    };
    this.write(all);
  }

  private read(): ComplaintRecord[] {
    if (!this.canUseStorage()) return [];
    const raw = window.localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as ComplaintRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private write(items: ComplaintRecord[]): void {
    if (!this.canUseStorage()) return;
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }

  private generateId(now: Date): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `CAS-${y}${m}${d}-${rand}`;
  }

  private generateUpdateId(): string {
    return `UPD-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}

