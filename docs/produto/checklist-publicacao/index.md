---
sidebar_position: 7
title: Checklist de publicação de requisitos
description: Portão editorial que um requisito do Uni+ precisa cruzar para sair de curadoria interna e virar publicação pública segura.
fonte_canonica: "taxonomia de rastreabilidade e ADR-0002 do uniplus-developers"
estado_publicacao: "processo editorial público do portal"
---

# Checklist de publicação de requisitos

Esta página define o portão editorial entre a curadoria interna e a publicação
pública. Um requisito só aparece no portal depois de cruzar este checklist, que
garante identidade estável, status honesto, conteúdo seguro e rastreabilidade
verificável.

O checklist é processo, não fonte de verdade. Os campos e valores vêm da
[taxonomia de rastreabilidade](../taxonomia-rastreabilidade-requisitos.md); a
regra de fonte canônica por família de conteúdo vem da
[ADR-0002](https://github.com/unifesspa-edu-br/uniplus-developers/blob/main/docs/adrs/0002-governanca-editorial-fontes-canonicas-portal-publico.md).
Em caso de divergência, esses dois documentos prevalecem.

## Quando aplicar

Aplique o checklist sempre que um requisito for promovido de bancada de análise
para conteúdo público — seja na primeira publicação, seja ao ampliar um recorte
já existente. A promoção é decisão editorial do Tech Lead, apoiada pela equipe e
pelo analista de sistemas responsável pelo recorte.

Um requisito está pronto para promoção quando deixa de ser rascunho de trabalho e
passa a representar entendimento estável do produto, mesmo que ainda não
implementado. Status de planejamento ou dependência são publicáveis, desde que
declarados de forma explícita.

## Checklist de promoção

Cada item abaixo deve ser verdadeiro antes de publicar. Itens não atendidos
bloqueiam a publicação do requisito até serem resolvidos ou registrados como
lacuna honesta.

### 1. Identidade e estrutura

- [ ] O requisito tem `requisito_id` no formato `UNI-REQ-NNNN`, único e estável.
- [ ] O identificador não foi renumerado; itens substituídos apontam o sucessor.
- [ ] Estão preenchidos `titulo`, `enunciado`, `grupo`, `tipo`, `nivel` e
      `modulo`, conforme a taxonomia.
- [ ] Itens agregadores estão marcados como `agregador` na política de backlog e
      não são apresentados como entrega implementável isolada.

### 2. Status e recorte honestos

- [ ] O `status` reflete o ciclo de vida real: `aprovado`, `proposto`,
      `dependencia_externa`, `incremento_planejado` ou `historico`.
- [ ] O `recorte` está coerente: `mvp`, `fundacao`, `incremento_obrigatorio`,
      `fora_escopo` ou `governanca`.
- [ ] Proposta não é apresentada como implementação concluída.
- [ ] Dependências externas aparecem com status `dependencia_externa`, não como
      entrega do time.

### 3. Conteúdo seguro

- [ ] O texto está livre de dados pessoais reais (CPF, nome, endereço, contato).
- [ ] Exemplos usam exclusivamente personas e cadastros fictícios.
- [ ] Não há anexos reais, evidências privadas, transcrições internas nem
      histórico sensível.
- [ ] Nenhuma referência a caminhos internos, arquivos de bancada, repositórios
      privados ou artefatos ignorados pelo controle de versão.
- [ ] Nenhuma decisão é atribuída a ferramenta ou modelo; a autoria editorial é
      sempre de papéis humanos ou institucionais (Tech Lead, CTIC, analista de
      sistemas, equipe backend, equipe frontend).

### 4. Rastreabilidade e links

- [ ] Há `owner` humano ou institucional responsável pelo acompanhamento.
- [ ] Os `criterios_aceite` são condições verificáveis, não intenções vagas.
- [ ] A `verificacao` esperada está declarada: teste, revisão, E2E, contrato ou
      validação manual.
- [ ] Links para ADRs, contratos, schemas, código e testes apontam para a branch
      `main` do repositório dono, sem duplicar autoridade no portal.
- [ ] A `pagina_developers` relacionada está identificada quando existir.

### 5. Política para lacunas

- [ ] Etapas ainda inexistentes da cadeia de rastreabilidade aparecem vazias ou
      com status explícito, indicando ausência real, não esquecimento.
- [ ] Vínculos de issue, PR e código que ainda não existem não são inventados.
- [ ] Incrementos futuros aparecem como `incremento_planejado` e não inflam o
      escopo entregue.

## O que nunca publicar

Independentemente do checklist, o portal nunca publica:

| Conteúdo | Onde permanece |
|---|---|
| Dados pessoais reais e PII | Apenas em sistemas operacionais, sob LGPD |
| Evidências privadas, anexos reais e transcrições | Repositório privado ou artefatos internos |
| Caminhos internos e arquivos de bancada | Ambiente de trabalho, fora do conteúdo público |
| Decisões técnicas ainda não aprovadas | Rascunho interno até a deliberação formal |
| CSV interno bruto da matriz de trabalho | Bancada de análise; ao portal vai apenas conteúdo curado |

Quando um material sensível precisar ser referenciado, publique somente um resumo
público sem dados reais, conforme a ADR-0002.

## Aprovação editorial

A promoção de um requisito para o portal é confirmada quando:

1. Todos os itens aplicáveis do checklist estão atendidos ou registrados como
   lacuna honesta.
2. O conteúdo nasce de dado estruturado versionado no `uniplus-developers` após
   curadoria, e não da matriz interna de trabalho.
3. As validações do portal passam: build do Docusaurus, testes E2E de smoke e os
   testes de acessibilidade das rotas afetadas.
4. O Tech Lead aprova a publicação no fluxo de revisão de PR.

## Critérios de aceite do checklist

- O checklist distingue claramente curadoria interna de publicação pública.
- Cada item é verificável e mapeia para um campo ou regra da taxonomia.
- A página não introduz vocabulário novo nem duplica a autoridade da taxonomia
  ou da ADR-0002.
- Nenhum exemplo usa dado real; lacunas aparecem como status explícito.

## Referências

- [Taxonomia de rastreabilidade de requisitos](../taxonomia-rastreabilidade-requisitos.md).
- [ADR-0002 do `uniplus-developers`: Governança editorial e fontes canônicas do portal público](https://github.com/unifesspa-edu-br/uniplus-developers/blob/main/docs/adrs/0002-governanca-editorial-fontes-canonicas-portal-publico.md).
