#!/usr/bin/env node
// tools/catalogo-erros/validar.mjs — contrato de identificador das páginas
// do catálogo público de erros (docs/erros/*.mdx).
//
// Uso:
//   node tools/catalogo-erros/validar.mjs                  # valida docs/erros
//   node tools/catalogo-erros/validar.mjs <arquivo|dir>...  # alvos explícitos
//
// Checa, por página:
//   1. `requisitos` é sempre lista YAML — `requisitos: []` quando não houver
//      vínculo, nunca campo omitido nem `null`.
//   2. cada item casa `^UNI-REQ-\d{4}$`.
//   3. cada item existe em src/data/produto/requisitos-mvp-selecao.ts.
//   4. a prosa (fora do frontmatter) não usa o alias `RNxx`/`REQ-NN`.
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
import {join, relative, resolve} from 'node:path';
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

function validarArquivo(caminho, requisitosExistentes) {
  const conteudo = readFileSync(caminho, 'utf8');
  const erros = [];

  let pagina;
  try {
    pagina = matter(conteudo);
  } catch (e) {
    erros.push(`frontmatter YAML inválido: ${e.message}`);
    return erros;
  }

  // gray-matter não lança quando não há frontmatter — devolve `matter: ''`.
  if (pagina.matter === '') {
    erros.push('frontmatter YAML ausente ou sem delimitador de fechamento');
    return erros;
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

  return erros;
}

function main() {
  const alvosInformados = process.argv.slice(2);
  const alvos =
    alvosInformados.length > 0
      ? alvosInformados.map((a) => resolve(a))
      : [join(ROOT, 'docs/erros')];

  const requisitosExistentes = carregarRequisitosExistentes();
  const arquivos = alvos.flatMap(listarMdx).sort();

  if (arquivos.length === 0) {
    console.error('nenhum arquivo .mdx encontrado nos alvos informados');
    process.exit(2);
  }

  let totalErros = 0;
  for (const arquivo of arquivos) {
    const erros = validarArquivo(arquivo, requisitosExistentes);
    const rotulo = relative(ROOT, arquivo);
    if (erros.length === 0) {
      console.log(`ok   ${rotulo}`);
    } else {
      totalErros += erros.length;
      console.log(`FAIL ${rotulo}`);
      for (const e of erros) console.log(`  - ${e}`);
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
