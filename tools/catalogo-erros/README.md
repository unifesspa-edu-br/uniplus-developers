# catalogo-erros

Validador do contrato de identificador das páginas do catálogo público de
erros (`docs/erros/**/*.{md,mdx}`). Script Node que interpreta cada
formato com o parser correspondente, nunca por regex linha a linha:
frontmatter com `gray-matter` (YAML real, via `js-yaml`), registro
canônico de requisitos com o compilador `typescript` (AST real), e a
prosa da checagem de alias com `mdast-util-from-markdown` — parse **MDX**,
não só Markdown puro (as páginas do catálogo abrem com `import ...` e
`<ErrorCatalogEntry {...frontMatter} />`, e essas linhas viram nós
próprios `mdxjsEsm`/`mdxJsxFlowElement`, fora da checagem, em vez de
texto comum). O texto verificado é o que o Markdown/MDX realmente
renderiza, não a fonte bruta. Cada um
resolve por construção uma classe inteira de caso — indentação,
comentário (de bloco, de linha, ou à direita de código), linha em branco,
escalar citado, texto de outra propriedade que só *parece* uma
declaração, marcação Markdown ao redor ou dentro do token, link que
recompõe o alias por partes, pontuação literal que não é marcação —
casos que reimplementar à mão só reabrem um por um.

## Uso

```bash
node tools/catalogo-erros/validar.mjs                  # valida docs/erros
node tools/catalogo-erros/validar.mjs <arquivo|dir>...  # alvos explícitos
```

Saída:

- `ok   docs/erros/<code>.mdx` — página conforme.
- `FAIL docs/erros/<code>.mdx` — página com erros (listados abaixo).

Exit code != 0 quando houver pelo menos um erro.

## Regras enforçadas

1. `requisitos` é sempre lista YAML — `requisitos: []` quando não houver
   vínculo, nunca campo omitido nem `null`.
2. Cada item casa `^UNI-REQ-\d{4}$`.
3. Cada item existe em `src/data/produto/requisitos-mvp-selecao.ts`.
4. A prosa (fora do frontmatter) não usa o alias `RNxx`/`REQ-NN` — cita o
   `UNI-REQ-NNNN` correspondente.

O escopo é só o que é passado como alvo: o gate de CI aponta para
`docs/erros` e nunca alcança `docs/produto/` nem `src/data/`.

**Limite deliberado da regra 4.** A checagem de alias cobre formas de
Markdown que um autor de boa-fé alcançaria naturalmente ao redigir uma
página — ênfase envolvendo o token ou caindo no meio dele, link. Não
cobre marcação HTML/JSX bruta dividindo o token (`RN<span>13</span>`):
ninguém escreve isso por acidente documentando um erro do catálogo, e
tentar prever toda construção adversarial (HTML, entidade, mistura de
sintaxe) não converge — o alvo aqui é pegar engano de quem escreve, não
resistir a quem tenta especificamente escapar do gate.

Pela mesma razão, `textoInline` descarta toda expressão MDX
(`mdxFlowExpression`/`mdxTextExpression`) por igual — não distingue um
comentário `{/* RN13 */}` (nunca renderiza) de um literal estático que
renderiza de verdade, como `{'RN13'}`. Verificado: nenhuma página do
portal usa expressão MDX de texto — as únicas expressões existentes em
`docs/` são atributo/prop JSX (`{...frontMatter}`,
`{useCurrentSidebarCategory().items}`), nunca texto literal em prosa.
`{'RN13'}` não é escrita plausível numa página de documentação; é
construção de programador dentro de prosa. E a correção seria parcial
por construção — `{'RN13'}` é estaticamente decidível, mas
`{variavel}`, `{fn()}` e `` {`RN${13}`} `` não são; tratar só o literal
criaria a ilusão de que "o gate cobre expressão MDX" quando a classe
continua aberta. Este validador protege contra alias escrito por
hábito, o risco real de quem redige o catálogo — não é controle contra
autor adversarial, que qualquer variação (entidade HTML, componente
React, comentário disfarçado) contornaria de qualquer forma.

## Fixtures

`fixtures/` traz os casos de prova do próprio gate — não são páginas
publicadas (ficam fora de `docs/`, o Docusaurus nunca as constrói). A
maioria nasceu como regressão de um parser YAML escrito à mão (indentação
fixa, comentário, escalar citado); com a leitura movida para `gray-matter`
esses casos passam a valer por construção, mas as fixtures continuam
como trava contra qualquer regressão futura no parsing:

- `valida.mdx` — caso positivo, deve passar. Um dos itens de `requisitos`
  traz comentário inline (`# vínculo principal`), provando que a sintaxe
  YAML válida não é confundida com identificador malformado.
- `invalida-requisito-inexistente.mdx` — cita `UNI-REQ-9999`, prova a
  checagem de existência (regra 3).
- `invalida-alias-proibido.mdx` — cita `RN13` na prosa, prova a checagem de
  alias (regra 4).
- `invalida-alias-formatado.mdx` — cita o alias com ênfase Markdown colada
  (`_RN13_`); prova que a fronteira do alias não usa `\b` puro, que trata
  `_`/`*` como caractere de palavra e deixaria passar o alias formatado.
- `invalida-alias-dividido.mdx` — cita o alias com a marcação partindo o
  próprio token (`RN**13**`, que renderiza como "RN13"); prova que a
  checagem usa o texto renderizado, não a fonte bruta com marcação.
- `invalida-alias-em-link.mdx` — cita o alias dividido por um link
  (`RN[13](/regra)`); prova que a extração de texto trata link como o
  Markdown resolve, não só remove um conjunto fixo de caracteres.
- `valida-sublinhado-literal.mdx` — cita `RN_13` (sublinhado intra-palavra
  sem par, texto literal em CommonMark); prova que a checagem não cria
  falso positivo em pontuação que não é marcação de ênfase.
- `valida-fronteira-de-bloco.mdx` — um parágrafo termina em "RN", o
  próximo começa em "13"; prova que extrair texto por bloco não cola os
  dois — a página renderizada nunca junta os dois números lado a lado.
- `valida-quebra-de-linha-forcada.mdx` — quebra de linha forçada (dois
  espaços ao final da linha) entre "RN" e "13" dentro do mesmo
  parágrafo; prova que a checagem trata `break` como fronteira.
- `valida-mdx-nao-renderizado.mdx` — cita o alias num atributo JSX, num
  comentário `{/* */}` de nível de bloco e num `import`; prova que
  sintaxe MDX que nunca chega ao leitor não conta como prosa.
- `valida-expressao-mdx-inline.mdx` — mesma prova para `{/* */}` no
  meio de uma frase, dentro de parágrafo — nó `mdxTextExpression`, não
  `mdxFlowExpression`, e por isso alcançado de forma diferente.
- `invalida-alias-em-alt-de-imagem.mdx` — cita o alias só no `alt` de
  uma imagem (`![RN13](...)`); prova que texto alternativo — conteúdo
  acessível de verdade — entra na checagem.
- `invalida-alias-em-alt-de-imagem-por-referencia.mdx` — mesma prova,
  sintaxe de imagem por referência (`![RN13][regra]`) — nó mdast
  diferente (`imageReference`), mesmo `alt`.
- `invalida-requisito-apos-linha-em-branco.mdx` — lista `requisitos` com uma
  linha em branco no meio, seguida de `UNI-REQ-9999`; prova que uma
  sequência YAML com linha em branco não é lida como lista encerrada.
- `invalida-requisito-apos-comentario.mdx` — lista `requisitos` com um
  comentário YAML no meio, seguido de `UNI-REQ-9999`; mesma prova, para
  comentário em vez de linha em branco.
- `invalida-item-nulo.mdx` — lista `requisitos` com um item nulo (`-` sem
  conteúdo) entre um item válido e `UNI-REQ-9999`; prova que o item nulo é
  reportado, sem esconder o que vem depois dele.
- `indice-aninhado/secao/index.mdx` — `index.mdx` fora da raiz do alvo
  varrido; prova que a exceção do índice do catálogo não alcança
  profundidade além da raiz.
- `invalida-requisito-citado-com-hash.mdx` — item citado com aspas
  (`'UNI-REQ-0001 # extra'`); prova que um `#` dentro de escalar citado é
  conteúdo, não comentário, e não é descartado antes da checagem de
  sintaxe.
- `valida-indentacao-alternativa.mdx` — lista `requisitos` indentada com 4
  espaços em vez de 2; prova que a largura da indentação (YAML válido,
  fora do contrato) não derruba a página.
- `pagina-md/invalida.md` — página `.md`, não `.mdx`, com `UNI-REQ-9999`;
  prova que a varredura recursiva cobre as duas extensões, já que o
  Docusaurus 3 processa ambas pelo mesmo pipeline MDX neste portal.

A extração de requisitos existentes do registro canônico
(`src/data/produto/requisitos-mvp-selecao.ts`) percorre a AST do
`typescript`, partindo do inicializador da constante exportada
`requisitosMvpSelecao` — não do arquivo inteiro — e olhando só a
propriedade `requisito_id` direta de cada elemento do array; não desce
em objeto aninhado dentro de uma entrada. Não busca o padrão como
texto. Verificado manualmente com um trecho sintético cobrindo JSDoc,
comentário de bloco entre propriedades, comentário `//` de fim de
linha, um `criterios_aceite` cuja prosa cita `requisito_id:
'UNI-REQ-9998'` como exemplo, um objeto solto fora do array citando
`UNI-REQ-9999`, e um campo aninhado dentro de uma entrada real citando
`UNI-REQ-9997`: nenhum dos seis entra no conjunto, só as declarações
diretas dentro do registro exportado. Sem fixture dedicada no CI: o
registro é lido de caminho fixo, e criar uma segunda cópia só para este
teste seria mais
aparato do que o achado pede.

O job `catalogo-erros` de `.github/workflows/ci.yml` roda cada fixture
inválida em step próprio, independente das demais — uma regressão numa
regra não pode ser mascarada pela outra fixture ainda pegando algo. Se
alguma fixture inválida passar, o step correspondente falha: é o sinal de
que aquela checagem específica quebrou.
