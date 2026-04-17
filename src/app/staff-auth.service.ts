import { Injectable } from '@angular/core';

export type StaffRole = 'admin' | 'officer';

export interface StaffSession {
  role: StaffRole;
  username: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class StaffAuthService {
  private readonly staffSessionKey = 'campusassist_staff_session';

  setSession(session: StaffSession): void {
    if (!this.canUseStorage()) return;
    window.localStorage.setItem(this.staffSessionKey, JSON.stringify(session));
  }

  getSession(): StaffSession | null {
    if (!this.canUseStorage()) return null;
    const raw = window.localStorage.getItem(this.staffSessionKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StaffSession;
    } catch {
      return null;
    }
  }

  logout(): void {
    if (!this.canUseStorage()) return;
    window.localStorage.removeItem(this.staffSessionKey);
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}

