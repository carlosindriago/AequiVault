package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.infrastructure.persistence.entity.DraftJournalEntryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.UUID;

public interface SpringDataDraftJournalEntryRepository extends JpaRepository<DraftJournalEntryEntity, UUID> {

    @Query("SELECT e FROM DraftJournalEntryEntity e WHERE " +
           "(:from IS NULL OR e.date >= :from) AND " +
           "(:to IS NULL OR e.date <= :to) AND " +
           "(:query IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<DraftJournalEntryEntity> findWithFilters(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("query") String query,
            Pageable pageable);
}
