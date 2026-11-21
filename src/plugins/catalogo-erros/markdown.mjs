import {fromMarkdown} from 'mdast-util-from-markdown';
import {gfm} from 'micromark-extension-gfm';
import {gfmFromMarkdown} from 'mdast-util-gfm';

const FORMATO = {extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()]};
const BLOCOS = new Set(['paragraph', 'list', 'table', 'code']);
const INCOMPATIVEIS = new Set(['html', 'heading', 'image', 'imageReference', 'definition',
  'linkReference', 'blockquote']);

export function tipoDeLink(destino) {
  if (!destino || /[\\\p{Cc}]/u.test(destino)) return undefined;
  if (destino.startsWith('/') && !destino.startsWith('//')) return 'portal';
  if (/^https:\/\//i.test(destino) && URL.canParse(destino)) return 'https';
  return undefined;
}

export function conferirBloco(bloco, codigo) {
  if (typeof bloco !== 'string' || !bloco.trim()) {
    throw new Error(`${codigo}: bloco vazio.`);
  }
  const arvore = fromMarkdown(bloco, FORMATO);
  if (arvore.children.length !== 1 || !BLOCOS.has(arvore.children[0].type) || /^\s*:::/m.test(bloco)) {
    throw new Error(`${codigo}: bloco fora do Markdown simples.`);
  }
  const internos = [];
  function visitar(no) {
    if (no.type === 'code' && !/^```(?:json|text)?[ \t]*\n[\s\S]*?^```[ \t]*$/m.test(bloco)) {
      throw new Error(`${codigo}: bloco de código inválido.`);
    }
    if (INCOMPATIVEIS.has(no.type)) throw new Error(`${codigo}: elemento de Markdown não permitido.`);
    if (no.type === 'link') {
      const tipo = tipoDeLink(no.url);
      if (!tipo) throw new Error(`${codigo}: link fora de HTTPS ou do portal.`);
      if (tipo === 'portal') internos.push(no.url);
    }
    no.children?.forEach(visitar);
  }
  visitar(arvore);
  return internos;
}
