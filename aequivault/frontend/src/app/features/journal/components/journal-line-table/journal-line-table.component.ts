import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalLineForm } from '../../../../core/services/journal-entry-state.service';
import { LedgerAccountDto } from '../../../../core/models/ledger-account.model';

@Component({
  selector: 'app-journal-line-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Cuenta Contable</th>
            <th>Tipo</th>
            <th>Monto</th>
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
                  <option value="" disabled selected>Seleccione una cuenta...</option>
                  @for (acc of accounts; track acc.id) {
                    <option [value]="acc.id">{{ acc.code }} - {{ acc.name }}</option>
                  }
                </select>
              </td>
              <td>
                <select 
                  [ngModel]="line.type" 
                  (ngModelChange)="onUpdate(line.id, 'type', $event)"
                  class="select-type"
                  [ngClass]="line.type === 'DEBIT' ? 'text-debit' : 'text-credit'">
                  <option value="DEBIT">DEBE (DEBIT)</option>
                  <option value="CREDIT">HABER (CREDIT)</option>
                </select>
              </td>
              <td>
                <div class="amount-input-wrapper">
                  <span class="currency-symbol">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00"
                    [ngModel]="line.amount" 
                    (ngModelChange)="onUpdate(line.id, 'amount', $event)"
                    class="input-amount" />
                </div>
              </td>
              <td class="actions-col">
                @if (lines.length > 2) {
                  <button 
                    type="button" 
                    (click)="removeLine.emit(line.id)" 
                    class="btn-delete"
                    title="Eliminar línea">
                    ✕
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="actions-bar">
        <button type="button" (click)="addLine.emit()" class="btn btn-secondary btn-sm">
          ＋ Agregar Línea
        </button>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      margin-top: 1.5rem;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-glass);
      background: rgba(15, 23, 42, 0.4);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      background: rgba(20, 27, 45, 0.8);
      padding: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-glass);
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-glass);
      vertical-align: middle;
    }
    .line-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .select-account, .select-type, .input-amount {
      background-color: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--border-glass);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 0.5rem 0.75rem;
      font-size: 0.95rem;
      width: 100%;
      transition: var(--transition-smooth);
    }
    .select-account:focus, .select-type:focus, .input-amount:focus {
      border-color: var(--color-primary);
      outline: none;
      background-color: rgba(15, 23, 42, 0.8);
    }
    .text-debit {
      color: #34d399;
      font-weight: 500;
    }
    .text-credit {
      color: #fb7185;
      font-weight: 500;
    }
    .amount-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .currency-symbol {
      position: absolute;
      left: 0.75rem;
      color: var(--text-muted);
      font-size: 0.95rem;
      pointer-events: none;
    }
    .input-amount {
      padding-left: 1.75rem;
    }
    .actions-col {
      width: 50px;
      text-align: center;
    }
    .btn-delete {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.25rem 0.5rem;
      border-radius: 50%;
      transition: var(--transition-smooth);
    }
    .btn-delete:hover {
      color: var(--color-danger);
      background: var(--color-danger-bg);
    }
    .actions-bar {
      padding: 1rem;
      background: rgba(20, 27, 45, 0.4);
      display: flex;
      justify-content: flex-start;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class JournalLineTableComponent {
  @Input({ required: true }) lines: JournalLineForm[] = [];
  @Input({ required: true }) accounts: LedgerAccountDto[] = [];

  @Output() addLine = new EventEmitter<void>();
  @Output() removeLine = new EventEmitter<string>();
  @Output() updateLine = new EventEmitter<{ id: string; field: keyof JournalLineForm; value: any }>();

  onUpdate(id: string, field: keyof JournalLineForm, value: any) {
    // Para campos numéricos, aseguremos parsear el valor a número o null
    let processedValue = value;
    if (field === 'amount') {
      processedValue = value === null || value === '' ? null : Number(value);
    }
    this.updateLine.emit({ id, field, value: processedValue });
  }
}
