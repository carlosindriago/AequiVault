-- liquibase formatted sql

-- changeset carlos:001-extensions-and-tenants
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- rollback DROP TABLE tenants;
-- rollback DROP EXTENSION ltree;
