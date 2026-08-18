import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  AVISO,
  AVISO_PERIGO,
  BLOCO,
  ETIQUETA,
  Item,
  LISTA,
  ListaDeLinks,
  type RastreioEntrada,
} from './catalogo/estiloCatalogo';

/**
 * Ciclo de vida do media type (ADR-0028 do `uniplus-api` — versionamento
 * per-resource): `current` é a versão em vigor; `deprecated` ainda responde,
 * mas tem substituta; `sunset` deixou de ser servida.
 */
export type StatusMediaType = 'current' | 'deprecated' | 'sunset';

/**
 * As propriedades espelham o frontmatter da página, em snake_case, no mesmo
 * padrão do `<ErrorCatalogEntry>` — a entrada é escrita uma vez e aplicada
 * com `{...frontMatter}`.
 */
export interface MediaTypeCardProps {
  /** Recurso versionado (ex.: `edital`). */
  resource: string;
  /** Versão do recurso (ex.: `v1`). */
  version: string;
  /** Vendor MIME completo emitido em `Content-Type`/`Accept` (ADR-0023). */
  vendor_mime: string;
  status: StatusMediaType;
  /** Link para o schema (OpenAPI ou JSON Schema) desta versão. */
  schema_href: string;
  /** Data (ISO) em que a versão deixa de ser `current`, se aplicável. */
  descontinuado_em?: string;
  /** Versão substituta, quando `status` é `deprecated` ou `sunset`. */
  sucessor?: string;
  /** Exemplos de payload — request/response, curl, etc. */
  exemplos?: RastreioEntrada[];
}

const STATUS_LABEL: Record<StatusMediaType, string> = {
  current: 'Em vigor',
  deprecated: 'Descontinuado',
  sunset: 'Fora de operação',
};

const STATUS_STYLE: Record<StatusMediaType, React.CSSProperties> = {
  current: {
    background: 'var(--color-govbr-success-light)',
    borderColor: 'var(--color-govbr-success)',
  },
  deprecated: {
    background: 'var(--color-govbr-warning-light)',
    borderColor: 'var(--color-govbr-warning)',
  },
  sunset: {
    background: 'var(--color-govbr-danger-light)',
    borderColor: 'var(--color-govbr-danger)',
  },
};

/**
 * Cabeçalho de identidade de uma entrada do catálogo de media types
 * (`/media-types/{resource}/{version}`), previsto na ADR-0001 deste
 * repositório.
 *
 * Uso: `<MediaTypeCard {...frontMatter} />`.
 */
export default function MediaTypeCard({
  resource,
  version,
  vendor_mime,
  status,
  schema_href,
  descontinuado_em,
  sucessor,
  exemplos,
}: MediaTypeCardProps): React.ReactElement {
  // Caminhos internos (sem protocolo) precisam do baseUrl do portal — um
  // href cru como "/openapi/..." navegaria para a raiz do domínio em vez do
  // subpath do GitHub Pages. URLs externas passam por `useBaseUrl` inalteradas.
  const schemaHref = useBaseUrl(schema_href);

  return (
    <article style={BLOCO}>
      {status !== 'current' && (
        <div style={status === 'sunset' ? AVISO_PERIGO : AVISO} role="note">
          <strong>
            {status === 'sunset' ? 'Fora de operação.' : 'Descontinuado.'}
          </strong>{' '}
          {status === 'sunset' ? (
            'Esta versão não é mais servida.'
          ) : sucessor ? (
            'Esta versão continua respondendo, mas tem substituta.'
          ) : (
            'Esta versão continua respondendo, mas está descontinuada.'
          )}{' '}
          {sucessor && (
            <>
              Use <code>{sucessor}</code>.
            </>
          )}
        </div>
      )}
      <header>
        <dl style={LISTA}>
          <Item rotulo="Recurso">
            <code>{resource}</code>
          </Item>
          <Item rotulo="Versão">
            <code>{version}</code>
          </Item>
          <Item rotulo="Vendor MIME">
            <code>{vendor_mime}</code>
          </Item>
          <Item rotulo="Status">
            <span style={{...ETIQUETA, ...STATUS_STYLE[status]}}>
              {STATUS_LABEL[status]}
            </span>
          </Item>
          <Item rotulo="Schema">
            <a href={schemaHref}>{schema_href}</a>
          </Item>
          {descontinuado_em && (
            <Item rotulo="Descontinuado em">{descontinuado_em}</Item>
          )}
          {exemplos && exemplos.length > 0 && (
            <Item rotulo="Exemplos">
              <ListaDeLinks itens={exemplos} />
            </Item>
          )}
        </dl>
      </header>
    </article>
  );
}
