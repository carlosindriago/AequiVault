package com.aequivault.infrastructure.web.dto;

import java.util.UUID;

public record AccountGroupResponse(
        UUID id,
        String code,
        String name,
        String path
) {}
