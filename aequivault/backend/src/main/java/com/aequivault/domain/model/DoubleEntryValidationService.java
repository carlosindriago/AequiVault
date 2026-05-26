package com.aequivault.domain.model;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.List;

public class DoubleEntryValidationService {

    public void validateBalance(List<JournalLine> lines) {
        if (lines == null || lines.size() < 2) {
            throw new IllegalArgumentException("A journal entry must have at least 2 lines");
        }

        // Validamos que todas las líneas tengan la misma moneda
        Currency referenceCurrency = lines.get(0).amount().currency();
        for (JournalLine line : lines) {
            if (!line.amount().currency().equals(referenceCurrency)) {
                throw new IllegalArgumentException("All lines in a journal entry must have the same currency. Mixed currencies found: "
                        + referenceCurrency.getCurrencyCode() + " and " + line.amount().currency().getCurrencyCode());
            }
        }

        // Sumamos Débitos y Créditos
        BigDecimal debitTotal = BigDecimal.ZERO;
        BigDecimal creditTotal = BigDecimal.ZERO;

        for (JournalLine line : lines) {
            if (line.type() == LineType.DEBIT) {
                debitTotal = debitTotal.add(line.amount().amount());
            } else if (line.type() == LineType.CREDIT) {
                creditTotal = creditTotal.add(line.amount().amount());
            }
        }

        // La regla de oro contable: Debe = Haber
        if (debitTotal.compareTo(creditTotal) != 0) {
            BigDecimal difference = debitTotal.subtract(creditTotal).abs();
            throw new IllegalArgumentException("The journal entry is unbalanced. Difference: " + difference + " " + referenceCurrency.getCurrencyCode()
                    + " (Debit: " + debitTotal + ", Credit: " + creditTotal + ")");
        }
    }
}
