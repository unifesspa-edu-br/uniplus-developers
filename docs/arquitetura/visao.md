---
sidebar_position: 1
title: Visão de arquitetura
description: Como o Uni+ é construído — decisões estruturais, padrões de persistência e o índice público de ADRs.
fonte_canonica: "ADRs dos repositórios donos (uniplus-api, uniplus-web), indexadas conforme ADR-0002 do uniplus-developers"
---

# Visão de arquitetura

Esta trilha publica **como** o Uni+ é construído: as decisões estruturais que
sustentam a plataforma e os padrões que os módulos seguem. Diferente das trilhas
de [Produto](/produto/visao) (o *quê* e o *porquê*) e de
[Referência de API](/referencia-api/proof-gate) (o contrato consumido por
integradores), aqui o público é quem **implementa e opera** o sistema.

:::info[Fonte da verdade]
Esta trilha **não duplica a autoridade** das decisões. Cada decisão arquitetural
é canônica no `docs/adrs/` do repositório dono (`uniplus-api`, `uniplus-web`); as
páginas aqui são narrativas curadas que **apontam** para o ADR canônico no
GitHub, conforme a [ADR-0002 do portal](./adrs/index.mdx). Quando texto e ADR
divergirem, o ADR vence.
:::

## O que está publicado

- **[Event Sourcing e Event Store](./event-sourcing/index.mdx)** — quando e como
  o Uni+ usa histórico de eventos como fonte de verdade em agregados críticos
  (Marten sobre PostgreSQL), e por que a maior parte do sistema permanece CRUD.
- **[Índice de ADRs](./adrs/index.mdx)** — mapa público das decisões
  arquiteturais por repositório, com link para o arquivo canônico no GitHub.

## Fundações em uma frase

O backbone do Uni+ é um **monólito modular** em .NET, com **Clean Architecture**
por módulo, **CQRS in-process** via Wolverine, **outbox transacional** sobre
EF Core/PostgreSQL e **Kafka** como barramento de integração entre módulos. Sobre
essa base, agregados críticos podem adotar **Event Sourcing seletivo**. Os
detalhes e o racional de cada peça vivem nas ADRs do `uniplus-api`.
