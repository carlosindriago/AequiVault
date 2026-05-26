package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SpringDataLedgerAccountRepository extends JpaRepository<LedgerAccountEntity, UUID> {
    boolean existsByTenantIdAndGroupId(UUID tenantId, UUID groupId);
}
