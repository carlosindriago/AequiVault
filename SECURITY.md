# 🔒 Security Policy

AequiVault is an enterprise-grade double-entry accounting engine that handles sensitive financial data. Security is a core architectural concern, not an afterthought.

---

## 📢 Reporting a Vulnerability

**Please do not open a public GitHub Issue for security vulnerabilities.**

If you discover a security issue, follow these steps:

1. Open a [GitHub Security Advisory](https://github.com/carlosindriago/AequiVault/security/advisories/new) (private disclosure).
2. Include in your report:
   - A clear description of the vulnerability
   - Steps to reproduce (proof of concept if possible)
   - Potential impact assessment
   - Suggested fix or mitigation (optional)
3. We will acknowledge your report within **7 business days** and provide an initial assessment.
4. We will coordinate a fix and disclosure timeline with you before any public announcement.

> We appreciate responsible disclosure and will credit reporters in the release notes unless anonymity is requested.

---

## 🛡️ Security Layers

AequiVault implements multiple independent security layers to protect financial data integrity and tenant isolation:

### 1. Cryptographic Authentication (JWT)

| Property | Detail |
|---|---|
| Library | JJWT 0.12.6 |
| Algorithm | HMAC-SHA (cryptographically signed) |
| Claims | `tenant_id`, user roles |
| Validation | Signature verified on every request via `JwtAuthenticationFilter` |

### 2. Multi-Tenant Row-Level Security (RLS)

| Property | Detail |
|---|---|
| Mechanism | PostgreSQL native RLS policies |
| Session variable | `app.current_tenant` |
| Isolation scope | All transaction tables: `journal_entries`, `journal_lines`, `ledger_accounts`, `account_groups`, `financial_periods`, `notifications`, `user_status_audit` |
| Thread safety | `TenantContext.clear()` called in guaranteed `finally` blocks (HikariCP pool protection) |

> **Note**: The `users`, `roles`, `permissions`, and their associative tables have RLS **disabled** by design. This is required so the login endpoint can look up users globally before a tenant context is established. See [ADR-001](docs/adr/adr-001-setup-and-auth.md) for the full rationale and mitigation strategy.

### 3. Double-Entry Ledger Immutability

| Property | Detail |
|---|---|
| Policy | Posted entries (`POSTED`) are **insert-only** |
| Enforcement | Domain layer rejects any `UPDATE` or `DELETE` on posted records |
| Correction method | Reversing journal entries (contra-entries) only |
| Precision | `DECIMAL(25,4)` with `HALF_EVEN` rounding (Banker’s Rounding) |

### 4. Role-Based Access Control (RBAC)

| Property | Detail |
|---|---|
| Mechanism | Custom RBAC schema with granular permission mapping |
| Roles | SUPER_ADMIN, Admin, Accountant, Auditor |
| Sensitive actions | Deactivation/reactivation requires admin password challenge + written justification |
| Audit trail | All status changes logged in `user_status_audit` (RLS-protected) |

### 5. Financial Period Locking

| Property | Detail |
|---|---|
| Table | `financial_periods` (RLS-protected) |
| States | `OPEN` / `CLOSED` |
| Enforcement | Write operations validate transaction dates before persistence; closed-period entries return HTTP 422 |

### 6. Positive Friction for Sensitive Actions

Deactivating or reactivating users requires:
- The **administrator’s current password**, verified via `PasswordEncoder.matches()`
- A mandatory **justification reason**
- An immutable audit log entry in `user_status_audit`

---

## ⚠️ Threat Model

| Threat | Mitigation |
|---|---|
| Token forgery / impersonation | JJWT cryptographic signature verification |
| Cross-tenant data leak | PostgreSQL RLS physically enforced at query level |
| Financial data tampering | Immutable ledger (insert-only), reversing entries only |
| Privilege escalation | RBAC with granular permissions; sensitive actions require password re-auth |
| Injection attacks | Spring Data JPA parameterized queries; domain-layer input validation |
| Accounting period manipulation | Period lock enforced at the domain and database layer |
| Connection pool thread poisoning | `try-finally` blocks guarantee `TenantContext` cleanup |
| Duplicate system initialization | `POST /api/v1/setup/init` blocked after first tenant; throws deterministic HTTP 422 |

---

## 🔧 Security Configuration Checklist (Deployers)

Before going to production, verify:

- [ ] **HTTPS** is enforced on all endpoints via reverse proxy (Traefik / Nginx / AWS ALB)
- [ ] **JWT signing key** is a strong secret injected via environment variable (not hardcoded)
- [ ] **Database** is a managed instance (AWS RDS, GCP Cloud SQL) with RLS policies active
- [ ] **HikariCP** connection pool is configured with a reasonable `maximumPoolSize`
- [ ] **Rate limiting** is applied on `/api/v1/auth/login` to prevent brute-force attacks
- [ ] **Audit logs** (`user_status_audit`) are monitored for anomalous deactivation patterns

---

## 📚 Related Documents

- [ADR-001: Identity System & Setup Bootstrapping](docs/adr/adr-001-setup-and-auth.md) — full RLS trade-off rationale
- [Accounting Business Rules](docs/rules.md) — mandatory `Money` Value Object and immutability rules
- [Contributing Guidelines](CONTRIBUTING.md) — how to contribute securely
