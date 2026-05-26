-- liquibase formatted sql

-- changeset carlos:002-chart-of-accounts
CREATE TABLE account_groups (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    path LTREE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_account_group_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_account_groups_path ON account_groups USING gist(path);
CREATE INDEX idx_account_groups_tenant ON account_groups(tenant_id);

CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    group_id UUID NOT NULL REFERENCES account_groups(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ledger_account_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX idx_ledger_accounts_tenant ON ledger_accounts(tenant_id);
CREATE INDEX idx_ledger_accounts_group ON ledger_accounts(group_id);
-- rollback DROP TABLE ledger_accounts;
-- rollback DROP INDEX idx_account_groups_path;
-- rollback DROP TABLE account_groups;
