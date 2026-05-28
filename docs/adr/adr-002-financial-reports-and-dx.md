# ADR 002: Hierarchical Financial Reports Engine, Swagger UI and Developer Experience (DX)

## Status
Accepted

## Context
AequiVault needed core financial report outputs: the Balance Sheet (Activos, Pasivos, Patrimonio) and the Profit & Loss (P&L) Statement (Ingresos, Gastos). Since the account groups are structured hierarchically using a PostgreSQL `LTREE` schema, we needed an optimal way to roll up parent nodes' balances without overwhelming Java's JVM memory or causing $N+1$ query issues. Additionally, developer onboarding (DX) lacked quick database bootstrapping, and public API interfaces lacked interactive documentation.

## Decision
We made the following architectural and documentation design decisions:

### 1. Database-Level Hierarchical Rollup
- Implement native SQL queries using Common Table Expressions (CTEs) and PostgreSQL's LTREE path operators (`<@`).
- Roll up financial balances recursively by summing descendant account balances up the parent path.
- Respect account nature signs directly at the database rollup level:
  - Assets/Expenses (Debtor): `Debits - Credits`
  - Liabilities/Equity/Revenues (Creditor): `Credits - Debits`
- Project the rolled-up aggregates as a flat list with a `depth` indicator column (`nlevel(path)`) and node-type boolean (`isGroup`).
- Order the tree hierarchy directly in SQL by casting the extended sort-path back to LTREE: `ORDER BY cast(sort_path AS ltree)`.

### 2. Flat List Projections with Depth Indicator
- Avoid complex nested tree mapping algorithms on the JVM (reducing Garbage Collector pressure to $O(1)$ additional memory).
- Expose `/api/v1/reports/balance-sheet` and `/api/v1/reports/profit-and-loss` returning a flat JSON list.
- Delegate recursive hierarchy indentation and styling to the frontend Angular client using the `depth` parameter in $O(N)$ runtime.

### 3. Integrated API Documentation (OpenAPI / Swagger)
- Include the `springdoc-openapi-starter-webmvc-ui` dependency in `pom.xml`.
- Update `SecurityConfig.java` to expose `/swagger-ui/**`, `/v3/api-docs/**`, and `/swagger-ui.html` publicly, allowing interactive manual testing.

### 4. DX Improvement
- Move `docker-compose.yml` from `aequivault/docker-compose.yml` to the root folder of the repository.
- This allows developers to run `docker compose up -d` directly upon cloning the repository, reducing onboarding friction.

## Consequences
- **Positive**: High-performance reports loading in milliseconds.
- **Positive**: JVM memory overhead remains constant regardless of tree depth or journal sizes.
- **Positive**: Interactive API documentation is available instantly out-of-the-box.
- **Positive**: Zero-friction setup for new developers.
