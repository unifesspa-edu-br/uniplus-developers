---
status: "accepted"
date: "2026-05-23"
decision-makers:
  - "Tech Lead (CTIC)"
consulted:
  - "Equipe Uni+"
informed:
  - "CTIC"
---

# ADR-0002: Governança editorial e fontes canônicas do portal público

## Contexto e enunciado do problema

O `uniplus-developers` nasceu como portal público de desenvolvedores para
materializar o contrato REST canônico V1 da `uniplus-api`, conforme a
[ADR-0001 do `uniplus-developers`](https://github.com/unifesspa-edu-br/uniplus-developers/blob/main/docs/adrs/0001-arquitetura-portal-desenvolvedores.md).
O escopo do portal, no entanto, já é mais amplo que referência de API: ele
também precisa publicar requisitos, regras de negócio, cenários BDD, exemplos de
código, arquitetura, comunicação entre integrações e um índice de ADRs por
repositório.

Sem uma regra editorial explícita, o portal tende a crescer como uma coleção de
páginas manuais. Isso cria risco de divergência entre requisitos, issues, ADRs,
contratos OpenAPI, implementação, testes e documentação pública. O risco é
maior no Uni+ porque parte do material nasce em artefatos de governança
privados ou temporários, enquanto o portal é público e não pode expor dados
reais, histórico sensível, conteúdo LGPD ou decisões técnicas ainda não
aprovadas.

Também há ownership distribuído. Contratos OpenAPI e `ProblemDetails` pertencem
à `uniplus-api`; clientes Angular, padrões de consumo e tokens visuais
pertencem à `uniplus-web`; ADRs técnicas pertencem ao repositório dono da
decisão; documentação de produto e domínio deve ser publicada no
`uniplus-developers`; e `uniplus-docs` permanece como repositório privado para
material institucional sensível ou histórico que não deve ser publicado.

Esta ADR define a governança editorial do portal antes de criar automações de
sincronização, páginas derivadas ou procedimentos operacionais de gestão de
requisitos. Qualquer procedimento de apoio, quando existir, deve operar este
processo; ele não deve substituir as fontes versionadas no repositório.

## Drivers da decisão

- **Rastreabilidade bidirecional.** Requisitos precisam ligar origem, decisão,
  issue, PR, código, teste e documentação pública sem renumeração nem reescrita
  histórica.
- **Fonte canônica por ownership.** Cada artefato publicado deve apontar para o
  repositório responsável por sua verdade operacional.
- **Publicação segura.** O portal é público; exemplos, evidências e fixtures
  devem usar dados fictícios e nunca copiar PII, anexos reais ou transcrições
  sensíveis.
- **Docusaurus como camada de apresentação.** Páginas humanas podem ser MDX, mas
  registros estruturados devem ter origem em dados versionados e validados.
- **Crescimento incremental.** O portal deve aceitar novas famílias de conteúdo
  sem exigir redesign a cada módulo ou contrato novo.
- **Validação automatizável.** A governança precisa permitir scripts, lint,
  build e E2E verificarem links, rotas públicas, renderização de OpenAPI e
  integridade básica da matriz de rastreabilidade.
- **Separação entre planejamento e publicação.** Artefatos internos de
  planejamento podem orientar curadoria, mas não devem ser a única fonte de
  verdade pública depois da promoção para o portal.

## Opções consideradas

- **A. Portal como camada pública derivada de fontes canônicas distribuídas.**
  Dados estruturados e páginas públicas ficam no `uniplus-developers`, mas cada
  família declara sua fonte de verdade operacional: API, Web, ADR do repositório
  dono, matriz de requisitos promovida ou conteúdo curado do próprio portal.
- **B. Portal como fonte única manual.** Todo conteúdo público é escrito
  diretamente em MDX no `uniplus-developers`, sem fontes estruturadas nem vínculo
  formal com repositórios donos.
- **C. `uniplus-docs` como fonte central, com publicação seletiva.** O portal
  consome uma extração do repositório privado de documentação.
- **D. Adiar governança editorial.** Criar páginas e automações caso a caso,
  formalizando padrões apenas quando o volume de conteúdo crescer.

## Resultado da decisão

**Escolhida:** "A — portal como camada pública derivada de fontes canônicas
distribuídas", porque mantém o portal como ponto público de consulta sem apagar
o ownership real de requisitos, contratos, ADRs, implementação e testes.

O `uniplus-developers` passa a ter três papéis editoriais:

1. **Publicar conteúdo canônico de produto/domínio.** Requisitos, regras de
   negócio, cenários BDD públicos, matriz de rastreabilidade e visão de MVP são
   conteúdo do próprio portal, com origem estruturada versionada no repositório
   após curadoria.
2. **Espelhar artefatos técnicos publicados por repositórios donos.** OpenAPI,
   catálogo de erros, media types, contratos de eventos assíncronos e exemplos
   de consumo devem derivar dos contratos e decisões de `uniplus-api` e
   `uniplus-web`.
3. **Indexar decisões arquiteturais sem duplicar autoridade.** O portal pode
   publicar uma página de ADRs por repositório, mas o link canônico de cada ADR
   técnica aponta para o arquivo no GitHub do repositório dono.

A regra de fonte canônica por família de conteúdo fica definida assim:

| Família publicada | Fonte canônica operacional | Publicação no portal |
|---|---|---|
| Requisitos e regras de negócio | Dados estruturados promovidos para `uniplus-developers` | Páginas em `/produto/requisitos/`, `/produto/regras-negocio/` e `/produto/mvp-selecao/` geradas ou compostas a partir desses dados |
| Matriz de rastreabilidade | Dados estruturados promovidos para `uniplus-developers` com IDs `UNI-REQ-NNNN` | Página `/produto/rastreabilidade/` com requisito, issue, ADR, PR, código, teste e documentação |
| Cenários BDD públicos | Arquivos Gherkin ou dados estruturados curados no `uniplus-developers` | Páginas de produto vinculadas aos requisitos correspondentes |
| OpenAPI | `uniplus-api/contracts/openapi.<modulo>.json` | Cópia sincronizada para `static/openapi/` e renderizada por `<RedocSpec>` |
| `ProblemDetails` e catálogo de erros | Mapeamentos e contratos da `uniplus-api` | Páginas `/erros/{code}` com descrição pública, mitigação e links para contrato |
| Media types e versionamento de recursos | ADRs e implementação da `uniplus-api` | Páginas `/media-types/{resource}/{version}` |
| Eventos Kafka e schemas Avro | Schemas `.avsc`, roteamento e registro de subjects no módulo dono da `uniplus-api` | Catálogo público em `/referencia-api/eventos/` com tópico, subject, compatibilidade, campos do schema, produtor, consumidores conhecidos e links para o schema canônico |
| Clientes, exemplos Angular e padrões de consumo | `uniplus-web` e contratos da API | Guias com exemplos mínimos, revisados contra implementação real |
| Tokens visuais Gov.br DS | `uniplus-web` enquanto não houver pacote compartilhado | CSS/tema do portal mantidos em sincronia explícita |
| ADRs técnicas | `docs/adrs/` do repositório dono | Índice público com links para GitHub, status e resumo curto |
| Conteúdo privado, evidências e histórico sensível | `uniplus-docs` ou artefatos internos | Não publicado; quando necessário, apenas resumo público sem dados reais |

Artefatos internos de planejamento continuam podendo ser usados como bancada de
análise, validação e preparação. Quando um artefato virar contrato público, ele
deve ser promovido para uma fonte versionada do `uniplus-developers` ou para o
repositório dono. A página publicada não deve depender de arquivos ignorados pelo
Git ou de histórico local de ambiente de trabalho.

## Consequências

### Positivas

- Reduz o risco de o portal publicar conteúdo divergente da API, do frontend ou
  do backlog.
- Permite criar geradores pequenos e revisáveis em vez de automação monolítica.
- Preserva a separação entre conteúdo público, documentação privada e artefatos
  de trabalho.
- Dá base objetiva para revisar PRs: toda página pública precisa declarar ou
  derivar sua fonte canônica.
- Prepara o caminho para procedimentos de gestão de requisitos que operem dados
  e validações versionados, sem se tornar a própria fonte de verdade.

### Negativas

- Aumenta o custo inicial: antes de publicar páginas novas, é preciso definir
  dados estruturados, scripts ou manifestos mínimos.
- Exige disciplina cross-repo: mudanças em contrato, ADR ou requisito podem
  demandar PR coordenado em mais de um repositório.
- A primeira versão da matriz pública provavelmente exigirá curadoria manual
  antes de automação completa.

### Neutras

- O `uniplus-developers` continua sendo repositório de publicação, não substitui
  `uniplus-api`, `uniplus-web` nem `uniplus-docs`.
- Nem todo conteúdo precisa ser gerado. Páginas narrativas continuam permitidas
  quando apontam para fontes canônicas verificáveis.

## Confirmação

Esta decisão é seguida quando:

1. Toda nova página pública de requisitos, regra de negócio, API, erro, media
   type, arquitetura ou ADR declara fonte canônica no frontmatter, em dados
   estruturados ou no próprio gerador.
2. A matriz pública de requisitos usa IDs `UNI-REQ-NNNN` estáveis e não publica
   códigos históricos como identificadores principais.
3. PR que altera conteúdo derivado inclui atualização do dado estruturado ou
   justificativa explícita para página manual.
4. PR que sincroniza OpenAPI ou catálogo de erros referencia o commit, PR ou
   release da `uniplus-api` de origem.
5. PR que publica contrato de evento Kafka referencia o schema `.avsc`, o
   subject registrado e a ADR técnica do repositório dono.
6. Página de índice de ADRs aponta para os arquivos `docs/adrs/` dos
   repositórios donos, sem duplicar o conteúdo integral como se fosse fonte
   canônica do portal.
7. O build do Docusaurus, os testes E2E e os validadores de dados cobrem as
   rotas públicas principais antes de publicar em `main`.

## Prós e contras das opções

### A. Portal como camada pública derivada de fontes canônicas distribuídas

- Bom, porque respeita o ownership real dos artefatos e mantém rastreabilidade
  auditável.
- Bom, porque permite publicar uma experiência unificada sem centralizar toda
  decisão técnica no portal.
- Ruim, porque exige scripts, manifestos e revisão coordenada para evitar drift.

### B. Portal como fonte única manual

- Bom, porque é a forma mais rápida de criar páginas iniciais.
- Ruim, porque escala mal e tende a duplicar requisitos, contratos e ADRs sem
  garantia de atualização.
- Ruim, porque dificulta validação objetiva por CI e E2E.

### C. `uniplus-docs` como fonte central, com publicação seletiva

- Bom, porque aproveita material institucional já existente.
- Ruim, porque mistura conteúdo privado e público, aumentando risco LGPD e risco
  de publicar histórico sensível por engano.
- Ruim, porque mantém o portal dependente de um repositório privado que não é o
  dono operacional de API, frontend ou decisões técnicas atuais.

### D. Adiar governança editorial

- Bom, porque não bloqueia páginas experimentais.
- Ruim, porque adia exatamente o problema que tende a ficar mais caro depois:
  reconciliar requisitos, issues, ADRs, contratos e testes já publicados.

## Mais informações

- [ADR-0001 do `uniplus-developers`: Arquitetura do portal de desenvolvedores](https://github.com/unifesspa-edu-br/uniplus-developers/blob/main/docs/adrs/0001-arquitetura-portal-desenvolvedores.md).
- [ADR-0022 do `uniplus-api`: Contrato REST canônico umbrella](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0022-contrato-rest-canonico-umbrella.md).
- [ADR-0023 do `uniplus-api`: Wire format de erro RFC 9457](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0023-wire-formato-erro-rfc-9457.md).
- [ADR-0030 do `uniplus-api`: OpenAPI 3.1 contract-first](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0030-openapi-3-1-contract-first-microsoft-aspnetcore-openapi.md).
- [ADR-0051 do `uniplus-api`: Apicurio Schema Registry com Avro e Wolverine](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0051-apicurio-schema-registry-avro-wolverine.md).
- [ADR-0011 do `uniplus-web`: Consumer adapter API result](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0011-consumer-adapter-api-result.md).
- [ADR-0013 do `uniplus-web`: Gerador OpenAPI Node-only](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0013-gerador-openapi-node-only.md).
- [Taxonomia de rastreabilidade de requisitos](https://github.com/unifesspa-edu-br/uniplus-developers/blob/main/docs/produto/taxonomia-rastreabilidade-requisitos.md).
