package com.aequivault.infrastructure.persistence.repository;

import java.math.BigDecimal;

public interface TrialBalanceProjection {
    String getGroupCode();
    String getGroupName();
    String getAccountCode();
    String getAccountName();
    BigDecimal getTotalDebit();
    BigDecimal getTotalCredit();
}
