package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.NotificationEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataNotificationRepository;
import com.aequivault.infrastructure.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final SpringDataNotificationRepository notificationRepository;

    public NotificationController(SpringDataNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications() {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);
        List<NotificationEntity> list = notificationRepository.findUnreadNotificationsByTenant(tenantId);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(@PathVariable("id") UUID id) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
        return ResponseEntity.noContent().build();
    }
}
