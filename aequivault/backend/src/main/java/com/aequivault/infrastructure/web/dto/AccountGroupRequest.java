package com.aequivault.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AccountGroupRequest(
        UUID parentId,

        @NotBlank(message = "Code cannot be blank")
        @Size(max = 20, message = "Code cannot exceed 20 characters")
        @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Code must be alphanumeric only")
        String code,

        @NotBlank(message = "Name cannot be blank")
        @Size(max = 200, message = "Name cannot exceed 200 characters")
        String name
) {}
