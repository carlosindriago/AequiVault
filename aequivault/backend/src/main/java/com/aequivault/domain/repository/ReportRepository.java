package com.aequivault.domain.repository;

import com.aequivault.domain.model.DailyBalanceDto;
import com.aequivault.domain.model.LedgerReportDto;
import com.aequivault.domain.model.TrialBalanceReportDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportRepository {
    TrialBalanceReportDto generateTrialBalance(UUID tenantId, LocalDate startDate, LocalDate endDate);
    BigDecimal getNetBalanceForGroupPath(UUID tenantId, String rootPath);
    List<DailyBalanceDto> getDailyBalances(UUID tenantId, UUID accountId, LocalDate startDate, LocalDate endDate);
    LedgerReportDto getLedgerReport(UUID tenantId, UUID accountId, LocalDate startDate, LocalDate endDate);
}
