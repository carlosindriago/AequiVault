# Architecture Decision Records (ADRs)

This directory contains the Architecture Decision Records for AequiVault. Each ADR documents a significant architectural decision: the context that motivated it, the decision made, and its consequences.

ADRs are immutable once accepted. If a decision is superseded, a new ADR is created referencing the old one.

---

## Index

| # | Title | Status |
|---|-------|--------|
| [ADR-001](adr-001-setup-and-auth.md) | Identity System (AuthN) and Setup Bootstrapping Pattern | ✅ Accepted |
| [ADR-002](adr-002-financial-reports-and-dx.md) | Hierarchical Financial Reports Engine, Swagger UI and Developer Experience (DX) | ✅ Accepted |

---

## ADR Summaries

### [ADR-001: Identity System & Setup Bootstrapping](adr-001-setup-and-auth.md)

**Problem**: AequiVault needs a secure way to initialize a blank database (first tenant + admin user) and a stateless authentication mechanism that binds each request to its correct tenant for PostgreSQL RLS enforcement.

**Decision**: Implement a First-Time Setup Bootstrapping pattern with public endpoints `GET /api/v1/setup/status` and `POST /api/v1/setup/init`. Use stateless JWT (JJWT 0.12.6) storing `tenant_id` as a claim, extracted and injected into a thread-bound `TenantContext` by a `JwtAuthenticationFilter`. RLS is intentionally disabled on identity tables (`users`, `roles`) to allow global user lookup at login time.

**Key trade-off**: Identity tables are not RLS-protected — manual query isolation is required for the future user administration panel.

---

### [ADR-002: Hierarchical Reports Engine & Developer Experience](adr-002-financial-reports-and-dx.md)

**Problem**: Financial reports (Balance Sheet, P&L) need to roll up hierarchical account balances without N+1 queries or JVM memory pressure. Developer onboarding also lacked quick database bootstrapping and interactive API documentation.

**Decision**: Use PostgreSQL CTEs with LTREE path operators (`<@`) for database-level hierarchical rollups. Expose reports as flat JSON lists with a `depth` indicator, delegating tree rendering to the Angular client in O(N). Add `springdoc-openapi` for Swagger UI. Move `docker-compose.yml` to the repository root for zero-friction setup.

**Key trade-off**: Reports bypass the domain model entirely (direct SQL projections) — accepted because read paths have no business invariants to enforce.

---

## How to Add a New ADR

1. Create a new file: `docs/adr/adr-NNN-short-title.md`
2. Use the following template:

```markdown
# ADR NNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-NNN

## Context
Describe the situation and forces at play.

## Decision
Describe the decision made.

## Consequences
- **Positive**: ...
- **Negative**: ...
```

3. Add the entry to the index table above.
4. Commit with message: `docs: add ADR-NNN short-title`

---

← [Back to documentation index](../README.md)
