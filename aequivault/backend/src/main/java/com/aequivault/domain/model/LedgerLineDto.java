package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class LedgerLineDto {
    private LocalDate date;
    private UUID entryId;
    private String entryNumber;
    private String description;
    private BigDecimal debit;
    private BigDecimal credit;
    private BigDecimal runningBalance;

    public LedgerLineDto() {}

    public LedgerLineDto(LocalDate date, UUID entryId, String entryNumber, String description, BigDecimal debit, BigDecimal credit, BigDecimal runningBalance) {
        this.date = date;
        this.entryId = entryId;
        this.entryNumber = entryNumber;
        this.description = description;
        this.debit = debit;
        this.credit = credit;
        this.runningBalance = runningBalance;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public UUID getEntryId() {
        return entryId;
    }

    public void setEntryId(UUID entryId) {
        this.entryId = entryId;
    }

    public String getEntryNumber() {
        return entryNumber;
    }

    public void setEntryNumber(String entryNumber) {
        this.entryNumber = entryNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getDebit() {
        return debit;
    }

    public void setDebit(BigDecimal debit) {
        this.debit = debit;
    }

    public BigDecimal getCredit() {
        return credit;
    }

    public void setCredit(BigDecimal credit) {
        this.credit = credit;
    }

    public BigDecimal getRunningBalance() {
        return runningBalance;
    }

    public void setRunningBalance(BigDecimal runningBalance) {
        this.runningBalance = runningBalance;
    }
}
