package com.aequivault.infrastructure.persistence.mapper;

import com.aequivault.domain.model.JournalEntry;
import com.aequivault.domain.model.JournalLine;
import com.aequivault.domain.model.Money;
import com.aequivault.infrastructure.persistence.entity.DraftJournalEntryEntity;
import com.aequivault.infrastructure.persistence.entity.DraftJournalLineEntity;
import com.aequivault.infrastructure.persistence.entity.JournalEntryEntity;
import com.aequivault.infrastructure.persistence.entity.JournalLineEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.math.BigDecimal;
import java.util.Currency;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface JournalEntryMapper {

    // --- Posted Entry Mappings ---

    @Mapping(target = "currency", expression = "java(getCurrency(domain))")
    @Mapping(target = "lines", source = "lines")
    JournalEntryEntity toEntity(JournalEntry domain);

    @Mapping(target = "lines", ignore = true)
    @Mapping(target = "status", ignore = true)
    JournalEntry toDomain(JournalEntryEntity entity);

    @Mapping(target = "entry", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    JournalLineEntity toEntity(JournalLine domain);

    // --- Draft Entry Mappings ---

    @Mapping(target = "currency", expression = "java(getCurrency(domain))")
    @Mapping(target = "lines", source = "lines")
    DraftJournalEntryEntity toDraftEntity(JournalEntry domain);

    @Mapping(target = "lines", ignore = true)
    @Mapping(target = "status", ignore = true)
    JournalEntry toDomain(DraftJournalEntryEntity entity);

    @Mapping(target = "draftEntry", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    DraftJournalLineEntity toDraftEntity(JournalLine domain);

    // --- Custom and Helper Mappings ---

    default BigDecimal map(Money money) {
        if (money == null) {
            return null;
        }
        return money.toPersistedAmount();
    }

    default String getCurrency(JournalEntry domain) {
        if (domain.getLines() == null || domain.getLines().isEmpty()) {
            return "USD";
        }
        return domain.getLines().get(0).amount().currency().getCurrencyCode();
    }

    @AfterMapping
    default void toDomainAfterMapping(JournalEntryEntity entity, @MappingTarget JournalEntry domain) {
        if (entity.getLines() != null) {
            entity.getLines().forEach(line -> domain.addLine(new JournalLine(
                    line.getId(),
                    line.getLedgerAccountId(),
                    Money.of(line.getAmount(), Currency.getInstance(entity.getCurrency())),
                    line.getType()
            )));
        }
        domain.setStatus(com.aequivault.domain.model.EntryStatus.POSTED);
    }

    @AfterMapping
    default void toDomainAfterMapping(DraftJournalEntryEntity entity, @MappingTarget JournalEntry domain) {
        if (entity.getLines() != null) {
            entity.getLines().forEach(line -> domain.addLine(new JournalLine(
                    line.getId(),
                    line.getLedgerAccountId(),
                    Money.of(line.getAmount(), Currency.getInstance(entity.getCurrency())),
                    line.getType()
            )));
        }
        domain.setStatus(com.aequivault.domain.model.EntryStatus.DRAFT);
    }

    @AfterMapping
    default void linkLines(@MappingTarget JournalEntryEntity entity) {
        if (entity.getLines() != null) {
            entity.getLines().forEach(line -> {
                line.setEntry(entity);
                line.setTenantId(entity.getTenantId());
            });
        }
    }

    @AfterMapping
    default void linkDraftLines(@MappingTarget DraftJournalEntryEntity entity) {
        if (entity.getLines() != null) {
            entity.getLines().forEach(line -> {
                line.setDraftEntry(entity);
                line.setTenantId(entity.getTenantId());
            });
        }
    }
}
