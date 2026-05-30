# 🏛️ AequiVault: Motor de Contabilidad de Partida Doble API-First

🌍 [English](README.md) | 🇪🇸 [Español](README.es.md) | 🇧🇷 [Português](README.pt-BR.md)

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg?style=flat-square&logo=angular)](https://angular.dev/)
[![Liquibase](https://img.shields.io/badge/Liquibase-Checked-blueviolet.svg?style=flat-square&logo=liquibase)](https://www.liquibase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**AequiVault** es un motor de contabilidad de partida doble B2B de nivel empresarial diseñado bajo una arquitectura API-first y un modelo *Open Core*. Resuelve la complejidad de integrar lógica financiera inmutable en plataformas SaaS modernas de forma descentralizada sin depender de sistemas ERP costosos, lentos y monolíticos. Garantiza que todas las transacciones estén balanceadas y sean auditables bajo la conformidad SOX, al mismo tiempo que aísla físicamente los datos de los inquilinos (tenants) utilizando variables de sesión criptográficas a nivel de base de datos.

---

## 📸 Muestra de Interfaz de Usuario

<div align="center">
  <h3>✍️ Publicación de Asientos Diarios (Reactiva con Angular Signals)</h3>
  <img src="docs/images/aequivault_journal_entry.png" alt="Formulario de Asiento Diario" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
  
  <br/><br/>
  
  <h3>🌳 Plan de Cuentas Jerárquico - COA (PostgreSQL LTREE y Árbol Recursivo)</h3>
  <img src="docs/images/aequivault_chart_of_accounts.png" alt="Plan de Cuentas Jerárquico" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />

  <br/><br/>
  
  <h3>🛠️ Documentación Interactiva de la API (Muestra de OpenAPI / Swagger UI)</h3>
  <img src="docs/images/aequivault_swagger_showcase.png" alt="Documentación Swagger UI" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
</div>

---

## 🏗️ Decisiones de Arquitectura y Diseño

Este proyecto ejemplifica las mejores prácticas en ingeniería de software a gran escala y diseño de sistemas distribuidos:

### 🔒 Inmutabilidad del Dominio (Arquitectura Limpia y CQRS)
*   La contabilidad de partida doble es un invariante de negocio sagrado. Los asientos contables confirmados (`POSTED`) no permiten modificaciones (`UPDATES`) ni eliminaciones (`DELETES`). Cualquier corrección financiera debe realizarse mediante un asiento de ajuste o contrasiento.
*   El núcleo del negocio se modela en Java puro sin dependencias de frameworks externos (Arquitectura Limpia).
*   Se implementa un patrón **CQRS Pragmático**: las escrituras validan reglas de negocio complejas en el dominio, mientras que las lecturas (Dashboard, Reportes) se ejecutan sobre proyecciones optimizadas para evitar la presión del Recolector de Basura (GC) de la JVM.

### 🌳 Plan de Cuentas Jerárquico de Alta Velocidad (PostgreSQL `LTREE`)
*   Para evitar costosas consultas recursivas (`WITH RECURSIVE`) en la capa SQL, el Plan de Cuentas (COA) se almacena utilizando el tipo de dato nativo **`LTREE`** de PostgreSQL e indexación **GiST**. Esto permite al sistema consolidar saldos de ramas completas con complejidad constante $O(1)$ a nivel de aplicación.

### 📊 Saldo Continuo y Balance de Comprobación (Memoria JVM $O(1)$)
*   Los saldos continuos del Libro Mayor y los agregados del Balance de Comprobación se delegan a PostgreSQL mediante **funciones de ventana** (`SUM() OVER(...)`) y consolidaciones acumulativas. Esto elimina la necesidad de cargar miles de registros en la memoria de la JVM, garantizando un tiempo de ejecución constante independientemente del tamaño de la base de datos.

### 🛡️ Aislamiento Criptográfico Multitenant (PostgreSQL RLS)
*   El aislamiento lógico de inquilinos (multi-tenancy) **no** se confía a interceptores a nivel de ORM (como `@Filter` de Hibernate), los cuales son altamente propensos a fugas accidentales de datos.
*   En su lugar, el backend decodifica el **JWT** (firmado criptográficamente usando JJWT 0.12.6 durante el inicio de sesión del usuario) para extraer el `tenantId`.
*   Este identificador se propaga al hilo transaccional y se inyecta directamente como una variable de sesión dentro de la conexión JDBC de PostgreSQL. El motor de la base de datos aplica **Row-Level Security (RLS)** nativo, aislando físicamente los datos contables a nivel de consulta.
*   Todas las transacciones del pool de conexiones están protegidas contra fugas de `ThreadLocal` mediante bloques estrictos `try-finally`.

### 🚀 Patrón de Inicialización del Sistema (Setup Bootstrapping)
*   El sistema cuenta con un flujo de inicialización seguro. Si la base de datos está vacía, el backend bloquea todas las APIs públicas excepto los endpoints de configuración para crear el primer inquilino y su correspondiente usuario `SUPER_ADMIN`. Las inicializaciones duplicadas se bloquean y lanzan errores HTTP 422 deterministas.

### 🔔 Notificaciones Colaborativas Desacopladas (Spring Events)
*   Integra `ApplicationEventPublisher` de Spring Boot para difundir notificaciones de forma asíncrona ante acciones de escritura (como la publicación de asientos o la creación de cuentas).
*   Los escuchadores de eventos procesan y persisten las notificaciones bajo las políticas RLS del inquilino, las cuales se sirven instantáneamente al frontend de Angular mediante una consulta periódica reactiva con Signals.

### 👥 RBAC Granular, Soft-Delete y Auditoría con Fricción Positiva
*   Implementa un esquema personalizado de Control de Acceso Basado en Roles (RBAC) que permite el mapeo granular de permisos.
*   Aplica una política estricta de **soft-delete** (desactivando usuarios al estado `INACTIVE` en lugar de eliminarlos físicamente).
*   Emplea **fricción positiva** para acciones críticas de seguridad: desactivar/reactivar usuarios exige que el administrador ingrese su contraseña actual (validada mediante `PasswordEncoder.matches()`) y un motivo de justificación, registrando logs inmutables en `user_status_audit` protegidos por RLS.

---

## 🎨 Interfaz de Usuario Moderna (Angular 18)

La interfaz de usuario de AequiVault se construye bajo estrictos estándares corporativos de rendimiento y diseño:

*   **Signals y Reactividad Síncrona:** El estado de la interfaz de usuario local y los descuadres de partida doble se computan mediante Angular Signals nativos, reduciendo la sobrecarga de RxJS asíncrono y garantizando ciclos de renderizado óptimos.
*   **Standalone Components:** Arquitectura modular de componentes independientes libres de declaraciones pesadas de módulos.
*   **Internacionalización (i18n):** Traducciones dinámicas en tiempo de ejecución mediante **Transloco**, cargando los diccionarios JSON de inglés/español bajo demanda (lazy loading) para evitar el sobrepeso del bundle inicial.
*   **Interfaz Premium con Modo Oscuro:** Estilizado minimalista de cristal templado (glassmorphism), bordes suaves, gradientes reactivos y microinteracciones.

---

## 🚀 Guía de Inicio Rápido

### Prerrequisitos
*   [Docker](https://www.docker.com/) y Docker Compose
*   [Java 21 JDK](https://adoptium.net/)
*   [Node.js v20+](https://nodejs.org/)

### 1. Levantar la Base de Datos (PostgreSQL 16)
Desde la carpeta raíz del proyecto, inicializa el contenedor Docker de PostgreSQL:
```bash
docker compose up -d
```
*(PostgreSQL se iniciará en el puerto local `5433`)*

### 2. Compilar e Iniciar el Backend (Spring Boot)
Navega al directorio del backend, compila e inicia la aplicación:
```bash
cd aequivault/backend
./mvnw clean install
./mvnw spring-boot:run
```
*(El backend se iniciará en `http://localhost:8080`. Liquibase ejecutará automáticamente todas las migraciones del esquema y configurará los privilegios RBAC).*

### 3. Iniciar el Frontend (Angular)
Navega a la carpeta del frontend y ejecuta el servidor de desarrollo:
```bash
cd aequivault/frontend
npm install
npm run start
```
*(El portal B2B estará disponible en `http://localhost:4200`)*

En el primer acceso, el sistema detectará el estado vacío de la base de datos y te redirigirá al Asistente de Configuración en `/setup` para crear la entidad de administración inicial.

---

## 🚀 Despliegue en Producción (Cloud-Native)

AequiVault sigue la metodología **12-Factor App** para despliegues nativos en la nube. El archivo de orquestación de producción `docker-compose.prod.yml` es completamente sin estado, agnóstico de puertos y trata a la base de datos como un servicio de respaldo externo.

### Decisiones de Diseño
*   **Servicios de Respaldo Externos:** La base de datos (`db`) está excluida del archivo de Compose. En producción, se debe utilizar una instancia de base de datos administrada (ej. AWS RDS, GCP Cloud SQL o un clúster dedicado de PostgreSQL) en lugar de ejecutarla dentro de Docker Compose.
*   **Agnosticismo de Puertos:** No se exponen puertos al host. En su lugar, utilizamos `expose` para declarar los puertos internos (`80` para el frontend Nginx y `8080` para el backend Spring Boot). Un proxy reverso (ej. Traefik, Nginx Ingress, AWS ALB) debe enrutar el tráfico externo hacia el servicio del frontend.
*   **Configuración por Entorno:** Todas las credenciales de base de datos y parámetros de conexión se inyectan en tiempo de ejecución a través de variables de entorno estándar.

### Ejemplo de Comando de Despliegue

Para levantar el entorno de producción, inyecta los detalles del servicio de respaldo como variables de entorno:

```bash
SPRING_DATASOURCE_URL="jdbc:postgresql://tu-rds-host:5432/aequivault_db?stringtype=unspecified" \
SPRING_DATASOURCE_USERNAME="aequivault_app" \
SPRING_DATASOURCE_PASSWORD="password_seguro_app" \
SPRING_LIQUIBASE_USER="aequivault_admin" \
SPRING_LIQUIBASE_PASSWORD="password_seguro_admin" \
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 📚 Documentación Adicional
1.  [📜 Reglas Contables del Negocio](docs/rules.md)
2.  [🗺️ Plan del Proyecto y Arquitectura](docs/plan_proyecto_contable.md)
3.  [✅ Guía de Implementación (Walkthrough)](docs/walkthrough.md)
4.  [🏗️ Arquitectura Decision Records (ADRs)](docs/adr/adr-001-setup-and-auth.md)

---

## ⚖️ Licencia
Distribuido bajo la **[Licencia MIT](LICENSE)**. Siéntete libre de usarlo, modificarlo o extenderlo como plantilla para tus propias arquitecturas transaccionales multi-tenant.
