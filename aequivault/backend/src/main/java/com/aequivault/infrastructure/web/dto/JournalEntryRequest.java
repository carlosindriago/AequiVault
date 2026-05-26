package com.aequivault.infrastructure.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record JournalEntryRequest(
        UUID id,
        
        @NotNull(message = "Date cannot be null")
        LocalDate date,
        
        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,
        
        @NotBlank(message = "Status cannot be blank")
        @Pattern(regexp = "(?i)^(DRAFT|POSTED)$", message = "Status must be DRAFT or POSTED")
        String status,
        
        @Size(max = 50, message = "Entry number cannot exceed 50 characters")
        String entryNumber,
        
        @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
        String currency,
        
        @NotEmpty(message = "Journal entry must contain at least one line")
        @Valid
        List<JournalLineRequest> lines
) {}
