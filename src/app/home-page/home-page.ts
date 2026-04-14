import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LanguageCode, LanguageService } from '../language.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: '../app.css'
})
export class HomePage {
  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly language: LanguageService
  ) {
    this.schoolPagesSafe = this.schoolPages.map((page) => ({
      ...page,
      safeEmbed: this.sanitizer.bypassSecurityTrustResourceUrl(page.embed)
    }));
  }

  protected logoFallback = false;

  protected readonly navItems: string[] = [
    'home',
    'lodgeComplaint',
    'trackStatus',
    'announcements',
    'resources'
  ];

  protected readonly howItWorks = [
    {
      icon: 'user',
      title: '1. Log In',
      description: 'Sign in with your registered campus account to access a secure and personalized complaint dashboard.'
    },
    {
      icon: 'document',
      title: '2. Submit Details',
      description: 'Describe your concern clearly, attach supporting files, and choose the right category for faster routing.'
    },
    {
      icon: 'chart',
      title: '3. Track Progress',
      description: 'Monitor progress through real-time status updates, office responses, and action history.'
    },
    {
      icon: 'check',
      title: '4. Resolution',
      description: 'Review the final resolution, confirm completion, and provide feedback on the service experience.'
    }
  ];

  protected readonly announcements: string[] = [
    'Scheduled Maintenance: Saturday, 10:00 PM - 12:00 AM',
    'Academic Appeals Policy Update: New Guidelines Published',
    'Campus Safety Bulletin: Emergency Contacts and Response Protocols'
  ];

  protected readonly overviewMetrics = [
    { icon: 'bolt', text: 'Fast routing to the correct office within the same reporting workflow.' },
    { icon: 'shield', text: 'Secure and confidential handling of all submitted concerns.' },
    { icon: 'file', text: 'Complete case timeline with clear status records and response history.' }
  ];

  protected readonly supportHighlights = [
    { icon: 'pin', text: 'Central Student Services receives and triages complaints.' },
    { icon: 'clock', text: 'Target first response time: within 24 to 48 working hours.' },
    { icon: 'handshake', text: 'Follow-up and resolution confirmation are built into each case flow.' }
  ];

  protected readonly aboutHighlights: string[] = [
    'Centralized platform for students, faculty, and staff to submit and manage concerns securely.',
    'Promotes transparency through clear timelines, status visibility, and documented case actions.',
    'Improves response efficiency by routing each report directly to the appropriate office.'
  ];

  protected readonly schoolPages = [
    {
      title: 'EVSU Dulag Campus',
      subtitle: 'Official Campus Page',
      link: 'https://www.facebook.com/EVSUDC',
      embed:
        'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FEVSUDC&tabs=timeline&width=500&height=420&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId'
    },
    {
      title: 'EVSU DC SSG',
      subtitle: 'Supreme Student Government',
      link: 'https://www.facebook.com/evsudcssg',
      embed:
        'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fevsudcssg&tabs=timeline&width=500&height=420&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId'
    },
    {
      title: 'InTel',
      subtitle: 'Campus InTel Page',
      link: 'https://www.facebook.com/profile.php?id=61566344713183',
      embed:
        'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61566344713183&tabs=timeline&width=500&height=420&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId'
    }
  ];

  protected schoolPagesSafe: Array<{
    title: string;
    subtitle: string;
    link: string;
    embed: string;
    safeEmbed: SafeResourceUrl;
  }> = [];

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
