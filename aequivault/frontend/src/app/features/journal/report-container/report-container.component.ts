import { Component, Input, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { ReportService } from '../../../core/services/report.service';
import { TrialBalanceReportDto, FinancialReportDto } from '../../../core/models/report.model';
import { TrialBalanceTableComponent } from '../components/trial-balance-table/trial-balance-table.component';
import { BalanceSheetReportComponent } from '../components/balance-sheet-report/balance-sheet-report.component';
import { PnlReportComponent } from '../components/pnl-report/pnl-report.component';

@Component({
  selector: 'app-report-container',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TrialBalanceTableComponent, 
    BalanceSheetReportComponent,
    PnlReportComponent,
    TranslocoDirective
  ],
  template: `
    <div class="report-card glass-panel" *transloco="let t">
      <div class="report-header-container">
        <div class="report-header">
          <h2>
            @if (selectedReportType() === 'trial-balance') {
              {{ t('reports.trial_balance') }}
            } @else if (selectedReportType() === 'balance-sheet') {
              {{ t('reports.balance_sheet') }}
            } @else {
              {{ t('reports.profit_and_loss') }}
            }
          </h2>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs-container">
          <button 
            type="button"
            class="tab-btn" 
            [class.active]="selectedReportType() === 'trial-balance'" 
            (click)="setReportType('trial-balance')">
            {{ t('reports.trial_balance') }}
          </button>
          <button 
            type="button"
            class="tab-btn" 
            [class.active]="selectedReportType() === 'balance-sheet'" 
            (click)="setReportType('balance-sheet')">
            {{ t('reports.balance_sheet') }}
          </button>
          <button 
            type="button"
            class="tab-btn" 
            [class.active]="selectedReportType() === 'pnl'" 
            (click)="setReportType('pnl')">
            {{ t('reports.profit_and_loss') }}
          </button>
        </div>
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
          @if (selectedReportType() === 'trial-balance') {
            <app-trial-balance-table
              [balances]="report()?.balances || []"
              [totalDebitSum]="report()?.totalDebitSum || 0"
              [totalCreditSum]="report()?.totalCreditSum || 0"
              currency="USD">
            </app-trial-balance-table>
          } @else if (selectedReportType() === 'balance-sheet') {
            <app-balance-sheet-report
              [lines]="financialReport()?.lines || []"
              currency="USD">
            </app-balance-sheet-report>
          } @else {
            <app-pnl-report
              [lines]="financialReport()?.lines || []"
              currency="USD">
            </app-pnl-report>
          }
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
    .report-header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .report-header h2 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 600;
    }

    /* Tabs Navigation */
    .tabs-container {
      display: flex;
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.4);
      padding: 0.35rem;
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .tab-btn {
      padding: 0.5rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #94a3b8;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .tab-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.03);
    }
    .tab-btn.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%);
      border: 1px solid rgba(167, 139, 250, 0.3);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
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
  selectedReportType = signal<'trial-balance' | 'balance-sheet' | 'pnl'>('trial-balance');
  
  report = signal<TrialBalanceReportDto | null>(null);
  financialReport = signal<FinancialReportDto | null>(null);
  
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

  setReportType(type: 'trial-balance' | 'balance-sheet' | 'pnl') {
    this.selectedReportType.set(type);
    this.fetchReport();
  }

  fetchReport() {
    if (!this.tenantId || !this.startDate() || !this.endDate()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    const reportType = this.selectedReportType();

    if (reportType === 'trial-balance') {
      this.reportService.getTrialBalance(this.tenantId, this.startDate(), this.endDate())
        .subscribe({
          next: (data) => {
            this.report.set(data);
            this.financialReport.set(null);
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
    } else if (reportType === 'balance-sheet') {
      this.reportService.getBalanceSheet(this.tenantId, this.startDate(), this.endDate())
        .subscribe({
          next: (data) => {
            this.financialReport.set(data);
            this.report.set(null);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            if (err.error && err.error.detail) {
              this.errorMsg.set(err.error.detail);
            } else {
              this.errorMsg.set('reports.errors.load_report');
            }
            this.financialReport.set(null);
          }
        });
    } else {
      this.reportService.getProfitAndLoss(this.tenantId, this.startDate(), this.endDate())
        .subscribe({
          next: (data) => {
            this.financialReport.set(data);
            this.report.set(null);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            if (err.error && err.error.detail) {
              this.errorMsg.set(err.error.detail);
            } else {
              this.errorMsg.set('reports.errors.load_report');
            }
            this.financialReport.set(null);
          }
        });
    }
  }
}
