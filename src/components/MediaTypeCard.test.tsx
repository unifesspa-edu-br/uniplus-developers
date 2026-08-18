import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import MediaTypeCard from './MediaTypeCard';

const FRONTMATTER_MINIMO = {
  resource: 'edital',
  version: 'v1',
  vendor_mime: 'application/vnd.uniplus.edital.v1+json',
  status: 'current' as const,
  schema_href: '/openapi/selecao#/components/schemas/Edital',
};

describe('MediaTypeCard', () => {
  it('renderiza a identidade do media type com o frontmatter mínimo', () => {
    render(<MediaTypeCard {...FRONTMATTER_MINIMO} />);

    expect(screen.getByText('edital')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(
      screen.getByText(FRONTMATTER_MINIMO.vendor_mime),
    ).toBeInTheDocument();
    expect(screen.getByText('Em vigor')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: FRONTMATTER_MINIMO.schema_href}),
    ).toHaveAttribute('href', FRONTMATTER_MINIMO.schema_href);
  });

  it('não exibe aviso quando status é current', () => {
    render(<MediaTypeCard {...FRONTMATTER_MINIMO} />);
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('exibe aviso de descontinuação e sucessor quando status é deprecated', () => {
    render(
      <MediaTypeCard
        {...FRONTMATTER_MINIMO}
        status="deprecated"
        descontinuado_em="2026-12-01"
        sucessor="v2"
      />,
    );

    expect(screen.getByRole('note')).toHaveTextContent('Descontinuado.');
    expect(screen.getByRole('note')).toHaveTextContent('v2');
    expect(screen.getByText('2026-12-01')).toBeInTheDocument();
  });

  it('exibe aviso de fora de operação quando status é sunset', () => {
    render(<MediaTypeCard {...FRONTMATTER_MINIMO} status="sunset" />);

    expect(screen.getByRole('note')).toHaveTextContent('Fora de operação.');
  });

  it('não afirma substituta quando sucessor não foi informado', () => {
    render(<MediaTypeCard {...FRONTMATTER_MINIMO} status="deprecated" />);

    expect(screen.getByRole('note')).not.toHaveTextContent('substituta');
    expect(screen.queryByText(/^Use /)).toBeNull();
  });

  it('renderiza exemplos quando presentes (frontmatter opcional)', () => {
    render(
      <MediaTypeCard
        {...FRONTMATTER_MINIMO}
        exemplos={[{label: 'Exemplo de resposta', href: '/exemplos/edital-v1.json'}]}
      />,
    );

    const link = screen.getByRole('link', {name: 'Exemplo de resposta'});
    expect(link).toHaveAttribute('href', '/exemplos/edital-v1.json');
  });
});
