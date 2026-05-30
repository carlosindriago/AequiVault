# 🏛️ AequiVault: API-First Double-Entry Accounting Engine

🌍 [English](README.md) | 🇪🇸 [Español](README.es.md) | 🇧🇷 [Português](README.pt-BR.md)

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg?style=flat-square&logo=angular)](https://angular.dev/)
[![Liquibase](https://img.shields.io/badge/Liquibase-Checked-blueviolet.svg?style=flat-square&logo=liquibase)](https://www.liquibase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**AequiVault** is an enterprise-grade B2B double-entry accounting engine designed under an API-first architecture and an *Open Core* model. It resolves the complexity of integrating immutable financial logic into modern SaaS platforms in a decentralized way without relying on expensive, slow, and monolithic ERP systems. It guarantees that all transactions are balanced and auditable under SOX compliance, while physically isolating tenant data using cryptographic session variables at the database layer.

---

## 📸 UI Showcase

<div align="center">
  <h3>✍️ Journal Entry Posting (Reactive with Angular Signals)</h3>
  <img src="docs/images/aequivault_journal_entry.png" alt="Journal Entry Form" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
  
  <br/><br/>
  
  <h3>🌳 Hierarchical Chart of Accounts - COA (PostgreSQL LTREE & Recursive Tree)</h3>
  <img src="docs/images/aequivault_chart_of_accounts.png" alt="Hierarchical COA" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />

  <br/><br/>
  
  <h3>🛠️ Interactive API Documentation (OpenAPI / Swagger UI Showcase)</h3>
  <img src="docs/images/aequivault_swagger_showcase.png" alt="Swagger UI documentation" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
</div>

---

## 🏗️ Architecture & Design Decisions (The Flex)

This project exemplifies best practices in large-scale software engineering and distributed systems design:

### 🔒 Domain Immutability (Clean Architecture & CQRS)
*   Double-entry accounting is a sacred business invariant. Confirmed journal entries (`POSTED`) do not allow modifications (`UPDATES`) or deletions (`DELETES`). Any financial correction must be performed via a reversing journal entry.
*   The business core is modeled in pure Java without external framework dependencies (Clean Architecture).
*   A **Pragmatic CQRS** pattern is implemented: writes validate complex business rules in the domain, while reads (Dashboard, Reports) run on optimized projections to bypass JVM Garbage Collector pressure.

### 🌳 High-Speed Hierarchical COA (PostgreSQL `LTREE`)
*   To avoid expensive recursive `WITH RECURSIVE` queries at the SQL layer, the Chart of Accounts (COA) is stored using PostgreSQL's native **`LTREE`** type and **GiST** indexing. This allows the system to consolidate balances for entire parent branches in constant $O(1)$ complexity at the application level.

### 📊 Continuous Balance & Trial Balance ($O(1)$ JVM Memory)
*   General Ledger running balances and Trial Balance aggregates are delegated to PostgreSQL using **window functions** (`SUM() OVER(...)`) and cumulative rollups. This eliminates the need to load thousands of records into JVM memory, ensuring constant execution time regardless of database size.

### 🛡️ Cryptographic Multi-Tenant Isolation (PostgreSQL RLS)
*   Logical multi-tenancy is **not** trusted to ORM-level interceptors (like Hibernate `@Filter`), which are highly prone to accidental data leaks.
*   Instead, the backend decodes the **JWT** (cryptographically signed using JJWT 0.12.6 during user login) to extract the `tenantId`.
*   This ID is propagated to the transactional thread and injected directly as a session variable inside the PostgreSQL JDBC connection. The database engine enforces native **Row-Level Security (RLS)**, physically isolating accounting data at the query level.
*   All connection pool transactions are protected against `ThreadLocal` leaks using strict `try-finally` blocks.

### 🚀 First-Time Setup Bootstrapping Pattern
*   The system has a secure initialization flow. If the database is empty, the backend blocks all public APIs except the setup endpoints to create the first tenant and its corresponding `SUPER_ADMIN` user. Duplicate initializations are blocked and throw deterministic HTTP 422 errors.

### 🔔 Decoupled Collaborative Notifications (Spring Events)
*   Integrates Spring Boot's `ApplicationEventPublisher` to asynchronously broadcast notifications on write actions (such as posting entries or creating accounts).
*   Event listeners process and persist notifications under multi-tenant RLS, which are instantly served to the Angular frontend via reactive Signal polling.

### 👥 Granular RBAC, Soft-Delete & Positive Friction Auditing
*   Implements a custom Role-Based Access Control (RBAC) schema allowing granular permissions mapping.
*   Enforces a strict **soft-delete policy** (deactivating users to `INACTIVE` state rather than physical deletion).
*   Employs **positive friction** for security-sensitive actions: deactivating/reactivating users requires the administrator's password challenge (matched via `PasswordEncoder.matches()`) and a justification reason, recording immutable logs in `user_status_audit` protected by RLS.

---

## 🎨 Modern Frontend (Angular 18)

The AequiVault user interface is built under strict corporate standards for performance and design:

*   **Signals & Synchronous Reactivity:** Local UI state and double-entry imbalances are computed using native Angular 18 Signals, reducing asynchronous RxJS overhead and ensuring optimal rendering cycles.
*   **Standalone Components:** Modular architecture of independent components free of heavy module declarations.
*   **Internationalization (i18n):** Dynamic runtime translations using **Transloco**, loading English/Spanish JSON dictionaries via lazy loading to prevent initial bundle bloat.
*   **Dark Mode Premium UI:** Minimalist glassmorphic styling, smooth borders, reactive gradients, and micro-interactions.

---

## 🚀 Quick Start Guide

### Prerequisites
*   [Docker](https://www.docker.com/) and Docker Compose
*   [Java 21 JDK](https://adoptium.net/)
*   [Node.js v20+](https://nodejs.org/)

### 1. Spin up the Database (PostgreSQL 16)
From the project root folder, initialize the PostgreSQL Docker container:
```bash
docker compose up -d
```
*(PostgreSQL will start on local port `5433`)*

### 2. Compile and Start the Backend (Spring Boot)
Navigate to the backend directory, compile, and start the application:
```bash
cd aequivault/backend
./mvnw clean install
./mvnw spring-boot:run
```
*(The backend will start at `http://localhost:8080`. Liquibase will automatically run all schema migrations and setup the RBAC privileges).*

### 3. Start the Frontend (Angular)
Navigate to the frontend folder and run the development server:
```bash
cd aequivault/frontend
npm install
npm run start
```
*(The B2B portal will be available at `http://localhost:4200`)*

On first access, the system will detect the blank database state and redirect you to the Setup Wizard at `/setup` to create the initial administrative entity.

---

## 🚀 Production Deployment (Cloud-Native)

AequiVault follows the **12-Factor App** methodology for cloud-native deployments. The production orchestration file `docker-compose.prod.yml` is completely stateless, port-agnostic, and treats the database as an external backing service.

### Design Decisions
*   **External Backing Services:** The database (`db`) is excluded from the Compose file. In production, you must use a managed database instance (e.g., AWS RDS, GCP Cloud SQL, or a dedicated PostgreSQL cluster) rather than running it inside Docker Compose.
*   **Port Agnosticism:** No ports are exposed to the host machine. Instead, we use `expose` to declare inner ports (`80` for Nginx frontend and `8080` for Spring Boot backend). A reverse proxy (e.g., Traefik, Nginx Ingress, AWS ALB) must route the external traffic to the frontend service.
*   **Config via Environment:** All database credentials and connection parameters are injected at runtime via standard environment variables.

### Deploy Command Example

To spin up the production stack, supply the required backing service details as environment variables:

```bash
SPRING_DATASOURCE_URL="jdbc:postgresql://your-rds-host:5432/aequivault_db?stringtype=unspecified" \
SPRING_DATASOURCE_USERNAME="aequivault_app" \
SPRING_DATASOURCE_PASSWORD="prod_secure_app_pass" \
SPRING_LIQUIBASE_USER="aequivault_admin" \
SPRING_LIQUIBASE_PASSWORD="prod_secure_admin_pass" \
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 📚 Additional Documentation
1.  [📜 Accounting Business Rules](docs/rules.md)
2.  [🗺️ Project Plan & Architecture](docs/plan_proyecto_contable.md)
3.  [✅ Implementation Walkthrough](docs/walkthrough.md)
4.  [🏗️ Architecture Decision Records (ADRs)](docs/adr/adr-001-setup-and-auth.md)

---

## ⚖️ License
Distributed under the **[MIT License](LICENSE)**. Feel free to use, modify, or extend it as a blueprint for your own multi-tenant transactional architectures.
