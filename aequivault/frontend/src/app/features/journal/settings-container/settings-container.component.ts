import { Component, Input, inject, signal, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TranslationStateService } from '../../../core/services/translation-state.service';

@Component({
  selector: 'app-settings-container',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoDirective],
  template: `
    <div class="settings-wrapper" *transloco="let t">
      <div class="settings-header">
        <h2>{{ t('settings.title') }}</h2>
      </div>

      <div class="settings-grid">
        <!-- i18n settings card -->
        <div class="settings-card glass-panel">
          <div class="card-header">
            <h3>🌐 {{ t('settings.language_section') }}</h3>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ t('settings.language_desc') }}</p>
            <div class="control-group">
              <label for="langSelect">{{ t('settings.select_language') }}</label>
              <select 
                id="langSelect" 
                [ngModel]="translationState.activeLanguage()" 
                (ngModelChange)="onLanguageChange($event)"
                class="settings-select">
                <option value="en">English (EN)</option>
                <option value="es">Español (ES)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tenant info card -->
        <div class="settings-card glass-panel">
          <div class="card-header">
            <h3>🏢 {{ t('settings.tenant_section') }}</h3>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ t('settings.tenant_desc') }}</p>
            <div class="info-row">
              <span class="info-label">ID:</span>
              <code class="info-value">{{ tenantId }}</code>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('settings.tenant_name') }}:</span>
              <strong class="info-value">
                {{ tenantId === '212f7927-ed0d-495c-b39b-94364d5e2f9b' ? t('tenant.tenant_a') : t('tenant.tenant_b') }}
              </strong>
            </div>
          </div>
        </div>

        <!-- UI theme customization card -->
        <div class="settings-card glass-panel">
          <div class="card-header">
            <h3>🎨 {{ t('settings.theme_section') }}</h3>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ t('settings.theme_desc') }}</p>
            <div class="control-group">
              <button 
                type="button" 
                (click)="toggleTheme()" 
                class="btn btn-secondary btn-theme">
                {{ isDarkMode() ? '☀️ ' + t('settings.light_mode') : '🌙 ' + t('settings.dark_mode') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-wrapper {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .settings-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .settings-card {
      padding: 1.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
    }
    .card-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0 0 1.25rem 0;
      line-height: 1.4;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .control-group label {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .settings-select {
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: #ffffff;
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
      outline: none;
      transition: var(--transition-smooth);
      cursor: pointer;
      font-family: var(--font-family);
    }
    .settings-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    }
    .settings-select option {
      background-color: var(--bg-secondary);
      color: #ffffff;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.9rem;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #94a3b8;
    }
    .info-value {
      color: #ffffff;
    }
    code.info-value {
      font-family: monospace;
      font-size: 0.8rem;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .btn {
      padding: 0.6rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: var(--transition-smooth);
      font-family: var(--font-family);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .btn-theme {
      width: 100%;
    }
  `]
})
export class SettingsContainerComponent {
  @Input({ required: true }) tenantId!: string;

  translationState = inject(TranslationStateService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  
  private _darkMode = signal<boolean>(true);

  onLanguageChange(lang: 'en' | 'es') {
    this.translationState.setLanguage(lang);
  }

  isDarkMode() {
    return this._darkMode();
  }

  toggleTheme() {
    this._darkMode.update(val => !val);
    const body = this.document.body;
    if (this._darkMode()) {
      this.renderer.removeClass(body, 'light-theme');
      this.renderer.addClass(body, 'dark-theme');
    } else {
      this.renderer.removeClass(body, 'dark-theme');
      this.renderer.addClass(body, 'light-theme');
    }
  }
}
