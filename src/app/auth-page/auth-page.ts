import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { LanguageCode, LanguageService } from '../language.service';

@Component({
  selector: 'app-auth-page',
  imports: [RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css'
})
export class AuthPage {
  protected mode: 'login' | 'signup' = 'login';
  protected role: 'student' | 'admin' = 'student';
  protected authError = '';
  protected authSuccess = '';
  protected showLoginPassword = false;
  protected showSignupPassword = false;

  private readonly adminUsername = 'johnroque.abina@evsu.edu.ph';
  private readonly adminPassword = 'Admin123';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authState: AuthStateService,
    private readonly language: LanguageService
  ) {
    this.route.data.subscribe((data) => {
      this.mode = (data['mode'] as 'login' | 'signup') ?? 'login';
    });

    this.route.queryParamMap.subscribe((params) => {
      const role = params.get('role');
      this.role = role === 'admin' ? 'admin' : 'student';
    });
  }

  protected setRole(role: 'student' | 'admin'): void {
    this.authError = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { role },
      queryParamsHandling: 'merge'
    });
  }

  protected handleLogin(event: Event, username: string, password: string): void {
    event.preventDefault();
    this.authError = '';
    this.authSuccess = '';

    if (this.role === 'admin') {
      if (username === this.adminUsername && password === this.adminPassword) {
        this.router.navigate(['/admin-dashboard']);
        return;
      }
      this.authError = this.t('invalidAdminCredentials');
      return;
    }

    const result = this.authState.loginStudent(username, password);
    if (!result.ok) {
      this.authError = result.message;
      return;
    }

    this.router.navigate(['/student-dashboard']);
  }

  protected handleSignup(event: Event, fullName: string, username: string, password: string): void {
    event.preventDefault();
    this.authError = '';
    this.authSuccess = '';

    const result = this.authState.registerStudent(fullName, username, password);
    if (!result.ok) {
      this.authError = result.message;
      return;
    }

    this.authSuccess = result.message;
    this.router.navigate(['/login'], { queryParams: { role: this.role } });
  }

  protected toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  protected toggleSignupPasswordVisibility(): void {
    this.showSignupPassword = !this.showSignupPassword;
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
}
