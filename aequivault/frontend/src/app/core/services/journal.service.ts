import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JournalEntryRequest, JournalEntryResponse } from '../models/journal-entry.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = `${environment.apiUrl}/journal/entries`;

  constructor(private http: HttpClient) {}

  createEntry(entry: JournalEntryRequest, tenantId: string): Observable<JournalEntryResponse> {
    return this.http.post<JournalEntryResponse>(this.apiUrl, entry);
  }

  getEntry(id: string, tenantId: string): Observable<JournalEntryResponse> {
    return this.http.get<JournalEntryResponse>(`${this.apiUrl}/${id}`);
  }
}
