package com.aequivault.infrastructure.web.dto;

import java.time.LocalDate;

public record JournalEntryFilter(
        String status,       // "DRAFT", "POSTED", o null para ambos
        LocalDate from,      // fecha inicio (inclusive), nullable
        LocalDate to,        // fecha fin (inclusive), nullable
        String query         // búsqueda libre en description o entryNumber, nullable
) {}
