# Componentes do catálogo de referência de API

Três componentes React renderizam as três famílias de entrada previstas na [ADR-0001](../../docs/adrs/0001-arquitetura-portal-desenvolvedores.md): erros, media types e changelog. Cada um recebe o frontmatter da página MDX diretamente — `<Componente {...frontMatter} />` — para que uma nova entrada seja só texto + frontmatter, sem JSX repetitivo, e um ajuste visual valha para todas as entradas de uma vez.

Os três compartilham o cabeçalho de identidade (`<article><header><dl>...`) e os tokens Gov.br DS definidos em [`catalogo/estiloCatalogo.tsx`](./catalogo/estiloCatalogo.tsx).

## `<ErrorCatalogEntry>`

Renderiza o título, os metadados e a descrição pública de um código em
`/erros/{code}/`. O plugin do catálogo fornece a entrada a partir dos dois
contratos sincronizados da API. Para editar o texto, use o arquivo
`contracts/descricoes-de-erros.json` da API, apontado pelo link da própria página.

## O que aconteceu

...

## Como resolver

...
```

Frontmatter mínimo: `code`, `title`, `situacao` (`rascunho` | `publicado`), `modulo`, `emitido_em`. `http_status`, `requisitos` e `rastreio` são opcionais. `situacao: rascunho` é a exigência da ADR-0024 da `uniplus-api` — o código é fixado no portal antes do PR que o implementa; o componente emite o aviso correspondente sozinho.

## `<MediaTypeCard>`

Renderiza uma entrada de `docs/media-types/{resource}/{version}.mdx`.

```mdx
---
resource: edital
version: v1
vendor_mime: application/vnd.uniplus.edital.v1+json
status: current
schema_href: /openapi/selecao#/components/schemas/Edital
---

import MediaTypeCard from '@site/src/components/MediaTypeCard';

<MediaTypeCard {...frontMatter} />
```

Frontmatter mínimo: `resource`, `version`, `vendor_mime`, `status` (`current` | `deprecated` | `sunset`), `schema_href`. `descontinuado_em`, `sucessor` e `exemplos` são opcionais — `status` diferente de `current` emite o aviso de descontinuação/fora de operação sozinho.

## `<ChangelogEntry>`

Renderiza uma entrada de `docs/changelog/v{X.Y.Z}.mdx`.

```mdx
---
versao: 1.0.0
data: '2026-08-15'
tipo_mudanca: versao_nova
recursos_afetados:
  - edital/v1
resumo: Publica a primeira versão do recurso edital.
---

import ChangelogEntry from '@site/src/components/ChangelogEntry';

<ChangelogEntry {...frontMatter} />
```

Frontmatter mínimo: `versao`, `data`, `tipo_mudanca` (`versao_nova` | `deprecation` | `sunset`), `recursos_afetados`, `resumo`. `diff_schema_href` e `rastreio` são opcionais — `tipo_mudanca` de `deprecation` ou `sunset` emite o banner de descontinuação sozinho.

## Testes

```bash
npm run test        # Vitest — rendering dos três componentes com frontmatter mínimo + opcional
npm run typecheck   # tsc sem emit
npm run test:e2e    # smoke + acessibilidade (axe-core) sobre o portal servido
```

Os testes de componente rodam fora do runtime do Docusaurus — `@docusaurus/useBaseUrl` e `@docusaurus/useDocusaurusContext` são apontados para stubs em [`test/mocks/`](../../test/mocks) via `vitest.config.mts`.
