import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardDto } from '../models/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard data with correct URL, headers and params', () => {
    const mockDashboard: DashboardDto = {
      totalAssets: 10000,
      totalLiabilities: 4000,
      netEquity: 6000,
      liquidityTrend: [
        { date: '2026-05-01', balance: 5000 },
        { date: '2026-05-02', balance: 5200 }
      ]
    };

    const tenantId = 'tenant-id-123';
    const startDate = '2026-05-01';
    const endDate = '2026-05-30';
    const cashAccountId = 'uuid-cash-123';

    service.getDashboard(tenantId, startDate, endDate, cashAccountId).subscribe(data => {
      expect(data).toEqual(mockDashboard);
    });

    const req = httpMock.expectOne(request => 
      request.url === 'http://localhost:8080/api/v1/dashboard' &&
      request.params.get('startDate') === startDate &&
      request.params.get('endDate') === endDate &&
      request.params.get('cashAccountId') === cashAccountId
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Tenant-ID')).toBe(tenantId);

    req.flush(mockDashboard);
  });
});
