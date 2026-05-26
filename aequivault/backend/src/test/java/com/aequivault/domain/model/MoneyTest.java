package com.aequivault.domain.model;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;

import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    private static final Currency USD = Currency.getInstance("USD");
    private static final Currency EUR = Currency.getInstance("EUR");

    @Test
    void shouldCreateMoneyWithScaleAndCurrency() {
        Money money = Money.of(new BigDecimal("100.50"), USD);
        assertEquals(new BigDecimal("100.500000"), money.amount());
        assertEquals(USD, money.currency());
    }

    @Test
    void shouldFailOnNullAmountOrCurrency() {
        assertThrows(IllegalArgumentException.class, () -> Money.of(null, USD));
        assertThrows(IllegalArgumentException.class, () -> Money.of(BigDecimal.TEN, null));
    }

    @Test
    void shouldAddSameCurrency() {
        Money m1 = Money.of(new BigDecimal("10.25"), USD);
        Money m2 = Money.of(new BigDecimal("5.75"), USD);
        Money result = m1.add(m2);

        assertEquals(new BigDecimal("16.000000"), result.amount());
        assertEquals(USD, result.currency());
        assertNotSame(m1, result); // Inmutable
    }

    @Test
    void shouldFailToAddDifferentCurrencies() {
        Money m1 = Money.of(new BigDecimal("10.25"), USD);
        Money m2 = Money.of(new BigDecimal("5.75"), EUR);

        assertThrows(IllegalArgumentException.class, () -> m1.add(m2));
    }

    @Test
    void shouldSubtractSameCurrency() {
        Money m1 = Money.of(new BigDecimal("10.25"), USD);
        Money m2 = Money.of(new BigDecimal("5.75"), USD);
        Money result = m1.subtract(m2);

        assertEquals(new BigDecimal("4.500000"), result.amount());
        assertEquals(USD, result.currency());
    }

    @Test
    void shouldFailToSubtractDifferentCurrencies() {
        Money m1 = Money.of(new BigDecimal("10.25"), USD);
        Money m2 = Money.of(new BigDecimal("5.75"), EUR);

        assertThrows(IllegalArgumentException.class, () -> m1.subtract(m2));
    }

    @Test
    void shouldRoundForPersistenceUsingBankersRounding() {
        // Redondeo del banquero (HALF_EVEN) a 4 decimales
        // 1.00005 -> 1.0000 (el anterior par es 0)
        // 1.00015 -> 1.0002 (el anterior par es 2)
        Money m1 = Money.of(new BigDecimal("1.00005"), USD);
        Money m2 = Money.of(new BigDecimal("1.00015"), USD);
        Money m3 = Money.of(new BigDecimal("1.00025"), USD);

        assertEquals(new BigDecimal("1.0000"), m1.toPersistedAmount());
        assertEquals(new BigDecimal("1.0002"), m2.toPersistedAmount());
        assertEquals(new BigDecimal("1.0002"), m3.toPersistedAmount());
    }

    @Test
    void shouldMultiplyWithBigDecimal() {
        Money m1 = Money.of(new BigDecimal("10.00"), USD);
        Money result = m1.multiply(new BigDecimal("1.5"));

        assertEquals(new BigDecimal("15.000000"), result.amount());
    }
}
