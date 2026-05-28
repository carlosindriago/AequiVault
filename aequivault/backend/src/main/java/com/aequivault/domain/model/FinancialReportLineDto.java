package com.aequivault.domain.model;

import java.math.BigDecimal;

public record FinancialReportLineDto(
    String code,
    String name,
    BigDecimal balance,
    Integer depth,
    Boolean isGroup
) {
    public FinancialReportLineDto {
        if (balance == null) balance = BigDecimal.ZERO;
        if (depth == null) depth = 0;
        if (isGroup == null) isGroup = false;
    }
}
