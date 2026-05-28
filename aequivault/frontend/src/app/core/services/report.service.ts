import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrialBalanceReportDto } from '../models/report.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private reportUrl = `${environment.apiUrl}/reports/trial-balance`;

  constructor(private http: HttpClient) {}

  getTrialBalance(tenantId: string, startDate: string, endDate: string): Observable<TrialBalanceReportDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<TrialBalanceReportDto>(this.reportUrl, { params });
  }
}
