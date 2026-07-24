---
sidebar_position: 3
title: Coleta de fatos e derivação de modalidade
description: Como o sistema coleta as informações do candidato e calcula a modalidade de concorrência a partir delas — modelo de negócio do módulo Seleção.
---

# Coleta de fatos do candidato e derivação de modalidade — modelo de negócio

Documento de referência funcional para Análise de Requisitos. Descreve, em linguagem de negócio (sem termos de programação), **como o sistema coleta as informações do candidato e como calcula a modalidade de concorrência** a partir delas. É um aprofundamento do modelo geral do módulo Seleção, voltado à validação e ao refinamento pela área de negócio.

Uni+ · Sistema Unificado Unifesspa · Módulo Seleção.

## Como ler este documento

O texto descreve o comportamento de negócio em linguagem corrente. Cada assunto aponta o requisito correspondente com código estável (`UNI-REQ-NNNN`) já registrado na [tabela de requisitos](../requisitos/index.mdx), para facilitar referência em reuniões, editais e homologação. A rastreabilidade completa está no final. Onde uma regra de congelamento é citada, usa-se a marca `RN08` (integridade do edital publicado), detalhada nas [regras de negócio](../regras-negocio/conceitos.mdx).

## Questões em refinamento

- **Quantas cotas o candidato ocupa ao mesmo tempo.** Uma fonte limita a inscrição a uma reserva; outra, mais recente, define um conjunto de várias reservas simultâneas (por exemplo, cor/raça e renda juntas). Este documento adota o conjunto múltiplo, alinhado à Lei 14.723/2023 — a confirmar na especificação.
- **Limite de renda na fronteira exata.** A autodeclaração implementada no sistema pergunta "renda per capita **igual ou inferior** a 1 salário mínimo", aderente à Lei 12.711/2012 (art. 1º, parágrafo único). O registro de requisitos (`UNI-REQ-0076`) ainda descreve "inferior a" — divergência a reconciliar; o PO confirma o texto final e o tratamento de quem tem renda exatamente igual a 1 salário mínimo.
- **Cor/raça de quem não é de escola pública.** Hoje a pergunta de cor/raça só aparece para egressos de escola pública. Se um documento passar a depender de cor/raça para outros candidatos, é preciso decidir se cor/raça deve ser coletada de todos.

---

## 1. O que são os "fatos" do candidato

O sistema trabalha com **fatos** sobre o candidato — informações elementares que descrevem sua situação. Há três naturezas de fato (`UNI-REQ-0065`):

- **Fato declarado** — o candidato responde diretamente, num campo do formulário de inscrição, escolhendo um valor de uma lista pré-definida (nunca texto livre). Exemplos: autodeclaração de deficiência, de cor/raça, de quilombola, de baixa renda, de egresso de escola pública, e as opções de "concorrer" a cada cota.
- **Fato derivado** — o sistema **calcula** a partir de outros fatos, seguindo uma regra configurada. O exemplo central é a **modalidade de concorrência**: o candidato nunca escolhe "cota de renda com PPI"; ele responde às perguntas e o sistema compõe o conjunto de modalidades (seção 5).
- **Fato de integração** — vem de outra fonte ou sistema, com origem própria e resolvido como os demais fatos (sem tratamento especial por origem). A natureza é suportada no modelo desde já; o que ainda não existe é uma fonte concreta de integração conectada.

Cada fato tem um **vocabulário fechado**: os valores possíveis são definidos por configuração (não em código) e descritos, com uma descrição do significado de cada valor para orientar a escolha. Cada valor tem código próprio, ordem estável e é congelado no edital na publicação (`RN08`). O vocabulário é gerido pela equipe do sistema (não é uma tela de cadastro aberta ao administrador do certame).

> **Por que separar declarado de derivado.** Modelar a modalidade como fato calculado — e não como escolha direta — evita erro e fraude, garante que a Lei de Cotas seja aplicada de forma uniforme, e permite mudar as regras de composição por configuração, sem desenvolvimento.

## 2. O par elegibilidade + opt-in

Cada cota é coletada em **duas perguntas independentes** (`UNI-REQ-0072`):

- **Elegibilidade** — a autodeclaração (ex.: "você é pessoa com deficiência?").
- **Opt-in** — a escolha de concorrer (ex.: "deseja concorrer à cota de pessoa com deficiência?").

A elegibilidade sozinha **não** coloca o candidato na cota — a escolha de concorrer é o que decide. Um candidato pode ser elegível e optar por não concorrer àquela reserva. Só o par elegibilidade **mais** opt-in habilita a contribuição daquela modalidade; a concorrência efetiva ainda depende da derivação e da interseção com a oferta do processo (seção 5).

## 3. O formulário é condicional

Nem toda pergunta aparece para todo candidato. Cada campo pode ter **pré-condições** sobre respostas anteriores: ele só é apresentado quando as respostas já dadas as satisfazem (`UNI-REQ-0073`). É o que faz o formulário:

- abrir a pergunta "concorrer à cota X?" só depois do "sim" na autodeclaração de X;
- ocultar o bloco quilombola para quem se declara indígena (exclusão mútua);
- só perguntar renda para quem é de escola pública (gate de escola pública).

As pré-condições são **configuradas**, não programadas, e ficam congeladas na publicação. Uma regra importante de integridade: uma pergunta só pode depender de respostas **anteriores** — o formulário tem uma ordem, e nenhuma pergunta depende de algo que ainda virá (seção 6).

## 4. "Não se aplica" é diferente de "pendente"

Uma pergunta em branco não significa sempre a mesma coisa. O sistema distingue os estados, e a diferença decide se algo é dispensado ou fica pendente (`UNI-REQ-0074`):

| Situação | Estado | Efeito de negócio |
|---|---|---|
| A pré-condição da pergunta é comprovadamente falsa (a pergunta não se aplica àquele caso — ex.: renda para quem não é de escola pública) | **Não se aplica** | Resultado **definitivo**: aquela cota / aquele caminho é dispensado. |
| A pergunta se aplica, apareceu, mas ainda não foi respondida | **Pendente** | Fica pendente, nunca dispensado em silêncio. |
| Ainda não se sabe se a pergunta se aplica, porque depende de outra resposta que falta | **Pendente** | Também pendente — não se conclui "não se aplica" enquanto houver dúvida. |

Uma consequência importante da transição para **não se aplica**: quando uma mudança numa resposta anterior torna um campo a jusante inaplicável, a resposta que já estava gravada nesse campo a jusante é **invalidada** — enquanto a resposta anterior que causou a mudança é preservada. Assim, reabrir um caminho nunca reaproveita em silêncio um opt-in ou uma renda antigos que deixaram de valer, evitando derivar modalidade ou exigir documento com base em dado obsoleto.

> **Princípio da segurança (na dúvida, não dispensa).** Sempre que falta uma informação necessária para decidir se algo se aplica, o sistema mantém o item pendente — nunca o descarta em silêncio. Um caminho só é dispensado quando há certeza de que realmente não se aplica.

## 5. Como a modalidade de concorrência é calculada

A **modalidade é um fato derivado**: o sistema a calcula a partir das autodeclarações e opt-ins, aplicando a composição da Lei de Cotas expressa como **configuração** (`UNI-REQ-0075`, `UNI-REQ-0076`).

A regra de derivação é uma **lista de regrinhas** do tipo "**quando** tais condições valem, **contribui** com tal modalidade". A avaliação **soma** (une) as modalidades de todas as regrinhas cujas condições são verdadeiras; regra falsa ou não-aplicável não contribui. A composição da Lei de Cotas — o par autodeclaração+concorrer, a concorrência dupla (Lei 14.723/2023), a relação entre cotas de renda e independentes de renda, as exclusões mútuas, o gate de escola pública — é toda expressa nessas regrinhas, não em código que ramifica por tipo de processo.

Dois pontos de negócio importantes:

- **Restrição à oferta do processo.** O domínio de contribuição da regra é o próprio **conjunto de modalidades que o processo oferta**. Uma regra que contribua uma modalidade fora da oferta é **recusada na configuração e barrada na publicação** (fail-closed), não filtrada em silêncio em tempo de inscrição. A interseção com a oferta é, assim, garantida por construção — o candidato nunca concorre a uma modalidade que o edital não oferece.
- **Todo código contribuído é do vocabulário.** Uma regrinha só pode contribuir uma modalidade que exista no domínio congelado; um código desconhecido (por exemplo, um rótulo de exibição usado como se fosse código) é recusado na configuração, nunca traduzido.

Um fato derivado só fica resolvido quando **todas as informações de que depende** já resolveram; se algo de que ele depende está pendente, o derivado também fica pendente.

## 6. Ordem de coleta e o grafo de dependências

O sistema garante uma **ordem lógica** entre campos, fatos e documentos (`UNI-REQ-0077`): uma informação nunca é usada antes de existir. Um documento que só é exigido de quem concorre à cota de renda não aparece antes de o candidato responder à pergunta de renda; uma informação usada só numa fase posterior não dispara exigência na inscrição.

Internamente, as dependências entre campos (o que produz um fato), pré-condições (o que decide se um campo aparece), regras de derivação (de que fatos a modalidade depende) e gatilhos de documento (que fato exige um documento) formam um **encadeamento sem ciclos** — não pode haver dependência circular (A depende de B que depende de A). Essa consistência é verificada na configuração; um encadeamento circular impede a publicação.

Há ainda uma proteção adicional: enquanto o fato que dispararia um documento ainda não pode ser resolvido, aquele documento fica com a emissão **bloqueada** — não é cobrado prematuramente (`UNI-REQ-0077`, que compõe com a fronteira ativa de emissão do `UNI-REQ-0070`).

> Exemplo. Uma exigência de comprovante de renda é cobrada de quem concorre à cota de renda. Mas a pergunta "concorrer à cota de renda?" só aparece depois de o candidato declarar que é egresso de escola pública. Enquanto ele ainda não respondeu à pergunta de escola pública, não se sabe se a cota de renda se aplica ao seu caso — então a exigência de renda fica **bloqueada**: não é listada como documento faltante (não se cobra prematuramente) nem é dispensada em silêncio. Quando o candidato responde à pergunta de escola pública, a de renda passa a valer, e só então o comprovante de renda passa a ser exigido. A fronteira do fato também avança por **supressão**: se o candidato responde que não é de escola pública, a pergunta de renda deixa de se aplicar e a exigência de renda é dispensada — sem ficar à espera de uma resposta que nunca virá. E, uma vez que uma exigência aplicável fique pendente, ela é **mostrada como pendente**, nunca escondida. O mesmo vale entre fases: um documento preso a um fato que só se resolve na habilitação nunca é cobrado já na inscrição.

## 7. Tudo congela na publicação

Toda essa configuração — o vocabulário de fatos e seus valores, as pré-condições, as regras de derivação, a ordem de coleta e o encadeamento de dependências — é **congelada** no edital no momento da publicação (`UNI-REQ-0078`, `RN08`). A partir daí, o resultado de um candidato é calculado sempre pela versão congelada: mudanças posteriores na configuração viva não alteram um edital já publicado. Isso preserva a integridade e a auditabilidade — dois candidatos com as mesmas respostas obtêm o mesmo resultado, e uma reavaliação reflete a configuração vigente à época. Até a **versão da lógica de cálculo** é congelada, para que a evolução do sistema não mude editais antigos.

---

## 8. Rastreabilidade

Cada comportamento acima corresponde a um requisito com código estável na [tabela de requisitos](../requisitos/index.mdx) (`UNI-REQ-NNNN`):

| Requisito | Título (acervo) | Assunto de negócio |
|---|---|---|
| `UNI-REQ-0065` | Vocabulário de fatos multi-fonte com domínio descritível | O que são os fatos e seus valores descritíveis (seção 1). |
| `UNI-REQ-0070` | Consequência por nó e fronteira ativa de emissão | Consequência de documento por nó e fronteira ativa de emissão (seção 6). |
| `UNI-REQ-0071` | Snapshot conjunto autossuficiente de documentos exigidos | Conjunto congelado autossuficiente na publicação. |
| `UNI-REQ-0072` | Fatos declarados por par elegibilidade + opt-in | Autodeclaração e escolha de concorrer (seção 2). |
| `UNI-REQ-0073` | Grafo de pré-condições da coleta e gate de escola pública | Formulário condicional e exclusões (seção 3). |
| `UNI-REQ-0074` | Estado tipado não-aplicável versus indeterminado | "Não se aplica" versus "pendente" (seção 4). |
| `UNI-REQ-0075` | Fato derivado com regra de derivação congelada | Regra "quando/contribui" (seção 5). |
| `UNI-REQ-0076` | Derivação de modalidade por configuração (Lei de Cotas) | Cálculo da modalidade e interseção com a oferta (seção 5). |
| `UNI-REQ-0077` | Ordem de coleta, grafo conjunto e máscara de emissão | Ordem lógica, encadeamento sem ciclos e máscara de emissão bloqueada — documento não cobrado antes de o fato poder resolver (seção 6). |
| `UNI-REQ-0078` | Determinismo e congelamento conjunto do grafo (`RN08`) | Congelamento e reprodutibilidade na publicação (seção 7). |

> Estes requisitos são filhos da configuração de documentos exigidos por gatilho e fase (`UNI-REQ-0016`), que agrega a coleta condicional, o estado tipado dos fatos, a derivação declarativa de modalidade e o congelamento conjunto.
