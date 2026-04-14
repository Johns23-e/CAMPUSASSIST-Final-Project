import { Injectable } from '@angular/core';

interface RegisteredStudent {
  fullName: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly registeredStudentsKey = 'campusassist_registered_students';
  private readonly currentStudentKey = 'campusassist_current_student';
  private readonly defaultStudent: RegisteredStudent = {
    fullName: 'John Roque Abina',
    username: 'johnroque.abina@evsu.edu.ph',
    password: 'John@123'
  };

  registerStudent(fullName: string, username: string, password: string): { ok: boolean; message: string } {
    const normalizedUsername = username.trim().toLowerCase();
    if (!fullName.trim() || !normalizedUsername || !password.trim()) {
      return { ok: false, message: 'Please complete all required signup fields.' };
    }

    const students = this.getRegisteredStudents();
    const exists = students.some((student) => student.username === normalizedUsername);
    if (exists) {
      return { ok: false, message: 'This account is already registered. Please log in instead.' };
    }

    students.push({
      fullName: fullName.trim(),
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

  logoutStudent(): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(this.currentStudentKey);
  }

  private setCurrentStudent(username: string): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.setItem(this.currentStudentKey, username);
  }

  private getRegisteredStudents(): RegisteredStudent[] {
    if (!this.canUseStorage()) {
      return [this.defaultStudent];
    }

    const raw = window.localStorage.getItem(this.registeredStudentsKey);
    if (!raw) {
      return [this.defaultStudent];
    }

    try {
      const parsed = JSON.parse(raw) as RegisteredStudent[];
      if (!Array.isArray(parsed)) {
        return [this.defaultStudent];
      }

      const hasDefault = parsed.some((student) => student.username === this.defaultStudent.username);
      return hasDefault ? parsed : [this.defaultStudent, ...parsed];
    } catch {
      return [this.defaultStudent];
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
