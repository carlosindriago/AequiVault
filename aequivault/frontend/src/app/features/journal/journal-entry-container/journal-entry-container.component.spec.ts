import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalEntryContainerComponent } from './journal-entry-container.component';
import { AccountService } from '../../../core/services/account.service';
import { JournalService } from '../../../core/services/journal.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';
import { JournalEntryStateService } from '../../../core/services/journal-entry-state.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { TranslationStateService } from '../../../core/services/translation-state.service';
import { TranslocoTestingModule, TranslocoService } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { JournalEntryResponse } from '../../../core/models/journal-entry.model';
import { NotificationService } from '../../../core/services/notification.service';

describe('JournalEntryContainerComponent', () => {
  let component: JournalEntryContainerComponent;
  let fixture: ComponentFixture<JournalEntryContainerComponent>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let journalServiceSpy: jasmine.SpyObj<JournalService>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let stateService: JournalEntryStateService;

  const mockAccounts: LedgerAccountDto[] = [
    { id: '1', code: '1.1.01', name: 'Caja', groupId: 'g1', type: 'ASSET' },
    { id: '2', code: '2.1.01', name: 'Proveedores', groupId: 'g2', type: 'LIABILITY' }
  ];

  beforeEach(async () => {
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAccounts', 'createAccount', 'getGroups', 'createGroup', 'deleteGroup']);
    journalServiceSpy = jasmine.createSpyObj('JournalService', ['createEntry', 'getEntry']);
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getDashboard']);

    // Default mock responses
    accountServiceSpy.getAccounts.and.returnValue(of(mockAccounts));
    accountServiceSpy.getGroups.and.returnValue(of([]));
    dashboardServiceSpy.getDashboard.and.returnValue(of({
      totalAssets: 100,
      totalLiabilities: 50,
      netEquity: 50,
      liquidityTrend: []
    }));

    const mockTranslationService = {
      activeLanguage: () => 'en',
      setLanguage: jasmine.createSpy('setLanguage')
    };

    const mockAuthService = {
      currentUser: signal({ email: 'admin@corporacionalpha.com', tenantId: '212f7927-ed0d-495c-b39b-94364d5e2f9b' }),
      isDemoSession: signal(false),
      demoExpiresAt: signal<string | null>(null),
      logout: jasmine.createSpy('logout')
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const mockNotificationService = {
      unreadNotifications: signal([]),
      loadUnreadNotifications: jasmine.createSpy('loadUnreadNotifications').and.returnValue(of([])),
      markAsRead: jasmine.createSpy('markAsRead').and.returnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [
        JournalEntryContainerComponent,
        TranslocoTestingModule.forRoot({
          langs: { 
            en: {
              sidebar: { dashboard: 'Dashboard', ledger: 'Ledger', journals: 'Journals', coa: 'Chart of Accounts', reports: 'Reports', settings: 'Settings' },
              header: { new_entry: 'New Journal Entry' },
              'journal.error_accounts_title': 'Error loading accounts',
              'journal.error_accounts_detail': 'Could not retrieve ledger accounts due to network or RLS restrictions.'
            }, 
            es: {
              sidebar: { dashboard: 'Dashboard', ledger: 'Libro Mayor', journals: 'Diarios', coa: 'Plan de Cuentas', reports: 'Reportes', settings: 'Settings' },
              header: { new_entry: 'Nuevo Asiento Diario' },
              'journal.error_accounts_title': 'Error al cargar cuentas',
              'journal.error_accounts_detail': 'No se pudieron recuperar las cuentas de mayor debido a restricciones RLS o de red.'
            }
          },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' },
        })
      ],
      providers: [
        JournalEntryStateService,
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: JournalService, useValue: journalServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: TranslationStateService, useValue: mockTranslationService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalEntryContainerComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(JournalEntryStateService);

    const translocoService = TestBed.inject(TranslocoService);
    translocoService.setActiveLang('en');
    spyOn(translocoService, 'translate').and.callFake(((key: any, params?: any, lang?: any): any => {
      if (key === 'journal.error_accounts_title') return 'Error loading accounts';
      if (key === 'journal.error_accounts_detail') return 'Could not retrieve ledger accounts due to network or RLS restrictions.';
      if (key === 'journal.error_connection_title') return 'Connection Failure';
      if (key === 'journal.error_connection_detail') return 'Could not connect to AequiVault API. Ensure the backend is running on port 8080.';
      if (key === 'journal.success_title') return 'Journal Entry Posted Successfully';
      if (key === 'journal.success_detail') {
        return `The journal entry of type ${params?.status || 'POSTED'} was persisted in AequiVault. Assigned ID: ${params?.id || 'je-uuid'}`;
      }
      return key;
    }) as any);
  });

  it('should create and fetch accounts on init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(accountServiceSpy.getAccounts).toHaveBeenCalledWith(component.activeTenantId());
    expect(component.accounts()).toEqual(mockAccounts);
  });

  it('should reload accounts and reset state on tenant change', () => {
    fixture.detectChanges();
    spyOn(stateService, 'reset');
    
    component.onTenantChange('new-tenant-id');
    
    expect(component.activeTenantId()).toBe('new-tenant-id');
    expect(accountServiceSpy.getAccounts).toHaveBeenCalledWith('new-tenant-id');
    expect(stateService.reset).toHaveBeenCalled();
  });

  it('should display error banner if loading accounts fails', () => {
    accountServiceSpy.getAccounts.and.returnValue(throwError(() => new Error('RLS Blocked')));
    fixture.detectChanges();

    expect(component.notification()).toBeTruthy();
    expect(component.notification()?.type).toBe('error');
    expect(component.notification()?.title).toBe('Error loading accounts');
  });

  it('should submit entry successfully and reset state', () => {
    fixture.detectChanges();
    
    // Setup state to be valid for POSTED submission
    stateService.entryNumber.set('JE-2026-0001');
    stateService.date.set('2026-05-25');
    stateService.description.set('Test Concept');
    stateService.status.set('POSTED');
    
    const lines = stateService.lines();
    stateService.updateLine(lines[0].id, 'ledgerAccountId', '1');
    stateService.updateLine(lines[0].id, 'amount', 100);
    stateService.updateLine(lines[1].id, 'ledgerAccountId', '2');
    stateService.updateLine(lines[1].id, 'amount', 100);
    
    expect(stateService.canSubmit()).toBeTrue();

    const mockResponse: JournalEntryResponse = {
      id: 'je-uuid',
      tenantId: '212f7927-ed0d-495c-b39b-94364d5e2f9b',
      date: '2026-05-25',
      description: 'Test Concept',
      status: 'POSTED',
      entryNumber: 'JE-2026-0001',
      currency: 'USD',
      lines: []
    };
    journalServiceSpy.createEntry.and.returnValue(of(mockResponse));
    spyOn(stateService, 'reset').and.callThrough();

    component.submitEntry();

    expect(journalServiceSpy.createEntry).toHaveBeenCalled();
    expect(component.notification()).toBeTruthy();
    expect(component.notification()?.type).toBe('success');
    expect(stateService.reset).toHaveBeenCalled();
  });

  it('should display RFC 7807 problem details errors on submit failure', () => {
    fixture.detectChanges();
    
    // Setup valid state
    stateService.entryNumber.set('JE-2026-0001');
    stateService.date.set('2026-05-25');
    stateService.description.set('Test Concept');
    stateService.status.set('POSTED');
    const lines = stateService.lines();
    stateService.updateLine(lines[0].id, 'ledgerAccountId', '1');
    stateService.updateLine(lines[0].id, 'amount', 100);
    stateService.updateLine(lines[1].id, 'ledgerAccountId', '2');
    stateService.updateLine(lines[1].id, 'amount', 100);

    const problemDetailError = {
      status: 422,
      error: {
        title: 'Error de Regla de Negocio',
        detail: 'El asiento no está balanceado.',
        errors: {
          'lines': ['El debe y haber deben ser iguales']
        }
      }
    };
    journalServiceSpy.createEntry.and.returnValue(throwError(() => problemDetailError));

    component.submitEntry();

    expect(component.notification()).toBeTruthy();
    expect(component.notification()?.type).toBe('error');
    expect(component.notification()?.title).toBe('Error de Regla de Negocio');
    expect(component.notification()?.detail).toBe('El asiento no está balanceado.');
    expect(component.notification()?.errors).toContain('lines: El debe y haber deben ser iguales');
  });

  it('should switch tabs correctly and load chart of accounts when coa tab is selected', () => {
    fixture.detectChanges();
    expect(component.activeTab()).toBe('dashboard');
    
    // Switch to coa tab
    component.activeTab.set('coa');
    fixture.detectChanges();
    
    expect(component.activeTab()).toBe('coa');
    expect(accountServiceSpy.getGroups).toHaveBeenCalledWith(component.activeTenantId());
  });

  it('should switch to dashboard tab and trigger dashboard loading', () => {
    component.activeTab.set('entry');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('entry');
    
    // Switch to dashboard tab
    component.activeTab.set('dashboard');
    fixture.detectChanges();
    
    expect(component.activeTab()).toBe('dashboard');
    expect(dashboardServiceSpy.getDashboard).toHaveBeenCalled();
  });

  it('should switch languages correctly and call TranslationStateService.setLanguage', () => {
    fixture.detectChanges();
    const translationService = TestBed.inject(TranslationStateService);
    
    component.onLanguageChange('es');
    fixture.detectChanges();

    expect(translationService.setLanguage).toHaveBeenCalledWith('es');
  });
});
