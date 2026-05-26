package com.aequivault.domain.model;

import java.util.UUID;
import java.util.regex.Pattern;

public record AccountGroup(
        UUID id,
        UUID tenantId,
        String name,
        String code,
        String path
) {
    private static final Pattern CODE_PATTERN = Pattern.compile("^[a-zA-Z0-9]+$");
    private static final Pattern PATH_PATTERN = Pattern.compile("^[a-zA-Z0-9]+(\\.[a-zA-Z0-9]+)*$");

    public AccountGroup {
        if (id == null) {
            throw new IllegalArgumentException("Group ID cannot be null");
        }
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant ID cannot be null");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Group name cannot be null or blank");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Group code cannot be null or blank");
        }
        if (!CODE_PATTERN.matcher(code).matches()) {
            throw new IllegalArgumentException("Group code must be alphanumeric only: " + code);
        }
        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException("Group path cannot be null or blank");
        }
        if (!PATH_PATTERN.matcher(path).matches()) {
            throw new IllegalArgumentException("Invalid LTREE path format: " + path);
        }
    }
}
