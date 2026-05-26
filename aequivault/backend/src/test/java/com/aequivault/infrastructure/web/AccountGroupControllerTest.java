package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataLedgerAccountRepository;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.security.TenantContext;
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
import java.util.UUID;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AccountGroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SpringDataAccountGroupRepository accountGroupRepository;

    @Autowired
    private SpringDataLedgerAccountRepository ledgerAccountRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    private UUID tenantId;
    private UUID tenantIdB;
    private UUID rootGroupId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantId = UUID.randomUUID();
        tenantIdB = UUID.randomUUID();
        rootGroupId = UUID.randomUUID();

        // 1. Guardar inquilinos sin contexto RLS (tabla tenants no tiene RLS)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantId, "Tenant A"));
            tenantRepository.save(new TenantEntity(tenantIdB, "Tenant B"));
        });

        // 2. Guardar grupo raíz con contexto de inquilino activo
        TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(rootGroupId, tenantId, "Activos", "1", "1"));
        });
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });
        TenantContext.clear();

        TenantContext.setTenantId(tenantIdB.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.deleteAll();
        });
        TenantContext.clear();

        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantId);
            tenantRepository.deleteById(tenantIdB);
        });
    }

    @Test
    void shouldCreateAndListGroupsInPathOrder() throws Exception {
        String createChildPayload = """
                {
                    "parentId": "%s",
                    "code": "11",
                    "name": "Activos Corrientes"
                }
                """.formatted(rootGroupId);

        // 1. Create child group under root group
        mockMvc.perform(post("/api/v1/ledger/groups")
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createChildPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Activos Corrientes"))
                .andExpect(jsonPath("$.path").value("1.11"));

        // 2. List all groups for tenant A - should return root and child in order
        mockMvc.perform(get("/api/v1/ledger/groups")
                        .header("X-Tenant-ID", tenantId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].path").value("1"))
                .andExpect(jsonPath("$[1].path").value("1.11"));
    }

    @Test
    void shouldFailToDeleteGroupWithChildren() throws Exception {
        UUID childGroupId = UUID.randomUUID();
        
        // 1. Insert child group using TenantContext
        TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(childGroupId, tenantId, "Corrientes", "11", "1.11"));
        });
        TenantContext.clear();

        // 2. Try to delete root group - should fail with 422 because of child group
        mockMvc.perform(delete("/api/v1/ledger/groups/" + rootGroupId)
                        .header("X-Tenant-ID", tenantId.toString()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.detail").value("Cannot delete account group because it has sub-groups."));
    }

    @Test
    void shouldFailToDeleteGroupWithLedgerAccounts() throws Exception {
        UUID accountId = UUID.randomUUID();

        // 1. Insert ledger account linked to root group
        TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            ledgerAccountRepository.save(new LedgerAccountEntity(accountId, tenantId, rootGroupId, "Caja", "1.01", "ASSET"));
        });
        TenantContext.clear();

        // 2. Try to delete root group - should fail with 422 because of account
        mockMvc.perform(delete("/api/v1/ledger/groups/" + rootGroupId)
                        .header("X-Tenant-ID", tenantId.toString()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.detail").value("Cannot delete account group because it has ledger accounts assigned."));
    }

    @Test
    void shouldEnforceRLSOnGroups() throws Exception {
        // Tenant B lists groups - should be empty because RLS isolates tenant A's root group
        mockMvc.perform(get("/api/v1/ledger/groups")
                        .header("X-Tenant-ID", tenantIdB.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Tenant B tries to delete Tenant A's group - should fail with 422 (IllegalStateException) / 400 (IllegalArgumentException) "not found"
        mockMvc.perform(delete("/api/v1/ledger/groups/" + rootGroupId)
                        .header("X-Tenant-ID", tenantIdB.toString()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.detail").value("Account group not found with ID: " + rootGroupId));
    }
}
