# 🏛️ AequiVault: Motor de Contabilidad de Partida Doble API-First

[English](README.md) | [Español](README.es.md) | [Português](README.pt-BR.md)

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg?style=flat-square&logo=angular)](https://angular.dev/)
[![Liquibase](https://img.shields.io/badge/Liquibase-Checked-blueviolet.svg?style=flat-square&logo=liquibase)](https://www.liquibase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**AequiVault** es un motor de contabilidad de partida doble B2B de grado empresarial diseñado bajo una arquitectura API-first y un modelo **Open Core**. Resuelve la complejidad de integrar lógica financiera inmutable en plataformas SaaS modernas de forma descentralizada sin depender de sistemas ERP costosos, lentos y monolíticos. Garantiza que todas las transacciones estén balanceadas y sean auditables bajo el cumplimiento de SOX, al mismo tiempo que aísla físicamente los datos de los inquilinos mediante variables de sesión criptográficas en la capa de base de datos.

---

## 📸 Muestra de Interfaz de Usuario

<div align="center">
  <h3>✍️ Registro de Asientos Diario (Reactivo con Angular 18 Signals)</h3>
  <img src="docs/images/aequivault_journal_entry.png" alt="Journal Entry Form" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
  
  <br/><br/>
  
  <h3>🌳 Plan de Cuentas Jerárquico - COA (PostgreSQL LTREE y Árbol Recursivo)</h3>
  <img src="docs/images/aequivault_chart_of_accounts.png" alt="Hierarchical COA" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />

  <br/><br/>
  
  <h3>🛠️ Documentación de API Interactiva (Muestra de OpenAPI / Swagger UI)</h3>
  <img src="docs/images/aequivault_swagger_showcase.png" alt="Swagger UI documentation" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
</div>

---

## 🏗️ Decisiones de Diseño y Arquitectura

Este proyecto ejemplifica las mejores prácticas en ingeniería de software a gran escala y diseño de sistemas distribuidos:

### 🔒 Inmutabilidad del Dominio (Arquitectura Limpia y CQRS)
*   La contabilidad por partida doble es un invariante de negocio sagrado. Los asientos contables confirmados (`POSTED`) no permiten modificaciones (`UPDATES`) ni eliminaciones (`DELETES`). Cualquier corrección financiera debe realizarse mediante un asiento de reversión.
*   El núcleo de negocio está modelado en Java puro sin dependencias de frameworks externos (Clean Architecture).
*   Se implementa un patrón **CQRS lógico**: las escrituras validan reglas de negocio complejas en el dominio, mientras que las lecturas (Dashboard, Reportes) se ejecutan en proyecciones optimizadas para omitir la presión del Garbage Collector de la JVM.

### 🌳 Plan de Cuentas Jerárquico de Alta Velocidad (PostgreSQL `LTREE`)
*   Para evitar costosas consultas recursivas `WITH RECURSIVE` en la capa SQL, el Plan de Cuentas (COA) se almacena utilizando el tipo nativo **`LTREE`** de PostgreSQL e indexación **GiST**. Esto permite al sistema consolidar saldos para ramas principales completas con una complejidad constante $O(1)$ a nivel de aplicación.

### 📊 Saldos Continuos y Balance de Comprobación (Memoria JVM $O(1)$)
*   Los saldos del Libro Mayor y los agregados del Balance de Comprobación se delegan a PostgreSQL utilizando **funciones de ventana** (`SUM() OVER(...)`) y acumulados acumulativos. Esto elimina la necesidad de cargar miles de registros en la memoria de la JVM, garantizando un tiempo de ejecución constante independientemente del tamaño de la base de datos.

### 🛡️ Aislamiento Multi-inquilino Criptográfico (PostgreSQL RLS)
*   El aislamiento lógico de multi-inquilino no se confía a interceptores a nivel de ORM (como Hibernate `@Filter`), los cuales son altamente propensos a fugas accidentales de datos.
*   En su lugar, el backend descodifica el **JWT** (firmado criptográficamente usando JJWT 0.12.6 durante el inicio de sesión del usuario) para extraer el `tenantId`.
*   Este ID se propaga al hilo transaccional y se inyecta directamente como una variable de sesión dentro de la conexión JDBC de PostgreSQL. El motor de base de datos aplica **Row-Level Security (RLS)** nativa, aislando físicamente los datos contables a nivel de consulta.
*   Todas las transacciones del pool de conexiones están protegidas contra fugas de `ThreadLocal` mediante bloques estrictos `try-finally`.

### 🚀 Patrón de Inicialización del Sistema (First-Time Setup)
*   El sistema cuenta con un flujo seguro de inicialización. Si la base de datos está vacía, el backend bloquea todas las APIs públicas excepto los endpoints de configuración para crear el primer inquilino y su correspondiente usuario `SUPER_ADMIN`. Las inicializaciones duplicadas se bloquean y arrojan errores HTTP 422 deterministas.

---

## 🎨 Frontend Moderno (Angular 18)

La interfaz de usuario de AequiVault está construida bajo estrictos estándares corporativos de rendimiento y diseño:

*   **Angular 18 Signals y Reactividad Síncrona:** El estado de la interfaz de usuario local y los desbalances de partida doble se computan mediante Angular 18 Signals nativas, reduciendo la sobrecarga asíncrona de RxJS y asegurando ciclos de renderizado óptimos.
*   **Componentes Standalone:** Arquitectura modular de componentes independientes libres de pesadas declaraciones de módulos.
*   **Internacionalización (i18n):** Traducciones dinámicas en tiempo de ejecución utilizando **Transloco**, cargando diccionarios JSON en inglés y español mediante carga diferida (lazy loading) para evitar el aumento del tamaño del bundle inicial.
*   **Interfaz de Usuario Premium con Modo Oscuro:** Diseño minimalista de estilo glassmorphic, bordes suaves, gradientes reactivos y micro-interacciones.

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

### 2. Compilar y Levantar el Backend (Spring Boot)
Navega al directorio del backend, compila e inicia la aplicación:
```bash
cd aequivault/backend
./mvnw clean install
./mvnw spring-boot:run
```
*(El backend se iniciará en `http://localhost:8080`. Liquibase ejecutará automáticamente todas las migraciones del esquema y configurará los privilegios de RBAC).*

### 3. Levantar el Frontend (Angular)
Navega a la carpeta del frontend y ejecuta el servidor de desarrollo:
```bash
cd aequivault/frontend
npm install
npm run start
```
*(El portal B2B estará disponible en `http://localhost:4200`)*

En el primer acceso, el sistema detectará el estado en blanco de la base de datos y te redirigirá al asistente de configuración en `/setup` para crear la entidad administrativa inicial.

---

## 🚀 Despliegue en Producción (Cloud-Native)

AequiVault sigue la metodología de aplicaciones de 12 factores (**12-Factor App**) para despliegues nativos en la nube. El archivo de orquestación de producción `docker-compose.prod.yml` es completamente sin estado, agnóstico del puerto y trata a la base de datos como un servicio de respaldo externo (backing service).

### Decisiones de Diseño
*   **Servicios de Respaldo Externos:** La base de datos (`db`) está excluida del archivo Compose. En producción, se debe utilizar una instancia de base de datos administrada (ej. AWS RDS, GCP Cloud SQL o un clúster de PostgreSQL dedicado) en lugar de ejecutarla dentro de Docker Compose.
*   **Agnosticismo de Puerto:** No se exponen puertos al host. En su lugar, utilizamos `expose` para declarar los puertos internos (`80` para el frontend de Nginx y `8080` para el backend de Spring Boot). Un proxy reverso (ej. Traefik, Nginx Ingress, AWS ALB) debe enrutar el tráfico externo al servicio frontend.
*   **Configuración mediante Entorno:** Todas las credenciales y parámetros de conexión de la base de datos se inyectan en tiempo de ejecución a través de variables de entorno estándar.

### Ejemplo de Comando de Despliegue

Para levantar el stack de producción, proporciona los detalles del servicio de respaldo externo como variables de entorno:

```bash
SPRING_DATASOURCE_URL="jdbc:postgresql://tu-servidor-rds:5432/aequivault_db?stringtype=unspecified" \
SPRING_DATASOURCE_USERNAME="aequivault_app" \
SPRING_DATASOURCE_PASSWORD="password_seguro_app" \
SPRING_LIQUIBASE_USER="aequivault_admin" \
SPRING_LIQUIBASE_PASSWORD="password_seguro_admin" \
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 📚 Documentación Adicional
1.  [📜 Reglas de Negocio Contables](docs/rules.md)
2.  [🗺️ Plan del Proyecto y Arquitectura](docs/plan_proyecto_contable.md)
3.  [✅ Guía de Implementación](docs/walkthrough.md)
4.  [🏗️ Registros de Decisiones de Arquitectura (ADRs)](docs/adr/adr-001-setup-and-auth.md)

---

## ⚖️ Licencia
Distribuido bajo la **[Licencia MIT](LICENSE)**. Siéntete libre de usar, modificar o extender esto como plantilla para tus propias arquitecturas transaccionales multi-inquilino.
