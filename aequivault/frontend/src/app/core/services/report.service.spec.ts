import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { TrialBalanceReportDto, FinancialReportDto } from '../models/report.model';
import { environment } from '../../../environments/environment';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReportService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch trial balance report with correct URL, method and params', () => {
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

    const tenantId = 'tenant-id-123';
    const startDate = '2026-01-01';
    const endDate = '2026-12-31';

    service.getTrialBalance(tenantId, startDate, endDate).subscribe(report => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/reports/trial-balance` &&
      request.params.get('startDate') === startDate &&
      request.params.get('endDate') === endDate
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('should fetch balance sheet report with correct URL, method and params', () => {
    const mockFinancialReport: FinancialReportDto = {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      lines: [
        {
          code: '1',
          name: 'Assets',
          balance: 100,
          depth: 1,
          isGroup: true
        }
      ]
    };

    const tenantId = 'tenant-id-123';
    const startDate = '2026-01-01';
    const endDate = '2026-12-31';

    service.getBalanceSheet(tenantId, startDate, endDate).subscribe(report => {
      expect(report).toEqual(mockFinancialReport);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/reports/balance-sheet` &&
      request.params.get('startDate') === startDate &&
      request.params.get('endDate') === endDate
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockFinancialReport);
  });

  it('should fetch profit and loss report with correct URL, method and params', () => {
    const mockFinancialReport: FinancialReportDto = {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      lines: [
        {
          code: '4',
          name: 'Revenue',
          balance: 100,
          depth: 1,
          isGroup: true
        }
      ]
    };

    const tenantId = 'tenant-id-123';
    const startDate = '2026-01-01';
    const endDate = '2026-12-31';

    service.getProfitAndLoss(tenantId, startDate, endDate).subscribe(report => {
      expect(report).toEqual(mockFinancialReport);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/reports/profit-and-loss` &&
      request.params.get('startDate') === startDate &&
      request.params.get('endDate') === endDate
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockFinancialReport);
  });
});
