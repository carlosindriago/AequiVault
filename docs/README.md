# AequiVault — Documentation Index

This directory contains the complete technical documentation for AequiVault. All documents are written in English to match the primary codebase language.

> For a project overview and quick start guide, see the [root README](../README.md).

---

## Contents

### 📐 Architecture & Design

| Document | Description | Status |
|----------|-------------|--------|
| [Architecture Decision Records (ADRs)](adr/) | Log of significant architectural decisions with context and consequences | ✅ |
| [Project Plan & Architecture](plan_proyecto_contable.md) | Full system design, domain model, DB schema, API surface, and deployment strategy | ✅ |

### 📜 Business Rules & Standards

| Document | Description | Status |
|----------|-------------|--------|
| [Accounting Business Rules](rules.md) | Mandatory technical and architectural rules for all contributors and AI agents | ✅ |

### 🔧 Developer Guides

| Document | Description | Status |
|----------|-------------|--------|
| [Implementation Walkthrough](walkthrough.md) | Step-by-step technical walkthrough of Milestones 1–10: engine, reactivity, security, RBAC | ✅ |

### 📁 ADR Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](adr/adr-001-setup-and-auth.md) | Identity System (AuthN) and Setup Bootstrapping Pattern | ✅ Accepted |
| [ADR-002](adr/adr-002-financial-reports-and-dx.md) | Hierarchical Financial Reports Engine, Swagger UI and DX | ✅ Accepted |

### 🔒 Security

| Document | Description | Status |
|----------|-------------|--------|
| [Security Policy](../SECURITY.md) | Vulnerability reporting process, security layers, and compliance overview | ✅ |

---

## Contributing to Documentation

* Keep each document focused on a single concern.
* Do not duplicate content — link to the authoritative source instead.
* Use `🚧` to mark sections that are in progress.
* Follow the commit convention: `docs: <description of change>`

---

← [Back to root README](../README.md)
