import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SetupInitRequest, SetupInitResponse, LoginRequest, LoginResponse, SetupStatusResponse, DemoStartResponse } from '../models/auth.model';

const TOKEN_KEY = 'aequivault_token';
const EMAIL_KEY = 'aequivault_user_email';
const TENANT_KEY = 'aequivault_tenant_id';
const DEMO_EXPIRES_KEY = 'aequivault_demo_expires_at';
const DEMO_FLAG_KEY = 'aequivault_demo_mode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<{ email: string; tenantId: string } | null>(null);
  readonly isDemoSession = signal<boolean>(false);
  readonly demoExpiresAt = signal<string | null>(null);

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

  /**
   * Adopts a demo session returned by /api/demo/start. The token is persisted
   * like a normal login but the demo flag and expiration timestamp are also
   * tracked so the UI can show the ephemeral badge.
   */
  adoptDemoSession(response: DemoStartResponse): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(EMAIL_KEY, response.credentials.email);
    localStorage.setItem(TENANT_KEY, response.tenantId);
    localStorage.setItem(DEMO_EXPIRES_KEY, response.expiresAt);
    localStorage.setItem(DEMO_FLAG_KEY, 'true');
    this.isAuthenticated.set(true);
    this.currentUser.set({ email: response.credentials.email, tenantId: response.tenantId });
    this.isDemoSession.set(true);
    this.demoExpiresAt.set(response.expiresAt);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(TENANT_KEY);
      localStorage.removeItem(DEMO_EXPIRES_KEY);
      localStorage.removeItem(DEMO_FLAG_KEY);
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.isDemoSession.set(false);
    this.demoExpiresAt.set(null);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadSession(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const token = this.getToken();
    const email = localStorage.getItem(EMAIL_KEY);
    const tenantId = localStorage.getItem(TENANT_KEY);

    if (token && email && tenantId) {
      this.isAuthenticated.set(true);
      this.currentUser.set({ email, tenantId });
      const demoFlag = localStorage.getItem(DEMO_FLAG_KEY) === 'true';
      const expiresAt = localStorage.getItem(DEMO_EXPIRES_KEY);
      this.isDemoSession.set(demoFlag);
      this.demoExpiresAt.set(expiresAt);
    }
  }

  private handleAuthSuccess(token: string, email: string, tenantId: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(TENANT_KEY, tenantId);
    localStorage.removeItem(DEMO_EXPIRES_KEY);
    localStorage.removeItem(DEMO_FLAG_KEY);
    this.isAuthenticated.set(true);
    this.currentUser.set({ email, tenantId });
    this.isDemoSession.set(false);
    this.demoExpiresAt.set(null);
  }
}
