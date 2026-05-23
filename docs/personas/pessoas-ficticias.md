---
sidebar_position: 1
title: Personas fictícias
description: Lista canônica de pessoas fictícias usadas em todos os exemplos do portal.
---

# Personas fictícias

Esta é a **fonte única** de pessoas fictícias do Uni+. Todo exemplo do portal —
payloads de API, prints, tabelas de casos de uso, cenários BDD — deve usar
**apenas** as personas abaixo. Assim os exemplos ficam consistentes entre si e
**nenhum dado de pessoa real** entra na documentação pública.

:::warning Regra
Não invente CPFs, nomes ou e-mails avulsos em exemplos. Reutilize uma persona
desta tabela. CPFs aqui são **fictícios** (sequências reservadas de teste) e
e-mails usam o domínio reservado `@exemplo.test`.
:::

## Candidatos

| Persona | CPF (fictício) | Nascimento | Modalidade de cota | E-mail |
|---|---|---|---|---|
| Ana Beatriz Souza | `111.111.111-11` | 2005-03-12 | LB_PPI | ana.souza@exemplo.test |
| Bruno Carvalho Lima | `222.222.222-22` | 2004-07-30 | AC (ampla concorrência) | bruno.lima@exemplo.test |
| Carla Mendes Rocha | `333.333.333-33` | 2003-11-05 | LI_PcD | carla.rocha@exemplo.test |
| Diego Almeida Nunes | `444.444.444-44` | 2005-01-22 | LB_Q | diego.nunes@exemplo.test |
| Eduarda Pereira Dias | `555.555.555-55` | 2006-09-18 | LB_EP | eduarda.dias@exemplo.test |

## Servidores e operadores

| Persona | Papel | Unidade | E-mail |
|---|---|---|---|
| Fernanda Oliveira Castro | Operadora CEPS | CEPS | fernanda.castro@exemplo.test |
| Gustavo Ribeiro Teixeira | Analista de homologação | CEPS | gustavo.teixeira@exemplo.test |
| Helena Martins Barbosa | Gestora de edital | PROEG | helena.barbosa@exemplo.test |

## Editais de exemplo

| Edital | Tipo | Ano letivo | Status |
|---|---|---|---|
| Processo Seletivo SiSU 2026 | SiSU | 2026 | Rascunho |
| PSIQ 2026 — Indígena e Quilombola | PSIQ | 2026 | Publicado |
| PSE Educação do Campo 2026 | PSE | 2026 | Encerrado |

:::note Identificadores
Use UUIDs v7 fictícios para `id` em exemplos, ex.:
`01890a5d-ac96-774b-bcce-b302099a8057`.
:::
