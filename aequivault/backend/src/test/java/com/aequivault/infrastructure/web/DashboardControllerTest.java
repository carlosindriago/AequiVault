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
class DashboardControllerTest {

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

    private UUID groupAssetsId;
    private UUID groupLiabilitiesId;
    private UUID groupRevenuesId;
    private UUID groupBId;

    private UUID accountCashAId;
    private UUID accountRevenueAId;
    private UUID accountLiabilityAId;
    private UUID accountCashBId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantAId = UUID.randomUUID();
        tenantBId = UUID.randomUUID();
        groupAssetsId = UUID.randomUUID();
        groupLiabilitiesId = UUID.randomUUID();
        groupRevenuesId = UUID.randomUUID();
        groupBId = UUID.randomUUID();
        accountCashAId = UUID.randomUUID();
        accountRevenueAId = UUID.randomUUID();
        accountLiabilityAId = UUID.randomUUID();
        accountCashBId = UUID.randomUUID();

        // 1. Guardar inquilinos
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantAId, "Tenant Alpha"));
            tenantRepository.save(new TenantEntity(tenantBId, "Tenant Beta"));
        });

        // 2. Guardar grupos y cuentas de Tenant A
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(groupAssetsId, tenantAId, "Activos", "1", "1"));
            accountGroupRepository.save(new AccountGroupEntity(groupLiabilitiesId, tenantAId, "Pasivos", "2", "2"));
            accountGroupRepository.save(new AccountGroupEntity(groupRevenuesId, tenantAId, "Ingresos", "4", "4"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountCashAId, tenantAId, groupAssetsId, "Caja Banco", "1.01", "ASSET"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountRevenueAId, tenantAId, groupRevenuesId, "Ventas", "4.01", "REVENUE"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountLiabilityAId, tenantAId, groupLiabilitiesId, "Proveedores", "2.01", "LIABILITY"));
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 3. Guardar grupos y cuentas de Tenant B
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            accountGroupRepository.save(new AccountGroupEntity(groupBId, tenantBId, "Activos B", "1", "1"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountCashBId, tenantBId, groupBId, "Caja B", "1.01", "ASSET"));
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
    void shouldGenerateDashboardDataWithDailyLiquidityAndRLS() throws Exception {
        LocalDate queryStart = LocalDate.of(2026, 5, 1);
        LocalDate queryEnd = LocalDate.of(2026, 5, 31);

        // 1. Guardar transacciones en Tenant A
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            // Asiento Histórico (anterior a queryStart): Saldo Inicial de Caja = 500
            JournalEntryEntity histEntry = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-HIST", LocalDate.of(2025, 12, 31), "Aporte Capital Inicial", "USD");
            JournalLineEntity l1 = new JournalLineEntity(UUID.randomUUID(), tenantAId, histEntry, accountCashAId, new BigDecimal("500.0000"), LineType.DEBIT, null);
            JournalLineEntity l2 = new JournalLineEntity(UUID.randomUUID(), tenantAId, histEntry, accountRevenueAId, new BigDecimal("500.0000"), LineType.CREDIT, null);
            histEntry.setLines(List.of(l1, l2));
            journalEntryRepository.save(histEntry);

            // Asiento 1 (10 de Mayo): Caja suma 100
            JournalEntryEntity entry1 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-0001", LocalDate.of(2026, 5, 10), "Cobro Venta", "USD");
            JournalLineEntity l3 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry1, accountCashAId, new BigDecimal("100.0000"), LineType.DEBIT, null);
            JournalLineEntity l4 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry1, accountRevenueAId, new BigDecimal("100.0000"), LineType.CREDIT, null);
            entry1.setLines(List.of(l3, l4));
            journalEntryRepository.save(entry1);

            // Asiento 2 (15 de Mayo): Caja suma 50
            JournalEntryEntity entry2 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-0002", LocalDate.of(2026, 5, 15), "Venta menor", "USD");
            JournalLineEntity l5 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry2, accountCashAId, new BigDecimal("50.0000"), LineType.DEBIT, null);
            JournalLineEntity l6 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry2, accountRevenueAId, new BigDecimal("50.0000"), LineType.CREDIT, null);
            entry2.setLines(List.of(l5, l6));
            journalEntryRepository.save(entry2);

            // Asiento 3 (20 de Mayo): Pago a Proveedores = 30 (Proveedores Debe 30, Caja Haber 30)
            // Proveedores es LIABILITY. Un débito disminuye el pasivo (-30).
            // Caja disminuye por el Haber 30.
            JournalEntryEntity entry3 = new JournalEntryEntity(UUID.randomUUID(), tenantAId, "JE-0003", LocalDate.of(2026, 5, 20), "Pago Proveedor", "USD");
            JournalLineEntity l7 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry3, accountLiabilityAId, new BigDecimal("30.0000"), LineType.DEBIT, null);
            JournalLineEntity l8 = new JournalLineEntity(UUID.randomUUID(), tenantAId, entry3, accountCashAId, new BigDecimal("30.0000"), LineType.CREDIT, null);
            entry3.setLines(List.of(l7, l8));
            journalEntryRepository.save(entry3);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 2. Guardar transacciones en Tenant B (aislado por RLS)
        com.aequivault.infrastructure.security.TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            JournalEntryEntity entryB = new JournalEntryEntity(UUID.randomUUID(), tenantBId, "JE-B1", LocalDate.of(2026, 5, 12), "Transacción Beta", "USD");
            JournalLineEntity lb1 = new JournalLineEntity(UUID.randomUUID(), tenantBId, entryB, accountCashBId, new BigDecimal("999.0000"), LineType.DEBIT, null);
            JournalLineEntity lb2 = new JournalLineEntity(UUID.randomUUID(), tenantBId, entryB, accountCashBId, new BigDecimal("999.0000"), LineType.CREDIT, null);
            entryB.setLines(List.of(lb1, lb2));
            journalEntryRepository.save(entryB);
        });
        com.aequivault.infrastructure.security.TenantContext.clear();

        // 3. Ejecutar consulta HTTP para el Dashboard de Tenant A
        // Total Activos Esperado: Caja (Saldo = 500 + 100 + 50 - 30 = 620)
        // Total Pasivos Esperado: Proveedores (Saldo = Credit - Debit = 0 - 30 = -30)
        // Patrimonio Neto Esperado: 620 - (-30) = 650
        // Liquidez Trend Esperado: 31 registros (Mayo 1 a Mayo 31).
        // - Mayo 1 al 9: saldo 500.0
        // - Mayo 10 al 14: saldo 600.0
        // - Mayo 15 al 19: saldo 650.0
        // - Mayo 20 al 31: saldo 620.0
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("X-Tenant-ID", tenantAId.toString())
                        .param("startDate", queryStart.toString())
                        .param("endDate", queryEnd.toString())
                        .param("cashAccountId", accountCashAId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets").value(620.0))
                .andExpect(jsonPath("$.totalLiabilities").value(-30.0))
                .andExpect(jsonPath("$.netEquity").value(650.0))
                .andExpect(jsonPath("$.liquidityTrend", hasSize(31)))
                // Comprobamos la interpolación y el arrastre de saldos correctos
                .andExpect(jsonPath("$.liquidityTrend[0].date").value("2026-05-01"))
                .andExpect(jsonPath("$.liquidityTrend[0].balance").value(500.0))
                .andExpect(jsonPath("$.liquidityTrend[9].date").value("2026-05-10"))
                .andExpect(jsonPath("$.liquidityTrend[9].balance").value(600.0))
                .andExpect(jsonPath("$.liquidityTrend[14].date").value("2026-05-15"))
                .andExpect(jsonPath("$.liquidityTrend[14].balance").value(650.0))
                .andExpect(jsonPath("$.liquidityTrend[19].date").value("2026-05-20"))
                .andExpect(jsonPath("$.liquidityTrend[19].balance").value(620.0))
                .andExpect(jsonPath("$.liquidityTrend[30].date").value("2026-05-31"))
                .andExpect(jsonPath("$.liquidityTrend[30].balance").value(620.0));
    }
}
