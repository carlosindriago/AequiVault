import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SetupInitRequest, SetupInitResponse, LoginRequest, LoginResponse, SetupStatusResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<{ email: string; tenantId: string } | null>(null);

  constructor() {
    this.loadSession();
  }

  checkSetupStatus(): Observable<SetupStatusResponse> {
    return this.http.get<SetupStatusResponse>(`${this.baseUrl}/setup/status`);
  }

  setupInit(request: SetupInitRequest): Observable<SetupInitResponse> {
    return this.http.post<SetupInitResponse>(`${this.baseUrl}/setup/init`, request).pipe(
      tap(res => this.handleAuthSuccess(res.token, res.email, res.tenantId))
    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request).pipe(
      tap(res => this.handleAuthSuccess(res.token, res.email, res.tenantId))
    );
  }

  logout(): void {
    localStorage.removeItem('aequivault_token');
    localStorage.removeItem('aequivault_user_email');
    localStorage.removeItem('aequivault_tenant_id');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('aequivault_token');
  }

  private loadSession(): void {
    if (typeof window !== 'undefined') {
      const token = this.getToken();
      const email = localStorage.getItem('aequivault_user_email');
      const tenantId = localStorage.getItem('aequivault_tenant_id');

      if (token && email && tenantId) {
        this.isAuthenticated.set(true);
        this.currentUser.set({ email, tenantId });
      }
    }
  }

  private handleAuthSuccess(token: string, email: string, tenantId: string): void {
    localStorage.setItem('aequivault_token', token);
    localStorage.setItem('aequivault_user_email', email);
    localStorage.setItem('aequivault_tenant_id', tenantId);
    this.isAuthenticated.set(true);
    this.currentUser.set({ email, tenantId });
  }
}
