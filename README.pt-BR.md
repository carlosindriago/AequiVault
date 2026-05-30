# 🏛️ AequiVault: Motor de Contabilidade de Partida Dobrada API-First

🌍 [English](README.md) | 🇪🇸 [Español](README.es.md) | 🇧🇷 [Português](README.pt-BR.md)

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg?style=flat-square&logo=angular)](https://angular.dev/)
[![Liquibase](https://img.shields.io/badge/Liquibase-Checked-blueviolet.svg?style=flat-square&logo=liquibase)](https://www.liquibase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**AequiVault** é um motor de contabilidade de partida dobrada B2B de nível corporativo projetado sob uma arquitetura API-first e um modelo *Open Core*. Ele resolve a complexidade de integrar lógica financeira imutável em plataformas SaaS modernas de forma descentralizada, sem depender de sistemas ERP caros, lentos e monolíticos. Garante que todas as transações estejam balanceadas e sejam auditáveis em conformidade com as regras contábeis, ao mesmo tempo em que isola fisicamente os dados dos inquilinos (tenants) utilizando variáveis de sessão criptográficas diretamente na camada de banco de dados.

---

## 📸 Demonstração da Interface de Usuário

<div align="center">
  <h3>✍️ Lançamento de Diários (Reativo com Angular Signals)</h3>
  <img src="docs/images/aequivault_journal_entry.png" alt="Formulário de Lançamento de Diário" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
  
  <br/><br/>
  
  <h3>🌳 Plano de Contas Hierárquico - COA (PostgreSQL LTREE e Árvore Recursiva)</h3>
  <img src="docs/images/aequivault_chart_of_accounts.png" alt="Plano de Contas Hierárquico" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />

  <br/><br/>
  
  <h3>🛠️ Documentação Interativa da API (Mapeamento OpenAPI / Swagger UI)</h3>
  <img src="docs/images/aequivault_swagger_showcase.png" alt="Documentação Swagger UI" width="750" style="border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);" />
</div>

---

## 🏗️ Decisões de Arquitetura e Design

Este projeto exemplifica as melhores práticas em engenharia de software em larga escala e design de sistemas distribuídos:

### 🔒 Imutabilidade do Domínio (Arquitetura Limpa e CQRS)
*   A contabilidade de partida dobrada é um invariante de negócios sagrado. Lançamentos contábeis confirmados (`POSTED`) não permitem modificações (`UPDATES`) ou exclusões (`DELETES`). Qualquer correção financeira deve ser realizada através de um lançamento de ajuste ou estorno.
*   O núcleo de negócios é modelado em Java puro, sem dependências de frameworks externos (Arquitetura Limpa).
*   Implementa-se um padrão **CQRS Pragmático**: as escritas validam regras de negócios complexas no domínio, enquanto as leituras (Painel, Relatórios) são executadas sobre projeções otimizadas para evitar a pressão do Coletor de Lixo (GC) da JVM.

### 🌳 Plano de Contas Hierárquico de Alta Velocidade (PostgreSQL `LTREE`)
*   Para evitar consultas recursivas caras (`WITH RECURSIVE`) na camada SQL, o Plano de Contas (COA) é armazenado utilizando o tipo de dado nativo **`LTREE`** do PostgreSQL e indexação **GiST**. Isso permite ao sistema consolidar saldos de ramificações completas com complexidade constante $O(1)$ em nível de aplicação.

### 📊 Saldo Contínuo e Balancete de Verificação (Memória JVM $O(1)$)
*   Os saldos contínuos do Livro Razão e os agregados do Balancete de Verificação são delegados ao PostgreSQL por meio de **funções de janela** (`SUM() OVER(...)`) e consolidações acumulativas. Isso elimina a necessidade de carregar milhares de registros na memória da JVM, garantindo um tempo de execução constante independentemente do tamanho do banco de dados.

### 🛡️ Isolamento Criptográfico Multitenant (PostgreSQL RLS)
*   O isolamento lógico de inquilinos (multi-tenancy) **não** é confiado a interceptores em nível de ORM (como `@Filter` do Hibernate), que são altamente propensos a vazamentos acidentais de dados.
*   Em vez disso, o backend decodifica o **JWT** (assinado criptograficamente usando JJWT 0.12.6 durante o login do usuário) para extrair o `tenantId`.
*   Este identificador é propagado para a thread transacional e injetado diretamente como uma variável de sessão dentro da conexão JDBC do PostgreSQL. O mecanismo de banco de dados aplica **Row-Level Security (RLS)** nativo, isolando fisicamente os dados contábeis em nível de consulta.
*   Todas as transações do pool de conexões são protegidas contra vazamentos de `ThreadLocal` usando blocos estritos `try-finally`.

### 🚀 Padrão de Inicialização do Sistema (Setup Bootstrapping)
*   O sistema conta com um fluxo de inicialização seguro. Se o banco de dados estiver vazio, o backend bloqueia todas as APIs públicas, exceto os endpoints de configuração para criar o primeiro inquilino e seu correspondente usuário `SUPER_ADMIN`. Inicializações duplicadas são bloqueadas e lançam erros HTTP 422 deterministas.

### 🔔 Notificações Colaborativas Desacopladas (Spring Events)
*   Integra o `ApplicationEventPublisher` do Spring Boot para transmitir notificações de forma assíncrona perante ações de escrita (como lançamento de diários ou criação de contas).
*   Os ouvintes de eventos processam e persistem as notificações sob as políticas RLS do inquilino, que são servidas instantaneamente ao frontend do Angular por meio de consultas periódicas reativas com Signals.

### 👥 RBAC Granular, Soft-Delete e Auditoria com Fricção Positiva
*   Implementa um esquema personalizado de Controle de Acesso Baseado em Funções (RBAC) que permite o mapeamento granular de permissões.
*   Aplica uma política estricta de **soft-delete** (desativando usuários para o estado `INACTIVE` em vez de excluí-los fisicamente).
*   Emprega **fricção positiva** para ações críticas de segurança: desativar/reativar usuários exige que o administrador insira sua senha atual (validada via `PasswordEncoder.matches()`) e um motivo de justificativa, registrando logs imutáveis em `user_status_audit` protegidos por RLS.

---

## 🎨 Interface de Usuário Moderna (Angular 18)

A interface de usuário do AequiVault é construída sob rígidos padrões corporativos de desempenho e design:

*   **Signals e Reatividade Síncrona:** O estado da interface de usuário local e as diferenças de partida dobrada são computados usando Angular Signals nativos, reduzindo a sobrecarga do RxJS assíncrono e garantindo ciclos de renderização ideais.
*   **Standalone Components:** Arquitetura modular de componentes independentes livres de declarações pesadas de módulos.
*   **Internacionalização (i18n):** Traduções dinâmicas em tempo de execução usando **Transloco**, carregando dicionários JSON de inglês/espanhol sob demanda (lazy loading) para evitar o sobrepeso do bundle inicial.
*   **Interface Premium com Modo Escuro:** Estilização minimalista de cristal temperado (glassmorphism), bordas suaves, gradientes reativos e micro-interações.

---

## 🚀 Guia de Início Rápido

### Pré-requisitos
*   [Docker](https://www.docker.com/) e Docker Compose
*   [Java 21 JDK](https://adoptium.net/)
*   [Node.js v20+](https://nodejs.org/)

### 1. Inicializar o Banco de Dados (PostgreSQL 16)
A partir da pasta raiz do projeto, inicialize o contêiner Docker do PostgreSQL:
```bash
docker compose up -d
```
*(O PostgreSQL iniciará na porta local `5433`)*

### 2. Compilar e Inicializar o Backend (Spring Boot)
Navegue até o diretório do backend, compile e inicie a aplicação:
```bash
cd aequivault/backend
./mvnw clean install
./mvnw spring-boot:run
```
*(O backend iniciará em `http://localhost:8080`. O Liquibase executará automaticamente todas as migrações de esquema e configurará os privilégios RBAC).*

### 3. Inicializar o Frontend (Angular)
Navegue até a pasta do frontend e execute o servidor de desenvolvimento:
```bash
cd aequivault/frontend
npm install
npm run start
```
*(O portal B2B estará disponível em `http://localhost:4200`)*

No primeiro acesso, o sistema detectará o estado vazio do banco de dados e redirecionará você para o Assistente de Configuração em `/setup` para criar a entidade administrativa inicial.

---

## 🚀 Implantação em Produção (Cloud-Native)

O AequiVault segue a metodologia **12-Factor App** para implantações nativas na nuvem. O arquivo de orquestração de produção `docker-compose.prod.yml` é completamente sem estado, agnóstico de portas e trata o banco de dados como um serviço de suporte externo.

### Decisões de Design
*   **Serviços de Suporte Externos:** O banco de dados (`db`) está excluído do arquivo Compose. Em produção, deve-se usar uma instância de banco de dados gerenciada (ex. AWS RDS, GCP Cloud SQL ou um cluster dedicado de PostgreSQL) em vez de executá-la dentro do Docker Compose.
*   **Agnosticismo de Portas:** Nenhuma porta é exposta para o host. Em vez disso, usamos `expose` para declarar as portas internas (`80` para o frontend Nginx e `8080` para o backend Spring Boot). Um proxy reverso (ex. Traefik, Nginx Ingress, AWS ALB) deve rotear o tráfego externo para o serviço de frontend.
*   **Configuração via Ambiente:** Todas as credenciais do banco de dados e parâmetros de conexão são injetados em tempo de execução por meio de variáveis de ambiente padrão.

### Exemplo de Comando de Implantação

Para levantar o ambiente de produção, injete os detalhes do serviço de suporte como variáveis de ambiente:

```bash
SPRING_DATASOURCE_URL="jdbc:postgresql://seu-rds-host:5432/aequivault_db?stringtype=unspecified" \
SPRING_DATASOURCE_USERNAME="aequivault_app" \
SPRING_DATASOURCE_PASSWORD="senha_segura_app" \
SPRING_LIQUIBASE_USER="aequivault_admin" \
SPRING_LIQUIBASE_PASSWORD="senha_segura_admin" \
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 📚 Documentação Adicional
1.  [📜 Regras de Negócios Contábeis](docs/rules.md)
2.  [🗺️ Plano do Projeto e Arquitetura](docs/plan_proyecto_contable.md)
3.  [✅ Guia de Implementação (Walkthrough)](docs/walkthrough.md)
4.  [🏗️ Registros de Decisão de Arquitetura (ADRs)](docs/adr/adr-001-setup-and-auth.md)

---

## ⚖️ Licença
Distribuído sob a **[Licencia MIT](LICENSE)**. Sinta-se livre para usá-lo, modificá-lo ou estendê-lo como modelo para suas próprias arquiteturas transacionais multi-tenant.
