import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrialBalanceReportDto } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private reportUrl = 'http://localhost:8080/api/v1/reports/trial-balance';

  constructor(private http: HttpClient) {}

  getTrialBalance(tenantId: string, startDate: string, endDate: string): Observable<TrialBalanceReportDto> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<TrialBalanceReportDto>(this.reportUrl, { headers, params });
  }
}
