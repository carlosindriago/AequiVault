import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Notification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  targetRole?: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notifications`;

  readonly unreadNotifications = signal<Notification[]>([]);

  loadUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl).pipe(
      tap(notifications => {
        this.unreadNotifications.set(notifications);
      })
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.unreadNotifications.update(list => list.filter(n => n.id !== id));
      })
    );
  }
}
