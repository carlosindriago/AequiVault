import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LedgerContainerComponent } from './ledger-container.component';
import { AccountService } from '../../../core/services/account.service';
import { LedgerService } from '../../../core/services/ledger.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { LedgerReportDto } from '../../../core/models/ledger.model';

describe('LedgerContainerComponent', () => {
  let component: LedgerContainerComponent;
  let fixture: ComponentFixture<LedgerContainerComponent>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let ledgerServiceSpy: jasmine.SpyObj<LedgerService>;

  const mockAccounts: LedgerAccountDto[] = [
    { id: 'acc-1', code: '1.01', name: 'Caja', groupId: 'g1', type: 'ASSET' },
    { id: 'acc-2', code: '2.01', name: 'Proveedores', groupId: 'g2', type: 'LIABILITY' }
  ];

  const mockReport: LedgerReportDto = {
    accountId: 'acc-1',
    accountCode: '1.01',
    accountName: 'Caja',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    initialBalance: 100.0,
    finalBalance: 150.0,
    lines: []
  };

  beforeEach(async () => {
    const accSpy = jasmine.createSpyObj('AccountService', ['getAccounts']);
    const ledSpy = jasmine.createSpyObj('LedgerService', ['getLedgerReport']);

    await TestBed.configureTestingModule({
      imports: [
        LedgerContainerComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en',
          },
        })
      ],
      providers: [
        { provide: AccountService, useValue: accSpy },
        { provide: LedgerService, useValue: ledSpy }
      ]
    }).compileComponents();

    accountServiceSpy = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    ledgerServiceSpy = TestBed.inject(LedgerService) as jasmine.SpyObj<LedgerService>;

    accountServiceSpy.getAccounts.and.returnValue(of(mockAccounts));
    ledgerServiceSpy.getLedgerReport.and.returnValue(of(mockReport));

    fixture = TestBed.createComponent(LedgerContainerComponent);
    component = fixture.componentInstance;
    component.tenantId = '212f7927-ed0d-495c-b39b-94364d5e2f9b';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    expect(accountServiceSpy.getAccounts).toHaveBeenCalledWith('212f7927-ed0d-495c-b39b-94364d5e2f9b');
    expect(component.accounts().length).toBe(2);
  });

  it('should fetch ledger report when account changes', () => {
    component.onAccountChange('acc-1');
    expect(component.selectedAccountId()).toBe('acc-1');
    expect(ledgerServiceSpy.getLedgerReport).toHaveBeenCalledWith(
      '212f7927-ed0d-495c-b39b-94364d5e2f9b',
      'acc-1',
      component.startDate(),
      component.endDate()
    );
    expect(component.ledgerData()).toEqual(mockReport);
  });

  it('should fetch ledger report when dates change', () => {
    component.selectedAccountId.set('acc-1');
    component.onStartDateChange('2026-02-01');
    expect(component.startDate()).toBe('2026-02-01');
    expect(ledgerServiceSpy.getLedgerReport).toHaveBeenCalled();
  });

  it('should show error banner when ledger fetch fails', () => {
    ledgerServiceSpy.getLedgerReport.and.returnValue(throwError(() => new Error('Error loading ledger')));
    component.selectedAccountId.set('acc-1');
    component.fetchLedger();
    fixture.detectChanges();

    expect(component.errorMsg()).toBe('ledger.errors.load_ledger');
    expect(component.ledgerData()).toBeNull();
  });
});
