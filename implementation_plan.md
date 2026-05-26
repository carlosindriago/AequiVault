# Estructuración Inicial del Monorepo AequiVault

Este plan detalla los pasos para crear el esqueleto base del monorepo de **AequiVault** dentro de una subcarpeta `/aequivault` en el espacio de trabajo actual. Mantendremos el proyecto PHP legacy intacto en la raíz para poder referenciar su lógica de negocio cuando sea necesario.

## Proposed Changes

Crearemos la estructura de carpetas estándar:
```
/home/carlos/Proyectos/siste contador-libro mayor/
└── aequivault/
    ├── docker-compose.yml
    ├── backend/           # Spring Boot 3.3.x (Java 21, Maven)
    └── frontend/          # Angular 18 (Signals, Tailwind)
```

### [Infrastructure]

#### [NEW] [docker-compose.yml](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/docker-compose.yml)
Contendrá el servicio de base de datos **PostgreSQL 16** con volumen persistente y configuración de base de datos inicial para multi-tenant (RLS).

### [Backend]

#### [NEW] [backend/](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend)
Generaremos la base del backend usando Spring Initializr (Java 21, Maven, Spring Boot 3.3.x).
*   **Dependencias**: `web`, `data-jpa`, `validation`, `postgresql`, `liquibase`.
*   *Nota*: Añadiremos MapStruct y dependencias de testeo manualmente en el `pom.xml`.

### [Frontend]

#### [NEW] [frontend/](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend)
Inicializaremos un nuevo proyecto Angular 18 en modo no interactivo (`--defaults`), configurado para usar enrutamiento, CSS estándar y Signals.

---

## Verification Plan

### Automated Tests
- Correr `./mvnw clean test` en el backend para verificar que el contexto mínimo de Spring Boot compila.
- Correr `npm run test` (o similar) en el frontend para validar la inicialización.

### Manual Verification
- Iniciar Docker Compose: `docker compose up -d` en `aequivault/` y validar que la base de datos PostgreSQL 16 esté activa y responda.
- Levantar el servidor de desarrollo del backend y frontend para confirmar conectividad inicial.
