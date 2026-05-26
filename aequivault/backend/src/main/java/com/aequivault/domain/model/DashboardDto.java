package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.util.List;

public record DashboardDto(
    BigDecimal totalAssets,
    BigDecimal totalLiabilities,
    BigDecimal netEquity,
    List<DailyBalanceDto> liquidityTrend
) {}
