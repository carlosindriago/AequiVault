# AequiVault — Reglas y Estándares de Desarrollo

Este documento establece las reglas técnicas, de diseño y metodológicas obligatorias para el desarrollo de **AequiVault**. Cualquier programador o agente de IA que trabaje en este repositorio debe cumplir estrictamente con estas directrices.

---

## 1. Filosofía del Proyecto y Reglas del Negocio (Invariantes)

AequiVault es un sistema de contabilidad de grado financiero transaccional. No se aceptan atajos que comprometan la integridad de los datos.

*   **Partida Doble Estricta**: Todo asiento contable (`JournalEntry`) debe cumplir que:
    $$\sum Debe (Debit) = \sum Haber (Credit)$$
    Si la ecuación no cuadra a nivel de centavos, la transacción se rechaza de inmediato en la capa de dominio.
*   **Inmutabilidad del Libro Diario (Ledger)**: Las tablas `journal_entries` y `journal_lines` son estrictamente **Insert-Only**.
    *   Queda **prohibido** realizar operaciones `UPDATE` o `DELETE` sobre registros asentados.
    *   Cualquier corrección de errores debe realizarse mediante un **asiento de ajuste/reversión** contable (Contra-asiento).
*   **Aislamiento de Borradores (Draft Staging)**: Los borradores contables jamás tocan las tablas del libro mayor. Viven en tablas de staging temporales (`draft_journal_entries` y `draft_journal_lines`) y se mueven de forma atómica a las tablas firmes únicamente al asentarse.
*   **Precisión Financiera (`Money`)**:
    *   Queda estrictamente **prohibido** el uso de `double` o `float` para montos monetarios.
    *   Se debe utilizar el Value Object `Money` (que encapsula `BigDecimal` y `Currency`).
    *   La matemática interna utiliza una escala de **6 o 8 decimales** para mitigar errores de redondeo acumulado.
    *   Antes de persistir, los montos se redondean a **4 decimales** en base de datos (`DECIMAL(25,4)`) usando obligatoriamente **Redondeo del Banquero** (`RoundingMode.HALF_EVEN`).

---

## 2. Arquitectura del Backend (Java 21 + Spring Boot 3.3.x)

Implementamos un enfoque de **CQRS Lógico** para equilibrar pureza y rendimiento:

### Ruta de Escritura (Commands) - Arquitectura Hexagonal Pura
*   Las clases de dominio (`JournalEntry`, `LedgerAccount`, `Money`) son **Java puro** y no contienen anotaciones de JPA (`@Entity`, `@Table`) ni de Spring.
*   Las validaciones se ejecutan en las entidades de dominio y servicios del dominio antes de mapear.
*   Se utiliza **MapStruct** únicamente en la capa de infraestructura para convertir objetos de dominio a entidades JPA (`*Entity`) antes de guardar.
*   Las invariantes de negocio se testean con JUnit 5 usando TDD estricto sin levantar bases de datos ni Spring Context.

### Ruta de Lectura (Queries) - Proyecciones Directas
*   Para la generación de reportes (Balance de Comprobación, Balance General, P&L, etc.), **se omite el modelo de dominio**.
*   Se consulta la base de datos utilizando **proyecciones de Spring Data JPA** directas a DTOs de lectura plana o agregaciones SQL rápidas.
*   Esto evita la instanciación de objetos del dominio en memoria y el consumo excesivo de CPU/Garbage Collector en Java 21.

---

## 3. Base de Datos (PostgreSQL 16+)

Aprovechamos las capacidades nativas del motor relacional para simplificar la lógica de la aplicación y garantizar seguridad física.

*   **Jerarquías con LTREE**:
    *   El Plan de Cuentas (`account_groups`) no utiliza relaciones autoreferenciadas simples con `parent_id` (Adjacency List).
    *   Se utiliza la extensión nativa **LTREE** de PostgreSQL para la columna `path`.
    *   Las consultas jerárquicas y sumatorias consolidadas se realizan con el operador de descendencia (`path <@ 'codigo_raiz'`) apoyadas por índices **GIST** en PostgreSQL.
*   **Seguridad Multi-inquilino (Row-Level Security - RLS)**:
    *   El aislamiento de inquilinos (`tenant_id`) se delega y valida físicamente en la base de datos mediante **RLS**.
    *   En las migraciones de base de datos se activa RLS y se define la política usando la variable de sesión `current_setting('app.current_tenant')`.
    *   Al inicio de cada transacción, el backend Spring Boot debe ejecutar `SET LOCAL app.current_tenant = :tenantId`.
    *   **Limpieza de Hilo**: Se debe limpiar de forma garantizada el `ThreadLocal` del tenant ID en un bloque `finally` para evitar fugas de datos entre hilos de ejecución del connection pool (HikariCP).

---

## 4. Arquitectura del Frontend (Angular 18)

*   **Gestión de Estado**: Uso exclusivo de **Angular Signals** para reactividad y sincronización de estados. Evitar el uso desmedido de RxJS salvo para flujos de datos asíncronos complejos o peticiones HTTP.
*   **Componentes**: Patrón **Smart/Dumb** (Container/Presentational).
    *   *Smart Components*: Manejan llamadas a servicios, lógica de negocio y paso de datos.
    *   *Dumb Components*: Reciben datos mediante `@Input` (o signal-based inputs) y emiten eventos mediante `@Output`. 100% enfocados en UI.
*   **Estilos**: CSS nativo y Tailwind CSS según corresponda. Cero estilos inline o placeholders visuales genéricos. Toda UI debe sentirse premium, fluida, responsive y moderna.
*   **Testing**: Asegurar que todos los elementos interactivos clave tengan IDs únicos y descriptivos para facilitar pruebas automatizadas de interfaz.

---

## 5. Prácticas de Desarrollo y Workflow

*   **TDD Estricto**: Escribir los tests unitarios de las reglas de dominio *antes* de implementar la lógica. Los tests deben servir como especificación viva del código.
*   **Git y Convención de Commits**:
    *   Seguir la especificación de **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
    *   **Prohibido**: Añadir atribuciones de autoría de Inteligencia Artificial (ej. "Co-Authored-By", "Generated by AI") en los mensajes de commit.
*   **Sin builds tras cambios**: No ejecutar comandos de empaquetado final (`mvn package`, `npm run build`) durante el desarrollo iterativo ordinario, a menos que sea estrictamente necesario para validar builds en CI/CD.
