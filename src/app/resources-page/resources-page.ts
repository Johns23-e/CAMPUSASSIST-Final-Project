import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageCode, LanguageService } from '../language.service';

@Component({
  selector: 'app-resources-page',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './resources-page.html',
  styleUrls: ['./resources-page.css']
})
export class ResourcesPage {
  constructor(private readonly language: LanguageService) {}

  protected logoFallback = false;
  protected readonly navItems: string[] = ['home', 'announcements', 'resources'];

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

