package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.domain.model.LedgerAccount;
import com.aequivault.domain.repository.LedgerAccountRepository;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import com.aequivault.infrastructure.persistence.mapper.LedgerAccountMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class LedgerAccountRepositoryImpl implements LedgerAccountRepository {

    private final SpringDataLedgerAccountRepository springDataRepository;
    private final LedgerAccountMapper mapper;

    public LedgerAccountRepositoryImpl(
            SpringDataLedgerAccountRepository springDataRepository,
            LedgerAccountMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public UUID save(LedgerAccount account) {
        LedgerAccountEntity entity = mapper.toEntity(account);
        springDataRepository.save(entity);
        return entity.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LedgerAccount> findById(UUID id) {
        return springDataRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LedgerAccount> findAll() {
        return springDataRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
