# Walkthrough: REST API Layer, Validation, RLS, and Reactive Frontend (Milestones 1, 2, and 3)

This document summarizes the complete implementation and architectural validation of AequiVault, covering the multi-tenant transactional API (Milestone 1), the Reactive Graphical User Interface in Angular 18 (Milestone 2), and the Hierarchical Chart of Accounts with PostgreSQL LTREE (Milestone 3).

---

## Milestone 1: Backend API, Validation, ProblemDetail, and RLS

We developed and integrated the REST API layer for AequiVault in Spring Boot, protecting business rules and respecting PostgreSQL's physical multi-tenant isolation via Row-Level Security (RLS).

### Backend Changes
1. **Domain Modeling**:
   * [LedgerAccount.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/domain/model/LedgerAccount.java): Pure model without persistence or Spring annotations.
   * [LedgerAccountRepositoryImpl.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/repository/LedgerAccountRepositoryImpl.java): Infrastructure to domain mapper using MapStruct.
2. **Contracts (DTOs)**:
   * [JournalEntryRequest.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/dto/JournalEntryRequest.java): Input payload using a flat list with indication of the line type (`DEBIT` or `CREDIT`).
3. **REST Controllers**:
   * [LedgerAccountController.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/LedgerAccountController.java): Exposing the Chart of Accounts (COA) under RLS constraints.
   * [JournalEntryController.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/JournalEntryController.java): Posting drafts (`DRAFT`) or posted journal entries (`POSTED`).
4. **Global Error Handling (RFC 7807)**:
   * [GlobalExceptionHandler.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/exception/GlobalExceptionHandler.java): Mapping business validations to `422 Unprocessable Entity` and syntactic errors to `400 Bad Request`.

---

## Milestone 2: Graphical User Interface and Reactivity (Angular 18 + Signals)

We designed and implemented the frontend module in Angular 18, structuring UI logic using the Smart/Dumb (Container/Presentational) pattern and ensuring a premium design with native CSS.

### Frontend Changes
1. **Design and Premium Aesthetics**:
   * [styles.scss](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/styles.scss): Global styles applying CSS variables for **Glassmorphism**, Google Fonts' **Outfit** typography, custom scrollbars, and a financial-grade color scheme (Emerald Green for balanced states and Coral Red for alerts).
2. **Reactive Core with Signals (Avoiding RxJS in UI)**:
   * [journal-entry-state.service.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/core/services/journal-entry-state.service.ts): Local state service exposing header signals and the reactive array of lines. Reactivity propagates by reference in an immutable fashion (`[...current, newLine]`).
   * **Mathematical Calculations**: Using `computed()`, `debitSum()`, `creditSum()`, and `difference()` are dynamically derived (the latter rounded to 4 decimals to avoid JS floating-point issues), controlling that the submit button is enabled only when `canSubmit()` is valid based on state.
3. **Component Scaffolding (Dumb/Presentational)**:
   * [journal-line-table.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/components/journal-line-table/journal-line-table.component.ts): Renders the dynamic grid. Implements the native HTML select styled in CSS, which encapsulates account selection (COA), allowing migrations to more complex autocomplete components in the future without changing the architecture.
   * [journal-entry-summary.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/components/journal-entry-summary/journal-entry-summary.component.ts): Displays real-time accumulators and the adaptive balance banner.
   * [journal-entry-form.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/components/journal-entry-form/journal-entry-form.component.ts): Headers the general journal entry data and adaptively hosts the currency selector and entry number.
4. **Smart Container and HTTP Integration**:
   * [journal-entry-container.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/journal-entry-container/journal-entry-container.component.ts): Orchestrates accounts loading and entry submission.
   * **RLS Simulation**: Integrates an active tenant selector (`activeTenantId()`) which, when context changes, updates the COA from the backend by injecting the `X-Tenant-ID` header in every HTTP call. This physically demonstrates the backend's RLS isolation.
   * **RFC 7807 Mapping**: Interprets `ProblemDetail` error payloads, displaying alert banners detailing fields with syntactic issues or accounting domain objections.

---

## Verification and Automated Tests

The frontend test suite has been expanded, successfully verifying the user interface logic stability end-to-end.

### Frontend Unit Tests
* **`JournalEntryStateService`**: Validates automatic sums, accounting balance, immutability of additions/removals, and correct enabling of `canSubmit` based on whether the entry is in `DRAFT` or `POSTED` status.
* **`JournalLineTableComponent`**: Tests the correct rendering of the interactive grid and the corresponding emission of modification (`updateLine`), addition (`addLine`), and deletion (`removeLine`) events.
* **`JournalEntrySummaryComponent`**: Verifies correct formatting of monetary amounts in the UI and the visibility of status banners ("Balanced Entry" vs "Unbalanced Entry").
* **`JournalEntryFormComponent`**: Validates bidirectional asynchronous binding (`fakeAsync` / `tick`) of metadata inputs and conditional visibility of the `entryNumber` field.
* **`JournalEntryContainerComponent`**: Simulates HTTP service consumption using test doubles (`jasmine.createSpyObj`), validating tenant injection, form reset when switching tenants, and alert handling.

### Frontend Test Suite Results
Running `npm test -- --watch=false --browsers=ChromeHeadless` we achieved **27/27 successful test passes**:
```text
Chrome Headless 148.0.0.0 (Linux 0.0.0): Connected on socket baLs9b_rNaN69S6wAAAB with id 40925541
Chrome Headless 148.0.0.0 (Linux 0.0.0): Executed 27 of 27 SUCCESS (2.006 secs / 1.782 secs)
TOTAL: 27 SUCCESS
```

Both milestones are fully validated, with the backend's RLS accounting engine connected and interacting in a reactive, robust, and secure manner with the Angular 18 frontend.

---

## Milestone 3: Hierarchical Chart of Accounts (LTREE, Delete Guard, and Recursion)

In this phase, we built a dynamic and hierarchical Chart of Accounts (COA) that allows companies to structure their accounts in a tree. We chose Option A (Focus on Accountant and Business) to demonstrate mastery in complex relational data structures and recursive reactivity.

### 1. Data and Persistence Layer (PostgreSQL LTREE)
* **The Hierarchical Path**: We use PostgreSQL's native `LTREE` extension to store the hierarchy. The full path (e.g. `1.1.01`) is built by concatenating the parent path with the child code.
* **Alphanumeric Validation**: We added a validation in the `AccountGroup` domain constructor that restricts the account code exclusively to alphanumeric characters (`^[a-zA-Z0-9]+$`). This prevents special characters (like spaces or hyphens) from breaking the syntax of the PostgreSQL `LTREE` type.
* **RLS Isolation**: All hierarchical operations are physically isolated by tenant (`tenant_id`), ensuring that no business can query or modify groups belonging to another corporation.

### 2. Delete Guard (Safe Deletion Rule)
To prevent orphaned accounts or sub-groups, we implemented a strict deletion rule:
* A native Postgres query (`path <@ :parentPath`) is executed to check if the group has descendant sub-groups.
* The existence of ledger accounts assigned to the group in question is validated.
* If the group has dependents, the database and the business layer abort the transaction, throwing a domain error that is formatted by the controller as a `422 Unprocessable Entity` (RFC 7807).

### 3. Angular 18 Frontend (Reactive Recursive Tree)
* **In-Memory $O(N)$ Reconstruction**: Instead of processing and nesting the tree recursively in the backend (which would entail expensive queries or JVM overhead), the frontend consumes groups and accounts as a flat list and structures them in memory in a single pass of linear time complexity $O(N)$.
* **Control Flow Directives**: We leverage native Angular 18 control flow (`@if`, `@for`, and `@track`) to dynamically render sub-groups and subordinate accounts.
* **Recursive Dumb Component**: The `<app-coa-tree-node>` component calls itself recursively to render infinite depth levels of the catalog.
* **Tabbed Navigation**: We added a premium tabbed navigation menu in `<app-journal-entry-container>` that allows fluid transitions between journal entry registration and Chart of Accounts (COA) management, featuring animated transitions and a modern glassmorphic design.

---

## Quality Verification and Automated Tests (Milestone 3)

### Backend Tests (Spring Boot + JUnit 5)
We wrote specialized integration tests in [AccountGroupControllerTest.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/test/java/com/aequivault/infrastructure/web/AccountGroupControllerTest.java) ensuring the correct operation of:
1. Hierarchical insertion with `LTREE`.
2. Delete Guard constraints when a group has children or assigned accounts.
3. RLS isolation by injecting the `X-Tenant-ID` header.

We ran the suite with `./mvnw test` achieving **27/27 tests in green**:
```text
[INFO] Results:
[INFO]
[INFO] Tests run: 27, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Frontend Unit Tests (Jasmine + Karma)
We modified the spec of `JournalEntryContainerComponent` to include spies on group operations and added a test to verify that navigating to the "Chart of Accounts" tab loads the groups correctly.

We executed `npm test` achieving **28/28 successfully passed tests**:
```text
TOTAL: 28 SUCCESS
```
