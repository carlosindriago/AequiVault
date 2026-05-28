export interface LedgerLineDto {
  date: string;
  entryId: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface LedgerReportDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  lines: LedgerLineDto[];
}
