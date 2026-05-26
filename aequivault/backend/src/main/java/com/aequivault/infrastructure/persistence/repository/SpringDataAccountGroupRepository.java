package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataAccountGroupRepository extends JpaRepository<AccountGroupEntity, UUID> {
    
    @Query("SELECT ag FROM AccountGroupEntity ag WHERE ag.tenantId = :tenantId ORDER BY ag.path ASC")
    List<AccountGroupEntity> findAllByTenantId(@Param("tenantId") UUID tenantId);
    
    @Query("SELECT ag FROM AccountGroupEntity ag WHERE ag.tenantId = :tenantId AND ag.path = :path")
    Optional<AccountGroupEntity> findByTenantIdAndPath(@Param("tenantId") UUID tenantId, @Param("path") String path);

    @Query(value = "SELECT COUNT(ag) > 0 FROM account_groups ag WHERE ag.tenant_id = :tenantId AND ag.path <@ CAST(:parentPath AS ltree) AND ag.path != CAST(:parentPath AS ltree)", nativeQuery = true)
    boolean hasChildren(@Param("tenantId") UUID tenantId, @Param("parentPath") String parentPath);
}
