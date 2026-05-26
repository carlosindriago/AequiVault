package com.aequivault.infrastructure.persistence.entity;

import com.aequivault.domain.model.LineType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "journal_lines")
public class JournalLineEntity {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private JournalEntryEntity entry;

    @Column(name = "ledger_account_id", nullable = false)
    private UUID ledgerAccountId;

    @Column(nullable = false, precision = 25, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private LineType type;

    @Column(name = "reconciliation_date")
    private LocalDate reconciliationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public JournalLineEntity() {}

    public JournalLineEntity(UUID id, UUID tenantId, JournalEntryEntity entry, UUID ledgerAccountId, BigDecimal amount, LineType type, LocalDate reconciliationDate) {
        this.id = id;
        this.tenantId = tenantId;
        this.entry = entry;
        this.ledgerAccountId = ledgerAccountId;
        this.amount = amount;
        this.type = type;
        this.reconciliationDate = reconciliationDate;
        this.createdAt = LocalDateTime.now();
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

    public JournalEntryEntity getEntry() {
        return entry;
    }

    public void setEntry(JournalEntryEntity entry) {
        this.entry = entry;
    }

    public UUID getLedgerAccountId() {
        return ledgerAccountId;
    }

    public void setLedgerAccountId(UUID ledgerAccountId) {
        this.ledgerAccountId = ledgerAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LineType getType() {
        return type;
    }

    public void setType(LineType type) {
        this.type = type;
    }

    public LocalDate getReconciliationDate() {
        return reconciliationDate;
    }

    public void setReconciliationDate(LocalDate reconciliationDate) {
        this.reconciliationDate = reconciliationDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
