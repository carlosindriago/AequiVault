package com.aequivault.infrastructure.web.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record JournalEntryResponse(
        UUID id,
        UUID tenantId,
        LocalDate date,
        String description,
        String status,
        String entryNumber,
        String currency,
        List<JournalLineResponse> lines
) {}
