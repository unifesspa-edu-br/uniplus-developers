# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Convenções org-wide (Conventional Commits pt-BR, workflow issue→branch→PR, stack Gov.br, hierarquia Epic→Feature→Story→Task) vivem no `CLAUDE.md` do workspace pai (`../../CLAUDE.md` → `docs/visao-do-projeto.md`). Este arquivo cobre apenas o que é específico do portal `uniplus-developers`.

## O que é este repositório

Portal **público** de documentação de desenvolvedores do Uni+, em **Docusaurus 3** (React 19, TypeScript). Duas trilhas: **Produto/Domínio** (requisitos, regras de negócio, casos de uso) e **Referência de API** (OpenAPI por módulo via Redoc, catálogo de erros, media types, changelog). É a Milestone C do contrato REST V1 da `uniplus-api` — materializa os `type` URIs de `ProblemDetails` (RFC 9457) como páginas resolvíveis. Decisões em `docs/adrs/0001-arquitetura-portal-desenvolvedores.md` (leia antes de mudanças estruturais).

## Comandos

```bash
npm ci                 # instala dependências (Node >= 20)
npm start              # dev server em http://localhost:3000/uniplus-developers/ (hot reload; o subpath vem do baseUrl)
npm run build          # build estático em ./build (onBrokenLinks: 'throw' — links quebrados falham o build)
npm run serve          # serve ./build localmente
npm run typecheck      # tsc sem emit
npm run clear          # limpa cache do Docusaurus (.docusaurus/) — use ao depurar build estranho

# E2E (Playwright): exige build prévio — webServer roda `npm run serve`
npm run build && npm run test:e2e
npx playwright test e2e/portal.spec.ts          # um arquivo
npx playwright test -g "nome do teste"          # um teste por título

# Lint de ADRs (rodam em CI a cada PR)
bash tools/adr-lint/validate.sh                 # validador MADR 4.0 (bash puro)
npx markdownlint-cli2 'docs/adrs/**/*.md'
```

Não há lint/test sobre `src/` além de `typecheck` e os E2E; o "teste" do portal é o build passar + os E2E de smoke e acessibilidade.

## Arquitetura

**Navegação de duas trilhas** — `sidebars.ts` define `produtoSidebar` e `apiSidebar`, expostas como duas entradas de navbar em `docusaurus.config.ts`. `routeBasePath: '/'` (docs servidos na raiz, sem blog). `docs/adrs/**` é **excluído** do site (`exclude` no preset) — ADRs são governança interna, não páginas publicáveis.

**Embed de OpenAPI via Redoc** — `src/components/RedocSpec.tsx` é o wrapper único: recebe `spec` (arquivo em `static/openapi/`) + `tag`/`operationId` opcionais. **Regra crítica:** Redoc usa `window` e quebra o SSR — por isso o componente é obrigatoriamente envolto em `<BrowserOnly>` e importa `redoc` via `require()` dentro do callback. Nunca renderize Redoc fora desse padrão. Specs OpenAPI são sincronizados da `uniplus-api` (workflow `sync-specs.yml` previsto no ADR-0001) para `static/openapi/`.

**Theming Gov.br DS dual-layer** — dois sistemas de estilo concorrentes (shell Infima do Docusaurus + Emotion CSS-in-JS do Redoc), reconciliados por **fonte única de tokens**. Ao tocar em cores/tipografia/espaçamento, edite os três em sincronia:
- `src/css/govbr-tokens.css` — tokens Gov.br como CSS custom properties (`:root`). Fonte canônica.
- `src/css/custom.css` — overrides do Infima consumindo os tokens (`--ifm-color-primary: var(--govbr-...)`).
- `src/css/redoc-theme.ts` — objeto `redocGovbrTheme` passado ao `<RedocStandalone>`, referenciando os mesmos tokens.

A ordem de carregamento importa: `govbr-tokens.css` é listado antes de `custom.css` no `customCss` do preset.

**Personas / dados fictícios** — toda documentação e exemplo usa exclusivamente personas fictícias. Fonte: `src/data/fake-people.json`, renderizado por `src/components/FakePeopleTable.tsx`, documentado em `docs/personas/`. Nunca use CPF, nome ou endereço de pessoa real. Os campos seguem o domínio Uni+ (incl. nome social — RN02); não são dados mascarados, são **formatados** para exibição.

## CI e deploy

Três workflows em `.github/workflows/`, todos com `concurrency` cancelando PRs em série:
- `ci.yml` — adr-lint + markdownlint sobre `docs/adrs/`.
- `e2e.yml` — `npm ci` → instala chromium → `npm run build` → `npm run test:e2e` (smoke + axe-core a11y).
- `deploy.yml` — em PR só valida o build; em **push para main** publica `./build` na branch `gh-pages` via `peaceiris/actions-gh-pages`. O portal é servido em subpath do GitHub Pages (`https://unifesspa-edu-br.github.io/uniplus-developers/`), sem domínio custom — daí `baseUrl: '/uniplus-developers/'` no `docusaurus.config.ts` e o mesmo prefixo no `baseURL` do `playwright.config.ts`. Quando o CNAME institucional `developers.uniplus.unifesspa.edu.br` for provisionado, reintroduza `static/CNAME` e volte `url`/`baseUrl` para o domínio (ADR-0001, § Hosting e deploy).

## Licenciamento (duplo)

- **Código** (`src/`, configs, workflows): MIT (`LICENSE`).
- **Conteúdo** (`docs/`, `static/openapi/`): CC-BY-4.0 (`LICENSE-CONTENT`).

Mantenha a separação ao adicionar arquivos — código novo é MIT, conteúdo/spec é CC-BY.

## ADRs

Novos ADRs em `docs/adrs/` seguem MADR 4.0 e devem passar `tools/adr-lint/validate.sh`: nome `NNNN-slug.md`, frontmatter com `status`/`date`/`decision-makers`, H1 `# ADR-NNNN: ...`, exatamente uma seção `## Resultado da decisão`, e as seções obrigatórias (Contexto, Opções consideradas, Resultado da decisão, Consequências). Use `docs/adrs/_template.md`.
