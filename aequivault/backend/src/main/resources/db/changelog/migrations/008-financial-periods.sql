-- liquibase formatted sql

-- changeset carlos:008-financial-periods
CREATE TABLE financial_periods (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    year INT NOT NULL,
    month INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- OPEN, CLOSED
    closed_at TIMESTAMP,
    closed_by VARCHAR(255),
    CONSTRAINT uq_financial_period_tenant_year_month UNIQUE (tenant_id, year, month)
);

CREATE INDEX idx_financial_periods_tenant ON financial_periods(tenant_id);

ALTER TABLE financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_periods FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON financial_periods
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
-- rollback ALTER TABLE financial_periods NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON financial_periods;
-- rollback ALTER TABLE financial_periods DISABLE ROW LEVEL SECURITY;
-- rollback DROP TABLE financial_periods;
