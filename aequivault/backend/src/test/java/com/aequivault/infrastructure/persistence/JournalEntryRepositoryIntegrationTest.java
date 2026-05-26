package com.aequivault.infrastructure.persistence;

import com.aequivault.domain.model.*;
import com.aequivault.domain.repository.JournalEntryRepository;
import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.entity.TenantEntity;
import com.aequivault.infrastructure.persistence.repository.*;
import com.aequivault.infrastructure.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Currency;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JournalEntryRepositoryIntegrationTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private SpringDataAccountGroupRepository accountGroupRepository;

    @Autowired
    private SpringDataLedgerAccountRepository ledgerAccountRepository;

    @Autowired
    private SpringDataJournalEntryRepository springDataJournalEntryRepository;

    @Autowired
    private SpringDataDraftJournalEntryRepository springDataDraftJournalEntryRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    private UUID tenantAId;
    private UUID tenantBId;

    private UUID accountA1Id;
    private UUID accountA2Id;
    private UUID accountB1Id;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        tenantAId = UUID.randomUUID();
        tenantBId = UUID.randomUUID();

        // 1. Guardar inquilinos (la tabla tenants no tiene RLS, se ejecuta sin contexto)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.save(new TenantEntity(tenantAId, "Tenant A"));
            tenantRepository.save(new TenantEntity(tenantBId, "Tenant B"));
        });

        // 2. Guardar grupos de cuentas y cuentas para Tenant A (con RLS activo)
        TenantContext.setTenantId(tenantAId.toString());
        accountA1Id = UUID.randomUUID();
        accountA2Id = UUID.randomUUID();
        transactionTemplate.executeWithoutResult(status -> {
            AccountGroupEntity groupA = new AccountGroupEntity(UUID.randomUUID(), tenantAId, "Activos", "1", "1");
            accountGroupRepository.save(groupA);

            ledgerAccountRepository.save(new LedgerAccountEntity(accountA1Id, tenantAId, groupA.getId(), "Caja Chica", "1.1.01", "ASSET"));
            ledgerAccountRepository.save(new LedgerAccountEntity(accountA2Id, tenantAId, groupA.getId(), "Ingresos por Ventas", "1.2.01", "REVENUE"));
        });
        TenantContext.clear();

        // 3. Guardar grupos de cuentas y cuentas para Tenant B (con RLS activo)
        TenantContext.setTenantId(tenantBId.toString());
        accountB1Id = UUID.randomUUID();
        transactionTemplate.executeWithoutResult(status -> {
            AccountGroupEntity groupB = new AccountGroupEntity(UUID.randomUUID(), tenantBId, "Activos", "1", "1");
            accountGroupRepository.save(groupB);

            ledgerAccountRepository.save(new LedgerAccountEntity(accountB1Id, tenantBId, groupB.getId(), "Banco", "1.1.02", "ASSET"));
        });
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        // 1. Limpiar registros de Tenant A bajo su propio contexto RLS
        TenantContext.setTenantId(tenantAId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            springDataJournalEntryRepository.deleteAll();
            springDataDraftJournalEntryRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });

        // 2. Limpiar registros de Tenant B bajo su propio contexto RLS
        TenantContext.setTenantId(tenantBId.toString());
        transactionTemplate.executeWithoutResult(status -> {
            springDataJournalEntryRepository.deleteAll();
            springDataDraftJournalEntryRepository.deleteAll();
            ledgerAccountRepository.deleteAll();
            accountGroupRepository.deleteAll();
        });

        // 3. Limpiar los inquilinos (la tabla tenants no tiene RLS)
        TenantContext.clear();
        transactionTemplate.executeWithoutResult(status -> {
            tenantRepository.deleteById(tenantAId);
            tenantRepository.deleteById(tenantBId);
        });
    }

    @Test
    void shouldSaveAndManageDraftAndPostedJournalEntriesWithRls() {
        Currency usd = Currency.getInstance("USD");
        UUID entryId = UUID.randomUUID();

        // --- 1. Crear y Guardar un Asiento en estado DRAFT para Tenant A ---
        TenantContext.setTenantId(tenantAId.toString());

        JournalEntry draftEntry = new JournalEntry(entryId, tenantAId, LocalDate.now(), "Borrador de Venta");
        draftEntry.addLine(new JournalLine(UUID.randomUUID(), accountA1Id, Money.of(new BigDecimal("100.00"), usd), LineType.DEBIT));
        draftEntry.addLine(new JournalLine(UUID.randomUUID(), accountA2Id, Money.of(new BigDecimal("100.00"), usd), LineType.CREDIT));

        transactionTemplate.executeWithoutResult(status -> {
            journalEntryRepository.save(draftEntry);
        });

        // Verificar persistencia física en borradores y ausencia en tabla firme
        transactionTemplate.executeWithoutResult(status -> {
            assertTrue(springDataDraftJournalEntryRepository.existsById(entryId), "Debe existir en la tabla de borradores");
            assertFalse(springDataJournalEntryRepository.existsById(entryId), "No debe existir en la tabla firme del diario");
        });

        // Recuperar a través del adaptador del dominio
        Optional<JournalEntry> retrievedDraftOpt = transactionTemplate.execute(status ->
            journalEntryRepository.findById(entryId)
        );
        assertTrue(retrievedDraftOpt.isPresent());
        JournalEntry retrievedDraft = retrievedDraftOpt.get();
        assertEquals(EntryStatus.DRAFT, retrievedDraft.getStatus());
        assertEquals(tenantAId, retrievedDraft.getTenantId());
        assertEquals("Borrador de Venta", retrievedDraft.getDescription());
        assertEquals(2, retrievedDraft.getLines().size());
        assertEquals("USD", retrievedDraft.getLines().get(0).amount().currency().getCurrencyCode());

        // --- 2. Verificar que Tenant B NO puede ver el borrador (RLS) ---
        TenantContext.clear();
        TenantContext.setTenantId(tenantBId.toString());

        Optional<JournalEntry> retrievedByBOpt = transactionTemplate.execute(status ->
            journalEntryRepository.findById(entryId)
        );
        assertFalse(retrievedByBOpt.isPresent(), "Tenant B no debe tener visibilidad sobre el borrador de Tenant A");

        // --- 3. Asentar (Post) el asiento contable de Tenant A ---
        TenantContext.clear();
        TenantContext.setTenantId(tenantAId.toString());

        DoubleEntryValidationService validator = new DoubleEntryValidationService();
        retrievedDraft.setEntryNumber("JE-2026-0001");
        retrievedDraft.post(validator);

        transactionTemplate.executeWithoutResult(status -> {
            journalEntryRepository.save(retrievedDraft);
        });

        // Verificar que el borrador fue eliminado de staging y persistido en el libro diario definitivo
        transactionTemplate.executeWithoutResult(status -> {
            assertFalse(springDataDraftJournalEntryRepository.existsById(entryId), "El borrador debe haber sido removido de staging");
            assertTrue(springDataJournalEntryRepository.existsById(entryId), "El asiento definitivo debe estar guardado en la tabla firme");
        });

        // Recuperar el asiento asentado
        Optional<JournalEntry> retrievedPostedOpt = transactionTemplate.execute(status ->
            journalEntryRepository.findById(entryId)
        );
        assertTrue(retrievedPostedOpt.isPresent());
        JournalEntry retrievedPosted = retrievedPostedOpt.get();
        assertEquals(EntryStatus.POSTED, retrievedPosted.getStatus());
        assertEquals("JE-2026-0001", retrievedPosted.getEntryNumber());
        assertEquals(2, retrievedPosted.getLines().size());
        assertEquals("USD", retrievedPosted.getLines().get(0).amount().currency().getCurrencyCode());

        // --- 4. Verificar que Tenant B tampoco puede ver el asiento firme (RLS) ---
        TenantContext.clear();
        TenantContext.setTenantId(tenantBId.toString());

        Optional<JournalEntry> retrievedPostedByBOpt = transactionTemplate.execute(status ->
            journalEntryRepository.findById(entryId)
        );
        assertFalse(retrievedPostedByBOpt.isPresent(), "Tenant B no debe tener visibilidad sobre el asiento definitivo de Tenant A");

        TenantContext.clear();
    }
}
