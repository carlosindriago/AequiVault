import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LedgerReportDto } from '../models/ledger.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get baseUrl() { return `${this.configService.apiUrl}/ledger`; }

  constructor() {}

  getLedgerReport(tenantId: string, accountId: string, startDate: string, endDate: string): Observable<LedgerReportDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<LedgerReportDto>(`${this.baseUrl}/${accountId}`, { params });
  }
}
