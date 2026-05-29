-- liquibase formatted sql

-- changeset carlos:009-notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(100),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notifications
FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
-- rollback ALTER TABLE notifications NO FORCE ROW LEVEL SECURITY;
-- rollback DROP POLICY tenant_isolation ON notifications;
-- rollback ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- rollback DROP TABLE notifications;
