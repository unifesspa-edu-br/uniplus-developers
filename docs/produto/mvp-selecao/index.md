---
sidebar_position: 6
description: Recorte público do MVP do módulo Seleção, com escopo, limites e critérios editoriais.
fonte_canonica: "dados estruturados promovidos para uniplus-developers conforme ADR-0002"
estado_publicacao: "estrutura editorial inicial"
---

# MVP Seleção

Esta página define o ponto público para o recorte do MVP do módulo Seleção. O
MVP descreve a primeira fatia verificável do produto, sem afirmar que requisitos
ou fluxos ainda não implementados estejam concluídos.

:::info[Estado da publicação]
Esta entrega cria a página-base do recorte. Os itens do MVP serão publicados
depois de curadoria dos requisitos `UNI-REQ-NNNN` e dos vínculos de
rastreabilidade correspondentes.
:::

## Fonte canônica

O recorte do MVP usa a
[taxonomia de rastreabilidade](../taxonomia-rastreabilidade-requisitos.md),
principalmente os campos `recorte`, `status`, `politica_backlog`,
`criterios_aceite` e `verificacao`.

Itens do MVP devem apontar para requisitos publicados no
`uniplus-developers`. Quando dependerem de API, frontend, ADR técnica ou teste,
os links devem apontar para os repositórios donos.

## Escopo editorial inicial

O primeiro módulo do Uni+ é Seleção. A estrutura pública do MVP acompanhará os
seguintes fluxos de produto:

- **Edital:** define parâmetros, etapas, pesos, cotas e locais de prova.
- **Configuração do processo:** organiza datas, formulários, modalidades e
  regras aplicáveis.
- **Inscrição:** permite cadastro público, envio de documentos e
  acompanhamento.
- **Homologação:** registra análise administrativa e resultado da conferência
  documental.
- **Notas:** registra desempenho por etapa quando o edital exigir.
- **Recursos:** permite contestação dentro dos prazos e regras publicados.
- **Classificação e resultado:** calcula e publica o resultado conforme regras
  do processo.

## Critérios para publicar itens do MVP

- O item possui requisito `UNI-REQ-NNNN` publicado ou pronto para publicação.
- O status distingue item aprovado, proposto, dependente ou planejado.
- O recorte indica se o item entra no `mvp`, em `fundacao` ou em incremento.
- Critérios de aceite e verificação estão descritos em termos observáveis.
- Não há dados pessoais, anexos reais nem referências a arquivos internos.

## Próximo passo editorial

A próxima evolução é publicar o primeiro mapa de requisitos do MVP Seleção,
separando o fluxo principal da primeira entrega, fundações técnicas e
incrementos planejados.
