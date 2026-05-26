export interface AccountBalanceDto {
  groupCode: string;
  groupName: string;
  accountCode: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
}

export interface TrialBalanceReportDto {
  startDate: string;
  endDate: string;
  balances: AccountBalanceDto[];
  totalDebitSum: number;
  totalCreditSum: number;
}
