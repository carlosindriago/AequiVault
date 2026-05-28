package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.FinancialPeriodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataFinancialPeriodRepository extends JpaRepository<FinancialPeriodEntity, UUID> {
    Optional<FinancialPeriodEntity> findByTenantIdAndYearAndMonth(UUID tenantId, Integer year, Integer month);
}
