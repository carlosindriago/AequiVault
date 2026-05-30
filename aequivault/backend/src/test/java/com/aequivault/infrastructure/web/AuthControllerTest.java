package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.entity.UserEntity;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        java.util.List<String> tenantIds = new java.util.ArrayList<>();
        transactionTemplate.executeWithoutResult(status -> {
            java.util.List<?> rawIds = entityManager.createNativeQuery("SELECT id FROM tenants").getResultList();
            for (Object rawId : rawIds) {
                tenantIds.add(rawId.toString());
            }
        });

        for (String tenantIdStr : tenantIds) {
            com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantIdStr);
            transactionTemplate.executeWithoutResult(status -> {
                entityManager.createNativeQuery("DELETE FROM draft_journal_lines").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM draft_journal_entries").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM journal_lines").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM journal_entries").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM ledger_accounts").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM account_groups").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM notifications").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM user_status_audit").executeUpdate();
            });
            com.aequivault.infrastructure.security.TenantContext.clear();
        }

        transactionTemplate.executeWithoutResult(status -> {
            entityManager.createNativeQuery("DELETE FROM user_roles").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM tenants").executeUpdate();
        });
    }

    @AfterEach
    void tearDown() {
        java.util.List<String> tenantIds = new java.util.ArrayList<>();
        transactionTemplate.executeWithoutResult(status -> {
            java.util.List<?> rawIds = entityManager.createNativeQuery("SELECT id FROM tenants").getResultList();
            for (Object rawId : rawIds) {
                tenantIds.add(rawId.toString());
            }
        });

        for (String tenantIdStr : tenantIds) {
            com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantIdStr);
            transactionTemplate.executeWithoutResult(status -> {
                entityManager.createNativeQuery("DELETE FROM draft_journal_lines").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM draft_journal_entries").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM journal_lines").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM journal_entries").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM ledger_accounts").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM account_groups").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM notifications").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM user_status_audit").executeUpdate();
            });
            com.aequivault.infrastructure.security.TenantContext.clear();
        }

        transactionTemplate.executeWithoutResult(status -> {
            entityManager.createNativeQuery("DELETE FROM user_roles").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM tenants").executeUpdate();
        });
    }

    @Test
    void shouldLoginSuccessfullyWithCorrectCredentials() throws Exception {
        String setupPayload = """
                {
                    "companyName": "Empresa Test SA",
                    "email": "admin@empresa.com",
                    "password": "securepassword123"
                }
                """;

        mockMvc.perform(post("/api/v1/setup/init")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(setupPayload))
                .andExpect(status().isOk());

        String loginPayload = """
                {
                    "email": "admin@empresa.com",
                    "password": "securepassword123"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("admin@empresa.com"))
                .andExpect(jsonPath("$.tenantId").exists());
    }

    @Test
    void shouldFailLoginWithIncorrectPassword() throws Exception {
        String setupPayload = """
                {
                    "companyName": "Empresa Test SA",
                    "email": "admin@empresa.com",
                    "password": "securepassword123"
                }
                """;

        mockMvc.perform(post("/api/v1/setup/init")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(setupPayload))
                .andExpect(status().isOk());

        String loginPayload = """
                {
                    "email": "admin@empresa.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.detail").value("Credenciales inválidas o cuenta inactiva."));
    }
}
