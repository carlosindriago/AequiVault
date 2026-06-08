import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JournalEntryRequest, JournalEntryResponse } from '../models/journal-entry.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get apiUrl() { return `${this.configService.apiUrl}/journal/entries`; }

  constructor() {}

  createEntry(entry: JournalEntryRequest, tenantId: string): Observable<JournalEntryResponse> {
    return this.http.post<JournalEntryResponse>(this.apiUrl, entry);
  }

  getEntry(id: string, tenantId: string): Observable<JournalEntryResponse> {
    return this.http.get<JournalEntryResponse>(`${this.apiUrl}/${id}`);
  }
}
