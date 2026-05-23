# uniplus-developers

Portal de documentação de desenvolvedores do **Uni+** (Sistema Unificado
Unifesspa — S2U), construído com [Docusaurus 3](https://docusaurus.io/).

Consolida, em um só portal público:

- **Trilha de Produto/Domínio** — requisitos, regras de negócio, casos de uso (PO + DEV)
- **Trilha de Referência de API** — OpenAPI por módulo, catálogo de erros, media types, changelog

Arquitetura definida no [ADR-0001](docs/adrs/0001-arquitetura-portal-desenvolvedores.md).

## Domínios

| Ambiente | Domínio |
|---|---|
| Trabalho (staging) | `developers.portaluni.com.br` |
| Produção | `developers.uniplus.unifesspa.edu.br` (reservado) |

## Desenvolvimento

```bash
npm ci          # instala dependências
npm start       # servidor local em http://localhost:3000
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
branch `gh-pages` via `peaceiris/actions-gh-pages`. O domínio custom é declarado
em `static/CNAME`.
