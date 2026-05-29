# AequiVault — Development Rules and Standards

This document establishes the mandatory technical, architectural, and methodological rules for developing **AequiVault**. Any developer or AI agent working on this repository must strictly comply with these guidelines.

---

## 1. Project Philosophy and Business Rules (Invariants)

AequiVault is an enterprise-grade transactional accounting engine. No shortcuts that compromise data integrity are accepted.

*   **Strict Double-Entry**: Every journal entry (`JournalEntry`) must satisfy:
    $$\sum Debit = \sum Credit$$
    If the equation does not balance to the penny, the transaction is rejected immediately at the domain layer.
*   **Ledger Immutability**: The `journal_entries` and `journal_lines` tables are strictly **Insert-Only**.
    *   It is **prohibited** to perform `UPDATE` or `DELETE` operations on posted records.
    *   Any correction of errors must be performed via an **adjustment/reversing journal entry** (Contra-entry).
*   **Draft Staging**: Draft journal entries never touch the general ledger tables. They live in temporary staging tables (`draft_journal_entries` and `draft_journal_lines`) and are moved atomically to the posted tables only upon posting.
*   **Financial Precision (`Money`)**:
    *   It is strictly **prohibited** to use `double` or `float` for monetary amounts.
    *   The `Money` Value Object (encapsulating `BigDecimal` and `Currency`) must be used.
    *   Internal arithmetic uses a scale of **6 or 8 decimal places** to mitigate accumulated rounding errors.
    *   Before persisting, amounts are rounded to **4 decimal places** in the database (`DECIMAL(25,4)`) using **Banker's Rounding** (`RoundingMode.HALF_EVEN`).

---

## 2. Backend Architecture (Java 21 + Spring Boot 3.3.x)

We implement a **Logical CQRS** approach to balance domain purity with database performance:

### Command Path (Writes) - Pure Hexagonal Architecture
*   Domain classes (`JournalEntry`, `LedgerAccount`, `Money`) are **pure Java** and contain no JPA (`@Entity`, `@Table`) or Spring annotations.
*   Validations are executed in domain entities and domain services before mapping.
*   **MapStruct** is used only in the infrastructure layer to convert domain objects to JPA entities (`*Entity`) before persisting.
*   Business invariants are tested with JUnit 5 using strict TDD without booting database or Spring contexts.

### Query Path (Reads) - Direct Projections
*   For generating reports (Trial Balance, Balance Sheet, P&L, etc.), **the domain model is bypassed**.
*   The database is queried using **Spring Data JPA projections** mapped directly to flat read DTOs or fast SQL aggregations.
*   This avoids instantiating heavy domain objects in memory and reduces JVM CPU/Garbage Collector pressure in Java 21.

---

## 3. Database (PostgreSQL 16+)

We leverage the relational engine's native capabilities to simplify application logic and guarantee physical data safety.

*   **Hierarchies with LTREE**:
    *   The Chart of Accounts (`account_groups`) does not use simple self-referencing relationships with `parent_id` (Adjacency List).
    *   PostgreSQL's native **LTREE** extension is used for the `path` column.
    *   Hierarchical queries and consolidated summations are performed using the path descendant operator (`path <@ 'root_code'`) backed by **GiST** indexes.
*   **Multi-Tenant Isolation (Row-Level Security - RLS)**:
    *   Tenant isolation (`tenant_id`) is physically enforced in the database via **RLS**.
    *   Database migrations enable RLS and define the policy using the session variable `current_setting('app.current_tenant')`.
    *   At the start of each transaction, the Spring Boot backend must execute `SET LOCAL app.current_tenant = :tenantId`.
    *   **Thread Cleanup**: The tenant ID `ThreadLocal` must be cleared in a guaranteed `finally` block to prevent data leaks between connection pool threads (HikariCP).

---

## 4. Frontend Architecture (Angular 18)

*   **State Management**: Exclusive use of **Angular Signals** for reactivity and state synchronization. Avoid heavy use of RxJS except for complex asynchronous data flows or HTTP requests.
*   **Components**: **Smart/Dumb** (Container/Presentational) pattern.
    *   *Smart Components*: Manage service calls, business logic, and data passing.
    *   *Dumb Components*: Receive data via `@Input` (or signal-based inputs) and emit events via `@Output`. 100% focused on UI.
*   **Styling**: Native CSS and Tailwind CSS. No inline styles or generic placeholders. Every UI must feel premium, fluid, responsive, and modern.
*   **Testing**: Ensure all key interactive elements have unique and descriptive IDs to facilitate automated E2E/UI testing.

---

## 5. Development Practices and Workflow

*   **Strict TDD**: Write unit tests for domain rules *before* implementing the logic. Tests must serve as a living specification of the code.
*   **Git and Commit Conventions**:
    *   Follow the **Conventional Commits** specification (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
    *   **Prohibited**: Adding Artificial Intelligence attribution (e.g. "Co-Authored-By", "Generated by AI") in commit messages.
*   **No builds after changes**: Avoid running production build commands (`mvn package`, `npm run build`) during ordinary iterative development, unless strictly necessary to validate CI/CD pipelines.
