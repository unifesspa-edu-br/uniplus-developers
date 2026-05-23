---
sidebar_position: 2
title: Taxonomia de rastreabilidade de requisitos
description: Convenções públicas para identificar, classificar, publicar e rastrear requisitos do Uni+.
---

# Taxonomia de rastreabilidade de requisitos

Este documento define a taxonomia pública usada pelo Uni+ para identificar,
classificar, publicar e rastrear requisitos. Ele serve como apoio para páginas
de requisitos, regras de negócio, cenários BDD, issues, ADRs, PRs, testes e
documentação de API.

A taxonomia não substitui os artefatos técnicos dos repositórios donos. Ela
estabelece a linguagem comum que permite navegar da necessidade institucional
até a implementação validada.

## Objetivos

- Manter requisitos com identificação estável durante todo o ciclo de vida do
  produto.
- Separar requisitos de negócio, requisitos funcionais, regras de negócio,
  atributos de qualidade, segurança, conformidade, dados e integrações.
- Evitar que itens agregadores virem issues de implementação ambíguas.
- Permitir rastreabilidade bidirecional: origem, requisito, decisão, issue, PR,
  código, teste e documentação pública.
- Publicar apenas conteúdo seguro, curado e adequado ao portal público.

## Princípios

### Identificador imutável

Todo requisito publicado recebe um identificador `UNI-REQ-NNNN`, com quatro
dígitos e preenchimento por zero. O identificador é opaco: não codifica módulo,
tipo, prioridade, status ou recorte.

Um requisito nunca é renumerado. Se deixar de representar o produto, deve ser
marcado como histórico e apontar a substituição, quando houver.

### Fonte estruturada e página humana

O registro estruturado é a base de validação e geração. As páginas do portal são
a apresentação humana desse registro. Conteúdo narrativo é permitido, mas deve
apontar para requisitos, decisões ou contratos verificáveis.

### Status honesto

Um requisito aprovado, proposto, dependente de decisão externa ou planejado para
incremento futuro deve aparecer com esse estado explícito. O portal não deve
tratar proposta como implementação concluída.

## Campos públicos mínimos

Cada requisito publicado deve ter, no mínimo:

| Campo | Função |
|---|---|
| `requisito_id` | Chave estável no formato `UNI-REQ-NNNN`. |
| `titulo` | Nome curto do requisito. |
| `enunciado` | Declaração verificável do que o produto deve atender. |
| `grupo` | Família de classificação usada para navegação e relatórios. |
| `tipo` | Natureza do requisito. |
| `nivel` | Posição na árvore de rastreabilidade. |
| `parent_id` | Requisito agregador, quando existir. |
| `modulo` | Recorte de produto ou plataforma. |
| `recorte` | Fronteira de entrega. |
| `status` | Ciclo de vida atual. |
| `prioridade` | Prioridade MoSCoW. |
| `criterios_aceite` | Condições verificáveis de aceite. |
| `verificacao` | Evidência esperada: teste, revisão, E2E, contrato ou validação manual. |
| `pagina_developers` | Página pública relacionada no portal. |
| `owner` | Responsável institucional ou técnico pelo acompanhamento. |

Campos de rastreabilidade como ADRs, issues, PRs, código e testes podem iniciar
vazios quando o requisito ainda não foi implementado. Eles devem ser preenchidos
à medida que a entrega avança.

## Classificação por grupo

`grupo` define a família de navegação do requisito.

| Valor | Uso |
|---|---|
| `negocio` | Capacidade, resultado ou regra institucional do domínio. |
| `funcional` | Comportamento observável do sistema. |
| `dados` | Estrutura, identidade, integridade e ciclo de vida de dados. |
| `qualidade` | Atributos não funcionais, validação, robustez e regressão. |
| `seguranca` | Controles técnicos de segurança, como cifra, masking, auditoria e proteção de acesso. |
| `desempenho` | Metas de performance, escala, carga ou SLA. |
| `conformidade` | Exigências legais, regulatórias ou institucionais. |
| `integracao` | Integração com sistemas externos ou entre módulos. |
| `governanca` | Documentação, backlog, rastreabilidade e processo decisório. |

## Classificação por tipo

`tipo` define a natureza do item registrado.

| Valor | Uso |
|---|---|
| `requisito_negocio` | Necessidade institucional ou capacidade de alto nível. |
| `requisito_funcional` | Função observável que o sistema deve executar. |
| `regra_negocio` | Restrição, política ou condição de domínio. |
| `requisito_qualidade` | Critério de qualidade, validação ou robustez. |
| `requisito_seguranca` | Controle técnico de segurança. |
| `requisito_conformidade` | Atendimento legal, normativo ou institucional. |
| `requisito_dados` | Estrutura, retenção, origem ou integridade de dados. |
| `requisito_integracao` | Troca de dados ou contrato com outro sistema. |
| `requisito_governanca` | Requisito de processo, documentação ou rastreabilidade. |
| `restricao` | Limite técnico, operacional ou institucional. |
| `decisao` | Item que exige decisão formal antes da implementação. |
| `dependencia` | Dependência externa ou pré-condição. |
| `incremento` | Entrega futura registrada para manter contexto. |

## Nível hierárquico

`nivel` define onde o item aparece na árvore de rastreabilidade.

| Valor | Uso |
|---|---|
| `modulo` | Agrupador de alto nível, como Seleção ou Ingresso. |
| `capacidade` | Capacidade de produto composta por requisitos filhos. |
| `requisito` | Requisito rastreável e verificável. |
| `regra` | Regra vinculada a um requisito ou capacidade. |
| `decisao` | Ponto que depende de ADR ou deliberação formal. |
| `dependencia` | Dependência de outro sistema, área ou decisão externa. |

`nivel` e `tipo` são eixos diferentes. Um item pode ter `nivel = regra` e
`tipo = regra_negocio`; outro pode ter `nivel = decisao` e
`tipo = requisito_governanca`, conforme o papel que ocupa na árvore.

## Recorte de entrega

`recorte` separa o que entra no MVP, o que é fundação, o que é incremento
obrigatório e o que fica registrado fora do escopo imediato.

| Valor | Uso |
|---|---|
| `mvp` | Entrega necessária para o fluxo principal da primeira versão. |
| `fundacao` | Base técnica ou conceitual exigida para sustentar entregas futuras. |
| `incremento_obrigatorio` | Item não entregue no primeiro corte, mas necessário para completar o produto. |
| `fora_escopo` | Item conhecido, mas explicitamente fora da entrega atual. |
| `governanca` | Trabalho de documentação, rastreabilidade, decisão ou organização. |

## Ciclo de vida

| Valor | Uso |
|---|---|
| `aprovado` | Requisito aceito para orientar backlog, design e implementação. |
| `proposto` | Item em análise, ainda sujeito a revisão. |
| `dependencia_externa` | Depende de área, norma, sistema ou deliberação externa. |
| `incremento_planejado` | Registrado para evolução posterior. |
| `historico` | Preservado para rastreabilidade, sem representar o estado atual do produto. |

## Política de backlog

Nem todo requisito deve virar issue de implementação direta.

| Valor | Uso |
|---|---|
| `agregador` | Agrupa filhos; pode originar Epic ou Feature, mas não fecha PR sozinho. |
| `implementavel` | Pode virar issue de entrega. |
| `criterio_verificacao` | Deve aparecer como critério de aceite, subissue ou task de validação. |
| `decisao` | Exige ADR ou deliberação antes de implementação definitiva. |
| `dependencia_externa` | Exige validação fora do time de implementação. |
| `incremento_futuro` | Não entra no backlog imediato. |
| `governanca` | Trabalho de documentação, curadoria, rastreabilidade ou processo. |

## Vínculo com issues

Toda issue de implementação deve referenciar pelo menos um `requisito_id` e
trazer critérios de aceite rastreáveis. Uma issue pode cobrir mais de um
requisito apenas quando eles forem inseparáveis na entrega.

Formato recomendado de título:

```text
[UNI-REQ-0028] Implementar gate documental no submit da inscrição
```

Itens `agregador` não devem ser usados como única justificativa de PR de
implementação. PRs devem fechar requisitos filhos implementáveis, critérios de
verificação, decisões resolvidas ou tarefas de governança.

## Cadeia de rastreabilidade

A cadeia mínima esperada é:

```text
origem -> requisito -> decisão -> issue -> PR -> código -> teste -> documentação
```

Quando alguma etapa ainda não existir, o campo correspondente permanece vazio ou
com status explícito. O vazio deve indicar ausência real de implementação ou
validação, não esquecimento editorial.

## Publicação no portal

As páginas derivadas desta taxonomia devem usar as seguintes rotas:

| Página | Finalidade |
|---|---|
| `/produto/requisitos/` | Registro filtrável de requisitos. |
| `/produto/regras-negocio/` | Regras de negócio publicáveis por módulo e fluxo. |
| `/produto/rastreabilidade/` | Matriz requisito, issue, ADR, PR, código, teste e documentação. |
| `/produto/mvp-selecao/` | Recorte do MVP do módulo Seleção. |

Antes da publicação, o conteúdo deve ser revisado para remover dados reais,
corrigir vocabulário divergente e garantir que links externos apontem para os
artefatos publicados nos repositórios donos.

## Critérios de aceite da taxonomia

- O identificador `UNI-REQ-NNNN` é único, estável e não carrega significado
  semântico.
- Todo requisito publicado possui grupo, tipo, nível, status, recorte, critérios
  de aceite e verificação esperada.
- Requisitos agregadores não são tratados como entregas implementáveis por si
  só.
- A publicação pública distingue requisito aprovado, proposta, dependência e
  incremento futuro.
- Links para ADRs, contratos, schemas e código apontam para arquivos publicados
  na branch `main` dos repositórios donos.
- Exemplos usam dados fictícios.

## Referências

- [ISO/IEC/IEEE 29148:2018 — Systems and software engineering, life cycle processes, requirements engineering](https://www.iso.org/standard/72089.html).
- [NIST SP 800-218 — Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final).
