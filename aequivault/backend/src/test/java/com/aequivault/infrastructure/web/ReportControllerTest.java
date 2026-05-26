package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.LineType;
import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.JournalEntryEntity;
import com.aequivault.infrastructure.persistence.entity.JournalLineEntity;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.repository.SpringDataAccountGroupRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataJournalEntryRepository;
import com.aequivault.infrastructure.persistence.repository.SpringDataLedgerAccountRepository;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SpringDataAccountGroupRepository accountGroupRepository;

    @Autowired
    private SpringDataLedgerAccountRepository ledgerAccountRepository;

    @Autowired
    private SpringDataJournalEntryRepository journalEntryRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    private UUID tenantAId;
    private UUID tenantBId;

    private UUID groupAId;
    private UUID groupBId;

    private UUID accountCashAId;
    private UUID accountRevenueAId;
    private UUID accountCashBId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantAId = UUID.randomUUID();
        tenantBId = UUID.randomUUID();
        groupAId = UUID.randomUUID();
        groupBId = UUID.randomUUID();
        accountCashAId = UUID.randomUUID();
        accountRevenueAId = UUID.randomUUID();
        accountCashBId = UUID.randomUUID();

        // 1. Guardar inquilinos (sin contexto RLS)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantAId, "Tenant Alpha"));
            tenantRepository.save(new TenantEntity(tenantBId, "Tenant Beta"));
        });

        // 2. Guardar datos de Tenant A
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(groupAId, tenantAId, "Activos", "1", "1"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountCashAId, tenantAId, groupAId, "Caja", "1.01", "ASSET"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountRevenueAId, tenantAId, groupAId, "Ventas", "4.01", "REVENUE"));
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 3. Guardar datos de Tenant B
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(groupBId, tenantBId, "Pasivos", "2", "2"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountCashBId, tenantBId, groupBId, "Proveedores", "2.01", "LIABILITY"));
        });
        com.aequivault.infrastructure.security.TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        // Limpiar Tenant A
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            journalEntryRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // Limpiar Tenant B
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            journalEntryRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // Eliminar Tenants
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantAId);
            tenantRepository.deleteById(tenantBId);
        });
    }

    @Test
    void shouldGenerateTrialBalanceWithCorrectAggregatesAndRLS() throws Exception {
        LocalDate queryStart = LocalDate.of(2026, 1, 1);
        LocalDate queryEnd = LocalDate.of(2026, 12, 31);

        // 1. Guardar asientos en Tenant A con contexto activo
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            // Asiento 1: POSTED, en fecha (Debe 150 a Caja, Haber 150 a Ventas)
            JournalEntryEntity entry1 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-2026-0001", LocalDate.of(2026, 5, 25), "Venta Cliente", "USD");
            JournalLineEntity line1 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry1, accountCashAId, new BigDecimal("150.0000"), LineType.DEBIT, null);
            JournalLineEntity line2 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry1, accountRevenueAId, new BigDecimal("150.0000"), LineType.CREDIT, null);
            entry1.setLines(List.of(line1, line2));
            journalEntryRepository.save(entry1);

            // Asiento 2: POSTED, en fecha (Debe 50 a Caja, Haber 50 a Ventas)
            JournalEntryEntity entry2 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-2026-0002", LocalDate.of(2026, 6, 15), "Venta Cliente 2", "USD");
            JournalLineEntity line3 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry2, accountCashAId, new BigDecimal("50.0000"), LineType.DEBIT, null);
            JournalLineEntity line4 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry2, accountRevenueAId, new BigDecimal("50.0000"), LineType.CREDIT, null);
            entry2.setLines(List.of(line3, line4));
            journalEntryRepository.save(entry2);

            // Asiento 3: POSTED, Fuera de rango de fecha - Debe ser ignorado
            JournalEntryEntity entry3 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-2025-0003", LocalDate.of(2025, 12, 31), "Venta Anterior", "USD");
            JournalLineEntity line5 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry3, accountCashAId, new BigDecimal("300.0000"), LineType.DEBIT, null);
            JournalLineEntity line6 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry3, accountRevenueAId, new BigDecimal("300.0000"), LineType.CREDIT, null);
            entry3.setLines(List.of(line5, line6));
            journalEntryRepository.save(entry3);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 2. Guardar asientos en Tenant B con contexto activo - Debe estar aislado por RLS
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            JournalEntryEntity entryB = new JournalEntryEntity(UUID.randomUUID(), tenantBId, "JE-B-2026-0001", LocalDate.of(2026, 5, 25), "Gasto Beta", "USD");
            JournalLineEntity lineB1 = new JournalLineEntity(UUID.randomUUID(), tenantBId, entryB, accountCashBId, new BigDecimal("500.0000"), LineType.DEBIT, null);
            JournalLineEntity lineB2 = new JournalLineEntity(UUID.randomUUID(), tenantBId, entryB, accountCashBId, new BigDecimal("500.0000"), LineType.CREDIT, null);
            entryB.setLines(List.of(lineB1, lineB2));
            journalEntryRepository.save(entryB);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 3. Ejecutar consulta HTTP para el reporte del Tenant A
        mockMvc.perform(get("/api/v1/reports/trial-balance")
                        .header("X-Tenant-ID", tenantAId.toString())
                        .param("startDate", queryStart.toString())
                        .param("endDate", queryEnd.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value(queryStart.toString()))
                .andExpect(jsonPath("$.endDate").value(queryEnd.toString()))
                .andExpect(jsonPath("$.balances", hasSize(2)))
                .andExpect(jsonPath("$.balances[0].accountCode").value("1.01"))
                .andExpect(jsonPath("$.balances[0].totalDebit").value(200.0))
                .andExpect(jsonPath("$.balances[0].totalCredit").value(0.0))
                .andExpect(jsonPath("$.balances[0].netBalance").value(200.0))
                .andExpect(jsonPath("$.balances[1].accountCode").value("4.01"))
                .andExpect(jsonPath("$.balances[1].totalDebit").value(0.0))
                .andExpect(jsonPath("$.balances[1].totalCredit").value(200.0))
                .andExpect(jsonPath("$.balances[1].netBalance").value(-200.0))
                .andExpect(jsonPath("$.totalDebitSum").value(200.0))
                .andExpect(jsonPath("$.totalCreditSum").value(200.0));
    }
}
