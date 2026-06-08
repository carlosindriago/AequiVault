package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataFinancialPeriodRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataJournalEntryRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataLedgerAccountRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataNotificationRepository;
import com.aequivault.infrastructure.persistence.repository.TenantRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FinancialPeriodIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SpringDataNotificationRepository notificationRepository;

    @Autowired
    private SpringDataAccountGroupRepository accountGroupRepository;

    @Autowired
    private SpringDataLedgerAccountRepository ledgerAccountRepository;

    @Autowired
    private SpringDataJournalEntryRepository journalEntryRepository;

    @Autowired
    private SpringDataFinancialPeriodRepository periodRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private com.aequivault.infrastructure.security.JwtService jwtService;

    private TransactionTemplate transactionTemplate;

    private UUID tenantId;
    private UUID accountDebitId;
    private UUID accountCreditId;

    private String getTenantToken() {
        return jwtService.generateToken("user@test.com", tenantId, java.util.Collections.emptySet());
    }

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantId = UUID.randomUUID();
        accountDebitId = UUID.randomUUID();
        accountCreditId = UUID.randomUUID();

        // 1. Guardar inquilino
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantId, "Tenant Test Periods"));
        });

        // 2. Guardar cuentas con RLS activo
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            AccountGroupEntity group = new AccountGroupEntity(UUID.randomUUID(), tenantId, "Activos", "1", "1");
            accountGroupRepository.save(group);

            ledgerAccountRepository.save(new LedgerAccountEntity(accountDebitId, tenantId, group.getId(), "Caja", "1.01", "ASSET"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountCreditId, tenantId, group.getId(), "Ingresos", "4.01", "REVENUE"));
        });
        com.aequivault.infrastructure.security.TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            notificationRepository.deleteAll();
            journalEntryRepository.deleteAll();
            periodRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantId);
        });
    }

    @Test
    void shouldRejectEntryWhenPeriodIsClosedAndAcceptWhenOpen() throws Exception {
        // Asiento de prueba balanceado en mayo de 2026
        String payload = """
                {
                    "date": "2026-05-20",
                    "description": "Prueba de bloqueo",
                    "status": "POSTED",
                    "entryNumber": "JE-PERIODS-001",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 200.00,
                            "type": "DEBIT"
                        },
                        {
                            "ledgerAccountId": "%s",
                            "amount": 200.00,
                            "type": "CREDIT"
                        }
                    ]
                }
                """.formatted(accountDebitId, accountCreditId);

        // 1. Cerrar el periodo para mayo de 2026 (2026/05)
        mockMvc.perform(post("/api/v1/periods/2026/5/close")
                        .header("Authorization", "Bearer " + getTenantToken()))
                .andExpect(status().isOk());

        // 2. Intentar guardar el asiento: debe ser rechazado con 422
        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("Authorization", "Bearer " + getTenantToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.detail").value("The financial period for 2026-5 is closed for tenant " + tenantId.toString()));

        // 3. Volver a abrir el periodo (2026/05)
        mockMvc.perform(post("/api/v1/periods/2026/5/open")
                        .header("Authorization", "Bearer " + getTenantToken()))
                .andExpect(status().isOk());

        // 4. Intentar guardar de nuevo: debe ser aceptado y retornar 201
        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("Authorization", "Bearer " + getTenantToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("POSTED"))
                .andExpect(jsonPath("$.entryNumber").value("JE-PERIODS-001"));
    }

    @Test
    void shouldRejectModifyingEntryInClosedPeriod() throws Exception {
        UUID entryId = UUID.randomUUID();
        String payloadOpen = """
                {
                    "id": "%s",
                    "date": "2026-05-20",
                    "description": "Prueba modificacion",
                    "status": "POSTED",
                    "entryNumber": "JE-MOD-001",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 100.00,
                            "type": "DEBIT"
                        },
                        {
                            "ledgerAccountId": "%s",
                            "amount": 100.00,
                            "type": "CREDIT"
                        }
                    ]
                }
                """.formatted(entryId, accountDebitId, accountCreditId);

        // 1. Crear el asiento en periodo abierto (mayo 2026 esta abierto por defecto)
        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("Authorization", "Bearer " + getTenantToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadOpen))
                .andExpect(status().isCreated());

        // 2. Cerrar el periodo para mayo de 2026
        mockMvc.perform(post("/api/v1/periods/2026/5/close")
                        .header("Authorization", "Bearer " + getTenantToken()))
                .andExpect(status().isOk());

        // 3. Intentar modificar el asiento cambiandole la fecha a junio de 2026 (que esta abierto)
        String payloadModifiedDate = """
                {
                    "id": "%s",
                    "date": "2026-06-15",
                    "description": "Intento de mover fuera de periodo cerrado",
                    "status": "POSTED",
                    "entryNumber": "JE-MOD-001",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 100.00,
                            "type": "DEBIT"
                        },
                        {
                            "ledgerAccountId": "%s",
                            "amount": 100.00,
                            "type": "CREDIT"
                        }
                    ]
                }
                """.formatted(entryId, accountDebitId, accountCreditId);

        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("Authorization", "Bearer " + getTenantToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadModifiedDate))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.detail").value("The financial period for 2026-5 is closed for tenant " + tenantId.toString()));
    }
}
