import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LedgerAccountDto } from '../models/ledger-account.model';
import { AccountGroupDto, AccountGroupRequest } from '../models/account-group.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private accountsUrl = `${environment.apiUrl}/ledger/accounts`;
  private groupsUrl = `${environment.apiUrl}/ledger/groups`;

  constructor(private http: HttpClient) {}

  getAccounts(tenantId: string): Observable<LedgerAccountDto[]> {
    return this.http.get<LedgerAccountDto[]>(this.accountsUrl);
  }

  createAccount(account: LedgerAccountDto, tenantId: string): Observable<LedgerAccountDto> {
    return this.http.post<LedgerAccountDto>(this.accountsUrl, account);
  }

  getGroups(tenantId: string): Observable<AccountGroupDto[]> {
    return this.http.get<AccountGroupDto[]>(this.groupsUrl);
  }

  createGroup(request: AccountGroupRequest, tenantId: string): Observable<AccountGroupDto> {
    return this.http.post<AccountGroupDto>(this.groupsUrl, request);
  }

  deleteGroup(id: string, tenantId: string): Observable<void> {
    return this.http.delete<void>(`${this.groupsUrl}/${id}`);
  }
}
