import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LedgerReportDto } from '../models/ledger.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {
  private baseUrl = `${environment.apiUrl}/ledger`;

  constructor(private http: HttpClient) {}

  getLedgerReport(tenantId: string, accountId: string, startDate: string, endDate: string): Observable<LedgerReportDto> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
      
    return this.http.get<LedgerReportDto>(`${this.baseUrl}/${accountId}`, { params });
  }
}
