import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { FinancialReportLineDto } from '../../../../core/models/report.model';

@Component({
  selector: 'app-balance-sheet-report',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  template: `
    <div class="table-container glass-panel" *transloco="let t">
      <table>
        <thead>
          <tr>
            <th>{{ t('reports.code') }}</th>
            <th>{{ t('reports.account') }}</th>
            <th class="amount-col">{{ t('reports.net_balance') }}</th>
          </tr>
        </thead>
        <tbody>
          @if (lines.length === 0) {
            <tr>
              <td colspan="3" class="empty-state">{{ t('reports.no_data') }}</td>
            </tr>
          } @else {
            @for (row of lines; track row.code) {
              <tr class="report-row" [class.group-row]="row.isGroup">
                <td class="code-cell" [class.group-code]="row.isGroup">{{ row.code }}</td>
                <td class="name-cell">
                  <span [style.padding-left.px]="row.depth * 20" class="indented-name" [class.group-name]="row.isGroup">
                    {{ row.name }}
                  </span>
                </td>
                <td class="amount-col balance-cell" [class.negative-balance]="row.balance < 0" [class.group-balance]="row.isGroup">
                  {{ row.balance | currency: currency }}
                </td>
              </tr>
            }
          }
        </tbody>
        @if (lines.length > 0) {
          <tfoot>
            <tr class="summary-total-row">
              <td colspan="2" class="totals-label">{{ t('dashboard.assets') }}</td>
              <td class="amount-col total-val">{{ totalAssets | currency: currency }}</td>
            </tr>
            <tr class="summary-total-row">
              <td colspan="2" class="totals-label">{{ t('dashboard.liabilities') }}</td>
              <td class="amount-col total-val">{{ totalLiabilities | currency: currency }}</td>
            </tr>
            <tr class="summary-total-row">
              <td colspan="2" class="totals-label">{{ t('dashboard.equity') }}</td>
              <td class="amount-col total-val">{{ totalEquity | currency: currency }}</td>
            </tr>
            <tr class="summary-final-row">
              <td colspan="2" class="totals-label">{{ t('reports.total') }} ({{ t('dashboard.liabilities') }} + {{ t('dashboard.equity') }})</td>
              <td class="amount-col total-val">{{ (totalLiabilities + totalEquity) | currency: currency }}</td>
            </tr>
          </tfoot>
        }
      </table>
    </div>

    @if (lines.length > 0) {
      <div class="status-summary-bar" *transloco="let t">
        <div class="status-pill" [class.balanced]="isBalanced()">
          <span class="status-icon">
            @if (isBalanced()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else {
              ⚠️
            }
          </span>
          <span class="status-text">
            {{ t('reports.balance_status') }}: {{ isBalanced() ? t('reports.balanced_sheet') : t('reports.unbalanced_sheet') }}
          </span>
        </div>
      </div>
    }
  `,
  styles: [`
    .table-container {
      padding: 1.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: transparent;
      padding: 1rem 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
      font-family: var(--font-family);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 0.85rem 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      vertical-align: middle;
      font-size: 0.95rem;
      color: #f8fafc;
    }
    .report-row {
      transition: background-color 0.2s;
    }
    .report-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .group-row {
      background: rgba(255, 255, 255, 0.01);
    }
    .code-cell {
      font-family: monospace;
      color: #3b82f6;
      font-weight: 500;
      width: 120px;
    }
    .group-code {
      font-weight: 700;
      color: #a78bfa;
    }
    .indented-name {
      display: inline-block;
      transition: padding-left 0.2s;
    }
    .group-name {
      font-weight: 700;
      color: #f1f5f9;
    }
    .amount-col {
      width: 180px;
      text-align: right;
      font-family: monospace;
      font-weight: 500;
    }
    th.amount-col {
      text-align: right;
    }
    .balance-cell {
      font-weight: 500;
    }
    .group-balance {
      font-weight: 700;
      color: #ffffff;
    }
    .negative-balance {
      color: #ef4444 !important;
    }
    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 3rem 0;
      font-style: italic;
    }
    .summary-total-row td {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
      color: #cbd5e1;
      padding: 0.75rem 0.75rem;
    }
    .summary-final-row td {
      border-top: 2px solid rgba(255, 255, 255, 0.2);
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      font-weight: 700;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.02);
      padding: 1rem 0.75rem;
    }
    .totals-label {
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .total-val {
      color: #ffffff;
    }

    /* Status Summary Bar */
    .status-summary-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      border-radius: 24px;
      font-size: 0.95rem;
      font-weight: 600;
      transition: var(--transition-smooth);
    }
    .status-pill.balanced {
      background: rgba(16, 185, 129, 0.1);
      border: 1.5px solid #10b981;
      color: #34d399;
    }
    .status-pill.balanced .status-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    }
    .status-pill.balanced .status-icon svg {
      width: 14px;
      height: 14px;
      stroke-width: 3px;
    }
    .status-pill:not(.balanced) {
      background: rgba(239, 68, 68, 0.1);
      border: 1.5px solid #ef4444;
      color: #fca5a5;
    }
  `]
})
export class BalanceSheetReportComponent {
  @Input({ required: true }) lines: FinancialReportLineDto[] = [];
  @Input() currency: string = 'USD';

  get totalAssets(): number {
    const row = this.lines.find(l => l.code === '1');
    return row ? row.balance : 0;
  }

  get totalLiabilities(): number {
    const row = this.lines.find(l => l.code === '2');
    return row ? row.balance : 0;
  }

  get totalEquity(): number {
    const row = this.lines.find(l => l.code === '3');
    return row ? row.balance : 0;
  }

  isBalanced(): boolean {
    return Math.abs(this.totalAssets - (this.totalLiabilities + this.totalEquity)) < 0.0001;
  }
}
