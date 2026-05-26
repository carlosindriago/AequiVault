package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TrialBalanceReportDto(
    LocalDate startDate,
    LocalDate endDate,
    List<AccountBalanceDto> balances,
    BigDecimal totalDebitSum,
    BigDecimal totalCreditSum
) {
    public TrialBalanceReportDto {
        if (balances == null) balances = List.of();
        if (totalDebitSum == null) totalDebitSum = BigDecimal.ZERO;
        if (totalCreditSum == null) totalCreditSum = BigDecimal.ZERO;
    }
}
