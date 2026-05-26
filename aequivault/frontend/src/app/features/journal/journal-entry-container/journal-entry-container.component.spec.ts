import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalEntryContainerComponent } from './journal-entry-container.component';
import { AccountService } from '../../../core/services/account.service';
import { JournalService } from '../../../core/services/journal.service';
import { JournalEntryStateService } from '../../../core/services/journal-entry-state.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { JournalEntryResponse } from '../../../core/models/journal-entry.model';

describe('JournalEntryContainerComponent', () => {
  let component: JournalEntryContainerComponent;
  let fixture: ComponentFixture<JournalEntryContainerComponent>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let journalServiceSpy: jasmine.SpyObj<JournalService>;
  let stateService: JournalEntryStateService;

  const mockAccounts: LedgerAccountDto[] = [
    { id: '1', code: '1.1.01', name: 'Caja', groupId: 'g1', type: 'ASSET' },
    { id: '2', code: '2.1.01', name: 'Proveedores', groupId: 'g2', type: 'LIABILITY' }
  ];

  beforeEach(async () => {
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAccounts', 'createAccount', 'getGroups', 'createGroup', 'deleteGroup']);
    journalServiceSpy = jasmine.createSpyObj('JournalService', ['createEntry', 'getEntry']);

    // Default mock responses
    accountServiceSpy.getAccounts.and.returnValue(of(mockAccounts));
    accountServiceSpy.getGroups.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [JournalEntryContainerComponent],
      providers: [
        JournalEntryStateService,
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: JournalService, useValue: journalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalEntryContainerComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(JournalEntryStateService);
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
    expect(component.notification()?.title).toBe('Error al cargar cuentas');
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
    expect(component.activeTab()).toBe('entry');
    
    // Switch to coa tab
    component.activeTab.set('coa');
    fixture.detectChanges();
    
    expect(component.activeTab()).toBe('coa');
    expect(accountServiceSpy.getGroups).toHaveBeenCalledWith(component.activeTenantId());
  });
});
