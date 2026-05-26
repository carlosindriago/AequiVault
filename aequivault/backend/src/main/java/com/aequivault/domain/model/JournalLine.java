package com.aequivault.domain.model;

import java.util.UUID;

public record JournalLine(UUID id, UUID ledgerAccountId, Money amount, LineType type) {
    public JournalLine {
        if (id == null) {
            throw new IllegalArgumentException("Line ID cannot be null");
        }
        if (ledgerAccountId == null) {
            throw new IllegalArgumentException("Ledger account ID cannot be null");
        }
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (type == null) {
            throw new IllegalArgumentException("Line type cannot be null");
        }
    }
}
