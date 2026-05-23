---
sidebar_position: 4
description: Regras publicáveis do domínio Uni+ vinculadas a requisitos, módulos e critérios de verificação.
fonte_canonica: "dados estruturados promovidos para uniplus-developers conforme ADR-0002"
estado_publicacao: "estrutura editorial inicial"
---

# Regras de negócio

Esta página organiza as regras de negócio publicáveis do Uni+. O objetivo é
oferecer uma leitura de domínio para analistas, desenvolvedores e áreas
institucionais sem duplicar editais, normas internas ou evidências sensíveis.

:::info[Estado da publicação]
Esta entrega cria a página-base e o padrão de publicação. As regras
individualizadas serão publicadas depois de curadoria e vínculo com requisitos
`UNI-REQ-NNNN`.
:::

## Fonte canônica

Regras de negócio seguem a
[taxonomia de rastreabilidade](../taxonomia-rastreabilidade-requisitos.md), com
`tipo = regra_negocio` e, quando aplicável, `nivel = regra`.

Quando a regra depender de decisão técnica, contrato ou ADR, o portal deve
apontar para o arquivo publicado no GitHub do repositório dono. Quando depender
de norma ou edital, o texto público deve resumir apenas a regra necessária para
implementação e validação, sem expor dados reais.

## Estrutura mínima

- `Identificador`: usa `UNI-REQ-NNNN` quando a regra for um item rastreável
  próprio.
- `Regra`: descreve a restrição de domínio em linguagem objetiva.
- `Requisito vinculado`: aponta o requisito ou capacidade que a regra detalha.
- `Módulo`: identifica o recorte de produto, como Seleção.
- `Fluxo`: informa onde a regra se aplica no ciclo de vida do processo.
- `Status`: mantém claro se a regra está aprovada, proposta ou dependente.
- `Verificação`: define como a regra será conferida em teste, revisão ou
  contrato.

## Critérios para publicar

- A regra está vinculada a requisito, capacidade ou decisão rastreável.
- O texto evita reproduzir conteúdo sensível além do necessário ao domínio.
- Exceções, limites e dependências externas aparecem no próprio registro.
- Regras aprovadas e propostas não são misturadas na mesma seção sem status.
- Regras com impacto em API, frontend ou dados apontam para artefatos dos
  repositórios donos quando eles existirem.

## Organização prevista

As regras serão agrupadas por módulo e fluxo. Para Seleção, a primeira
organização prevista acompanha o ciclo do produto: edital, configuração,
inscrição, homologação, notas, recursos, classificação e resultado.
