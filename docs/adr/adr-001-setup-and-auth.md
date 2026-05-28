# ADR 001: Identity System (AuthN) and Setup Bootstrapping Pattern

## Status
Accepted

## Context
AequiVault is a B2B multi-tenant accounting engine. It requires:
1. A secure onboarding mechanism to initialize the system (creating the first tenant and its corresponding admin user) when the database is completely empty.
2. A cryptographic identity system to verify users and safely bind them to their corresponding `tenant_id` at the session level to trigger PostgreSQL Row-Level Security (RLS).

## Decision
We decided to implement the **First-Time Setup Bootstrapping** pattern and a stateless **JWT Authentication** flow with the following architecture:

### 1. Setup Status Enforcement
- Expose a public endpoint `GET /api/v1/setup/status` checking if any tenants or users exist.
- Expose `POST /api/v1/setup/init` to initialize the database with the first company and hashing the admin user's password with BCrypt.
- Block successive initializations by throwing a business-level `IllegalStateException` mapped to an HTTP 422 (RFC 7807) to prevent duplicate setup attacks.

### 2. Multi-Tenant JWT Security Filter
- Upon login, generate a cryptographically signed JWT using JJWT 0.12.6, storing the `tenant_id` and user roles as claims.
- Create a `JwtAuthenticationFilter` that intercepts requests, extracts the JWT, verifies its signature, injects the user authentication into Spring Security's context, and dynamically sets the thread-bound `TenantContext.setTenantId(tenantId)`.
- Use a `try-finally` block at the transaction/dialect boundary to ensure `TenantContext.clear()` is called, preventing connection-pool thread contamination.

### 3. Identity Tables RLS Tradeoff
- **Decision**: Row-Level Security (RLS) is **disabled** for the `users`, `roles`, `permissions`, and their associative tables.
- **Rationale**: The login endpoint `/api/v1/auth/login` must lookup the user by their email globally *before* establishing the tenant context. Enabling RLS on these tables would prevent user lookup because no session variable `app.current_tenant` is set yet. Multi-tenant security for financial books is still 100% physically isolated since all transaction tables (`journal_entries`, `journal_lines`, `ledger_accounts`, `account_groups`) enforce RLS strictly.

## Consequences
- **Positive**: Seamless SaaS-style first-time setup wizard. No static default credentials in SQL migrations (enhanced security).
- **Positive**: Low latency validation on API endpoints using stateless token decoding.
- **Negative**: Manual query isolation verification is required for the users/roles administration panel in the future, as database-level RLS does not protect these identity tables.
