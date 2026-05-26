import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-journal-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoDirective],
  template: `
    <div class="form-header-grid" *transloco="let t">
      <div class="form-group">
        <label for="date">{{ t('journal.date') }}</label>
        <input 
          id="date" 
          type="date" 
          [ngModel]="date" 
          (ngModelChange)="dateChange.emit($event)" 
          required />
      </div>

      <div class="form-group">
        <label for="status">{{ t('journal.status') }}</label>
        <select 
          id="status" 
          [ngModel]="status" 
          (ngModelChange)="statusChange.emit($event)">
          <option value="DRAFT">{{ t('journal.status_draft') }}</option>
          <option value="POSTED">{{ t('journal.status_posted') }}</option>
        </select>
      </div>

      <div class="form-group" [ngStyle]="{'visibility': status === 'POSTED' ? 'visible' : 'hidden'}">
        <label for="entryNumber">{{ t('journal.entry_number') }}</label>
        <input 
          id="entryNumber" 
          type="text" 
          [placeholder]="t('journal.entry_number_placeholder')"
          [ngModel]="entryNumber" 
          (ngModelChange)="entryNumberChange.emit($event)" />
      </div>

      <div class="form-group">
        <label for="currency">{{ t('journal.currency') }}</label>
        <select 
          id="currency" 
          [ngModel]="currency" 
          (ngModelChange)="currencyChange.emit($event)">
          <option value="USD">USD - {{ t('journal.currencies.usd') }}</option>
          <option value="ARS">ARS - {{ t('journal.currencies.ars') }}</option>
          <option value="EUR">EUR - {{ t('journal.currencies.eur') }}</option>
          <option value="MXN">MXN - {{ t('journal.currencies.mxn') }}</option>
        </select>
      </div>
    </div>

    <div class="form-group full-width" *transloco="let t">
      <label for="description">{{ t('journal.description') }}</label>
      <textarea 
        id="description" 
        rows="2" 
        [placeholder]="t('journal.description_placeholder')"
        [ngModel]="description" 
        (ngModelChange)="descriptionChange.emit($event)">
      </textarea>
    </div>

    <div class="lines-section" *transloco="let t">
      <h3>{{ t('journal.lines_section') }}</h3>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .form-header-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      margin-bottom: 1.5rem;
    }
    .lines-section {
      margin-top: 2.5rem;
    }
    .lines-section h3 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class JournalEntryFormComponent {
  @Input({ required: true }) date: string = '';
  @Input({ required: true }) description: string = '';
  @Input({ required: true }) entryNumber: string = '';
  @Input({ required: true }) status: 'DRAFT' | 'POSTED' = 'DRAFT';
  @Input({ required: true }) currency: string = 'USD';

  @Output() dateChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() entryNumberChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<'DRAFT' | 'POSTED'>();
  @Output() currencyChange = new EventEmitter<string>();
}
