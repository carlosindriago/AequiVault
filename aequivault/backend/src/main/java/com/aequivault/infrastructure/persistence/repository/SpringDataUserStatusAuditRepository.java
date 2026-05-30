package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.UserStatusAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SpringDataUserStatusAuditRepository extends JpaRepository<UserStatusAuditEntity, UUID> {
}
