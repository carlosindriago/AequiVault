package com.aequivault.infrastructure.demo;

import java.time.LocalDateTime;
import java.util.UUID;

public record DemoStartResponse(
        String token,
        UUID tenantId,
        String tenantName,
        LocalDateTime expiresAt,
        DemoCredentials credentials
) {
}
