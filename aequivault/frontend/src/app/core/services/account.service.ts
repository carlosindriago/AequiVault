import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LedgerAccountDto } from '../models/ledger-account.model';
import { AccountGroupDto, AccountGroupRequest } from '../models/account-group.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get accountsUrl() { return `${this.configService.apiUrl}/ledger/accounts`; }
  private get groupsUrl() { return `${this.configService.apiUrl}/ledger/groups`; }

  constructor() {}

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
