---
status: "accepted"
date: "2026-05-03"
decision-makers:
  - "Tech Lead (CTIC)"
---

# ADR-0001: Arquitetura do portal de desenvolvedores — Docusaurus + Redoc embed em MDX + Gov.br DS theming

## Contexto e enunciado do problema

O contrato REST canônico V1 da `uniplus-api` (umbrella ADR-0022 do `uniplus-api`) exige um portal público de desenvolvedores para resolver o `type` URI de cada `ProblemDetails` emitida ([ADR-0023 do `uniplus-api`](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0023-wire-formato-erro-rfc-9457.md)) — sem o portal, esses URIs ficam como referência morta. Auditores externos (CGU/TCU), jurídico, integradores institucionais e desenvolvedores precisam acessar em URL pública e estável: catálogo de erros (`/erros/{code}`), OpenAPI specs renderizados por módulo, catálogo de media types (`/media-types/{resource}/{version}`), changelog de versões, e guias de jornada.

Esta ADR registra a arquitetura do portal — stack, theming, deploy e governança — antes do scaffolding começar. O portal é a Milestone C do contrato V1, sequencial após Backend (A) e Frontend (B).

Esta é a **primeira ADR** do repositório `uniplus-developers`; setup de tooling (`docs/adrs/`, `tools/adr-lint/`, workflow CI) entra junto com este PR.

## Drivers da decisão

- **Versionamento de docs first-class.** Versionamento per-resource ([ADR-0028 do `uniplus-api`](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0028-versionamento-per-resource-content-negotiation.md)) requer múltiplas versões de API documentadas em paralelo. Mecanismo nativo é mandatório.
- **i18n nativo.** Plataforma pública federal com necessidade futura de pt-BR + en (integradores internacionais ou alinhamento com Gov.br DS multilíngue).
- **MDX para living docs.** Misturar prosa com componentes React (exemplos interativos, calculadoras de score, diagramas de fluxo, tabela de jornadas) precisa ser maduro, não experimental.
- **Layout flexível por página.** Alguns recursos pedem spec completo embedded; outros pedem só uma operação isolada; outros são jornadas-narrativas que apenas linkam a operação. Render preset uniforme não atende.
- **Theming Gov.br DS.** Portal institucional federal — visual precisa seguir Gov.br Design System (Portaria SEI-MCOM 540/2020, IN SGD/ME 94/2022). Ver [ADR-0006 do `uniplus-web`](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0006-govbr-design-system-como-contrato-visual.md).
- **Hosting institucional ou GitHub Pages.** Sem orçamento para CDN comercial; precisa ser sustentável no longo prazo via canal institucional.
- **CTIC sole owner.** Documentação de API é responsabilidade da CTIC; PROEG/PROEX/CEPS/CRCA são clientes institucionais que fornecem input normativo, não co-owners.

## Opções consideradas

- **A. Docusaurus 3 + `redoc` React component embedded em MDX + theming Gov.br DS via 3 arquivos CSS** (tokens + Infima + Redoc), hosting GitHub Pages com CNAME para `developers.uniplus.unifesspa.edu.br`.
- **B. Docusaurus + `@redocusaurus/preset-docusaurus`** — preset opinionado que renderiza specs como rotas standalone via configuração.
- **C. Astro Starlight + Scalar embed** — SSG mais novo + renderer de spec mais novo.
- **D. Hugo + Redocly Community CLI** — SSG Go + spec renderer estático.
- **E. Docusaurus + `@redocly/api-reference` web component** — variante web component do mesmo dono do Redoc.
- **F. SaaS (GitBook, Mintlify)** — vendor com tier pago.

## Resultado da decisão

**Escolhida:** "A — Docusaurus 3 + `redoc` React component embedded em MDX + theming Gov.br DS dual-layer + GitHub Pages com CNAME", porque é a única opção que combina (i) versionamento e i18n first-class do Docusaurus, (ii) layout control total do Redoc embedded (vs preset opinionado), (iii) theming pela mesma família de tokens já validada no `uniplus-web` e (iv) hosting sem custo recorrente sob domínio institucional.

### Estrutura do site

```text
uniplus-developers/
├── docusaurus.config.ts
├── sidebars.ts
├── src/
│   ├── components/
│   │   ├── RedocSpec.tsx          # Wrapper do <RedocStandalone> com theming Gov.br
│   │   ├── ErrorCatalogEntry.tsx  # Renderiza /erros/{code} a partir do frontmatter
│   │   ├── MediaTypeCard.tsx      # Renderiza /media-types/{resource}/{version}
│   │   └── ChangelogEntry.tsx     # Renderiza entradas de changelog com banners
│   ├── css/
│   │   ├── govbr-tokens.css       # Fonte única dos tokens Gov.br DS
│   │   ├── custom.css             # Theming do shell Docusaurus (Infima)
│   │   └── redoc-theme.css        # Theming do renderer Redoc
│   └── theme/                     # Overrides de theme do Docusaurus
├── docs/
│   ├── intro.md                   # "Início rápido por persona"
│   ├── modules/<modulo>/<recurso>/v<N>.mdx
│   ├── erros/{code}.mdx           # Frontmatter + <ErrorCatalogEntry/>
│   ├── media-types/<resource>/<version>.mdx
│   ├── changelog/v<X.Y.Z>.mdx
│   └── guides/                    # Jornadas
├── static/
│   ├── openapi/                   # specs sincronizados de uniplus-api
│   └── img/
└── .github/workflows/
    ├── deploy.yml                 # Build + push para gh-pages no merge para main
    └── sync-specs.yml             # Pull dos specs de uniplus-api/contracts/
```

### Componente-chave: `<RedocSpec>`

Wrapper React único que aceita `spec` (path do JSON), `tag` ou `operationId` opcionais, aplica o tema Gov.br DS e garante que SSR não tente renderizar o componente (o Redoc depende de APIs do browser):

```tsx
import BrowserOnly from '@docusaurus/BrowserOnly';

export const RedocSpec = ({ spec, tag, operationId }) => (
  <BrowserOnly fallback={<div>Carregando especificação…</div>}>
    {() => {
      const { RedocStandalone } = require('redoc');
      return (
        <RedocStandalone
          specUrl={`/openapi/${spec}`}
          options={{
            theme: { /* tokens Gov.br */ },
            scrollYOffset: 60,
            ...(tag && { onlyTags: [tag] }),
            ...(operationId && { onlyOperationIds: [operationId] }),
          }}
        />
      );
    }}
  </BrowserOnly>
);
```

O `BrowserOnly` é mandatório — Redoc usa `window` internamente e quebra o build estático do Docusaurus se renderizado em SSR.

### Theming Gov.br DS dual-layer

Risco conhecido: portal tem **dois sistemas de theming concorrentes** (Docusaurus shell via Infima + Redoc via Emotion CSS-in-JS). Mitigação é **fonte única de tokens**:

- **`src/css/govbr-tokens.css`** — declara tokens Gov.br como CSS custom properties em `:root`. Conjunto idêntico ao já mapeado em `apps/poc-primeng/` do `uniplus-web` (46 tokens — cores, tipografia, espaçamento, bordas, focus ring).
- **`src/css/custom.css`** — consome tokens via Infima theme overrides (`--ifm-color-primary: var(--govbr-blue-warm-vivid-70)`, etc.).
- **`src/css/redoc-theme.css`** — exporta objeto `theme` consumido pelo `<RedocStandalone options={{theme}}>` referenciando os mesmos tokens.

A fonte canônica de tokens vem de `uniplus-web/apps/poc-primeng/src/styles.css`. Cópia inicial é manual para o V1; follow-up pós-V1 é extrair os tokens para pacote npm publicável (`@uniplus/govbr-tokens`) consumido por ambos os repositórios — esse follow-up entra como ADR superseding parte desta quando justificado.

**Validação obrigatória de prototype theming** antes de autorar conteúdo: uma página MDX com `<RedocSpec>` renderizado precisa passar revisão visual contra os tokens Gov.br antes de o restante do portal ser populado. Falha aqui invalida a abordagem dual-layer.

### Hosting e deploy

- **GitHub Pages** com CNAME apontando para `developers.uniplus.unifesspa.edu.br`. CNAME configurado pelo time de redes da Unifesspa, apontando para `unifesspa-edu-br.github.io`. Arquivo `CNAME` no root do repo declara o custom domain.
- **Deploy via GitHub Actions** (`peaceiris/actions-gh-pages@v3`): on push para main → `npm run build` → push do `build/` para branch `gh-pages`.
- **Bridge pré-CNAME.** Enquanto o CNAME está em provisão, `type` URIs de `ProblemDetails` resolvem temporariamente para `unifesspa-edu-br.github.io/uniplus-developers/erros/{code}`. Quando o CNAME entrar no ar, redirect 301 é configurado no proxy reverso institucional.
- **Fallback institucional.** Se a revisão de segurança da Unifesspa não permitir CNAME para GitHub Pages, fallback é Kubernetes nginx ingress no cluster institucional ([ADR-0017 do `uniplus-api`](https://github.com/unifesspa-edu-br/uniplus-api/blob/main/docs/adrs/0017-kubernetes-com-helm-para-orquestracao.md)). Build artifact é o mesmo `build/` estático; só muda destino. **Validação de DNS é blocking task da Milestone C.**

### Sincronização dos specs OpenAPI

Workflow `.github/workflows/sync-specs.yml` puxa `contracts/openapi.<modulo>.json` da `uniplus-api` (tag de release ou main) para `static/openapi/`. Trigger: schedule diário + workflow_dispatch + repository_dispatch (disparado pela `uniplus-api` no merge para main). Diff em PR permite revisar mudanças contratuais antes de publicá-las no portal.

### Busca

- **V1: `@easyops-cn/docusaurus-search-local`** — busca client-side full-text; zero backend dependency; funciona em GitHub Pages estático.
- **V2 (follow-up):** migração para Typesense self-hosted ou Algolia DocSearch (verificar tier institucional gratuito). Plugin Docusaurus existe para os dois — migração é low-risk quando o catálogo crescer além do que o local search aguenta.

### Multi-version docs

Mecanismo nativo do Docusaurus (`versioned_docs/`) usado por módulo. Ex.: `versioned_docs/version-1.0.0/modules/selecao/...` snapshota docs em v1.0.0; `docs/` representa dev. Navbar inclui version switcher. CI gate: PR que muda recurso versionado (detectado via diff do spec) deve incluir snapshot via `docusaurus docs:version` ou anotação explícita "minor change, no version bump" na descrição.

### Licenciamento

- **Código** (`src/`, components, configs): **MIT**.
- **Conteúdo** (`docs/`, MDX, OpenAPI specs): **CC-BY 4.0**.

Essa separação permite reuso liberal do código por outras instituições federais sem exigir relicenciamento, enquanto o conteúdo (especialmente o catálogo de erros e guias) carrega atribuição explícita à Unifesspa quando reusado.

### Governança

- **CTIC sole owner.** PROEG/PROEX/CEPS/CRCA são clientes institucionais que fornecem input normativo (texto de norma, cláusulas de edital, BDD de regras de negócio). Esses inputs entram via issue ou PR; merge é responsabilidade da CTIC.
- **Branch protection na main:** require PR + 1 approval + status checks verdes (adr-lint, markdownlint, build).
- **PRs cross-repo são bem-vindos.** Integradores externos (futuros) podem propor melhorias via PR; CTIC revê.

### Esta ADR não decide

- Detalhes do conteúdo do catálogo de erros — cada slice da `uniplus-api` adiciona suas entradas conforme implementa endpoints. Esta ADR só estabelece o template `<ErrorCatalogEntry>` e o frontmatter mínimo.
- Política de versionamento de release do próprio portal (semver vs date-based) — decisão na primeira release real, fora do escopo da arquitetura.
- Estratégia de monitoramento/analytics (GA, Plausible, Matomo, none) — pode ser adicionada depois sem alterar a arquitetura.
- Interactive playground (try-it-out com auth real) — fora do V1; quando justificado, entra como ADR superseding parte desta.

### Por que B, C, D, E e F foram rejeitadas

- **B (Redocusaurus preset).** Layout `1 spec → 1 page` opinionado não atende per-resource versioning + multi-módulo + jornadas; preset abstrai exatamente o controle que precisamos; preset é third-party e a verificação de manutenção foi flag de risco no spike.
- **C (Astro Starlight + Scalar).** Versionamento de docs não é first-class no Starlight (2026-05); workaround manual viola critério de mandatory native support. Theming Scalar para Gov.br é mais difícil que Redoc (Scalar é mais opinionado visualmente).
- **D (Hugo + Redocly).** Templating Go é fit ruim com as competências JS/TS do time CTIC; componentes interativos limitados; sem MDX equivalente; multi-version docs exige routing custom. Build speed é irrelevante na escala docs site.
- **E (Redocly web component).** Hidratação de web component em Docusaurus tem pegadinhas conhecidas com Shadow DOM e propagação de variáveis CSS de tema. Theming Gov.br via Shadow DOM boundary é mais difícil que via Emotion. Sem vantagem de ecossistema sobre o React component (mesmo dono Redocly).
- **F (SaaS).** Vendor lock-in inaceitável para portal institucional federal. Custo recorrente sem orçamento.

## Consequências

### Positivas

- **Layout flexibility por página.** Cada MDX escolhe se renderiza spec inteiro, spec filtrado por tag/operationId, ou só prosa de jornada com code samples.
- **Versionamento e i18n nativos.** Mecanismo do Docusaurus cobre per-resource versioning e futuro pt-BR/en sem custom routing.
- **Single-source theming.** Tokens declarados uma vez; consumidos por shell + Redoc — consistência visual por construção.
- **GitHub Pages** sem custo recorrente; deploy é `git push origin main`.
- **Componentes reusáveis.** `<ErrorCatalogEntry>`, `<MediaTypeCard>`, `<ChangelogEntry>` reusados em todas as entradas; bug fix lands everywhere.
- **CTIC sole owner alinha com responsabilidade institucional.**

### Negativas

- **Boilerplate maior que preset.** Cada MDX que renderiza spec escreve ~10-30 linhas de import + JSX. Multiplicado por ~40 páginas do V1, soma ~400-1000 linhas repetitivas. Mitigação parcial: helper components encapsulam o caso comum.
- **Theming dual-layer exige disciplina.** 3 arquivos CSS precisam ficar em sincronia; adição de token toca os 3.
- **Multi-version docs vira chore.** Time pode esquecer de rodar `docusaurus docs:version`; CI gate (descrito acima) é mitigação parcial.
- **Dependência de DNS Unifesspa.** Sem CNAME aprovado, portal vive em URL não-canônica até a aprovação institucional.

### Neutras

- O follow-up de extrair tokens Gov.br para pacote npm é desejável mas não bloqueia V1 — cópia manual é sustentável até o repositório `@uniplus/govbr-tokens` existir.
- Postman/Bruno collection publicada no portal é V1 — botão "Run in Postman" na landing.

## Riscos e mitigações

- **Risco:** dual-layer theming produz inconsistência visual (Docusaurus shell e Redoc divergindo).
  **Mitigação:** validação obrigatória de prototype theming antes de autorar conteúdo (descrito acima).
- **Risco:** GitHub Pages não permite CNAME para `developers.uniplus.unifesspa.edu.br` por revisão de segurança institucional.
  **Mitigação:** validação de DNS como primeira blocking task da Milestone C; fallback K8s nginx documentado.
- **Risco:** `redoc` React component perde suporte a OpenAPI 3.1 (regressão).
  **Mitigação:** OpenAPI 3.1 está estável no `redoc` desde 2024; se regressão aparecer, alternativa é o web component (opção E rejeitada agora) — exigiria refactor de theming mas não redesign de arquitetura.
- **Risco:** busca local fica limitada para catálogo grande.
  **Mitigação:** path de migração para Typesense/Algolia documentado; ambos têm plugin Docusaurus pronto.
- **Risco:** SSR build do Docusaurus quebra com Redoc (`window is not defined`).
  **Mitigação:** wrapper `<RedocSpec>` é mandatoriamente envolvido em `<BrowserOnly>` (descrito acima); regra documentada e enforçada em revisão de PR.

## Confirmação

1. **Validação de prototype theming** — primeira PR de conteúdo da Milestone C entrega 1 página MDX com `<RedocSpec>` renderizado e revisão visual aprovada contra tokens Gov.br DS antes de qualquer outra página ser autorada.
2. **Validação de DNS/CNAME** — entregue como blocking task no início da Milestone C; output é decisão GitHub Pages com CNAME ou fallback K8s.
3. **CI gate de versionamento** — workflow valida que PR que muda spec versionado tem snapshot `docusaurus docs:version` correspondente ou justificativa em descrição.
4. **Lint e markdownlint** — `bash tools/adr-lint/validate.sh` + `npx markdownlint-cli2 'docs/adrs/**/*.md'` rodam em CI a cada PR; ADRs futuras entram com mesma rigorosidade.
5. **Acessibilidade WCAG 2.1 AA** — checks via `pa11y` ou `axe-core` no build CI; falha em violação A/AA.

## Mais informações

- Issue #1 deste repo — task documental que originou esta ADR.
- ADR-0022 do `uniplus-api` — umbrella do contrato REST canônico V1; portal materializa as referências `type` URI emitidas em cada `ProblemDetails`.
- ADR-0023 do `uniplus-api` — wire format de erro consumido pelo catálogo `/erros/{code}`.
- ADR-0028 do `uniplus-api` — versionamento per-resource; portal documenta cada versão de cada recurso.
- ADR-0030 do `uniplus-api` — pipeline OpenAPI cujo output (`contracts/openapi.<modulo>.json`) o portal sincroniza.
- [ADR-0006 do `uniplus-web`](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0006-govbr-design-system-como-contrato-visual.md) — Gov.br Design System como contrato visual.
- [ADR-0007 do `uniplus-web`](https://github.com/unifesspa-edu-br/uniplus-web/blob/main/docs/adrs/0007-primeng-em-modo-unstyled.md) — base do mapeamento de tokens copiado para o portal.
- [Docusaurus 3.x](https://docusaurus.io/docs).
- [`redoc` npm package](https://www.npmjs.com/package/redoc).
- [`@easyops-cn/docusaurus-search-local`](https://github.com/easyops-cn/docusaurus-search-local).
- [`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages).
- [Stripe — error codes page format](https://docs.stripe.com/error-codes) — referência de formato para `<ErrorCatalogEntry>`.
- Portaria SEI-MCOM 540/2020 e IN SGD/ME 94/2022 — base normativa Gov.br DS.
