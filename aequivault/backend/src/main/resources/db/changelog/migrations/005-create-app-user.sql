-- liquibase formatted sql

-- changeset carlos:005-create-app-user splitStatements:false
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'aequivault_app') THEN
        CREATE USER aequivault_app WITH PASSWORD 'aequivault_app_pass';
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO aequivault_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO aequivault_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO aequivault_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO aequivault_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO aequivault_app;
-- rollback REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM aequivault_app;
-- rollback REVOKE ALL PRIVILEGES ON SCHEMA public FROM aequivault_app;
-- rollback DROP USER IF EXISTS aequivault_app;
