import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportContainerComponent } from './report-container.component';
import { ReportService } from '../../../core/services/report.service';
import { of, throwError } from 'rxjs';
import { TrialBalanceReportDto, FinancialReportDto } from '../../../core/models/report.model';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('ReportContainerComponent', () => {
  let component: ReportContainerComponent;
  let fixture: ComponentFixture<ReportContainerComponent>;
  let mockReportService: jasmine.SpyObj<ReportService>;

  const mockReport: TrialBalanceReportDto = {
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    balances: [
      {
        groupCode: '1',
        groupName: 'Activos',
        accountCode: '1.01',
        accountName: 'Caja',
        totalDebit: 100,
        totalCredit: 0,
        netBalance: 100
      }
    ],
    totalDebitSum: 100,
    totalCreditSum: 0
  };

  const mockFinancialReport: FinancialReportDto = {
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    lines: [
      {
        code: '1',
        name: 'Activos',
        balance: 100,
        depth: 1,
        isGroup: true
      },
      {
        code: '1.01',
        name: 'Caja',
        balance: 100,
        depth: 2,
        isGroup: false
      }
    ]
  };

  beforeEach(async () => {
    mockReportService = jasmine.createSpyObj<ReportService>('ReportService', [
      'getTrialBalance',
      'getBalanceSheet',
      'getProfitAndLoss'
    ]);
    mockReportService.getTrialBalance.and.returnValue(of(mockReport));
    mockReportService.getBalanceSheet.and.returnValue(of(mockFinancialReport));
    mockReportService.getProfitAndLoss.and.returnValue(of(mockFinancialReport));

    await TestBed.configureTestingModule({
      imports: [
        ReportContainerComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' },
        })
      ],
      providers: [
        { provide: ReportService, useValue: mockReportService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportContainerComponent);
    component = fixture.componentInstance;
    component.tenantId = 'tenant-A';
  });

  it('should create and initialize default dates and fetch trial balance by default', () => {
    fixture.detectChanges(); // triggers ngOnInit

    expect(component).toBeTruthy();
    const currentYear = new Date().getFullYear();
    expect(component.startDate()).toBe(`${currentYear}-01-01`);
    expect(component.endDate()).toBe(`${currentYear}-12-31`);
    expect(mockReportService.getTrialBalance).toHaveBeenCalledWith('tenant-A', `${currentYear}-01-01`, `${currentYear}-12-31`);
    expect(component.report()).toEqual(mockReport);
  });

  it('should fetch balance sheet report when selectedReportType is balance-sheet', () => {
    fixture.detectChanges(); // init -> trial balance fetched
    mockReportService.getBalanceSheet.calls.reset();

    component.setReportType('balance-sheet');

    const currentYear = new Date().getFullYear();
    expect(mockReportService.getBalanceSheet).toHaveBeenCalledWith('tenant-A', `${currentYear}-01-01`, `${currentYear}-12-31`);
    expect(component.financialReport()).toEqual(mockFinancialReport);
  });

  it('should fetch P&L report when selectedReportType is pnl', () => {
    fixture.detectChanges(); // init -> trial balance fetched
    mockReportService.getProfitAndLoss.calls.reset();

    component.setReportType('pnl');

    const currentYear = new Date().getFullYear();
    expect(mockReportService.getProfitAndLoss).toHaveBeenCalledWith('tenant-A', `${currentYear}-01-01`, `${currentYear}-12-31`);
    expect(component.financialReport()).toEqual(mockFinancialReport);
  });

  it('should fetch new report when tenantId changes via ngOnChanges', () => {
    fixture.detectChanges(); // init
    mockReportService.getTrialBalance.calls.reset();

    component.tenantId = 'tenant-B';
    component.ngOnChanges();

    const currentYear = new Date().getFullYear();
    expect(mockReportService.getTrialBalance).toHaveBeenCalledWith('tenant-B', `${currentYear}-01-01`, `${currentYear}-12-31`);
  });

  it('should fetch report on date change', () => {
    fixture.detectChanges(); // init
    mockReportService.getTrialBalance.calls.reset();

    component.onStartDateChange('2026-05-01');
    expect(component.startDate()).toBe('2026-05-01');
    expect(mockReportService.getTrialBalance).toHaveBeenCalledWith('tenant-A', '2026-05-01', '2026-12-31');
  });

  it('should handle API errors and show error banner', () => {
    mockReportService.getTrialBalance.and.returnValue(throwError(() => ({
      error: { detail: 'Error consolidando saldos' }
    })));

    fixture.detectChanges(); // ngOnInit

    expect(component.report()).toBeNull();
    expect(component.errorMsg()).toBe('Error consolidando saldos');

    const compiled = fixture.nativeElement as HTMLElement;
    const errorBanner = compiled.querySelector('.error-banner');
    expect(errorBanner).toBeTruthy();
    expect(errorBanner?.textContent).toContain('Error consolidando saldos');
  });
});
