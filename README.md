# uniplus-developers

Portal de documentação de desenvolvedores do **Uni+** (Sistema Unificado
Unifesspa — S2U), construído com [Docusaurus 3](https://docusaurus.io/).

Consolida, em um só portal público:

- **Trilha de Produto/Domínio** — requisitos, regras de negócio, casos de uso (PO + DEV)
- **Trilha de Referência de API** — OpenAPI por módulo, catálogo de erros, media types, changelog

Arquitetura definida no [ADR-0001](docs/adrs/0001-arquitetura-portal-desenvolvedores.md).

## Endereços

| Ambiente | Endereço |
|---|---|
| Publicado | `https://unifesspa-edu-br.github.io/uniplus-developers/` |
| Produção | `developers.uniplus.unifesspa.edu.br` (reservado — depende do CNAME a ser provisionado pelo time de redes) |

## Desenvolvimento

```bash
npm ci          # instala dependências
npm start       # servidor local em http://localhost:3000/uniplus-developers/
npm run build   # build estático em ./build
npm run serve   # serve o build localmente
```

Requer **Node.js >= 20**.

## Dados de exemplo

Todos os exemplos usam exclusivamente as
[personas fictícias](docs/personas/pessoas-ficticias.md). Não use dados de
pessoas reais na documentação.

## Theming Gov.br DS (dual-layer)

- `src/css/govbr-tokens.css` — fonte única dos tokens Gov.br DS
- `src/css/custom.css` — shell do Docusaurus (Infima) consumindo os tokens
- `src/css/redoc-theme.ts` — tema do Redoc embed consumindo os mesmos tokens

## Licenciamento

- **Código** (`src/`, configs, workflows): [MIT](LICENSE)
- **Conteúdo** (`docs/`, `static/openapi/`): [CC-BY-4.0](LICENSE-CONTENT)

## Deploy

Push para `main` dispara `.github/workflows/deploy.yml`: build + publicação na
branch `gh-pages` via `peaceiris/actions-gh-pages`. O portal é servido em
subpath do GitHub Pages, sem domínio custom — o prefixo `/uniplus-developers/`
vem do `baseUrl` em `docusaurus.config.ts`.

Quando o CNAME institucional `developers.uniplus.unifesspa.edu.br` for
provisionado pelo time de redes, reintroduza `static/CNAME` com o domínio e
volte `url`/`baseUrl` para a raiz — o pipeline de build não muda
([ADR-0001](docs/adrs/0001-arquitetura-portal-desenvolvedores.md), § Hosting e
deploy).
