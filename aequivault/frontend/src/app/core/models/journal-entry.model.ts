export interface JournalLineRequest {
  id?: string;
  ledgerAccountId: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
}

export interface JournalEntryRequest {
  id?: string;
  date: string;
  description: string;
  status: 'DRAFT' | 'POSTED';
  entryNumber?: string;
  currency: string;
  lines: JournalLineRequest[];
}

export interface JournalLineResponse {
  id: string;
  ledgerAccountId: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
}

export interface JournalEntryResponse {
  id: string;
  tenantId: string;
  date: string;
  description: string;
  status: 'DRAFT' | 'POSTED';
  entryNumber: string;
  currency: string;
  lines: JournalLineResponse[];
}

export interface PagedJournalResponse {
  content: JournalEntryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
