package com.aequivault.domain.repository;

import com.aequivault.domain.model.JournalEntry;
import java.util.Optional;
import java.util.UUID;

public interface JournalEntryRepository {
    UUID save(JournalEntry journalEntry);
    Optional<JournalEntry> findById(UUID id);
}
