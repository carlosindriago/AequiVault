import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LedgerAccountDto } from '../models/ledger-account.model';
import { AccountGroupDto, AccountGroupRequest } from '../models/account-group.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private accountsUrl = 'http://localhost:8080/api/v1/ledger/accounts';
  private groupsUrl = 'http://localhost:8080/api/v1/ledger/groups';

  constructor(private http: HttpClient) {}

  getAccounts(tenantId: string): Observable<LedgerAccountDto[]> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.get<LedgerAccountDto[]>(this.accountsUrl, { headers });
  }

  createAccount(account: LedgerAccountDto, tenantId: string): Observable<LedgerAccountDto> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.post<LedgerAccountDto>(this.accountsUrl, account, { headers });
  }

  getGroups(tenantId: string): Observable<AccountGroupDto[]> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.get<AccountGroupDto[]>(this.groupsUrl, { headers });
  }

  createGroup(request: AccountGroupRequest, tenantId: string): Observable<AccountGroupDto> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.post<AccountGroupDto>(this.groupsUrl, request, { headers });
  }

  deleteGroup(id: string, tenantId: string): Observable<void> {
    const headers = new HttpHeaders().set('X-Tenant-ID', tenantId);
    return this.http.delete<void>(`${this.groupsUrl}/${id}`, { headers });
  }
}
