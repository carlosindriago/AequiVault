export interface DailyBalanceDto {
  date: string;
  balance: number;
}

export interface DashboardDto {
  totalAssets: number;
  totalLiabilities: number;
  netEquity: number;
  liquidityTrend: DailyBalanceDto[];
}
