import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { LanguageCode, LanguageService } from '../language.service';
import { StaffAuthService } from '../staff-auth.service';

@Component({
  selector: 'app-auth-page',
  imports: [RouterLink],
  templateUrl: './auth-page.html',
  styleUrls: ['./auth-page.css']
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
  private readonly officerUsername = 'johnroque.abina@evsu.edu.ph';
  private readonly officerPassword = 'Vicepresident';
  private readonly officerDisplayName = 'Vicepresident';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authState: AuthStateService,
    private readonly staffAuth: StaffAuthService,
    private readonly language: LanguageService
  ) {
    this.route.data.subscribe((data) => {
      this.mode = (data['mode'] as 'login' | 'signup') ?? 'login';
      if (this.mode === 'signup') {
        this.role = 'student';
      }
    });

    this.route.queryParamMap.subscribe((params) => {
      const role = params.get('role');
      if (this.mode === 'signup') {
        this.role = 'student';
        return;
      }
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
        this.staffAuth.setSession({ role: 'admin', username: this.adminUsername, displayName: 'Administrator' });
        this.router.navigate(['/admin-dashboard']);
        return;
      }
      if (username === this.officerUsername && password === this.officerPassword) {
        this.staffAuth.setSession({
          role: 'officer',
          username: this.officerUsername,
          displayName: this.officerDisplayName
        });
        this.router.navigate(['/officer-dashboard']);
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

  protected handleSignup(event: Event, fullName: string, evsuId: string, username: string, password: string): void {
    event.preventDefault();
    this.authError = '';
    this.authSuccess = '';

    const result = this.authState.registerStudent(fullName, evsuId, username, password);
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
