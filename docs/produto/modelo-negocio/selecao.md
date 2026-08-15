---
sidebar_position: 1
title: Modelo de negócio do módulo Seleção
description: Como o módulo Seleção funciona — configuração, publicação e inscrição, cotas e coleta de dados do candidato. Visão geral de negócio, base para refinamento de requisitos e homologação.
---

# Modelo de negócio do módulo Seleção

Documento de referência funcional para Análise de Requisitos — como o sistema funciona, como se configura um processo seletivo, como as cotas são atendidas e como os dados do candidato são coletados.

Uni+ · Sistema Unificado Unifesspa · Módulo Seleção. Escopo da entrega atual: configuração e publicação; a inscrição é capacidade prevista pelos requisitos do MVP.

> Esta página é a **visão geral de negócio** do módulo. Para comportamento já implementado, o código mergeado no `uniplus-api` é a fonte de verdade; para requisitos e regras de negócio, o registro estruturado versionado no portal é a fonte canônica conforme ADR-0002. A documentação narrativa sintetiza essas fontes. Os catálogos rastreáveis vivem em páginas dedicadas: o [domínio e as modalidades](../dominio/index.mdx), as [regras de negócio nomeadas](../regras-negocio/conceitos.mdx) (`RN`) e a [tabela de requisitos](../requisitos/index.mdx) (`UNI-REQ`). Os pontos ainda em aberto estão identificados na seção **Questões em refinamento**.

## Como ler este documento

Este texto descreve o comportamento de negócio do sistema em linguagem corrente, sem termos de programação. As regras estão organizadas por assunto e, ao final, consolidadas em um catálogo. Cada regra recebe um código estável (por exemplo `RN05` ou `REQ-46`) para facilitar referência futura em reuniões, editais e homologação. As situações são classificadas como Entrega atual (objeto desta primeira entrega), Fundação (base estrutural) ou Etapa futura (planejada para etapas seguintes).

## Questões em refinamento

Durante a revisão deste documento, foram identificadas questões de negócio que precisam de decisão do Product Owner, com validação jurídica, antes de virarem requisito fechado. Não são erros de redação — são questões de negócio ainda em aberto:

- Quantas cotas o candidato ocupa ao mesmo tempo. Há duas camadas que precisam ser conciliadas por interpretação, não uma contradição. A **derivação** (seção 7.5, `UNI-REQ-0076`, já implementada) produz o **conjunto** de modalidades a que o candidato é elegível — normalmente várias (por exemplo, cota de cor/raça e cota de renda juntas). O registro da **inscrição** (`UNI-REQ-0025`, "concorrência dupla na inscrição", ainda não implementado — não há agregado de inscrição) fala em registrar "no máximo uma de cada papel" (um papel de ampla, um de reservada), no espírito da Lei 14.723/2023. Essa cardinalidade não limita o conjunto derivado. Falta definir, quando a inscrição for construída, como o papel reservado se relaciona com ele: um único código reservado, ou uma referência ao conjunto. A [Decisão sobre a representação reservada](../requisitos/index.mdx) está proposta para deliberação do PO, com validação jurídica, antes da implementação de UNI-REQ-0025.
- Limite de renda na fronteira exata. A autodeclaração implementada no sistema pergunta "renda per capita **igual ou inferior** a 1 salário mínimo", aderente à Lei 12.711/2012 (art. 1º, parágrafo único). O registro de requisitos (`UNI-REQ-0076`) ainda descreve "inferior a" — divergência a reconciliar; o PO confirma o texto final e a fronteira (quem tem renda exatamente igual a 1 salário mínimo).
- Documento condicionado a cor/raça para quem não é de escola pública. No modelo atual, a pergunta de cor/raça só aparece para egressos de escola pública. Uma exigência de documento que dependa de cor/raça (por exemplo, o exemplo de quitação militar da seção 9.5) pode não alcançar candidatos fora desse grupo. É preciso decidir se cor/raça deve ser coletada de todos os candidatos.

---

## 1. O que é o Uni+ e o módulo Seleção

O Uni+ (formalmente Sistema Unificado Unifesspa) é a plataforma que unifica os processos institucionais da Universidade Federal do Sul e Sudeste do Pará. O primeiro módulo é o de Seleção, que gerencia o ciclo de vida completo dos processos seletivos: da configuração do edital à publicação dos resultados.

A plataforma foi concebida para crescer além dos processos seletivos. Módulos futuros (auxílio estudantil, projetos de pesquisa, ingresso) reaproveitarão as mesmas capacidades de base — edital, recurso, avaliação e análise de documentos —, de modo que cada nova necessidade nasça de um modelo já existente, sem reescrever regras.

> Princípio orientador: tudo o que muda de um processo para outro — quais cotas existem, quais documentos são exigidos, quais perguntas o candidato responde, quais etapas têm nota — é configuração, e não regra fixa embutida no sistema. Um novo tipo de processo seletivo deve poder ser criado configurando o sistema, sem desenvolvimento de software. Este é o critério de projeto mais importante do módulo.

### O ciclo de vida do processo seletivo (seis etapas)

- Cadastro do edital — parâmetros, etapas, pesos, cotas e locais de prova.
- Configuração do processo — datas, formulários, modalidades e regras de bônus.
- Inscrição de candidatos — cadastro online e envio de documentos.
- Homologação — análise administrativa dos documentos apresentados.
- Lançamento de notas — registro de notas por etapa.
- Classificação e resultado — cálculo da nota final, desempate e publicação.

A entrega atual cobre as etapas 1 e 2 (configurar e publicar). A etapa 3, de inscrição, é uma capacidade prevista pelos requisitos do MVP, ainda sem agregado implementado. As etapas 4 a 6 são desenvolvimentos posteriores, já previstos, que reaproveitarão a configuração congelada na publicação. Este documento descreve com profundidade o escopo atual e apresenta as etapas futuras de forma resumida, para dar visão de conjunto.

## 2. Glossário de negócio

Termos usados ao longo do documento, com o sentido que têm no Uni+.

| Termo | Significado |
|---|---|
| Processo seletivo | O certame em si (por exemplo, o SiSU 2026 ou o Vestibular Indígena/Quilombola). Reúne toda a configuração: etapas, cotas, vagas, documentos e formulário. |
| Edital | O documento oficial que torna público um processo seletivo já configurado. Publicar o edital é o ato que fecha e oficializa a configuração. |
| Modalidade de concorrência | A fila em que o candidato disputa a vaga: ampla concorrência ou uma das reservas legais (cotas). Ver seção 7. |
| Cota | Reserva de vagas para grupos definidos em lei. As dimensões declaradas (renda, cor/raça, deficiência, escola pública, quilombola) **combinam-se** em modalidades compostas — uma dimensão não corresponde a uma única modalidade (por exemplo, escola pública, baixa renda e deficiência juntas produzem `LI_PCD` e `LB_PCD`, nunca `AC_PCD`, que é exclusiva de quem não é egresso de escola pública). Ver seção 7. |
| Dado do candidato | Qualquer informação usada para decidir o que se aplica a ele: alguns são informados por ele (autodeclarações, opções), outros são calculados pelo sistema a partir dos primeiros (ver seção 8). |
| Condição de exigência | A regra que determina de quem um documento é exigido — por exemplo, apenas de quem concorre à cota de renda. É montada a partir dos dados do candidato. |
| Fase | Momento do cronograma do processo (inscrição, homologação, habilitação etc.). Cada exigência de documento é vinculada à fase em que se aplica. |
| Versão congelada (cópia oficial) | Quando o edital é publicado, o sistema tira uma fotografia imutável de toda a configuração. A partir daí, é essa cópia — e não a configuração viva — que governa inscrições, análises e resultados. Ver seção 5. |
| Retificação | A forma oficial de alterar um edital já publicado: gera um novo edital, com novo motivo registrado. Não se edita o edital publicado diretamente. |
| Administrador da Unidade | Servidor que configura e publica processos dentro da unidade que administra (por exemplo, o CEPS). |
| Candidato | Pessoa que preenche e submete a inscrição no portal público. |

## 3. Como o sistema funciona (visão geral)

Do ponto de vista de negócio, o módulo Seleção opera em três grandes momentos, sempre nesta ordem: primeiro Configurar o processo (em rascunho), depois Publicar o edital (que congela tudo) e por fim Inscrever candidatos.

Enquanto o processo está em rascunho, o administrador monta livremente toda a configuração e pode alterar qualquer parte. Nada ainda produz efeito para o candidato.

Ao publicar o edital, o sistema valida a configuração e, estando tudo conforme, oficializa e congela os parâmetros. Desse instante em diante, a configuração viva não muda mais o que já foi publicado; qualquer alteração exige retificação (novo edital).

Durante a inscrição, o candidato responde ao formulário do processo, indica opções de curso e responde às perguntas de cota, envia documentos e submete a inscrição. O sistema decide o que se aplica a ele sempre com base na cópia oficial congelada do edital, garantindo que todos os candidatos de um mesmo edital sejam tratados exatamente pelas mesmas regras, mesmo que a configuração seja alterada depois para editais futuros.

### Papéis (quem faz o quê)

| Papel | Responsabilidade no escopo atual |
|---|---|
| Administrador da Unidade | Configura o processo, define cotas, vagas, documentos e formulário, e publica o edital. Só atua dentro da unidade que administra. |
| Candidato | Preenche o formulário, escolhe opções de curso e responde às perguntas de cota, envia documentos e submete a inscrição no portal público. Não escolhe a modalidade diretamente — o sistema a deriva das respostas (seção 7). |

O acesso administrativo é restrito por unidade: um administrador só enxerga e opera os processos da sua unidade. A identificação de usuários (login) é feita por um provedor de identidade institucional, com integração ao Gov.br prevista para o ambiente de produção.

## 4. Como se configura um processo seletivo

A configuração é feita pelo Administrador da Unidade enquanto o processo está em rascunho. Ela é composta por várias dimensões, que juntas descrevem integralmente o certame.

- Etapas, pesos e critérios de resultado. Definem-se as etapas pontuadas (por exemplo, prova objetiva, redação, entrevista), o peso de cada uma, os critérios de desempate e o bônus regional, quando houver. A fórmula de nota final e os critérios de desempate ficam registrados na configuração e serão aplicados na etapa de classificação.
- Modalidades de concorrência e quadro de vagas. Definem-se quais modalidades o processo oferece (ampla concorrência e as cotas aplicáveis) e o número de vagas de cada uma, por oferta de curso. Também se define a ordem de remanejamento: para onde as vagas de uma cota não preenchida devem migrar (ver seção 7).
- Documentos exigidos. Para cada documento, define-se de quem é exigido (de todos, ou apenas de quem satisfaz uma condição), em que fase, se é obrigatório, qual a consequência de não apresentá-lo, a base legal que o embasa e as regras de formato, tamanho e validade. Ver seção 9.
- Formulário de inscrição. Monta-se o formulário que o candidato preencherá, incluindo as perguntas de cota (autodeclarações e opções de concorrer) e os campos que só aparecem em função de respostas anteriores. Ver seção 8.
- Atendimento especializado. Define-se quais condições, recursos e tipos de deficiência o processo oferece como atendimento especializado, para que o candidato possa solicitá-los na inscrição.
- Salvar e revisar. Enquanto em rascunho, tudo permanece editável. Quando a configuração está completa e coerente, o administrador solicita a publicação.

#### Validação antes de publicar

O sistema não permite publicar um edital incoerente. Antes de oficializar, verifica automaticamente pontos como: toda exigência que pode determinar o resultado tem base legal resolvida; toda condição que **referencia modalidade ou atendimento** aponta para os que o próprio processo oferece (condições sobre outros fatos do candidato — como idade, sexo, nacionalidade ou raça — não dependem da oferta); nenhuma exigência condicional que determina resultado (obrigatória ou com consequência) foi deixada sem condição — o que a tornaria exigida de ninguém. Se algo estiver inconsistente, a publicação é recusada com uma mensagem clara, e o administrador corrige ainda no rascunho.

## 5. Publicação do edital e o princípio do congelamento

A publicação é o ato central do módulo. É quando a configuração deixa de ser rascunho e passa a valer oficialmente.

> `RN08` — Congelamento de parâmetros por edital. Ao publicar o edital, toda a configuração é congelada em uma cópia oficial imutável. Percentuais, critérios, cotas, vagas, documentos exigidos, a coleta de fatos (perguntas e suas pré-condições), as regras de derivação e as regras de cálculo passam a valer exatamente como estavam no momento da publicação. Alterações posteriores nos cadastros gerais do sistema não afetam editais já publicados — só valem para editais futuros. Isso garante duas coisas essenciais: os resultados são reproduzíveis (é sempre possível reconstruir fielmente como o edital funcionava) e ninguém pode alterar as regras de um certame em andamento.

Consequências práticas do congelamento, em linguagem de negócio:

- Imunidade após a publicação. Se, depois de publicar, alguém alterar um cadastro geral (por exemplo, a descrição de um tipo de documento ou a lista de valores de uma pergunta), o edital publicado continua funcionando como antes. A mudança só alcança editais novos.
- Alteração só por retificação. Para mudar prazo, vagas, cotas, pesos, bônus, documentos ou formulário de um edital já publicado, emite-se uma retificação, que cria um novo edital com o motivo registrado. A edição direta do edital publicado é bloqueada (`REQ-21`, `REQ-22`).
- Qual edital vale em cada momento. Quando há mais de uma versão (por retificações), o sistema sabe identificar qual edital estava vigente em cada data, para avaliar cada ato pela regra correta da época.

> Exemplo. Um edital exige comprovante de renda com no máximo 3 meses. Após a publicação, a área administrativa altera o cadastro geral para 6 meses. Os candidatos daquele edital continuam sob a regra de 3 meses (a que valia quando o edital foi publicado). Só os editais publicados depois da alteração usarão 6 meses.

## 6. Como o candidato se inscreverá

Quando for implementada, a inscrição será possível quando existir um edital publicado e vigente e o período de inscrição estiver aberto. O fluxo esperado do candidato:

- Abre a inscrição e preenche o formulário. A inscrição começa como rascunho. O candidato responde às perguntas do formulário do processo, incluindo as autodeclarações de cota (ver seção 8).
- Escolhe opções de curso e responde às perguntas de cota. Indica até duas opções de curso. O candidato não escolhe a modalidade diretamente: ele concorre sempre em ampla concorrência e, para cada reserva, somente quando é elegível e opta por concorrer; então, o sistema calcula o conjunto de modalidades — que pode conter mais de uma reserva ao mesmo tempo. Ver concorrência dupla e cálculo de modalidades na seção 7. A futura inscrição terá, no máximo, um papel reservado de registro; essa cardinalidade não limita o conjunto derivado. A relação entre esse papel e o conjunto será definida pela decisão proposta na seção Questões em refinamento.
- Solicita atendimento especializado, se necessário. Entre as opções que o processo oferece, o candidato pode solicitar condições, recursos ou informar tipo de deficiência.
- Envia os documentos exigidos. Anexa os documentos que se aplicam ao seu caso. Cada arquivo passa por uma verificação técnica de segurança antes de ser considerado válido.
- Submete a inscrição. O sistema confere se todos os documentos obrigatórios aplicáveis ao caso do candidato estão presentes. Faltando algum, a submissão é bloqueada com a indicação do que falta.
- Recebe o comprovante. Com tudo presente, a inscrição passa a submetida e o sistema emite um comprovante imutável, com o relatório dos documentos, pendências e implicações por escrito.

### Regras observadas na inscrição

| Código | Regra | Descrição em negócio |
|---|---|---|
| `RN01` | Uma inscrição por CPF | Um mesmo CPF só pode ter uma inscrição submetida por processo e nível de ensino. Inscrições em níveis de ensino diferentes do mesmo processo são permitidas. O rascunho não conta para essa restrição. |
| `RN02` | Nome social | Sempre que o nome for exibido — em listas, telas ou documentos —, o nome social tem prioridade absoluta sobre o nome civil. |
| `RN03` | Documentos obrigatórios | A inscrição não pode ser submetida sem os documentos obrigatórios exigidos para o caso do candidato. |
| `RN06` | Cancelar e refazer | O candidato pode cancelar e refazer a inscrição enquanto o período estiver aberto. O cancelamento registra motivo, data e autor, e libera nova inscrição respeitando a regra do CPF único. |
| `RN07` | Lista de espera | O candidato entra em lista de espera conforme a opção indicada no ato da inscrição. Etapa futura — capacidade planejada, ainda sem escopo na entrega atual. |

> Comprovante e pendências. Mesmo após submeter, um documento ainda em verificação técnica de segurança gera uma pendência que fica registrada e visível no acompanhamento e no comprovante — sem impedir a submissão. A inscrição permanece válida; a pendência apenas sinaliza algo a acompanhar. O comprovante nunca é alterado: uma reemissão gera um novo comprovante, preservando o anterior.

---

## 7. Cotas e modalidades de concorrência

Esta é a área mais sensível do sistema, por implementar a legislação de ações afirmativas (Lei 12.711/2012, atualizada pela Lei 14.723/2023). O princípio geral: o candidato nunca escolhe diretamente uma cota como `LB_PPI`. Ele responde a um conjunto de perguntas simples (autodeclarações e opções de concorrer), e o sistema calcula automaticamente todas as modalidades a que ele passa a concorrer.

### 7.1 As modalidades de concorrência

| Código | Quem concorre |
|---|---|
| AC | Ampla concorrência — todos os candidatos, independentemente de cota. |
| `AC_PCD` | Pessoa com deficiência que **não** é egressa de escola pública — a exclusão existe para não sobrepor as subcotas de escola pública, que já cobrem pessoa com deficiência via `LI_PCD`/`LB_PCD`. O edital a apresenta com o rótulo V; V é apenas um rótulo de exibição, não um código próprio. |
| `LI_EP` | Escola pública, independentemente de renda. |
| `LI_PPI` | Escola pública, mais preto, pardo ou indígena, independentemente de renda. |
| `LI_Q` | Escola pública, mais quilombola, independentemente de renda. |
| `LI_PCD` | Escola pública, mais pessoa com deficiência, independentemente de renda. |
| `LB_EP` | Escola pública com o critério de renda familiar per capita aplicável ao processo. |
| `LB_PPI` | Escola pública, mais preto, pardo ou indígena, com o critério de renda aplicável ao processo. |
| `LB_Q` | Escola pública, mais quilombola, com o critério de renda aplicável ao processo. |
| `LB_PCD` | Escola pública, mais pessoa com deficiência, com o critério de renda aplicável ao processo. |

Fora dessas dez, a modalidade `PCD_PURO` reserva vaga para pessoa com deficiência em processo **sem** nenhuma das oito cotas da Lei 12.711 acima — cenário em que nenhuma delas está em jogo, então o critério de PCD_PURO é só "é pessoa com deficiência e optou por concorrer" (ver [UNI-REQ-0085](../requisitos/index.mdx)).

As modalidades com renda (grupo LB) também concorrem à modalidade equivalente independente de renda (grupo LI). Em outras palavras: quem tem direito à cota de renda concorre tanto na sua cota específica de baixa renda quanto na versão sem exigência de renda. A fronteira exata do critério de renda permanece em refinamento pelo PO, com validação jurídica; ver a nota na seção Questões em refinamento.

### 7.2 Concorrência dupla (Lei 14.723/2023)

> Concorrência simultânea. Todo candidato concorre ao mesmo tempo em ampla concorrência e, para cada modalidade reservada, somente quando é elegível e opta por concorrer a ela, sendo classificado na situação mais favorável. Por isso a ampla concorrência (AC) sempre entra no conjunto de modalidades — ela é a âncora presente para todos. A derivação pode produzir várias reservas; quando implementada, a inscrição terá no máximo um papel de ampla e um papel reservado, sem limitar esse conjunto. A relação entre o papel reservado e o conjunto derivado será definida pela decisão proposta ao PO, com validação jurídica.

### 7.3 O formulário de cotas (as perguntas)

A definição das cotas segue o formulário real da Unifesspa. Para cada dimensão de cota, há sempre duas perguntas: uma de autodeclaração (você é / você se enquadra?) e uma de opção de concorrer (você deseja concorrer a essa cota?). Autodeclarar-se não basta: a cota só entra se o candidato escolher concorrer a ela.

| Dimensão | Autodeclaração | Opção de concorrer |
|---|---|---|
| Deficiência | Você se autodeclara pessoa com deficiência? | Deseja concorrer às vagas reservadas a pessoas com deficiência? |
| Escola pública | Cursou todos os anos do ensino médio em escola pública (ou comunitária conveniada)? | Deseja concorrer às vagas reservadas a egressos de escola pública? |
| Cor/raça | Como se autodeclara: amarela, branca, indígena, preta ou parda? | Deseja concorrer às vagas reservadas a pretos, pardos e indígenas? |
| Quilombola | Você se autodeclara pessoa quilombola? | Deseja concorrer às vagas reservadas a quilombolas? |
| Renda | Sua família atende ao critério de renda per capita aplicável ao processo? | Deseja concorrer às vagas reservadas por critério de renda? |

### 7.4 Regras de exibição das perguntas

As perguntas não aparecem todas de uma vez: a exibição de cada uma depende das respostas anteriores. Essas regras vêm do próprio formulário oficial:

- A opção de concorrer a uma cota só aparece se a autodeclaração correspondente foi sim.
- Se o candidato responde que não estudou em escola pública, as subcotas de escola pública não aparecem — ele segue para a ampla concorrência. A dimensão de deficiência é exceção: a pessoa com deficiência concorre à modalidade `AC_PCD` (rotulada V) mesmo sem escola pública.
- Se o candidato se declara amarela ou branca, a pergunta de concorrer à cota de cor/raça não aparece.
- Se o candidato se declara indígena, a dimensão quilombola não aparece — a legislação não permite acumular as duas.

### 7.5 Como o sistema calcula as modalidades a partir das respostas

A partir das autodeclarações e das opções de concorrer, o sistema aplica a composição da Lei de Cotas e produz o conjunto de modalidades a que o candidato concorre. Nas linhas abaixo, dizer que o candidato concorre por X significa que ele fez as duas coisas: autodeclarou-se elegível a X e optou por concorrer à cota X. Apenas autodeclarar-se não coloca ninguém na cota.

A tabela abaixo é uma **amostra ilustrativa** dos casos mais representativos, para dar intuição do cálculo — não é a fonte normativa. O critério de aceite obrigatório é a regra de derivação congelada: as regras R0–R9 (as dez modalidades da Lei 12.711) e todas as combinações da matriz completa são normativas por [`UNI-REQ-0076`](../requisitos/index.mdx), e o resultado exato de qualquer combinação dessas dez (inclusive as omitidas desta amostra) é o que a regra congelada produz. `PCD_PURO` fica fora de R0–R9 — é regra independente, com o próprio cálculo descrito acima (§7.1). Os conjuntos abaixo são calculados antes da restrição às modalidades ofertadas pelo processo (ver observação ao final da seção).

| Perfil do candidato (opções ativas) | Concorre a |
|---|---|
| Não concorre a nenhuma cota (ou optou por não concorrer a nenhuma) | AC |
| Concorre por deficiência; não é de escola pública | AC, `AC_PCD` |
| Concorre por deficiência; é de escola pública; não concorre por renda | AC, `LI_PCD` |
| Concorre por deficiência; é de escola pública; concorre por renda | AC, `LI_PCD`, `LB_PCD` |
| É de escola pública e concorre por escola pública; não concorre por renda | AC, `LI_EP` |
| É de escola pública e concorre por escola pública; concorre por renda | AC, `LI_EP`, `LB_EP` |
| É de escola pública, mas opta por não concorrer a nenhuma subcota | AC |
| Preto/pardo/indígena, escola pública, concorre por PPI; não concorre por renda | AC, `LI_PPI` |
| Preto/pardo/indígena, escola pública, concorre por PPI; concorre por renda | AC, `LI_PPI`, `LB_PPI` |
| Preto/pardo/indígena elegível, escola pública, opta por não concorrer por PPI, mas concorre por escola pública | AC, `LI_EP` |
| Quilombola (não indígena), escola pública, concorre por Q; não concorre por renda | AC, `LI_Q` |
| Quilombola (não indígena), escola pública, concorre por Q; concorre por renda | AC, `LI_Q`, `LB_Q` |
| Preto/pardo, escola pública, concorre por PPI e por Q; não concorre por renda | AC, `LI_PPI`, `LI_Q` |
| Preto/pardo, escola pública, concorre por PPI e por Q; concorre por renda | AC, `LI_PPI`, `LB_PPI`, `LI_Q`, `LB_Q` |
| Várias dimensões: concorre por deficiência, por escola pública e por PPI; escola pública; concorre por renda | AC, `LI_PCD`, `LB_PCD`, `LI_PPI`, `LB_PPI`, `LI_EP`, `LB_EP` |

Pontos de atenção que o formulário resolve automaticamente:

- Autodeclarar não é concorrer. Quem se declara com deficiência mas opta por não concorrer à cota não entra na modalidade.
- Renda amplia, não substitui. Quem concorre por renda (grupo LB) concorre também à versão sem renda (grupo LI). Quem não opta por concorrer por renda mantém apenas as modalidades independentes de renda.
- Deficiência sem escola pública concorre a `AC_PCD` (a modalidade rotulada V no edital), mas não às subcotas de escola pública.
- Indígena nunca gera cota quilombola (exclusão prevista em lei).
- Restrição pela oferta. As modalidades a que o candidato pode concorrer são exatamente as que o processo oferece — a união de todas as configurações de distribuição de vagas do processo (todas as ofertas de curso), não apenas as dos cursos que o candidato escolheu (a restrição por curso específico ocorre mais tarde, na classificação). Essa restrição é garantida na origem: uma regra de derivação que contribua uma modalidade fora da oferta é recusada na configuração e barrada na publicação (fail-closed), não filtrada em silêncio — de modo que o candidato nunca concorre a uma modalidade não ofertada. (O registro `UNI-REQ-0076` ainda descreve essa restrição como interseção "no último passo"; o comportamento implementado é a recusa antecipada na configuração — divergência de redação a reconciliar no registro.)

### 7.6 Remanejamento de vagas não preenchidas

Duas regras distintas atuam aqui:

- Precedência de opções de curso (`RN04`). Vagas da 1ª opção de curso são processadas antes de qualquer realocação para a 2ª opção.
- Cascata de remanejamento entre modalidades (`REQ-56`). Vagas de uma cota não preenchida migram para outra modalidade conforme uma configuração congelada no snapshot de publicação do processo seletivo. Por modalidade de origem, a configuração define uma **sequência ordenada de destinos** e, além dela, a **cota de fallback** — o destino terminal, usado quando a sequência se esgota. A ordem é semântica: reordená-la muda a modalidade para a qual a vaga migra primeiro e, portanto, quem é convocado.

A configuração da cascata já fica congelada na publicação; o processamento do remanejamento permanece em etapa futura.

---

## 8. Coleta de dados a partir do formulário

Esta seção explica como o sistema entende e organiza as respostas do candidato — o mecanismo que sustenta tanto o cálculo de cotas quanto a exigência de documentos.

### 8.1 Dados informados e dados calculados

O sistema distingue três tipos de informação sobre o candidato:

- Dados informados pelo candidato — as respostas do formulário: autodeclarações (deficiência, cor/raça, quilombola, renda, escola pública) e opções de concorrer. O candidato sempre seleciona valores de uma lista pré-definida, nunca digita texto livre. Cada valor da lista traz uma descrição do seu significado, para orientar a escolha.
- Dados calculados pelo sistema (derivados) — informações que o sistema deduz automaticamente dos dados informados, seguindo regras configuradas. O exemplo central é a modalidade de concorrência: o candidato responde às perguntas de cota e o sistema calcula o conjunto de modalidades (seção 7.5). Outro exemplo é a faixa etária, derivada da data de nascimento, usada para decidir exigências de documento.
- Dados de integração — informações vindas de outra fonte ou sistema (por exemplo, atributos do candidato importados), com origem própria e resolvidas como os demais fatos. A natureza é suportada no modelo desde já; o que ainda não existe é uma fonte concreta de integração conectada. Não são respostas do formulário nem resultado de derivação; um dado como a nacionalidade só é usado como fato quando tem uma origem definida (informado ou de integração). Ver as três naturezas de fato na página [Coleta de fatos e derivação de modalidade](./coleta-fatos-derivacao.md).

> Por que essa distinção importa. Modelar a modalidade como dado calculado — e não como uma escolha direta do candidato — evita erros e fraudes, garante que a Lei de Cotas seja aplicada de forma uniforme e permite mudar as regras de composição por configuração, sem desenvolvimento. A regra de cálculo é parte da configuração e é congelada na publicação (`RN08`).

### 8.2 Campos condicionais (o que aparece depende do que foi respondido)

Cada campo do formulário pode ter pré-condições: ele só é apresentado ao candidato quando as respostas anteriores as satisfazem. Isso é o que faz o formulário abrir a pergunta de concorrer só depois do sim na autodeclaração, ou ocultar o bloco quilombola para quem se declara indígena. As pré-condições são configuradas (não programadas) e ficam congeladas na publicação.

### 8.3 Não se aplica é diferente de pendente

Uma sutileza importante de negócio: nem toda pergunta em branco significa a mesma coisa. O sistema distingue três situações, e a diferença entre elas decide se algo é dispensado ou fica pendente:

| Situação | Estado | Efeito de negócio |
|---|---|---|
| Pré-condição da pergunta é comprovadamente falsa (a pergunta não se aplica ao caso — por exemplo, a pergunta de renda para quem não é de escola pública) | Não se aplica | Resultado definitivo. Aquela cota, ou aquele caminho de exigência, é dispensado — o candidato não concorre por ali / não precisa daquele documento por aquele motivo. |
| A pergunta se aplica, apareceu, mas ainda não foi respondida | Pendente | O item fica pendente, nunca dispensado silenciosamente. O sistema mantém a exigência sinalizada até haver resposta. |
| Ainda não se sabe se a pergunta se aplica, porque depende de outra resposta que falta | Pendente | Também fica pendente — não se conclui não se aplica enquanto houver dúvida. Só a pré-condição comprovadamente falsa dispensa. |

Uma ressalva importante: um documento pode ser exigido por mais de um motivo. Quando um caminho deixa de exigir o documento, isso afeta apenas aquele caminho — o documento pode continuar exigido por outro. A exigência é dispensada quando **nenhum** caminho que poderia torná-la necessária está ativo — ou seja, cada caminho resultou em não se aplica **ou** em falso (as respostas simplesmente não satisfazem o gatilho, como um candidato que não concorre àquela cota). Basta **um** caminho indeterminado (dúvida ainda não resolvida) para manter a exigência pendente.

> Princípio da segurança (na dúvida, não dispensa). Sempre que faltar uma informação necessária para decidir se algo se aplica, o sistema mantém o item pendente — nunca o descarta em silêncio. Uma exigência só é dispensada quando há certeza de que ela realmente não se aplica. Isso evita que um documento deixe de ser cobrado por falta de dado.

### 8.4 Ordem de coleta

O sistema garante uma ordem lógica: um documento nunca é solicitado antes de existir a informação que o dispara. Se um documento só é exigido de quem concorre à cota de renda, ele não aparece antes de o candidato responder à pergunta de renda. Da mesma forma, uma informação usada apenas em uma fase posterior (por exemplo, na habilitação) não pode disparar exigência de documento na fase de inscrição.

---

## 9. Documentos exigidos

O coração da configuração de documentos é declarar, para cada documento comprobatório: de quem é exigido, em que fase, se é obrigatório, qual a consequência de não apresentá-lo e qual a base legal. Tudo isso é congelado na publicação.

### 9.1 De quem o documento é exigido

Cada documento declara explicitamente sua aplicabilidade:

- Geral — exigido de todos os candidatos.
- Condicional — exigido apenas de quem satisfaz uma condição sobre os dados do candidato (por exemplo, apenas de quem concorre à cota PPI, ou apenas de homens brasileiros de 18 a 45 anos, para quitação militar).

As condições são montadas de forma controlada, combinando os dados do candidato com um conjunto fixo de operadores de comparação: é igual a / é diferente de (para um único valor), está em um conjunto / não está em um conjunto (para pertencer ou não a uma lista de valores) e maior ou igual / menor ou igual (para números). Uma faixa numérica — por exemplo, de 18 a 45 anos — é expressa combinando os dois limites (maior ou igual a 18 e menor ou igual a 45). O administrador monta a condição num construtor visual; ele nunca escreve código. Uma exigência condicional que determina resultado (obrigatória ou com consequência) e não tem nenhuma condição — logo não se aplicaria a ninguém — é barrada na publicação.

### 9.2 Documentos alternativos e estruturas compostas

Às vezes um mesmo requisito pode ser comprovado por documentos diferentes (apresente A ou B). O sistema permite agrupar exigências alternativas: apresentar um dos documentos do grupo satisfaz o requisito inteiro.

Quando o edital precisar, é possível montar estruturas mais ricas do que um simples ou, todas por configuração:

- Combinações de e / ou / pelo menos N de aninhadas — por exemplo, apresente (A e B) ou C, ou pelo menos 2 dos documentos da lista.
- Quantidade de vias — uma exigência pode pedir mais de uma apresentação do mesmo documento (por exemplo, os comprovantes de residência dos últimos meses), distinguindo o que é um documento do que é um arquivo (frente e verso contam como uma apresentação). Cada via esperada tem identidade própria (por exemplo, um mês específico do calendário congelado): vias duplicadas de um mesmo mês não suprem um mês exigido que esteja faltando — o mês ausente permanece pendente.
- Repetição por pessoa — um conjunto de documentos pode ser exigido por membro do núcleo familiar, repetindo-se para cada pessoa informada.

Cada item de documento tem, a qualquer momento, uma situação clara (satisfeito, pendente, indeterminado, não se aplica ou impossível de cumprir), e o sistema acompanha essa situação ao longo da análise. O detalhamento formal dessas estruturas está na especificação e pode ser anexado, se necessário.

### 9.3 Consequência de não comprovar

Cada exigência define o que acontece se o candidato não comprovar o que declarou. As consequências possíveis são:

| Consequência | Efeito |
|---|---|
| Elimina | O candidato é eliminado do processo. |
| Reclassifica para ampla concorrência | O candidato perde a vaga na cota, mas segue concorrendo em ampla concorrência. |
| Remove vantagem | O candidato perde uma vantagem específica (por exemplo, o bônus regional), mas não é eliminado. |
| Pendência para reenvio | Abre-se prazo para o candidato complementar/reenviar o documento numa fase que permita complementação. |

> A qual nó a consequência se prende. A consequência é configurada **por nó** da árvore de exigências, não por documento solto: cada folha (documento único) e cada grupo de alternativas (`OU` / `pelo menos N de`) — a unidade opaca — pode carregar a sua consequência e a sua **própria base legal**; um grupo `E` (todos exigidos) não carrega consequência própria, cada filho carrega a sua. Num grupo de alternativas, portanto, deixar de apresentar uma alternativa **não** aciona a penalidade se outra satisfaz o grupo — a consequência é do grupo, avaliada pelo resultado dele, nunca somada a partir dos filhos.

A consequência precisa ser coerente com a natureza da vaga e com o que o processo oferece — por exemplo, remover o bônus regional só é válido se o processo de fato tiver bônus regional. O sistema verifica essa coerência na publicação.

### 9.4 Base legal

Cada exigência pode ter uma ou várias bases legais (federal, estadual, municipal, norma interna ou o próprio edital), cada uma com situação pendente ou resolvida. A publicação exige pelo menos uma base legal resolvida para todo documento que pode determinar o resultado (obrigatório ou com consequência). Assim, nenhuma exigência que afeta o candidato entra em vigor sem embasamento registrado e rastreável.

### 9.5 Formato, tamanho e validade

- Formatos e tamanho — cada exigência define quais formatos de arquivo aceita e o tamanho máximo (geral ou por formato). Alternativamente, pode aceitar qualquer formato com um limite padrão.
- Idade de emissão — a exigência pode ter uma regra de documento emitido há no máximo X meses. Essa regra funciona como aviso, não impede a apresentação. Casos como o laudo de deficiência permanente (que não expira) são tratados por configuração — pela combinação do tipo de deficiência declarado —, sem regra especial embutida no sistema.

> Exemplo completo — quitação militar. Um edital pode exigir o comprovante de quitação militar apenas de homens brasileiros (nato ou naturalizado), não indígenas, de 18 a 45 anos. O administrador monta essa condição combinando os dados sexo, nacionalidade, cor/raça e faixa etária. Um candidato estrangeiro, ou indígena, ou fora da faixa etária, simplesmente não terá esse documento exigido. Nada disso está fixo no sistema — é tudo configuração do edital. Observação: este exemplo usa o dado cor/raça, que hoje só é coletado de egressos de escola pública. Para que uma exigência baseada em cor/raça alcance todos os candidatos, é preciso decidir se esse dado deve ser coletado de todos — ponto em aberto listado no aviso do início do documento.

---

## 10. Recursos e matrícula por decisão judicial

Estas regras pertencem majoritariamente a etapas futuras, mas sua informação de base é configurada e congelada desde já na publicação, porque o edital precisa declarar como cada instância de recurso se comporta.

> `RN13` — Recurso e efeito suspensivo. O Uni+ conduz apenas a 1ª instância de recurso (abre o prazo, recebe a interposição, registra o julgamento). A instância superior é julgada fora do sistema — pela via administrativa (na Seleção) ou judicial (no Ingresso) —, mas sua existência, pendência e desfecho são registrados, com o documento do órgão julgador. O efeito suspensivo (travar atos irreversíveis enquanto há recurso pendente) é configurável por instância e por fase: quando não configurado, não bloqueia. Na prática confirmada com o CRCA: na Seleção, ambas as instâncias bloqueiam; na Habilitação/Ingresso, a 1ª bloqueia e a 2ª (judicial, de prazo indeterminado) não bloqueia. Essa diferença vem só da configuração — nunca de tratamento diferente embutido no sistema por módulo.

Detalhes de negócio úteis à análise:

- Há dois prazos distintos: o prazo para o candidato recorrer (contado da publicação do ato; só existe para a 1ª instância, a única que o Uni+ recebe — a instância superior não tem interposição própria dentro do sistema) e o tempo de bloqueio por instância, que começa quando um recurso é efetivamente interposto (UNI-REQ-0081) — nunca antes disso, mesmo que a instância seguinte já pudesse, em tese, ser aberta. Cada um desses prazos é um par valor-unidade com convenção de contagem explícita, e as duas convenções são diferentes porque os dois relógios protegem coisas diferentes. **O prazo de interposição corre exclusivamente em dia útil** — é a janela do candidato, e tempo que passa quando ele não tem como agir não pode consumi-la: aceita dias úteis (valor inteiro) ou horas, contando, nas duas unidades, só os instantes situados em dia útil, e recusa dia corrido, porque declará-lo seria aceitar que a janela encolha ao calhar de cair em feriado. Dia útil é o dia civil inteiro no fuso institucional congelado na versão publicada (`UNI-REQ-0111`), e feriado é o dia completo — não é horário comercial. Duas resoluções ficam a cargo do **algoritmo de contagem** que o processo declara, escolhido entre os nomeados no catálogo: o que acontece quando o ato é publicado em dia não útil, e o que "um dia útil" significa quando a âncora não cai à meia-noite. É justamente isso que distingue um algoritmo de outro, e é por isso que o edital declara qual usa em vez de o sistema eleger uma leitura para todos. **O tempo de bloqueio**, que trava a administração e não o candidato, mantém as três convenções, com dias úteis aceito sob as mesmas condições de sempre. As contagens que distinguem dia útil de dia não útil — todo prazo de interposição, em dias úteis ou em horas, e a suspensividade em dias úteis — exigem calendário de dias úteis vigente cadastrado E um algoritmo de contagem declarado pelo processo, escolhido entre os nomeados no catálogo — é ele que define como um instante-âncora em dia não útil se resolve —, com as versões dos dois congeladas junto — ambos podem mudar depois da publicação, e sem prendê-los ao momento do congelamento um recurso já em curso fecharia num instante diferente do prometido. As três convenções de contagem disponíveis estão declaradas em `UNI-REQ-0112`, então toda contagem que distinga dia útil de não útil é hoje recusada na publicação — nunca aproximada em silêncio. A suspensividade em horas ou dias corridos, que conta todos os dias sem distinguir, segue publicável. O bloqueio encerra no julgamento ou no fim do prazo, o que vier primeiro — um recurso nunca julgado não pode travar o certame indefinidamente.
- O alcance do bloqueio depende do objeto do recurso: um recurso de efeito coletivo trava o processo inteiro; um recurso individual trava apenas a parte afetada (curso, modalidade ou a vaga em disputa). Essa derivação não é configurável por fase nem congelada — é regra estrutural, a mesma antes e depois de qualquer retificação.
- Uma retificação publicada no meio do caminho não retroage sobre recurso já em curso: o prazo de interposição e o par de suspensividade que governam o recurso, com suas convenções de contagem, são os vigentes quando o direito de recorrer nasceu — a publicação do ato recorrido —, nunca os vigentes na interposição ou no julgamento. Um recurso contra um ato publicado já sob a regra retificada é regido pela regra nova; não é congelamento perpétuo do processo, é imunidade retroativa por ato (`UNI-REQ-0093`). Sempre que a versão que publicou o ato não tem configuração de recurso pra fase — porque a fase nunca aceitou recurso, ou porque uma retificação anterior deixou de configurá-la —, uma interposição contra esse ato é recusada com erro nomeado, nunca aceita silenciosamente sem bloqueio (`UNI-REQ-0094`). Irreversibilidade do ato não entra nessa garantia: é classificação do cadastro do tipo de ato (por exemplo, convocação sempre consome vaga escassa), não configuração de edital que uma retificação possa mudar.
- O que já precisa ser configurado e congelado na entrega atual. Embora o processamento do recurso seja etapa futura, a informação que o alimenta é configurada e congelada desde a publicação: para cada fase configurada para aceitar recurso, o edital congela o prazo de interposição da 1ª instância (a única que o Uni+ recebe) e, por instância, o tempo de bloqueio (um par valor mais unidade, ou sem bloqueio quando não se aplica) — ambos com convenção de contagem explícita — o prazo de interposição em dias úteis ou horas de dia útil, nunca em dias corridos; o tempo de bloqueio nas três convenções — a localidade cujo calendário rege a contagem e o fuso em que o dia civil começa e termina (`UNI-REQ-0111`), a primeira informada no cadastro e obrigatória em todo processo, o segundo aplicado pelo sistema e congelado na publicação. As contagens que distinguem dia útil de não útil — todo prazo de interposição e a suspensividade em dias úteis — dependem de calendário vigente cadastrado e de algoritmo de contagem declarado (faltando qualquer um dos dois, a publicação é recusada). Sem esses campos congelados, o mecanismo futuro não teria como saber o que travar nem reconstruir a garantia de não retroatividade para processo publicado antes de o mecanismo existir — por isso uma fase configurada para aceitar recurso, mas publicada sem eles, é recusada, assim como o é qualquer processo publicado sem localidade; uma fase que não aceita recurso simplesmente não os tem; a instância superior não exige prazo de interposição próprio, por não ter essa etapa dentro do sistema. Além disso, publicar processo real sob esta garantia depende de uma base legal ainda não confirmada (`UNI-REQ-0095`) — essa dependência bloqueia a publicação independentemente de os campos acima estarem completos. Configuração na entrega atual.

> `RN14` — Matrícula compulsória por decisão judicial final. Quando, no Ingresso, a instância judicial não bloqueia e a vaga é ocupada, mas depois uma decisão judicial final reconhece o direito do candidato — tipicamente com o curso já em andamento —, a universidade o matricula em vaga supranumerária (adicional ao quadro), após cumpridas as fases de habilitação e verificação documental. O quadro de vagas não é alterado, ninguém é desclassificado e a classificação permanece íntegra. É ato excepcional, auditável, com a própria decisão judicial como base legal.

## 11. Proteção de dados e nome social

Por ser sistema de autarquia federal que trata dados pessoais sensíveis de candidatos, o Uni+ observa a LGPD desde a base:

- Minimização na divulgação. Por padrão, as divulgações públicas expõem o mínimo (o número de inscrição). Ampliar para o nome abreviado (iniciais + último sobrenome) dispensa justificativa, por ser a prática recomendada; ampliar para o nome completo exige justificativa, que fica registrada no edital congelado.
- Registros de acesso e ocultação de dados sensíveis. O acesso a dados sensíveis é auditável, e dados pessoais (CPF, nome, documentos) são ocultados nos registros operacionais do sistema.
- Nome social (`RN02`). Sempre que o nome é exibido, o nome social tem prioridade sobre o civil, em telas, listas e documentos.
- Retenção de documentos. O prazo de guarda e expurgo dos documentos segue a Tabela de Temporalidade das instituições federais de ensino e a orientação do encarregado de dados e do jurídico. A confirmar antes da produção.

---

## 12. Catálogo de regras de negócio

Consolidação das regras institucionais nomeadas. O enunciado público e o mapeamento para os requisitos de cada uma vivem na página de [regras de negócio](../regras-negocio/conceitos.mdx). As regras marcadas como etapa futura têm sua configuração de base já prevista na entrega atual; apenas o processamento é posterior.

| Código | Regra | Enunciado | Situação |
|---|---|---|---|
| `RN01` | Inscrição única por CPF | Um CPF só pode ter uma inscrição submetida por processo e nível de ensino; níveis distintos do mesmo processo são permitidos. | Entrega atual |
| `RN02` | Prioridade do nome social | Nome social tem prioridade absoluta em listas públicas e documentos de identificação. | Entrega atual |
| `RN03` | Documentos obrigatórios | Inscrição bloqueada sem os documentos obrigatórios aplicáveis ao caso do candidato. | Entrega atual |
| `RN04` | Precedência de opções de curso | Vagas de 1ª opção de curso são processadas primeiro; as remanescentes são realocadas para a 2ª opção. A cascata de remanejamento entre modalidades é regra própria (`REQ-56`), não parte da `RN04`. | Etapa futura |
| `RN05` | Bônus regional | Bônus regional opcional, com percentual configurável por edital, aplicado sobre a nota final; sem comprovação de elegibilidade, o candidato é reclassificado sem o bônus (não eliminado). | Etapa futura |
| `RN06` | Cancelar e refazer | O candidato pode cancelar e refazer a inscrição antes do encerramento, com registro de motivo, data e autor. | Entrega atual |
| `RN07` | Lista de espera | Inserção na lista de espera conforme a opção indicada no ato da inscrição. | Etapa futura |
| `RN08` | Congelamento por edital | Todos os parâmetros ficam congelados ao serem vinculados a um edital; alterações retroativas são proibidas e atualizações globais valem só para novos editais. | Entrega atual |
| `RN13` | Recurso e efeito suspensivo | 1ª instância no sistema; instância superior julgada fora, mas registrada. Efeito suspensivo configurável por instância e fase; ausência não bloqueia. | Base configurada |
| `RN14` | Matrícula compulsória | Decisão judicial final que reconhece direito a vaga ocupada gera matrícula em vaga supranumerária, sem alterar o quadro nem a classificação. | Etapa futura |

### 12.1 Requisitos e regras derivadas (rastreabilidade)

Para rastreabilidade, cada regra acima e cada comportamento descrito neste documento têm um requisito correspondente com código estável (`UNI-REQ-NNNN`, aqui abreviado `REQ-NN`), verificável na [tabela de requisitos](../requisitos/index.mdx). Os principais:

| Requisito | Título | Descrição em negócio |
|---|---|---|
| `REQ-14` | Configuração do processo | Configurar um processo em rascunho: etapas, vagas, modalidades, critérios, bônus, atendimento, documentos e formulário. |
| `REQ-15` | Etapas, critérios e bônus | Configurar etapas pontuadas, pesos, critérios de desempate e bônus regional. |
| `REQ-16` | Documentos por condição e fase | Configurar documentos exigidos por condição sobre dados do candidato e por fase do processo. |
| `REQ-17` | Formulário configurável | Formulário de inscrição configurável por processo, com campos condicionais. |
| `REQ-19` | Publicação com cópia congelada | Publicar o edital criando a cópia oficial imutável da configuração. |
| `REQ-21 / 22` | Retificação e bloqueio de edição | Alterar edital publicado só por retificação (novo edital); edição direta bloqueada. |
| `REQ-23` a 33 | Ciclo da inscrição previsto | Rascunho, submissão, opções de curso, concorrência dupla, atendimento, documentos, comprovante, unicidade, nome social, cancelamento. |
| `REQ-56` | Cascata de remanejamento | Congelada no snapshot de publicação: por modalidade de origem, sequência ordenada de destinos mais a cota de fallback. A ordem de migração é semântica e distinta da `RN04`. |
| `REQ-57` a 71 | Documentos exigidos (detalhe) | Aplicabilidade geral/condicional, condições, base legal, formatos e idade, documentos alternativos, consequências, repetição por entidade e congelamento do conjunto. |
| `REQ-72` a 78 | Coleta e cálculo de cotas | Autodeclaração mais opção de concorrer, campos condicionais, não se aplica versus pendente, cálculo de modalidade pela Lei de Cotas e ordem de coleta. |
| `REQ-80`, `81`, `93` a `95` e `82` | Recurso e matrícula | Campos de suspensividade congelados, mecanismo do efeito suspensivo, anti-retroatividade por versão do ato, recusa nominal sem configuração de recurso, dependência de base legal e matrícula compulsória. |

---

## 13. Escopo: entrega atual e etapas futuras

| Capacidade | Situação | Observação |
|---|---|---|
| Cadastros de base (cursos, unidades, modalidades, tipos de documento, cidades/campus) | Entrega atual | Fundação para configurar o processo. |
| Configuração do processo (etapas, vagas, cotas, bônus, atendimento) | Entrega atual | Tudo editável enquanto rascunho. |
| Documentos exigidos por condição e fase | Entrega atual | Inclui base legal, consequências e documentos alternativos. |
| Coleta de dados e cálculo de modalidades | Entrega atual | Formulário condicional e composição da Lei de Cotas por configuração. |
| Publicação do edital e congelamento | Entrega atual | Cópia oficial imutável; retificação como novo edital. |
| Inscrição do candidato (rascunho a comprovante) | Etapa futura | Requisitos aprovados; ainda não há agregado de inscrição implementado. |
| Homologação documental (deferir/indeferir) | Etapa futura | Consome a configuração congelada. |
| Ensalamento e locais exatos de prova | Etapa futura | — |
| Lançamento de notas por etapa | Etapa futura | As etapas são configuradas agora; as notas são lançadas depois. |
| Processamento de classificação, remanejamento, desempate, bônus e resultado | Etapa futura | A configuração da cascata já está congelada no snapshot de publicação; esta etapa executará o remanejamento conforme a sequência de destinos e a cota de fallback. |
| Recursos administrativos | Etapa futura | Base de suspensividade já configurada (`RN13`). |
| Habilitação e chamadas de vagas (Ingresso/CRCA) | Etapa futura | Fronteira com o módulo Ingresso. |

## 14. Conformidade legal

O detalhamento por norma vive na página de [conformidade legal](../conformidade-legal/index.mdx); o quadro abaixo resume como o módulo Seleção atende cada uma.

| Norma | O que exige e como o sistema atende |
|---|---|
| LGPD (Lei 13.709/2018) | Proteção e minimização de dados pessoais e sensíveis; auditoria de acesso; ocultação de dados nos registros; divulgação minimizada por padrão. |
| Lei de Cotas (12.711/2012, atualizada pela 14.723/2023) | Reserva de vagas por modalidade, concorrência dupla e remanejamento por configuração congelável; o motor genérico avalia a matriz normativa R0–R9 da Lei de Cotas, sem ramificação por tipo de processo. |
| LBI (Lei 13.146/2015) | Inclusão da pessoa com deficiência e atendimento especializado configurável e solicitável na inscrição. |
| Lei 14.129/2021 (Governo Digital) | Serviço digital, transparência e reprodução fiel do resultado, garantida pelo congelamento na publicação. |
| Gov.br / Acessibilidade (Portaria SEI-MCOM 540/2020; IN SGD/ME 94/2022) | Uso do Design System do Gov.br e acessibilidade WCAG 2.1 AA / e-MAG (obrigação de autarquia federal). |
| Resoluções Unifesspa (414/2020, 326/2019, 184/2017, 183/2017) | Normas internas que embasam exigências e procedimentos, registradas como base legal das exigências documentais. |

---

Este documento descreve o comportamento de negócio esperado do módulo Seleção e serve de base para o refinamento de requisitos, a redação de critérios de aceite e a homologação. As regras aqui apresentadas derivam da especificação funcional do projeto e da legislação aplicável. Divergências entre este texto e a legislação vigente devem ser resolvidas em favor da lei, com registro de ajuste.
