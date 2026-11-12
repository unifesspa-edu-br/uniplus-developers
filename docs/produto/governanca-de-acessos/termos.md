---
title: Termos dos designados e termo de responsabilidade
description: Minuta do termo de compromisso de quem é designado para a governança de acessos e modelo versionado do termo de responsabilidade aceito por quem recebe acesso a dado protegido.
fonte_canonica: "ADR-0162 do uniplus-api; texto sujeito a aprovação institucional"
estado_publicacao: "minuta para revisão; sem aprovação institucional"
---

# Termos dos designados e termo de responsabilidade

:::warning Minuta, sem aprovação institucional
Textos para revisão. A versão publicada no Uni+ só pode ser a que a Unifesspa aprovar, com o ato de aprovação preenchido. Acompanhe o estado em [Validações institucionais pendentes](./validacoes-institucionais.md).
:::

## Termo de compromisso do designado

Assinado por quem é designado gestor de acessos, Representante do controlador (titular ou substituto) ou Encarregado de dados, ao receber o perfil correspondente.

> **TERMO DE COMPROMISSO**
>
> Eu, [NOME], SIAPE [SIAPE], lotado em [UNIDADE], designado pela Portaria nº [Nº DA PORTARIA] para a função de [gestor de acessos | Representante do controlador, na condição de titular | Representante do controlador, na condição de substituto | Encarregado de dados] na governança de acessos do sistema Uni+, declaro que:
>
> 1. conheço a Portaria Normativa nº [Nº DA PORTARIA NORMATIVA] e as atribuições da função;
> 2. exercerei a função nos limites dela, sem decidir pedido, etapa ou revisão da qual eu seja beneficiário;
> 3. não acumularei as funções de Representante do controlador e de Encarregado de dados;
> 4. usarei o acesso apenas para a finalidade da função e manterei sigilo sobre os dados pessoais a que tiver acesso;
> 5. comunicarei ao gestor de acessos, por meio da minha unidade, qualquer mudança que altere ou encerre a designação.
>
> [LOCAL], [DATA].
>
> [NOME] — [FORMA DE ASSINATURA DEFINIDA PELA PROCURADORIA]

## Modelo do termo de responsabilidade

Aceito no Uni+ pelo beneficiário de pedido que concede permissão pessoal, identificadora ou sensível, antes da decisão do gestor de acessos (UNI-REQ-0377 e UNI-REQ-0378, em revisão).

### Como o termo é versionado

Conforme a [ADR-0162](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0162-separacao-das-atribuicoes-de-governanca.md):

- cada versão é imutável e é publicada pelo gestor de acessos com o texto, o resumo SHA-256 do texto normalizado, o ato que a aprova e o autor;
- o pedido fixa a versão vigente na criação; publicar versão nova não afeta pedidos já criados nem concessões existentes;
- o aceite registra instante, pedido, versão e resumo, e é feito só pelo beneficiário, autenticado pelo login institucional.

| Campo da versão | Valor nesta minuta |
|---|---|
| Versão | [VERSÃO] |
| Ato de aprovação | [ATO DE APROVAÇÃO DO TERMO], em aberto |
| Publicada por | [NOME DO GESTOR DE ACESSOS] |
| Resumo SHA-256 | calculado pelo sistema na publicação |

### Texto do termo

> **TERMO DE RESPONSABILIDADE PELO ACESSO A DADOS PESSOAIS NO UNI+**
>
> Versão [VERSÃO], aprovada por [ATO DE APROVAÇÃO DO TERMO].
>
> Ao aceitar este termo, declaro, na condição de beneficiário do acesso solicitado, que:
>
> 1. usarei o acesso exclusivamente para as atividades da minha função na Unifesspa e para a finalidade do processo em que atuo;
> 2. não copiarei, divulgarei nem compartilharei dados pessoais fora dos fluxos previstos no sistema e nas normas da Universidade;
> 3. tratarei dados pessoais sensíveis com cuidado reforçado, nos termos da Lei nº 13.709/2018;
> 4. sei que os acessos que eu fizer são registrados e podem ser auditados;
> 5. comunicarei ao gestor de acessos, sem demora, qualquer incidente ou uso indevido de que tiver conhecimento;
> 6. sei que o acesso pode ser revisto ou revogado a qualquer tempo e que, se eu mudar de função ou de lotação, devo comunicar o fato para que o acesso seja revisto ou, quando cabível, revogado;
> 7. estou ciente de que o descumprimento deste termo pode gerar responsabilização administrativa, civil e penal.
>
> O aceite eletrônico no Uni+, autenticado pelo login institucional, registra a data, a hora, a versão e o resumo deste texto.

### Natureza da assinatura do aceite

Pela ADR-0162, o aceite equivale à assinatura eletrônica simples (Lei nº 14.063/2020, art. 4º): prova qual texto foi apresentado a quem se autenticou, mas não que foi lido, e não é assinatura avançada nem qualificada. Se a Procuradoria exigir assinatura avançada, o aceite precisa de desenho próprio antes da produção; o resultado é registrado em [Validações institucionais pendentes](./validacoes-institucionais.md#validação-do-nível-de-assinatura).
