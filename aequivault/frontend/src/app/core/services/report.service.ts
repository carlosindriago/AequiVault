import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrialBalanceReportDto, FinancialReportDto } from '../models/report.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private trialBalanceUrl = `${environment.apiUrl}/reports/trial-balance`;
  private balanceSheetUrl = `${environment.apiUrl}/reports/balance-sheet`;
  private profitAndLossUrl = `${environment.apiUrl}/reports/profit-and-loss`;

  constructor(private http: HttpClient) {}

  getTrialBalance(tenantId: string, startDate: string, endDate: string): Observable<TrialBalanceReportDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<TrialBalanceReportDto>(this.trialBalanceUrl, { params });
  }

  getBalanceSheet(tenantId: string, startDate: string, endDate: string): Observable<FinancialReportDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<FinancialReportDto>(this.balanceSheetUrl, { params });
  }

  getProfitAndLoss(tenantId: string, startDate: string, endDate: string): Observable<FinancialReportDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<FinancialReportDto>(this.profitAndLossUrl, { params });
  }
}
