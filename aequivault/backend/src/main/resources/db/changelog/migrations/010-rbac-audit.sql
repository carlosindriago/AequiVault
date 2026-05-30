-- liquibase formatted sql

-- changeset carlos:010-rbac-audit
CREATE TABLE user_status_audit (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    performed_by_email VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_status_audit_tenant ON user_status_audit(tenant_id);

ALTER TABLE user_status_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status_audit FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON user_status_audit
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_status_audit TO aequivault_app;
