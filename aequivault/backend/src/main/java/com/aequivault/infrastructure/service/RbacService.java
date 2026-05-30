package com.aequivault.infrastructure.service;

import com.aequivault.infrastructure.persistence.entity.PermissionEntity;
import com.aequivault.infrastructure.persistence.entity.RoleEntity;
import com.aequivault.infrastructure.persistence.entity.UserEntity;
import com.aequivault.infrastructure.persistence.entity.UserStatusAuditEntity;
import com.aequivault.infrastructure.persistence.repository.RoleRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataPermissionRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataUserStatusAuditRepository;
import com.aequivault.infrastructure.persistence.repository.UserRepository;
import com.aequivault.infrastructure.security.TenantContext;
import com.aequivault.infrastructure.web.dto.RbacDtos.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RbacService {

    private final SpringDataPermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final SpringDataUserStatusAuditRepository auditRepository;
    private final PasswordEncoder passwordEncoder;

    public RbacService(SpringDataPermissionRepository permissionRepository,
                       RoleRepository roleRepository,
                       UserRepository userRepository,
                       SpringDataUserStatusAuditRepository auditRepository,
                       PasswordEncoder passwordEncoder) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.auditRepository = auditRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<PermissionResponse> getPermissions() {
        return permissionRepository.findAll().stream()
                .map(p -> new PermissionResponse(p.getId(), p.getName(), p.getDescription()))
                .collect(Collectors.toList());
    }

    public List<RoleResponse> getRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        Set<PermissionEntity> permissions = new HashSet<>(
                permissionRepository.findAllById(request.permissionIds())
        );
        if (permissions.size() != request.permissionIds().size()) {
            throw new IllegalArgumentException("Uno o más IDs de permisos son inválidos.");
        }

        RoleEntity role = new RoleEntity(UUID.randomUUID(), request.name(), request.description());
        role.setPermissions(permissions);
        roleRepository.save(role);

        return mapToRoleResponse(role);
    }

    @Transactional
    public RoleResponse updateRole(UUID id, RoleRequest request) {
        RoleEntity role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));

        Set<PermissionEntity> permissions = new HashSet<>(
                permissionRepository.findAllById(request.permissionIds())
        );
        if (permissions.size() != request.permissionIds().size()) {
            throw new IllegalArgumentException("Uno o más IDs de permisos son inválidos.");
        }

        role.setName(request.name());
        role.setDescription(request.description());
        role.setPermissions(permissions);
        roleRepository.save(role);

        return mapToRoleResponse(role);
    }

    public List<UserResponse> getUsers() {
        UUID tenantId = getActiveTenantId();
        return userRepository.findAllByTenantId(tenantId).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        UUID tenantId = getActiveTenantId();

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado.");
        }

        Set<RoleEntity> roles = new HashSet<>(
                roleRepository.findAllById(request.roleIds())
        );
        if (roles.isEmpty()) {
            throw new IllegalArgumentException("Uno o más IDs de roles son inválidos.");
        }

        String rawPassword = (request.password() == null || request.password().isBlank())
                ? "AequiVault123!"
                : request.password();

        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setTenantId(tenantId);
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus("ACTIVE");
        user.setRoles(roles);

        userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Transactional
    public void deactivateUser(UUID targetUserId, UserStatusChangeRequest request, String adminEmail) {
        changeUserStatus(targetUserId, request, adminEmail, "DEACTIVATED");
    }

    @Transactional
    public void reactivateUser(UUID targetUserId, UserStatusChangeRequest request, String adminEmail) {
        changeUserStatus(targetUserId, request, adminEmail, "REACTIVATED");
    }

    private void changeUserStatus(UUID targetUserId, UserStatusChangeRequest request, String adminEmail, String action) {
        UserEntity admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Administrador no encontrado."));

        if (!passwordEncoder.matches(request.adminPassword(), admin.getPasswordHash())) {
            throw new IllegalArgumentException("La contraseña del administrador es incorrecta.");
        }

        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + targetUserId));

        if (!targetUser.getTenantId().equals(admin.getTenantId())) {
            throw new SecurityException("Acceso denegado: El usuario no pertenece a su inquilino.");
        }

        if ("DEACTIVATED".equals(action)) {
            targetUser.setStatus("INACTIVE");
        } else {
            targetUser.setStatus("ACTIVE");
        }
        userRepository.save(targetUser);

        UserStatusAuditEntity audit = new UserStatusAuditEntity(
                UUID.randomUUID(),
                admin.getTenantId(),
                targetUserId,
                admin.getEmail(),
                action,
                request.reason(),
                LocalDateTime.now()
        );
        auditRepository.save(audit);
    }

    private UUID getActiveTenantId() {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Please provide X-Tenant-ID header.");
        }
        return UUID.fromString(tenantStr);
    }

    private RoleResponse mapToRoleResponse(RoleEntity role) {
        List<PermissionResponse> permissions = role.getPermissions().stream()
                .map(p -> new PermissionResponse(p.getId(), p.getName(), p.getDescription()))
                .collect(Collectors.toList());
        return new RoleResponse(role.getId(), role.getName(), role.getDescription(), permissions);
    }

    private UserResponse mapToUserResponse(UserEntity user) {
        List<RoleResponse> roles = user.getRoles().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
        return new UserResponse(user.getId(), user.getEmail(), user.getStatus(), roles);
    }
}
