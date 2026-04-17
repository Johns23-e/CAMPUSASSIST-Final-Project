import { Injectable } from '@angular/core';

interface RegisteredStudent {
  fullName: string;
  evsuId: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly registeredStudentsKey = 'campusassist_registered_students';
  private readonly currentStudentKey = 'campusassist_current_student';
  private readonly defaultStudents: RegisteredStudent[] = [
    {
      fullName: 'JOHN ROQUE ABINA',
      evsuId: '2026-00001',
      username: 'johnroque.abina@evsu.edu.ph',
      password: 'John@123'
    },
    {
      fullName: 'MALQUISTO CHERWYN',
      evsuId: '2026-00002',
      username: 'cherwyn.malquisto@evsu.edu.ph',
      password: 'Cherwyn@123'
    },
    {
      fullName: 'JOANNA MAE MAGTABOG',
      evsuId: '2026-00003',
      username: 'joannamae.magtobog@evsu.edu.ph',
      password: 'Joanna@123'
    }
  ];

  registerStudent(fullName: string, evsuId: string, username: string, password: string): { ok: boolean; message: string } {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEvsuId = evsuId.trim();
    if (!fullName.trim() || !normalizedEvsuId || !normalizedUsername || !password.trim()) {
      return { ok: false, message: 'Please complete all required signup fields.' };
    }

    const students = this.getRegisteredStudents();
    const exists = students.some((student) => student.username === normalizedUsername);
    if (exists) {
      return { ok: false, message: 'This account is already registered. Please log in instead.' };
    }

    students.push({
      fullName: fullName.trim(),
      evsuId: normalizedEvsuId,
      username: normalizedUsername,
      password: password.trim()
    });
    this.saveRegisteredStudents(students);
    return { ok: true, message: 'Account created successfully. You can now sign in.' };
  }

  loginStudent(username: string, password: string): { ok: boolean; message: string } {
    const normalizedUsername = username.trim().toLowerCase();
    const students = this.getRegisteredStudents();
    const match = students.find((student) => student.username === normalizedUsername && student.password === password.trim());

    if (!match) {
      return { ok: false, message: 'Account not found or invalid credentials. Please register first.' };
    }

    this.setCurrentStudent(match.username);
    return { ok: true, message: 'Login successful.' };
  }

  getCurrentStudent(): string | null {
    if (!this.canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(this.currentStudentKey);
  }

  getCurrentStudentName(): string | null {
    const current = this.getCurrentStudent();
    if (!current) {
      return null;
    }

    const match = this.getRegisteredStudents().find((student) => student.username === current);
    return match?.fullName ?? null;
  }

  isRegistered(username: string): boolean {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) {
      return false;
    }

    return this.getRegisteredStudents().some((student) => student.username === normalizedUsername);
  }

  getRegisteredStudent(username: string): RegisteredStudent | null {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername) return null;
    return this.getRegisteredStudents().find((student) => student.username === normalizedUsername) ?? null;
  }

  logoutStudent(): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(this.currentStudentKey);
  }

  listRegisteredStudents(): RegisteredStudent[] {
    return this.getRegisteredStudents();
  }

  removeRegisteredStudent(username: string): void {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || !this.canUseStorage()) return;
    const students = this.getRegisteredStudents().filter((s) => s.username !== normalizedUsername);
    this.saveRegisteredStudents(students);
    if (this.getCurrentStudent() === normalizedUsername) {
      this.logoutStudent();
    }
  }

  private setCurrentStudent(username: string): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.setItem(this.currentStudentKey, username);
  }

  private getRegisteredStudents(): RegisteredStudent[] {
    if (!this.canUseStorage()) {
      return [...this.defaultStudents];
    }

    const raw = window.localStorage.getItem(this.registeredStudentsKey);
    if (!raw) {
      return [...this.defaultStudents];
    }

    try {
      const parsed = JSON.parse(raw) as RegisteredStudent[];
      if (!Array.isArray(parsed)) {
        return [...this.defaultStudents];
      }

      const byUsername = new Set(parsed.map((s) => s.username));
      const mergedDefaults = this.defaultStudents.filter((d) => !byUsername.has(d.username));
      return [...mergedDefaults, ...parsed];
    } catch {
      return [...this.defaultStudents];
    }
  }

  private saveRegisteredStudents(students: RegisteredStudent[]): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.setItem(this.registeredStudentsKey, JSON.stringify(students));
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
