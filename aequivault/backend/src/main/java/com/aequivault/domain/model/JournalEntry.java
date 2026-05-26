package com.aequivault.domain.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class JournalEntry {

    private final UUID id;
    private final UUID tenantId;
    private final LocalDate date;
    private final String description;
    private final List<JournalLine> lines;
    private EntryStatus status;
    private String entryNumber;

    public JournalEntry(UUID id, UUID tenantId, LocalDate date, String description) {
        if (id == null) {
            throw new IllegalArgumentException("Journal Entry ID cannot be null");
        }
        if (tenantId == null) {
            throw new IllegalArgumentException("Tenant ID cannot be null");
        }
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Description cannot be null or empty");
        }
        this.id = id;
        this.tenantId = tenantId;
        this.date = date;
        this.description = description;
        this.lines = new ArrayList<>();
        this.status = EntryStatus.DRAFT;
        this.entryNumber = null;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public List<JournalLine> getLines() {
        return Collections.unmodifiableList(lines);
    }

    public EntryStatus getStatus() {
        return status;
    }

    public void setStatus(EntryStatus status) {
        this.status = status;
    }

    public void addLine(JournalLine line) {
        if (status == EntryStatus.POSTED) {
            throw new IllegalStateException("Cannot modify an already posted journal entry");
        }
        if (line == null) {
            throw new IllegalArgumentException("Journal line cannot be null");
        }
        this.lines.add(line);
    }

    public void post(DoubleEntryValidationService validator) {
        if (status == EntryStatus.POSTED) {
            throw new IllegalStateException("The journal entry has already been posted");
        }
        if (validator == null) {
            throw new IllegalArgumentException("Validation service cannot be null");
        }
        
        // Ejecutar las reglas de balance y consistencia
        validator.validateBalance(this.lines);
        
        // Bloquear y asentar el asiento
        this.status = EntryStatus.POSTED;
    }

    public String getEntryNumber() {
        return entryNumber;
    }

    public void setEntryNumber(String entryNumber) {
        this.entryNumber = entryNumber;
    }
}
