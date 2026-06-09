package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.*;
import com.aequivault.domain.repository.JournalEntryRepository;
import com.aequivault.infrastructure.security.TenantContext;
import com.aequivault.infrastructure.web.dto.JournalEntryRequest;
import com.aequivault.infrastructure.web.dto.JournalEntryResponse;
import com.aequivault.infrastructure.web.dto.JournalLineResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Currency;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/journal/drafts")
public class DraftJournalEntryController {

    private final JournalEntryRepository journalEntryRepository;
    private final DoubleEntryValidationService validationService = new DoubleEntryValidationService();

    public DraftJournalEntryController(JournalEntryRepository journalEntryRepository) {
        this.journalEntryRepository = journalEntryRepository;
    }

    /**
     * Updates a DRAFT journal entry. Only drafts can be edited; attempting to
     * edit a POSTED entry returns 409 Conflict.
     */
    @PutMapping("/{id}")
    public ResponseEntity<JournalEntryResponse> updateDraft(
            @PathVariable UUID id,
            @Valid @RequestBody JournalEntryRequest request) {

        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing.");
        }

        JournalEntry existing = journalEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + id));

        if (existing.getStatus() != EntryStatus.DRAFT) {
            return ResponseEntity.status(409).build(); // Conflict — cannot edit a POSTED entry
        }

        // Rebuild the entry with new values but same ID and tenant
        UUID tenantId = UUID.fromString(tenantStr);
        JournalEntry updated = new JournalEntry(
                id, tenantId,
                request.date(),
                request.description() != null ? request.description() : "Sin descripción"
        );
        updated.setStatus(EntryStatus.DRAFT);

        String resolvedCurrency = request.currency() != null && !request.currency().isBlank()
                ? request.currency().toUpperCase() : "USD";

        if (request.lines() != null) {
            for (var lineReq : request.lines()) {
                UUID lineId = lineReq.id() != null ? lineReq.id() : UUID.randomUUID();
                Money amount = Money.of(lineReq.amount(), Currency.getInstance(resolvedCurrency));
                LineType type = LineType.valueOf(lineReq.type().toUpperCase());
                updated.addLine(new JournalLine(lineId, lineReq.ledgerAccountId(), amount, type));
            }
        }

        journalEntryRepository.save(updated);

        List<JournalLineResponse> lines = updated.getLines().stream()
                .map(line -> new JournalLineResponse(
                        line.id(), line.ledgerAccountId(),
                        line.amount().toPersistedAmount(), line.type().name()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JournalEntryResponse(
                updated.getId(), updated.getTenantId(), updated.getDate(),
                updated.getDescription(), updated.getStatus().name(),
                updated.getEntryNumber(), resolvedCurrency, lines));
    }

    /**
     * Publishes a DRAFT entry, running full double-entry validation.
     * On success the draft is removed and an immutable POSTED entry is created.
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<JournalEntryResponse> publishDraft(@PathVariable UUID id) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing.");
        }

        JournalEntry existing = journalEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + id));

        if (existing.getStatus() != EntryStatus.DRAFT) {
            return ResponseEntity.status(409).build();
        }

        if (existing.getEntryNumber() == null || existing.getEntryNumber().isBlank()) {
            throw new IllegalArgumentException("Entry number is required before publishing.");
        }

        existing.post(validationService);
        journalEntryRepository.save(existing);

        String currency = existing.getLines().isEmpty() ? "USD"
                : existing.getLines().get(0).amount().currency().getCurrencyCode();

        List<JournalLineResponse> lines = existing.getLines().stream()
                .map(line -> new JournalLineResponse(
                        line.id(), line.ledgerAccountId(),
                        line.amount().toPersistedAmount(), line.type().name()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JournalEntryResponse(
                existing.getId(), existing.getTenantId(), existing.getDate(),
                existing.getDescription(), existing.getStatus().name(),
                existing.getEntryNumber(), currency, lines));
    }
}
