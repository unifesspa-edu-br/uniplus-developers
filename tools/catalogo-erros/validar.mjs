#!/usr/bin/env node
// tools/catalogo-erros/validar.mjs — contrato de identificador das páginas
// do catálogo público de erros (docs/erros/*.mdx).
//
// Uso:
//   node tools/catalogo-erros/validar.mjs                   # docs/erros + sidebars.ts
//   node tools/catalogo-erros/validar.mjs <arquivo|dir>...  # só o contrato de página
//   node tools/catalogo-erros/validar.mjs --sidebar=<arq> <dir>  # contrato + catálogo
//
// Checa, por página:
//   1. `requisitos` é sempre lista YAML — `requisitos: []` quando não houver
//      vínculo, nunca campo omitido nem `null`.
//   2. cada item casa `^UNI-REQ-\d{4}$`.
//   3. cada item existe em src/data/produto/requisitos-mvp-selecao.ts.
//   4. a prosa (fora do frontmatter) não usa o alias `RNxx`/`REQ-NN`.
//   5. `code` existe e casa a taxonomia do identificador de causa.
//   6. `situacao` é um dos valores que o cabeçalho sabe renderizar, e o
//      `description` anuncia rascunho exatamente quando a página é rascunho.
//   7. a prosa traz `## O que aconteceu` e `## Como resolver`, e nenhum H1 —
//      o H1 da página é o `title` do frontmatter, que existe e não é
//      suprimido por `hide_title`.
//   8. a entrada invoca uma vez `<ErrorCatalogEntry {...frontMatter} />` —
//      com o espalhamento como atributo único —, que é o cabeçalho de
//      identidade da página.
//
// E, no modo catálogo (`--sidebar=`, ou a invocação sem argumentos):
//   9. o `code` é idêntico ao nome do arquivo — é isso que faz a rota
//      `/erros/{code}` existir, e o campo `type` do corpo de erro resolver.
//  10. as páginas e os itens da categoria do catálogo na navegação são o
//      mesmo conjunto, nos dois sentidos.
//
// As checagens 9 e 10 valem para o catálogo publicado, onde o nome do arquivo
// é o endereço público; fora dele (fixtures) o nome é livre, e por isso o
// modo é explícito em vez de valer para todo alvo.
//
// Escopo: só o que é passado como alvo. O gate de CI aponta para docs/erros
// e nunca alcança docs/produto/ nem src/data/.
//
// Sai com código != 0 se houver violações.
//
// O frontmatter é interpretado com gray-matter (YAML real, via js-yaml) —
// não por regex linha a linha. Indentação, comentário, linha em branco e
// escalar citado dentro de uma sequência são casos que o formato já
// resolve; reimplementá-los à mão só reabre um por um.

import {readFileSync, readdirSync, statSync} from 'node:fs';
import {basename, dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import matter from 'gray-matter';
import ts from 'typescript';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {mdxjs} from 'micromark-extension-mdxjs';
import {mdxFromMarkdown} from 'mdast-util-mdx';

const ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const REGISTRO_REQUISITOS = join(
  ROOT,
  'src/data/produto/requisitos-mvp-selecao.ts',
);
const CATALOGO_PUBLICADO = join(ROOT, 'docs/erros');
const SIDEBAR_PADRAO = join(ROOT, 'sidebars.ts');

// Taxonomia do identificador de causa (ADR-0023 do `uniplus-api`): segmentos
// minúsculos separados por ponto, com sublinhado dentro do segmento. É o
// mesmo padrão que o E2E exigia entrada a entrada antes de a checagem vir
// para cá.
const RE_CODE = /^[a-z]+(\.[a-z_]+)+$/;

// Os dois estados que `ErrorCatalogEntry` sabe renderizar. Um terceiro valor
// não quebraria o build — cairia num cabeçalho sem etiqueta, silenciosamente.
const SITUACOES = new Set(['publicado', 'rascunho']);

// Quem varre o índice não pode confundir causa ainda não emitida com
// comportamento em vigor: a entrada em rascunho precisa se anunciar já no
// ponto de descoberta, e o card do índice mostra o `description`.
const PREFIXO_RASCUNHO = 'Rascunho —';

// Causa e remediação, em toda entrada — os dois headings fixos que o
// catálogo promete a quem chega pelo campo `type` de um corpo de erro.
const SECOES_OBRIGATORIAS = ['O que aconteceu', 'Como resolver'];

// O id do índice do catálogo na navegação. A categoria é identificada pelo
// `link` que aponta para ele — e não pelo `label` — porque é esse vínculo que
// faz `useCurrentSidebarCategory()` resolver a categoria na página de visão
// geral, que lista as entradas a partir dela. O rótulo é apresentação e pode
// ser reescrito sem que a navegação mude.
const ID_DO_INDICE = 'erros/index';
const PREFIXO_DOC = 'erros/';

// Nome da constante exportada que é o registro canônico — não confundir com
// qualquer outro objeto auxiliar que porventura exista no mesmo arquivo.
const EXPORT_DO_REGISTRO = 'requisitosMvpSelecao';

// Percorre a AST em vez de procurar `requisito_id: '...'` como texto — um
// regex não distingue uma property assignment real de uma menção ao mesmo
// padrão dentro do valor de OUTRO campo (ex.: um `criterios_aceite` cuja
// prosa cita `requisito_id: 'UNI-REQ-9999'` como exemplo do formato). E a
// varredura parte do inicializador do array exportado, não do arquivo
// inteiro — um requisito_id em objeto auxiliar fora do registro não deve
// contar como existente só por estar no mesmo arquivo-fonte.
// `typescript` já é devDependency do projeto; comentário é trivia, fora da
// árvore, então nem precisa de tratamento à parte.
function extrairRequisitosDoRegistro(texto) {
  const arquivoFonte = ts.createSourceFile(
    'requisitos-mvp-selecao.ts',
    texto,
    ts.ScriptTarget.Latest,
    true,
  );

  let arrayDoRegistro = null;
  function acharRegistro(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === EXPORT_DO_REGISTRO &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      arrayDoRegistro = node.initializer;
      return;
    }
    ts.forEachChild(node, acharRegistro);
  }
  acharRegistro(arquivoFonte);

  if (!arrayDoRegistro) {
    throw new Error(
      `constante exportada '${EXPORT_DO_REGISTRO}' não encontrada em ${REGISTRO_REQUISITOS} — registro vazio ou formato mudou`,
    );
  }

  // Só a propriedade requisito_id direta de cada elemento do array — não
  // desce em objeto aninhado dentro da entrada (ex.: um futuro campo de
  // metadado com seu próprio requisito_id não é a declaração da entrada).
  const ids = new Set();
  for (const elemento of arrayDoRegistro.elements) {
    if (!ts.isObjectLiteralExpression(elemento)) continue;
    for (const propriedade of elemento.properties) {
      if (
        ts.isPropertyAssignment(propriedade) &&
        ts.isIdentifier(propriedade.name) &&
        propriedade.name.text === 'requisito_id' &&
        ts.isStringLiteralLike(propriedade.initializer)
      ) {
        ids.add(propriedade.initializer.text);
      }
    }
  }
  return ids;
}

function carregarRequisitosExistentes() {
  const texto = readFileSync(REGISTRO_REQUISITOS, 'utf8');
  const ids = extrairRequisitosDoRegistro(texto);
  if (ids.size === 0) {
    throw new Error(
      `nenhum requisito_id encontrado em ${relative(ROOT, REGISTRO_REQUISITOS)} — registro vazio ou formato mudou`,
    );
  }
  return ids;
}

// Lê a lista de entradas da navegação pela AST, e não por regex sobre o
// texto: `sidebars.ts` cita ids `erros/...` em mais de um lugar em potencial
// (um comentário, uma outra sidebar), e o que interessa é exatamente o
// `items` da categoria do catálogo. Falhar alto quando a categoria não é
// encontrada é deliberado — um gate que devolve lista vazia porque a forma
// do arquivo mudou passaria a aprovar qualquer coisa.
function propriedadeDoObjeto(objeto, nome) {
  for (const propriedade of objeto.properties) {
    if (!ts.isPropertyAssignment(propriedade)) continue;
    const chave =
      ts.isIdentifier(propriedade.name) ||
      ts.isStringLiteralLike(propriedade.name)
        ? propriedade.name.text
        : null;
    if (chave === nome) return propriedade.initializer;
  }
  return null;
}

function ehCategoriaDoCatalogo(no) {
  if (!ts.isObjectLiteralExpression(no)) return false;
  const link = propriedadeDoObjeto(no, 'link');
  if (link === null || !ts.isObjectLiteralExpression(link)) return false;
  const id = propriedadeDoObjeto(link, 'id');
  return id !== null && ts.isStringLiteralLike(id) && id.text === ID_DO_INDICE;
}

function extrairEntradasDaNavegacao(caminhoSidebar) {
  const arquivoFonte = ts.createSourceFile(
    basename(caminhoSidebar),
    readFileSync(caminhoSidebar, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  let itens = null;
  (function procurar(no) {
    if (itens !== null) return;
    if (ehCategoriaDoCatalogo(no)) {
      const lista = propriedadeDoObjeto(no, 'items');
      if (lista !== null && ts.isArrayLiteralExpression(lista)) itens = lista;
      return;
    }
    ts.forEachChild(no, procurar);
  })(arquivoFonte);

  if (itens === null) {
    throw new Error(
      `categoria do catálogo (com link para '${ID_DO_INDICE}') não encontrada em ${relative(ROOT, caminhoSidebar)} — a navegação mudou de forma e o gate não sabe mais o que comparar`,
    );
  }

  const entradas = [];
  for (const elemento of itens.elements) {
    if (!ts.isStringLiteralLike(elemento)) {
      throw new Error(
        `item da categoria do catálogo que não é id literal em ${relative(ROOT, caminhoSidebar)} — forma que este gate não sabe ler`,
      );
    }
    if (!elemento.text.startsWith(PREFIXO_DOC)) {
      throw new Error(
        `item '${elemento.text}' na categoria do catálogo fora de '${PREFIXO_DOC}' em ${relative(ROOT, caminhoSidebar)}`,
      );
    }
    entradas.push(elemento.text.slice(PREFIXO_DOC.length));
  }

  // Categoria sem item nenhum aprovaria um catálogo vazio por igualdade
  // vacuosa — as duas pontas da comparação seriam conjuntos vazios.
  if (entradas.length === 0) {
    throw new Error(
      `categoria do catálogo sem nenhuma entrada em ${relative(ROOT, caminhoSidebar)}`,
    );
  }
  return entradas;
}

// O Docusaurus 3 processa .md pelo mesmo pipeline MDX que .mdx — não há
// modo Markdown legado configurado neste portal — então uma página do
// catálogo publicável em .md precisa do mesmo gate.
function ehPaginaDeCatalogo(nomeArquivo) {
  return /\.mdx?$/.test(nomeArquivo);
}

function coletarPaginasRecursivo(dir) {
  const arquivos = [];
  for (const entrada of readdirSync(dir, {withFileTypes: true})) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      arquivos.push(...coletarPaginasRecursivo(caminho));
    } else if (entrada.isFile() && ehPaginaDeCatalogo(entrada.name)) {
      arquivos.push(caminho);
    }
  }
  return arquivos;
}

function listarMdx(alvo) {
  const info = statSync(alvo);
  if (info.isFile()) return [alvo];

  // Só o index.md(x) na raiz do alvo varrido é o índice do catálogo (página
  // sem `code`/`requisitos`, fora do contrato validado aqui). Um index
  // aninhado em subdiretório é uma entrada normal, publicável como
  // qualquer outra — não ganha a mesma exceção só pelo nome do arquivo.
  const indicesDaRaiz = new Set([
    join(alvo, 'index.mdx'),
    join(alvo, 'index.md'),
  ]);
  return coletarPaginasRecursivo(alvo).filter(
    (caminho) => !indicesDaRaiz.has(caminho),
  );
}

// `\b` trata `_` como caractere de palavra — um alias enfatizado em Markdown
// (`_RN13_`, `**RN13**`) tem `_`/`*` colado ao texto e passaria despercebido.
// O limite certo é "não há letra nem dígito adjacente", não "fronteira de
// palavra JS".
const RE_ALIAS_PROIBIDO =
  /(?<![A-Za-z0-9])(?:RN\d{2}|REQ-\d{2})(?![A-Za-z0-9])/g;

// Nós de bloco cujo texto é extraído isoladamente — impede que o fim de um
// parágrafo e o começo do próximo (ou de um item de lista para o seguinte)
// sejam concatenados sem separador e formem um alias que não existe na
// página renderizada (um bloco termina em "RN", o próximo começa em "13").
const BLOCOS_DE_TEXTO = new Set([
  'paragraph',
  'heading',
  'tableCell',
  'code',
  'html',
]);

// Quebra de linha forçada (`texto  \nresto`) não é o fim de um bloco, mas
// separa visualmente na renderização — sem tratar `break` à parte, dois
// fragmentos em linhas diferentes coladavam sem separador. Imagem — direta
// (`![alt](url)`) ou por referência (`![alt][ref]`) — guarda o texto
// visível em `alt`, não em `value` nem `children`; sem o caso à parte, o
// alt ficava fora da checagem.
function textoInline(no) {
  if (no.type === 'break') return '\n';
  if (no.type === 'image' || no.type === 'imageReference') {
    return typeof no.alt === 'string' ? no.alt : '';
  }
  // Expressão MDX ({...}, inclusive comentário {/* */}) é código-fonte, não
  // texto — sua .value é a expressão bruta. No nível de bloco (fora de
  // parágrafo) o nó nem chega aqui, por não estar em BLOCOS_DE_TEXTO; mas
  // aninhada dentro de um parágrafo (`texto {/* nota */} resto`) chega como
  // filho comum, e sem este caso a fonte bruta contava como prosa.
  if (no.type === 'mdxFlowExpression' || no.type === 'mdxTextExpression') {
    return '';
  }
  if (Array.isArray(no.children)) {
    return no.children.map(textoInline).join('');
  }
  return typeof no.value === 'string' ? no.value : '';
}

function textoVisivelPorBloco(no) {
  const blocos = [];
  (function coletar(atual) {
    if (BLOCOS_DE_TEXTO.has(atual.type)) {
      blocos.push(textoInline(atual));
      return;
    }
    for (const filho of atual.children ?? []) coletar(filho);
  })(no);
  return blocos.join('\n\n');
}

// Os headings saem da mesma árvore mdast que a prosa: um `##` dentro de bloco
// de código, ou um `<h2>` escrito como JSX, não é heading de documento, e
// procurar `^## ` linha a linha não faz essa distinção.
function coletarHeadings(arvore) {
  const headings = [];
  (function coletar(no) {
    if (no.type === 'heading') {
      headings.push({nivel: no.depth, texto: textoInline(no).trim()});
      return;
    }
    for (const filho of no.children ?? []) coletar(filho);
  })(arvore);
  return headings;
}

// O cabeçalho de identidade da entrada — code, título, status, campo `type` e
// situação — é renderizado por `<ErrorCatalogEntry {...frontMatter} />`. Sem a
// invocação, ou com props avulsas no lugar do espalhamento, a página publica
// prosa sem identidade nenhuma: a checagem de alias descarta JSX por
// construção, a página continua respondendo 200, e o índice não muda. O import
// precisa vir do componente certo: o nome da tag sozinho não amarra nada.
const COMPONENTE_DO_CABECALHO = 'ErrorCatalogEntry';

function ehEspalhamentoDoFrontMatter(atributo) {
  if (atributo.type !== 'mdxJsxExpressionAttribute') return false;
  // Pela estree, e não pelo texto do atributo: `{ ...frontMatter }` com
  // espaço é a mesma coisa, e comparar a cadeia crua diria que não é.
  for (const no of atributo.data?.estree?.body ?? []) {
    const propriedades = no.expression?.properties ?? [];
    if (
      propriedades.length === 1 &&
      propriedades[0].type === 'SpreadElement' &&
      propriedades[0].argument?.name === 'frontMatter'
    ) {
      return true;
    }
  }
  return false;
}

const MODULO_DO_CABECALHO = '@site/src/components/ErrorCatalogEntry';

// Reconhecer só o nome da tag não basta: `import ErrorCatalogEntry from
// '@site/src/components/RedocSpec'` constrói, invoca com o espalhamento e
// publica uma página sem identidade nenhuma. O que amarra o nome ao
// componente é o import, então é ele que precisa ser conferido.
function importaOCabecalho(arvore) {
  for (const no of arvore.children ?? []) {
    if (no.type !== 'mdxjsEsm') continue;
    for (const declaracao of no.data?.estree?.body ?? []) {
      if (
        declaracao.type !== 'ImportDeclaration' ||
        declaracao.source?.value !== MODULO_DO_CABECALHO
      ) {
        continue;
      }
      for (const especificador of declaracao.specifiers ?? []) {
        if (
          especificador.type === 'ImportDefaultSpecifier' &&
          especificador.local?.name === COMPONENTE_DO_CABECALHO
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function conferirCabecalho(arvore) {
  const erros = [];
  const invocacoes = [];
  (function coletar(no) {
    if (
      (no.type === 'mdxJsxFlowElement' || no.type === 'mdxJsxTextElement') &&
      no.name === COMPONENTE_DO_CABECALHO
    ) {
      invocacoes.push(no);
    }
    for (const filho of no.children ?? []) coletar(filho);
  })(arvore);

  if (invocacoes.length === 0) {
    erros.push(
      `cabeçalho ausente: a entrada não invoca <${COMPONENTE_DO_CABECALHO} {...frontMatter} /> e publicaria prosa sem code, type, status nem situação`,
    );
    return erros;
  }
  if (!importaOCabecalho(arvore)) {
    erros.push(
      `<${COMPONENTE_DO_CABECALHO}> invocado sem vir de '${MODULO_DO_CABECALHO}' — o nome da tag não garante qual componente renderiza`,
    );
  }
  if (invocacoes.length > 1) {
    erros.push(
      `cabeçalho repetido: ${invocacoes.length} invocações de <${COMPONENTE_DO_CABECALHO}> na mesma entrada`,
    );
  }
  // O espalhamento tem de ser o atributo único. Não basta estar presente: uma
  // prop depois dele sobrescreve o valor espalhado, e `{...frontMatter}
  // code="outro"` publicaria um cabeçalho que contradiz a página inteira —
  // rota, título e busca vêm do frontmatter, o cabeçalho viria da prop.
  for (const invocacao of invocacoes) {
    const atributos = invocacao.attributes ?? [];
    if (atributos.length !== 1 || !ehEspalhamentoDoFrontMatter(atributos[0])) {
      erros.push(
        `<${COMPONENTE_DO_CABECALHO}> precisa receber {...frontMatter} como atributo único — qualquer outro sobrescreve o que o frontmatter declara`,
      );
    }
  }
  return erros;
}

function validarArquivo(caminho, requisitosExistentes) {
  const conteudo = readFileSync(caminho, 'utf8');
  const erros = [];

  let pagina;
  try {
    pagina = matter(conteudo);
  } catch (e) {
    erros.push(`frontmatter YAML inválido: ${e.message}`);
    return {erros, dados: null};
  }

  // gray-matter não lança quando não há frontmatter — devolve `matter: ''`.
  if (pagina.matter === '') {
    erros.push('frontmatter YAML ausente ou sem delimitador de fechamento');
    return {erros, dados: null};
  }

  const requisitos = pagina.data.requisitos;
  if (requisitos === undefined || requisitos === null) {
    erros.push(
      'campo requisitos ausente ou nulo — use `requisitos: []` quando não houver vínculo',
    );
  } else if (!Array.isArray(requisitos)) {
    erros.push(
      `requisitos não é lista YAML (encontrado: ${JSON.stringify(requisitos)})`,
    );
  } else {
    for (const item of requisitos) {
      if (typeof item !== 'string') {
        erros.push(
          `item de lista malformado em requisitos: ${JSON.stringify(item)}`,
        );
      } else if (!/^UNI-REQ-\d{4}$/.test(item)) {
        erros.push(
          `item de requisitos fora do padrão UNI-REQ-NNNN: '${item}'`,
        );
      } else if (!requisitosExistentes.has(item)) {
        erros.push(`requisito inexistente no registro canônico: ${item}`);
      }
    }
  }

  // O H1 da página é o `title`, e o Docusaurus deixa a própria página desligá-lo
  // pelo frontmatter. Sem esta checagem, uma entrada com `hide_title: true`
  // renderizaria sem H1 nenhum — e o gate de prosa, que só rejeita H1 escrito à
  // mão, aprovaria. É por entrada, e é aqui que fica barato conferir.
  const title = pagina.data.title;
  if (typeof title !== 'string' || title.trim() === '') {
    erros.push('campo title ausente ou vazio — é o H1 da página');
  }
  // Qualquer valor, não só o booleano literal: o Docusaurus valida este
  // frontmatter com schema booleano, que coage `"true"` citado, `yes` e
  // afins — enquanto o gray-matter entrega a cadeia crua. Como nenhuma
  // entrada tem motivo para declarar o campo, a presença já reprova, e a
  // classe inteira de coerção fica de fora por construção.
  if ('hide_title' in pagina.data) {
    erros.push(
      'hide_title declarado — a entrada ficaria sem o H1 que o catálogo promete a quem chega pelo campo type',
    );
  }

  const code = pagina.data.code;
  if (typeof code !== 'string' || code === '') {
    erros.push('campo code ausente ou vazio — é a chave da entrada');
  } else if (!RE_CODE.test(code)) {
    erros.push(
      `code fora da taxonomia de identificador de causa: '${code}' — segmentos minúsculos separados por ponto`,
    );
  }

  const situacao = pagina.data.situacao;
  if (!SITUACOES.has(situacao)) {
    erros.push(
      `situacao fora do conjunto conhecido: ${JSON.stringify(situacao)} — use ${[...SITUACOES].join(' ou ')}`,
    );
  }

  // A correspondência é nos dois sentidos: rascunho que não se anuncia engana
  // quem varre o índice, e entrada publicada anunciando rascunho desacredita
  // um comportamento que já está em vigor.
  const description = pagina.data.description;
  if (typeof description !== 'string' || description === '') {
    erros.push('campo description ausente ou vazio — é o texto do card no índice');
  } else if (SITUACOES.has(situacao)) {
    const anunciaRascunho = description.startsWith(PREFIXO_RASCUNHO);
    if (situacao === 'rascunho' && !anunciaRascunho) {
      erros.push(
        `entrada em rascunho sem '${PREFIXO_RASCUNHO}' no início do description — o card do índice não avisa`,
      );
    }
    if (situacao === 'publicado' && anunciaRascunho) {
      erros.push(
        `entrada publicada anunciando '${PREFIXO_RASCUNHO}' no description — o card do índice contradiz a situação`,
      );
    }
  }

  // Remover caractere de marcação não bastava: por um lado, um link
  // (`RN[13](/regra)`) renderiza "RN13" sem usar nenhum dos caracteres
  // removidos; por outro, sublinhado intra-palavra sem par (`RN_13`) é
  // texto literal em CommonMark — removê-lo sempre criava falso positivo.
  // A árvore mdast resolve os dois: extrai o texto como o leitor vê,
  // decidindo por sintaxe real, não por presença de caractere. Extraído
  // por bloco (§ BLOCOS_DE_TEXTO) para não colar o fim de um parágrafo no
  // começo do próximo.
  //
  // O parse usa as extensões MDX (não só Markdown puro): toda página do
  // catálogo abre com `import ... from '...'` e `<ErrorCatalogEntry
  // {...frontMatter} />`, e um parser Markdown puro trata essas linhas
  // como texto comum — um import ou atributo JSX que citasse o padrão
  // proibido reprovaria a página mesmo nunca aparecendo ao leitor. Com
  // MDX, import/export, JSX e `{expressão}` viram nós próprios
  // (mdxjsEsm, mdxJsxFlowElement, mdxFlowExpression…), fora de
  // BLOCOS_DE_TEXTO — não entram na checagem.
  const arvore = fromMarkdown(pagina.content, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });
  const prosaRenderizada = textoVisivelPorBloco(arvore);
  for (const alias of prosaRenderizada.matchAll(RE_ALIAS_PROIBIDO)) {
    erros.push(
      `alias de regra proibido na prosa: '${alias[0]}' — cite o UNI-REQ-NNNN correspondente`,
    );
  }

  erros.push(...conferirCabecalho(arvore));

  const headings = coletarHeadings(arvore);
  for (const secao of SECOES_OBRIGATORIAS) {
    const presente = headings.some(
      (h) => h.nivel === 2 && h.texto === secao,
    );
    if (!presente) erros.push(`seção obrigatória ausente: '## ${secao}'`);
  }

  // O H1 da página é o `title` do frontmatter, que o Docusaurus renderiza.
  // Um `#` na prosa produz um segundo H1 — hierarquia quebrada para leitor
  // de tela (WCAG 1.3.1) e dois títulos concorrentes na mesma página.
  for (const heading of headings) {
    if (heading.nivel === 1) {
      erros.push(
        `H1 na prosa: '${heading.texto}' — o título da página é o campo title do frontmatter`,
      );
    }
  }

  return {erros, dados: pagina.data};
}

// O nome do arquivo é a rota (`/erros/{code}`), e a rota é o valor que o
// campo `type` do corpo de erro carrega. Divergir aqui publica um `type` que
// aponta para outro lugar — e a página existe, então nada mais reprova.
function conferirIdentidade(resultado, raizes) {
  // O catálogo é plano por construção: o `code` tem pontos, não barras. Uma
  // página em subdiretório teria rota `/erros/<sub>/<code>` e ainda casaria o
  // nome do arquivo — a divergência passaria por baixo da comparação.
  if (!raizes.has(dirname(resultado.arquivo))) {
    resultado.erros.push(
      'página em subdiretório do catálogo — a rota deixa de ser /erros/{code}',
    );
    return;
  }

  const code = resultado.dados?.code;
  if (typeof code !== 'string') return; // ausência já foi reportada
  const nome = basename(resultado.arquivo, extname(resultado.arquivo));
  if (code !== nome) {
    resultado.erros.push(
      `code '${code}' diverge do nome do arquivo '${nome}' — a rota publicada não é a que o campo type anuncia`,
    );
  }
}

// A página só aparece no índice se estiver na categoria da navegação — é dela
// que o `DocCardList` da visão geral tira a lista. Página fora da navegação
// fica publicada e invisível; item sem página quebra o build da navegação.
function conferirNavegacao(resultados, caminhoSidebar) {
  const erros = [];
  const itensDaNavegacao = extrairEntradasDaNavegacao(caminhoSidebar);
  const naNavegacao = new Set(itensDaNavegacao);

  // Conjunto descarta repetição, e id repetido na categoria vira card
  // duplicado no índice — a comparação de conjuntos aprovaria isso.
  if (naNavegacao.size !== itensDaNavegacao.length) {
    const vistos = new Set();
    for (const nome of itensDaNavegacao) {
      if (vistos.has(nome)) {
        erros.push(`item repetido na navegação do catálogo: ${nome}`);
      }
      vistos.add(nome);
    }
  }
  const noDisco = new Set(
    resultados.map((r) => basename(r.arquivo, extname(r.arquivo))),
  );

  for (const nome of [...noDisco].sort()) {
    if (!naNavegacao.has(nome)) {
      erros.push(`página fora da navegação do catálogo: ${nome}`);
    }
  }
  for (const nome of [...naNavegacao].sort()) {
    if (!noDisco.has(nome)) {
      erros.push(`item de navegação sem página correspondente: ${nome}`);
    }
  }
  return erros;
}

// Gramática: `--sidebar=<arquivo>` liga o modo catálogo e diz qual navegação
// comparar; o resto dos argumentos são alvos. Sem argumento nenhum, o modo
// catálogo vale sobre docs/erros e sidebars.ts — é a invocação de produção,
// a que o CI roda.
function lerArgumentos(argv) {
  const alvos = [];
  let sidebar = null;

  for (const argumento of argv) {
    if (argumento.startsWith('--sidebar=')) {
      sidebar = resolve(argumento.slice('--sidebar='.length));
    } else if (argumento.startsWith('-')) {
      console.error(`opção desconhecida: ${argumento}`);
      process.exit(2);
    } else {
      alvos.push(resolve(argumento));
    }
  }

  if (alvos.length === 0) {
    if (sidebar !== null) {
      console.error('--sidebar= exige ao menos um alvo a comparar');
      process.exit(2);
    }
    return {alvos: [CATALOGO_PUBLICADO], sidebar: SIDEBAR_PADRAO};
  }
  return {alvos, sidebar};
}

function main() {
  const {alvos, sidebar} = lerArgumentos(process.argv.slice(2));

  const requisitosExistentes = carregarRequisitosExistentes();
  const arquivos = alvos.flatMap(listarMdx).sort();

  if (arquivos.length === 0) {
    console.error('nenhum arquivo .mdx encontrado nos alvos informados');
    process.exit(2);
  }

  const resultados = arquivos.map((arquivo) => ({
    arquivo,
    ...validarArquivo(arquivo, requisitosExistentes),
  }));

  if (sidebar !== null) {
    // Alvo que é arquivo tem o próprio diretório como raiz; alvo que é
    // diretório é raiz de si mesmo.
    const raizes = new Set(
      alvos.map((alvo) => (statSync(alvo).isDirectory() ? alvo : dirname(alvo))),
    );
    for (const resultado of resultados) conferirIdentidade(resultado, raizes);
  }

  let totalErros = 0;
  for (const {arquivo, erros} of resultados) {
    const rotulo = relative(ROOT, arquivo);
    if (erros.length === 0) {
      console.log(`ok   ${rotulo}`);
    } else {
      totalErros += erros.length;
      console.log(`FAIL ${rotulo}`);
      for (const e of erros) console.log(`  - ${e}`);
    }
  }

  if (sidebar !== null) {
    const errosDeNavegacao = conferirNavegacao(resultados, sidebar);
    const rotulo = relative(ROOT, sidebar);
    if (errosDeNavegacao.length === 0) {
      console.log(`ok   ${rotulo} (navegação do catálogo)`);
    } else {
      totalErros += errosDeNavegacao.length;
      console.log(`FAIL ${rotulo} (navegação do catálogo)`);
      for (const e of errosDeNavegacao) console.log(`  - ${e}`);
    }
  }

  console.log('');
  if (totalErros > 0) {
    console.log(`Total de erros: ${totalErros} em ${arquivos.length} arquivo(s).`);
    process.exit(1);
  }
  console.log(`${arquivos.length} página(s) validada(s) sem erros.`);
}

main();
