import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrialBalanceReportDto, FinancialReportDto } from '../models/report.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get trialBalanceUrl() { return `${this.configService.apiUrl}/reports/trial-balance`; }
  private get balanceSheetUrl() { return `${this.configService.apiUrl}/reports/balance-sheet`; }
  private get profitAndLossUrl() { return `${this.configService.apiUrl}/reports/profit-and-loss`; }

  constructor() {}

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
