package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.DraftJournalEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SpringDataDraftJournalEntryRepository extends JpaRepository<DraftJournalEntryEntity, UUID> {
}
