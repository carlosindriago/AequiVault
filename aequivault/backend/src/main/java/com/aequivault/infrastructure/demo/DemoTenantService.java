package com.aequivault.infrastructure.demo;

import com.aequivault.infrastructure.persistence.entity.RoleEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.entity.UserEntity;
import com.aequivault.infrastructure.persistence.repository.RoleRepository;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.persistence.repository.UserRepository;
import com.aequivault.infrastructure.security.JwtService;
import com.aequivault.infrastructure.security.TenantContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DemoTenantService {

    private static final String PRIMARY_ROLE = "SUPER_ADMIN";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DemoDataSeeder demoDataSeeder;

    public DemoTenantService(TenantRepository tenantRepository,
                             UserRepository userRepository,
                             RoleRepository roleRepository,
                             PasswordEncoder passwordEncoder,
                             JwtService jwtService,
                             DemoDataSeeder demoDataSeeder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.demoDataSeeder = demoDataSeeder;
    }

    public DemoStartResponse startDemo() {
        UUID tenantId = UUID.randomUUID();
        String tenantName = "Demo - " + tenantId;
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(2);

        TenantEntity tenant = new TenantEntity(tenantId, tenantName);
        tenant.setExpiresAt(expiresAt);
        tenantRepository.save(tenant);

        String password = generatePassword();
        String email = "demo+" + tenantId + "@demo.aequivault.local";
        UserEntity adminUser = createDemoAdmin(tenantId, email, password);

        try {
            TenantContext.setTenantId(tenantId.toString());
            demoDataSeeder.seedTenant(tenantId);
        } catch (RuntimeException ex) {
            tenantRepository.deleteById(tenantId);
            throw ex;
        } finally {
            TenantContext.clear();
        }

        Set<String> roles = adminUser.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet());
        String token = jwtService.generateToken(adminUser.getEmail(), adminUser.getTenantId(), roles);

        return new DemoStartResponse(
                token,
                tenantId,
                tenantName,
                expiresAt,
                new DemoCredentials(email, password, PRIMARY_ROLE)
        );
    }

    private UserEntity createDemoAdmin(UUID tenantId, String email, String password) {
        RoleEntity superAdminRole = roleRepository.findByName(PRIMARY_ROLE)
                .orElseThrow(() -> new IllegalStateException("El rol base SUPER_ADMIN no se encuentra en el sistema."));

        UserEntity adminUser = new UserEntity();
        adminUser.setId(UUID.randomUUID());
        adminUser.setTenantId(tenantId);
        adminUser.setEmail(email);
        adminUser.setPasswordHash(passwordEncoder.encode(password));
        adminUser.setStatus("ACTIVE");
        adminUser.setRoles(Collections.singleton(superAdminRole));
        return userRepository.save(adminUser);
    }

    private String generatePassword() {
        byte[] randomBytes = new byte[18];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
