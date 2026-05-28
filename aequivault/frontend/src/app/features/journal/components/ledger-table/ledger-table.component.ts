import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { LedgerReportDto } from '../../../../core/models/ledger.model';

@Component({
  selector: 'app-ledger-table',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  template: `
    <div class="ledger-table-wrapper" *transloco="let t">
      @if (report) {
        <div class="account-summary-header glass-panel">
          <div class="summary-item">
            <span class="summary-label">{{ t('ledger.account') }}</span>
            <strong class="summary-value">{{ report.accountName }} ({{ report.accountCode }})</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ t('ledger.initial_balance') }}</span>
            <strong class="summary-value balance-value" [class.negative]="report.initialBalance < 0">
              {{ report.initialBalance | currency: currency }}
            </strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ t('ledger.final_balance') }}</span>
            <strong class="summary-value balance-value" [class.negative]="report.finalBalance < 0">
              {{ report.finalBalance | currency: currency }}
            </strong>
          </div>
        </div>

        <div class="table-container glass-panel">
          <table>
            <thead>
              <tr>
                <th>{{ t('ledger.date') }}</th>
                <th>{{ t('ledger.entry_number') }}</th>
                <th>{{ t('ledger.description') }}</th>
                <th class="amount-col">{{ t('ledger.debit') }}</th>
                <th class="amount-col">{{ t('ledger.credit') }}</th>
                <th class="amount-col">{{ t('ledger.running_balance') }}</th>
              </tr>
            </thead>
            <tbody>
              @if (report.lines.length === 0) {
                <tr>
                  <td colspan="6" class="empty-state">{{ t('ledger.no_data') }}</td>
                </tr>
              } @else {
                @for (row of report.lines; track row.entryId) {
                  <tr class="ledger-row">
                    <td class="date-cell">{{ row.date | date: 'yyyy-MM-dd' }}</td>
                    <td class="entry-number-cell">
                      <span class="entry-badge">{{ row.entryNumber || 'DRAFT' }}</span>
                    </td>
                    <td class="desc-cell">{{ row.description }}</td>
                    <td class="amount-col text-debit">
                      {{ row.debit > 0 ? (row.debit | currency: currency) : '-' }}
                    </td>
                    <td class="amount-col text-credit">
                      {{ row.credit > 0 ? (row.credit | currency: currency) : '-' }}
                    </td>
                    <td class="amount-col running-val" [class.negative]="row.runningBalance < 0">
                      {{ row.runningBalance | currency: currency }}
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .ledger-table-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .account-summary-header {
      display: flex;
      justify-content: space-around;
      padding: 1.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
    }
    
    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .summary-label {
      font-size: 0.85rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .summary-value {
      font-size: 1.2rem;
      color: #ffffff;
      font-weight: 600;
    }

    .balance-value {
      font-family: monospace;
    }

    .balance-value.negative, .running-val.negative {
      color: #ef4444 !important;
    }
    
    .table-container {
      padding: 1.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
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
    
    .ledger-row {
      transition: background-color 0.2s;
    }
    
    .ledger-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    
    .date-cell {
      color: #64748b;
      font-family: monospace;
    }
    
    .entry-badge {
      display: inline-block;
      background: rgba(167, 139, 250, 0.1);
      border: 1px solid rgba(167, 139, 250, 0.2);
      color: #c084fc;
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .desc-cell {
      color: #e2e8f0;
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
    
    .running-val {
      font-weight: 600;
      color: #ffffff;
    }
    
    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 3rem 0;
      font-style: italic;
    }
  `]
})
export class LedgerTableComponent {
  @Input({ required: true }) report!: LedgerReportDto | null;
  @Input() currency: string = 'USD';
}
