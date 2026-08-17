import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ErrorCatalogEntry from './ErrorCatalogEntry';

const FRONTMATTER_MINIMO = {
  code: 'uniplus.edital.nao_encontrado',
  title: 'Edital não encontrado.',
  situacao: 'publicado' as const,
  modulo: 'Seleção',
  emitido_em: ['Consulta de edital por identificador'],
};

describe('ErrorCatalogEntry', () => {
  it('renderiza o cabeçalho com o frontmatter mínimo', () => {
    render(<ErrorCatalogEntry {...FRONTMATTER_MINIMO} />);

    expect(screen.getByText(FRONTMATTER_MINIMO.code)).toBeInTheDocument();
    expect(screen.getByText(FRONTMATTER_MINIMO.title)).toBeInTheDocument();
    expect(screen.getByText('Seleção')).toBeInTheDocument();
    expect(
      screen.getByText('Consulta de edital por identificador'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('a definir na implementação'),
    ).toBeInTheDocument();
  });

  it('usa <article> e <header> como estrutura semântica (WCAG 2.1 AA)', () => {
    const {container} = render(<ErrorCatalogEntry {...FRONTMATTER_MINIMO} />);

    expect(container.querySelector('article')).not.toBeNull();
    expect(container.querySelector('article > header')).not.toBeNull();
    expect(container.querySelector('dl')).not.toBeNull();
  });

  it('exibe o aviso de rascunho só quando situacao é rascunho', () => {
    const {rerender} = render(
      <ErrorCatalogEntry {...FRONTMATTER_MINIMO} situacao="publicado" />,
    );
    expect(screen.queryByRole('note')).toBeNull();

    rerender(<ErrorCatalogEntry {...FRONTMATTER_MINIMO} situacao="rascunho" />);
    expect(screen.getByRole('note')).toHaveTextContent('Entrada em rascunho.');
  });

  it('renderiza status HTTP, requisitos e rastreio quando presentes (frontmatter opcional)', () => {
    render(
      <ErrorCatalogEntry
        {...FRONTMATTER_MINIMO}
        http_status={404}
        requisitos={['UNI-REQ-0111']}
        rastreio={[
          {label: 'uniplus-api#1136', href: 'https://example.org/1136'},
        ]}
      />,
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('UNI-REQ-0111')).toBeInTheDocument();
    const link = screen.getByRole('link', {name: 'uniplus-api#1136'});
    expect(link).toHaveAttribute('href', 'https://example.org/1136');
  });

  it('resolve o campo type como URI absoluta a partir de code', () => {
    render(<ErrorCatalogEntry {...FRONTMATTER_MINIMO} />);

    expect(
      screen.getByText(
        `https://unifesspa-edu-br.github.io/erros/${FRONTMATTER_MINIMO.code}`,
      ),
    ).toBeInTheDocument();
  });
});
