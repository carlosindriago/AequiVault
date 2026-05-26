import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { AccountBalanceDto } from '../../../../core/models/report.model';

@Component({
  selector: 'app-trial-balance-table',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  template: `
    <div class="table-container glass-panel" *transloco="let t">
      <table>
        <thead>
          <tr>
            <th>{{ t('reports.code') }}</th>
            <th>{{ t('reports.account') }}</th>
            <th>{{ t('reports.group') }}</th>
            <th class="amount-col">{{ t('reports.debit') }}</th>
            <th class="amount-col">{{ t('reports.credit') }}</th>
            <th class="amount-col">{{ t('reports.net_balance') }}</th>
          </tr>
        </thead>
        <tbody>
          @if (balances.length === 0) {
            <tr>
              <td colspan="6" class="empty-state">{{ t('reports.no_data') }}</td>
            </tr>
          } @else {
            @for (row of balances; track row.accountCode) {
              <tr class="report-row">
                <td class="code-cell">{{ row.accountCode }}</td>
                <td class="name-cell">
                  <span [style.padding-left.px]="getDepth(row.accountCode) * 20" class="indented-name">
                    {{ row.accountName }}
                  </span>
                </td>
                <td class="group-cell">
                  <span class="group-badge">{{ row.groupName }} ({{ row.groupCode }})</span>
                </td>
                <td class="amount-col text-debit">
                  {{ row.totalDebit | currency: currency }}
                </td>
                <td class="amount-col text-credit">
                  {{ row.totalCredit | currency: currency }}
                </td>
                <td class="amount-col net-balance-cell" [class.negative-balance]="row.netBalance < 0">
                  {{ row.netBalance | currency: currency }}
                </td>
              </tr>
            }
          }
        </tbody>
        @if (balances.length > 0) {
          <tfoot>
            <tr class="totals-row">
              <td colspan="3" class="totals-label">{{ t('reports.total') }}</td>
              <td class="amount-col total-debit-val">
                {{ totalDebitSum | currency: currency }}
              </td>
              <td class="amount-col total-credit-val">
                {{ totalCreditSum | currency: currency }}
              </td>
              <td class="amount-col total-net-val" [class.negative-balance]="(totalDebitSum - totalCreditSum) < 0">
                {{ (totalDebitSum - totalCreditSum) | currency: currency }}
              </td>
            </tr>
          </tfoot>
        }
      </table>
    </div>

    @if (balances.length > 0) {
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
            {{ t('reports.status') }}: {{ isBalanced() ? t('reports.balanced') : t('reports.unbalanced') }}
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
      padding: 1rem 0.75rem;
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
    .code-cell {
      font-family: monospace;
      color: #3b82f6;
      font-weight: 500;
      width: 120px;
    }
    .indented-name {
      display: inline-block;
      transition: padding-left 0.2s;
    }
    .group-cell {
      color: #64748b;
    }
    .group-badge {
      display: inline-block;
      background: rgba(148, 163, 184, 0.08);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .amount-col {
      width: 150px;
      text-align: right;
      font-family: monospace;
      font-weight: 500;
    }
    th.amount-col {
      text-align: right;
    }
    .text-debit {
      color: #34d399;
    }
    .text-credit {
      color: #fca5a5;
    }
    .net-balance-cell {
      font-weight: 600;
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
    .totals-row td {
      border-top: 2px solid rgba(255, 255, 255, 0.15);
      border-bottom: 2px solid rgba(255, 255, 255, 0.15);
      font-weight: 700;
      background: rgba(255, 255, 255, 0.01);
    }
    .totals-label {
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #f8fafc;
    }
    .total-debit-val {
      color: #10b981;
    }
    .total-credit-val {
      color: #ef4444;
    }
    .total-net-val {
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
export class TrialBalanceTableComponent {
  @Input({ required: true }) balances: AccountBalanceDto[] = [];
  @Input({ required: true }) totalDebitSum: number = 0;
  @Input({ required: true }) totalCreditSum: number = 0;
  @Input() currency: string = 'USD';

  getDepth(code: string): number {
    if (!code) return 0;
    const parts = code.split('.');
    return parts.length - 1;
  }

  isBalanced(): boolean {
    // Redondeo flotante básico para evitar problemas numéricos
    return Math.abs(this.totalDebitSum - this.totalCreditSum) < 0.0001;
  }
}
