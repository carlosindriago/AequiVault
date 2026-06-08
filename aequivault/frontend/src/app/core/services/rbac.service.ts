import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
}

export interface RoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface UserCreateRequest {
  email: string;
  password?: string;
  roleIds: string[];
}

export interface UserResponse {
  id: string;
  email: string;
  status: string;
  roles: RoleResponse[];
}

export interface UserStatusChangeRequest {
  adminPassword: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private get baseUrl() { return this.configService.apiUrl; }

  readonly permissions = signal<PermissionResponse[]>([]);
  readonly roles = signal<RoleResponse[]>([]);
  readonly users = signal<UserResponse[]>([]);

  loadPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<PermissionResponse[]>(`${this.baseUrl}/permissions`).pipe(
      tap(perms => this.permissions.set(perms))
    );
  }

  loadRoles(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${this.baseUrl}/roles`).pipe(
      tap(roles => this.roles.set(roles))
    );
  }

  createRole(role: RoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(`${this.baseUrl}/roles`, role).pipe(
      tap(newRole => {
        this.roles.update(list => [...list, newRole]);
      })
    );
  }

  updateRole(id: string, role: RoleRequest): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.baseUrl}/roles/${id}`, role).pipe(
      tap(updated => {
        this.roles.update(list => list.map(r => r.id === id ? updated : r));
      })
    );
  }

  loadUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/users`).pipe(
      tap(users => this.users.set(users))
    );
  }

  createUser(user: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/users`, user).pipe(
      tap(newUser => {
        this.users.update(list => [...list, newUser]);
      })
    );
  }

  deactivateUser(id: string, request: UserStatusChangeRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/${id}/deactivate`, request).pipe(
      tap(() => {
        this.users.update(list =>
          list.map(u => u.id === id ? { ...u, status: 'INACTIVE' } : u)
        );
      })
    );
  }

  reactivateUser(id: string, request: UserStatusChangeRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/${id}/reactivate`, request).pipe(
      tap(() => {
        this.users.update(list =>
          list.map(u => u.id === id ? { ...u, status: 'ACTIVE' } : u)
        );
      })
    );
  }
}
