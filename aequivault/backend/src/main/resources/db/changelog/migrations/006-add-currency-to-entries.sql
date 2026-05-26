-- liquibase formatted sql

-- changeset carlos:006-add-currency-to-entries
ALTER TABLE journal_entries ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE draft_journal_entries ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD';
-- rollback ALTER TABLE draft_journal_entries DROP COLUMN currency;
-- rollback ALTER TABLE journal_entries DROP COLUMN currency;
