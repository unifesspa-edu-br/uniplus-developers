import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
 * Estado da entrada no catálogo.
 *
 * `rascunho` — o `code` foi fixado aqui e ainda não é emitido pela API. É o
 * estado que a ADR-0024 do `uniplus-api` exige na introdução de um código: a
 * entrada abre antes do PR que o implementa, porque um PR não atravessa dois
 * repositórios. Enquanto rascunho, os valores ainda podem mudar.
 *
 * `publicado` — a API emite o código, e a entrada descreve o comportamento em
 * vigor.
 */
export type SituacaoEntrada = 'rascunho' | 'publicado';

/**
 * As propriedades espelham o frontmatter da página, em snake_case, para que a
 * entrada seja escrita uma vez só e aplicada com `{...frontMatter}`. Repetir os
 * valores em camelCase abriria espaço para o cabeçalho divergir do frontmatter
 * que alimenta título, descrição e busca.
 */
export interface ErrorCatalogEntryProps {
  /** Identificador estável da causa (ADR-0023 do `uniplus-api`). */
  code: string;
  /** Título emitido no corpo de erro — estável por `code`. */
  title: string;
  /**
   * Status HTTP da resposta. Ausente enquanto a implementação não o decidiu —
   * o cabeçalho declara a pendência em vez de fixar um valor por conta própria.
   */
  http_status?: number;
  situacao: SituacaoEntrada;
  /** Módulo que emite a recusa. */
  modulo: string;
  /** Operações ou transições em que a recusa aparece. */
  emitido_em: string[];
  /** Requisitos do registro canônico relacionados (`UNI-REQ-NNNN`). */
  requisitos?: string[];
  /** Issues e decisões que originam a entrada. */
  rastreio?: RastreioEntrada[];
}

const SITUACAO_LABEL: Record<SituacaoEntrada, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
};

// Fundos pastéis dos tokens Gov.br: o texto é fixado em cinza escuro em vez de
// herdar a cor do tema, que no modo escuro ficaria claro sobre fundo claro
// (WCAG 1.4.3). Mesmo tratamento das etiquetas de `produto/Tag.tsx`.
const SITUACAO_STYLE: Record<SituacaoEntrada, React.CSSProperties> = {
  rascunho: {
    background: 'var(--color-govbr-warning-light)',
    borderColor: 'var(--color-govbr-warning)',
  },
  publicado: {
    background: 'var(--color-govbr-success-light)',
    borderColor: 'var(--color-govbr-success)',
  },
};

/**
 * Cabeçalho de identidade de uma entrada do catálogo público de erros
 * (`/erros/{code}`), previsto na ADR-0001 deste repositório.
 *
 * Renderiza o que é estruturado e uniforme entre as entradas — código, título
 * emitido, status, `type` resolvível, situação, origem e rastreio. A causa e a
 * remediação ficam em prosa no MDX, que é onde precisam ser editáveis.
 *
 * Uso: `<ErrorCatalogEntry {...frontMatter} />`.
 */
export default function ErrorCatalogEntry({
  code,
  title,
  http_status,
  situacao,
  modulo,
  emitido_em,
  requisitos,
  rastreio,
}: ErrorCatalogEntryProps): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  // A URI absoluta é o valor que o campo `type` do corpo de erro carrega, então
  // precisa incluir o host — `useBaseUrl` sozinho devolveria só o caminho.
  const typeUri = `${siteConfig.url}${useBaseUrl(`/erros/${code}`)}`;

  return (
    <article style={BLOCO}>
      {situacao === 'rascunho' && (
        <div style={AVISO} role="note">
          <strong>Entrada em rascunho.</strong> O código já está fixado, mas a
          API ainda não o emite — esta página não descreve comportamento em
          vigor, e os valores ainda podem mudar. Não programe contra ela.
        </div>
      )}
      <header>
        <dl style={LISTA}>
          <Item rotulo="Código">
            <code>{code}</code>
          </Item>
          <Item rotulo="Título emitido">{title}</Item>
          <Item rotulo="Status HTTP">
            {http_status ?? 'a definir na implementação'}
          </Item>
          <Item rotulo="Campo type">
            <code>{typeUri}</code>
          </Item>
          <Item rotulo="Situação">
            <span style={{...ETIQUETA, ...SITUACAO_STYLE[situacao]}}>
              {SITUACAO_LABEL[situacao]}
            </span>
          </Item>
          <Item rotulo="Módulo">{modulo}</Item>
          <Item rotulo="Onde aparece">
            <ul style={{margin: 0, paddingLeft: '1.1rem'}}>
              {emitido_em.map((onde) => (
                <li key={onde}>{onde}</li>
              ))}
            </ul>
          </Item>
          {requisitos && requisitos.length > 0 && (
            <Item rotulo="Requisitos">
              {requisitos.map((requisito, indice) => (
                <React.Fragment key={requisito}>
                  {indice > 0 && ', '}
                  <code>{requisito}</code>
                </React.Fragment>
              ))}
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
