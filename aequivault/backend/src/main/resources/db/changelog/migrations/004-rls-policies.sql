-- liquibase formatted sql

-- changeset carlos:004-rls-policies
-- Activar y forzar RLS en account_groups
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_groups FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON account_groups
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Activar y forzar RLS en ledger_accounts
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ledger_accounts
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Activar y forzar RLS en journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON journal_entries
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Activar y forzar RLS en journal_lines
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON journal_lines
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Activar y forzar RLS en draft_journal_entries
ALTER TABLE draft_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_journal_entries FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON draft_journal_entries
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

-- Activar y forzar RLS en draft_journal_lines
ALTER TABLE draft_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_journal_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON draft_journal_lines
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
-- rollback ALTER TABLE draft_journal_lines NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON draft_journal_lines;
-- rollback ALTER TABLE draft_journal_lines DISABLE ROW LEVEL SECURITY;
-- rollback ALTER TABLE draft_journal_entries NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON draft_journal_entries;
-- rollback ALTER TABLE draft_journal_entries DISABLE ROW LEVEL SECURITY;
-- rollback ALTER TABLE journal_lines NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON journal_lines;
-- rollback ALTER TABLE journal_lines DISABLE ROW LEVEL SECURITY;
-- rollback ALTER TABLE journal_entries NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON journal_entries;
-- rollback ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
-- rollback ALTER TABLE ledger_accounts NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON ledger_accounts;
-- rollback ALTER TABLE ledger_accounts DISABLE ROW LEVEL SECURITY;
-- rollback ALTER TABLE account_groups NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON account_groups;
-- rollback ALTER TABLE account_groups DISABLE ROW LEVEL SECURITY;
