package com.aequivault.domain.repository;

import com.aequivault.domain.model.AccountGroup;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountGroupRepository {
    UUID save(AccountGroup group);
    Optional<AccountGroup> findById(UUID id);
    Optional<AccountGroup> findByPath(UUID tenantId, String path);
    List<AccountGroup> findAll(UUID tenantId);
    void delete(UUID id);
    boolean hasChildren(UUID tenantId, String path);
    boolean hasLedgerAccounts(UUID tenantId, UUID groupId);
}
