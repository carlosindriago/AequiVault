package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class LedgerReportDto {
    private UUID accountId;
    private String accountCode;
    private String accountName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal initialBalance;
    private BigDecimal finalBalance;
    private List<LedgerLineDto> lines;

    public LedgerReportDto() {}

    public LedgerReportDto(UUID accountId, String accountCode, String accountName, LocalDate startDate, LocalDate endDate, BigDecimal initialBalance, BigDecimal finalBalance, List<LedgerLineDto> lines) {
        this.accountId = accountId;
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.initialBalance = initialBalance;
        this.finalBalance = finalBalance;
        this.lines = lines;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getInitialBalance() {
        return initialBalance;
    }

    public void setInitialBalance(BigDecimal initialBalance) {
        this.initialBalance = initialBalance;
    }

    public BigDecimal getFinalBalance() {
        return finalBalance;
    }

    public void setFinalBalance(BigDecimal finalBalance) {
        this.finalBalance = finalBalance;
    }

    public List<LedgerLineDto> getLines() {
        return lines;
    }

    public void setLines(List<LedgerLineDto> lines) {
        this.lines = lines;
    }
}
