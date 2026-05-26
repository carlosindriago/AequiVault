import { Component, Input, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { ReportService } from '../../../core/services/report.service';
import { TrialBalanceReportDto } from '../../../core/models/report.model';
import { TrialBalanceTableComponent } from '../components/trial-balance-table/trial-balance-table.component';

@Component({
  selector: 'app-report-container',
  standalone: true,
  imports: [CommonModule, FormsModule, TrialBalanceTableComponent, TranslocoDirective],
  template: `
    <div class="report-card glass-panel" *transloco="let t">
      <div class="report-header">
        <h2>{{ t('reports.trial_balance') }}</h2>
      </div>
 
      <!-- Filters Section -->
      <div class="filters-container">
        <div class="filter-group">
          <label for="startDate">{{ t('dashboard.start_date') }}</label>
          <input 
            id="startDate"
            type="date" 
            [ngModel]="startDate()" 
            (ngModelChange)="onStartDateChange($event)"
            class="filter-input" />
        </div>
        <div class="filter-group">
          <label for="endDate">{{ t('dashboard.end_date') }}</label>
          <input 
            id="endDate"
            type="date" 
            [ngModel]="endDate()" 
            (ngModelChange)="onEndDateChange($event)"
            class="filter-input" />
        </div>
        <div class="filter-group button-group">
          <button type="button" (click)="fetchReport()" class="btn btn-primary" [disabled]="isLoading()">
            {{ isLoading() ? t('reports.processing') : t('reports.generate_report') }}
          </button>
        </div>
      </div>
 
      <!-- Local Error Alert -->
      @if (errorMsg()) {
        <div class="error-banner">
          <span>⚠️ {{ t(errorMsg()) }}</span>
          <button (click)="errorMsg.set('')" class="btn-close">✕</button>
        </div>
      }
 
      <!-- Main report content area -->
      <div class="report-content">
        @if (isLoading()) {
          <div class="loading-state">{{ t('reports.loading') }}</div>
        } @else {
          <app-trial-balance-table
            [balances]="report()?.balances || []"
            [totalDebitSum]="report()?.totalDebitSum || 0"
            [totalCreditSum]="report()?.totalCreditSum || 0"
            currency="USD">
          </app-trial-balance-table>
        }
      </div>
    </div>
  `,
  styles: [`
    .report-card {
      margin-top: 1.5rem;
      padding: 2rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
    }
    .report-header {
      margin-bottom: 2rem;
    }
    .report-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 600;
    }

    /* Filters bar */
    .filters-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: flex-end;
      background: rgba(15, 23, 42, 0.4);
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 2rem;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #94a3b8;
    }
    .filter-input {
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
    .filter-input:focus {
      border-color: #a78bfa;
      box-shadow: 0 0 12px rgba(167, 139, 250, 0.15);
    }
    .button-group {
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

    /* Error Alert */
    .error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border-radius: var(--radius-sm);
      margin-bottom: 1.5rem;
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
      padding: 4rem 2rem;
      color: #94a3b8;
      font-size: 0.95rem;
      font-style: italic;
    }
    .report-content {
      min-height: 200px;
    }
  `]
})
export class ReportContainerComponent implements OnInit, OnChanges {
  @Input({ required: true }) tenantId!: string;

  startDate = signal<string>('');
  endDate = signal<string>('');
  report = signal<TrialBalanceReportDto | null>(null);
  isLoading = signal<boolean>(false);
  errorMsg = signal<string>('');

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.startDate.set(`${currentYear}-01-01`);
    this.endDate.set(`${currentYear}-12-31`);
    this.fetchReport();
  }

  ngOnChanges() {
    if (this.startDate() && this.endDate()) {
      this.fetchReport();
    }
  }

  onStartDateChange(val: string) {
    this.startDate.set(val);
    this.fetchReport();
  }

  onEndDateChange(val: string) {
    this.endDate.set(val);
    this.fetchReport();
  }

  fetchReport() {
    if (!this.tenantId || !this.startDate() || !this.endDate()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.reportService.getTrialBalance(this.tenantId, this.startDate(), this.endDate())
      .subscribe({
        next: (data) => {
          this.report.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.error && err.error.detail) {
            this.errorMsg.set(err.error.detail);
          } else {
            this.errorMsg.set('reports.errors.load_report');
          }
          this.report.set(null);
        }
      });
  }
}
