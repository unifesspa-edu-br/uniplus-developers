// Servidor estático dos E2E, fiel ao GitHub Pages.
//
// Por que não `docusaurus serve`: ele resolve as rotas pelo `serve-handler`,
// que trata um segmento de caminho com ponto como nome de arquivo com extensão.
// As páginas do catálogo de erros são endereçadas pelo próprio `code`
// (`/erros/uniplus.selecao.…`), então o handler procura um arquivo que não
// existe e responde 404 — enquanto o GitHub Pages, que resolve diretório e
// serve o `index.html` de dentro, entrega a página. O portal é publicado sem
// Jekyll (`peaceiris/actions-gh-pages` grava `.nojekyll`), de modo que servir
// arquivo cru com resolução de diretório é exatamente o comportamento de
// produção.
//
// Sem isto, o E2E não consegue provar que o `type` de um `ProblemDetails`
// resolve — que é a razão de o catálogo existir —, porque a navegação do
// Docusaurus mascara o 404: o bundle carrega pelo `404.html` e monta a rota
// no cliente, com a página certa na tela e o status errado no protocolo.

import {createReadStream, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, join, normalize, resolve} from 'node:path';

function arg(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
}

const porta = Number(arg('port', '3000'));
const raiz = resolve(arg('dir', 'build'));
// Prefixo em que o portal é publicado — o mesmo `baseUrl` do build.
const base = arg('base', '/');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function tipoDe(caminho) {
  return TIPOS[extname(caminho).toLowerCase()] ?? 'application/octet-stream';
}

function estado(caminho) {
  try {
    return statSync(caminho);
  } catch {
    return null;
  }
}

function enviaArquivo(res, caminho, status = 200) {
  res.writeHead(status, {'Content-Type': tipoDe(caminho)});
  createReadStream(caminho).pipe(res);
}

function naoEncontrado(res) {
  const pagina404 = join(raiz, '404.html');
  if (estado(pagina404)?.isFile()) {
    enviaArquivo(res, pagina404, 404);
    return;
  }
  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('404');
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${porta}`);

  let caminho;
  try {
    // Um `%` solto atravessa o `URL` intacto e faz `decodeURIComponent` lançar.
    // Sem o tratamento, a exceção sobe pelo listener e derruba o processo — a
    // suíte inteira passaria a falhar por servidor indisponível, escondendo o
    // que de fato aconteceu.
    caminho = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('400');
    return;
  }

  if (!caminho.startsWith(base)) {
    // Fora do prefixo de publicação, como no GitHub Pages: só o subpath do
    // repositório responde.
    naoEncontrado(res);
    return;
  }

  const relativo = caminho.slice(base.length);
  // `normalize` resolve `..` antes da checagem de contenção abaixo.
  const alvo = join(raiz, normalize(`/${relativo}`));
  if (alvo !== raiz && !alvo.startsWith(raiz + '/')) {
    naoEncontrado(res);
    return;
  }

  const info = estado(alvo);

  if (info?.isFile()) {
    enviaArquivo(res, alvo);
    return;
  }

  if (info?.isDirectory()) {
    if (!caminho.endsWith('/')) {
      // Mesmo redirecionamento que o GitHub Pages faz ao endereçar um
      // diretório sem a barra final.
      res.writeHead(301, {Location: `${caminho}/${url.search}`});
      res.end();
      return;
    }
    const indice = join(alvo, 'index.html');
    if (estado(indice)?.isFile()) {
      enviaArquivo(res, indice);
      return;
    }
  }

  naoEncontrado(res);
}).listen(porta, () => {
  process.stdout.write(`E2E server: http://localhost:${porta}${base}\n`);
});
