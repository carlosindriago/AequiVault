package com.aequivault.domain.model;

import java.time.LocalDate;
import java.util.List;

public record FinancialReportDto(
    LocalDate startDate,
    LocalDate endDate,
    List<FinancialReportLineDto> lines
) {
    public FinancialReportDto {
        if (lines == null) lines = List.of();
    }
}
