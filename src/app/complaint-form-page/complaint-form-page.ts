import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../auth-state.service';
import { ComplaintService } from '../complaint.service';

@Component({
  selector: 'app-complaint-form-page',
  imports: [RouterLink],
  templateUrl: './complaint-form-page.html',
  styleUrls: ['./complaint-form-page.css']
})
export class ComplaintFormPage {
  protected currentStep: 1 | 2 | 3 = 1;
  protected draft = {
    reporterEmail: '',
    reporterFullName: '',
    category: '',
    incidentDate: '',
    location: '',
    summary: '',
    narrative: '',
    requestedAction: '',
    priority: 'Medium'
  };
  protected currentUsername = '';
  protected verifiedEmail = '';
  protected registrationChecked = false;
  protected isRegisteredUser = false;
  protected submitAnonymously = false;
  protected statusMessage = '';
  protected statusType: 'idle' | 'error' | 'success' = 'idle';
  protected complaintSubmitted = false;

  constructor(
    private readonly authState: AuthStateService,
    private readonly complaints: ComplaintService,
    private readonly router: Router
  ) {
    this.currentUsername = this.authState.getCurrentStudent() ?? '';
    if (this.currentUsername) {
      this.draft.reporterEmail = this.currentUsername;
    }
  }

  protected checkRegistrationStatus(): void {
    this.registrationChecked = true;
    this.complaintSubmitted = false;

    const email = (this.draft.reporterEmail || this.currentUsername).trim().toLowerCase();
    if (!email) {
      this.isRegisteredUser = false;
      this.statusType = 'error';
      this.statusMessage = 'Please enter your registered student email to continue.';
      return;
    }

    this.isRegisteredUser = this.authState.isRegistered(email);
    if (!this.isRegisteredUser) {
      this.statusType = 'error';
      this.statusMessage = 'This account is not registered yet. Please create an account first.';
      return;
    }

    const student = this.authState.getRegisteredStudent(email);
    this.verifiedEmail = email;
    this.draft.reporterEmail = email;
    this.draft.reporterFullName = student?.fullName ?? this.draft.reporterFullName;

    this.statusType = 'success';
    this.statusMessage = `Account verified. Welcome${student?.fullName ? `, ${student.fullName}` : ''}.`;
    if (this.currentStep === 1) {
      this.currentStep = 2;
    }
  }

  protected goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
  }

  protected goToStep(step: 1 | 2 | 3): void {
    if (step > 1 && (!this.registrationChecked || !this.isRegisteredUser)) {
      this.statusType = 'error';
      this.statusMessage = 'Please verify your account first before continuing.';
      return;
    }
    this.currentStep = step;
  }

  protected continueToDetails(): void {
    this.goToStep(2);
  }

  protected continueToReview(): void {
    this.goToStep(3);
  }

  protected backToInfo(): void {
    this.currentStep = 1;
  }

  protected backToDetails(): void {
    this.currentStep = 2;
  }

  protected submitComplaint(event: Event): void {
    event.preventDefault();
    if (!this.registrationChecked || !this.isRegisteredUser) {
      this.statusType = 'error';
      this.statusMessage = 'Please verify registration before submitting your complaint.';
      return;
    }

    const createdBy = this.submitAnonymously
      ? ({ anonymous: true } as const)
      : ({ username: (this.verifiedEmail || this.draft.reporterEmail || this.currentUsername).trim().toLowerCase() } as const);

    const priority = this.draft.priority === 'High' || this.draft.priority === 'Low' ? this.draft.priority : 'Medium';

    this.complaints.create({
      createdBy,
      reporter: this.submitAnonymously
        ? undefined
        : {
            fullName: this.draft.reporterFullName.trim() || 'Student',
            email: (this.verifiedEmail || this.draft.reporterEmail).trim().toLowerCase()
          },
      category: this.draft.category.trim(),
      incidentDate: this.draft.incidentDate,
      location: this.draft.location.trim(),
      summary: this.draft.summary.trim(),
      narrative: this.draft.narrative.trim(),
      requestedAction: this.draft.requestedAction.trim(),
      priority
    });

    this.complaintSubmitted = true;
    this.statusType = 'success';
    this.statusMessage = 'Complaint submitted successfully. Your case has been received for review.';
  }

  protected setAnonymousMode(enabled: boolean): void {
    this.submitAnonymously = enabled;
  }
}
