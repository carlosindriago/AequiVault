import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemoStartResponse } from '../models/auth.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class DemoService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private get baseUrl() { return this.configService.apiUrl; }

  /**
   * Starts an ephemeral demo tenant on the backend.
   * The backend will create a sandbox tenant, seed it with realistic data,
   * and return a temporary JWT plus expiration metadata.
   */
  startDemo(): Observable<DemoStartResponse> {
    return this.http.post<DemoStartResponse>(`${this.baseUrl}/demo/start`, {});
  }
}
