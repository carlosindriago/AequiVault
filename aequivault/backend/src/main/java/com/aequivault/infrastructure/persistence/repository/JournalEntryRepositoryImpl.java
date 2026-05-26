package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.domain.model.EntryStatus;
import com.aequivault.domain.model.JournalEntry;
import com.aequivault.domain.repository.JournalEntryRepository;
import com.aequivault.infrastructure.persistence.entity.DraftJournalEntryEntity;
import com.aequivault.infrastructure.persistence.entity.JournalEntryEntity;
import com.aequivault.infrastructure.persistence.mapper.JournalEntryMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Repository
public class JournalEntryRepositoryImpl implements JournalEntryRepository {

    private final SpringDataJournalEntryRepository postedRepository;
    private final SpringDataDraftJournalEntryRepository draftRepository;
    private final JournalEntryMapper mapper;

    public JournalEntryRepositoryImpl(
            SpringDataJournalEntryRepository postedRepository,
            SpringDataDraftJournalEntryRepository draftRepository,
            JournalEntryMapper mapper) {
        this.postedRepository = postedRepository;
        this.draftRepository = draftRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public UUID save(JournalEntry domain) {
        if (domain.getStatus() == EntryStatus.POSTED) {
            // 1. Mapear y persistir en la tabla firme
            JournalEntryEntity entity = mapper.toEntity(domain);
            postedRepository.save(entity);

            // 2. Si existía en la tabla de borradores (drafts), eliminarlo de allí de forma transaccional
            if (draftRepository.existsById(domain.getId())) {
                draftRepository.deleteById(domain.getId());
            }
            return entity.getId();
        } else {
            // Guardar en la tabla de borradores (drafts)
            DraftJournalEntryEntity entity = mapper.toDraftEntity(domain);
            draftRepository.save(entity);
            return entity.getId();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JournalEntry> findById(UUID id) {
        // Primero buscar en el libro diario firme
        Optional<JournalEntryEntity> postedOpt = postedRepository.findById(id);
        if (postedOpt.isPresent()) {
            return postedOpt.map(mapper::toDomain);
        }
        // Si no está, buscar en borradores (drafts)
        return draftRepository.findById(id).map(mapper::toDomain);
    }
}
