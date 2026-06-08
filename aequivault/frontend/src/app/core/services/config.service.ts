import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  roles: {
    admin: string;
    accountant: string;
    viewer: string;
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  private config: AppConfig | null = null;

  loadConfig(): Promise<void> {
    return firstValueFrom(
      this.http.get<AppConfig>('/assets/config.json')
    ).then(config => {
      this.config = config;
    }).catch(err => {
      console.error('Could not load configuration file config.json', err);
      // Fallback to defaults if loading fails
      this.config = {
        apiUrl: '/api/v1',
        roles: {
          admin: 'ADMIN',
          accountant: 'ACCOUNTANT',
          viewer: 'VIEWER'
        }
      };
    });
  }

  get apiUrl(): string {
    return this.config?.apiUrl || '/api/v1';
  }

  get roles(): { admin: string; accountant: string; viewer: string; [key: string]: string } {
    return this.config?.roles || {
      admin: 'ADMIN',
      accountant: 'ACCOUNTANT',
      viewer: 'VIEWER'
    };
  }
}
