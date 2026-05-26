package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataLedgerAccountRepository;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LedgerAccountControllerTest {

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
    private UUID groupId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantId = UUID.randomUUID();
        groupId = UUID.randomUUID();

        // 1. Guardar inquilinos sin contexto RLS (tabla tenants no tiene RLS)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantId, "Web Test Tenant"));
        });

        // 2. Guardar grupos con contexto de inquilino activo
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(groupId, tenantId, "Activos", "1", "1"));
        });
        com.aequivault.infrastructure.security.TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteById(groupId);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantId);
        });
    }

    @Test
    void shouldCreateAndListAccounts() throws Exception {
        String createPayload = """
                {
                    "groupId": "%s",
                    "code": "1.1.01.01",
                    "name": "Caja Principal",
                    "type": "ASSET"
                }
                """.formatted(groupId);

        // 1. Create account
        mockMvc.perform(post("/api/v1/ledger/accounts")
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Caja Principal"))
                .andExpect(jsonPath("$.type").value("ASSET"));

        // 2. List accounts
        mockMvc.perform(get("/api/v1/ledger/accounts")
                        .header("X-Tenant-ID", tenantId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Caja Principal"));
    }

    @Test
    void shouldReturnBadRequestForInvalidAccount() throws Exception {
        String invalidPayload = """
                {
                    "groupId": "%s",
                    "code": "",
                    "name": "Caja Principal",
                    "type": "INVALID_TYPE"
                }
                """.formatted(groupId);

        mockMvc.perform(post("/api/v1/ledger/accounts")
                        .header("X-Tenant-ID", tenantId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Error de Validación Sintáctica"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.type", contains("Type must be one of ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE")))
                .andExpect(jsonPath("$.errors.code", contains("Code cannot be blank")));
    }

    @Test
    void shouldReturnUnprocessableEntityWhenTenantHeaderIsMissing() throws Exception {
        String payload = """
                {
                    "groupId": "%s",
                    "code": "1.1.01.01",
                    "name": "Caja Principal",
                    "type": "ASSET"
                }
                """.formatted(groupId);

        mockMvc.perform(post("/api/v1/ledger/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.detail").value("Tenant context is missing. Please provide X-Tenant-ID header."));
    }
}
