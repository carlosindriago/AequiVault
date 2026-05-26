package com.aequivault.infrastructure.persistence.mapper;

import com.aequivault.domain.model.AccountGroup;
import com.aequivault.infrastructure.persistence.entity.AccountGroupEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountGroupMapper {

    AccountGroupEntity toEntity(AccountGroup domain);

    AccountGroup toDomain(AccountGroupEntity entity);
}
