package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataNotificationRepository extends JpaRepository<NotificationEntity, UUID> {
    
    @Query("SELECT n FROM NotificationEntity n WHERE n.tenantId = :tenantId AND n.read = false ORDER BY n.createdAt DESC")
    List<NotificationEntity> findUnreadNotificationsByTenant(@Param("tenantId") UUID tenantId);
}
