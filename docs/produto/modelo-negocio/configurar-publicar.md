---
sidebar_position: 2
title: Configurar e publicar um processo seletivo
description: A jornada do administrador para cadastrar, configurar e publicar um Processo Seletivo até torná-lo oficial — modelo de negócio do módulo Seleção.
---

# Configuração e publicação de um Processo Seletivo pelo administrador — modelo de negócio

Documento de referência funcional para Análise de Requisitos. Descreve, em linguagem de negócio (sem termos de programação), **a jornada do administrador do CEPS para cadastrar, configurar e publicar um Processo Seletivo** — a experiência administrativa de montar um edital até torná-lo oficial. É um aprofundamento do modelo geral do módulo Seleção, voltado à validação e ao refinamento pela área de negócio.

Uni+ · Sistema Unificado Unifesspa · Módulo Seleção. Escopo: da criação à primeira publicação (as telas operacionais posteriores — inscrição, homologação, notas, classificação, recursos — são etapas seguintes; a alteração por retificação, embora já suportada, tem jornada própria, fora deste primeiro recorte).

## Como ler este documento

O texto descreve o comportamento de negócio em linguagem corrente. Cada assunto aponta o requisito correspondente com código estável (`UNI-REQ-NNNN`) já registrado na [tabela de requisitos](../requisitos/index.mdx), para facilitar referência em reuniões, editais e homologação. A rastreabilidade completa está no final. A regra de integridade do edital publicado é referida pela marca `RN08`, detalhada nas [regras de negócio](../regras-negocio/conceitos.mdx).

## 1. Quem configura e o que é um "rascunho"

A configuração de um Processo Seletivo é feita pelo **administrador do CEPS** — o papel institucional responsável por montar o edital. Enquanto o processo não é publicado, ele está em **rascunho**: uma configuração editável, ainda não oficial, que pode ser montada aos poucos e revisada quantas vezes for preciso (`UNI-REQ-0014`).

A configuração é organizada em **dimensões independentes** (etapas, vagas, documentos, formulário, etc.). O administrador preenche cada uma quando quiser; o sistema mostra o que já está completo e o que falta. A publicação é um passo final, só liberado quando tudo está conforme (seção 3).

> **Pré-requisito: os cadastros base.** Várias dimensões consomem cadastros institucionais que existem antes do processo — cidades, campi e locais de oferta (`UNI-REQ-0009`), cursos e ofertas, modalidades de concorrência (`UNI-REQ-0011`), condições de atendimento, tipos de documento e fases do cronograma. Esses cadastros são o vocabulário a partir do qual o administrador monta o processo (`UNI-REQ-0006`).

## 2. As dimensões da configuração

### 2.1 Dados gerais
O administrador identifica o processo (nome, tipo de processo, origem dos candidatos). O tipo de processo (por exemplo, SiSU, vestibular remanescente, processo indígena/quilombola) traz suas próprias regras e formulários.

### 2.2 Etapas, pesos e critérios de desempate
Configuram-se as **etapas** pontuadas (prova objetiva, redação, entrevista, análise de histórico, banca de heteroidentificação), cada uma com seu caráter (classificatória, eliminatória ou ambas), peso e nota mínima. Definem-se também os **critérios de desempate**, em ordem (por exemplo: idoso, maior nota em determinada etapa, data de nascimento) (`UNI-REQ-0015`). Um processo pode não ter etapa pontuada (caso do SiSU, com nota importada).

### 2.3 Cronograma de fases
Monta-se o **cronograma** do certame — as fases (inscrição, resultado preliminar, recurso, resultado final, habilitação), com suas datas, as bancas requeridas e a regra de recurso de cada fase. As fases usam um vocabulário de fases já cadastrado; cada fase do processo se vincula a uma fase canônica.

### 2.4 Vagas, modalidades e a cascata de remanejamento
Para cada oferta de curso, configura-se a **distribuição de vagas**: o total, os parâmetros de cálculo e, quando o processo segue a Lei de Cotas, a referência demográfica e as modalidades ofertadas (ampla concorrência e as reservas legais) (`UNI-REQ-0011`). Configura-se também a **cascata de remanejamento** — a ordem congelada pela qual as vagas de uma cota não preenchida migram para outras modalidades (`UNI-REQ-0056`). Essa ordem é semântica e congela na publicação.

### 2.5 Atendimento especializado
Configura-se a **oferta de atendimento especializado** — as condições (por exemplo, pessoa com deficiência), os recursos de acessibilidade (ledor, prova ampliada, intérprete) e os tipos de deficiência, sendo que tipo de deficiência só é aceito sob a condição de pessoa com deficiência.

### 2.6 Classificação e bônus regional
Define-se a **fórmula de classificação** (como a nota final é composta a partir das etapas e seus pesos e o arredondamento) e as **regras de eliminação** (nota mínima por etapa, corte de redação, etc.) (`UNI-REQ-0015`). A ordem de alocação de vagas tem duas partes distintas: a precedência entre 1ª e 2ª opção de curso é **regra fixa** (`RN04`), não configurável; apenas a cascata de remanejamento entre modalidades (`UNI-REQ-0056`) é configurada e congelada por edital. Opcionalmente, configura-se o **bônus regional** — um acréscimo percentual à nota final, com seu critério de elegibilidade.

### 2.7 Documentos exigidos
Configuram-se os **documentos comprobatórios** exigidos, por **condição** e por **fase** (`UNI-REQ-0016`). Cada exigência declara de quem é cobrada — de todos, ou de quem satisfaz um **gatilho** sobre os fatos do candidato (por exemplo, "exigido de quem concorre a uma cota de renda"). Definem-se a base legal de cada exigência (`UNI-REQ-0059`), os formatos e o tamanho aceitos, a idade máxima de emissão, e a estrutura da comprovação (documentos alternativos, grupos "um dos seguintes", repetição por membro do núcleo familiar). Quando um documento depende da idade do candidato, configura-se a **referência temporal** que resolve a idade (a data e a fase de referência).

### 2.8 Formulário de inscrição e coleta de fatos
Configura-se o **formulário de inscrição** do processo — as perguntas que o candidato responderá, com seus campos condicionais (`UNI-REQ-0017`). É aqui que se define a **coleta de fatos** (o que o candidato declara e em que ordem, com as pré-condições que decidem quando cada campo aparece) e as **regras de derivação da modalidade** (como o sistema calcula a modalidade a partir das respostas). O detalhamento de negócio da coleta e da derivação está na página [Coleta de fatos e derivação de modalidade](./coleta-fatos-derivacao.md) (`UNI-REQ-0072` a `UNI-REQ-0078`).

### 2.9 Taxa de inscrição e isenção
O administrador declara se o processo **cobra taxa de inscrição** e, quando cobrar, o **valor**. A ausência de declaração bloqueia a publicação — nunca é interpretada como "não cobra" (`UNI-REQ-0099`). "Não cobrar" e "isentar" são decisões distintas e mutuamente exclusivas: um processo que não cobra não aceita nenhum critério de isenção configurado (`UNI-REQ-0100`). Um processo que cobra pode, opcionalmente, referenciar **fundamentos de isenção** — Cadastro Único e doação de medula óssea, os dois citados para o Curso de Medicina —, sem que isso decida ainda a forma de comprovação ou quem analisa o pedido (`UNI-REQ-0101`).

> **O que ainda não existe.** Solicitar, comprovar, analisar, deferir e recorrer da isenção — e, após indeferimento, gerar e pagar a taxa normalmente — pertencem à frente de inscrição, que depende do agregado de Inscrição, ainda inexistente, e não fazem parte desta primeira publicação. A verificação por fundamento (SISTAC para Cadastro Único, documento com análise humana para doação de medula óssea), o recurso em instância única contra indeferimento e a continuidade da inscrição após indeferimento já têm decisão de negócio registrada, aguardando essa capacidade (`UNI-REQ-0102` a `UNI-REQ-0105`). O mecanismo de arrecadação (PagTesouro via Sistema Próprio) foi escolhido, mas depende de cadastro SISGRU ainda pendente na PROAD (`UNI-REQ-0109`); a base legal do fundamento Cadastro Único também está pendente de confirmação pelo Jurídico e pelo DPO (`UNI-REQ-0110`).

## 3. Revisão de conformidade e publicação

Antes de publicar, o administrador revê o resumo da configuração e as **pendências de conformidade**. Há **duas conformidades** que precisam estar satisfeitas:

- **Conformidade estrutural** — as dimensões obrigatórias estão completas e coerentes (por exemplo, um critério de desempate não pode referenciar uma etapa que não existe; uma exigência que determina resultado precisa de base legal).
- **Conformidade legal** — as regras de obrigatoriedade legal aplicáveis ao processo estão atendidas, avaliadas na data de referência do certame (o início do período de inscrição).

Enquanto houver qualquer pendência, a **publicação fica bloqueada**, e as pendências são listadas de forma acionável. Para publicar, o administrador anexa o **documento oficial do edital** (o PDF) e informa os dados do ato (número do edital, período de inscrição). A publicação cria a **cópia oficial imutável** da configuração — o snapshot congelado (`UNI-REQ-0019`, `UNI-REQ-0020`, `RN08`).

> **Por que congelar.** A cópia congelada é o documento de maior peso jurídico do processo: é ela que sustenta o resultado do certame. Dois candidatos com as mesmas respostas obtêm o mesmo resultado, e qualquer reavaliação reflete exatamente a configuração vigente à época da publicação — mesmo que a configuração viva mude depois.

## 4. O que muda depois de publicar

Publicado o processo, a configuração **não pode mais ser editada diretamente** (`UNI-REQ-0022`). Toda a validação em runtime (a inscrição do candidato, a exigência de documentos, o cálculo da modalidade) passa a ler a **cópia congelada**, não a configuração viva — de modo que mexer na configuração de um processo já publicado não altera o resultado (imunidade pós-publicação, `UNI-REQ-0062`, `UNI-REQ-0063`).

Uma alteração legítima de um edital publicado (mudança de prazo, vagas, cota, peso, bônus, documentos ou formulário) só acontece por **retificação** — um novo ato que cria um **novo Edital**, com um **novo snapshot congelado** e o motivo registrado, preservando o histórico (`UNI-REQ-0021`). A capacidade já é suportada; o detalhamento da sua jornada está fora do escopo desta primeira publicação.

---

## 5. Rastreabilidade

Cada comportamento acima corresponde a um requisito com código estável no acervo (UNI-REQ-NNNN):

| Requisito | Título (acervo) | Assunto de negócio |
|---|---|---|
| `UNI-REQ-0006` | Cadastros base do processo seletivo | Vocabulário institucional que a configuração consome (seção 1). |
| `UNI-REQ-0009` | Cidade, Campus e LocalOferta | Cadastros de localidade e oferta. |
| `UNI-REQ-0011` | Modalidade de concorrência | Modalidades (ampla + reservas legais) usadas na distribuição de vagas (2.4). |
| `UNI-REQ-0014` | Configuração do Processo Seletivo | O rascunho editável e suas dimensões (seções 1–2). |
| `UNI-REQ-0015` | Configurar etapas, critérios e bônus | Etapas, pesos, desempate, classificação e bônus (2.2, 2.6). |
| `UNI-REQ-0016` | Configurar documentos exigidos por gatilho e fase | Documentos por condição e fase (2.7). |
| `UNI-REQ-0017` | Formulário configurável de inscrição | Formulário e campos condicionais (2.8). |
| `UNI-REQ-0099` | Taxa de inscrição e isenção | Declaração de cobrança e valor da taxa (2.9). |
| `UNI-REQ-0100` | Não cobrar e isentar são mutuamente exclusivas | Processo sem cobrança não aceita isenção (2.9). |
| `UNI-REQ-0101` | Fundamentos de isenção referenciáveis | Cadastro Único e doação de medula óssea configuráveis (2.9). |
| `UNI-REQ-0056` | Configurar cascata de remanejamento de cotas | Ordem congelada de migração de vagas (2.4). |
| `UNI-REQ-0059` | Base legal por exigência com validação de publicação | Base legal das exigências documentais (2.7). |
| `UNI-REQ-0019` | Publicação do Processo Seletivo com Versão de Configuração imutável | Publicação e cópia congelada (seção 3). |
| `UNI-REQ-0020` | Canonicalização estável da configuração congelada | Reprodutibilidade da cópia congelada (seção 3). |
| `UNI-REQ-0022` | Bloquear mutação direta após publicação | Configuração não editável após publicar (seção 4). |
| `UNI-REQ-0062` / 0063 | Imunidade pós-publicação (runtime lê o snapshot) | Runtime lê a cópia congelada, não a viva (seção 4). |
| `UNI-REQ-0021` | Retificação do Processo Seletivo por novo Edital | Alteração de edital publicado só por retificação (seção 4). |

> A coleta de fatos e a derivação de modalidade (2.8) têm modelo de negócio próprio na página [Coleta de fatos e derivação de modalidade](./coleta-fatos-derivacao.md) (`UNI-REQ-0065`, `UNI-REQ-0070` a `UNI-REQ-0078`).
