import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';

@Component({
  selector: 'app-complaint-form-page',
  imports: [RouterLink],
  templateUrl: './complaint-form-page.html',
  styleUrl: './complaint-form-page.css'
})
export class ComplaintFormPage {
  protected currentUsername = '';
  protected registrationChecked = false;
  protected isRegisteredUser = false;
  protected submitAnonymously = false;
  protected statusMessage = '';
  protected statusType: 'idle' | 'error' | 'success' = 'idle';
  protected complaintSubmitted = false;

  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router
  ) {
    this.currentUsername = this.authState.getCurrentStudent() ?? '';
  }

  protected checkRegistrationStatus(): void {
    this.registrationChecked = true;
    this.complaintSubmitted = false;

    if (!this.currentUsername) {
      this.isRegisteredUser = false;
      this.statusType = 'error';
      this.statusMessage = 'No active student session found. Please log in first to continue.';
      return;
    }

    this.isRegisteredUser = this.authState.isRegistered(this.currentUsername);
    if (!this.isRegisteredUser) {
      this.statusType = 'error';
      this.statusMessage = 'This account is not registered yet. Please create an account first.';
      return;
    }

    this.statusType = 'success';
    this.statusMessage = 'Registration verified. You can now proceed to submit your complaint.';
  }

  protected goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
  }

  protected submitComplaint(event: Event): void {
    event.preventDefault();
    if (!this.registrationChecked || !this.isRegisteredUser) {
      this.statusType = 'error';
      this.statusMessage = 'Please verify registration before submitting your complaint.';
      return;
    }

    this.complaintSubmitted = true;
    this.statusType = 'success';
    this.statusMessage = 'Complaint submitted successfully. Your case has been received for review.';
  }

  protected setAnonymousMode(enabled: boolean): void {
    this.submitAnonymously = enabled;
  }
}
