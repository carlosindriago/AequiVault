package com.aequivault.domain.repository;

import com.aequivault.domain.model.LedgerAccount;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LedgerAccountRepository {
    UUID save(LedgerAccount account);
    Optional<LedgerAccount> findById(UUID id);
    List<LedgerAccount> findAll();
}
