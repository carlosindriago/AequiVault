package com.aequivault.infrastructure.persistence.entity;

import com.aequivault.domain.model.LineType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "draft_journal_lines")
public class DraftJournalLineEntity {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_entry_id", nullable = false)
    private DraftJournalEntryEntity draftEntry;

    @Column(name = "ledger_account_id", nullable = false)
    private UUID ledgerAccountId;

    @Column(nullable = false, precision = 25, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private LineType type;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DraftJournalLineEntity() {}

    public DraftJournalLineEntity(UUID id, UUID tenantId, DraftJournalEntryEntity draftEntry, UUID ledgerAccountId, BigDecimal amount, LineType type) {
        this.id = id;
        this.tenantId = tenantId;
        this.draftEntry = draftEntry;
        this.ledgerAccountId = ledgerAccountId;
        this.amount = amount;
        this.type = type;
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

    public DraftJournalEntryEntity getDraftEntry() {
        return draftEntry;
    }

    public void setDraftEntry(DraftJournalEntryEntity draftEntry) {
        this.draftEntry = draftEntry;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
