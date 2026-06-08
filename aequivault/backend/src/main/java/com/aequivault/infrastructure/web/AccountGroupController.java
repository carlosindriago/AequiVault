package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.AccountGroup;
import com.aequivault.domain.repository.AccountGroupRepository;
import com.aequivault.infrastructure.security.TenantContext;
import com.aequivault.infrastructure.web.dto.AccountGroupRequest;
import com.aequivault.infrastructure.web.dto.AccountGroupResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ledger/groups")
public class AccountGroupController {

    private final AccountGroupRepository accountGroupRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public AccountGroupController(AccountGroupRepository accountGroupRepository, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.accountGroupRepository = accountGroupRepository;
        this.eventPublisher = eventPublisher;
    }

    @PostMapping
    public ResponseEntity<AccountGroupResponse> createGroup(@Valid @RequestBody AccountGroupRequest request) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        String path;
        if (request.parentId() == null) {
            // Root group
            path = request.code();
        } else {
            // Child group
            AccountGroup parent = accountGroupRepository.findById(request.parentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent group not found with ID: " + request.parentId()));
            path = parent.path() + "." + request.code();
        }

        AccountGroup domain = new AccountGroup(
                UUID.randomUUID(),
                tenantId,
                request.name(),
                request.code(),
                path
        );

        accountGroupRepository.save(domain);

        eventPublisher.publishEvent(new com.aequivault.domain.event.AccountGroupCreatedEvent(
                domain.tenantId(),
                domain.id(),
                domain.name(),
                domain.code()
        ));

        AccountGroupResponse response = new AccountGroupResponse(
                domain.id(),
                domain.code(),
                domain.name(),
                domain.path()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountGroupResponse>> getAllGroups() {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        List<AccountGroupResponse> response = accountGroupRepository.findAll(tenantId).stream()
                .map(ag -> new AccountGroupResponse(ag.id(), ag.code(), ag.name(), ag.path()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable("id") UUID id) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        AccountGroup group = accountGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account group not found with ID: " + id));

        if (accountGroupRepository.hasChildren(tenantId, group.path())) {
            throw new IllegalStateException("Cannot delete account group because it has sub-groups.");
        }

        if (accountGroupRepository.hasLedgerAccounts(tenantId, id)) {
            throw new IllegalStateException("Cannot delete account group because it has ledger accounts assigned.");
        }

        accountGroupRepository.delete(id);
        return ResponseEntity.noContent().build();
    }
}
