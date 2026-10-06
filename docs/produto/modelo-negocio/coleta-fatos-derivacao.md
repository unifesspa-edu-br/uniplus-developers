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
- **Cor/raça de quem não é de escola pública.** Decidido pelo PO em 06/10/2026: a autodeclaração de cor/raça faz parte do conjunto básico (`UNI-REQ-0151`) e é coletada de todos os candidatos; só o opt-in de concorrer às vagas de pretos, pardos e indígenas segue o gate de escola pública.

---

## 1. O que são os "fatos" do candidato

O sistema trabalha com **fatos** sobre o candidato — informações elementares que descrevem sua situação. Há três naturezas de fato (`UNI-REQ-0065`):

- **Fato declarado** — o candidato responde diretamente, num campo do formulário. As autodeclarações e as opções são escolhidas numa lista pré-definida, nunca digitadas; dados como nome, datas e endereço são digitados, com formato validado; nome, textos e endereço nunca entram em regra — do endereço, entram só a UF e o município, por derivação; data entra só por meio de derivado relativo à data de referência, como a faixa etária (`UNI-REQ-0143`). Exemplos: autodeclaração de deficiência, de cor/raça, de quilombola, de baixa renda, onde e como cursou o ensino médio, e as opções de "concorrer" a cada cota.
- **Fato derivado** — o sistema **calcula** a partir de outros fatos, seguindo uma regra configurada ou um mecanismo do próprio sistema (`UNI-REQ-0075`). O **egresso de escola pública** é do segundo tipo: o sistema o calcula de onde e como o candidato cursou o ensino médio, e o administrador não o configura (`UNI-REQ-0148`). O exemplo central é a **modalidade de concorrência**: o candidato nunca escolhe "cota de renda com PPI"; ele responde às perguntas e o sistema compõe o conjunto de modalidades (seção 5).
- **Fato de integração** — vem de outra fonte ou sistema, com origem própria e resolvido como os demais fatos (sem tratamento especial por origem). A natureza é suportada no modelo desde já; o que ainda não existe é uma fonte concreta de integração conectada.

Cada fato escolhido numa lista tem um **vocabulário fechado**: um conjunto definido de valores, com uma descrição do significado de cada valor para orientar a escolha. Cada valor tem código próprio, ordem estável e é congelado no edital na publicação (`RN08`). O administrador cadastra os seus fatos e os valores deles no módulo Configuração, e um valor já usado é desativado, nunca apagado (`UNI-REQ-0143`). Os fatos que a lei ou o motor do sistema definem são fatos de sistema, protegidos: o administrador edita só o nome e a descrição deles, e os vocabulários normativos, como cor/raça, sexo e a autodeclaração de deficiência, têm opções fixas, que ele não acrescenta nem desativa; o tipo de deficiência segue o cadastro institucional do atendimento especializado (`UNI-REQ-0012`). O mesmo vale para as duas perguntas da origem escolar, cuja lista só cresce por nova versão do sistema (`UNI-REQ-0148`).

> **Por que separar declarado de derivado.** Modelar a modalidade como fato calculado — e não como escolha direta — evita erro e fraude, garante que a Lei de Cotas seja aplicada de forma uniforme, e permite mudar as regras de composição por configuração, sem desenvolvimento.

## 2. O par elegibilidade + opt-in

Cada cota tem **dois fatos independentes** (`UNI-REQ-0072`):

- **Elegibilidade** — a autodeclaração (ex.: "você é pessoa com deficiência?"); a elegibilidade de escola pública não é perguntada, é calculada de onde e como o candidato cursou o ensino médio (`UNI-REQ-0148`).
- **Opt-in** — a escolha de concorrer (ex.: "deseja concorrer à cota de pessoa com deficiência?").

A elegibilidade sozinha **não** coloca o candidato na cota — a escolha de concorrer é o que decide. Um candidato pode ser elegível e optar por não concorrer àquela reserva. Só o par elegibilidade **mais** opt-in habilita a contribuição daquela modalidade; a concorrência efetiva ainda depende da derivação e da interseção com a oferta do processo (seção 5).

## 3. O formulário é condicional

Nem toda pergunta aparece para todo candidato. Cada campo pode ter **pré-condições** sobre respostas anteriores: ele só é apresentado quando as respostas já dadas as satisfazem (`UNI-REQ-0073`). É o que faz o formulário:

- abrir a pergunta "concorrer à cota X?" só para quem é elegível a X — pelo "sim" na autodeclaração ou, no caso da escola pública, pelo cálculo a partir da origem escolar;
- ocultar o bloco quilombola para quem se declara indígena (exclusão mútua);
- só perguntar o opt-in de cor/raça e as perguntas de quilombola e renda para quem optou pelas cotas da lei, isto é, é de escola pública e deseja concorrer às vagas de escola pública (gate de escola pública). A pergunta de deficiência fica fora do gate: quem não optou pelas cotas pode concorrer à ação afirmativa `AC_PCD` (`UNI-REQ-0142`).

A mesma dependência vale para as outras regras do campo (`UNI-REQ-0145`): uma pergunta pode ser **obrigatória** só para quem deu determinada resposta antes, e as **opções** de uma pergunta podem vir de respostas anteriores — os municípios da UF escolhida, ou a opção de lista de espera escolhida entre as opções de curso que o próprio candidato marcou. A regra pertence ao formulário, não ao dado: o mesmo dado pode ter regras diferentes em outro modelo de formulário ou em outro processo.

As pré-condições são **configuradas**, não programadas, e ficam congeladas na publicação. Uma regra importante de integridade: uma pergunta só pode depender de respostas **anteriores** ou de fatos que o sistema já conhece antes daquela fase, como o grupo da convocação — o formulário tem uma ordem, e nenhuma pergunta depende de algo que ainda virá (seção 6).

## 4. "Não se aplica" é diferente de "pendente"

Uma pergunta em branco não significa sempre a mesma coisa. O sistema distingue os estados, e a diferença decide se algo é dispensado, fica pendente ou segue como não informado (`UNI-REQ-0074`):

| Situação | Estado | Efeito de negócio |
|---|---|---|
| A pré-condição da pergunta é comprovadamente falsa (a pergunta não se aplica àquele caso — ex.: renda para quem não é de escola pública) | **Não se aplica** | Resultado **definitivo**: aquela cota / aquele caminho é dispensado. |
| A pergunta se aplica, apareceu e ainda não foi respondida — obrigatória, ou opcional com a etapa em aberto | **Pendente** | Fica pendente, nunca dispensado em silêncio. |
| Ainda não se sabe se a pergunta se aplica, porque depende de outra resposta que falta | **Pendente** | Também pendente — não se conclui "não se aplica" enquanto houver dúvida. |
| A pergunta é opcional, apareceu e foi deixada em branco, com a etapa concluída | **Não informado** | Resolvido sem valor: não trava as regras seguintes, e nenhuma condição sobre ele é verdadeira. Só pode ser opcional o campo que não alimenta derivação nem é citado por negação; o campo que alimenta é obrigatório sempre que aparece (`UNI-REQ-0074`). |

Uma consequência importante da transição para **não se aplica**: quando uma mudança numa resposta anterior torna um campo a jusante inaplicável, a resposta que já estava gravada nesse campo a jusante é **invalidada** — enquanto a resposta anterior que causou a mudança é preservada. Assim, reabrir um caminho nunca reaproveita em silêncio um opt-in ou uma renda antigos que deixaram de valer, evitando derivar modalidade ou exigir documento com base em dado obsoleto.

> **Princípio da segurança (na dúvida, não dispensa).** Sempre que falta uma informação necessária para decidir se algo se aplica, o sistema mantém o item pendente — nunca o descarta em silêncio. Um caminho só é dispensado quando há certeza de que realmente não se aplica.

## 5. Como a modalidade de concorrência é calculada

A **modalidade é um fato derivado**: o sistema a calcula a partir das autodeclarações e opt-ins, aplicando a composição da Lei de Cotas expressa como **configuração** (`UNI-REQ-0075`, `UNI-REQ-0076`).

A regra de derivação é uma **lista de regrinhas** do tipo "**quando** tais condições valem, **contribui** com tal modalidade". A avaliação **soma** (une) as modalidades de todas as regrinhas cujas condições são verdadeiras; regra falsa ou não-aplicável não contribui. A composição da Lei de Cotas — o par autodeclaração+concorrer, a concorrência dupla (Lei 14.723/2023), a relação entre cotas de renda e independentes de renda, as exclusões mútuas, o gate de escola pública, a exclusividade entre cota da lei e ação afirmativa (`UNI-REQ-0142`) — é toda expressa nessas regrinhas, não em código que ramifica por tipo de processo.

Dois pontos de negócio importantes:

- **Restrição à oferta do processo.** O domínio de contribuição da regra é o próprio **conjunto de modalidades que o processo oferta**. Uma regra que contribua uma modalidade fora da oferta é **recusada na configuração e barrada na publicação** (fail-closed), não filtrada em silêncio em tempo de inscrição. A interseção com a oferta é, assim, garantida por construção — o candidato nunca concorre a uma modalidade que o edital não oferece.
- **Todo código contribuído é do vocabulário.** Uma regrinha só pode contribuir uma modalidade que exista no domínio congelado; um código desconhecido (por exemplo, um rótulo de exibição usado como se fosse código) é recusado na configuração, nunca traduzido.

Um fato derivado só fica resolvido quando **todas as informações de que depende** já resolveram; se algo de que ele depende está pendente, o derivado também fica pendente.

## 6. Ordem de coleta e o grafo de dependências

O sistema garante uma **ordem lógica** entre campos, fatos e documentos (`UNI-REQ-0077`): uma informação nunca é usada antes de existir. Na inscrição, um documento que só é exigido de quem concorre à cota de renda não aparece antes de o candidato responder à pergunta de renda; uma informação usada só numa fase posterior não dispara exigência na inscrição.

Internamente, as dependências entre campos (o que produz um fato), pré-condições (o que decide se um campo aparece), regras de derivação (de que fatos a modalidade depende) e gatilhos de documento (que fato exige um documento) formam um **encadeamento sem ciclos** — não pode haver dependência circular (A depende de B que depende de A). Essa consistência é verificada na configuração; um encadeamento circular impede a publicação.

Há ainda uma proteção adicional: enquanto o fato que dispararia um documento ainda não pode ser resolvido, aquele documento fica com a emissão **bloqueada** — não é cobrado prematuramente (`UNI-REQ-0077`, que compõe com a fronteira ativa de emissão do `UNI-REQ-0070`).

> Exemplo. Na inscrição, uma exigência de comprovante de renda é cobrada de quem concorre à cota de renda (na habilitação, a cobrança segue o grupo da convocação, `UNI-REQ-0147`). Mas a pergunta "concorrer à cota de renda?" só aparece depois de o candidato optar pelas cotas da lei — ser egresso de escola pública, o que o sistema calcula a partir de onde e como ele cursou o ensino médio, e responder que deseja concorrer às vagas de escola pública. Enquanto ele ainda não respondeu a essas perguntas, não se sabe se a cota de renda se aplica ao seu caso — então a exigência de renda fica **bloqueada**: não é listada como documento faltante (não se cobra prematuramente) nem é dispensada em silêncio. Quando o candidato opta pelas cotas da lei, a pergunta de renda passa a valer, e só então o comprovante de renda passa a ser exigido. A fronteira do fato também avança por **supressão**: se as respostas mostram que o candidato não é egresso de escola pública, ou ele responde que não deseja concorrer às vagas de escola pública, a pergunta de renda deixa de se aplicar e a exigência de renda é dispensada — sem ficar à espera de uma resposta que nunca virá. E, uma vez que uma exigência aplicável fique pendente, ela é **mostrada como pendente**, nunca escondida. O mesmo vale entre fases: um documento preso a um fato que só se resolve na habilitação nunca é cobrado já na inscrição.

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
| `UNI-REQ-0143` | Catálogo de fatos do candidato administrável | Quem cadastra os fatos e os seus valores (seção 1). |
| `UNI-REQ-0145` | Regras do campo condicionadas às respostas anteriores | Exibição, obrigatoriedade e opções de cada campo; opcional não informado (seções 3 e 4). |
| `UNI-REQ-0147` | Documentos da habilitação seguem o grupo de vagas da convocação | Cobrança de documento na habilitação (seção 6). |
| `UNI-REQ-0148` | Origem escolar em duas perguntas | Egresso de escola pública calculado (seções 1 e 2). |

> Os requisitos desta tabela são filhos da configuração de documentos exigidos por gatilho e fase (`UNI-REQ-0016`), exceto o `UNI-REQ-0071` e o `UNI-REQ-0078`, filhos da publicação com cópia congelada (`UNI-REQ-0019`), e o `UNI-REQ-0143`, o `UNI-REQ-0145` e o `UNI-REQ-0148`, filhos do formulário configurável (`UNI-REQ-0017`).
