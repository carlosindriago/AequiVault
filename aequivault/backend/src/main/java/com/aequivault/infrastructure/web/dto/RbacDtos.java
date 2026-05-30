package com.aequivault.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public class RbacDtos {

    public record PermissionResponse(
        UUID id,
        String name,
        String description
    ) {}

    public record RoleRequest(
        @NotBlank(message = "El nombre del rol es obligatorio")
        @Size(max = 100)
        String name,

        @Size(max = 255)
        String description,

        @NotEmpty(message = "El rol debe tener al menos un permiso asignado")
        List<UUID> permissionIds
    ) {}

    public record RoleResponse(
        UUID id,
        String name,
        String description,
        List<PermissionResponse> permissions
    ) {}

    public record UserCreateRequest(
        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El correo electrónico debe ser válido")
        String email,

        String password, // Contraseña opcional (se genera por defecto si está vacía)

        @NotEmpty(message = "El usuario debe tener al menos un rol asignado")
        List<UUID> roleIds
    ) {}

    public record UserResponse(
        UUID id,
        String email,
        String status,
        List<RoleResponse> roles
    ) {}

    public record UserStatusChangeRequest(
        @NotBlank(message = "La contraseña del administrador es obligatoria")
        String adminPassword,

        @NotBlank(message = "La justificación o motivo es obligatorio")
        String reason
    ) {}
}
