import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

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

export interface RastreioEntrada {
  label: string;
  href: string;
}

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

const ETIQUETA: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.1rem 0.5rem',
  borderRadius: 'var(--radius-govbr-sm, 4px)',
  fontSize: '0.78rem',
  fontWeight: 600,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  color: 'var(--color-govbr-gray-80, #333333)',
  border: '1px solid var(--color-govbr-gray-20, #ccc)',
};

const BLOCO: React.CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 'var(--radius-govbr-md, 8px)',
  padding: 'var(--spacing-govbr-4, 16px)',
  marginBottom: 'var(--spacing-govbr-5, 24px)',
};

// Aviso de rascunho, emitido pelo próprio componente: a entrada é endereçável
// direto pelo campo `type`, então quem chega aqui pode nunca passar pelo índice.
// Deixá-lo a cargo de quem escreve a página abriria espaço para faltar em uma.
const AVISO: React.CSSProperties = {
  borderLeft: '4px solid var(--color-govbr-warning)',
  background: 'var(--color-govbr-warning-light)',
  color: 'var(--color-govbr-gray-80, #333333)',
  borderRadius: 'var(--radius-govbr-sm, 4px)',
  padding: 'var(--spacing-govbr-3, 12px) var(--spacing-govbr-4, 16px)',
  marginBottom: 'var(--spacing-govbr-4, 16px)',
};

const LISTA: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(9rem, max-content) 1fr',
  gap: '0.35rem var(--spacing-govbr-4, 16px)',
  margin: 0,
};

const ROTULO: React.CSSProperties = {
  fontWeight: 600,
  margin: 0,
};

// `code` e URI são cadeias longas sem espaço: sem a quebra, a viewport estreita
// rola na horizontal (WCAG 1.4.10 — reflow a 320 px).
const VALOR: React.CSSProperties = {
  margin: 0,
  overflowWrap: 'anywhere',
};

function Item({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <dt style={ROTULO}>{rotulo}</dt>
      <dd style={VALOR}>{children}</dd>
    </>
  );
}

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
    <div style={BLOCO}>
      {situacao === 'rascunho' && (
        <div style={AVISO} role="note">
          <strong>Entrada em rascunho.</strong> O código já está fixado, mas a
          API ainda não o emite — esta página não descreve comportamento em
          vigor, e os valores ainda podem mudar. Não programe contra ela.
        </div>
      )}
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
            {rastreio.map(({label, href}, indice) => (
              <React.Fragment key={href}>
                {indice > 0 && ', '}
                <a href={href}>{label}</a>
              </React.Fragment>
            ))}
          </Item>
        )}
      </dl>
    </div>
  );
}
