package com.aequivault.domain.event;

import java.util.UUID;

public record JournalEntryCreatedEvent(
    UUID tenantId,
    UUID entryId,
    String entryNumber,
    String description
) {}
