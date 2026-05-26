package com.aequivault.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record LedgerAccountDto(
        UUID id,
        
        @NotNull(message = "Group ID cannot be null")
        UUID groupId,
        
        @NotBlank(message = "Code cannot be blank")
        @Size(max = 20, message = "Code cannot exceed 20 characters")
        String code,
        
        @NotBlank(message = "Name cannot be blank")
        @Size(max = 200, message = "Name cannot exceed 200 characters")
        String name,
        
        @NotBlank(message = "Type cannot be blank")
        @Pattern(regexp = "(?i)^(ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE)$", message = "Type must be one of ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE")
        String type
) {}
