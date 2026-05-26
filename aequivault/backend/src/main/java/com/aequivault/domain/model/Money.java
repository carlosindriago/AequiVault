package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;

public record Money(BigDecimal amount, Currency currency) {

    private static final int INTERNAL_SCALE = 6;
    private static final int DB_SCALE = 4;

    public Money {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (currency == null) {
            throw new IllegalArgumentException("Currency cannot be null");
        }
        // Normalizamos la escala interna a 6 decimales usando redondeo HALF_EVEN
        amount = amount.setScale(INTERNAL_SCALE, RoundingMode.HALF_EVEN);
    }

    public static Money of(BigDecimal amount, Currency currency) {
        return new Money(amount, currency);
    }

    public Money add(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    public Money multiply(BigDecimal factor) {
        if (factor == null) {
            throw new IllegalArgumentException("Factor cannot be null");
        }
        return new Money(this.amount.multiply(factor), this.currency);
    }

    public BigDecimal toPersistedAmount() {
        return this.amount.setScale(DB_SCALE, RoundingMode.HALF_EVEN);
    }

    private void validateSameCurrency(Money other) {
        if (other == null) {
            throw new IllegalArgumentException("Other money cannot be null");
        }
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currencies must match. Found: " + this.currency.getCurrencyCode() + " and " + other.currency.getCurrencyCode());
        }
    }
}
