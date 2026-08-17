import React from 'react';
import {
  AVISO,
  BLOCO,
  ETIQUETA,
  Item,
  LISTA,
  ListaDeLinks,
  type RastreioEntrada,
} from './catalogo/estiloCatalogo';

/**
 * Tipo da mudança registrada na entrada de changelog (ADR-0028 do
 * `uniplus-api` — versionamento per-resource).
 */
export type TipoMudancaChangelog = 'versao_nova' | 'deprecation' | 'sunset';

/**
 * As propriedades espelham o frontmatter da página, em snake_case, no mesmo
 * padrão do `<ErrorCatalogEntry>` — a entrada é escrita uma vez e aplicada
 * com `{...frontMatter}`.
 */
export interface ChangelogEntryProps {
  /** Versão semântica do portal/contrato (ex.: `1.0.0`). */
  versao: string;
  /** Data (ISO) da publicação. */
  data: string;
  tipo_mudanca: TipoMudancaChangelog;
  /** Recursos versionados afetados (ex.: `edital/v1`). */
  recursos_afetados: string[];
  /** Resumo em prosa curta da mudança. */
  resumo: string;
  /** Link para o diff de schema entre versões, quando aplicável. */
  diff_schema_href?: string;
  /** Issues e decisões que originam a entrada. */
  rastreio?: RastreioEntrada[];
}

const TIPO_LABEL: Record<TipoMudancaChangelog, string> = {
  versao_nova: 'Versão nova',
  deprecation: 'Deprecation',
  sunset: 'Sunset',
};

const TIPO_STYLE: Record<TipoMudancaChangelog, React.CSSProperties> = {
  versao_nova: {
    background: 'var(--color-govbr-success-light)',
    borderColor: 'var(--color-govbr-success)',
  },
  deprecation: {
    background: 'var(--color-govbr-warning-light)',
    borderColor: 'var(--color-govbr-warning)',
  },
  sunset: {
    background: 'var(--color-govbr-danger-light)',
    borderColor: 'var(--color-govbr-danger)',
  },
};

/**
 * Cabeçalho de identidade de uma entrada de changelog (`/changelog/v{X.Y.Z}`),
 * previsto na ADR-0001 deste repositório.
 *
 * Uso: `<ChangelogEntry {...frontMatter} />`.
 */
export default function ChangelogEntry({
  versao,
  data,
  tipo_mudanca,
  recursos_afetados,
  resumo,
  diff_schema_href,
  rastreio,
}: ChangelogEntryProps): React.ReactElement {
  return (
    <article style={BLOCO}>
      {(tipo_mudanca === 'deprecation' || tipo_mudanca === 'sunset') && (
        <div style={AVISO} role="note">
          <strong>
            {tipo_mudanca === 'sunset'
              ? 'Recurso fora de operação.'
              : 'Recurso descontinuado.'}
          </strong>{' '}
          Consulte os recursos afetados antes de integrar contra esta versão.
        </div>
      )}
      <header>
        <dl style={LISTA}>
          <Item rotulo="Versão">
            <code>{versao}</code>
          </Item>
          <Item rotulo="Data">{data}</Item>
          <Item rotulo="Tipo de mudança">
            <span style={{...ETIQUETA, ...TIPO_STYLE[tipo_mudanca]}}>
              {TIPO_LABEL[tipo_mudanca]}
            </span>
          </Item>
          <Item rotulo="Recursos afetados">
            <ul style={{margin: 0, paddingLeft: '1.1rem'}}>
              {recursos_afetados.map((recurso) => (
                <li key={recurso}>
                  <code>{recurso}</code>
                </li>
              ))}
            </ul>
          </Item>
          <Item rotulo="Resumo">{resumo}</Item>
          {diff_schema_href && (
            <Item rotulo="Diff de schema">
              <a href={diff_schema_href}>{diff_schema_href}</a>
            </Item>
          )}
          {rastreio && rastreio.length > 0 && (
            <Item rotulo="Rastreio">
              <ListaDeLinks itens={rastreio} />
            </Item>
          )}
        </dl>
      </header>
    </article>
  );
}
