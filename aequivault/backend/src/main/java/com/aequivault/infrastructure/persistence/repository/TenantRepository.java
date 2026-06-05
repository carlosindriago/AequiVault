package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<TenantEntity, UUID> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM tenants WHERE expires_at < NOW()", nativeQuery = true)
    int deleteExpiredTenants();
}
