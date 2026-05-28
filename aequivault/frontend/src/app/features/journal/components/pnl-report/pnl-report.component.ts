import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { FinancialReportLineDto } from '../../../../core/models/report.model';

@Component({
  selector: 'app-pnl-report',
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
              <td colspan="2" class="totals-label">{{ t('reports.revenues') }} (4)</td>
              <td class="amount-col total-val text-revenue">{{ totalRevenues | currency: currency }}</td>
            </tr>
            <tr class="summary-total-row">
              <td colspan="2" class="totals-label">{{ t('reports.expenses') }} (5)</td>
              <td class="amount-col total-val text-expense">{{ totalExpenses | currency: currency }}</td>
            </tr>
            <tr class="summary-final-row">
              <td colspan="2" class="totals-label">{{ t('reports.net_income') }}</td>
              <td class="amount-col total-val" [class.negative-balance]="netIncome < 0">
                {{ netIncome | currency: currency }}
              </td>
            </tr>
          </tfoot>
        }
      </table>
    </div>
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
    .text-revenue {
      color: #34d399 !important;
    }
    .text-expense {
      color: #fca5a5 !important;
    }
    .total-val {
      color: #ffffff;
    }
  `]
})
export class PnlReportComponent {
  @Input({ required: true }) lines: FinancialReportLineDto[] = [];
  @Input() currency: string = 'USD';

  get totalRevenues(): number {
    const row = this.lines.find(l => l.code === '4');
    return row ? row.balance : 0;
  }

  get totalExpenses(): number {
    const row = this.lines.find(l => l.code === '5');
    return row ? row.balance : 0;
  }

  get netIncome(): number {
    return this.totalRevenues - this.totalExpenses;
  }
}
