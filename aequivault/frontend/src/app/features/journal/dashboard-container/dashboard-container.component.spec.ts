import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardContainerComponent } from './dashboard-container.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AccountService } from '../../../core/services/account.service';
import { of, throwError } from 'rxjs';
import { LedgerAccountDto } from '../../../core/models/ledger-account.model';
import { DashboardDto } from '../../../core/models/dashboard.model';
import { FormsModule } from '@angular/forms';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('DashboardContainerComponent', () => {
  let component: DashboardContainerComponent;
  let fixture: ComponentFixture<DashboardContainerComponent>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;
  let mockAccountService: jasmine.SpyObj<AccountService>;

  const mockAccounts: LedgerAccountDto[] = [
    { id: 'acc-1', groupId: 'g-1', code: '1.01.01', name: 'Caja General', type: 'ASSET' },
    { id: 'acc-2', groupId: 'g-1', code: '1.02.01', name: 'Banco Principal', type: 'ASSET' },
    { id: 'acc-3', groupId: 'g-2', code: '2.01.01', name: 'Proveedores', type: 'LIABILITY' }
  ];

  const mockDashboardData: DashboardDto = {
    totalAssets: 50000,
    totalLiabilities: 20000,
    netEquity: 30000,
    liquidityTrend: [
      { date: '2026-05-01', balance: 10000 },
      { date: '2026-05-15', balance: 12000 }
    ]
  };

  beforeEach(async () => {
    mockDashboardService = jasmine.createSpyObj('DashboardService', ['getDashboard']);
    mockAccountService = jasmine.createSpyObj('AccountService', ['getAccounts']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardContainerComponent,
        FormsModule,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' },
        })
      ],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: AccountService, useValue: mockAccountService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardContainerComponent);
    component = fixture.componentInstance;
    component.tenantId = 'tenant-123';
  });

  it('should create', () => {
    mockAccountService.getAccounts.and.returnValue(of(mockAccounts));
    mockDashboardService.getDashboard.and.returnValue(of(mockDashboardData));
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should resolve accounts and trigger initial dashboard fetch', () => {
    mockAccountService.getAccounts.and.returnValue(of(mockAccounts));
    mockDashboardService.getDashboard.and.returnValue(of(mockDashboardData));
    fixture.detectChanges();

    expect(component.cashAccounts().length).toBe(2);
    expect(component.selectedCashAccountId()).toBe('acc-1');

    expect(mockDashboardService.getDashboard).toHaveBeenCalledWith(
      'tenant-123',
      component.startDate(),
      component.endDate(),
      'acc-1'
    );
    expect(component.dashboardData()).toEqual(mockDashboardData);
  });

  it('should update dashboard when cash account is changed', () => {
    mockAccountService.getAccounts.and.returnValue(of(mockAccounts));
    mockDashboardService.getDashboard.and.returnValue(of(mockDashboardData));
    fixture.detectChanges();

    mockDashboardService.getDashboard.calls.reset();
    component.onCashAccountChange('acc-2');
    fixture.detectChanges();

    expect(component.selectedCashAccountId()).toBe('acc-2');
    expect(mockDashboardService.getDashboard).toHaveBeenCalledWith(
      'tenant-123',
      component.startDate(),
      component.endDate(),
      'acc-2'
    );
  });

  it('should show alert if no asset accounts exist', () => {
    mockAccountService.getAccounts.and.returnValue(of([
      { id: 'acc-3', groupId: 'g-2', code: '2.01.01', name: 'Proveedores', type: 'LIABILITY' }
    ]));
    fixture.detectChanges();

    expect(component.cashAccounts().length).toBe(0);
    expect(component.errorMsg()).toBe('dashboard.errors.no_assets');
    expect(mockDashboardService.getDashboard).not.toHaveBeenCalled();
  });

  it('should handle service fetch errors gracefully', () => {
    mockAccountService.getAccounts.and.returnValue(of(mockAccounts));
    mockDashboardService.getDashboard.and.returnValue(throwError(() => ({
      error: { detail: 'Database error calculating daily balances' }
    })));
    fixture.detectChanges();

    expect(component.errorMsg()).toBe('Database error calculating daily balances');
    expect(component.dashboardData()).toBeNull();
  });
});
