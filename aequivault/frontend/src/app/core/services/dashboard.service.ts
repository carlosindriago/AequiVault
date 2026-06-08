import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDto } from '../models/dashboard.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get dashboardUrl() { return `${this.configService.apiUrl}/dashboard`; }

  constructor() {}

  getDashboard(tenantId: string, startDate: string, endDate: string, cashAccountId: string): Observable<DashboardDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('cashAccountId', cashAccountId);

    return this.http.get<DashboardDto>(this.dashboardUrl, { params });
  }
}
