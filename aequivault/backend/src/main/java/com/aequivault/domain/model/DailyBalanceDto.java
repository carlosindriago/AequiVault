package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyBalanceDto(
    LocalDate date,
    BigDecimal balance
) {}
