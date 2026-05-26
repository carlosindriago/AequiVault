-- liquibase formatted sql

-- changeset carlos:003-journal-immutable-and-drafts
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entry_number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_journal_entry_tenant_number UNIQUE (tenant_id, entry_number)
);

CREATE INDEX idx_journal_entries_tenant ON journal_entries(tenant_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    amount DECIMAL(25, 4) NOT NULL,
    type VARCHAR(10) NOT NULL, -- DEBIT, CREDIT
    reconciliation_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_lines_tenant ON journal_lines(tenant_id);
CREATE INDEX idx_journal_lines_entry ON journal_lines(entry_id);
CREATE INDEX idx_journal_lines_ledger ON journal_lines(ledger_account_id);

CREATE TABLE draft_journal_entries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entry_number VARCHAR(50),
    date DATE NOT NULL,
    description VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_draft_entries_tenant ON draft_journal_entries(tenant_id);

CREATE TABLE draft_journal_lines (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    draft_entry_id UUID NOT NULL REFERENCES draft_journal_entries(id) ON DELETE CASCADE,
    ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    amount DECIMAL(25, 4) NOT NULL,
    type VARCHAR(10) NOT NULL, -- DEBIT, CREDIT
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_draft_lines_tenant ON draft_journal_lines(tenant_id);
CREATE INDEX idx_draft_lines_entry ON draft_journal_lines(draft_entry_id);
CREATE INDEX idx_draft_lines_ledger ON draft_journal_lines(ledger_account_id);
-- rollback DROP TABLE draft_journal_lines;
-- rollback DROP TABLE draft_journal_entries;
-- rollback DROP TABLE journal_lines;
-- rollback DROP TABLE journal_entries;
