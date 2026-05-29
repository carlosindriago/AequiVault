package com.aequivault.domain.event;

import java.util.UUID;

public record AccountGroupCreatedEvent(
    UUID tenantId,
    UUID groupId,
    String name,
    String code
) {}
