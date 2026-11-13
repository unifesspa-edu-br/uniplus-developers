---
title: Atos de governança de acessos
description: Minutas dos atos institucionais que sustentam a governança de acessos do Uni+ (portaria, designações, termos) e o registro das validações pendentes.
fonte_canonica: "ADR-0162 do uniplus-api (separação das atribuições de governança); textos sujeitos a aprovação institucional"
estado_publicacao: "minuta para revisão; sem aprovação institucional"
---

# Atos de governança de acessos

:::warning Minuta, sem aprovação institucional
Todos os textos desta seção são **minutas para revisão**. Nenhum deles foi indicado, aprovado ou assinado pela Unifesspa. Não os use como ato vigente nem os cite como fundamento até que o [registro de validações](./validacoes-institucionais.md) aponte o ato de aprovação de cada um.
:::

A [ADR-0162](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0162-separacao-das-atribuicoes-de-governanca.md) separa a governança de acessos do Uni+ em três papéis:

| Papel | Atribuição resumida |
|---|---|
| **Gestor de acessos** | Mantém os perfis, aprova a adequação funcional, revoga concessões e publica o termo de responsabilidade. |
| **Representante do controlador** | Decide, em nome da Unifesspa, a etapa de proteção de dados dos pedidos com dado pessoal, as versões protegidas de perfil, a janela de migração e a proteção do catálogo de tipos de documento e de fatos do candidato; conduz a revisão periódica. |
| **Encarregado de dados** | Consulta, se manifesta e solicita providências, sem aprovar, recusar ou revogar (LGPD, art. 41). |

O sistema impõe a separação, mas a entrada em produção depende de atos institucionais: quem designa o Representante, com que texto, e qual termo assina quem recebe acesso a dado protegido. Esta seção reúne as minutas desses atos:

- [Minuta de portaria normativa e de designação](./portaria-e-designacao.md): regras gerais da governança e designação do Representante do controlador, titular e substituto.
- [Termos dos designados e termo de responsabilidade](./termos.md): termo de compromisso de quem é designado e modelo versionado do termo aceito por quem recebe acesso.
- [Validações institucionais pendentes](./validacoes-institucionais.md): checklist da indicação, da aprovação do texto e da validação do nível de assinatura, com os campos de resultado.

## Requisitos relacionados

- [UNI-REQ-0184](../requisitos/index.mdx): todo acesso administrativo nasce de pedido aprovado, sem autoaprovação, ressalvada a instalação inicial dos dois primeiros gestores de acessos, por procedimento próprio, que concede só o perfil de gestor de acessos.
- UNI-REQ-0369 a UNI-REQ-0380, no [registro de requisitos](../requisitos/index.mdx): requisitos da separação das atribuições de governança, em especial UNI-REQ-0370, sobre a incompatibilidade entre Representante do controlador e Encarregado de dados, e UNI-REQ-0377 e UNI-REQ-0378, sobre o termo de responsabilidade e o aceite pelo beneficiário.

## Uso dos placeholders

Os campos entre colchetes, como `[NOME]`, `[SIAPE]`, `[Nº DA PORTARIA]` e `[DATA]`, são preenchidos só na versão a ser assinada. As minutas não trazem nome de pessoa e usam os papéis pela função, no masculino genérico.
