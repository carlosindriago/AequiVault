package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.*;
import com.aequivault.domain.repository.JournalEntryRepository;
import com.aequivault.infrastructure.security.TenantContext;
import com.aequivault.infrastructure.web.dto.JournalEntryRequest;
import com.aequivault.infrastructure.web.dto.JournalEntryResponse;
import com.aequivault.infrastructure.web.dto.JournalLineResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Currency;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/journal/entries")
public class JournalEntryController {

    private final JournalEntryRepository journalEntryRepository;
    private final DoubleEntryValidationService validationService = new DoubleEntryValidationService();

    public JournalEntryController(JournalEntryRepository journalEntryRepository) {
        this.journalEntryRepository = journalEntryRepository;
    }

    @PostMapping
    public ResponseEntity<JournalEntryResponse> createEntry(@Valid @RequestBody JournalEntryRequest request) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Please provide X-Tenant-ID header.");
        }
        UUID tenantId = UUID.fromString(tenantStr);
        UUID entryId = request.id() != null ? request.id() : UUID.randomUUID();

        // 1. Crear el objeto de dominio inicial
        JournalEntry entry = new JournalEntry(
                entryId,
                tenantId,
                request.date(),
                request.description() != null ? request.description() : "Sin descripción"
        );

        // 2. Establecer el número de asiento si está presente
        if (request.entryNumber() != null && !request.entryNumber().isBlank()) {
            entry.setEntryNumber(request.entryNumber());
        }

        // 3. Resolver la divisa del asiento
        String resolvedCurrency = request.currency() != null && !request.currency().isBlank() 
                ? request.currency().toUpperCase() 
                : "USD";

        // 4. Mapear y añadir cada línea al agregado
        if (request.lines() != null) {
            for (var lineReq : request.lines()) {
                UUID lineId = lineReq.id() != null ? lineReq.id() : UUID.randomUUID();
                Money amount = Money.of(lineReq.amount(), Currency.getInstance(resolvedCurrency));
                LineType type = LineType.valueOf(lineReq.type().toUpperCase());
                
                entry.addLine(new JournalLine(lineId, lineReq.ledgerAccountId(), amount, type));
            }
        }

        // 5. Procesar estado
        if (request.status().equalsIgnoreCase("POSTED")) {
            if (request.entryNumber() == null || request.entryNumber().isBlank()) {
                throw new IllegalArgumentException("Entry number is required for posted journal entries");
            }
            entry.post(validationService);
        } else {
            entry.setStatus(EntryStatus.DRAFT);
        }

        // 6. Persistir mediante el puerto/adaptador
        journalEntryRepository.save(entry);

        // 7. Retornar la respuesta mapeada
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(entry, resolvedCurrency));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntryResponse> getEntryById(@PathVariable UUID id) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Please provide X-Tenant-ID header.");
        }

        return journalEntryRepository.findById(id)
                .map(entry -> {
                    String currency = entry.getLines().isEmpty() ? "USD" : entry.getLines().get(0).amount().currency().getCurrencyCode();
                    return ResponseEntity.ok(mapToResponse(entry, currency));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private JournalEntryResponse mapToResponse(JournalEntry entry, String currency) {
        List<JournalLineResponse> lines = entry.getLines().stream()
                .map(line -> new JournalLineResponse(
                        line.id(),
                        line.ledgerAccountId(),
                        line.amount().toPersistedAmount(),
                        line.type().name()
                ))
                .collect(Collectors.toList());

        return new JournalEntryResponse(
                entry.getId(),
                entry.getTenantId(),
                entry.getDate(),
                entry.getDescription(),
                entry.getStatus().name(),
                entry.getEntryNumber(),
                currency,
                lines
        );
    }
}
