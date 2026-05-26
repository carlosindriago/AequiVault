import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { JournalLineForm } from '../../../../core/services/journal-entry-state.service';
import { LedgerAccountDto } from '../../../../core/models/ledger-account.model';

@Component({
  selector: 'app-journal-line-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoDirective],
  template: `
    <div class="table-container" *transloco="let t">
      <table>
        <thead>
          <tr>
            <th>{{ t('journal.column_account') }}</th>
            <th>{{ t('journal.column_description') }}</th>
            <th class="amount-col">{{ t('journal.column_debit') }}</th>
            <th class="amount-col">{{ t('journal.column_credit') }}</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          @for (line of lines; track line.id; let idx = $index) {
            <tr class="line-row">
              <td>
                <select 
                  [ngModel]="line.ledgerAccountId" 
                  (ngModelChange)="onUpdate(line.id, 'ledgerAccountId', $event)"
                  class="select-account">
                  <option value="" disabled selected>{{ t('journal.select_account') }}</option>
                  @for (acc of accounts; track acc.id) {
                    <option [value]="acc.id">{{ acc.name }} ({{ acc.code }})</option>
                  }
                </select>
              </td>
              <td>
                <span class="row-description">{{ description || t('journal.default_description') }}</span>
              </td>
              <td class="amount-col">
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder=""
                  [ngModel]="line.type === 'DEBIT' ? line.amount : null" 
                  (ngModelChange)="onUpdateDebit(line.id, $event)"
                  class="input-amount text-debit" />
              </td>
              <td class="amount-col">
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder=""
                  [ngModel]="line.type === 'CREDIT' ? line.amount : null" 
                  (ngModelChange)="onUpdateCredit(line.id, $event)"
                  class="input-amount text-credit" />
              </td>
              <td class="actions-col">
                @if (lines.length > 2) {
                  <button 
                    type="button" 
                    (click)="removeLine.emit(line.id)" 
                    class="btn-delete"
                    [title]="t('journal.remove_line_tooltip')">
                    ✕
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="actions-bar">
        <button type="button" (click)="addLine.emit()" class="btn-add-line">
          ＋ {{ t('journal.add_line') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: transparent;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: transparent;
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #94a3b8;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
      font-family: var(--font-family);
    }
    td {
      padding: 1.25rem 0.5rem;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
      vertical-align: middle;
    }
    .line-row {
      transition: background-color 0.2s;
    }
    .line-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .select-account {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 0.95rem;
      width: 100%;
      outline: none;
      cursor: pointer;
      padding: 0.25rem 0;
      font-family: var(--font-family);
      font-weight: 400;
    }
    .select-account option {
      background: #0f1322;
      color: #ffffff;
    }
    .row-description {
      color: #94a3b8;
      font-size: 0.95rem;
      font-family: var(--font-family);
    }
    .amount-col {
      width: 140px;
      text-align: right;
    }
    th.amount-col {
      text-align: right;
    }
    .input-amount {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 0.95rem;
      text-align: right;
      width: 100%;
      outline: none;
      padding: 0.25rem 0;
      font-family: var(--font-family);
      font-weight: 400;
    }
    .input-amount::-webkit-outer-spin-button,
    .input-amount::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .input-amount {
      -moz-appearance: textfield;
    }
    .text-debit {
      color: #ffffff;
    }
    .text-credit {
      color: #ffffff;
    }
    .actions-col {
      width: 40px;
      text-align: center;
    }
    .btn-delete {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-size: 0.85rem;
      transition: var(--transition-smooth);
    }
    .btn-delete:hover {
      color: #ef4444;
      transform: scale(1.1);
    }
    .actions-bar {
      padding: 1rem 0.5rem;
      background: transparent;
    }
    .btn-add-line {
      background: transparent;
      border: none;
      color: #a78bfa;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: var(--transition-smooth);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .btn-add-line:hover {
      color: #c084fc;
      transform: translateX(2px);
    }
  `]
})
export class JournalLineTableComponent {
  @Input({ required: true }) lines: JournalLineForm[] = [];
  @Input({ required: true }) accounts: LedgerAccountDto[] = [];
  @Input() description: string = '';

  @Output() addLine = new EventEmitter<void>();
  @Output() removeLine = new EventEmitter<string>();
  @Output() updateLine = new EventEmitter<{ id: string; field: keyof JournalLineForm; value: any }>();

  onUpdate(id: string, field: keyof JournalLineForm, value: any) {
    this.updateLine.emit({ id, field, value });
  }

  onUpdateDebit(id: string, value: any) {
    const val = value === null || value === '' ? null : Number(value);
    this.updateLine.emit({ id, field: 'type', value: 'DEBIT' });
    this.updateLine.emit({ id, field: 'amount', value: val });
  }

  onUpdateCredit(id: string, value: any) {
    const val = value === null || value === '' ? null : Number(value);
    this.updateLine.emit({ id, field: 'type', value: 'CREDIT' });
    this.updateLine.emit({ id, field: 'amount', value: val });
  }
}
