package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.domain.model.AccountBalanceDto;
import com.aequivault.domain.model.DailyBalanceDto;
import com.aequivault.domain.model.LedgerLineDto;
import com.aequivault.domain.model.LedgerReportDto;
import com.aequivault.domain.model.TrialBalanceReportDto;
import com.aequivault.domain.repository.ReportRepository;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
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
    private final SpringDataLedgerAccountRepository springDataLedgerAccountRepository;

    public ReportRepositoryImpl(SpringDataReportRepository springDataReportRepository,
                                SpringDataLedgerAccountRepository springDataLedgerAccountRepository) {
        this.springDataReportRepository = springDataReportRepository;
        this.springDataLedgerAccountRepository = springDataLedgerAccountRepository;
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

    @Override
    @Transactional(readOnly = true)
    public LedgerReportDto getLedgerReport(UUID tenantId, UUID accountId, LocalDate startDate, LocalDate endDate) {
        LedgerAccountEntity account = springDataLedgerAccountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        if (!account.getTenantId().equals(tenantId)) {
            throw new SecurityException("Access Denied: Tenant ID mismatch.");
        }

        BigDecimal initialBalance = springDataReportRepository.getInitialBalance(accountId, startDate);
        List<LedgerLineProjection> lineProjections = springDataReportRepository.getLedgerLines(accountId, startDate, endDate);

        List<LedgerLineDto> lines = lineProjections.stream()
                .map(p -> new LedgerLineDto(
                        p.getDate(),
                        p.getEntryId(),
                        p.getEntryNumber(),
                        p.getDescription(),
                        p.getDebit(),
                        p.getCredit(),
                        p.getRunningBalance()
                ))
                .toList();

        BigDecimal finalBalance = lines.isEmpty() ? initialBalance : lines.get(lines.size() - 1).getRunningBalance();

        return new LedgerReportDto(
                accountId,
                account.getCode(),
                account.getName(),
                startDate,
                endDate,
                initialBalance,
                finalBalance,
                lines
        );
    }
}
