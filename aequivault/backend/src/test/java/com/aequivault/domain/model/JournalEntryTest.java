package com.aequivault.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Currency;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JournalEntryTest {

    private static final Currency USD = Currency.getInstance("USD");
    private static final Currency EUR = Currency.getInstance("EUR");
    private UUID tenantId;
    private UUID accountBanco;
    private UUID accountVentas;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        accountBanco = UUID.randomUUID();
        accountVentas = UUID.randomUUID();
    }

    @Test
    void shouldPostSuccessfullyWhenBalanced() {
        JournalEntry entry = new JournalEntry(UUID.randomUUID(), tenantId, LocalDate.now(), "Venta del día");
        
        entry.addLine(new JournalLine(UUID.randomUUID(), accountBanco, Money.of(new BigDecimal("100.00"), USD), LineType.DEBIT));
        entry.addLine(new JournalLine(UUID.randomUUID(), accountVentas, Money.of(new BigDecimal("100.00"), USD), LineType.CREDIT));
        
        assertEquals(EntryStatus.DRAFT, entry.getStatus());
        
        entry.post(new DoubleEntryValidationService());
        
        assertEquals(EntryStatus.POSTED, entry.getStatus());
    }

    @Test
    void shouldFailToPostWithLessThanTwoLines() {
        JournalEntry entry = new JournalEntry(UUID.randomUUID(), tenantId, LocalDate.now(), "Venta incompleta");
        
        entry.addLine(new JournalLine(UUID.randomUUID(), accountBanco, Money.of(new BigDecimal("100.00"), USD), LineType.DEBIT));
        
        DoubleEntryValidationService service = new DoubleEntryValidationService();
        
        assertThrows(IllegalArgumentException.class, () -> entry.post(service));
    }

    @Test
    void shouldFailToPostWhenUnbalancedByOneCent() {
        JournalEntry entry = new JournalEntry(UUID.randomUUID(), tenantId, LocalDate.now(), "Venta con desbalance");
        
        // $100.00 Debe vs $99.99 Haber (diferencia de 1 centavo)
        entry.addLine(new JournalLine(UUID.randomUUID(), accountBanco, Money.of(new BigDecimal("100.00"), USD), LineType.DEBIT));
        entry.addLine(new JournalLine(UUID.randomUUID(), accountVentas, Money.of(new BigDecimal("99.99"), USD), LineType.CREDIT));
        
        DoubleEntryValidationService service = new DoubleEntryValidationService();
        
        assertThrows(IllegalArgumentException.class, () -> entry.post(service));
    }

    @Test
    void shouldFailToPostWhenMultipleCurrenciesAreUsed() {
        JournalEntry entry = new JournalEntry(UUID.randomUUID(), tenantId, LocalDate.now(), "Asiento multimoneda");
        
        // Debe en USD, Haber en EUR
        entry.addLine(new JournalLine(UUID.randomUUID(), accountBanco, Money.of(new BigDecimal("100.00"), USD), LineType.DEBIT));
        entry.addLine(new JournalLine(UUID.randomUUID(), accountVentas, Money.of(new BigDecimal("100.00"), EUR), LineType.CREDIT));
        
        DoubleEntryValidationService service = new DoubleEntryValidationService();
        
        assertThrows(IllegalArgumentException.class, () -> entry.post(service));
    }

    @Test
    void shouldFailToModifyOrPostAlreadyPostedEntry() {
        JournalEntry entry = new JournalEntry(UUID.randomUUID(), tenantId, LocalDate.now(), "Asiento inmutable");
        entry.addLine(new JournalLine(UUID.randomUUID(), accountBanco, Money.of(new BigDecimal("150.00"), USD), LineType.DEBIT));
        entry.addLine(new JournalLine(UUID.randomUUID(), accountVentas, Money.of(new BigDecimal("150.00"), USD), LineType.CREDIT));
        
        DoubleEntryValidationService service = new DoubleEntryValidationService();
        entry.post(service);
        
        // Intentar agregar una línea en estado POSTED debe fallar
        assertThrows(IllegalStateException.class, () -> 
            entry.addLine(new JournalLine(UUID.randomUUID(), accountBanco, Money.of(new BigDecimal("50.00"), USD), LineType.DEBIT))
        );
        
        // Intentar volver a asentar debe fallar
        assertThrows(IllegalStateException.class, () -> entry.post(service));
    }
}
