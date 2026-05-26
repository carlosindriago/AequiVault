package com.aequivault.infrastructure.persistence.mapper;

import com.aequivault.domain.model.LedgerAccount;
import com.aequivault.infrastructure.persistence.entity.LedgerAccountEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LedgerAccountMapper {

    LedgerAccountEntity toEntity(LedgerAccount domain);

    LedgerAccount toDomain(LedgerAccountEntity entity);
}
