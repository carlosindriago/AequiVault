package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.entity.UserEntity;
import com.aequivault.infrastructure.persistence.entity.RoleEntity;
import com.aequivault.infrastructure.persistence.entity.PermissionEntity;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.persistence.repository.UserRepository;
import com.aequivault.infrastructure.persistence.repository.RoleRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataPermissionRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataUserStatusAuditRepository;
import com.aequivault.infrastructure.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SpringDataPermissionRepository permissionRepository;

    @Autowired
    private SpringDataUserStatusAuditRepository auditRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    private TransactionTemplate transactionTemplate;

    private UUID tenantId;
    private UUID adminUserId;
    private UUID normalUserId;
    private UUID superAdminRoleId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantId = UUID.randomUUID();
        adminUserId = UUID.randomUUID();
        normalUserId = UUID.randomUUID();
        superAdminRoleId = UUID.fromString("f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b");

        // Limpiar tablas para evitar colisiones
        cleanupDatabase();

        transactionTemplate.executeWithoutResult(status -> {
            // Guardar inquilino
            tenantRepository.save(new TenantEntity(tenantId, "Tenant Test Users"));

            // Obtener o crear rol SUPER_ADMIN si no existiera
            RoleEntity superAdminRole = roleRepository.findById(superAdminRoleId)
                    .orElseGet(() -> roleRepository.save(new RoleEntity(superAdminRoleId, "SUPER_ADMIN", "Admin")));

            // Crear administrador
            UserEntity admin = new UserEntity();
            admin.setId(adminUserId);
            admin.setTenantId(tenantId);
            admin.setEmail("admin@test.com");
            admin.setPasswordHash(passwordEncoder.encode("adminpass"));
            admin.setStatus("ACTIVE");
            admin.setRoles(Collections.singleton(superAdminRole));
            userRepository.save(admin);

            // Crear usuario de prueba
            UserEntity user = new UserEntity();
            user.setId(normalUserId);
            user.setTenantId(tenantId);
            user.setEmail("user@test.com");
            user.setPasswordHash(passwordEncoder.encode("userpass"));
            user.setStatus("ACTIVE");
            user.setRoles(Collections.singleton(superAdminRole));
            userRepository.save(user);
        });
    }

    @AfterEach
    void tearDown() {
        cleanupDatabase();
    }

    private void cleanupDatabase() {
        TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            auditRepository.deleteAll();
            userRepository.deleteAll();
        });
        TenantContext.clear();

        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantId);
        });
    }

    @Test
    void shouldReturnUnprocessableEntityWhenTenantHeaderIsMissing() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").value("Tenant context is missing. Please provide X-Tenant-ID header."));
    }

    @Test
    void shouldGetUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header("X-Tenant-ID", tenantId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].email", containsInAnyOrder("admin@test.com", "user@test.com")));
    }

    @Test
    void shouldCreateUser() throws Exception {
        String payload = """
                {
                    "email": "newuser@test.com",
                    "password": "newpassword123",
                    "roleIds": ["%s"]
                }
                """.formatted(superAdminRoleId);

        mockMvc.perform(post("/api/v1/users")
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("newuser@test.com"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.roles[0].id").value(superAdminRoleId.toString()));
    }

    @Test
    void shouldDeactivateUserSuccessfully() throws Exception {
        String payload = """
                {
                    "adminPassword": "adminpass",
                    "reason": "Inactive user cleanup"
                }
                """;

        mockMvc.perform(post("/api/v1/users/" + normalUserId + "/deactivate")
                        .with(user("admin@test.com").roles("SUPER_ADMIN"))
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNoContent());

        // Verificar cambio de estado en BD
        TenantContext.setTenantId(tenantId.toString());
        try {
            UserEntity user = userRepository.findById(normalUserId).orElseThrow();
            org.junit.jupiter.api.Assertions.assertEquals("INACTIVE", user.getStatus());

            // Verificar registro de auditoría
            var audits = auditRepository.findAll();
            org.junit.jupiter.api.Assertions.assertEquals(1, audits.size());
            org.junit.jupiter.api.Assertions.assertEquals("DEACTIVATED", audits.get(0).getAction());
            org.junit.jupiter.api.Assertions.assertEquals("admin@test.com", audits.get(0).getPerformedByEmail());
            org.junit.jupiter.api.Assertions.assertEquals("Inactive user cleanup", audits.get(0).getReason());
        } finally {
            TenantContext.clear();
        }
    }

    @Test
    void shouldReactivateUserSuccessfully() throws Exception {
        // Primero desactivar el usuario en la BD manualmente
        TenantContext.setTenantId(tenantId.toString());
        try {
            UserEntity user = userRepository.findById(normalUserId).orElseThrow();
            user.setStatus("INACTIVE");
            userRepository.save(user);
        } finally {
            TenantContext.clear();
        }

        String payload = """
                {
                    "adminPassword": "adminpass",
                    "reason": "Reactivating for new assignment"
                }
                """;

        mockMvc.perform(post("/api/v1/users/" + normalUserId + "/reactivate")
                        .with(user("admin@test.com").roles("SUPER_ADMIN"))
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNoContent());

        // Verificar cambio de estado en BD
        TenantContext.setTenantId(tenantId.toString());
        try {
            UserEntity user = userRepository.findById(normalUserId).orElseThrow();
            org.junit.jupiter.api.Assertions.assertEquals("ACTIVE", user.getStatus());

            // Verificar registro de auditoría
            var audits = auditRepository.findAll();
            org.junit.jupiter.api.Assertions.assertEquals(1, audits.size());
            org.junit.jupiter.api.Assertions.assertEquals("REACTIVATED", audits.get(0).getAction());
            org.junit.jupiter.api.Assertions.assertEquals("admin@test.com", audits.get(0).getPerformedByEmail());
            org.junit.jupiter.api.Assertions.assertEquals("Reactivating for new assignment", audits.get(0).getReason());
        } finally {
            TenantContext.clear();
        }
    }

    @Test
    void shouldFailDeactivationWithWrongAdminPassword() throws Exception {
        String payload = """
                {
                    "adminPassword": "wrongpassword",
                    "reason": "Wrong password attempt"
                }
                """;

        mockMvc.perform(post("/api/v1/users/" + normalUserId + "/deactivate")
                        .with(user("admin@test.com").roles("SUPER_ADMIN"))
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity());
    }
}
