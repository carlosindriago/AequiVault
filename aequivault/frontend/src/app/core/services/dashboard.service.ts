import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDto } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardUrl = 'http://localhost:8080/api/v1/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard(tenantId: string, startDate: string, endDate: string, cashAccountId: string): Observable<DashboardDto> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('cashAccountId', cashAccountId);

    return this.http.get<DashboardDto>(this.dashboardUrl, { headers, params });
  }
}
