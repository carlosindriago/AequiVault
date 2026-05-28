package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.domain.model.AccountBalanceDto;
import com.aequivault.domain.model.DailyBalanceDto;
import com.aequivault.domain.model.FinancialReportDto;
import com.aequivault.domain.model.FinancialReportLineDto;
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

    @Override
    @Transactional(readOnly = true)
    public FinancialReportDto generateBalanceSheet(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        List<FinancialReportLineProjection> bsProjections = springDataReportRepository.getBalanceSheet(startDate, endDate);
        List<FinancialReportLineProjection> pnlProjections = springDataReportRepository.getProfitAndLoss(startDate, endDate);

        BigDecimal totalRevenues = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (FinancialReportLineProjection p : pnlProjections) {
            if ("4".equals(p.getCode())) {
                totalRevenues = p.getBalance() != null ? p.getBalance() : BigDecimal.ZERO;
            } else if ("5".equals(p.getCode())) {
                totalExpenses = p.getBalance() != null ? p.getBalance() : BigDecimal.ZERO;
            }
        }

        BigDecimal netIncome = totalRevenues.subtract(totalExpenses);

        List<FinancialReportLineDto> lines = new java.util.ArrayList<>();
        for (FinancialReportLineProjection p : bsProjections) {
            String code = p.getCode();
            BigDecimal balance = p.getBalance() != null ? p.getBalance() : BigDecimal.ZERO;
            Integer depth = p.getDepth() != null ? p.getDepth() : 0;
            Boolean isGroup = p.getIsGroup() != null ? p.getIsGroup() : false;

            if ("3".equals(code)) {
                balance = balance.add(netIncome);
            }

            lines.add(new FinancialReportLineDto(
                code,
                p.getName(),
                balance,
                depth,
                isGroup
            ));
        }

        FinancialReportLineDto netIncomeLine = new FinancialReportLineDto(
            "3.99",
            "Utilidad del Ejercicio",
            netIncome,
            2,
            false
        );

        int insertIndex = -1;
        for (int i = 0; i < lines.size(); i++) {
            if (lines.get(i).code().startsWith("3")) {
                insertIndex = i;
            }
        }

        if (insertIndex != -1) {
            lines.add(insertIndex + 1, netIncomeLine);
        } else {
            lines.add(netIncomeLine);
        }

        return new FinancialReportDto(startDate, endDate, lines);
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialReportDto generateProfitAndLoss(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        List<FinancialReportLineProjection> projections = springDataReportRepository.getProfitAndLoss(startDate, endDate);
        List<FinancialReportLineDto> lines = projections.stream()
                .map(p -> new FinancialReportLineDto(
                        p.getCode(),
                        p.getName(),
                        p.getBalance() != null ? p.getBalance() : BigDecimal.ZERO,
                        p.getDepth() != null ? p.getDepth() : 0,
                        p.getIsGroup() != null ? p.getIsGroup() : false
                ))
                .toList();
        return new FinancialReportDto(startDate, endDate, lines);
    }
}
