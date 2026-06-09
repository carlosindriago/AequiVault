package com.aequivault.domain.repository;

import com.aequivault.domain.model.JournalEntry;
import com.aequivault.infrastructure.web.dto.JournalEntryFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface JournalEntryRepository {
    UUID save(JournalEntry journalEntry);
    Optional<JournalEntry> findById(UUID id);
    Page<JournalEntry> findAll(JournalEntryFilter filter, Pageable pageable);
}
