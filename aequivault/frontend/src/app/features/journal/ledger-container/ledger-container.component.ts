import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { AccountService } from '../../../core/services/account.service';
import { LedgerService } from '../../../core/services/ledger.service';
import { LedgerReportDto } from '../../../core/models/ledger.model';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { LedgerTableComponent } from '../components/ledger-table/ledger-table.component';

@Component({
  selector: 'app-ledger-container',
  standalone: true,
  imports: [CommonModule, FormsModule, LedgerTableComponent, TranslocoDirective],
  template: `
    <div class="ledger-wrapper" *transloco="let t">
      <div class="ledger-header-bar">
        <h2>{{ t('ledger.title') }}</h2>
        
        <div class="ledger-filters">
          <div class="filter-item">
            <label for="ledgerAccountSelect">{{ t('ledger.account_label') }}</label>
            <select 
              id="ledgerAccountSelect" 
              [ngModel]="selectedAccountId()" 
              (ngModelChange)="onAccountChange($event)"
              class="filter-select">
              <option value="" disabled selected>{{ t('ledger.select_account') }}</option>
              @for (acc of accounts(); track acc.id) {
                <option [value]="acc.id">{{ acc.code }} - {{ acc.name }}</option>
              }
            </select>
          </div>

          <div class="filter-item">
            <label for="startDate">{{ t('ledger.start_date') }}</label>
            <input 
              id="startDate"
              type="date" 
              [ngModel]="startDate()" 
              (ngModelChange)="onStartDateChange($event)"
              class="filter-input" />
          </div>

          <div class="filter-item">
            <label for="endDate">{{ t('ledger.end_date') }}</label>
            <input 
              id="endDate"
              type="date" 
              [ngModel]="endDate()" 
              (ngModelChange)="onEndDateChange($event)"
              class="filter-input" />
          </div>
          
          <div class="filter-item button-item">
            <button type="button" (click)="fetchLedger()" class="btn btn-primary" [disabled]="isLoading() || !selectedAccountId()">
              {{ isLoading() ? t('ledger.loading_btn') : t('ledger.refresh_btn') }}
            </button>
          </div>
        </div>
      </div>

      @if (errorMsg()) {
        <div class="error-banner">
          <span>⚠️ {{ t(errorMsg()) }}</span>
          <button (click)="errorMsg.set('')" class="btn-close">✕</button>
        </div>
      }

      @if (isLoading()) {
        <div class="loading-state">{{ t('ledger.loading') }}</div>
      } @else {
        <app-ledger-table 
          [report]="ledgerData()" 
          [currency]="currency">
        </app-ledger-table>
      }
    </div>
  `,
  styles: [`
    .ledger-wrapper {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .ledger-header-bar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .ledger-header-bar h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .ledger-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: flex-end;
      background: rgba(15, 23, 42, 0.4);
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-item label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #94a3b8;
    }
    
    .filter-select, .filter-input {
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: #ffffff;
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
      outline: none;
      transition: var(--transition-smooth);
      font-family: var(--font-family);
    }
    
    .filter-select {
      min-width: 240px;
      cursor: pointer;
    }
    
    .filter-select option {
      background-color: var(--bg-secondary);
      color: #ffffff;
    }
    
    .filter-select:focus, .filter-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    }
    
    .button-item {
      margin-left: auto;
    }

    .btn {
      padding: 0.65rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: var(--transition-smooth);
      font-family: var(--font-family);
    }

    .btn-primary {
      background: linear-gradient(135deg, #a78bfa 0%, #6366f1 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
    }
    
    .btn-close {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.95rem;
    }
    
    .loading-state {
      text-align: center;
      padding: 5rem 2rem;
      color: #94a3b8;
      font-size: 0.95rem;
      font-style: italic;
    }
  `]
})
export class LedgerContainerComponent implements OnInit, OnChanges {
  @Input({ required: true }) tenantId!: string;
  @Input() currency: string = 'USD';

  startDate = signal<string>('');
  endDate = signal<string>('');
  ledgerData = signal<LedgerReportDto | null>(null);
  isLoading = signal<boolean>(false);
  errorMsg = signal<string>('');

  accounts = signal<LedgerAccountDto[]>([]);
  selectedAccountId = signal<string>('');

  constructor(
    private ledgerService: LedgerService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.startDate.set(formatDate(startOfYear));
    this.endDate.set(formatDate(today));
    
    this.loadAccounts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && !changes['tenantId'].firstChange) {
      this.loadAccounts();
    }
  }

  loadAccounts() {
    if (!this.tenantId) return;

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.accountService.getAccounts(this.tenantId).subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.isLoading.set(false);
        this.ledgerData.set(null);
        this.selectedAccountId.set('');
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('ledger.errors.load_accounts');
      }
    });
  }

  onAccountChange(id: string) {
    this.selectedAccountId.set(id);
    this.fetchLedger();
  }

  onStartDateChange(val: string) {
    this.startDate.set(val);
    this.fetchLedger();
  }

  onEndDateChange(val: string) {
    this.endDate.set(val);
    this.fetchLedger();
  }

  fetchLedger() {
    const accId = this.selectedAccountId();
    const start = this.startDate();
    const end = this.endDate();

    if (!this.tenantId || !accId || !start || !end) {
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.ledgerService.getLedgerReport(this.tenantId, accId, start, end).subscribe({
      next: (data) => {
        this.ledgerData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error && err.error.detail) {
          this.errorMsg.set(err.error.detail);
        } else {
          this.errorMsg.set('ledger.errors.load_ledger');
        }
        this.ledgerData.set(null);
      }
    });
  }
}
