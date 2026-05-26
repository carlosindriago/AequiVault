import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-journal-entry-summary',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  template: `
    <div class="summary-card" *transloco="let t">
      <div class="totals-grid">
        <div class="total-box">
          <span class="label">{{ t('journal.total_debit') }}</span>
          <span class="value text-debit">{{ debitSum | currency: currency }}</span>
        </div>
        <div class="total-box">
          <span class="label">{{ t('journal.total_credit') }}</span>
          <span class="value text-credit">{{ creditSum | currency: currency }}</span>
        </div>
        <div class="total-box">
          <span class="label">{{ t('journal.diff') }}</span>
          <span class="value" [ngClass]="difference === 0 ? 'text-balanced' : 'text-danger'">
            {{ difference | currency: currency }}
          </span>
        </div>
      </div>
      
      <div class="status-panel" [ngClass]="isBalanced ? 'status-balanced' : 'status-unbalanced'">
        <div class="status-icon">
          @if (isBalanced) {
            ✓
          } @else {
            ⚠️
          }
        </div>
        <div class="status-text">
          @if (isBalanced) {
            <strong>{{ t('journal.balanced_title') }}</strong>
            <p>{{ t('journal.balanced_desc') }}</p>
          } @else {
            <strong>{{ t('journal.unbalanced_title') }}</strong>
            <p>{{ t('journal.unbalanced_desc') }}</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-card {
      margin-top: 1.5rem;
      padding: 1.5rem;
      border-radius: var(--radius-md);
      background: rgba(20, 27, 45, 0.4);
      border: 1px solid var(--border-glass);
    }
    .totals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .total-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .total-box .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .total-box .value {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .text-debit {
      color: #34d399;
    }
    .text-credit {
      color: #fb7185;
    }
    .text-balanced {
      color: var(--text-primary);
    }
    .text-danger {
      color: var(--color-danger);
    }
    .status-panel {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      line-height: 1.4;
      transition: var(--transition-smooth);
    }
    .status-balanced {
      background-color: var(--color-success-bg);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #a7f3d0;
    }
    .status-balanced .status-icon {
      background: var(--color-success);
      color: white;
    }
    .status-unbalanced {
      background-color: var(--color-danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
    .status-unbalanced .status-icon {
      background: var(--color-danger);
      color: white;
    }
    .status-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: bold;
      font-size: 0.8rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .status-text strong {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 0.1rem;
    }
    .status-text p {
      opacity: 0.85;
    }
  `]
})
export class JournalEntrySummaryComponent {
  @Input({ required: true }) debitSum: number = 0;
  @Input({ required: true }) creditSum: number = 0;
  @Input({ required: true }) difference: number = 0;
  @Input({ required: true }) isBalanced: boolean = false;
  @Input({ required: true }) currency: string = 'USD';
}
