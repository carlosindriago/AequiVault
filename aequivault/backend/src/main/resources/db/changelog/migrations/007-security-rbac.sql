-- liquibase formatted sql

-- changeset carlos:007-security-rbac
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Insertar roles base
INSERT INTO roles (id, name, description) VALUES 
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'SUPER_ADMIN', 'Acceso total al sistema e inquilino'),
('a3fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'AUDITOR', 'Acceso de solo lectura para auditorías contables');

-- Insertar permisos base
INSERT INTO permissions (id, name, description) VALUES
('b0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'read:dashboard', 'Permiso para visualizar el dashboard analítico'),
('b1ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'read:ledger', 'Permiso para visualizar el libro mayor contable'),
('b2ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'write:journal', 'Permiso para crear y modificar asientos contables'),
('b3ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'admin:setup', 'Permiso para administrar configuraciones generales');

-- Asociar permisos al rol SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id) VALUES
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'b0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'b1ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'b2ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'b3ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b');

-- Asociar permisos al rol AUDITOR
INSERT INTO role_permissions (role_id, permission_id) VALUES
('a3fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'b0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('a3fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'b1ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b');

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE roles TO aequivault_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE permissions TO aequivault_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE role_permissions TO aequivault_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO aequivault_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_roles TO aequivault_app;
