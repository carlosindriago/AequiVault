package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SpringDataPermissionRepository extends JpaRepository<PermissionEntity, UUID> {
}
