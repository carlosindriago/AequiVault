import { Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslationStateService {
  readonly activeLanguage = signal<'en' | 'es'>('en');

  constructor(private translocoService: TranslocoService) {
    const active = this.translocoService.getActiveLang();
    if (active === 'en' || active === 'es') {
      this.activeLanguage.set(active);
    }
  }

  setLanguage(lang: 'en' | 'es'): void {
    this.activeLanguage.set(lang);
    this.translocoService.setActiveLang(lang);
  }
}
