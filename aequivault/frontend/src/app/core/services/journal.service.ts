import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JournalEntryRequest,
  JournalEntryResponse,
  PagedJournalResponse
} from '../models/journal-entry.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get apiUrl() { return `${this.configService.apiUrl}/journal/entries`; }
  private get draftsUrl() { return `${this.configService.apiUrl}/journal/drafts`; }

  createEntry(entry: JournalEntryRequest, tenantId: string): Observable<JournalEntryResponse> {
    return this.http.post<JournalEntryResponse>(this.apiUrl, entry);
  }

  getEntry(id: string, tenantId: string): Observable<JournalEntryResponse> {
    return this.http.get<JournalEntryResponse>(`${this.apiUrl}/${id}`);
  }

  listEntries(filters: {
    status?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: number;
    size?: number;
  }): Observable<PagedJournalResponse> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.from)   params = params.set('from', filters.from);
    if (filters.to)     params = params.set('to', filters.to);
    if (filters.q)      params = params.set('q', filters.q);
    if (filters.page !== undefined) params = params.set('page', filters.page);
    if (filters.size !== undefined) params = params.set('size', filters.size);
    return this.http.get<PagedJournalResponse>(this.apiUrl, { params });
  }

  updateDraft(id: string, entry: JournalEntryRequest): Observable<JournalEntryResponse> {
    return this.http.put<JournalEntryResponse>(`${this.draftsUrl}/${id}`, entry);
  }

  publishDraft(id: string): Observable<JournalEntryResponse> {
    return this.http.post<JournalEntryResponse>(`${this.draftsUrl}/${id}/publish`, {});
  }
}
