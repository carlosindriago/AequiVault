-- liquibase formatted sql

-- changeset carlos:012-ephemeral-demo
ALTER TABLE tenants ADD COLUMN expires_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_tenants_expires_at ON tenants(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE account_groups DROP CONSTRAINT IF EXISTS account_groups_tenant_id_fkey;
ALTER TABLE account_groups
    ADD CONSTRAINT account_groups_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE ledger_accounts DROP CONSTRAINT IF EXISTS ledger_accounts_tenant_id_fkey;
ALTER TABLE ledger_accounts
    ADD CONSTRAINT ledger_accounts_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE ledger_accounts DROP CONSTRAINT IF EXISTS ledger_accounts_group_id_fkey;
ALTER TABLE ledger_accounts
    ADD CONSTRAINT ledger_accounts_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES account_groups(id) ON DELETE CASCADE;

ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_tenant_id_fkey;
ALTER TABLE journal_entries
    ADD CONSTRAINT journal_entries_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE journal_lines DROP CONSTRAINT IF EXISTS journal_lines_tenant_id_fkey;
ALTER TABLE journal_lines
    ADD CONSTRAINT journal_lines_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE journal_lines DROP CONSTRAINT IF EXISTS journal_lines_ledger_account_id_fkey;
ALTER TABLE journal_lines
    ADD CONSTRAINT journal_lines_ledger_account_id_fkey
    FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts(id) ON DELETE CASCADE;

ALTER TABLE draft_journal_entries DROP CONSTRAINT IF EXISTS draft_journal_entries_tenant_id_fkey;
ALTER TABLE draft_journal_entries
    ADD CONSTRAINT draft_journal_entries_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE draft_journal_lines DROP CONSTRAINT IF EXISTS draft_journal_lines_tenant_id_fkey;
ALTER TABLE draft_journal_lines
    ADD CONSTRAINT draft_journal_lines_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE draft_journal_lines DROP CONSTRAINT IF EXISTS draft_journal_lines_ledger_account_id_fkey;
ALTER TABLE draft_journal_lines
    ADD CONSTRAINT draft_journal_lines_ledger_account_id_fkey
    FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts(id) ON DELETE CASCADE;

ALTER TABLE financial_periods DROP CONSTRAINT IF EXISTS financial_periods_tenant_id_fkey;
ALTER TABLE financial_periods
    ADD CONSTRAINT financial_periods_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_tenant_id_fkey;
ALTER TABLE notifications
    ADD CONSTRAINT notifications_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- rollback ALTER TABLE notifications DROP CONSTRAINT notifications_tenant_id_fkey;
-- rollback ALTER TABLE notifications ADD CONSTRAINT notifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE financial_periods DROP CONSTRAINT financial_periods_tenant_id_fkey;
-- rollback ALTER TABLE financial_periods ADD CONSTRAINT financial_periods_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE draft_journal_lines DROP CONSTRAINT draft_journal_lines_ledger_account_id_fkey;
-- rollback ALTER TABLE draft_journal_lines ADD CONSTRAINT draft_journal_lines_ledger_account_id_fkey FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts(id);
-- rollback ALTER TABLE draft_journal_lines DROP CONSTRAINT draft_journal_lines_tenant_id_fkey;
-- rollback ALTER TABLE draft_journal_lines ADD CONSTRAINT draft_journal_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE draft_journal_entries DROP CONSTRAINT draft_journal_entries_tenant_id_fkey;
-- rollback ALTER TABLE draft_journal_entries ADD CONSTRAINT draft_journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE journal_lines DROP CONSTRAINT journal_lines_ledger_account_id_fkey;
-- rollback ALTER TABLE journal_lines ADD CONSTRAINT journal_lines_ledger_account_id_fkey FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts(id);
-- rollback ALTER TABLE journal_lines DROP CONSTRAINT journal_lines_tenant_id_fkey;
-- rollback ALTER TABLE journal_lines ADD CONSTRAINT journal_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE journal_entries DROP CONSTRAINT journal_entries_tenant_id_fkey;
-- rollback ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE ledger_accounts DROP CONSTRAINT ledger_accounts_group_id_fkey;
-- rollback ALTER TABLE ledger_accounts ADD CONSTRAINT ledger_accounts_group_id_fkey FOREIGN KEY (group_id) REFERENCES account_groups(id);
-- rollback ALTER TABLE ledger_accounts DROP CONSTRAINT ledger_accounts_tenant_id_fkey;
-- rollback ALTER TABLE ledger_accounts ADD CONSTRAINT ledger_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback ALTER TABLE account_groups DROP CONSTRAINT account_groups_tenant_id_fkey;
-- rollback ALTER TABLE account_groups ADD CONSTRAINT account_groups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- rollback DROP INDEX IF EXISTS idx_tenants_expires_at;
-- rollback ALTER TABLE tenants DROP COLUMN expires_at;
