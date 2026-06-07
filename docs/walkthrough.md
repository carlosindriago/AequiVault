# AequiVault Walkthrough: Core Engine, Reactivity, LTREE Hierarchy, and B2B Security (Milestones 1 to 10)

This document provides a comprehensive technical walkthrough of the architecture, data structures, security layers, and reactive frontend components implemented in AequiVault.

---

## Milestone 1: Backend API, Validation, ProblemDetail, and RLS

We developed and integrated the REST API layer for AequiVault in Spring Boot, protecting business rules and respecting PostgreSQL's physical multi-tenant isolation via Row-Level Security (RLS).

### Backend Changes
1. **Domain Modeling**:
   * `aequivault/backend/src/main/java/com/aequivault/domain/model/LedgerAccount.java`: Pure domain model without persistence or Spring framework annotations.
   * `aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/repository/LedgerAccountRepositoryImpl.java`: Infrastructure-to-domain mapper utilizing MapStruct.
2. **Contracts (DTOs)**:
   * `aequivault/backend/src/main/java/com/aequivault/infrastructure/web/dto/JournalEntryRequest.java`: Flat entry payload mapping input lines with explicit designations for `DEBIT` or `CREDIT` types.
3. **REST Controllers**:
   * `aequivault/backend/src/main/java/com/aequivault/infrastructure/web/LedgerAccountController.java`: Exposing the Chart of Accounts (COA) catalog under RLS isolation.
   * `aequivault/backend/src/main/java/com/aequivault/infrastructure/web/JournalEntryController.java`: Posting temporary drafts (`DRAFT`) or immutable posted transactions (`POSTED`).
4. **Global Error Handling (RFC 7807)**:
   * `aequivault/backend/src/main/java/com/aequivault/infrastructure/web/exception/GlobalExceptionHandler.java`: Standardized error mapping, routing business validation failures to `422 Unprocessable Entity` and syntax validation issues to `400 Bad Request`.

---

## Milestone 2: Graphical User Interface and Reactivity (Angular 18 + Signals)

We designed and implemented the frontend client in Angular 18, utilizing the Smart/Dumb component pattern and establishing a premium financial SaaS visual aesthetic.

### Frontend Changes
1. **Design and Premium Aesthetics**:
   * `aequivault/frontend/src/styles.scss`: Core styles introducing variable CSS tokens for **Glassmorphism**, Google Fonts' **Outfit** typography, custom scrollbars, and a financial-grade color palette (Emerald Green for balanced states, Coral Red for alerts).
2. **Reactive Core with Signals**:
   * `aequivault/frontend/src/app/core/services/journal-entry-state.service.ts`: Local state service exposing reactive signals. Avoids RxJS overhead in visual bindings. Updates lines immutably (`[...current, newLine]`).
   * **Calculations**: Computes `debitSum()`, `creditSum()`, and `difference()` (rounded to 4 decimal places to prevent float precision drift) reactively. Enables submission buttons only when `canSubmit()` yields `true`.
3. **Component Scaffolding**:
   * `aequivault/frontend/src/app/features/journal/components/journal-line-table/journal-line-table.component.ts`: Renders the interactive grid and hosts styled native selectors to search the accounts list.
   * `aequivault/frontend/src/app/features/journal/components/journal-entry-summary/journal-entry-summary.component.ts`: Renders real-time debit/credit totals and balance alerts.
   * `aequivault/frontend/src/app/features/journal/components/journal-entry-form/journal-entry-form.component.ts`: Collects transaction date, currency selections, and the entry number.
4. **Smart Container**:
   * `aequivault/frontend/src/app/features/journal/journal-entry-container/journal-entry-container.component.ts`: Coordinates account loading, active tenant transitions, and API submission. Injects the `X-Tenant-ID` header dynamically on every HTTP request.

### Frontend Test Suite Results
All 27 original frontend tests passed successfully:
```text
Chrome Headless 148.0.0.0 (Linux 0.0.0): Executed 27 of 27 SUCCESS (2.006 secs / 1.782 secs)
TOTAL: 27 SUCCESS
```

---

## Milestone 3: Hierarchical Chart of Accounts (LTREE, Delete Guard, and Recursion)

Implemented a dynamic and hierarchical Chart of Accounts (COA) to allow structured ledger accounts tree management.

### 1. Data Layer (PostgreSQL LTREE)
* **The Hierarchical Path**: PostgreSQL's native `LTREE` stores the node paths. Validations in `AccountGroup` restrict codes strictly to alphanumeric characters (`^[a-zA-Z0-9]+$`) to prevent syntax corruption in the database.
* **RLS Isolation**: All operations are partitioned by `tenant_id` at the database level.

### 2. Delete Guard (Cascade Prevention)
* Validates whether a target group has children nodes or active ledger accounts using an LTREE descendant check (`path <@ :parentPath`). Blocks deletions by throwing domain exceptions translated to HTTP 422.

### 3. Angular 18 Frontend
* **In-Memory O(N) Reconstruction**: Reconstructs the hierarchy from a flat query list in a single linear pass on the client.
* **Recursive Tree Node**: Component `<app-coa-tree-node>` recursively renders branch levels.
* **Tabbed View**: Integrated navigation to toggle between journal entry screens and the COA manager.

---

## Milestone 4: High-Fidelity Visual Redesign (Showcase Mockup)

Redesigned the layout and style of the Angular 18 client to match a premium financial B2B SaaS dashboard.

### 1. Layout Re-architecture (Split Desktop View)
* **Sidebar Navigation**: Implemented a fixed `260px` sidebar organizing: Dashboard, Ledger, Journals, Chart of Accounts, Reports, and Settings.
* **Brand & Logo**: Placed the styled SVG logo gradient next to the primary `h1` label (`AequiVault`).
* **Active Glow**: Active menu items implement a gradient border in magenta and violet (`border: 1.5px solid rgba(167, 139, 250, 0.35)`) and neon shadows.

### 2. Main Panel and User Header
* **Dynamic Header**: Displays the active route header alongside metadata.
* **Profile & Notifications**: Integrated avatar SVGs and a notification bell with a floating red badge.
* **Multi-Tenant Context Selector**: Glassmorphic tenant dropdown injecting `X-Tenant-ID` headers to demonstrate RLS context switching.

### 3. Glassmorphic Journal Card
* **Header & Date**: Date fields rendered in pill buttons enclosing standard date selectors.
* **Line Items Grid**: Borderless table inputs adopting the `Outfit` font and clean dividers.
* **Totals & Status Pill**: Status pills float in the bottom right corner showing `Status: Balanced` or `Status: Unbalanced` with color coding.

---

## Milestone 4 (Backend Phase): Hierarchical Reports Engine

Implemented the reporting query engine for the **Trial Balance**, compiling hierarchical rollup aggregates in PostgreSQL.

### 1. SQL Rollups & Session Context
* **Query Optimization**: Removed the unnecessary `je.status = 'POSTED'` filter from the native query as drafts reside in a separate table.
* **Transaction Binding**: Applied `@Transactional(readOnly = true)` to open transactional contexts, invoking the RLS dialect initializer to set `app.current_tenant` in PostgreSQL session parameters.
* **Assertions**: Corrected integration tests to use indexed `.value()` assertions in JSON paths to prevent floating-point type mismatches.

---

## Milestone 4 (Frontend Phase): Trial Balance UI

Designed the Trial Balance viewer using reactive Signals.

### 1. Architecture
* Created `trial-balance-table.component.ts` drawing balances in a flat grid with proportional indentations corresponding to path depth.
* Integrated date selectors in the reports container component, updating queries reactively.

---

## Milestone 4 (Dashboard Phase): Dashboard API & KPIs (Backend)

Exposed endpoints compiling financial status indicators and liquidity trends.

### 1. Time-Series Aggregations
* **Net Balances**: Compiles net assets (1) and liabilities (2) via `path <@` LTREE operations.
* **Daily Cash Flow Trend**: Uses PostgreSQL's `generate_series` to yield calendar ranges, interpolating empty transaction dates (Zero-Filling) and calculating cumulative totals with `SUM() OVER`.

---

## Milestone 4 (Dashboard Phase: Frontend): Executive Dashboard & SVG Chart

Implemented the Dashboard visual canvas.

### 1. SVG Liquidity Chart
* Draws responsive SVG area plots (`linePath`, `areaPath`) and axes dynamically.
* Renders interactive tooltip markers displaying cash balances on hover.
* Provides a selector dropdown to filter trends by liquid accounts.

---

## Milestone 5: Dynamic i18n & Lazy Loading

Configured multi-language support (English/Spanish) using `@jsverse/transloco`.

### 1. Asynchronous Loading
* `TranslocoHttpLoader` fetches translation files dynamically from `/assets/i18n/` to optimize primary load bundles.
* Created `TranslationStateService` exposing an `activeLanguage` signal.
* Refactored all components to support translations and wrapped specs with `TranslocoTestingModule` to ensure unit test stability.

---

## Milestone 6: General Ledger & Settings Panel

### 1. General Ledger
* PostgreSQL native queries calculate running balances (`SUM() OVER`) dynamically, minimizing Java memory overhead.
* Created `ledger-container.component.ts` and `ledger-table.component.ts` with date range filter signals.

### 2. Settings Panel
* Custom dropdowns allow switching the active system language.
* Includes a light/dark mode conmutator altering HTML body CSS classes to update the theme.

---

## Milestone 7: Core Financial Statements (Balance Sheet & Income Statement / P&L)

### 1. Backend CTE Aggregations
* Implemented native SQL queries with Common Table Expressions (CTEs) to consolidate Assets, Liabilities, and Equity (Balance Sheet) and Revenues/Expenses (P&L).
* Debit/Credit calculations respect natural account signs.

### 2. Presentational Tables
* Added `balance-sheet-report.component.ts` and `pnl-report.component.ts` showing hierarchical tables with double-entry equation balance alerts.

---

## Milestone 8: Balance Sheet Correction & Accounting Period Lock

### 1. Net Income Injection
* The Balance Sheet query dynamically extracts Net Income (`Revenues - Expenses`) and injects a virtual entry under code `"3.99"` ("Net Income") in the Equity section, achieving equation alignment.

### 2. Period Locking
* Created the `financial_periods` table with RLS.
* Validates transaction dates against the period status (`OPEN`/`CLOSED`) on write operations, preventing any entries or edits in closed periods.

---

## Milestone 9: Collaborative Notification System

### 1. Database Table
* Notifications (`id`, `tenant_id`, `title`, `message`, `target_role`, `is_read`, `created_at`) protected by RLS.

### 2. Decoupled Spring Events
* Writing operations in account and journal entry controllers publish Spring `ApplicationEvent` events.
* Listeners capture events asynchronously and write notification records to the database.
* Linked `notification.service.ts` and added a notification panel in the dashboard sidebar.

---

## Milestone 10: Complete RBAC Module, Soft-Delete & Status Audits

Designed and implemented the Role-Based Access Control (RBAC) administration module.

### 1. Database Audit Logs
* Created the `user_status_audit` table with RLS to record activation and deactivation changes.

### 2. Soft-Delete (Deactivation/Reactivation)
* User state changes to `INACTIVE` upon deactivation. Inactive users are blocked from logging in.
* Endpoints `/deactivate` and `/reactivate` require a request payload containing the administrator's password and a justification reason.

### 3. Positive Friction Verification
* Backend validates admin passwords with `PasswordEncoder.matches()`.
* Redesigned the Settings layout in Angular to host "General", "Users", and "Roles" sub-tabs.
* User deactivations trigger a glassmorphic verification modal in the UI to prompt for admin credentials before querying the API.

---

## Technical Quality and Test Verifications

Both testing suites run successfully, confirming the stability and security of AequiVault:

### 1. Backend Integration Tests (JUnit 5)
Run Command: `./mvnw test`
* **Test Count**: 43 (0 failures, 0 errors, 0 skipped).
* **Verifications**: RLS tenant boundaries, RBAC authorization, double-entry mathematical checks, closed period blocks, and deactivation password validation.

### 2. Frontend Unit Tests (Jasmine & Karma)
Run Command: `npm test -- --watch=false --browsers=ChromeHeadless`
* **Test Count**: 78 (0 failures, 0 errors).
* **Verifications**: Signals reactivity, recursive tree rendering, SVG chart path generators, i18n bundle loading, and Settings sub-tab navigation.
