# Walkthrough: Capa REST API, Validación, RLS y Frontend Reactivo (Hito 1 y Hito 2)

Este documento resume la implementación completa y la validación de la arquitectura de AequiVault, cubriendo tanto la API transaccional multi-inquilino (Hito 1) como la Interfaz Gráfica Reactiva en Angular 18 (Hito 2).

---

## Hito 1: Backend API, Validación, ProblemDetail y RLS

Desarrollamos e integrarnos la capa REST API para AequiVault en Spring Boot, protegiendo las reglas de negocio y respetando el aislamiento multi-inquilino físico de PostgreSQL (RLS).

### Cambios en Backend
1. **Modelado del Dominio**:
   * [LedgerAccount.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/domain/model/LedgerAccount.java): Modelo puro sin anotaciones de persistencia ni Spring.
   * [LedgerAccountRepositoryImpl.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/persistence/repository/LedgerAccountRepositoryImpl.java): Mapeador infra a dominio usando MapStruct.
2. **Contratos (DTOs)**:
   * [JournalEntryRequest.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/dto/JournalEntryRequest.java): Payload de entrada usando una lista plana con indicación del tipo de partida (`DEBIT` o `CREDIT`).
3. **Controladores REST**:
   * [LedgerAccountController.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/LedgerAccountController.java): Exposición del catálogo de cuentas (COA) bajo restricciones RLS.
   * [JournalEntryController.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/JournalEntryController.java): Registro de borradores (`DRAFT`) o asientos firmes (`POSTED`).
4. **Manejo Global de Errores (RFC 7807)**:
   * [GlobalExceptionHandler.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/main/java/com/aequivault/infrastructure/web/exception/GlobalExceptionHandler.java): Mapeo de validaciones de negocio a `422 Unprocessable Entity` y errores sintácticos a `400 Bad Request`.

---

## Hito 2: Interfaz Gráfica y Reactividad (Angular 18 + Signals)

Diseñamos e implementamos el módulo frontend en Angular 18, estructurando la lógica de UI mediante el patrón **Smart/Dumb** y garantizando un diseño premium con CSS nativo.

### Cambios en Frontend
1. **Diseño y Estética Premium**:
   * [styles.scss](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/styles.scss): Estilos globales aplicando variables CSS para **Glassmorphism**, tipografía **Outfit** de Google Fonts, scrollbars personalizados y un esquema de colores de nivel financiero (Verde Esmeralda para estados balanceados y Rojo Coral para alertas).
2. **Cerebro Reactivo con Signals (Evitando RxJS en UI)**:
   * [journal-entry-state.service.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/core/services/journal-entry-state.service.ts): Servicio de estado local que expone las señales de cabecera y el array reactivo de líneas. La reactividad se propaga por referencia de forma inmutable (`[...current, newLine]`).
   * **Cálculos Matemáticos**: Mediante `computed()` se derivan dinámicamente `debitSum()`, `creditSum()`, y `difference()` (este último redondeado a 4 decimales para evitar problemas de coma flotante de JS), controlando que el botón de envío se habilite solo cuando `canSubmit()` sea válido según el estado.
3. **Andamiaje de Componentes (Dumb/Presentational)**:
   * [journal-line-table.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/components/journal-line-table/journal-line-table.component.ts): Renderiza la grilla dinámica. Implementa el selector HTML nativo estilizado en CSS, lo que encapsula la selección de cuentas (COA) permitiendo migrar a autocompletadores más complejos en el futuro sin modificar la arquitectura.
   * [journal-entry-summary.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/components/journal-entry-summary/journal-entry-summary.component.ts): Muestra acumuladores en tiempo real y el banner adaptativo de balanceo.
   * [journal-entry-form.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/components/journal-entry-form/journal-entry-form.component.ts): Encabeza los datos generales del asiento y aloja de forma adaptativa el selector de divisa y número de asiento.
4. **Contenedor Smart e Integración HTTP**:
   * [journal-entry-container.component.ts](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/frontend/src/app/features/journal/journal-entry-container/journal-entry-container.component.ts): Orquesta la carga de cuentas y el envío del asiento.
   * **Simulación de RLS**: Integra un selector de inquilino activo (`activeTenantId()`) que al cambiar de contexto actualiza el COA desde el backend inyectando el encabezado `X-Tenant-ID` en cada llamada HTTP. Esto demuestra físicamente el aislamiento RLS del backend.
   * **Mapeo de RFC 7807**: Interpreta payloads de error `ProblemDetail`, desplegando banners de alerta detallando campos con problemas sintácticos u objeciones del dominio contable.

---

## Verificación y Pruebas Automatizadas

Se ha expandido la suite de pruebas del frontend logrando verificar de punta a punta la estabilidad de la lógica de interfaz de usuario.

### Tests Unitarios del Frontend
* **`JournalEntryStateService`**: Valida las sumas automáticas, balanceo contable, inmutabilidad de adiciones/remociones y habilitación correcta del `canSubmit` según si el asiento está en estado `DRAFT` o `POSTED`.
* **`JournalLineTableComponent`**: Comprueba la correcta renderización de la cuadrícula interactiva y la emisión correspondiente de eventos de modificación (`updateLine`), adición (`addLine`) y eliminación (`removeLine`).
* **`JournalEntrySummaryComponent`**: Verifica el formateo correcto de montos monetarios en la UI y la visibilidad de los banners de estado ("Asiento Balanceado" vs "Asiento Desbalanceado").
* **`JournalEntryFormComponent`**: Valida el enlazado asincrónico bidireccional (`fakeAsync` / `tick`) de los inputs de metadata y la visibilidad condicional del campo `entryNumber`.
* **`JournalEntryContainerComponent`**: Simula el consumo de servicios HTTP usando dobles de prueba (`jasmine.createSpyObj`), validando la inyección de tenant, reset del formulario al cambiar de inquilino y control de alertas.

### Resultados de la Suite de Pruebas de Frontend
Ejecutando `npm test -- --watch=false --browsers=ChromeHeadless` logramos **27/27 tests aprobados con éxito**:
```text
Chrome Headless 148.0.0.0 (Linux 0.0.0): Connected on socket baLs9b_rNaN69S6wAAAB with id 40925541
Chrome Headless 148.0.0.0 (Linux 0.0.0): Executed 27 of 27 SUCCESS (2.006 secs / 1.782 secs)
TOTAL: 27 SUCCESS
```

Ambos hitos se encuentran plenamente validados, con el motor contable RLS del backend conectado e interactuando de forma reactiva, robusta y segura con el frontend en Angular 18.

---

## Hito 3: Plan de Cuentas Jerárquico (LTREE, Delete Guard y Recursividad)

En esta fase, construimos un catálogo de cuentas (Chart of Accounts) dinámico y jerárquico que permite a las empresas estructurar sus cuentas contables en árbol. Optamos por la **Alternativa A (Foco en el Contador y el Negocio)** para demostrar maestría en estructuras de datos relacionales complejas y reactividad recursiva.

### 1. Capa de Datos y Persistencia (PostgreSQL LTREE)
* **El Path Jerárquico**: Utilizamos la extensión nativa `LTREE` de PostgreSQL para almacenar la jerarquía. El path completo (ej. `1.1.01`) se construye concatenando el path del padre con el código del hijo.
* **Validación Alfanumérica**: Añadimos una validación en el constructor de dominio `AccountGroup` que restringe el código de cuenta a caracteres exclusivamente alfanuméricos (`^[a-zA-Z0-9]+$`). Esto previene caracteres especiales (como espacios o guiones medios) que romperían la sintaxis del tipo `LTREE` en PostgreSQL.
* **Aislamiento RLS**: Todas las operaciones jerárquicas están aisladas físicamente por inquilino (`tenant_id`), asegurando que ninguna empresa pueda consultar o modificar grupos de otra corporación.

### 2. Delete Guard (Regla de Eliminación Segura)
Para evitar cuentas o subgrupos huérfanos, implementamos una regla estricta de eliminación:
* Se ejecuta una consulta nativa de Postgres (`path <@ :parentPath`) para comprobar si el grupo tiene subgrupos descendientes.
* Se valida la existencia de cuentas contables asignadas al grupo en cuestión.
* Si el grupo posee dependientes, la base de datos y la capa de negocio abortan la transacción lanzando un error del dominio que es formateado por el controlador como un `422 Unprocessable Entity` (RFC 7807).

### 3. Frontend Angular 18 (Árbol Recursivo Reactivo)
* **Reconstrucción en Memoria O(N)**: En lugar de procesar y anidar el árbol recursivamente en el backend (lo cual implicaría consultas costosas u sobrecarga en el servidor Java), el frontend consume los grupos y cuentas en una lista plana y los estructura en memoria en un solo pase de complejidad temporal lineal $O(N)$.
* **Control Flow Directives**: Aprovechamos el control de flujo nativo de Angular 18 (`@if`, `@for` y `@track`) para renderizar dinámicamente los subgrupos y las cuentas subordinadas.
* **Componente Dumb Recursivo**: El componente `<app-coa-tree-node>` se llama a sí mismo de manera recursiva para renderizar niveles infinitos de profundidad del catálogo.
* **Navegación por Pestañas**: Añadimos un menú premium de navegación de pestañas en `<app-journal-entry-container>` que permite alternar fluidamente entre el registro de asientos diarios y la gestión del Plan de Cuentas (COA) con transiciones animadas y un diseño moderno de cristal templado (**Glassmorphism**).

---

## Verificación de Calidad y Pruebas Automatizadas (Hito 3)

### Pruebas del Backend (Spring Boot + JUnit 5)
Escribimos tests de integración especializados en [AccountGroupControllerTest.java](file:///home/carlos/Proyectos/siste%20contador-libro%20mayor/aequivault/backend/src/test/java/com/aequivault/infrastructure/web/AccountGroupControllerTest.java) que garantizan el correcto funcionamiento de:
1. La inserción jerárquica con `LTREE`.
2. Las restricciones del Delete Guard cuando un grupo tiene hijos o cuentas asignadas.
3. El aislamiento RLS inyectando el header `X-Tenant-ID`.

Ejecutamos la suite con `./mvnw test` logrando **27/27 tests en verde**:
```text
[INFO] Results:
[INFO]
[INFO] Tests run: 27, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Tests Unitarios del Frontend (Jasmine + Karma)
Modificamos el spec de `JournalEntryContainerComponent` para incluir spies en las operaciones de grupos y agregamos un test para comprobar que la navegación a la pestaña "Plan de Cuentas" cargue los grupos correctamente.

Ejecutamos `npm test` logrando **28/28 tests aprobados exitosamente**:
```text
TOTAL: 28 SUCCESS
```
