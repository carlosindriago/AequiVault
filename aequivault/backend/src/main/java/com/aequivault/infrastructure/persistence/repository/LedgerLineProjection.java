package com.aequivault.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface LedgerLineProjection {
    LocalDate getDate();
    UUID getEntryId();
    String getEntryNumber();
    String getDescription();
    BigDecimal getDebit();
    BigDecimal getCredit();
    BigDecimal getRunningBalance();
}
