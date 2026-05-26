import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalEntryStateService } from '../../../core/services/journal-entry-state.service';
import { AccountService } from '../../../core/services/account.service';
import { JournalService } from '../../../core/services/journal.service';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { JournalEntryRequest } from '../../../core/models/journal-entry.model';
import { JournalLineTableComponent } from '../components/journal-line-table/journal-line-table.component';
import { JournalEntrySummaryComponent } from '../components/journal-entry-summary/journal-entry-summary.component';
import { JournalEntryFormComponent } from '../components/journal-entry-form/journal-entry-form.component';
import { CoaManagerComponent } from '../coa-manager/coa-manager.component';

@Component({
  selector: 'app-journal-entry-container',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JournalLineTableComponent,
    JournalEntrySummaryComponent,
    JournalEntryFormComponent,
    CoaManagerComponent
  ],
  template: `
    <div class="glass-panel main-header">
      <div class="header-left">
        <div class="brand-container">
          <svg class="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#c084fc" />
                <stop offset="50%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
            </defs>
            <path d="M50 15 L18 85 H36 L50 50 L64 85 H82 Z" fill="url(#logo-grad)" />
            <path d="M50 50 L40 72 H60 Z" fill="#0f172a" opacity="0.9" />
            <circle cx="50" cy="50" r="3" fill="#34d399" />
          </svg>
          <div class="brand-text">
            <span class="badge badge-success">Hito 3 Active</span>
            <h1>AequiVault</h1>
          </div>
        </div>
        <p class="subtitle">Bóveda Financiera Transaccional Multi-Inquilino con RLS</p>
      </div>
      
      <div class="tenant-selector">
        <label for="tenant">Inquilino Activo (Tenant Context)</label>
        <select id="tenant" [ngModel]="activeTenantId()" (ngModelChange)="onTenantChange($event)">
          <option value="212f7927-ed0d-495c-b39b-94364d5e2f9b">Tenant A: Corporación Alpha</option>
          <option value="5ace6e00-1995-4012-a708-c8d45f6f4ff8">Tenant B: Consultora Omega</option>
        </select>
        <span class="rls-shield">🛡️ RLS Activo</span>
      </div>
    </div>

    <!-- Notification Area -->
    @if (notification(); as notif) {
      <div class="notification-banner" [ngClass]="notif.type === 'success' ? 'notif-success' : 'notif-error'">
        <div class="notif-header">
          <strong>{{ notif.title }}</strong>
          <button (click)="clearNotification()" class="btn-close-notif">✕</button>
        </div>
        <p class="notif-detail">{{ notif.detail }}</p>
        @if (notif.errors) {
          <ul class="notif-errors-list">
            @for (err of notif.errors; track err) {
              <li>• {{ err }}</li>
            }
          </ul>
        }
      </div>
    }

    <!-- Navigation Tabs Bar -->
    <div class="tabs-bar">
      <button 
        type="button" 
        class="tab-btn" 
        [class.active-tab]="activeTab() === 'entry'"
        (click)="activeTab.set('entry')">
        ✍️ Registro de Asiento
      </button>
      <button 
        type="button" 
        class="tab-btn" 
        [class.active-tab]="activeTab() === 'coa'"
        (click)="activeTab.set('coa')">
        📊 Plan de Cuentas (COA)
      </button>
    </div>

    <!-- Workspaces -->
    @if (activeTab() === 'entry') {
      <div class="glass-panel animate-workspace">
        <h2>Registro de Asiento Diario</h2>
        
        <app-journal-entry-form
          [date]="state.date()"
          [description]="state.description()"
          [entryNumber]="state.entryNumber()"
          [status]="state.status()"
          [currency]="state.currency()"
          (dateChange)="state.date.set($event)"
          (descriptionChange)="state.description.set($event)"
          (entryNumberChange)="state.entryNumber.set($event)"
          (statusChange)="state.status.set($event)"
          (currencyChange)="state.currency.set($event)">

          <app-journal-line-table
            [lines]="state.lines()"
            [accounts]="accounts()"
            (addLine)="state.addLine()"
            (removeLine)="state.removeLine($event)"
            (updateLine)="state.updateLine($event.id, $event.field, $event.value)">
          </app-journal-line-table>

          <app-journal-entry-summary
            [debitSum]="state.debitSum()"
            [creditSum]="state.creditSum()"
            [difference]="state.difference()"
            [isBalanced]="state.isBalanced()"
            [currency]="state.currency()">
          </app-journal-entry-summary>

        </app-journal-entry-form>

        <div class="submit-bar">
          <button 
            type="button" 
            (click)="resetForm()" 
            class="btn btn-secondary">
            Resetear
          </button>
          <button 
            type="button" 
            [disabled]="!state.canSubmit() || isLoading()" 
            (click)="submitEntry()" 
            class="btn btn-primary">
            @if (isLoading()) {
              Procesando...
            } @else {
              Asentar Asiento Contable
            }
          </button>
        </div>
      </div>
    }

    @if (activeTab() === 'coa') {
      <div class="animate-workspace">
        <app-coa-manager 
          [tenantId]="activeTenantId()" 
          (catalogChanged)="fetchAccounts()">
        </app-coa-manager>
      </div>
    }
  `,
  styles: [`
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      border-bottom: 2px solid rgba(99, 102, 241, 0.2);
    }
    .brand-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .logo-icon {
      width: 42px;
      height: 42px;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
    }
    .brand-text {
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-start;
      gap: 0.15rem;
    }
    .brand-text h1 {
      margin: 0;
      font-size: 2.25rem;
      background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 70%, #34d399 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .tenant-selector {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-glass);
      padding: 1rem;
      border-radius: var(--radius-md);
      min-width: 320px;
    }
    .tenant-selector label {
      margin-bottom: 0.25rem;
      font-size: 0.8rem;
    }
    .tenant-selector select {
      padding: 0.5rem;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .rls-shield {
      display: block;
      font-size: 0.75rem;
      color: #34d399;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: right;
    }
    .tabs-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: 0.5rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 500;
      padding: 0.5rem 1.25rem;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: var(--transition-smooth);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid transparent;
    }
    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-primary);
      border-color: var(--border-glass);
    }
    .active-tab {
      background: rgba(99, 102, 241, 0.15) !important;
      color: var(--color-primary) !important;
      border: 1px solid rgba(99, 102, 241, 0.3) !important;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.1);
    }
    .animate-workspace {
      animation: slideUp 0.3s ease-out;
    }
    .submit-bar {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    
    /* Notification styling */
    .notification-banner {
      padding: 1.25rem;
      border-radius: var(--radius-md);
      margin-bottom: 2rem;
      box-shadow: var(--shadow-premium);
      animation: fadeIn 0.3s ease-out;
    }
    .notif-success {
      background-color: var(--color-success-bg);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #a7f3d0;
    }
    .notif-error {
      background-color: var(--color-danger-bg);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .notif-header strong {
      font-size: 1.05rem;
    }
    .btn-close-notif {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
    }
    .notif-detail {
      font-size: 0.925rem;
      line-height: 1.4;
    }
    .notif-errors-list {
      margin-top: 0.5rem;
      padding-left: 0.5rem;
      list-style: none;
      font-size: 0.85rem;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class JournalEntryContainerComponent implements OnInit {
  // Signals
  activeTenantId = signal<string>('212f7927-ed0d-495c-b39b-94364d5e2f9b');
  accounts = signal<LedgerAccountDto[]>([]);
  isLoading = signal<boolean>(false);
  activeTab = signal<'entry' | 'coa'>('entry');
  
  notification = signal<{
    type: 'success' | 'error';
    title: string;
    detail: string;
    errors?: string[];
  } | null>(null);

  constructor(
    public state: JournalEntryStateService,
    private accountService: AccountService,
    private journalService: JournalService
  ) {}

  ngOnInit() {
    this.fetchAccounts();
  }

  onTenantChange(newTenantId: string) {
    this.activeTenantId.set(newTenantId);
    this.fetchAccounts();
    this.state.reset(); // Reset form when switching tenant contexts to prevent crossing details
  }

  fetchAccounts() {
    this.isLoading.set(true);
    this.accountService.getAccounts(this.activeTenantId()).subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.showErrorNotification('Error al cargar cuentas', 'No se pudieron recuperar las cuentas de mayor debido a restricciones RLS o de red.');
        this.isLoading.set(false);
      }
    });
  }

  submitEntry() {
    if (!this.state.canSubmit()) return;

    this.isLoading.set(true);
    this.clearNotification();

    // Mapear líneas locales al contrato de backend
    const payloadLines = this.state.lines().map(l => ({
      ledgerAccountId: l.ledgerAccountId,
      amount: l.amount || 0,
      type: l.type
    }));

    const requestPayload: JournalEntryRequest = {
      date: this.state.date(),
      description: this.state.description() || 'Asiento registrado desde Frontend',
      status: this.state.status(),
      entryNumber: this.state.status() === 'POSTED' ? this.state.entryNumber() : undefined,
      currency: this.state.currency(),
      lines: payloadLines
    };

    this.journalService.createEntry(requestPayload, this.activeTenantId()).subscribe({
      next: (response) => {
        this.notification.set({
          type: 'success',
          title: 'Asiento Registrado Exitosamente',
          detail: `El asiento contable de tipo ${response.status} fue persistido en AequiVault. ID asignado: ${response.id}`
        });
        this.state.reset();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleHttpError(err);
        this.isLoading.set(false);
      }
    });
  }

  resetForm() {
    this.state.reset();
    this.clearNotification();
  }

  clearNotification() {
    this.notification.set(null);
  }

  private showErrorNotification(title: string, detail: string, errors?: string[]) {
    this.notification.set({
      type: 'error',
      title,
      detail,
      errors
    });
  }

  private handleHttpError(err: any) {
    // Si el backend responde con un ProblemDetail (RFC 7807)
    if (err.error && err.error.title) {
      const title = err.error.title;
      const detail = err.error.detail || 'Ocurrió un error inesperado al procesar la solicitud.';
      
      let errorDetails: string[] = [];
      if (err.error.errors) {
        // Mapear campos de error sintácticos (de javax/jakarta validation)
        errorDetails = Object.keys(err.error.errors).map(field => {
          const fieldErrs = err.error.errors[field] as string[];
          return `${field}: ${fieldErrs.join(', ')}`;
        });
      }
      
      this.showErrorNotification(title, detail, errorDetails.length > 0 ? errorDetails : undefined);
    } else {
      this.showErrorNotification('Falla en la Conexión', 'No se pudo conectar con la API de AequiVault. Asegúrese de que el backend esté ejecutándose en el puerto 8080.');
    }
  }
}
