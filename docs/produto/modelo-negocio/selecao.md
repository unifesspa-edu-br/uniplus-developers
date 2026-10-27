---
sidebar_position: 1
title: Modelo de negócio do módulo Seleção
description: Como o módulo Seleção funciona — configuração, publicação e inscrição, cotas e coleta de dados do candidato. Visão geral de negócio, base para refinamento de requisitos e homologação.
---

# Modelo de negócio do módulo Seleção

Documento de referência funcional para Análise de Requisitos — como o sistema funciona, como se configura um processo seletivo, como as cotas são atendidas e como os dados do candidato são coletados.

Uni+ · Sistema Unificado Unifesspa · Módulo Seleção. Escopo da entrega atual: configuração e publicação; a inscrição é capacidade prevista pelos requisitos do MVP.

> Esta página é a **visão geral de negócio** do módulo. Para comportamento já implementado, o código mergeado no `uniplus-api` é a fonte de verdade; para requisitos e regras de negócio, o registro estruturado versionado no portal é a fonte canônica conforme ADR-0002. A documentação narrativa sintetiza essas fontes. Os catálogos rastreáveis vivem em páginas dedicadas: o [domínio e as modalidades](../dominio/index.mdx), as [regras de negócio institucionais](../regras-negocio/conceitos.mdx) e a [tabela de requisitos](../requisitos/index.mdx) (`UNI-REQ`). Os pontos ainda em aberto estão identificados na seção **Questões em refinamento**.

## Como ler este documento

Este texto descreve o comportamento de negócio do sistema em linguagem corrente, sem termos de programação. As regras estão organizadas por assunto e, ao final, consolidadas em um catálogo. Cada regra aponta o requisito com código estável (`UNI-REQ-NNNN`, por exemplo `UNI-REQ-0046`) para facilitar referência futura em reuniões, editais e homologação. As situações são classificadas como Entrega atual (objeto desta primeira entrega), Fundação (base estrutural) ou Etapa futura (planejada para etapas seguintes).

## Questões em refinamento

Durante a revisão deste documento, foram identificadas questões de negócio que precisam de decisão do Product Owner, com validação jurídica, antes de virarem requisito fechado. Não são erros de redação — são questões de negócio ainda em aberto:

- Quantas cotas o candidato ocupa ao mesmo tempo. Há duas camadas que precisam ser conciliadas por interpretação, não uma contradição. A **derivação** (seção 7.5, `UNI-REQ-0076`, já implementada) produz o **conjunto** de modalidades a que o candidato é elegível — normalmente várias (por exemplo, cota de cor/raça e cota de renda juntas). O registro da **inscrição** (`UNI-REQ-0025`, "concorrência dupla na inscrição", ainda não implementado — não há agregado de inscrição) fala em registrar "no máximo uma de cada papel" (um papel de ampla, um de reservada), no espírito da Lei 14.723/2023. Essa cardinalidade não limita o conjunto derivado. Falta definir, quando a inscrição for construída, como o papel reservado se relaciona com ele: um único código reservado, ou uma referência ao conjunto. A [Decisão sobre a representação reservada](../requisitos/index.mdx) está proposta para deliberação do PO, com validação jurídica, antes da implementação de UNI-REQ-0025.
- Limite de renda na fronteira exata. A autodeclaração implementada no sistema pergunta "renda per capita **igual ou inferior** a 1 salário mínimo", aderente à Lei 12.711/2012 (art. 1º, parágrafo único). O registro de requisitos (`UNI-REQ-0076`) ainda descreve "inferior a" — divergência a reconciliar; o PO confirma o texto final e a fronteira (quem tem renda exatamente igual a 1 salário mínimo).
- Documento condicionado a cor/raça para quem não é de escola pública. Decidido pelo PO em 06/10/2026: a autodeclaração de cor/raça é coletada de todos os candidatos, no conjunto básico (`UNI-REQ-0151`), e uma exigência de documento que dependa dela alcança também quem não é de escola pública.

---

## 1. O que é o Uni+ e o módulo Seleção

O Uni+ (formalmente Sistema Unificado Unifesspa) é a plataforma que unifica os processos institucionais da Universidade Federal do Sul e Sudeste do Pará. O primeiro módulo é o de Seleção, que gerencia o ciclo de vida completo dos processos seletivos: da configuração do processo seletivo à publicação dos resultados.

A plataforma foi concebida para crescer além dos processos seletivos. Módulos futuros (auxílio estudantil, projetos de pesquisa, ingresso) reaproveitarão as mesmas capacidades de base — processo seletivo, recurso, avaliação e análise de documentos —, de modo que cada nova necessidade nasça de um modelo já existente, sem reescrever regras.

> Princípio orientador: tudo o que muda de um processo para outro — quais cotas existem, quais documentos são exigidos, quais perguntas o candidato responde, quais etapas têm nota — é configuração, e não regra fixa embutida no sistema. Um novo tipo de processo seletivo deve poder ser criado configurando o sistema, sem desenvolvimento de software. Este é o critério de projeto mais importante do módulo.

### O ciclo de vida do processo seletivo (seis etapas)

> Vocabulário: "processo seletivo" é o certame configurável; "edital" é o ato/documento que a publicação emite. Ver [Edital versus processo seletivo](../dominio/index.mdx#edital-versus-processo-seletivo).

- Cadastro e configuração do processo seletivo — parâmetros, etapas, pesos, cotas, locais de prova, datas, formulários, modalidades e regras do Fator de Atenuação das Desigualdades de Acesso.
- Publicação do processo seletivo — registra o edital como ato/documento normativo e produz a versão de configuração congelada.
- Inscrição de candidatos — cadastro online e envio de documentos.
- Homologação — análise administrativa dos documentos apresentados.
- Lançamento de notas — registro de notas por etapa.
- Classificação e resultado — cálculo da nota final, desempate e publicação.

A entrega atual cobre as etapas 1 e 2 (configurar e publicar). A etapa 3, de inscrição, é uma capacidade prevista pelos requisitos do MVP, ainda sem agregado implementado. As etapas 4 a 6 são desenvolvimentos posteriores, já previstos, que reaproveitarão a configuração congelada na publicação. Este documento descreve com profundidade o escopo atual e apresenta as etapas futuras de forma resumida, para dar visão de conjunto.

## 2. Glossário de negócio

Termos usados ao longo do documento, com o sentido que têm no Uni+.

| Termo | Significado |
|---|---|
| Processo seletivo | O certame em si (por exemplo, o SiSU 2026 ou o Vestibular Indígena/Quilombola). Reúne toda a configuração: etapas, cotas, vagas, documentos e formulário. É ele que se configura, publica e retifica — os dois termos não são sinônimos. |
| Edital | O documento oficial emitido quando um processo seletivo é publicado — o ato que fecha e oficializa a configuração. Não é editado diretamente: uma mudança pós-publicação sai como retificação, um novo ato que aponta o edital retificado. |
| Modalidade de concorrência | A fila em que o candidato disputa a vaga: ampla concorrência, uma cota da Lei 12.711/2012 ou uma ação afirmativa institucional. Ver seção 7. |
| Ampla concorrência | A modalidade `AC`, aberta a todos os candidatos. Todo candidato concorre nela, inclusive o cotista. |
| Cota | Reserva de vagas definida pela Lei 12.711/2012, sempre condicionada a ser egresso de escola pública, o que o sistema calcula de onde e como o candidato cursou o ensino médio (`UNI-REQ-0148`): as oito modalidades `LB_*` e `LI_*`. As dimensões declaradas (renda, cor/raça, deficiência, quilombola) **combinam-se** com a escola pública em modalidades compostas — por exemplo, escola pública, baixa renda e deficiência juntas produzem `LI_EP`, `LB_EP`, `LI_PCD` e `LB_PCD`. Ver seção 7. |
| Ação afirmativa | Reserva de vagas instituída por norma da Unifesspa (Resolução nº 532/2021), sem condição de escola pública nem de renda: `AC_PCD` para pessoa com deficiência, e `AC_I` e `AC_Q` no processo seletivo indígena e quilombola. Não é cota, e quem opta pelas cotas da lei não concorre a ela. Ver seção 7. |
| Dado do candidato | Qualquer informação usada para decidir o que se aplica a ele: alguns são informados por ele (autodeclarações, opções), outros são calculados pelo sistema a partir dos primeiros (ver seção 8). |
| Condição de exigência | A regra que determina de quem um documento é exigido — por exemplo, apenas de quem concorre à cota de renda. É montada a partir dos dados do candidato. |
| Fase | Momento do cronograma do processo (inscrição, homologação, habilitação etc.). Cada exigência de documento é vinculada à fase em que se aplica. |
| Versão congelada (cópia oficial) | Quando o processo seletivo é publicado, o sistema tira uma fotografia imutável de toda a configuração. A partir daí, é essa cópia — e não a configuração viva — que governa inscrições, análises e resultados. Ver seção 5. |
| Retificação | A forma oficial de alterar a configuração de um processo seletivo já publicado: emite-se um novo ato que aponta o ato retificado e registra o motivo, com nova versão congelada; o ato retificado continua publicado. A configuração publicada não é editada diretamente. |
| Administrador da Unidade | Servidor que configura e publica processos dentro da unidade que administra (por exemplo, o CEPS). |
| Candidato | Pessoa que preenche e submete a inscrição no portal público. |

## 3. Como o sistema funciona (visão geral)

Do ponto de vista de negócio, o módulo Seleção opera em três grandes momentos, sempre nesta ordem: primeiro Configurar o processo (em rascunho), depois Publicar o processo seletivo (que congela tudo e emite o edital) e por fim Inscrever candidatos.

Enquanto o processo está em rascunho, o administrador monta livremente toda a configuração e pode alterar qualquer parte. Nada ainda produz efeito para o candidato.

Ao publicar o processo seletivo, o sistema valida a configuração e, estando tudo conforme, oficializa e congela os parâmetros, emitindo o edital que torna a publicação pública. Desse instante em diante, a configuração viva não muda mais o que já foi publicado; qualquer alteração exige retificação (novo ato que aponta o retificado, com nova versão congelada).

Durante a inscrição, o candidato responde ao formulário do processo, indica opções de curso e responde às perguntas de cota, envia documentos e submete a inscrição. O sistema decide o que se aplica a ele sempre com base na cópia oficial congelada do processo seletivo, garantindo que a inscrição seja tratada pelas regras da versão em que foi enviada pela primeira vez, mesmo que a configuração seja alterada depois. Enquanto é rascunho, a inscrição acompanha a versão vigente; depois de uma retificação, quem já enviou continua na versão do seu envio, salvo se cancelar e se inscrever de novo (seção 6.2).

### Papéis (quem faz o quê)

| Papel | Responsabilidade no escopo atual |
|---|---|
| Administrador da Unidade | Configura o processo, define cotas, vagas, documentos e formulário, e publica o processo seletivo. Só atua dentro da unidade que administra. |
| Candidato | Preenche o formulário, escolhe opções de curso e responde às perguntas de cota, envia documentos e submete a inscrição no portal público. Não escolhe a modalidade diretamente — o sistema a deriva das respostas (seção 7). |

O acesso administrativo é restrito por unidade: um administrador só enxerga e opera os processos da sua unidade. A identificação de usuários (login) é feita por um provedor de identidade institucional, com integração ao Gov.br prevista para o ambiente de produção.

## 4. Como se configura um processo seletivo

A configuração é feita pelo Administrador da Unidade enquanto o processo está em rascunho. Ela é composta por várias dimensões, que juntas descrevem integralmente o certame.

- Etapas, pesos e critérios de resultado. Definem-se as etapas pontuadas (por exemplo, prova objetiva, redação, entrevista), o peso de cada uma, os critérios de desempate e o Fator de Atenuação das Desigualdades de Acesso, quando houver. A fórmula de nota final e os critérios de desempate ficam registrados na configuração e serão aplicados na etapa de classificação.
- Modalidades de concorrência e quadro de vagas. Definem-se quais modalidades o processo oferece (ampla concorrência e as cotas aplicáveis) e o número de vagas de cada uma, por oferta de curso. Também se define a ordem de remanejamento: para onde as vagas de uma cota não preenchida devem migrar (ver seção 7).
- Documentos exigidos. Para cada documento, define-se de quem é exigido (de todos, ou apenas de quem satisfaz uma condição), em que fase, se é obrigatório, qual a consequência de não apresentá-lo, a base legal que o embasa e as regras de formato, tamanho e validade. Ver seção 9.
- Formulários por finalidade. Monta-se, a partir dos modelos do tipo de processo, sempre o formulário de inscrição; o de isenção da taxa quando o processo cobra taxa, a partir de modelo que serve a qualquer tipo de processo, exigido a partir da frente de inscrição; e o de habilitação quando o cronograma tem a fase de habilitação, exigido a partir da frente de habilitação (`UNI-REQ-0144`). O de inscrição traz as perguntas de cota (autodeclarações, origem escolar e opções de concorrer); em todos, há campos que só aparecem, ou só são obrigatórios, em função de respostas anteriores. Ver seção 8.
- Atendimento especializado. Define-se quais condições, recursos e tipos de deficiência o processo oferece como atendimento especializado, para que o candidato possa solicitá-los na inscrição. Só o processo com aplicação de prova oferece atendimento especializado: o processo sem prova, como o que seleciona pela nota do ENEM, não o oferece, e o formulário de inscrição dele não pergunta por atendimento nem por recursos de acessibilidade (definição do PO em 23/10/2026, `UNI-REQ-0012`).
- Salvar e revisar. Enquanto em rascunho, tudo permanece editável. Quando a configuração está completa e coerente, o administrador solicita a publicação.

#### Validação antes de publicar

O sistema não permite publicar um processo seletivo com configuração incoerente. Antes de oficializar, verifica automaticamente pontos como: toda exigência que pode determinar o resultado tem base legal resolvida; toda condição que **referencia modalidade ou atendimento** aponta para os que o próprio processo oferece (condições sobre outros fatos do candidato — como idade, sexo, nacionalidade ou raça — não dependem da oferta); nenhuma exigência condicional que determina resultado (obrigatória ou com consequência) foi deixada sem condição — o que a tornaria exigida de ninguém. Se algo estiver inconsistente, a publicação é recusada com uma mensagem clara, e o administrador corrige ainda no rascunho.

## 5. Publicação do processo seletivo e o princípio do congelamento

A publicação é o ato central do módulo. É quando a configuração deixa de ser rascunho e passa a valer oficialmente, e quando o edital — o documento que a torna pública — é emitido.

> Congelamento dos parâmetros na publicação (`UNI-REQ-0019`). O congelamento ocorre por processo seletivo — ver [Edital versus processo seletivo](../dominio/index.mdx#edital-versus-processo-seletivo). Ao publicar o processo seletivo, toda a configuração é congelada em uma cópia oficial imutável, e o edital é emitido como o ato que a torna pública. Percentuais, critérios, cotas, vagas, documentos exigidos, a coleta de fatos (perguntas e suas pré-condições), as regras de derivação e as regras de cálculo passam a valer exatamente como estavam no momento da publicação. Alterações posteriores nos cadastros gerais do sistema não afetam processos seletivos já publicados — só valem para processos futuros. Isso garante duas coisas essenciais: os resultados são reproduzíveis (é sempre possível reconstruir fielmente como o processo seletivo funcionava) e ninguém pode alterar as regras de um certame em andamento.

Consequências práticas do congelamento, em linguagem de negócio:

- Imunidade após a publicação. Se, depois de publicar, alguém alterar um cadastro geral (por exemplo, a descrição de um tipo de documento ou a lista de valores de uma pergunta), o processo seletivo publicado continua funcionando como antes. A mudança só alcança processos seletivos novos.
- Alteração só por retificação. Para mudar prazo, vagas, cotas, pesos, Fator de Atenuação, documentos ou formulário de um processo seletivo já publicado, emite-se uma retificação, que registra um novo ato apontando o ato retificado, com o motivo e uma nova versão congelada; o ato retificado continua publicado. A edição direta da configuração já publicada é bloqueada (`REQ-21`, `REQ-22`).
- Qual versão vale em cada momento. Quando há mais de uma versão (por retificações), o sistema sabe identificar qual versão do processo seletivo — e qual edital — estava vigente em cada data, para avaliar cada ato pela regra correta da época.

> Exemplo. Um processo seletivo exige comprovante de renda com no máximo 3 meses. Após a publicação, a área administrativa altera o cadastro geral para 6 meses. Os candidatos daquele processo seletivo continuam sob a regra de 3 meses (a que valia quando ele foi publicado). Só os processos publicados depois da alteração usarão 6 meses.

## 6. Como o candidato se inscreverá

Quando for implementada, a inscrição será possível quando existir um processo seletivo publicado e vigente e o período de inscrição estiver aberto. O fluxo esperado do candidato:

- Abre a inscrição e preenche o formulário. A inscrição começa como rascunho, que usa sempre a versão vigente do formulário e pode ser descartado pelo candidato (seção 6.2). O candidato responde às perguntas do formulário do processo, incluindo as autodeclarações de cota (ver seção 8).
- Escolhe opções de curso e responde às perguntas de cota. Indica até duas opções de curso, sendo a segunda opcional (ver seção 6.1). O candidato não escolhe a modalidade diretamente: ele concorre sempre em ampla concorrência e, para cada reserva, somente quando é elegível e opta por concorrer; então, o sistema calcula o conjunto de modalidades — que pode conter mais de uma reserva ao mesmo tempo. Ver concorrência dupla e cálculo de modalidades na seção 7. A futura inscrição terá, no máximo, um papel reservado de registro; essa cardinalidade não limita o conjunto derivado. A relação entre esse papel e o conjunto será definida pela decisão proposta na seção Questões em refinamento.
- Solicita atendimento especializado, se necessário e se o processo tem prova. Entre as opções que o processo oferece, o candidato pode solicitar condições, recursos ou informar tipo de deficiência. Quem declara "outra condição específica" informa qual é, em até 120 caracteres.
- Envia os documentos exigidos. Anexa os documentos que se aplicam ao seu caso. Cada arquivo passa por uma verificação de segurança (antivírus), que em condição normal leva poucos segundos, e só é aceito se passar; enquanto isso aparece como "em verificação". O arquivo recusado não é guardado e conta como não enviado (seção 6.3).
- Submete a inscrição. O sistema confere se todos os documentos obrigatórios aplicáveis ao caso do candidato estão presentes. Faltando algum, a submissão é bloqueada com a indicação do que falta.
- Recebe o comprovante. Com tudo presente, a inscrição passa a submetida e o sistema emite um comprovante imutável, com o relatório dos documentos, pendências e implicações por escrito.

### Regras observadas na inscrição

| Requisito | Regra | Descrição em negócio |
|---|---|---|
| `UNI-REQ-0031` | Uma inscrição por CPF | Um mesmo CPF só pode ter uma inscrição ativa — rascunho ou enviada — por processo e nível de ensino. Inscrições em níveis de ensino diferentes do mesmo processo são permitidas. A inscrição cancelada não conta e não impede uma nova inscrição. |
| `UNI-REQ-0032` | Nome social | Sempre que o nome for exibido — em listas, telas ou documentos —, o nome social tem prioridade absoluta sobre o nome civil. |
| `UNI-REQ-0028` | Documentos obrigatórios | A inscrição não pode ser submetida sem os documentos obrigatórios exigidos para o caso do candidato. |
| `UNI-REQ-0033` | Cancelar e refazer | O candidato pode cancelar a inscrição enviada enquanto as inscrições estiverem abertas, sabendo que, para voltar a participar, terá de fazer uma inscrição nova, do zero (seção 6.2). O cancelamento registra quem cancelou, a data e o motivo, que é opcional para o candidato. |
| `UNI-REQ-0164` | Modalidades por opção de curso | As modalidades em que o candidato concorre são calculadas e registradas por opção de curso (seção 6.1); a segunda opção é opcional (`UNI-REQ-0024`). |
| `UNI-REQ-0165` | Correção da inscrição submetida | Com as inscrições abertas, o candidato corrige a mesma inscrição, que gera novo comprovante a cada correção (seção 6.1). |
| `UNI-REQ-0047` | Lista de espera | O candidato entra em lista de espera conforme a opção indicada no ato da inscrição. Etapa futura — capacidade planejada, ainda sem escopo na entrega atual. |

> Comprovante e pendências. Mesmo após submeter, um documento não obrigatório que não foi enviado, por exemplo, gera uma pendência que fica registrada e visível na consulta da inscrição e no comprovante — sem impedir a submissão. A inscrição permanece válida; a pendência apenas sinaliza algo a acompanhar. O comprovante nunca é alterado: uma reemissão gera um novo comprovante, preservando o anterior.

### 6.1 Duas opções de curso na inscrição

Quando o processo seletivo permite duas opções de curso, valem as regras abaixo (decisão do PO repassada pelo líder técnico em 19/10/2026; requisitos [`UNI-REQ-0024`](../requisitos/index.mdx) e [`UNI-REQ-0164`](../requisitos/index.mdx)).

1. **A segunda opção é opcional.** O candidato pode se inscrever só com a primeira.
2. **A segunda opção precisa ser válida.** Tem de ser uma oferta diferente da primeira (um curso em um campus e turno) do mesmo processo seletivo ([`UNI-REQ-0134`](../requisitos/index.mdx)); nos exemplos, "curso" quer dizer essa oferta. O envio exige a primeira opção quando o processo tem ofertas; o rascunho pode ficar sem. Só existe segunda opção se a primeira foi escolhida. Se o processo permite uma só opção, não há segunda.
3. **O candidato informa tudo uma única vez.** Renda, escola pública, cor/raça, deficiência e as demais informações, bem como os documentos, valem para as duas opções. O formulário e os documentos exigidos consideram os dois cursos escolhidos.
4. **As modalidades são calculadas por opção.** A elegibilidade do candidato é uma só e considera todas as modalidades que as regras de distribuição das ofertas do processo admitem, inclusive as institucionais (no PSIQ, a ação afirmativa indígena ou quilombola; [`UNI-REQ-0096`](../requisitos/index.mdx)), mas cada oferta tem a sua própria distribuição de vagas (modalidades oferecidas e quadro de vagas). Por isso o sistema calcula e registra separadamente, para cada opção, em quais modalidades o candidato concorre: as que o direito dele permite e que a distribuição da oferta daquela opção contempla. Para decidir o que o formulário e os documentos pedem, vale a união das modalidades das opções escolhidas; ofertas que o candidato não escolheu não contam. Assim, só se pede documento de cota que vale em ao menos uma das opções escolhidas. Antes de escolher o curso, vale o conjunto do processo.
5. **O comprovante mostra as duas opções.** Traz a primeira e a segunda opção (ou "não declarada") e as modalidades em que o candidato concorre em cada uma.
6. **A segunda opção pode ser trocada ou retirada** enquanto as inscrições estiverem abertas, corrigindo a inscrição já submetida ([`UNI-REQ-0165`](../requisitos/index.mdx)). É a mesma inscrição, com o mesmo número, que continua submetida: não há cancelamento nem nova inscrição. A correção pode alterar as respostas como num novo envio e passa pelas mesmas conferências do envio (campos, termos e documentos obrigatórios, regras da segunda opção); se não passar, é recusada por inteiro e a inscrição e o comprovante anteriores continuam valendo. O que uma regra fixa depois do envio, como o nome social ([`UNI-REQ-0153`](../requisitos/index.mdx)), continua fixo. Cada correção emite um novo comprovante, os anteriores são preservados e vale o último. Encerradas as inscrições, não há mais correção.
7. **A inscrição segue as regras do edital vigentes quando foi enviada pela primeira vez** ([`UNI-REQ-0084`](../requisitos/index.mdx)). Uma retificação posterior que mude o número de opções de curso não altera inscrições já enviadas. O rascunho, que ainda não foi enviado, acompanha a retificação (seção 6.2).
8. **Correção das opções de curso após o envio (decisão do PO em 22/10/2026).** A alteração da primeira ou da segunda opção de curso durante a correção de uma inscrição enviada fica pendente até a conclusão de um novo envio válido ([`UNI-REQ-0165`](../requisitos/index.mdx)). Enquanto a correção não for enviada, permanecem válidas as opções e as modalidades registradas no último comprovante. O novo envio passa pelas mesmas validações da inscrição, considerando as opções escolhidas, as modalidades correspondentes e os documentos exigidos. Se a correção for descartada ou não for enviada até o encerramento das inscrições, a inscrição e o comprovante anteriores permanecem válidos, sem incorporar as alterações.

**O que estas regras ainda não cobrem.** Elas tratam da escolha das opções na inscrição e do que fica registrado. O uso dessa escolha acontece depois, na classificação, e será definido em etapas futuras:

- **Aproveitamento das vagas pela segunda opção** ([`UNI-REQ-0045`](../requisitos/index.mdx)). A classificação preenche primeiro as vagas de cada curso com quem o escolheu como primeira opção. Se sobrarem vagas, elas são oferecidas, pela ordem de classificação, a quem escolheu aquele curso como segunda opção. Exemplo: Direito tem 30 vagas e só 25 candidatos aprovados em primeira opção; as 5 vagas restantes vão para os mais bem classificados que indicaram Direito como segunda opção.
- **Lista de espera** ([`UNI-REQ-0047`](../requisitos/index.mdx)). É a fila de quem não entrou nas vagas iniciais e aguarda ser chamado se alguém desistir ou não fizer a matrícula. O edital define se há lista de espera e como o candidato a indica na inscrição.

Até essas etapas existirem, a segunda opção fica registrada na inscrição e no comprovante, mas ainda não muda o resultado da classificação.

**Exemplo 1 — a escolha.** Um processo oferece Medicina, Direito, Engenharia da Computação e Engenharia Elétrica e permite duas opções. Marlene escolhe Direito como primeira opção e Engenharia da Computação como segunda. Ela responde ao formulário e envia os documentos uma só vez; o formulário e a lista de documentos já levam em conta os dois cursos. Se preferisse, Marlene poderia ter escolhido apenas Direito.

**Exemplo 2 — a modalidade muda de um curso para o outro.** Leandro declara ter deficiência, cursou o ensino médio em escola particular e, por isso, não concorre pelas cotas da lei: concorre em ampla concorrência e na ação afirmativa para pessoa com deficiência, que é institucional. Escolhe Direito como primeira opção e Engenharia Elétrica como segunda. Os dois cursos oferecem as cotas da lei, mas só Direito oferece a ação afirmativa para pessoa com deficiência. O comprovante mostra:

| Opção | Curso | Modalidades em que Leandro concorre |
|---|---|---|
| 1ª | Direito | Ampla concorrência; ação afirmativa para pessoa com deficiência |
| 2ª | Engenharia Elétrica | Ampla concorrência |

A elegibilidade de Leandro é a mesma nos dois cursos; o que muda é o que cada curso oferece.

**O que é recusado.** Helena tenta escolher Direito como primeira e como segunda opção: a segunda opção é recusada, pois tem de ser outro curso. Erick tenta indicar uma segunda opção em um processo que permite uma só: a segunda opção é recusada, pois nesse processo ela não existe.

---

### 6.2 Rascunho, descarte, cancelamento e retificação

Regras definidas na reunião de alinhamento de 20/10/2026 (CEPS, PO e líder técnico); requisitos [`UNI-REQ-0023`](../requisitos/index.mdx), [`UNI-REQ-0033`](../requisitos/index.mdx), [`UNI-REQ-0084`](../requisitos/index.mdx), [`UNI-REQ-0165`](../requisitos/index.mdx) e [`UNI-REQ-0167`](../requisitos/index.mdx); a decisão do líder técnico de 21/10/2026 sobre avanço e envio ([`UNI-REQ-0028`](../requisitos/index.mdx)) está ao fim da seção.

1. **O rascunho segue a versão vigente do formulário.** Ao continuar depois de uma retificação, o candidato vê o formulário novo: as respostas a perguntas que saíram deixam de valer, as perguntas novas obrigatórias ficam pendentes, e a oferta ou a 2ª opção que a versão nova não admite são retiradas. A versão do formulário fica fixa a partir do primeiro envio.
2. **O candidato pode descartar o rascunho.** Ele some de "Minhas inscrições" e o candidato pode iniciar outro. Rascunho não se cancela.
3. **O candidato cancela só a inscrição enviada e só com as inscrições abertas.** Antes de confirmar, o sistema avisa que, para voltar a participar, o candidato terá de fazer uma inscrição nova, do zero, com o formulário vigente. O número da inscrição cancelada não é reaproveitado e não há limite de cancelamentos. O motivo é opcional para o candidato: sem ele, fica registrado "a pedido do candidato". Quem cancelou e a data são sempre registrados.
4. **Ações do candidato em cada situação**, conforme a tabela abaixo.
5. **Retificação que altera o formulário.** O sistema não avisa os inscritos: o CEPS orienta por comunicado e e-mail. Quem não cancelar e refizer fica com a inscrição como a enviou. Como requisito futuro da administração, fica registrado o relatório de inscritos por data de envio e versão do formulário.

| Situação | Ações |
|---|---|
| Rascunho | Continuar e descartar. |
| Enviada, com as inscrições abertas | Corrigir os dados, cancelar e ver o comprovante. |
| Enviada, com correção não enviada e as inscrições abertas | Continuar a correção, descartar a correção, cancelar e ver o comprovante. |
| Enviada, com as inscrições encerradas | Só ver o comprovante. |

**Correção pendente de inscrição enviada (decisões do PO em 22/10/2026).** A correção de uma inscrição já enviada é mantida separadamente da última versão submetida. Alterações em respostas e arquivos somente passam a valer após a conclusão de um novo envio válido, que gera outro comprovante. Até esse momento, a inscrição anteriormente enviada e seu comprovante permanecem inalterados. A homologação e a análise documental consideram exclusivamente as informações e os documentos do último envio válido ([`UNI-REQ-0165`](../requisitos/index.mdx) e [`UNI-REQ-0029`](../requisitos/index.mdx)).

**Avisos ao candidato.** Enquanto houver correção pendente, o formulário apresenta aviso visível de que as alterações ainda não são válidas e distingue os arquivos que já integram a inscrição enviada daqueles que dependem de novo envio. Ao tentar sair da página com alterações não enviadas, o sistema solicita confirmação. Em "Minhas inscrições", a existência da pendência é indicada como "Correção não enviada", sem modificar a situação válida da inscrição.

**Descarte da correção pendente.** O candidato pode descartar voluntariamente uma correção ainda não enviada. As correções que permanecerem pendentes até o encerramento das inscrições são descartadas automaticamente, incluindo os arquivos exclusivos dessas correções, conforme as regras de exclusão lógica do [`UNI-REQ-0169`](../requisitos/index.mdx). O descarte da correção não cancela a inscrição: a última versão enviada e seu comprovante permanecem válidos e inalterados.

**Notificação de correção pendente.** Além da indicação no portal, o sistema envia um e-mail ao candidato com dois dias de antecedência do encerramento das inscrições, caso exista uma correção não enviada. Essa notificação é específica da correção pendente e não altera o tratamento das comunicações sobre retificações do edital descrito no item 5 desta seção.

**Avanço e envio no formulário** (decisão do líder técnico em 21/10/2026, a confirmar pelo PO). O candidato só avança de um passo para o seguinte quando o passo atual não tem pendência obrigatória (pergunta sem resposta, resposta inválida, termo obrigatório não marcado ou documento obrigatório não atendido); voltar a um passo anterior é sempre livre. "Enviar inscrição" só envia quando todos os passos estão válidos — perguntas, aceites e documentos obrigatórios — e, enquanto isso não ocorre, informa o motivo. O rascunho pode ser salvo com pendências. A regra vale também na correção da inscrição enviada. O formulário válido controla o avanço e o envio, e o servidor continua conferindo tudo no envio ([`UNI-REQ-0023`](../requisitos/index.mdx) e [`UNI-REQ-0028`](../requisitos/index.mdx)).

### 6.3 Envio de documentos e atendimento especializado

Regras definidas pelo líder técnico em 20/10/2026, **a confirmar pelo PO**; requisitos [`UNI-REQ-0026`](../requisitos/index.mdx), [`UNI-REQ-0027`](../requisitos/index.mdx), [`UNI-REQ-0028`](../requisitos/index.mdx), [`UNI-REQ-0029`](../requisitos/index.mdx), [`UNI-REQ-0030`](../requisitos/index.mdx), [`UNI-REQ-0130`](../requisitos/index.mdx), [`UNI-REQ-0168`](../requisitos/index.mdx), [`UNI-REQ-0169`](../requisitos/index.mdx), [`UNI-REQ-0170`](../requisitos/index.mdx) e [`UNI-REQ-0173`](../requisitos/index.mdx). Cada item abaixo é uma decisão do líder técnico em 20/10/2026, a confirmar pelo PO, salvo onde o item indica outra data: o teto de 20 MB foi confirmado pelo PO em 23/10/2026, e o tratamento do arquivo em verificação é proposta do líder técnico confirmada pelo PO em 23/10/2026.

1. **O envio é feito no próprio formulário.** O candidato anexa cada documento exigido no passo "Documentos", com a inscrição em rascunho ou já enviada (correção), enquanto as inscrições estão abertas. A página "Documentos" do portal, para acompanhar pendências depois do envio, fica para depois; nesta primeira entrega a situação aparece na consulta da inscrição e no comprovante.
2. **O arquivo só vale depois de verificado.** O sistema aceita só PDF, JPEG e PNG, dentro dos formatos que a exigência permite, com o tamanho máximo da exigência ou, se ela não define, 10 MB; nenhum arquivo passa de 20 MB (teto confirmado pelo PO em 23/10/2026). O sistema confere também que o conteúdo corresponde ao formato (o PDF tem de começar como PDF). Até o resultado, o arquivo aparece como "em verificação" e ainda não atende a exigência. Arquivo com vírus é recusado e não é guardado. Toda recusa diz ao candidato o motivo (formato, tamanho, conteúdo que não corresponde ao formato, PDF protegido por senha ou verificação de segurança), sem nomear a ameaça encontrada. Se a verificação estiver fora do ar, o arquivo não é recusado: fica em verificação até ela voltar. Se o arquivo não chegou ou foi trocado depois de anexado, o candidato é avisado para enviá-lo de novo (proposta do líder técnico confirmada pelo PO em 23/10/2026). A verificação de segurança ([`UNI-REQ-0173`](../requisitos/index.mdx)) não recusa recurso legítimo do formato, como formulário preenchível ou PDF protegido só contra edição ou impressão; recusa o conteúdo que não consegue varrer por inteiro, como um arquivo com senha escondido dentro de um PDF; e a falha na atualização da base de ameaças não bloqueia o envio. O PDF que exige senha para abrir é recusado com a mensagem "Este PDF está protegido por senha. Envie o arquivo sem senha.".
3. **Proteção do arquivo.** Cada arquivo é guardado cifrado, protegido separadamente, conforme o parecer das encarregadas de dados de 13/10/2026. O nome original não é guardado (a tela mostra "Arquivo 1 — PDF, 2 MB") e o local de guarda não contém dado pessoal.
4. **Conferência no envio da inscrição.** Falta de documento **obrigatório** recusa o envio, junto das demais recusas. Documento obrigatório ainda **em verificação** também não atende: o envio espera o resultado, e o prazo vale para o envio da inscrição. Se as inscrições se encerram com documento obrigatório em verificação, a inscrição não é enviada; se a verificação ficar fora do ar perto do encerramento, cabe à comissão prorrogar o prazo por retificação do edital (proposta do líder técnico confirmada pelo PO em 23/10/2026). Quando a exigência aceita alternativas ("laudo **ou** atestado"), o documento alternativo atende. Documento **não obrigatório** que falta não impede o envio; o comprovante registra a consequência. A correção da inscrição enviada passa pela mesma conferência.
5. **Nada se apaga por mudança de resposta ou de edital.** Se o candidato muda uma resposta, ou o edital é retificado e a exigência some, o arquivo apenas deixa de contar e volta a contar se a exigência voltar. No envio da inscrição (inclusive na correção), são excluídos os arquivos de exigência que não se aplica **que nunca constaram de um envio**, e ficam marcados como excluídos (item 6). O arquivo que já constou de um envio, e portanto de um comprovante, nunca é apagado por substituição nem por deixar de valer: fica guardado e vale o da correção mais recente.
6. **Excluir não apaga de imediato.** Descartar o rascunho marca a inscrição e os arquivos como excluídos: a inscrição some para o candidato e deixa de contar como ativa, e as informações e os arquivos ficam guardados, marcados como excluídos. O mesmo vale para o arquivo removido do rascunho e para o excluído no envio (item 5). O que está marcado como excluído não aparece para o candidato, não atende exigência e não entra no comprovante. A remoção definitiva acontece 90 dias depois da exclusão, em entrega futura. Cancelar a inscrição enviada não exclui nada, e os arquivos seguem a retenção da tabela de temporalidade (`UNI-REQ-0131`). Decisão do líder técnico em 23/10/2026, por cautela (o PO admite a remoção imediata), sem depender de confirmação do PO.
7. **Retirada e substituição de arquivos durante a correção (decisão do PO em 22/10/2026).** O candidato pode retirar ou substituir arquivos que constaram de envios anteriores enquanto corrige a inscrição ([`UNI-REQ-0165`](../requisitos/index.mdx)). A retirada ou substituição só produz efeitos após um novo envio válido. O arquivo retirado deixa de integrar a versão vigente da inscrição e não consta do novo comprovante. Os comprovantes anteriores e os registros documentais correspondentes permanecem inalterados, observadas as regras de retenção do [`UNI-REQ-0131`](../requisitos/index.mdx). Se a retirada deixar uma exigência documental obrigatória sem atendimento, o novo envio é recusado ([`UNI-REQ-0028`](../requisitos/index.mdx)).
8. **Arquivos exclusivos de correções descartadas (decisão do PO em 22/10/2026).** Quando uma correção pendente é descartada voluntariamente ou automaticamente no encerramento das inscrições, os arquivos anexados exclusivamente nessa correção, que nunca integraram um envio válido, deixam de produzir efeitos e seguem as regras de exclusão lógica do [`UNI-REQ-0169`](../requisitos/index.mdx). Os arquivos que integraram comprovantes anteriores permanecem sujeitos à retenção documental aplicável.
9. **Preservação documental e exclusão física (decisão técnica do líder técnico em 23/10/2026, sem depender de confirmação do PO).** Retirar um arquivo da versão vigente da inscrição não significa determinar sua exclusão física do armazenamento. A decisão sobre como e quando realizar a exclusão física é técnica, respeitadas as obrigações de retenção documental. A previsão de remoção definitiva após 90 dias, em entrega futura, aplica-se aos registros e arquivos elegíveis à exclusão lógica, não aos documentos históricos cuja retenção ainda seja obrigatória ([`UNI-REQ-0131`](../requisitos/index.mdx) e [`UNI-REQ-0169`](../requisitos/index.mdx)).
10. **Comprovante.** Para cada documento exigido, traz se é obrigatório, se foi atendido ou está pendente e, por escrito, a consequência de não atender. Para cada arquivo, traz o código de verificação (SHA-256), o tamanho e o formato — nunca o nome original nem onde está guardado. O comprovante nunca traz arquivo em verificação: documento não obrigatório ainda em verificação no envio consta como pendente, salvo a alternativa de um grupo "um ou outro" já atendido, que consta como dispensada.
11. **Quem acessa.** Nesta primeira entrega, só o próprio candidato é dono dos seus arquivos. Ele visualiza e baixa o arquivo que enviou, depois de verificado, para ter certeza de que mandou o arquivo correto (definição repassada pelo líder técnico em 23/10/2026). O CEPS ainda não os consulta pelo sistema (risco registrado): o acesso por operação administrativa auditada, com registro do acesso sem o conteúdo, entra antes da análise do atendimento (uniplus-api#2040), e o da banca fica para a homologação.
12. **Documentos do atendimento especializado são obrigatórios para quem solicita atendimento.** Sem o documento de cada condição declarada, a inscrição não é enviada: o documento é o que dá direito ao atendimento e permite ao CEPS organizá-lo. Quem não solicita atendimento não recebe a exigência. A análise do documento se dará na homologação documental (`UNI-REQ-0041`). Definição do PO em 22/10/2026.
13. **O modelo de formulário traz os documentos padrão.** Ao aplicar o modelo a um processo, o conjunto abaixo é copiado para a configuração do processo, na fase de inscrição; o administrador pode ajustá-lo, e o ajuste vale só para aquele processo. Há uma exigência por condição, só para quem solicita atendimento; quem declara duas condições comprova as duas; condição que o processo não oferta, ou que não tem documento na tabela (pessoa idosa), não gera exigência; reaplicar o modelo substitui os documentos de inscrição do processo, inclusive os ajustados; aplicar o modelo exige a fase de inscrição no cronograma. A tabela e a base legal abaixo foram definidas pelo PO em 22/10/2026; o processo só é publicado com a base legal resolvida.

| Condição de atendimento | Documento exigido |
|---|---|
| Toda condição do catálogo, exceto lactante e pessoa idosa, inclusive outra condição específica | Laudo médico |
| Lactante | Certidão de nascimento da criança (não depende do sexo declarado); permite ao CEPS preparar a sala em que o acompanhante fica com o bebê |
| Pessoa idosa | Nenhum (a idade vem do cadastro) |

O documento comprova a condição, não o recurso solicitado.

**Base legal.** Indicada pelo PO. Para lactante, a Lei nº 13.872/2019, art. 2º, § 2º, que prevê a prova da idade da criança pela certidão de nascimento. Para as demais condições, a Lei nº 13.146/2015 (Lei Brasileira de Inclusão), o Decreto nº 9.508/2018, na redação do Decreto nº 9.546/2018, que prevê a comprovação da deficiência na inscrição, e o Decreto nº 3.298/1999. A Lei nº 13.872/2019 e os decretos tratam de concurso público: o processo seletivo os adota como referência, e exigir o documento já na inscrição é regra do edital.

**Exemplo 1 — pessoa com deficiência.** Leandro declara pessoa com deficiência e solicita atendimento. O passo "Documentos" pede o laudo médico. Ele anexa um PDF de 2 MB, que passa pela verificação, e envia a inscrição. O comprovante traz o laudo como atendido, com o código de verificação, o tamanho e o formato, sem o nome do arquivo.

**Exemplo 2 — sem o documento.** Camila declara a condição lactante, solicita atendimento e não anexa a certidão de nascimento da criança. O envio da inscrição é recusado, informando que falta a certidão. Ela anexa a certidão e envia; ou, se desistir do atendimento, retira a solicitação e envia sem a exigência.

**Exemplo 3 — nada se apaga no rascunho.** Helena anexa o laudo, desmarca por engano a condição e marca de novo: o laudo continua anexado. Se enviasse a inscrição sem a condição marcada, o laudo seria excluído, pois nunca constou de um envio.

**Exemplo 4 — documento alternativo.** A exigência aceita "laudo médico ou atestado de profissional habilitado". Lúcia anexa só o atestado: a exigência está atendida e o envio não é recusado.

**Exemplo 5 — descarte e cancelamento.** Valentina descarta o rascunho: a inscrição e os arquivos que anexou somem da tela dela, ela pode começar outra inscrição no mesmo processo, e o que descartou fica guardado, marcado como excluído, até a remoção definitiva. Marlene cancela a inscrição enviada e os arquivos dela continuam guardados pelo prazo de retenção.

**Exemplo 6 — correção descartada.** Helena enviou a inscrição com um laudo médico em PDF, registrado no comprovante. Depois, iniciou uma correção, retirou o laudo anterior da versão em preparação e anexou outro arquivo. Antes de concluir o novo envio, decidiu descartar a correção. O arquivo anexado exclusivamente nessa correção é marcado como excluído, conforme o [`UNI-REQ-0169`](../requisitos/index.mdx). A inscrição anteriormente enviada permanece válida, com o laudo original e o comprovante inalterados. Se Helena não tivesse descartado a correção voluntariamente, ela seria descartada automaticamente no encerramento das inscrições, com o mesmo resultado para a inscrição válida.

## 7. Cotas e modalidades de concorrência

Esta é a área mais sensível do sistema, por implementar a Lei de Cotas (Lei 12.711/2012, atualizada pela Lei 14.723/2023) e as ações afirmativas institucionais da Unifesspa (Resolução nº 532/2021). O princípio geral: o candidato nunca escolhe diretamente uma cota como `LB_PPI`. Ele responde a um conjunto de perguntas simples (autodeclarações e opções de concorrer), e o sistema calcula automaticamente todas as modalidades a que ele passa a concorrer.

### 7.1 As modalidades de concorrência

| Código | Natureza | Quem concorre |
|---|---|---|
| AC | Ampla concorrência | Todos os candidatos, independentemente de cota. |
| `AC_PCD` | Ação afirmativa | Pessoa com deficiência que **não** optou pelas cotas da lei — por não ser egresso de escola pública (`UNI-REQ-0148`) ou por ter recusado as cotas —, independentemente de renda. As vagas saem da ampla concorrência (Resolução nº 532/2021, art. 1º). O edital a apresenta com o rótulo V; V é apenas um rótulo de exibição, não um código próprio. |
| `LI_EP` | Cota | Escola pública, independentemente de renda. |
| `LI_PPI` | Cota | Escola pública, mais preto, pardo ou indígena, independentemente de renda. |
| `LI_Q` | Cota | Escola pública, mais quilombola, independentemente de renda. |
| `LI_PCD` | Cota | Escola pública, mais pessoa com deficiência, independentemente de renda. |
| `LB_EP` | Cota | Escola pública com o critério de renda familiar per capita aplicável ao processo. |
| `LB_PPI` | Cota | Escola pública, mais preto, pardo ou indígena, com o critério de renda aplicável ao processo. |
| `LB_Q` | Cota | Escola pública, mais quilombola, com o critério de renda aplicável ao processo. |
| `LB_PCD` | Cota | Escola pública, mais pessoa com deficiência, com o critério de renda aplicável ao processo. |

A natureza de cada modalidade está em [UNI-REQ-0141](../requisitos/index.mdx). Além dessas dez, `AC_I` e `AC_Q` são as ações afirmativas do processo seletivo indígena e quilombola, com vagas por acréscimo ao total do curso (Resolução nº 532/2021, art. 2º; [UNI-REQ-0096](../requisitos/index.mdx)). Em processo que não oferta as cotas da lei, como o PSE Educação do Campo, a reserva de pessoa com deficiência também usa `AC_PCD`, pela regra de distribuição `DISTRIB-VAGAS-COM-AC-PCD` ([UNI-REQ-0140](../requisitos/index.mdx)).

As modalidades com renda (grupo LB) também concorrem à modalidade equivalente independente de renda (grupo LI). Em outras palavras: quem tem direito à cota de renda concorre tanto na sua cota específica de baixa renda quanto na versão sem exigência de renda. A fronteira exata do critério de renda permanece em refinamento pelo PO, com validação jurídica; ver a nota na seção Questões em refinamento.

### 7.2 Concorrência dupla (Lei 14.723/2023)

> Concorrência simultânea. Todo candidato concorre ao mesmo tempo em ampla concorrência e, para cada modalidade reservada, somente quando é elegível e opta por concorrer a ela, sendo classificado na situação mais favorável. Por isso a ampla concorrência (AC) sempre entra no conjunto de modalidades — ela é a âncora presente para todos. Cota da lei e ação afirmativa, porém, não se somam: quem opta pelas cotas da lei não concorre a `AC_PCD` ([UNI-REQ-0142](../requisitos/index.mdx)). A derivação pode produzir várias reservas; quando implementada, a inscrição terá no máximo um papel de ampla e um papel reservado, sem limitar esse conjunto. A relação entre o papel reservado e o conjunto derivado será definida pela decisão proposta ao PO, com validação jurídica.

### 7.3 O formulário de cotas (as perguntas)

A definição das cotas segue o formulário da Unifesspa, com a origem escolar em duas perguntas definida pelo `UNI-REQ-0148`. Para cada dimensão de cota, há uma elegibilidade e uma opção de concorrer (você deseja concorrer a essa cota?). A elegibilidade é uma autodeclaração (você é / você se enquadra?), exceto a de escola pública, que não é perguntada: é calculada de onde e como o candidato cursou o ensino médio (`UNI-REQ-0148`). Ser elegível não basta: a cota só entra se o candidato escolher concorrer a ela.

| Dimensão | Autodeclaração | Opção de concorrer |
|---|---|---|
| Deficiência | Você se autodeclara pessoa com deficiência? | Deseja concorrer às vagas reservadas a pessoas com deficiência? |
| Escola pública | Não é perguntada: é calculada de onde e como o candidato cursou o ensino médio (`UNI-REQ-0148`). | Deseja concorrer às vagas reservadas a egressos de escola pública? |
| Cor/raça | Como se autodeclara: amarela, branca, indígena, preta ou parda? | Deseja concorrer às vagas reservadas a pretos, pardos e indígenas? |
| Quilombola | Você se autodeclara pessoa quilombola? | Deseja concorrer às vagas reservadas a quilombolas? |
| Renda | Sua família atende ao critério de renda per capita aplicável ao processo? | Deseja concorrer às vagas reservadas por critério de renda? |

A opção de concorrer às vagas de escola pública é a **opção pelas cotas da lei**: todas as oito cotas dependem dela, inclusive `LI_PCD` e `LB_PCD`. O candidato não escolhe modalidade — responde às perguntas, e o sistema o enquadra em todas as modalidades que as respostas permitem.

### 7.4 Regras de exibição das perguntas

As perguntas não aparecem todas de uma vez: a exibição de cada uma depende das respostas anteriores. Essas regras vêm do próprio formulário oficial:

- A opção de concorrer a uma cota só aparece para quem é elegível a ela — pela autodeclaração ou, no caso da escola pública, pelo cálculo a partir da origem escolar.
- Se as respostas de origem escolar mostram que o candidato não é egresso de escola pública, ou ele é egresso mas não deseja concorrer às vagas de escola pública, as perguntas de opt-in de cor/raça, quilombola e renda não aparecem (a autodeclaração de cor/raça do conjunto básico continua) — ele não optou pelas cotas da lei e segue para a ampla concorrência. A dimensão de deficiência é exceção: a pessoa com deficiência que deseja concorrer como tal concorre também à ação afirmativa `AC_PCD` (rotulada V), qualquer que seja a escola em que estudou.
- Se o candidato se declara amarela ou branca, a pergunta de concorrer à cota de cor/raça não aparece.
- Se o candidato se declara indígena, a dimensão quilombola não aparece — a legislação não permite acumular as duas.
- A condição de indígena é dado próprio de elegibilidade (`UNI-REQ-0147`): na habilitação exige a declaração de pertencimento e não passa por heteroidentificação, apenas por análise de documentos.

### 7.5 Como o sistema calcula as modalidades a partir das respostas

A partir das autodeclarações e das opções de concorrer, o sistema aplica a composição da Lei de Cotas e produz o conjunto de modalidades a que o candidato concorre. Nas linhas abaixo, dizer que o candidato concorre por X significa que ele fez as duas coisas: é elegível a X — por autodeclaração ou, na escola pública, pelo cálculo da origem escolar — e optou por concorrer à cota X. Apenas ser elegível não coloca ninguém na cota.

A tabela abaixo é uma **amostra ilustrativa** dos casos mais representativos, para dar intuição do cálculo — não é a fonte normativa. O critério de aceite obrigatório é a regra de derivação congelada: as regras R0–R9 (a ampla concorrência, a ação afirmativa `AC_PCD` e as oito cotas da Lei 12.711) e todas as combinações da matriz completa são normativas por [`UNI-REQ-0076`](../requisitos/index.mdx), e o resultado exato de qualquer combinação dessas dez (inclusive as omitidas desta amostra) é o que a regra congelada produz. "Opta pelas cotas da lei" significa ser egresso de escola pública e responder que deseja concorrer às vagas de escola pública (§7.3). Os conjuntos abaixo são calculados antes da restrição às modalidades ofertadas pelo processo (ver observação ao final da seção).

| Perfil do candidato (opções ativas) | Concorre a |
|---|---|
| Não opta pelas cotas da lei e não concorre por deficiência | AC |
| Concorre por deficiência; não é de escola pública | AC, `AC_PCD` |
| Concorre por deficiência; é de escola pública, mas não opta pelas cotas da lei | AC, `AC_PCD` |
| Concorre por deficiência; opta pelas cotas da lei; não concorre por renda | AC, `LI_EP`, `LI_PCD` |
| Concorre por deficiência; opta pelas cotas da lei; concorre por renda | AC, `LI_EP`, `LB_EP`, `LI_PCD`, `LB_PCD` |
| Opta pelas cotas da lei; não concorre por renda | AC, `LI_EP` |
| Opta pelas cotas da lei; concorre por renda | AC, `LI_EP`, `LB_EP` |
| Preto/pardo/indígena, opta pelas cotas da lei, concorre por PPI; não concorre por renda | AC, `LI_EP`, `LI_PPI` |
| Preto/pardo/indígena, opta pelas cotas da lei, concorre por PPI; concorre por renda | AC, `LI_EP`, `LB_EP`, `LI_PPI`, `LB_PPI` |
| Preto/pardo/indígena elegível, opta pelas cotas da lei, mas não concorre por PPI; não concorre por renda | AC, `LI_EP` |
| Quilombola (não indígena), opta pelas cotas da lei, concorre por Q; não concorre por renda | AC, `LI_EP`, `LI_Q` |
| Quilombola (não indígena), opta pelas cotas da lei, concorre por Q; concorre por renda | AC, `LI_EP`, `LB_EP`, `LI_Q`, `LB_Q` |
| Preto/pardo, opta pelas cotas da lei, concorre por PPI e por Q; não concorre por renda | AC, `LI_EP`, `LI_PPI`, `LI_Q` |
| Preto/pardo, opta pelas cotas da lei, concorre por PPI e por Q; concorre por renda | AC, `LI_EP`, `LB_EP`, `LI_PPI`, `LB_PPI`, `LI_Q`, `LB_Q` |
| Várias dimensões: concorre por deficiência e por PPI; opta pelas cotas da lei; concorre por renda | AC, `LI_EP`, `LB_EP`, `LI_PCD`, `LB_PCD`, `LI_PPI`, `LB_PPI` |

Pontos de atenção que o formulário resolve automaticamente:

- Autodeclarar não é concorrer. Quem se declara com deficiência mas responde que não deseja concorrer como tal não entra em `AC_PCD` nem em `LI_PCD`/`LB_PCD`.
- Renda amplia, não substitui. Quem concorre por renda (grupo LB) concorre também à versão sem renda (grupo LI). Quem não opta por concorrer por renda mantém apenas as modalidades independentes de renda.
- Cota da lei e ação afirmativa não se somam. A pessoa com deficiência que não opta pelas cotas da lei — por não ser egresso de escola pública ou por recusá-las — concorre a `AC_PCD` (a modalidade rotulada V no edital); a que opta concorre a `LI_PCD` (e `LB_PCD`, se concorre por renda) e nunca a `AC_PCD` ([UNI-REQ-0142](../requisitos/index.mdx)).
- Indígena nunca gera cota quilombola (exclusão prevista em lei).
- Restrição pela oferta. As modalidades a que o candidato pode concorrer são exatamente as que o processo oferece. Com cursos escolhidos, o conjunto assim obtido é ainda restringido, opção por opção, às modalidades que o curso daquela opção oferece (seção 6.1, `UNI-REQ-0164`); essa restrição por curso é outra, feita sobre a elegibilidade do candidato, e não substitui a garantia na origem descrita a seguir. A restrição à oferta do processo é garantida na origem: uma regra de derivação que contribua uma modalidade fora da oferta é recusada na configuração e barrada na publicação (fail-closed), não filtrada em silêncio — de modo que o candidato nunca concorre a uma modalidade não ofertada.

### 7.6 Remanejamento de vagas não preenchidas

Duas regras distintas atuam aqui:

- Precedência de opções de curso (`UNI-REQ-0045`). Vagas da 1ª opção de curso são processadas antes de qualquer realocação para a 2ª opção.
- Cascata de remanejamento entre modalidades (`REQ-56`). Vagas de uma cota não preenchida migram para outra modalidade conforme uma configuração congelada no snapshot de publicação do processo seletivo. Por modalidade de origem, a configuração define uma **sequência ordenada de destinos** e, além dela, a **cota de fallback** — o destino terminal, usado quando a sequência se esgota. A ordem é semântica: reordená-la muda a modalidade para a qual a vaga migra primeiro e, portanto, quem é convocado.

A configuração da cascata já fica congelada na publicação; o processamento do remanejamento permanece em etapa futura.

---

## 8. Coleta de dados a partir do formulário

Esta seção explica como o sistema entende e organiza as respostas do candidato — o mecanismo que sustenta tanto o cálculo de cotas quanto a exigência de documentos.

### 8.1 Dados informados e dados calculados

O sistema distingue três tipos de informação sobre o candidato:

- Dados informados pelo candidato — as respostas do formulário: autodeclarações (deficiência, cor/raça, quilombola, renda), onde e como cursou o ensino médio, e opções de concorrer. Essas respostas são escolhidas numa lista pré-definida; dados como nome, datas e endereço são digitados, com formato validado; nome, textos e endereço nunca entram em regra — do endereço, entram só a UF e o município, por derivação; data entra só por meio de derivado relativo à data de referência, como a faixa etária. Egresso de escola pública não é perguntado: é calculado a partir de onde e como o candidato cursou o ensino médio. Cada valor da lista traz uma descrição do seu significado, para orientar a escolha.
- Dados calculados pelo sistema (derivados) — informações que o sistema deduz automaticamente dos dados informados, por regra configurada ou por mecanismo do próprio sistema (`UNI-REQ-0075`). O exemplo central de regra configurada é a modalidade de concorrência: o candidato responde às perguntas de cota e o sistema calcula o conjunto de modalidades (seção 7.5). São calculados pelo próprio sistema, sem configuração do administrador, a faixa etária (da data de nascimento, usada para decidir exigências de documento), a UF e o município (do endereço) e o egresso de escola pública (da origem escolar, `UNI-REQ-0148`).
- Dados de integração — informações vindas de outra fonte ou sistema (por exemplo, atributos do candidato importados), com origem própria e resolvidas como os demais fatos. A natureza é suportada no modelo desde já; o que ainda não existe é uma fonte concreta de integração conectada. Não são respostas do formulário nem resultado de derivação; um dado como a nacionalidade só é usado como fato quando tem uma origem definida (informado ou de integração). Ver as três naturezas de fato na página [Coleta de fatos e derivação de modalidade](./coleta-fatos-derivacao.md).

> Por que essa distinção importa. Modelar a modalidade como dado calculado — e não como uma escolha direta do candidato — evita erros e fraudes, garante que a Lei de Cotas seja aplicada de forma uniforme e permite mudar as regras de composição por configuração, sem desenvolvimento. A regra de cálculo é parte da configuração e é congelada na publicação (`UNI-REQ-0019`).

### 8.2 Campos condicionais (o que aparece depende do que foi respondido)

Cada campo do formulário pode ter pré-condições: ele só é apresentado ao candidato quando as respostas anteriores as satisfazem. Isso é o que faz o formulário abrir a pergunta de concorrer só para quem é elegível à cota, ou ocultar o bloco quilombola para quem se declara indígena. As pré-condições são configuradas (não programadas) e ficam congeladas na publicação.

### 8.3 Não se aplica é diferente de pendente

Uma sutileza importante de negócio: nem toda pergunta em branco significa a mesma coisa. O sistema distingue quatro situações, e a diferença entre elas decide se algo é dispensado, fica pendente ou segue como não informado:

| Situação | Estado | Efeito de negócio |
|---|---|---|
| Pré-condição da pergunta é comprovadamente falsa (a pergunta não se aplica ao caso — por exemplo, a pergunta de renda para quem não é de escola pública) | Não se aplica | Resultado definitivo. Aquela cota, ou aquele caminho de exigência, é dispensado — o candidato não concorre por ali / não precisa daquele documento por aquele motivo. |
| A pergunta se aplica, apareceu e ainda não foi respondida — obrigatória, ou opcional com a etapa em aberto | Pendente | O item fica pendente, nunca dispensado silenciosamente. O sistema mantém a exigência sinalizada até haver resposta. |
| Ainda não se sabe se a pergunta se aplica, porque depende de outra resposta que falta | Pendente | Também fica pendente — não se conclui não se aplica enquanto houver dúvida. Só a pré-condição comprovadamente falsa dispensa. |
| A pergunta é opcional, apareceu e foi deixada em branco, com a etapa concluída | Não informado | Resolvido sem valor: não trava as regras seguintes, e nenhuma condição sobre ele é verdadeira. Só pode ser opcional o campo que não alimenta derivação nem é citado por negação; o campo que alimenta é obrigatório sempre que aparece (`UNI-REQ-0074`). |

Uma ressalva importante: um documento pode ser exigido por mais de um motivo. Quando um caminho deixa de exigir o documento, isso afeta apenas aquele caminho — o documento pode continuar exigido por outro. A exigência é dispensada quando **nenhum** caminho que poderia torná-la necessária está ativo — ou seja, cada caminho resultou em não se aplica **ou** em falso (as respostas simplesmente não satisfazem o gatilho, como um candidato que não concorre àquela cota). Basta **um** caminho indeterminado (dúvida ainda não resolvida) para manter a exigência pendente.

> Princípio da segurança (na dúvida, não dispensa). Sempre que faltar uma informação necessária para decidir se algo se aplica, o sistema mantém o item pendente — nunca o descarta em silêncio. Uma exigência só é dispensada quando há certeza de que ela realmente não se aplica. Isso evita que um documento deixe de ser cobrado por falta de dado.

### 8.4 Ordem de coleta

O sistema garante uma ordem lógica: um documento nunca é solicitado antes de existir a informação que o dispara. Se, na inscrição, um documento só é exigido de quem concorre à cota de renda, ele não aparece antes de o candidato responder à pergunta de renda. Da mesma forma, uma informação usada apenas em uma fase posterior (por exemplo, na habilitação) não pode disparar exigência de documento na fase de inscrição.

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

Quando o processo seletivo precisar, é possível montar estruturas mais ricas do que um simples ou, todas por configuração:

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
| Remove vantagem | O candidato perde uma vantagem específica (por exemplo, o Fator de Atenuação das Desigualdades de Acesso), mas não é eliminado. |
| Pendência para reenvio | Abre-se prazo para o candidato complementar/reenviar o documento numa fase que permita complementação. |

> A qual nó a consequência se prende. A consequência é configurada **por nó** da árvore de exigências, não por documento solto: cada folha (documento único) e cada grupo de alternativas (`OU` / `pelo menos N de`) — a unidade opaca — pode carregar a sua consequência e a sua **própria base legal**; um grupo `E` (todos exigidos) não carrega consequência própria, cada filho carrega a sua. Num grupo de alternativas, portanto, deixar de apresentar uma alternativa **não** aciona a penalidade se outra satisfaz o grupo — a consequência é do grupo, avaliada pelo resultado dele, nunca somada a partir dos filhos.

A consequência precisa ser coerente com a natureza da vaga e com o que o processo oferece — por exemplo, remover o Fator de Atenuação só é válido se o processo de fato oferecer o Fator de Atenuação. O sistema verifica essa coerência na publicação.

### 9.4 Base legal

Cada exigência pode ter uma ou várias bases legais (federal, estadual, municipal, norma interna ou o próprio edital), cada uma com situação pendente ou resolvida. A publicação exige pelo menos uma base legal resolvida para todo documento que pode determinar o resultado (obrigatório ou com consequência). Assim, nenhuma exigência que afeta o candidato entra em vigor sem embasamento registrado e rastreável.

### 9.5 Formato, tamanho e validade

- Formatos e tamanho — cada exigência define quais formatos de arquivo aceita e o tamanho máximo (geral ou por formato). Alternativamente, pode aceitar qualquer formato com um limite padrão; na inscrição, "qualquer formato" significa PDF, JPEG e PNG, os únicos configuráveis (seção 6.3).
- Idade de emissão — a exigência pode ter uma regra de documento emitido há no máximo X meses. Essa regra funciona como aviso, não impede a apresentação. Casos como o laudo de deficiência permanente (que não expira) são tratados por configuração — pela combinação do tipo de deficiência declarado —, sem regra especial embutida no sistema.

> Exemplo completo — quitação militar. Um processo seletivo pode exigir o comprovante de quitação militar apenas de homens brasileiros (nato ou naturalizado), não indígenas, de 18 a 45 anos. O administrador monta essa condição combinando os dados sexo, nacionalidade, cor/raça e faixa etária. Um candidato estrangeiro, ou indígena, ou fora da faixa etária, simplesmente não terá esse documento exigido. Nada disso está fixo no sistema — é tudo configuração do processo seletivo. Observação: este exemplo usa o dado cor/raça, que hoje só é coletado de egressos de escola pública. Para que uma exigência baseada em cor/raça alcance todos os candidatos, é preciso decidir se esse dado deve ser coletado de todos — ponto em aberto listado no aviso do início do documento.

---

## 10. Recursos e matrícula por decisão judicial

Estas regras pertencem majoritariamente a etapas futuras, mas sua informação de base é configurada e congelada desde já na publicação, porque o processo seletivo precisa declarar como cada instância de recurso se comporta.

> **Recurso e efeito suspensivo** (`UNI-REQ-0080` e `UNI-REQ-0081`). O Uni+ conduz apenas a 1ª instância de recurso (abre o prazo, recebe a interposição, registra o julgamento). A instância superior é julgada fora do sistema — pela via administrativa ou judicial, conforme a janela —, mas sua existência, pendência e desfecho são registrados, com o documento do órgão julgador. O efeito suspensivo (travar atos irreversíveis enquanto há recurso pendente) é configurável por instância e por janela de recurso, que pode ser de uma fase ou de uma etapa: quando não configurado, não bloqueia. Cada janela declara ainda se admite recurso em instância superior. O que bloqueia é declarado por janela, e não por módulo: na janela do resultado da classificação, ambas as instâncias bloqueiam; na janela cuja instância superior é judicial, de prazo indeterminado, a 1ª bloqueia e a 2ª não bloqueia. Essa diferença vem só da declaração de cada janela — nunca de tratamento diferente embutido no sistema por módulo.

Detalhes de negócio úteis à análise:

- Recurso por fase ou por etapa (`UNI-REQ-0080`). Toda fase ou etapa que publica um resultado preliminar pode abrir a sua janela de recurso, com prazo e suspensividade próprios. A fase tem no máximo uma janela. A etapa pode ter mais de uma, porque pode publicar mais de um resultado preliminar: a prova, por exemplo, divulga um gabarito preliminar e, depois, o resultado preliminar da prova, e cada um tem o seu prazo. Em qualquer caso há no máximo uma janela por fato recorrível — por resultado preliminar publicado e pela ciência individual —, porque duas janelas para o mesmo fato deixariam o prazo ambíguo. Exemplo: um edital cuja habilitação tem três etapas para públicos diferentes, cada uma com resultado preliminar e recurso de dois dias úteis; numa delas, a banca recursal encerra o recurso, sem instância superior. Cada etapa publica o seu resultado preliminar e abre a sua janela de dois dias úteis. Montá-las como uma única janela da fase, com um prazo para as três, não é o que o edital diz.
- Prazo contado da ciência individual (`UNI-REQ-0115`). Na etapa que emite parecer individual, o prazo pode correr do momento em que cada candidato toma ciência do parecer, sem que haja publicação: o documento declarado incapaz de comprovar o direito alegado, por exemplo, é comunicado só a quem o enviou. A ciência é de cada candidato, e a janela por ciência só existe em etapa que promete parecer individual.
- Etapa com nota do ENEM. A etapa cuja nota vem do ENEM não declara produto nem janela de recurso contra ato publicado; só admite a janela por ciência individual. O recurso coletivo sobre a lista geral é o da fase, que publica o resultado.
- Instância superior declarada por janela (`UNI-REQ-0080` e `UNI-REQ-0081`). Decisão do líder técnico de 18/10/2026: cada janela, da fase ou da etapa, declara se admite recurso em instância superior. Se admite, a instância superior é julgada fora do sistema e registrada nele, como já descrito, e o tempo de bloqueio dela é opcional. Se não admite, a decisão da primeira instância é final, não há tempo de bloqueio de instância superior e o registro de recurso em instância superior é recusado. Exemplos, como janelas: a da etapa cuja banca recursal encerra o recurso não admite (a decisão da banca é final); a do resultado da classificação admite, e a instância superior bloqueia; a janela cuja instância superior é judicial admite e não bloqueia.
- Há dois prazos distintos: o prazo para o candidato recorrer (contado da âncora da janela: a publicação do ato ou, na janela ancorada na ciência individual, o instante em que cada candidato toma ciência do parecer — `UNI-REQ-0115`; só existe para a 1ª instância, a única que o Uni+ recebe — a instância superior não tem interposição própria dentro do sistema) e o tempo de bloqueio por instância, que começa quando um recurso é efetivamente interposto (UNI-REQ-0081) — nunca antes disso, mesmo que a instância seguinte já pudesse, em tese, ser aberta. Cada um desses prazos é um par valor-unidade com convenção de contagem explícita, e as duas convenções são diferentes porque os dois relógios protegem coisas diferentes. **O prazo de interposição corre exclusivamente em dia útil** — é a janela do candidato, e tempo que passa quando ele não tem como agir não pode consumi-la: aceita dias úteis (valor inteiro) ou horas, contando, nas duas unidades, só os instantes situados em dia útil, e recusa dia corrido, porque declará-lo seria aceitar que a janela encolha ao calhar de cair em feriado. Dia útil é o dia civil inteiro no fuso institucional congelado na versão publicada (`UNI-REQ-0111`), e feriado é o dia completo — não é horário comercial. Duas resoluções ficam a cargo do **algoritmo de contagem** que o processo declara, escolhido entre os nomeados no catálogo: o que acontece quando o ato é publicado em dia não útil, e o que "um dia útil" significa quando a âncora não cai à meia-noite. É justamente isso que distingue um algoritmo de outro, e é por isso que o processo seletivo declara qual usa em vez de o sistema eleger uma leitura para todos. **O tempo de bloqueio**, que trava a administração e não o candidato, mantém as três convenções, com dias úteis aceito sob as mesmas condições de sempre. As contagens que distinguem dia útil de dia não útil — todo prazo de interposição, em dias úteis ou em horas, e a suspensividade em dias úteis — exigem calendário de dias úteis vigente cadastrado E um algoritmo de contagem declarado pelo processo, escolhido entre os nomeados no catálogo — é ele que define como um instante-âncora em dia não útil se resolve —, com os dois congelados junto: do calendário, a lista de dias não úteis copiada por valor, com identificador e versão do dataset guardados ao lado só como rastreio; do algoritmo, o código, a versão e o hash. Ambos podem mudar depois da publicação — e o dataset de calendário que deixa de ser vigente pode até ser removido do cadastro —, de modo que, sem prender o conteúdo ao momento do congelamento, um recurso já em curso fecharia num instante diferente do prometido, ou não teria como ser recontado. As três convenções de contagem disponíveis estão declaradas em `UNI-REQ-0112`, então toda contagem que distinga dia útil de não útil é hoje recusada na publicação — nunca aproximada em silêncio. A suspensividade em horas ou dias corridos, que conta todos os dias sem distinguir, está satisfeita e é independente desses dois dados para o próprio cálculo; ela não torna a publicação possível, pois a mesma regra de recurso sempre contém o prazo de interposição que ainda depende do calendário e do algoritmo. O bloqueio encerra no julgamento ou no fim do prazo, o que vier primeiro — um recurso nunca julgado não pode travar o certame indefinidamente.
- O alcance do bloqueio depende do objeto do recurso: um recurso de efeito coletivo trava o processo inteiro; um recurso individual trava apenas a parte afetada (curso, modalidade ou a vaga em disputa). Essa derivação não é configurável por fase nem congelada — é regra estrutural, a mesma antes e depois de qualquer retificação.
- Uma retificação publicada no meio do caminho não retroage sobre recurso já em curso: o prazo de interposição e o par de suspensividade que governam o recurso, com suas convenções de contagem, são os vigentes quando o direito de recorrer nasceu — a publicação do ato recorrido ou, na janela ancorada na ciência individual, a ciência do candidato (`UNI-REQ-0115`) —, nunca os vigentes na interposição ou no julgamento. Um recurso contra um ato publicado, ou uma ciência tomada, já sob a regra retificada é regido pela regra nova; não é congelamento perpétuo do processo, é imunidade retroativa por ato (`UNI-REQ-0093`). Sempre que a versão que rege a janela (a que publicou o ato ou, na janela por ciência, a vigente na ciência do candidato) não tem configuração de recurso para ela, da fase ou da etapa — porque nunca houve janela, ou porque uma retificação anterior deixou de configurá-la —, uma interposição nessa janela é recusada com erro nomeado, nunca aceita silenciosamente sem bloqueio (`UNI-REQ-0094`). Irreversibilidade do ato não entra nessa garantia: é classificação do cadastro do tipo de ato (por exemplo, convocação sempre consome vaga escassa), não configuração do processo seletivo que uma retificação possa mudar.
- O que já precisa ser configurado e congelado na entrega atual. Embora o processamento do recurso seja etapa futura, a informação que o alimenta é configurada e congelada desde a publicação: para cada janela de recurso, de fase ou de etapa, a publicação do processo seletivo congela o prazo de interposição da 1ª instância (a única que o Uni+ recebe) e, por instância, o tempo de bloqueio (um par valor mais unidade, ou sem bloqueio quando não se aplica) — ambos com convenção de contagem explícita — o prazo de interposição em dias úteis ou horas de dia útil, nunca em dias corridos; o tempo de bloqueio nas três convenções — a localidade cujo calendário rege a contagem e o fuso em que o dia civil começa e termina (`UNI-REQ-0111`), a primeira informada no cadastro e obrigatória em todo processo, o segundo aplicado pelo sistema e congelado na publicação. As contagens que distinguem dia útil de não útil — todo prazo de interposição e a suspensividade em dias úteis — dependem de calendário vigente cadastrado e de algoritmo de contagem declarado (faltando qualquer um dos dois, a publicação é recusada). Sem esses campos congelados, o mecanismo futuro não teria como saber o que travar nem reconstruir a garantia de não retroatividade para processo publicado antes de o mecanismo existir — por isso uma janela de recurso publicada sem eles é recusada, assim como o é qualquer processo publicado sem localidade; uma fase ou etapa sem janela de recurso simplesmente não os tem; a instância superior não exige prazo de interposição próprio, por não ter essa etapa dentro do sistema. O fundamento do prazo de interposição está aprovado: é a publicação do processo seletivo que o fixa (`UNI-REQ-0095`). O que ainda bloqueia é mais estreito — publicar processo real **que dependa de efeito suspensivo configurado** aguarda a confirmação jurídica daquela garantia (`UNI-REQ-0117`), independentemente de os campos acima estarem completos. Configuração na entrega atual.

> Matrícula compulsória por decisão judicial final (`UNI-REQ-0082`). Quando, no Ingresso, a instância judicial não bloqueia e a vaga é ocupada, mas depois uma decisão judicial final reconhece o direito do candidato — tipicamente com o curso já em andamento —, a universidade o matricula em vaga supranumerária (adicional ao quadro), após cumpridas as fases de habilitação e verificação documental. O quadro de vagas não é alterado, ninguém é desclassificado e a classificação permanece íntegra. É ato excepcional, auditável, com a própria decisão judicial como base legal.

## 11. Proteção de dados e nome social

Por ser sistema de autarquia federal que trata dados pessoais sensíveis de candidatos, o Uni+ observa a LGPD desde a base:

- Minimização na divulgação. Por padrão, as divulgações públicas expõem o mínimo (o número de inscrição). Ampliar para o nome abreviado (iniciais + último sobrenome) dispensa justificativa, por ser a prática recomendada; ampliar para o nome completo exige justificativa, que fica registrada na versão congelada do processo seletivo.
- Registros de acesso e ocultação de dados sensíveis. O acesso a dados sensíveis é auditável, e dados pessoais (CPF, nome, documentos) são ocultados nos registros operacionais do sistema.
- Nome social (`UNI-REQ-0032`). Sempre que o nome é exibido, o nome social tem prioridade sobre o civil, em telas, listas e documentos.
- Nome social da conta (`UNI-REQ-0153`). O nome social é dado da conta: o titular o mantém em Meu perfil, e a inscrição usa o da conta quando o candidato escolhe usar nome social. O comprovante registra a escolha, e a inscrição segue com o nome social do envio até ser refeita. O nome social não é cifrado.
- Retenção de documentos. O prazo de guarda e expurgo dos documentos segue a Tabela de Temporalidade das instituições federais de ensino e a orientação do encarregado de dados e do jurídico. A confirmar antes da produção.

---

## 12. Catálogo de regras de negócio

Consolidação das regras institucionais. O enunciado público e o mapeamento para os requisitos de cada uma vivem na página de [regras de negócio](../regras-negocio/conceitos.mdx). As regras marcadas como etapa futura têm sua configuração de base já prevista na entrega atual; apenas o processamento é posterior.

| Requisito | Regra | Enunciado | Situação |
|---|---|---|---|
| `UNI-REQ-0031` | Inscrição única por CPF | Um CPF só pode ter uma inscrição ativa (rascunho ou enviada) por processo e nível de ensino, e a cancelada não conta; níveis distintos do mesmo processo são permitidos. | Entrega atual |
| `UNI-REQ-0032` | Prioridade do nome social | Nome social tem prioridade absoluta em listas públicas e documentos de identificação. | Entrega atual |
| `UNI-REQ-0028` | Documentos obrigatórios | Inscrição bloqueada sem os documentos obrigatórios aplicáveis ao caso do candidato. | Entrega atual |
| `UNI-REQ-0024`, `UNI-REQ-0045` | Precedência de opções de curso | Vagas de 1ª opção de curso são processadas primeiro; as remanescentes são realocadas para a 2ª opção. A cascata de remanejamento entre modalidades é regra própria (`REQ-56`), não parte da precedência das opções de curso. | Etapa futura |
| `UNI-REQ-0015`, `UNI-REQ-0046` | Fator de Atenuação das Desigualdades de Acesso | Fator de Atenuação das Desigualdades de Acesso, que cada processo declara se aplica ou não (a declaração é obrigatória para publicar), com percentual configurável por processo seletivo, aplicado sobre a nota final; sem comprovação de elegibilidade, o candidato é reclassificado sem o fator (não eliminado). | Etapa futura |
| `UNI-REQ-0033` | Cancelar e refazer | O candidato pode cancelar a inscrição enviada antes do encerramento, com registro de quem cancelou, da data e do motivo (opcional para o candidato). | Entrega atual |
| `UNI-REQ-0047` | Lista de espera | Inserção na lista de espera conforme a opção indicada no ato da inscrição. | Etapa futura |
| `UNI-REQ-0019` | Congelamento por processo seletivo na publicação | Todos os parâmetros ficam congelados na publicação do processo seletivo; alterações retroativas são proibidas e atualizações globais valem só para processos futuros. | Entrega atual |
| `UNI-REQ-0080` | Recurso e efeito suspensivo | 1ª instância no sistema; instância superior julgada fora, mas registrada. Efeito suspensivo configurável por instância e por janela de recurso (de fase ou de etapa); cada janela declara se admite instância superior; ausência não bloqueia. | Base configurada |
| `UNI-REQ-0082` | Matrícula compulsória | Decisão judicial final que reconhece direito a vaga ocupada gera matrícula em vaga supranumerária, sem alterar o quadro nem a classificação. | Etapa futura |

### 12.1 Requisitos e regras derivadas (rastreabilidade)

Para rastreabilidade, cada regra acima e cada comportamento descrito neste documento têm um requisito correspondente com código estável (`UNI-REQ-NNNN`, aqui abreviado `REQ-NN`), verificável na [tabela de requisitos](../requisitos/index.mdx). Os principais:

| Requisito | Título | Descrição em negócio |
|---|---|---|
| `REQ-14` | Configuração do processo | Configurar um processo em rascunho: etapas, vagas, modalidades, critérios, Fator de Atenuação, atendimento, documentos e formulário. |
| `REQ-15` | Etapas, critérios e Fator de Atenuação | Configurar etapas pontuadas, pesos, critérios de desempate e Fator de Atenuação das Desigualdades de Acesso. |
| `REQ-16` | Documentos por condição e fase | Configurar documentos exigidos por condição sobre dados do candidato e por fase do processo. |
| `REQ-17` | Formulário configurável | Formulário configurável por finalidade (inscrição, isenção, habilitação), a partir de modelos por tipo de processo, com campos condicionais. |
| `REQ-19` | Publicação com cópia congelada | Publicar o processo seletivo, criando a cópia oficial imutável da configuração e emitindo o edital. |
| `REQ-21 / 22` | Retificação e bloqueio de edição | Alterar processo seletivo publicado só por retificação (novo ato que aponta o retificado, nova versão congelada); edição direta bloqueada. |
| `REQ-23` a 33 | Ciclo da inscrição previsto | Rascunho, submissão, opções de curso, concorrência dupla, atendimento, documentos, comprovante, unicidade, nome social, cancelamento. |
| `REQ-56` | Cascata de remanejamento | Congelada no snapshot de publicação: por modalidade de origem, sequência ordenada de destinos mais a cota de fallback. A ordem de migração é semântica e distinta da precedência das opções de curso. |
| `REQ-57` a 71 | Documentos exigidos (detalhe) | Aplicabilidade geral/condicional, condições, base legal, formatos e idade, documentos alternativos, consequências, repetição por entidade e congelamento do conjunto. |
| `REQ-72` a 78 | Coleta e cálculo de cotas | Autodeclaração mais opção de concorrer, campos condicionais, não se aplica versus pendente, cálculo de modalidade pela Lei de Cotas e ordem de coleta. |
| `REQ-80`, `81`, `93` a `95` e `82` | Recurso e matrícula | Campos de suspensividade congelados, mecanismo do efeito suspensivo, anti-retroatividade por versão do ato, recusa nominal sem configuração de recurso, dependência de base legal e matrícula compulsória. |

---

## 13. Escopo: entrega atual e etapas futuras

| Capacidade | Situação | Observação |
|---|---|---|
| Cadastros de base (cursos, unidades, modalidades, tipos de documento, cidades/campus) | Entrega atual | Fundação para configurar o processo. |
| Configuração do processo (etapas, vagas, cotas, Fator de Atenuação, atendimento) | Entrega atual | Tudo editável enquanto rascunho. |
| Documentos exigidos por condição e fase | Entrega atual | Inclui base legal, consequências e documentos alternativos. |
| Coleta de dados e cálculo de modalidades | Entrega atual | Formulário condicional e composição da Lei de Cotas por configuração. |
| Publicação do processo seletivo e congelamento | Entrega atual | Cópia oficial imutável; emissão do edital; retificação como novo ato que aponta o retificado, com nova versão congelada. |
| Inscrição do candidato (rascunho a comprovante) | Etapa futura | Requisitos aprovados; ainda não há agregado de inscrição implementado. |
| Homologação documental (deferir/indeferir) | Etapa futura | Consome a configuração congelada. |
| Ensalamento e locais exatos de prova | Etapa futura | — |
| Lançamento de notas por etapa | Entrega atual, em desenvolvimento | Começa pelas notas do ENEM, pelo arquivo do INEP (UNI-REQ-0174); as demais origens entram pela mesma avaliação (UNI-REQ-0043). |
| Processamento de classificação, remanejamento, desempate, Fator de Atenuação e resultado | Etapa futura | A configuração da cascata já está congelada no snapshot de publicação; esta etapa executará o remanejamento conforme a sequência de destinos e a cota de fallback. |
| Recursos administrativos | Etapa futura | Base de suspensividade já configurada (`UNI-REQ-0080`). |
| Habilitação e chamadas de vagas (Ingresso/CRCA) | Etapa futura | Fronteira com o módulo Ingresso. |

### 13.1 Acompanhamento administrativo dos processos

O PO aprovou o percurso painel de processos → página do processo, com somente
a aba Acompanhamento na primeira entrega, sem abas futuras em construção. O
público autorizado é formado pelos servidores do CEPS (UNI-REQ-0176/0177).
O primeiro incremento prepara navegação e estrutura; os indicadores são
entregues em seguida. Validação inicial com dados fictícios e usuários de
teste não altera o público aprovado para liberação com dados reais.

As situações em inscrição, em homologação, em avaliação e em período de recurso
podem ocorrer simultaneamente, com consulta por qualquer filtro aplicável.
Antes da primeira fase, mostrar Aguardando início; nos intervalos, Entre etapas.
Cancelados continuam consultáveis e identificados (UNI-REQ-0178).

A situação temporal do painel é distinta do encerramento formal. O PO indicou
inicialmente o término da última fase do cronograma, mas o LT informou depois
que a conclusão depende do CRCA e orientou obter a definição com a Rebeca, no
setor. O critério de Encerrado permanece pendente dessa validação. Os formatos
automático e administrativo, com justificativa obrigatória no administrativo,
são proposta do LT a validar com o CRCA. Também dependem dessa definição o
gatilho de conclusão, os usuários autorizados e a apresentação entre o fim do
cronograma e a conclusão pelo CRCA, sem presumir situação intermediária. A
consulta não efetiva encerramento.

Os indicadores distinguem registros de inscrição de pessoas: reenvios não criam
nova inscrição, opções e modalidades não multiplicam o total de submetidas, e
o total de inscritos é por pessoas distintas. As definições dos universos dos
totais e outros detalhes permanecem explícitos como pendentes (UNI-REQ-0179).

As regras confirmadas, necessidades de relatórios e notas ainda a refinar,
dependências de implementação e roteiro de validação estão em
[Acompanhamento administrativo](../acompanhamento-administrativo.mdx).
A aprovação dessas necessidades não comprova disponibilidade no ambiente.

## 14. Conformidade legal

O detalhamento por norma vive na página de [conformidade legal](../conformidade-legal/index.mdx); o quadro abaixo resume como o módulo Seleção atende cada uma.

| Norma | O que exige e como o sistema atende |
|---|---|
| LGPD (Lei 13.709/2018) | Proteção e minimização de dados pessoais e sensíveis; auditoria de acesso; ocultação de dados nos registros; divulgação minimizada por padrão. |
| Lei de Cotas (12.711/2012, atualizada pela 14.723/2023) | Reserva de vagas por modalidade, concorrência dupla e remanejamento por configuração congelável; o motor genérico avalia a matriz normativa R0–R9 da Lei de Cotas, sem ramificação por tipo de processo. |
| LBI (Lei 13.146/2015) | Inclusão da pessoa com deficiência e atendimento especializado configurável e solicitável na inscrição. |
| Decretos nº 9.508/2018 e nº 3.298/1999 | Referência, tomada dos concursos públicos, para a comprovação da condição: o edital exige, na inscrição, o laudo médico de cada condição declarada por quem solicita atendimento especializado. |
| Lei nº 13.872/2019 | Referência, tomada dos concursos públicos, para o direito da lactante de amamentar durante a prova: o edital exige a certidão de nascimento da criança na inscrição, para o CEPS preparar a sala. |
| Lei 14.129/2021 (Governo Digital) | Serviço digital, transparência e reprodução fiel do resultado, garantida pelo congelamento na publicação. |
| Gov.br / Acessibilidade (Portaria SEI-MCOM 540/2020; IN SGD/ME 94/2022) | Uso do Design System do Gov.br e acessibilidade WCAG 2.1 AA / e-MAG (obrigação de autarquia federal). |
| Resoluções Unifesspa (414/2020, 326/2019, 184/2017, 183/2017) | Normas internas que embasam exigências e procedimentos, registradas como base legal das exigências documentais. |

---

Este documento descreve o comportamento de negócio esperado do módulo Seleção e serve de base para o refinamento de requisitos, a redação de critérios de aceite e a homologação. As regras aqui apresentadas derivam da especificação funcional do projeto e da legislação aplicável. Divergências entre este texto e a legislação vigente devem ser resolvidas em favor da lei, com registro de ajuste.
