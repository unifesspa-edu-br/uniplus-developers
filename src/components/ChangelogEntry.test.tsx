import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ChangelogEntry from './ChangelogEntry';

const FRONTMATTER_MINIMO = {
  versao: '1.0.0',
  data: '2026-08-15',
  tipo_mudanca: 'versao_nova' as const,
  recursos_afetados: ['edital/v1'],
  resumo: 'Publica a primeira versão do recurso edital.',
};

describe('ChangelogEntry', () => {
  it('renderiza a entrada com o frontmatter mínimo', () => {
    render(<ChangelogEntry {...FRONTMATTER_MINIMO} />);

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('2026-08-15')).toBeInTheDocument();
    expect(screen.getByText('Versão nova')).toBeInTheDocument();
    expect(screen.getByText('edital/v1')).toBeInTheDocument();
    expect(screen.getByText(FRONTMATTER_MINIMO.resumo)).toBeInTheDocument();
  });

  it('não exibe banner de deprecation em versão nova', () => {
    render(<ChangelogEntry {...FRONTMATTER_MINIMO} />);
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('exibe banner de deprecation quando tipo_mudanca é deprecation', () => {
    render(
      <ChangelogEntry {...FRONTMATTER_MINIMO} tipo_mudanca="deprecation" />,
    );

    expect(screen.getByRole('note')).toHaveTextContent(
      'Recurso descontinuado.',
    );
  });

  it('exibe banner de sunset quando tipo_mudanca é sunset', () => {
    render(<ChangelogEntry {...FRONTMATTER_MINIMO} tipo_mudanca="sunset" />);

    expect(screen.getByRole('note')).toHaveTextContent(
      'Recurso fora de operação.',
    );
  });

  it('renderiza diff de schema e rastreio quando presentes (frontmatter opcional)', () => {
    render(
      <ChangelogEntry
        {...FRONTMATTER_MINIMO}
        diff_schema_href="/diffs/edital-v1.html"
        rastreio={[{label: 'uniplus-api#1200', href: 'https://example.org/1200'}]}
      />,
    );

    expect(
      screen.getByRole('link', {name: '/diffs/edital-v1.html'}),
    ).toHaveAttribute('href', '/diffs/edital-v1.html');
    expect(
      screen.getByRole('link', {name: 'uniplus-api#1200'}),
    ).toHaveAttribute('href', 'https://example.org/1200');
  });
});
