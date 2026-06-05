import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DemoService } from './demo.service';
import { DemoStartResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

describe('DemoService', () => {
  let service: DemoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DemoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DemoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST to /demo/start and return the response payload', (done) => {
    const mockResponse: DemoStartResponse = {
      token: 'jwt-token',
      tenantId: 'tenant-uuid',
      tenantName: 'Demo - tenant-uuid',
      expiresAt: '2026-06-04T18:00:00',
      credentials: {
        email: 'demo+tenant-uuid@demo.aequivault.local',
        password: 'secret-pass',
        role: 'SUPER_ADMIN'
      }
    };

    service.startDemo().subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/demo/start`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });
});
