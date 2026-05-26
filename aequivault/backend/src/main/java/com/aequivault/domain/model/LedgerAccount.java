package com.aequivault.domain.model;

import java.util.UUID;

public record LedgerAccount(
        UUID id,
        UUID tenantId,
        UUID groupId,
        String name,
        String code,
        String type
) {
    public LedgerAccount {
        if (id == null) {
            throw new IllegalArgumentException("Account ID cannot be null");
        }
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant ID cannot be null");
        }
        if (groupId == null) {
            throw new IllegalArgumentException("Group ID cannot be null");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Account name cannot be null or blank");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Account code cannot be null or blank");
        }
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Account type cannot be null or blank");
        }
        
        String upperType = type.toUpperCase();
        if (!upperType.equals("ASSET") && 
            !upperType.equals("LIABILITY") && 
            !upperType.equals("EQUITY") && 
            !upperType.equals("REVENUE") && 
            !upperType.equals("EXPENSE")) {
            throw new IllegalArgumentException("Invalid account type: " + type);
        }
    }
}
