package com.aequivault.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_status_audit")
public class UserStatusAuditEntity {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "target_user_id", nullable = false)
    private UUID targetUserId;

    @Column(name = "performed_by_email", nullable = false)
    private String performedByEmail;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UserStatusAuditEntity() {}

    public UserStatusAuditEntity(UUID id, UUID tenantId, UUID targetUserId, String performedByEmail, String action, String reason, LocalDateTime createdAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.targetUserId = targetUserId;
        this.performedByEmail = performedByEmail;
        this.action = action;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public UUID getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(UUID targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getPerformedByEmail() {
        return performedByEmail;
    }

    public void setPerformedByEmail(String performedByEmail) {
        this.performedByEmail = performedByEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
