package com.aequivault.infrastructure.persistence.repository;

import java.math.BigDecimal;

public interface FinancialReportLineProjection {
    String getCode();
    String getName();
    BigDecimal getBalance();
    Integer getDepth();
    Boolean getIsGroup();
}
