# Sistema de Identidad (AuthN) y Patrón Setup Bootstrapping (Modelo Open Core)

Este plan detalla el diseño e implementación de la Fase 1 del Sistema de Identidad (Autenticación) y el mecanismo de inicialización segura por primera vez (First-Time Setup Bootstrapping) para AequiVault.

## User Review Required

> [!IMPORTANT]
> **Corrección del Nombre y Secuencia de la Migración Liquibase**
> La directiva original solicita crear el archivo `005-security-rbac.sql`. Sin embargo, tras la auditoría del repositorio se verificó que el changelog master ya registra `005-create-app-user.sql` y `006-add-currency-to-entries.sql`. Para evitar colisiones de checksums y mantener la consistencia histórica de Liquibase, la nueva migración se creará con el nombre **`007-security-rbac.sql`** y se registrará al final de `db.changelog-master.yaml`.

> [!WARNING]
> **Ausencia de Row-Level Security (RLS) en las Tablas de Identidad**
> Para que el proceso de autenticación (`/api/v1/auth/login`) pueda buscar usuarios por su `email` de forma global y determinar su `tenant_id` asociado *antes* de que se establezca el contexto de seguridad del inquilino, **no habilitaremos RLS en las tablas `users`, `roles` y `permissions`**. La seguridad multi-inquilino de los datos contables se mantendrá intacta mediante RLS en las tablas transaccionales, inyectando el `tenant_id` extraído criptográficamente del JWT del usuario una vez autenticado.

## Open Questions

*Ninguna en este momento. Las directivas técnicas están claras y los riesgos de RLS y secuencia de base de datos han sido mitigados.*

## Proposed Changes

---

### [Database: Liquibase Migrations]

#### [NEW] [007-security-rbac.sql](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/resources/db/changelog/migrations/007-security-rbac.sql)
Crea la estructura de tablas para usuarios, roles y permisos, y asocia los roles base iniciales:
*   **Tablas**:
    *   `roles`: `id` (UUID), `name` (VARCHAR), `description` (VARCHAR)
    *   `permissions`: `id` (UUID), `name` (VARCHAR), `description` (VARCHAR)
    *   `role_permissions`: `role_id` (UUID), `permission_id` (UUID)
    *   `users`: `id` (UUID), `tenant_id` (UUID, FK a `tenants`), `email` (VARCHAR, UNIQUE), `password_hash` (VARCHAR), `status` (VARCHAR), `created_at` (TIMESTAMP)
    *   `user_roles`: `user_id` (UUID), `role_id` (UUID)
*   **Roles Insertados**: `SUPER_ADMIN`, `AUDITOR`.

#### [MODIFY] [db.changelog-master.yaml](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/resources/db/changelog/db.changelog-master.yaml)
*   Añadir la línea para incluir `db/changelog/migrations/007-security-rbac.sql`.

---

### [Backend: Configuration & Dependencies]

#### [MODIFY] [pom.xml](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/pom.xml)
*   Añadir la dependencia `spring-boot-starter-security`.
*   Añadir las bibliotecas JJWT (`jjwt-api`, `jjwt-impl` y `jjwt-jackson` versión `0.12.6`).

---

### [Backend: Security Architecture]

#### [NEW] [UserEntity.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/entity/UserEntity.java)
Entidad JPA para mapear la tabla `users`.

#### [NEW] [RoleEntity.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/entity/RoleEntity.java)
Entidad JPA para mapear la tabla `roles`.

#### [NEW] [PermissionEntity.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/entity/PermissionEntity.java)
Entidad JPA para mapear la tabla `permissions`.

#### [NEW] [UserRepository.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/repository/UserRepository.java)
Repositorio Spring Data JPA para gestionar usuarios. Incluye búsqueda por email `Optional<UserEntity> findByEmail(String email)`.

#### [NEW] [RoleRepository.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/repository/RoleRepository.java)
Repositorio Spring Data JPA para gestionar roles. Búsqueda por nombre `Optional<RoleEntity> findByName(String name)`.

#### [NEW] [JwtService.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/security/JwtService.java)
Servicio para generar y validar tokens JWT usando la API moderna de JJWT (0.12.x).
*   Incluye el `tenantId` y los roles en los *claims* adicionales.

#### [NEW] [JwtAuthenticationFilter.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/security/JwtAuthenticationFilter.java)
Filtro de seguridad que intercepta peticiones HTTP, extrae el token del encabezado `Authorization: Bearer <JWT>`, valida la firma, inyecta la autenticación en el `SecurityContext` y establece de forma segura el `TenantContext.setTenantId(tenantId)` para el cumplimiento estricto del aislamiento por RLS.

#### [NEW] [SecurityConfig.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/config/SecurityConfig.java)
Configura la cadena de filtros de Spring Security:
*   Inhabilita CSRF ( stateless API ).
*   Configura Cors con la configuración del proyecto.
*   Declara `permitAll()` en `/api/v1/setup/**` y `/api/v1/auth/login`.
*   Añade `JwtAuthenticationFilter` antes de `UsernamePasswordAuthenticationFilter`.
*   Declara `BCryptPasswordEncoder` como Bean.

---

### [Backend: Web Layer / Controllers]

#### [NEW] [SetupController.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/SetupController.java)
Controlador REST para gestionar la inicialización del sistema por primera vez:
*   `GET /api/v1/setup/status`: Retorna `{ "isInitialized": true/false }` evaluando si existen registros en inquilinos/usuarios.
*   `POST /api/v1/setup/init`: Recibe datos de empresa, email y contraseña.
    *   *Regla de negocio*: Lanza `IllegalStateException` si el sistema ya fue inicializado.
    *   Crea el inquilino (`TenantEntity`), hashea la contraseña del usuario con Bcrypt, crea el usuario con rol `SUPER_ADMIN` y retorna el JWT.

#### [NEW] [AuthController.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/AuthController.java)
Controlador REST para la autenticación:
*   `POST /api/v1/auth/login`: Recibe email y contraseña.
    *   Valida credenciales utilizando Bcrypt.
    *   Retorna un JWT de sesión con los claims del inquilino y rol del usuario.

---

## Verification Plan

### Automated Tests
*   **JUnit Integration Tests**:
    *   Crear `SetupControllerTest.java` para probar la inicialización correcta por primera vez, el bloqueo de inicializaciones subsiguientes y la generación de JWT correctos.
    *   Crear `AuthControllerTest.java` para validar el flujo de autenticación, comprobación de hashes de contraseñas y denegación de credenciales inválidas.
    *   Comando para ejecutar pruebas: `./mvnw test` desde `aequivault/backend`.

### Manual Verification
*   Utilizar `curl` o cliente REST para:
    1.  Consultar `GET /api/v1/setup/status` (debe retornar `isInitialized: false` en un entorno limpio).
    2.  Llamar `POST /api/v1/setup/init` para crear la entidad inicial corporativa.
    3.  Llamar de nuevo a `GET /api/v1/setup/status` (debe retornar `true`).
    4.  Llamar `POST /api/v1/setup/init` por segunda vez para verificar el rechazo de la solicitud (HTTP 422 - Unprocessable Entity).
    5.  Realizar login en `POST /api/v1/auth/login` y verificar la obtención del JWT.
