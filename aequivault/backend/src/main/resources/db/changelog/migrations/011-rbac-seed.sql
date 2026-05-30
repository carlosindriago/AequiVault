-- liquibase formatted sql

-- changeset carlos:011-rbac-seed
-- Clean up old role permissions to avoid conflicts
DELETE FROM role_permissions;

-- Clean up old permissions
DELETE FROM permissions;

-- Insert new permissions base
INSERT INTO permissions (id, name, description) VALUES
('a0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'JOURNAL_READ', 'Permiso para leer asientos contables y libro mayor'),
('a1ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'JOURNAL_WRITE', 'Permiso para crear y modificar asientos contables'),
('a2ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'REPORTS_VIEW', 'Permiso para visualizar reportes financieros y balances'),
('a3ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'SETTINGS_MANAGE', 'Permiso para administrar configuraciones del sistema'),
('a4ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'USERS_MANAGE', 'Permiso para gestionar usuarios y roles (RBAC)');

-- Insert or update roles base
INSERT INTO roles (id, name, description) VALUES
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'SUPER_ADMIN', 'Acceso total al sistema e inquilino'),
('e0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'ACCOUNTANT', 'Gestión de diarios y visualización de reportes'),
('a3fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'AUDITOR', 'Solo lectura de diarios y reportes')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Associate permissions to SUPER_ADMIN (All 5 permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a1ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a2ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a3ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('f0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a4ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b');

-- Associate permissions to ACCOUNTANT (Journal and Reports)
INSERT INTO role_permissions (role_id, permission_id) VALUES
('e0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('e0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a1ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('e0fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a2ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b');

-- Associate permissions to AUDITOR (Only read of Journal and Reports)
INSERT INTO role_permissions (role_id, permission_id) VALUES
('a3fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a0ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b'),
('a3fa2b32-cd2f-488f-8d2a-4a6c6e7a2b9b', 'a2ea2b32-cd2f-488f-8d2a-4a6c6e7a2b9b');
