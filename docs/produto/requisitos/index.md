---
sidebar_position: 3
description: Registro público para requisitos do Uni+ com IDs estáveis, status explícitos e rastreabilidade.
fonte_canonica: "dados estruturados promovidos para uniplus-developers conforme ADR-0002"
estado_publicacao: "estrutura editorial inicial"
---

# Requisitos

Esta página define o ponto público de consulta dos requisitos do Uni+. Ela
prepara a navegação, os critérios editoriais e a forma de apresentação que será
usada quando os registros estruturados forem promovidos para o portal.

:::info[Estado da publicação]
Esta entrega cria a estrutura editorial inicial. A lista individualizada de
requisitos será publicada somente depois da curadoria dos dados estruturados,
sem importar arquivos internos nem exemplos com dados reais.
:::

## Fonte canônica

Os requisitos publicados nesta seção devem seguir a
[taxonomia de rastreabilidade](../taxonomia-rastreabilidade-requisitos.md) e a
[ADR-0002](https://github.com/unifesspa-edu-br/uniplus-developers/blob/main/docs/adrs/0002-governanca-editorial-fontes-canonicas-portal-publico.md).

Cada registro público deve nascer de dado estruturado versionado no
`uniplus-developers`. Páginas narrativas podem complementar o entendimento, mas
não substituem o registro rastreável.

## Estrutura mínima

- `Identificador`: usa `UNI-REQ-NNNN`, estável e sem significado embutido.
- `Título`: nome curto, verificável e adequado para navegação pública.
- `Enunciado`: declara o comportamento, restrição ou resultado esperado.
- `Grupo` e `tipo`: usam os valores definidos na taxonomia pública.
- `Status`: distingue item aprovado, proposto, dependente, planejado ou
  histórico.
- `Recorte`: explicita se o item pertence ao MVP, fundação, incremento ou
  governança.
- `Verificação`: informa a evidência esperada: teste, revisão, contrato ou
  validação manual.
- `Owner`: atribui acompanhamento a papel humano ou unidade institucional.

## Critérios para publicar

- O requisito possui `requisito_id`, grupo, tipo, nível, status e recorte.
- O texto está livre de dados pessoais, anexos reais e histórico sensível.
- Itens agregadores não são tratados como entrega implementável isolada.
- Links para ADRs, código, contratos e testes apontam para a branch `main` do
  repositório dono.
- Lacunas de implementação aparecem como status explícito, não como omissão.

## Próximo passo editorial

A próxima evolução desta página é receber o primeiro conjunto curado de
requisitos de Seleção, com filtros por grupo, status, recorte e módulo.
