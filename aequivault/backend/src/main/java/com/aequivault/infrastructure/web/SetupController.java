package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.entity.UserEntity;
import com.aequivault.infrastructure.persistence.entity.RoleEntity;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.persistence.repository.UserRepository;
import com.aequivault.infrastructure.persistence.repository.RoleRepository;
import com.aequivault.infrastructure.security.JwtService;
import com.aequivault.infrastructure.web.dto.SetupInitRequest;
import com.aequivault.infrastructure.web.dto.SetupInitResponse;
import com.aequivault.infrastructure.web.dto.SetupStatusResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/setup")
public class SetupController {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public SetupController(TenantRepository tenantRepository,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @GetMapping("/status")
    public ResponseEntity<SetupStatusResponse> getStatus() {
        boolean isInitialized = tenantRepository.count() > 0 && userRepository.count() > 0;
        return ResponseEntity.ok(new SetupStatusResponse(isInitialized));
    }

    @PostMapping("/init")
    public ResponseEntity<SetupInitResponse> init(@Valid @RequestBody SetupInitRequest request) {
        if (tenantRepository.count() > 0 && userRepository.count() > 0) {
            throw new IllegalStateException("El sistema ya ha sido inicializado.");
        }

        // Crear inquilino
        TenantEntity tenant = new TenantEntity(UUID.randomUUID(), request.getCompanyName());
        tenantRepository.save(tenant);

        // Buscar rol SUPER_ADMIN
        RoleEntity superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseThrow(() -> new IllegalStateException("El rol base SUPER_ADMIN no se encuentra en el sistema."));

        // Crear usuario administrador
        UserEntity adminUser = new UserEntity();
        adminUser.setId(UUID.randomUUID());
        adminUser.setTenantId(tenant.getId());
        adminUser.setEmail(request.getEmail());
        adminUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        adminUser.setStatus("ACTIVE");
        adminUser.setRoles(Collections.singleton(superAdminRole));
        userRepository.save(adminUser);

        // Generar JWT
        Set<String> roles = adminUser.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet());
        String token = jwtService.generateToken(adminUser.getEmail(), adminUser.getTenantId(), roles);

        return ResponseEntity.ok(new SetupInitResponse(token, adminUser.getEmail(), tenant.getId()));
    }
}
