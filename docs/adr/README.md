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
