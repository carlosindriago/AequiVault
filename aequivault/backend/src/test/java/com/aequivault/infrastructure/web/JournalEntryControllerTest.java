package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataJournalEntryRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataDraftJournalEntryRepository;
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
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class JournalEntryControllerTest {

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
    private SpringDataDraftJournalEntryRepository draftJournalEntryRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    private UUID tenantAId;
    private UUID tenantBId;
    private UUID accountA1Id;
    private UUID accountA2Id;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantAId = UUID.randomUUID();
        tenantBId = UUID.randomUUID();
        accountA1Id = UUID.randomUUID();
        accountA2Id = UUID.randomUUID();

        // Guardar inquilinos sin contexto (tabla tenants no tiene RLS)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantAId, "Tenant A"));
            tenantRepository.save(new TenantEntity(tenantBId, "Tenant B"));
        });

        // Guardar cuentas para Tenant A con contexto RLS activo
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            AccountGroupEntity groupA = new AccountGroupEntity(UUID.randomUUID(), tenantAId, "Activos", "1", "1");
            accountGroupRepository.save(groupA);

            ledgerAccountRepository.save(new LedgerAccountEntity(accountA1Id, tenantAId, groupA.getId(), "Caja Chica", "1.1.01", "ASSET"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountA2Id, tenantAId, groupA.getId(), "Ingresos por Ventas", "1.2.01", "REVENUE"));
        });
        com.aequivault.infrastructure.security.TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        // 1. Limpiar Tenant A con su contexto RLS
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            notificationRepository.deleteAll();
            journalEntryRepository.deleteAll();
            draftJournalEntryRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });

        // 2. Limpiar Tenant B con su contexto RLS
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            notificationRepository.deleteAll();
            journalEntryRepository.deleteAll();
            draftJournalEntryRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });

        com.aequivault.infrastructure.security.TenantContext.clear();

        // 3. Limpiar inquilinos sin RLS
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantAId);
            tenantRepository.deleteById(tenantBId);
        });
    }

    @Test
    void shouldSaveDraftWithoutValidation() throws Exception {
        String draftPayload = """
                {
                    "date": "2026-05-25",
                    "description": "Borrador de Venta",
                    "status": "DRAFT",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 100.00,
                            "type": "DEBIT"
                        }
                    ]
                }
                """.formatted(accountA1Id);

        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("X-Tenant-ID", tenantAId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.lines", hasSize(1)));
    }

    @Test
    void shouldSavePostedWhenBalancedAndNumberProvided() throws Exception {
        UUID entryId = UUID.randomUUID();
        String postedPayload = """
                {
                    "id": "%s",
                    "date": "2026-05-25",
                    "description": "Venta en Firme",
                    "status": "POSTED",
                    "entryNumber": "JE-2026-0001",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 1500.00,
                            "type": "DEBIT"
                        },
                        {
                            "ledgerAccountId": "%s",
                            "amount": 1500.00,
                            "type": "CREDIT"
                        }
                    ]
                }
                """.formatted(entryId, accountA1Id, accountA2Id);

        // 1. Post entry successfully
        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("X-Tenant-ID", tenantAId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(postedPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(entryId.toString()))
                .andExpect(jsonPath("$.status").value("POSTED"))
                .andExpect(jsonPath("$.entryNumber").value("JE-2026-0001"))
                .andExpect(jsonPath("$.lines", hasSize(2)));

        // 2. Fetch entry successfully
        mockMvc.perform(get("/api/v1/journal/entries/" + entryId)
                        .header("X-Tenant-ID", tenantAId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entryId.toString()))
                .andExpect(jsonPath("$.status").value("POSTED"))
                .andExpect(jsonPath("$.entryNumber").value("JE-2026-0001"));

        // 3. Verify RLS isolation: Tenant B trying to fetch Tenant A's entry must get 404
        mockMvc.perform(get("/api/v1/journal/entries/" + entryId)
                        .header("X-Tenant-ID", tenantBId.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectPostedUnbalancedEntryWith422() throws Exception {
        String unbalancedPayload = """
                {
                    "date": "2026-05-25",
                    "description": "Venta Desbalanceada",
                    "status": "POSTED",
                    "entryNumber": "JE-2026-9999",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 1500.00,
                            "type": "DEBIT"
                        },
                        {
                            "ledgerAccountId": "%s",
                            "amount": 1400.00,
                            "type": "CREDIT"
                        }
                    ]
                }
                """.formatted(accountA1Id, accountA2Id);

        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("X-Tenant-ID", tenantAId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(unbalancedPayload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.detail").value("The journal entry is unbalanced. Difference: 100.000000 USD (Debit: 1500.000000, Credit: 1400.000000)"));
    }

    @Test
    void shouldRejectPostedWithoutEntryNumberWith422() throws Exception {
        String payload = """
                {
                    "date": "2026-05-25",
                    "description": "Venta Sin Numero",
                    "status": "POSTED",
                    "currency": "USD",
                    "lines": [
                        {
                            "ledgerAccountId": "%s",
                            "amount": 1500.00,
                            "type": "DEBIT"
                        },
                        {
                            "ledgerAccountId": "%s",
                            "amount": 1500.00,
                            "type": "CREDIT"
                        }
                    ]
                }
                """.formatted(accountA1Id, accountA2Id);

        mockMvc.perform(post("/api/v1/journal/entries")
                        .header("X-Tenant-ID", tenantAId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Violación de Regla de Negocio Contable"))
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.detail").value("Entry number is required for posted journal entries"));
    }
}
