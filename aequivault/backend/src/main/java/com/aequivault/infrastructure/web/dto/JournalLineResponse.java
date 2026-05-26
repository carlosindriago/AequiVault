package com.aequivault.infrastructure.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record JournalLineResponse(
        UUID id,
        UUID ledgerAccountId,
        BigDecimal amount,
        String type
) {}
