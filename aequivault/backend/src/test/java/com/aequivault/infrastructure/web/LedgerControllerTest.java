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
class LedgerControllerTest {

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

        // 1. Guardar inquilinos
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
    void shouldGetLedgerReportWithRunningBalanceAndRLS() throws Exception {
        LocalDate queryStart = LocalDate.of(2026, 1, 1);
        LocalDate queryEnd = LocalDate.of(2026, 12, 31);

        // 1. Guardar asientos en Tenant A con contexto activo
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            // Asiento histórico (Fecha anterior a queryStart): Debe sumar al saldo inicial (Caja +300)
            JournalEntryEntity entryHist = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-2025-0001", LocalDate.of(2025, 12, 31), "Apertura", "USD");
            JournalLineEntity lineH1 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entryHist, accountCashAId, new BigDecimal("300.0000"), LineType.DEBIT, null);
            JournalLineEntity lineH2 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entryHist, accountRevenueAId, new BigDecimal("300.0000"), LineType.CREDIT, null);
            entryHist.setLines(List.of(lineH1, lineH2));
            journalEntryRepository.save(entryHist);

            // Asiento 1 en período: Caja +150 (Saldo acumulado: 300 + 150 = 450)
            JournalEntryEntity entry1 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-2026-0001", LocalDate.of(2026, 5, 25), "Venta Cliente", "USD");
            JournalLineEntity line1 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry1, accountCashAId, new BigDecimal("150.0000"), LineType.DEBIT, null);
            JournalLineEntity line2 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry1, accountRevenueAId, new BigDecimal("150.0000"), LineType.CREDIT, null);
            entry1.setLines(List.of(line1, line2));
            journalEntryRepository.save(entry1);

            // Asiento 2 en período: Caja -50 (pago en efectivo de caja chica) -> Caja -50 (Saldo acumulado: 450 - 50 = 400)
            JournalEntryEntity entry2 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-2026-0002", LocalDate.of(2026, 6, 15), "Pago Proveedor", "USD");
            JournalLineEntity line3 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry2, accountCashAId, new BigDecimal("50.0000"), LineType.CREDIT, null);
            JournalLineEntity line4 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry2, accountRevenueAId, new BigDecimal("50.0000"), LineType.DEBIT, null);
            entry2.setLines(List.of(line3, line4));
            journalEntryRepository.save(entry2);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 2. Guardar asientos en Tenant B para verificar aislamiento RLS
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            JournalEntryEntity entryB = new JournalEntryEntity(UUID.randomUUID(), tenantBId, "JE-B-2026-0001", LocalDate.of(2026, 5, 25), "Gasto Beta", "USD");
            JournalLineEntity lineB1 = new JournalLineEntity(UUID.randomUUID(), tenantBId, entryB, accountCashBId, new BigDecimal("500.0000"), LineType.DEBIT, null);
            JournalLineEntity lineB2 = new JournalLineEntity(UUID.randomUUID(), tenantBId, entryB, accountCashBId, new BigDecimal("500.0000"), LineType.CREDIT, null);
            entryB.setLines(List.of(lineB1, lineB2));
            journalEntryRepository.save(entryB);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 3. Consultar reporte del Libro Mayor para cuenta Caja de Tenant A
        mockMvc.perform(get("/api/v1/ledger/" + accountCashAId)
                        .header("X-Tenant-ID", tenantAId.toString())
                        .param("startDate", queryStart.toString())
                        .param("endDate", queryEnd.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value(accountCashAId.toString()))
                .andExpect(jsonPath("$.accountCode").value("1.01"))
                .andExpect(jsonPath("$.accountName").value("Caja"))
                .andExpect(jsonPath("$.initialBalance").value(300.0))
                .andExpect(jsonPath("$.finalBalance").value(400.0))
                .andExpect(jsonPath("$.lines", hasSize(2)))
                // Línea 1 (Venta): Debe 150, Haber 0, Saldo Acumulado 450
                .andExpect(jsonPath("$.lines[0].entryNumber").value("JE-2026-0001"))
                .andExpect(jsonPath("$.lines[0].debit").value(150.0))
                .andExpect(jsonPath("$.lines[0].credit").value(0.0))
                .andExpect(jsonPath("$.lines[0].runningBalance").value(450.0))
                // Línea 2 (Pago): Debe 0, Haber 50, Saldo Acumulado 400
                .andExpect(jsonPath("$.lines[1].entryNumber").value("JE-2026-0002"))
                .andExpect(jsonPath("$.lines[1].debit").value(0.0))
                .andExpect(jsonPath("$.lines[1].credit").value(50.0))
                .andExpect(jsonPath("$.lines[1].runningBalance").value(400.0));
    }
}
