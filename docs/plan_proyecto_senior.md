# AequiVault: Motor y API de Contabilidad por Partida Doble Empresarial
## Plan de Proyecto Open Source de Nivel Senior para Portafolio

¡Hola! Si queremos que las empresas se vuelvan locas con tu portafolio, no podemos presentarles una simple app de tareas ("Todo App") o un clon básico de un e-commerce. Las corporaciones y clientes de alto nivel buscan ingenieros que comprendan **lógica de negocio compleja, transaccionalidad estricta, seguridad y rigor arquitectónico**.

Por eso, tomar las ideas de este sistema contable (libro mayor/contador) y elevarlo a una arquitectura senior moderna con **Java 21, Spring Boot 3.x, Angular 18, Arquitectura Limpia (Hexagonal), TDD y Diseño Guiado por el Dominio (DDD)** es una **locura cósmica**.

Este documento define la planificación completa de ese proyecto.

---

## Definición Estratégica del Producto

### 1. Nombres Creativos Propuestos (para Evitar Colisiones)
Para destacar en GitHub y evitar nombres genéricos como "ContabilidadApp" o "FintechLedger", usaremos nombres con raíz conceptual e histórica, ideales para un proyecto de marca registrada:

*   **`AequiVault`** (Nombre Elegido): Fusión de *Aequi* (de *aequitas*, que representa equidad, simetría y balance perfecto en latín) y *Vault* (bóveda/caja fuerte en inglés, representando seguridad máxima e inmutabilidad de los datos financieros).
*   **`Librata`**: Del latín *librare* (equilibrar, balancear). Hace referencia directa al equilibrio perfecto del Balance General y la partida doble.
*   **`Vectis`**: Significa "palanca" en latín. Sugiere que el motor es la palanca financiera para controlar el estado económico de una organización.

### 2. El Problema que Resolvemos
Actualmente, los desarrolladores de plataformas B2B SaaS o Fintech se enfrentan a un dilema cuando necesitan un libro mayor contable:
*   Integrar un monstruo ERP tradicional (como SAP o NetSuite) es costoso, lento y requiere consultores externos.
*   Construir lógica de contabilidad ad-hoc con bases de datos tradicionales suele terminar en desastre debido a redondeos de punto flotante incorrectos, falta de cumplimiento de la partida doble y falta de trazabilidad de auditorías.

**AequiVault** resuelve esto siendo el **"Stripe para la Contabilidad"**: un motor de libro mayor API-first, liviano, de base de datos inmutable (insert-only), transaccional y multi-inquilino que garantiza que las cuentas de una empresa estén siempre balanceadas y listas para auditoría.

### 3. A Quién está Dirigido (Target Audience)
*   **Fintech Startups**: Plataformas que manejan billeteras virtuales, préstamos o procesan pagos y necesitan un libro mayor interno inmutable para rastrear el flujo de dinero de los usuarios.
*   **B2B SaaS Creators**: Desarrolladores que construyen herramientas SaaS (de facturación, inventario o gestión de personal) y quieren agregar un módulo contable sin reinventar la rueda.
*   **Empresas de Consultoría de Software**: Equipos de desarrollo que construyen ERPs a medida para empresas medianas y necesitan una base sólida de grado financiero para la trastienda (backend).

### 4. Modelo de Negocio (Monetización del Open Source)
Aunque el core es de código abierto (licencia MIT), se planifica con una mentalidad de negocio real (**Open-Core**):
1.  **SaaS Managed Cloud**: Hosting administrado con infraestructura en la nube (AWS/GCP), copias de seguridad diarias automatizadas, alta disponibilidad y cumplimiento normativo (SOC2).
2.  **Soporte Corporativo & SLAs**: Consultoría técnica y acuerdos de nivel de servicio para integraciones complejas en la arquitectura interna de grandes empresas.
3.  **Enterprise Add-ons**: Módulos de facturación electrónica o conectores con bancos locales licenciados de forma privada.

### 5. Cómo Innovamos (Propuesta de Valor)
*   **Headless & API-First**: No es una interfaz monolítica rígida. Todo el motor se maneja mediante APIs REST / Webhooks. La UI de Angular es solo una implementación cliente que consume esta API.
*   **Modelo de Ledger Inmutable**: El libro mayor principal es estrictamente **insert-only**. Cualquier corrección de errores requiere un asiento de reversión contable (Reversing/Adjustment Entry), garantizando auditorías infalibles y cumplimiento de normativas de nivel bancario.
*   **Aislamiento de Borradores (Draft Staging)**: Los borradores contables jamás ingresan al libro mayor. Viven en una estructura de persistencia temporal (tablas de staging) y solo ingresan al libro diario real cuando se aprueban y asientan definitivamente.
*   **Reactividad de Interfaz con Angular Signals**: Procesamiento reactivo en el navegador que calcula desbalances contables al instante mientras se editan asientos de cientos de líneas.

### 6. Roadmap del Producto

El proyecto se desarrollará en 4 hitos claros para mantener el rigor del TDD y la arquitectura limpia:

```
[Hito 1: Motor Core y TDD (API)] ──> [Hito 2: Angular Dashboard & COA]
                 │                                      │
                 v                                      v
[Hito 3: Multi-tenancy & Advanced] ──> [Hito 4: SaaS Deployment & Docs]
```

*   **Hito 1 (MVP Contable - Backend)**:
    *   Diseño del modelo de dominio y tests unitarios TDD de balance contable.
    *   Implementación de base de datos PostgreSQL, migraciones con Liquibase.
    *   REST API para CRUD del Plan de Cuentas (Chart of Accounts) y registro de Asientos.
*   **Hito 2 (Interfaz Gráfica y Reportabilidad - Frontend)**:
    *   Scaffolding de Angular 18 con Tailwind CSS.
    *   Formulario interactivo para registrar asientos que balanceen en tiempo real con Signals.
    *   Generación de reportes: Balance de Comprobación y Balance General en pantalla y PDF.
*   **Hito 3 (Escalabilidad y Seguridad Corporativa)**:
    *   Aislamiento de inquilinos (Multi-tenancy lógico) por base de datos o esquema.
    *   Seguridad con OAuth2/JWT y roles de usuario (Admin, Contador, Auditor).
    *   Implementación de bloqueo de periodos contables y conciliación bancaria.
*   **Hito 4 (Grado de Producción y Lanzamiento)**:
    *   Configuración de despliegue en la nube con Docker Compose.
    *   Generación de documentación OpenAPI/Swagger interactiva.
    *   Escritura de la guía de arquitectura y publicación de la Demo en línea.

---

## 1. Análisis del Proyecto Original (CodeIgniter 3) y Gotchas Detectados

El sistema actual resuelve el problema de la partida doble y el libro mayor, pero adolece de problemas clásicos de los frameworks MVC tradicionales acoplados a la base de datos:

1. **Precisión Matemática Omitida**: En PHP, la precisión monetaria se delega a `bcmath` con condicionales ad-hoc en funciones de utilidad (`FunctionsCore::calculate`). Si no está cargada la extensión `bcmath`, multiplica por 100/1000 y redondea a `int`. Esto es propenso a errores en sistemas empresariales distribuidos.
2. **Acoplamiento de Datos**: El negocio (balances, conciliaciones) está programado directamente sobre consultas SQL de CodeIgniter (`$this->DB1->where(...)`), acoplando la lógica de negocio al motor de base de datos relacional.
3. **Cuello de Botella Jerárquico en Plan de Cuentas (COA)**: El uso de listas de adyacencia (`parent_id`) requiere recursión manual en memoria o consultas jerárquicas complejas (`WITH RECURSIVE` en SQL) para sumar saldos consolidados de ramas completas, lo cual degrada exponencialmente el rendimiento a medida que crecen las transacciones.
4. **Fuga de Multi-tenancy en la Aplicación**: Delegar el aislamiento de inquilinos únicamente a la capa de código (ej. Hibernate `@TenantId`) expone la seguridad a descuidos de desarrolladores juniors en consultas nativas.
5. **Falta de Trazabilidad e Inmutabilidad**: Aunque existe una tabla de `logs`, las transacciones contables en el mundo empresarial deben ser inmutables. Permitir actualizaciones directas sobre el monto de un asiento contable ya conciliado o cerrado destruye la integridad del sistema.

---

## 2. Visión del Nuevo Proyecto: **AequiVault**

**AequiVault** será una API Rest de contabilidad por partida doble robusta, multi-inquilino (SaaS-ready) y de alto rendimiento, acompañada de un panel web administrativo premium en Angular.

### Stack Tecnológico Principal:
*   **Backend**: Java 21 (LTS), Spring Boot 3.3+, Spring Data JPA, Spring Security (OAuth2 / JWT + RBAC), PostgreSQL, Liquibase (migraciones), ArchUnit.
*   **Frontend**: Angular 18 (Standalone Components, Signals, RxJS, NgRx para el estado de transacciones, Tailwind CSS + Angular Material con estética Glassmorphism).
*   **Infraestructura/DevOps**: Docker & Docker Compose, GitHub Actions (CI/CD con análisis de SonarCloud), LocalStack para emular servicios en la nube si fuese necesario.

---

## 3. Arquitectura del Backend: Hexagonal (Clean Architecture)

Para demostrar nivel senior, separaremos estrictamente las capas del backend para que las reglas de negocio sean 100% independientes del framework (Spring Boot) y de la base de datos (PostgreSQL).

```mermaid
graph TD
    subgraph Infrastructure Layer (Adapters)
        WebController[REST Controllers]
        JpaRepo[Spring Data JPA Repositories]
        QueueAdapter[Event Listeners / MQ]
    end

    subgraph Application Layer (Use Cases)
        PostEntryUC[PostJournalEntryUseCase]
        GetTrialBalUC[GetTrialBalanceUseCase]
        ReconcileUC[ReconcileBankTransactionUseCase]
    end

    subgraph Core Domain Layer (Pure Java)
        subgraph Entities
            JournalEntry[JournalEntry Aggregate]
            LedgerAccount[LedgerAccount]
            AccountGroup[AccountGroup]
        end
        subgraph Value Objects
            Money[Money Value Object]
            AccountCode[AccountCode]
        end
        subgraph Domain Services
            DoubleEntryService[DoubleEntryValidationService]
        end
        subgraph Ports
            InboundPorts[Use Case Interfaces]
            OutboundPorts[Repository Interfaces]
        end
    end

    WebController --> InboundPorts
    InboundPorts --> PostEntryUC
    PostEntryUC --> OutboundPorts
    PostEntryUC --> DoubleEntryService
    OutboundPorts --> JpaRepo
```

### Tradeoff Crítico: Pureza del Dominio vs. Rendimiento (CQRS Lógico)

Para evitar la sobrecarga de conversión en memoria de miles de registros mediante MapStruct durante consultas analíticas pesadas (como balances o reportes contables), implementaremos un patrón de **CQRS Lógico**:

*   **Commands (Escritura - Hexagonal Pura)**:
    *   *Cómo funciona*: La capa de API recibe la petición de registrar un asiento. Instancia las clases del Dominio puro en Java (`JournalEntry`, `Money`), las cuales son agnósticas de base de datos y frameworks. Se aplican las reglas de partida doble y validación del período fiscal. Si es válido, se mapea mediante MapStruct a las entidades JPA de infraestructura (`JournalEntryEntity`, `JournalLineEntity`) y se persiste de manera transaccional.
    *   *Pros*: El dominio es robusto, aislado y 100% testeable mediante JUnit 5 en milisegundos sin levantar base de datos ni Spring Boot.
*   **Queries (Lectura - Proyecciones Directas)**:
    *   *Cómo funciona*: Para reportes analíticos masivos y balances, se ignora por completo el modelo de dominio. El servicio de lectura consulta la base de datos PostgreSQL utilizando **proyecciones de Spring Data JPA** directas a DTOs de lectura plana o agregados SQL rápidos.
    *   *Pros*: Máximo rendimiento. No se instancian objetos pesados ni se ejecutan mappers recursivos en memoria de Java. Se aprovecha la capacidad de agregación de la base de datos, manteniendo baja la presión del Garbage Collector en Java 21.

---

## 4. Diseño del Dominio (DDD) e Invariantes Contables

El corazón de la aplicación debe encapsular las reglas de negocio. En contabilidad por partida doble, las reglas (invariantes) son sagradas:

### 1. El Value Object `Money`
No usaremos `double` ni `float` debido a errores de redondeo binario. Encapsularemos el comportamiento del dinero:
```java
public record Money(BigDecimal amount, Currency currency) {
    private static final int INTERNAL_SCALE = 6; // Mayor precisión para operaciones fraccionarias internas
    
    public Money {
        Objects.requireNonNull(amount);
        Objects.requireNonNull(currency);
    }
    
    public Money add(Money other) {
        checkSameCurrency(other);
        return new Money(this.amount.add(other.amount), currency);
    }
    
    public Money subtract(Money other) {
        checkSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), currency);
    }
    
    // Implementación obligatoria de RoundingMode.HALF_EVEN (Redondeo del Banquero)
    public Money roundForStorage() {
        return new Money(this.amount.setScale(4, RoundingMode.HALF_EVEN), currency);
    }
    
    public boolean isZero() { 
        return this.amount.compareTo(BigDecimal.ZERO) == 0; 
    }
    
    private void checkSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Monedas distintas no permitidas en la operación");
        }
    }
}
```

### 2. El Agregado `JournalEntry` (Asiento Contable Inmutable)
Un asiento contable representa la transacción en firme y controla sus líneas (`JournalLine`).
*   **Invariante de Partida Doble**: La suma de los montos al **Debe** (Debit) debe ser exactamente igual a la suma de los montos al **Haber** (Credit).
*   **Inmutabilidad Real**: Un asiento contable publicado (asentado) no tiene estados editables en el libro mayor. Cualquier corrección obliga a registrar un contra-asiento de ajuste (Adjustment Entry).
*   **Validación de Período**: No se pueden registrar asientos en un año fiscal (`FinancialYear`) cerrado.
*   **Aislamiento de Borradores**: Las propuestas o borradores viven fuera del agregado principal en tablas de staging (`draft_journal_entries`). El agregado `JournalEntry` solo procesa transacciones que se asientan directamente de forma inmutable.

```java
public class JournalEntry {
    private final JournalEntryId id;
    private final List<JournalLine> lines;
    private final LocalDate date;
    private EntryStatus status;

    public void post(DoubleEntryValidationService validator) {
        if (status == EntryStatus.POSTED) {
            throw new IllegalStateException("El asiento ya está asentado");
        }
        validator.validateBalance(this.lines);
        this.status = EntryStatus.POSTED;
    }
}
```

---

## 5. Diseño de Base de Datos y Gestión de Concurrencia

Usaremos **PostgreSQL** por su cumplimiento ACID. El esquema de base de datos se optimizará para evitar operaciones recursivas lentas en el backend y fugas de multi-tenancy:

```
                  +-------------------+
                  |   AccountGroup    | <----+ Jerarquía indexada con LTREE
                  +-------------------+
                            | 1
                            |
                            | N
                  +-------------------+
                  |   LedgerAccount   |
                  +-------------------+
                            | 1
                            |
                            | N
+--------------+  |  +-------------------+
| JournalEntry | -|- |    JournalLine    |
+--------------+     +-------------------+
  (Inmutable)          (Detalle: amount,
                        debit_credit, 
                        reconciliation_date)
```

### Jerarquización del Plan de Cuentas con LTREE de PostgreSQL
*   **El Problema**: Las listas de adyacencia tradicionales (`parent_id`) requieren consultas recursivas `WITH RECURSIVE` en SQL para calcular balances de cuentas raíz (por ejemplo, sumar todo el "Activo"). Esto arruina los tiempos de respuesta.
*   **La Solución**: Usar la extensión nativa **LTREE** de PostgreSQL. El campo jerárquico se almacena como una ruta estructurada de etiquetas (ej. `1`, `1.1`, `1.1.1`).
*   **Rendimiento**: Para obtener el saldo de todo el "Activo" (código `1`) e hijos, basta con una consulta plana y un índice GIST:
    ```sql
    SELECT SUM(jl.amount) 
    FROM journal_lines jl
    JOIN ledger_accounts la ON jl.ledger_id = la.id
    JOIN account_groups ag ON la.group_id = ag.id
    WHERE ag.path <@ '1'; -- Obtiene todos los descendientes en milisegundos
    ```

### El Desafío de la Concurrencia (Race Conditions)
Si múltiples transacciones registran asientos sobre la misma cuenta (por ejemplo, la cuenta "Caja") al mismo tiempo, los cálculos del balance pueden sufrir condiciones de carrera.
*   **Decisión de Diseño**: La base de datos es puramente **insert-only** para el libro diario real. El balance de las cuentas del libro mayor se calculará en tiempo real utilizando consultas optimizadas con índices LTREE. No guardaremos saldos acumulados mutables en `ledger_accounts` para evitar cuellos de botella de bloqueo pesimista en inserciones de alto rendimiento. Para la conciliación de cuentas sensibles, se aplicará bloqueo pesimista (`SELECT FOR UPDATE`) únicamente sobre la fila de conciliación específica.

### Multi-tenancy Seguro con Row-Level Security (RLS)
*   **El Problema**: El aislamiento en la capa de software (Hibernate / filtros JPA) es propenso a errores humanos. Si un programador ejecuta un query nativo sin filtrar por `tenant_id`, se produce una brecha de fuga de datos multi-inquilino.
*   **La Solución**: Implementar **Row-Level Security (RLS)** directamente en PostgreSQL.
*   **Implementación**:
    1. Activar RLS en las tablas corporativas:
       ```sql
       ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
       CREATE POLICY tenant_isolation ON journal_entries
       FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);
       ```
    2. Spring Boot intercepta el JWT, extrae el `tenant_id` y al abrir la conexión JDBC ejecuta `SET LOCAL app.current_tenant = :tenantId`. La base de datos físicamente descarta cualquier registro fuera de ese tenant, independientemente de cómo esté redactado el query en Java. Esto provee un aislamiento lógico blindado.

---

## 6. Estrategia de Testing (TDD Riguroso)

Un portafolio senior de alta gama **debe** tener pruebas automatizadas ejemplares. Aquí no hay excusas para "después lo testeo".

1. **TDD en el Dominio (Pruebas Unitarias)**:
   *   Escribir las pruebas para `JournalEntry` y el valor `Money` antes de implementar el código.
   *   Asegurar que falle la creación de un asiento que no balancea (ej. Debit $100 y Credit $99.99).
   *   100% de cobertura en la lógica de negocio pura. No se requiere Spring Context, corren en < 1 segundo.

2. **Pruebas de Integración con Testcontainers**:
   *   No uses H2 para probar repositorios de PostgreSQL. H2 no se comporta igual en transacciones concurrentes ni soporta sintaxis avanzada.
   *   Usar **Testcontainers** para levantar una base de datos PostgreSQL real en Docker durante la fase de pruebas de integración (`@SpringBootTest` con `@Container`).
   *   Verificar que las transacciones fallen y hagan rollback si una línea de la base de datos tira error.

3. **Arquitectura Protegida con ArchUnit**:
   *   Crear tests arquitectónicos para asegurar que ningún desarrollador introduzca dependencias prohibidas (por ejemplo, que una clase del `Core Domain` importe algo de `Infrastructure` o `Spring`).
   ```java
   @Test
   void domainShouldNotDependOnInfrastructure() {
       classes().that().resideInAPackage("..domain..")
           .should().onlyDependOnClassesThat().resideInAnyPackage("..domain..", "java..")
           .check(importedClasses);
   }
   ```

---

## 7. Arquitectura del Frontend (Angular 18)

El frontend debe sentirse **premium, profesional y rápido**. Evitaremos layouts genéricos usando principios modernos de UX corporativa.

### Estructura de Carpetas basada en Características (Feature-Driven):
```
src/app/
 ├── core/              # Guardas, Interceptores, Servicios globales de Auth, API client
 ├── shared/            # Componentes reutilizables de UI (Botones, Inputs, Modales Glassmorphism)
 └── features/
      ├── dashboard/    # Gráficos de tendencias, métricas rápidas de ingresos/egresos
      ├── accounts/     # Árbol jerárquico interactivo del plan de cuentas (Chart of Accounts)
      ├── journal/      # Formulario dinámico de asientos (partida doble en vivo)
      └── reports/      # Visores y exportadores de Balance General y Estado de Resultados
```

### Patrón Contenedor-Presentacional (Smart & Dumb Components)
*   **Smart Components**: Se conectan a los servicios o Store de Angular para obtener y modificar datos (ej. `JournalEntryShellComponent`).
*   **Dumb Components**: Reciben datos vía `@Input()` y emiten eventos vía `@Output()`. Son 100% reutilizables y fáciles de testear en aislamiento (ej. `JournalLineRowComponent`).

### Estado Reactivo con Angular Signals:
*   Usar **Signals** para el estado local y reactividad de formularios de la UI.
*   En el registro de asientos, a medida que el usuario agrega filas de Débito y Crédito, un Signal derivado (`computed()`) calcula en tiempo real si el asiento balancea o no, deshabilitando el botón de "Asentar" en consecuencia. ¡Una UX súper fluida!

---

## 8. Especificaciones Técnicas y de Diseño Detalladas

### 8.1. Arquitectura de Información (Mapa del Sitio)

El frontend en Angular se estructurará bajo un esquema jerárquico y agrupado lógicamente por permisos de negocio, asegurando que la navegación corporativa sea limpia y fluida:

```
[Public Portal]
 ├── /login (Acceso de Usuarios)
 └── /onboarding (Asistente de registro de organización inicial)

[Authenticated Workspace] (Requiere JWT válido y TenantID activo)
 ├── /dashboard (Métricas contables y gráficas analíticas de liquidez)
 ├── /coa (Chart of Accounts - Gestor jerárquico del Plan de Cuentas)
 │    ├── /groups/new (Creación de agrupadores contables)
 │    └── /ledgers/new (Creación de cuentas de libro mayor)
 ├── /journal (Libro Diario General)
 │    ├── /list (Historial y búsqueda de asientos contables)
 │    └── /new (Formulario interactivo de partida doble con Signals)
 ├── /ledger (Buscador y visor de Libro Mayor por cuenta)
 ├── /reconciliation (Panel de conciliación bancaria - Split-screen)
 ├── /reports (Visor de estados financieros estructurados)
 │    ├── /trial-balance (Balance de Comprobación)
 │    ├── /balance-sheet (Balance General)
 │    └── /profit-loss (Estado de Resultados / Pérdidas y Ganancias)
 └── /settings (Configuración de Organización y Seguridad)
      ├── /profile (Datos de empresa y año fiscal activo)
      ├── /users (Gestión de usuarios y asignación de RBAC)
      └── /audit-logs (Historial inmutable de auditoría del sistema)
```

---

### 8.2. Mapeo del Viaje del Usuario (User Journey - Rutas Críticas)

#### Ruta 1: Registro y Asentado de un Asiento Contable (Diario General)
*   **Actor**: Contador (`ROLE_ACCOUNTANT`)
*   **Paso 1**: El usuario hace clic en "Nuevo Asiento" en la barra lateral.
*   **Paso 2**: El sistema muestra un formulario vacío. El usuario ingresa la fecha del asiento (el sistema valida que esté dentro del año fiscal activo) y la nota aclaratoria general.
*   **Paso 3**: El usuario agrega la primera línea (Débito): busca la cuenta "Banco de Crédito" en un selector con autocompletado y digita `$150.00`. El frontend actualiza el total Debe (`dr_total`) en un Signal de Angular.
*   **Paso 4**: El usuario agrega la segunda línea (Crédito): selecciona la cuenta "Ventas" y digita `$150.00`. El total Haber (`cr_total`) se actualiza. El Signal derivado `isBalanced` cambia a `true`, habilitando el botón "Asentar".
*   **Paso 5**: El usuario presiona "Asentar". La API valida la partida doble en milisegundos, inserta los registros en `journal_entries` y `journal_lines` de forma transaccional en PostgreSQL, escribe en el log de auditoría y redirige al listado.

#### Ruta 2: Carga de Extracto y Conciliación Bancaria Mensual
*   **Actor**: Contador (`ROLE_ACCOUNTANT`)
*   **Paso 1**: El usuario navega al módulo "Conciliación Bancaria".
*   **Paso 2**: Selecciona la cuenta contable de "Banco" correspondiente y sube un archivo CSV/OFX emitido por la entidad bancaria real.
*   **Paso 3**: La pantalla se divide en dos columnas (Split-screen): en la izquierda se listan los movimientos bancarios sin conciliar; en la derecha, las líneas de diario pendientes de reconciliación de esa cuenta.
*   **Paso 4**: El sistema ejecuta un motor de coincidencias básico en el backend y resalta los candidatos sugeridos con colores (verde: coincidencia exacta de monto y fecha; amarillo: coincidencia de monto con variación de fecha).
*   **Paso 5**: El contador revisa la sugerencia y hace clic en "Conciliar". La API aplica un bloqueo pesimista, guarda la fecha del banco en `reconciliation_date` dentro del registro contable y retira la transacción de la lista activa.

#### Ruta 3: Auditoría Externa y Exportación de Estados Financieros
*   **Actor**: Auditor (`ROLE_AUDITOR`)
*   **Paso 1**: El auditor inicia sesión y es redirigido automáticamente a la vista de lectura restringida (Dashboard y Reportes).
*   **Paso 2**: Va al módulo de "Reportes" -> "Balance General". Selecciona la fecha de corte y hace clic en "Generar".
*   **Paso 3**: El backend calcula los saldos acumulados de la jerarquía de cuentas, aplicando el tipo de saldo (Acreedor/Deudor) según el grupo de cuenta. El frontend renderiza el árbol estructurado.
*   **Paso 4**: El auditor inspecciona un saldo sospechoso y hace clic en él; el sistema abre un drawer lateral mostrando las transacciones detalladas del libro mayor asociadas a esa cuenta específica.
*   **Paso 5**: El auditor presiona "Exportar PDF". El backend genera un archivo inmutable firmado electrónicamente con el balance y registra el evento de descarga en el log inalterable de auditoría.

---

### 8.3. Arquitectura de Datos (Modelos y ERD)

A continuación se definen los esquemas de base de datos relacionales requeridos por el backend. Todas las tablas incluyen aislamiento lógico mediante `tenant_id`.

#### Tabla 1: `tenants` (Organizaciones / Inquilinos SaaS)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Identificador único de la organización. |
| `name` | VARCHAR(255) | NOT NULL | Nombre legal de la empresa. |
| `created_at` | TIMESTAMP | NOT NULL | Fecha y hora de creación de la cuenta. |

#### Tabla 2: `account_groups` (Grupos del Plan de Cuentas)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador del agrupador. |
| `tenant_id` | UUID | FOREIGN KEY -> `tenants(id)`, NOT NULL | Aislamiento por organización. |
| `path` | LTREE | NOT NULL | Ruta jerárquica de etiquetas indexada (ej. `1.1.2`). |
| `name` | VARCHAR(255) | NOT NULL | Nombre del grupo (ej. Activo Circulante). |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE por `tenant_id` | Código contable de estructuración (ej. `1.1`). |
| `affects_gross` | BOOLEAN | NOT NULL, DEFAULT FALSE | Indica si afecta al cálculo del margen bruto. |

#### Tabla 3: `ledger_accounts` (Cuentas de Libro Mayor)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador de la cuenta. |
| `tenant_id` | UUID | FOREIGN KEY -> `tenants(id)`, NOT NULL | Aislamiento por organización. |
| `group_id` | BIGINT | FOREIGN KEY -> `account_groups(id)`, NOT NULL | Grupo padre en la jerarquía. |
| `name` | VARCHAR(255) | NOT NULL | Nombre de la cuenta (ej. Caja Chica). |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE por `tenant_id` | Código de cuenta específico (ej. `1.1.001`). |
| `notes` | VARCHAR(500) | NULL | Notas adicionales de uso interno. |

#### Tabla 4: `journal_entries` (Cabeceras de Asientos Inmutables)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador del asiento contable. |
| `tenant_id` | UUID | FOREIGN KEY -> `tenants(id)`, NOT NULL | Aislamiento por organización. |
| `entry_type` | VARCHAR(20) | CHECK (RECEIPT, PAYMENT, JOURNAL, CONTRA) | Tipo de comprobante. |
| `number` | BIGINT | NOT NULL | Número correlativo secuencial. |
| `date` | DATE | NOT NULL | Fecha de registro fiscal del asiento. |
| `dr_total` | DECIMAL(25, 4) | NOT NULL | Suma total del Debe de las líneas asociadas. |
| `cr_total` | DECIMAL(25, 4) | NOT NULL | Suma total del Haber de las líneas asociadas. |
| `notes` | VARCHAR(500) | NOT NULL | Descripción o glosa general del asiento. |

> [!NOTE]
> Para mantener la inmutabilidad absoluta del libro diario, los borradores o propuestas de asientos no se registran en estas tablas. Se almacenan en tablas de staging separadas (`draft_journal_entries` y `draft_journal_lines`) que tienen la misma estructura relacional pero están excluidas de los cálculos de balances. Una vez aprobadas, se mueven de forma transaccional (INSERT + DELETE) al libro diario en firme.

#### Tabla 5: `journal_lines` (Detalle de Asientos - Insert Only)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único de la línea de diario. |
| `entry_id` | BIGINT | FOREIGN KEY -> `journal_entries(id)`, NOT NULL | Referencia al asiento contable inmutable. |
| `ledger_id` | BIGINT | FOREIGN KEY -> `ledger_accounts(id)`, NOT NULL | Cuenta afectada. |
| `amount` | DECIMAL(25, 4) | NOT NULL | Monto financiero de la línea. |
| `dc` | CHAR(1) | CHECK (`dc` IN ('D', 'C')), NOT NULL | Dirección: 'D' (Debe) o 'C' (Haber). |
| `reconciliation_date`| DATE | NULL | Fecha de conciliación con extracto. |
| `narration` | VARCHAR(500) | NOT NULL | Glosa particular para esta línea contable. |

#### Tabla 6: `financial_years` (Ejercicios Fiscales)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador de periodo. |
| `tenant_id` | UUID | FOREIGN KEY -> `tenants(id)`, NOT NULL | Aislamiento por organización. |
| `start_date` | DATE | NOT NULL | Fecha de inicio del ejercicio contable. |
| `end_date` | DATE | NOT NULL | Fecha de finalización del ejercicio contable. |
| `is_closed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Bloquea registros posteriores en este periodo. |

#### Tabla 7: `audit_logs` (Historial de Auditoría Inmutable)
| Columna | Tipo de Datos | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único del evento. |
| `tenant_id` | UUID | FOREIGN KEY -> `tenants(id)`, NOT NULL | Aislamiento por organización. |
| `date_time` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Momento exacto del suceso. |
| `user_id` | VARCHAR(100) | NOT NULL | Usuario o servicio que invocó la acción. |
| `action` | VARCHAR(255) | NOT NULL | Acción realizada (ej. POST_JOURNAL_ENTRY). |
| `url` | VARCHAR(255) | NOT NULL | API endpoint invocado. |
| `ip_address` | VARCHAR(45) | NOT NULL | Dirección IP del cliente. |
| `details` | TEXT | NOT NULL | JSON del payload o estado anterior/posterior. |

---

### 8.4. Superficie de la API (Endpoints e Integraciones)

La API REST del backend de **AequiVault** utiliza autenticación basada en **OAuth2/OIDC** y tokens **JWT**. El token debe inyectarse en el header `Authorization: Bearer <JWT>` de todas las solicitudes privadas y debe contener los claims de `tenant_id` y `roles`.

#### Tabla de Endpoints REST
| Método | Ruta API | Parámetros / Request Body | Response JSON | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | `{username, password}` | `{token, expires}` | Autentica al usuario y devuelve el JWT conteniendo el rol y el tenant_id. |
| `GET` | `/api/v1/accounts/coa` | - | `List<GroupDto>` | Recupera la estructura completa jerárquica del Plan de Cuentas. |
| `POST` | `/api/v1/accounts/groups` | `GroupCreateRequest` | `GroupDto` | Crea un nuevo agrupador de cuentas contables. |
| `POST` | `/api/v1/accounts/ledgers`| `LedgerCreateRequest` | `LedgerDto` | Crea una cuenta contable específica dentro de un grupo. |
| `POST` | `/api/v1/entries` | `JournalEntryRequest` | `JournalEntryResponse`| Registra un nuevo asiento contable con validación estricta de partida doble. |
| `GET` | `/api/v1/entries` | `page, size, startDate, endDate`| `Page<EntrySummary>` | Retorna el diario de asientos paginado y filtrado por fecha. |
| `POST` | `/api/v1/reconciliation/upload`| `MultipartFile` (CSV/OFX) | `ReconcileSummary` | Carga el extracto bancario para un ledger de banco y retorna las transacciones físicas. |
| `POST` | `/api/v1/reconciliation/match` | `{lineId, bankTransactionId}` | `Void` | Concilia una línea del libro diario con el movimiento bancario. |
| `GET` | `/api/v1/reports/trial-balance` | `startDate, endDate` | `TrialBalanceDto` | Genera y retorna los saldos para el Balance de Comprobación. |
| `GET` | `/api/v1/reports/balance-sheet` | `date` | `BalanceSheetDto` | Genera los saldos consolidados estructurados del Balance General. |

#### Integraciones de Terceros
1.  **Open Banking APIs (Plaid / Prometeo)**: Utilizado para la conexión opcional directa en tiempo real con las cuentas de banco corporativas y la automatización de la conciliación bancaria sin carga de archivos manual.
2.  **JasperReports / OpenPDF Service**: Motor integrado en el backend para la exportación y firma digital automática de reportes financieros oficiales en formato PDF.

---

### 8.5. Inventario de Componentes UI (Angular)

Para asegurar consistencia y velocidad de desarrollo, definimos un catálogo estructurado de componentes atómicos y moleculares en Angular:

#### Componentes Atómicos (Dumb / Reutilizables)
1.  **`BtnComponent`**: Botón de acción común. *Estados: Default, Hover, Active, Disabled, Loading.*
2.  **`InputTextComponent`**: Caja de entrada para texto. *Estados: Default, Focus, Error, Disabled.*
3.  **`InputAmountComponent`**: Entrada monetaria formateada a 4 decimales. *Estados: Default, Focus, Error, Disabled.*
4.  **`SelectAccountComponent`**: Selector desplegable buscador de cuentas. *Estados: Default, Focus, Loading, Active.*
5.  **`DatePickerComponent`**: Calendario para seleccionar fechas operativas. *Estados: Open, Selected, Disabled.*
6.  **`CheckboxComponent`**: Casilla para selecciones rápidas. *Estados: Unchecked, Checked, Indeterminate, Disabled.*
7.  **`ToggleSwitchComponent`**: Selector de encendido/apagado (ej. para reconciliación). *Estados: Off, On, Disabled.*
8.  **`BadgeStatusComponent`**: Etiqueta visual para estados del diario (Borrador/Asentado). *Estados: Info, Success, Warn.*
9.  **`SpinnerComponent`**: Animación de carga para procesos asíncronos. *Estados: Hidden, Visible.*
10. **`AlertBannerComponent`**: Banner superior para errores o notificaciones del sistema. *Estados: Error, Success, Info.*
11. **`TooltipDirective`**: Ayuda emergente al posicionar el cursor sobre conceptos contables. *Estados: Active, Inactive.*
12. **`BreadcrumbComponent`**: Navegador de jerarquía de pantallas. *Estados: Default, ActiveLink.*
13. **`TableHeaderCellComponent`**: Celda de encabezado de tabla ordenable. *Estados: Default, SortedAsc, SortedDesc.*
14. **`ProgressBarComponent`**: Barra de progreso para importaciones. *Estados: Default, Complete, Error.*
15. **`ColorPickerComponent`**: Selector de color para las etiquetas de diario. *Estados: Default, Open.*

#### Componentes Moleculares y Organismos (Smart / Contenedores de Estado)
16. **`SidebarComponent`**: Menú lateral principal de navegación del portal. *Estados: Expanded, Collapsed.*
17. **`NavbarComponent`**: Barra superior de usuario e identificación organizacional. *Estados: Default, Sticky.*
18. **`OrgSwitcherComponent`**: Desplegable para alternar de empresa activa (Multi-tenant). *Estados: Default, Open.*
19. **`CoaTreeNodeComponent`**: Nodo interactivo que dibuja la jerarquía del Plan de Cuentas. *Estados: Collapsed, Expanded, Selected.*
20. **`JournalLineRowComponent`**: Fila dinámica dentro del formulario de registro de asiento. *Estados: Valid, Invalid, FocusAmount.*
21. **`BalanceIndicatorComponent`**: Barra dinámica de balance Debe vs. Haber. *Estados: Balanced (Verde), Unbalanced (Rojo).*
22. **`ReconciliationCardComponent`**: Tarjeta que representa un movimiento del banco físico. *Estados: Unmatched, PendingMatch, Reconciled.*
23. **`AuditLogRowComponent`**: Fila de tabla estilizada para los logs inmutables. *Estados: Default, ExpandedDetails.*
24. **`ReportGridComponent`**: Tabla jerárquica compleja de cuentas y saldos consolidados. *Estados: Loading, Empty, Rendered.*
25. **`ChartCardComponent`**: Gráfico de barras o líneas analítico de la salud financiera. *Estados: Loading, Rendered.*
26. **`ExportDropdownComponent`**: Botón desplegable con opciones de exportación (Excel, PDF). *Estados: Default, Open.*
27. **`PeriodLockDialogComponent`**: Modal de confirmación para el cierre fiscal de un año o mes. *Estados: Open, Loading, Closed.*
28. **`AuthCardComponent`**: Tarjeta centradora del formulario de autenticación segura. *Estados: Default, Submitting.*
29. **`TransactionHistoryDrawerComponent`**: Panel lateral emergente con el desglose de transacciones históricas de una cuenta. *Estados: Open, Closed.*
30. **`DynamicFilterBarComponent`**: Barra horizontal que agrupa inputs de fecha, tags y tipo de diario. *Estados: Default, Reset.*
31. **`ShortcutPanelComponent`**: Widget de acceso rápido para creación de asientos comunes. *Estados: Default, Minimized.*
32. **`AuditDetailsModalComponent`**: Modal emergente que expone el diff JSON de un log de auditoría. *Estados: Open, Closed.*

---

### 8.6. Planos de Páginas (Blueprints Estructurales)

A continuación se detalla la maquetación a nivel wireframe de las vistas críticas de la aplicación:

#### 1. Plano del Dashboard Principal
```
+-----------------------------------------------------------------------+
|  NAVBAR (Nombre Inquilino | Selector Org | Notificaciones | UserProfile) |
+-----------------------------------------------------------------------+
|  SIDEBAR  |  TITULO: Panel General Financiero           [Filtro Fecha] |
|           |                                                           |
| (COA,     |  +-------------------+ +-------------------+ +----------+ |
|  Diario,  |  | Total Activo      | | Total Pasivo      | | Capital  | |
|  Bancos,  |  | $154,200.00 (Dr)  | | $54,100.00 (Cr)   | | $100,100 | |
|  Reportes,|  +-------------------+ +-------------------+ +----------+ |
|  Config)  |                                                           |
|           |  +------------------------------------------------------+ |
|           |  | GRÁFICA DE EVOLUCIÓN DE LIQUIDEZ Y CAJA               | |
|           |  | (Chart de líneas temporal de saldos acumulados)      | |
|           |  +------------------------------------------------------+ |
|           |  +--------------------------+ +-------------------------+ |
|           |  | Últimos Asientos Diario  | | Alertas de Auditoría    | |
|           |  | (Mini-tabla con estados) | | (Logs de cambios)       | |
|           |  +--------------------------+ +-------------------------+ |
+-----------+-----------------------------------------------------------+
```

#### 2. Plano del Gestor del Plan de Cuentas (Chart of Accounts)
```
+-----------------------------------------------------------------------+
|  NAVBAR                                                               |
+-----------------------------------------------------------------------+
|  SIDEBAR  |  TITULO: Plan de Cuentas Contable       [+ Grupo] [+ Cuenta]|
|           |  Buscar Cuenta: [ Input Text... ]                         |
|           |  +------------------------------------------------------+ |
|           |  | [-] 1. Activo                                        | |
|           |  |    [+] 1.1. Activo Circulante                        | |
|           |  |        [*] 1.1.01. Caja Chica (Saldo: $500 Dr)       | |
|           |  |        [*] 1.1.02. Banco de Crédito (Saldo: $25K Dr) | |
|           |  |    [+] 1.2. Activo No Circulante                     | |
|           |  | [-] 2. Pasivo                                        | |
|           |  |    [+] 2.1. Pasivo a Corto Plazo                     | |
|           |  |        [*] 2.1.01. Proveedores (Saldo: $1,200 Cr)    | |
|           |  +------------------------------------------------------+ |
+-----------+-----------------------------------------------------------+
```

#### 3. Plano del Formulario Dinámico de Asientos Contables
```
+-----------------------------------------------------------------------+
|  NAVBAR                                                               |
+-----------------------------------------------------------------------+
|  SIDEBAR  |  TITULO: Registrar Asiento Diario                  [Volver]|
|           |  Fecha: [DatePicker] Tipo: [Select] Número: [# 0043]       |
|           |  Concepto General: [ Input Text...                     ]   |
|           |                                                           |
|           |  +------------------------------------------------------+ |
|           |  | Cuenta Contable      | Debe       | Haber      | Glosa| |
|           |  +----------------------+------------+------------+------+ |
|           |  | 1.1.02. Banco Cred   | $150.00    |            | Pago | |
|           |  | 2.1.01. Proveedores  |            | $150.00    | Fact | |
|           |  +----------------------+------------+------------+------+ |
|           |  | [+ Agregar Línea]                                    | |
|           |  +------------------------------------------------------+ |
|           |  | TOTALES              | $150.00    | $150.00    | OK   | |
|           |  +------------------------------------------------------+ |
|           |  | Estado Balance: [ Balances Coincidentes ]  [Asentar] | |
|           |  +------------------------------------------------------+ |
+-----------+-----------------------------------------------------------+
```

#### 4. Plano del Panel de Conciliación Bancaria (Split-Screen)
```
+-----------------------------------------------------------------------+
|  NAVBAR                                                               |
+-----------------------------------------------------------------------+
|  SIDEBAR  |  TITULO: Conciliación Bancaria - Cuenta: Banco de Crédito |
|           |  [ Cargar Extracto Bancario CSV ]                         |
|           |                                                           |
|           |  +-------------------------+ +--------------------------+ |
|           |  | Extracto de Banco       | | Libro Diario Ledger      | |
|           |  +-------------------------+ +--------------------------+ |
|           |  | [*] 20/05 - Desc: Fact  | | [ ] 19/05 - Desc: Pago   | |
|           |  |     Monto: -$150.00     | |     Monto: -$150.00      | |
|           |  |     (Sugerencia Exacta) | |     (Línea Diario #43)   | |
|           |  | ----------------------- | | ------------------------ | |
|           |  | [*] 21/05 - Desc: Dep   | | [ ] 21/05 - Desc: Cobro  | |
|           |  |     Monto: +$2,300.00   | |     Monto: +$2,300.00    | |
|           |  +-------------------------+ +--------------------------+ |
|           |  |                                  [Confirmar Match]   | |
|           |  +------------------------------------------------------+ |
+-----------+-----------------------------------------------------------+
```

---

### 8.7. Stack Tecnológico Recomendado y Despliegue

Para un producto de nivel empresarial, se selecciona una infraestructura moderna centrada en la seguridad de los datos contables y la inmutabilidad:

```
[Cliente Angular 18] ──(HTTPS/REST)──> [Spring Boot 3.3 API / Java 21]
                                                    │
                                                    ├──> [PostgreSQL 16 DB]
                                                    └──> [AWS S3 (Ficheros/PDFs)]
```

*   **Frontend**: Angular 18.x utilizando **Signals** para la gestión reactiva de formularios y el estado del cliente en componentes autónomos (Standalone Components). Tailwind CSS para un diseño limpio y moderno con sombras y bordes suaves (Glassmorphic Cards).
*   **Backend**: Java 21 (LTS) con Spring Boot 3.3.x, Spring Data JPA para la abstracción de base de datos, Spring Security + OAuth2 Resource Server para la validación de JWT, y **ArchUnit** para protección estricta de la arquitectura limpia de capas.
*   **Base de Datos**: PostgreSQL 16+. Soporta transaccionalidad estricta ACID y tipos de datos numéricos con precisión decimal exacta (`numeric(25, 4)`).
*   **Gestor de Migraciones**: **Liquibase** integrado en el ciclo de vida del backend para gestionar la base de datos de manera controlada y versionada.
*   **Marketing CMS**: El motor financiero transaccional no requiere un CMS por motivos de seguridad. Para el sitio web público comercial de la plataforma SaaS, se recomienda utilizar un CMS Headless moderno (como **Strapi** o **Contentful**) integrado en una Landing Page estática construida en Next.js desplegada en Vercel para optimizar el posicionamiento SEO.
*   **Despliegue y Hosting**:
    *   *Ambiente local*: Docker Compose orquestando PostgreSQL y el contenedor del backend para desarrollo rápido.
    *   *Nube*: AWS ECS Fargate (servicios de contenedores serverless para el backend) y AWS RDS PostgreSQL (base de datos relacional administrada con backups automáticos). El frontend Angular se compila como archivos estáticos optimizados y se aloja en AWS S3 distribuidos por CloudFront (CDN global).
*   **Pipeline CI/CD**: **GitHub Actions**. En cada Pull Request o Push a `main`, el pipeline ejecuta los tests unitarios con JaCoCo (mínimo 80% de cobertura), valida la arquitectura con ArchUnit, ejecuta los tests de integración con **Testcontainers** contra PostgreSQL real en Docker, y compila y despliega la aplicación de forma automática a AWS ECS (para el backend) y S3/CloudFront (para el frontend).

---

### 8.8. Benchmarks de Rendimiento y Core Web Vitals

La aplicación contable debe cumplir estrictos umbrales de rendimiento, especialmente al procesar hojas contables masivas y balances pesados:

#### Métricas de Interfaz (Core Web Vitals - Umbrales de Aceptación)
*   **Largest Contentful Paint (LCP)**: `< 1.5 segundos` (Tiempo en mostrar el primer reporte contable estructurado en el Dashboard).
*   **Interaction to Next Paint (INP)**: `< 100 milisegundos` (Respuesta de la interfaz al agregar una fila de diario o alternar ramas del plan de cuentas).
*   **Cumulative Layout Shift (CLS)**: `< 0.05` (Evitar cualquier desplazamiento de texto o componentes mientras se cargan los saldos financieros en tiempo real).
*   **First Input Delay (FID)**: `< 50 milisegundos` (Respuesta de clics en la barra de navegación lateral).

#### Métricas de API (Tiempos de Respuesta Máximos)
*   **Validación y Registro de Asiento (`POST /api/v1/entries`)**: `< 200 milisegundos` (Incluye verificación de partida doble y log de auditoría).
*   **Carga de Balance General Consolidado (`GET /api/v1/reports/balance-sheet`)**: `< 400 milisegundos` (Consulta a la base de datos relacional jerárquica con agregados de saldo y cálculo de conversión).
*   **Cálculo de Conciliación Bancaria automática**: `< 500 milisegundos` para archivos de hasta 1,000 registros.

---

## 9. Plan de Ejecución Paso a Paso (Roadmap del Portafolio)

Para crear esto de forma ordenada y profesional en Git, seguiremos este flujo de trabajo:

```
[Fase 1: Configuración e Init] -> [Fase 2: TDD Dominio Backend] -> [Fase 3: Persistencia e Infra] 
              |
              v
[Fase 4: Angular Scaffold & UI] -> [Fase 5: Integración y Reportes] -> [Fase 6: CI/CD y Documentación]
```

### Fase 1: Inicialización y Esqueleto
*   Inicializar el repositorio monorepo (`/backend` y `/frontend`).
*   Configurar base de datos PostgreSQL con Docker Compose.
*   Configurar el pipeline básico de GitHub Actions para correr tests en cada Push.

### Fase 2: Desarrollo del Dominio (TDD)
*   Implementar el value object `Money`, entidades de dominio `LedgerAccount`, `AccountGroup` y `JournalEntry`.
*   Escribir las pruebas unitarias que garanticen el balance contable y la lógica de periodos fiscales.

### Fase 3: Capa de Persistencia y Casos de Uso
*   Configurar Spring Data JPA y Liquibase para las migraciones del esquema.
*   Implementar los casos de uso (`PostJournalEntry`, `GetTrialBalance`).
*   Configurar seguridad (Spring Security, JWT, endpoints asegurados por rol de Auditor / Contador).
*   Validar todo con Testcontainers.

### Fase 4: Esqueleto Angular y Panel de Control de Cuentas
*   Crear la app Angular 18, configurar Tailwind CSS.
*   Diseñar el componente visual del "Árbol de Cuentas" utilizando la jerarquía cargada desde la API.
*   Crear el formulario reactivo de partida doble con Signals.

### Fase 5: Reportes y Conciliación
*   Implementar lógica para generar Balance de Comprobación y Balance General.
*   Agregar funcionalidad para exportar a PDF (usando JasperReports o una librería ligera en Java como OpenPDF).
*   Crear la pantalla de conciliación bancaria para marcar las transacciones contra el extracto físico del banco.

### Fase 6: Pulido y Documentación (Crucial para el Portafolio)
*   **README Espectacular**: Explicar las decisiones de arquitectura (Hexagonal), el porqué de `Money`, cómo correrlo en un comando con `docker-compose up`, y diagramas Mermaid.
*   Publicar un despliegue demo funcional (ej. en Render, Railway o Supabase) para que los reclutadores puedan entrar e interactuar.

---

## 10. Módulos Adicionales para un Entorno Corporativo (Enterprise-Grade)

Para que un motor contable por partida doble como **AequiVault** deje de ser solo un "libro diario" y se convierta en un ERP de contabilidad empresarial completo y listo para producción, se deben incorporar los siguientes módulos críticos de negocio:

### 1. Facturación Electrónica e Impuestos
*   **Integración Fiscal**: Conexión con los servicios fiscales de cada país (ej. SAT en México, AFIP en Argentina, DIAN en Colombia, SII en Chile) para la emisión y validación de facturas electrónicas.
*   **Motor de Impuestos (Tax Engine)**: Cálculo automático del IVA (VAT), impuestos locales y retenciones/percepciones al registrar compras o ventas. Generación automática del "Libro IVA" y archivos de exportación fiscal.

### 2. Auxiliares de Clientes y Proveedores (AR / AP)
*   **Sub-cuentas (Subsidiary Ledgers)**: Desglose de saldos pendientes por cliente y por proveedor sin saturar el plan de cuentas principal.
*   **Conciliación de Comprobantes**: Emparejamiento inteligente de cobros (Receipts) y pagos (Payments) contra facturas pendientes de cobro/pago para calcular la antigüedad de la deuda (Aging Reports).

### 3. Contabilidad Multidimensional (Centros de Costo y Sucursales)
*   **Dimensiones de Negocio**: Clasificación de cada línea de asiento contable (`JournalLine`) asociándola a un **Centro de Costos** (ej. Departamento de IT, Marketing) o una **Sucursal** (ej. Sucursal Norte, Sucursal Sur). Esto permite generar estados financieros consolidados y desglosados por área.

### 4. Cierre Fiscal Automático (Fiscal Rollforward)
*   **Asiento de Refundición**: Proceso automatizado que cierra las cuentas de resultados (Ingresos y Egresos) llevando su saldo neto a cero contra la cuenta patrimonial de "Resultado del Ejercicio" (Retained Earnings).
*   **Asiento de Apertura**: Generación automática del asiento inicial para el nuevo ejercicio contable, arrastrando los saldos finales de las cuentas patrimoniales (Activo, Pasivo y Patrimonio).

### 5. Conciliación Bancaria Automatizada
*   **Ingesta de Extractos**: Soporte para cargar archivos bancarios estandarizados (CSV, OFX, MT940) o integración directa con APIs financieras de Open Banking.
*   **Algoritmo de Matching**: Motor de sugerencias para emparejar automáticamente transacciones del banco con los movimientos contables registrados basados en rango de fechas, montos y descripciones.

### 6. Control de Períodos y Auditoría Rigurosa (SOX Compliance)
*   **Bloqueo de Períodos**: Capacidad de congelar meses o trimestres contables para evitar alteraciones retroactivas una vez presentados los balances.
*   **Log de Cambios Inmutable**: Registro criptográfico o de almacenamiento en frío (Read-Once-Write-Many) de cualquier intento de alterar configuraciones críticas del sistema.

---

## 11. Conclusión y Próximos Pasos

Este plan de proyecto no es un juguete; es un **sistema transaccional robusto de grado financiero**. Si implementás este nivel de detalle técnico, cualquier empresa que busque un perfil Senior de backend/fullstack va a notar la diferencia inmediatamente con el resto de candidatos de tu portfolio.

¿Qué te parece la propuesta? ¿Querés que hagamos algún ajuste en los tradeoffs de base de datos o en la estructura de capas antes de empezar a armar las bases del código? 

*Ponete las pilas, hermano, que esto va a quedar de locos.*
