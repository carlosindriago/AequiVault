# 🏛️ AequiVault

<div align="center">
  <h3>Enterprise-Grade Double-Entry Accounting Engine & API</h3>
  <p>Construido con <b>Java 21</b>, <b>Spring Boot 3.3</b>, <b>PostgreSQL (LTREE & RLS)</b> y <b>Angular 18</b>.</p>
</div>

---

## 📖 Visión General
**AequiVault** es un motor de libro mayor API-first, liviano, transaccional y multi-inquilino. Diseñado como el *"Stripe para la Contabilidad"*, resuelve el problema de integrar lógica financiera B2B compleja en plataformas SaaS sin depender de monolitos ERP tradicionales. 

Garantiza que las cuentas estén siempre balanceadas, sean inmutables y estén listas para estrictas auditorías SOX.

## ✨ Características Principales (The Flex)

* 🔒 **Libro Mayor Inmutable (Insert-Only Ledger):** La partida doble es sagrada. Asientos definitivos (`POSTED`) no permiten `UPDATES` ni `DELETES`. Cualquier corrección exige un asiento de reversión (Contra-asiento).
* ⚡ **CQRS Pragmático & Clean Architecture:** Separación estricta. Validaciones de dominio en Java puro (sin frameworks) para escrituras. Proyecciones planas de Spring Data para lecturas ultra-rápidas, mitigando la presión del Garbage Collector en Java 21.
* 🌳 **Jerarquías de Alta Velocidad (PostgreSQL `LTREE`):** El Plan de Cuentas (COA) evita las lentas consultas recursivas de SQL. Utiliza índices GIST y el tipo nativo `LTREE` para consolidar balances de ramas enteras en milisegundos.
* 🛡️ **Aislamiento Físico Multi-Tenant (RLS):** La separación de inquilinos **no** depende de filtros frágiles en el ORM. Se inyecta la variable de sesión en el ciclo transaccional de Spring Boot, dejando que PostgreSQL aplique **Row-Level Security** nativa. Fugas de datos imposibles a nivel motor.
* 🎨 **Frontend B2B Premium (Angular 18):** Interfaz fluida basada íntegramente en **Signals** (estado inmutable y reactividad sin RxJS) y patrón *Smart/Dumb components*. Formularios que calculan desbalances contables en tiempo real y renderizan árboles financieros recursivos en el cliente en complejidad $O(N)$.

---

## 🛠️ Stack Tecnológico

### Backend (El Cerebro)
* **Java 21 LTS** + **Spring Boot 3.3.x**
* **Spring Data JPA** + **MapStruct** (Mapeos eficientes)
* **PostgreSQL 16** (RLS, LTREE, Transaccionalidad ACID)
* **Liquibase** (Gestión versionada de esquemas)
* **JUnit 5 + Testcontainers** (TDD en integración)

### Frontend (La Vidriera)
* **Angular 18** (Standalone Components, Signals, Control Flow nativo)
* **Tailwind CSS** (Glassmorphism, UI B2B Premium)
* **Karma/Jasmine** (Unit Testing al 100% de cobertura)

---

## 🚀 Quick Start (Despliegue Local)

Levantar AequiVault en tu máquina toma menos de 2 minutos.

### Prerrequisitos
* [Docker](https://www.docker.com/) y Docker Compose
* [Java 21](https://adoptium.net/)
* [Node.js 20+](https://nodejs.org/)

### 1. Levantar la Infraestructura (PostgreSQL)
```bash
docker compose up -d
```

*(Esto levanta Postgres 16 en el puerto `5433`)*

### 2. Compilar e Iniciar el Backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

*(El backend correrá en `http://localhost:8080`. Liquibase ejecutará las migraciones y configurará RLS y LTREE automáticamente).*

### 3. Iniciar el Frontend B2B

```bash
cd frontend
npm install
npm run start
```

*(El portal B2B estará disponible en `http://localhost:4200`).*

---

## 📚 Documentación de Arquitectura

Para un buceo profundo en las decisiones de diseño, tradeoffs estructurales, y el rigor del TDD aplicado, revisa nuestra carpeta de documentos de arquitectura:

1. [📜 Reglas de Negocio e Invariantes](docs/rules.md)
2. [🗺️ Plan Estratégico y Arquitectura Senior](docs/plan_proyecto_senior.md)
3. [✅ Walkthrough de Implementación (Hitos 1, 2 y 3)](docs/walkthrough.md)

---

## ⚖️ Licencia

Este proyecto es de código abierto y está disponible bajo la **[Licencia MIT](LICENSE)**. Siéntete libre de clonarlo, romperlo, estudiarlo o usarlo como base para tus propios sistemas transaccionales B2B.
