import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Estilos e o par `<dt>/<dd>` compartilhados pelos três componentes do
 * catálogo (`ErrorCatalogEntry`, `MediaTypeCard`, `ChangelogEntry`) — mesmo
 * cabeçalho de identidade, mesma grade de metadata. Extraído para que um
 * ajuste visual valha para as três entradas de uma vez (ADR-0001).
 */

export const BLOCO: React.CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 'var(--radius-govbr-md, 8px)',
  padding: 'var(--spacing-govbr-4, 16px)',
  marginBottom: 'var(--spacing-govbr-5, 24px)',
};

// Fundos pastéis dos tokens Gov.br: o texto é fixado em cinza escuro em vez de
// herdar a cor do tema, que no modo escuro ficaria claro sobre fundo claro
// (WCAG 1.4.3).
export const TEXTO_ESCURO = 'var(--color-govbr-gray-80, #333333)';

export const ETIQUETA: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.1rem 0.5rem',
  borderRadius: 'var(--radius-govbr-sm, 4px)',
  fontSize: '0.78rem',
  fontWeight: 600,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  color: TEXTO_ESCURO,
  border: '1px solid var(--color-govbr-gray-20, #ccc)',
};

// Aviso emitido pelo próprio componente (rascunho, deprecation): a entrada é
// endereçável direto pela URI que descreve, então quem chega aqui pode nunca
// passar pelo índice. Deixá-lo a cargo de quem escreve a página abriria
// espaço para faltar em uma.
export const AVISO: React.CSSProperties = {
  borderLeft: '4px solid var(--color-govbr-warning)',
  background: 'var(--color-govbr-warning-light)',
  color: TEXTO_ESCURO,
  borderRadius: 'var(--radius-govbr-sm, 4px)',
  padding: 'var(--spacing-govbr-3, 12px) var(--spacing-govbr-4, 16px)',
  marginBottom: 'var(--spacing-govbr-4, 16px)',
};

export const AVISO_PERIGO: React.CSSProperties = {
  ...AVISO,
  borderLeftColor: 'var(--color-govbr-danger)',
  background: 'var(--color-govbr-danger-light)',
};

export const LISTA: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(9rem, max-content) 1fr',
  gap: '0.35rem var(--spacing-govbr-4, 16px)',
  margin: 0,
};

export const ROTULO: React.CSSProperties = {
  fontWeight: 600,
  margin: 0,
};

// Códigos e URIs são cadeias longas sem espaço: sem a quebra, a viewport
// estreita rola na horizontal (WCAG 1.4.10 — reflow a 320 px).
export const VALOR: React.CSSProperties = {
  margin: 0,
  overflowWrap: 'anywhere',
};

export function Item({
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

export interface RastreioEntrada {
  label: string;
  href: string;
}

// Componente próprio (em vez de resolver o href direto no .map() de
// ListaDeLinks) porque useBaseUrl é hook — não pode ser chamado dentro de um
// laço com número variável de iterações.
function LinkItem({label, href}: RastreioEntrada): React.ReactElement {
  // Caminhos internos do site (rastreio costuma ser externo — issues do
  // GitHub — mas exemplos de payload podem ser locais) recebem o baseUrl do
  // portal; URLs externas passam por useBaseUrl inalteradas.
  const resolvedHref = useBaseUrl(href);
  return <a href={resolvedHref}>{label}</a>;
}

export function ListaDeLinks({
  itens,
}: {
  itens: readonly RastreioEntrada[];
}): React.ReactElement {
  return (
    <>
      {itens.map(({label, href}, indice) => (
        <React.Fragment key={href}>
          {indice > 0 && ', '}
          <LinkItem label={label} href={href} />
        </React.Fragment>
      ))}
    </>
  );
}
