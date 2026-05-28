package com.aequivault.domain.model;

import com.aequivault.infrastructure.persistence.entity.FinancialPeriodEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataFinancialPeriodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FinancialPeriodService {

    private final SpringDataFinancialPeriodRepository periodRepository;

    public FinancialPeriodService(SpringDataFinancialPeriodRepository periodRepository) {
        this.periodRepository = periodRepository;
    }

    @Transactional(readOnly = true)
    public void validatePeriodIsOpen(UUID tenantId, LocalDate date) {
        if (date == null) return;
        int year = date.getYear();
        int month = date.getMonthValue();

        periodRepository.findByTenantIdAndYearAndMonth(tenantId, year, month)
            .ifPresent(period -> {
                if ("CLOSED".equalsIgnoreCase(period.getStatus())) {
                    throw new PeriodClosedException("The financial period for " + year + "-" + month + " is closed for tenant " + tenantId);
                }
            });
    }

    @Transactional
    public void closePeriod(UUID tenantId, int year, int month, String closedBy) {
        FinancialPeriodEntity period = periodRepository.findByTenantIdAndYearAndMonth(tenantId, year, month)
            .orElseGet(() -> new FinancialPeriodEntity(UUID.randomUUID(), tenantId, year, month, "OPEN"));

        period.setStatus("CLOSED");
        period.setClosedAt(LocalDateTime.now());
        period.setClosedBy(closedBy);
        periodRepository.save(period);
    }

    @Transactional
    public void openPeriod(UUID tenantId, int year, int month) {
        FinancialPeriodEntity period = periodRepository.findByTenantIdAndYearAndMonth(tenantId, year, month)
            .orElseGet(() -> new FinancialPeriodEntity(UUID.randomUUID(), tenantId, year, month, "OPEN"));

        period.setStatus("OPEN");
        period.setClosedAt(null);
        period.setClosedBy(null);
        periodRepository.save(period);
    }
}
