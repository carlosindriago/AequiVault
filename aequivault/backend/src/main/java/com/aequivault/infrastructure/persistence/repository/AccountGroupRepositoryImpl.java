package com.aequivault.infrastructure.persistence.repository;

import com.aequivault.domain.model.AccountGroup;
import com.aequivault.domain.repository.AccountGroupRepository;
import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import com.aequivault.infrastructure.persistence.mapper.AccountGroupMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class AccountGroupRepositoryImpl implements AccountGroupRepository {

    private final SpringDataAccountGroupRepository springDataRepository;
    private final SpringDataLedgerAccountRepository ledgerAccountRepository;
    private final AccountGroupMapper mapper;

    public AccountGroupRepositoryImpl(
            SpringDataAccountGroupRepository springDataRepository,
            SpringDataLedgerAccountRepository ledgerAccountRepository,
            AccountGroupMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.ledgerAccountRepository = ledgerAccountRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public UUID save(AccountGroup group) {
        AccountGroupEntity entity = mapper.toEntity(group);
        springDataRepository.save(entity);
        return entity.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AccountGroup> findById(UUID id) {
        return springDataRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AccountGroup> findByPath(UUID tenantId, String path) {
        return springDataRepository.findByTenantIdAndPath(tenantId, path).map(mapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountGroup> findAll(UUID tenantId) {
        return springDataRepository.findAllByTenantId(tenantId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        springDataRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasChildren(UUID tenantId, String path) {
        return springDataRepository.hasChildren(tenantId, path);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasLedgerAccounts(UUID tenantId, UUID groupId) {
        return ledgerAccountRepository.existsByTenantIdAndGroupId(tenantId, groupId);
    }
}
