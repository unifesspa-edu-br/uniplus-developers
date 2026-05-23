---
sidebar_position: 5
description: Matriz pública para ligar requisitos, decisões, issues, PRs, código, testes e documentação.
fonte_canonica: "dados estruturados promovidos para uniplus-developers conforme ADR-0002"
estado_publicacao: "estrutura editorial inicial"
---

# Rastreabilidade

Esta página define a estrutura pública da matriz de rastreabilidade do Uni+.
Ela deve permitir navegar da necessidade institucional até a evidência de
implementação, sem renumerar requisitos nem transformar lacunas em entregas
concluídas.

:::info[Estado da publicação]
Esta entrega cria a página-base da matriz. A matriz consolidada será publicada
quando os requisitos e seus vínculos forem promovidos para dados estruturados do
portal.
:::

## Fonte canônica

A matriz segue a
[taxonomia de rastreabilidade](../taxonomia-rastreabilidade-requisitos.md) e a
cadeia mínima:

```text
origem -> requisito -> decisão -> issue -> PR -> código -> teste -> documentação
```

O `uniplus-developers` publica a visão consolidada. Contratos, código, testes e
ADRs técnicas continuam pertencendo aos repositórios donos.

## Colunas da matriz

- `Requisito`: `UNI-REQ-NNNN`, título, grupo, tipo, status e recorte.
- `Origem`: referência pública ou resumo seguro da necessidade institucional.
- `Decisão`: ADR ou deliberação que sustenta o requisito, quando existir.
- `Issue`: item de backlog que entrega ou valida o requisito.
- `PR`: pull request que implementa, documenta ou verifica a entrega.
- `Código`: arquivo ou contrato canônico no repositório dono.
- `Teste`: evidência de verificação automatizada ou revisão manual registrada.
- `Documentação`: página pública relacionada no portal.

## Política para lacunas

- Campo vazio significa ausência real de vínculo publicado, não esquecimento.
- Dependências externas devem aparecer com status `dependencia_externa`.
- Incrementos futuros devem aparecer como `incremento_planejado`.
- Itens históricos permanecem rastreáveis e apontam substituição quando houver.
- Links técnicos apontam para a branch `main` do repositório dono.

## Próximo passo editorial

A próxima evolução é publicar a primeira matriz de Seleção com requisitos
curados, vínculos de backlog e evidências disponíveis no momento da promoção.
