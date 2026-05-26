package com.aequivault.infrastructure.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.util.UUID;

public record JournalLineRequest(
        UUID id,
        
        @NotNull(message = "Ledger account ID cannot be null")
        UUID ledgerAccountId,
        
        @NotNull(message = "Amount cannot be null")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amount,
        
        @NotBlank(message = "Line type cannot be blank")
        @Pattern(regexp = "(?i)^(DEBIT|CREDIT)$", message = "Line type must be DEBIT or CREDIT")
        String type
) {}
