package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.domain.model.AccountBalanceDto;
import com.aequivault.domain.model.DailyBalanceDto;
import com.aequivault.domain.model.TrialBalanceReportDto;
import com.aequivault.domain.repository.ReportRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class ReportRepositoryImpl implements ReportRepository {

    private final SpringDataReportRepository springDataReportRepository;

    public ReportRepositoryImpl(SpringDataReportRepository springDataReportRepository) {
        this.springDataReportRepository = springDataReportRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public TrialBalanceReportDto generateTrialBalance(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        // Nota: La inyección de tenantId en la sesión de PostgreSQL (RLS) se gestiona de forma automática 
        // a nivel de request/conexión por el interceptor del backend.
        List<TrialBalanceProjection> projections = springDataReportRepository.getTrialBalance(startDate, endDate);

        List<AccountBalanceDto> balances = new ArrayList<>();
        BigDecimal totalDebitSum = BigDecimal.ZERO;
        BigDecimal totalCreditSum = BigDecimal.ZERO;

        for (TrialBalanceProjection proj : projections) {
            BigDecimal totalDebit = proj.getTotalDebit() != null ? proj.getTotalDebit() : BigDecimal.ZERO;
            BigDecimal totalCredit = proj.getTotalCredit() != null ? proj.getTotalCredit() : BigDecimal.ZERO;
            BigDecimal netBalance = totalDebit.subtract(totalCredit);

            AccountBalanceDto balanceDto = new AccountBalanceDto(
                proj.getGroupCode(),
                proj.getGroupName(),
                proj.getAccountCode(),
                proj.getAccountName(),
                totalDebit,
                totalCredit,
                netBalance
            );

            balances.add(balanceDto);
            totalDebitSum = totalDebitSum.add(totalDebit);
            totalCreditSum = totalCreditSum.add(totalCredit);
        }

        return new TrialBalanceReportDto(
            startDate,
            endDate,
            balances,
            totalDebitSum,
            totalCreditSum
        );
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getNetBalanceForGroupPath(UUID tenantId, String rootPath) {
        return springDataReportRepository.getNetBalanceForGroupPath(rootPath);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyBalanceDto> getDailyBalances(UUID tenantId, UUID accountId, LocalDate startDate, LocalDate endDate) {
        List<DailyBalanceProjection> projections = springDataReportRepository.getDailyBalances(accountId, startDate, endDate);
        return projections.stream()
                .map(p -> new DailyBalanceDto(p.getDate(), p.getBalance()))
                .toList();
    }
}
