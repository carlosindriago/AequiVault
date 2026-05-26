import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JournalEntryRequest, JournalEntryResponse } from '../models/journal-entry.model';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = 'http://localhost:8080/api/v1/journal/entries';

  constructor(private http: HttpClient) {}

  createEntry(entry: JournalEntryRequest, tenantId: string): Observable<JournalEntryResponse> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.post<JournalEntryResponse>(this.apiUrl, entry, { headers });
  }

  getEntry(id: string, tenantId: string): Observable<JournalEntryResponse> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.get<JournalEntryResponse>(`${this.apiUrl}/${id}`, { headers });
  }
}
