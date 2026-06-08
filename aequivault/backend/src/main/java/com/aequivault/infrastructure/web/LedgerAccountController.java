package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.LedgerAccount;
import com.aequivault.domain.repository.LedgerAccountRepository;
import com.aequivault.infrastructure.security.TenantContext;
import com.aequivault.infrastructure.web.dto.LedgerAccountDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ledger/accounts")
public class LedgerAccountController {

    private final LedgerAccountRepository ledgerAccountRepository;

    public LedgerAccountController(LedgerAccountRepository ledgerAccountRepository) {
        this.ledgerAccountRepository = ledgerAccountRepository;
    }

    @PostMapping
    public ResponseEntity<LedgerAccountDto> createAccount(@Valid @RequestBody LedgerAccountDto dto) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);
        UUID accountId = dto.id() != null ? dto.id() : UUID.randomUUID();

        LedgerAccount domain = new LedgerAccount(
                accountId,
                tenantId,
                dto.groupId(),
                dto.name(),
                dto.code(),
                dto.type()
        );

        ledgerAccountRepository.save(domain);

        LedgerAccountDto responseDto = new LedgerAccountDto(
                domain.id(),
                domain.groupId(),
                domain.code(),
                domain.name(),
                domain.type()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<LedgerAccountDto>> getAllAccounts() {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }

        List<LedgerAccountDto> response = ledgerAccountRepository.findAll().stream()
                .map(la -> new LedgerAccountDto(la.id(), la.groupId(), la.code(), la.name(), la.type()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
