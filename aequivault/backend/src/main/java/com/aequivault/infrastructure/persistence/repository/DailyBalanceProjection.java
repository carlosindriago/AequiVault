package com.aequivault.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailyBalanceProjection {
    LocalDate getDate();
    BigDecimal getBalance();
}
