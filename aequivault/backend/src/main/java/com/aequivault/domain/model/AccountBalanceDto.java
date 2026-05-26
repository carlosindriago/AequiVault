package com.aequivault.domain.model;

import java.math.BigDecimal;

public record AccountBalanceDto(
    String groupCode,
    String groupName,
    String accountCode,
    String accountName,
    BigDecimal totalDebit,
    BigDecimal totalCredit,
    BigDecimal netBalance
) {
    public AccountBalanceDto {
        if (totalDebit == null) totalDebit = BigDecimal.ZERO;
        if (totalCredit == null) totalCredit = BigDecimal.ZERO;
        if (netBalance == null) netBalance = BigDecimal.ZERO;
    }
}
