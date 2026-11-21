import React from 'react';
import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ErrorCatalogEntry from './ErrorCatalogEntry';
import type {EntradaDoCatalogo} from './catalogo/tipos';

const dados: EntradaDoCatalogo = {
  registro: {codigo: 'uniplus.selecao.exemplo.campo_obrigatorio', titulo: 'Campo obrigatório', status: 422},
  descricao: {
    requisitos: ['UNI-REQ-0001'],
    oQueAconteceu: ['Faltou informar o **campo obrigatório**.'],
    comoResolver: ['Consulte as [instruções](/erros/).'],
    ondeAparece: ['No cadastro.'],
  },
  modulo: {id: 'selecao', nome: 'Seleção'},
  origem: {repositorio: 'unifesspa-edu-br/uniplus-api', commit: 'a'.repeat(40)},
};

describe('ErrorCatalogEntry', () => {
  it('exibe a identidade e as seções da entrada', () => {
    render(<ErrorCatalogEntry dados={dados} />);

    expect(screen.getByRole('heading', {level: 1, name: dados.registro.titulo})).toBeVisible();
    expect(screen.getByText(dados.registro.codigo, {exact: true})).toBeVisible();
    expect(screen.getByText('422')).toBeVisible();
    expect(screen.getByRole('link', {name: 'Seleção'})).toBeVisible();
    expect(screen.getByText(`https://unifesspa-edu-br.github.io/erros/${dados.registro.codigo}`)).toBeVisible();
    expect(screen.getByRole('heading', {level: 2, name: 'O que aconteceu'})).toBeVisible();
    expect(screen.getByRole('heading', {level: 2, name: 'Como resolver'})).toBeVisible();
    expect(screen.getByRole('heading', {level: 2, name: 'Onde aparece'})).toBeVisible();
  });

  it('vincula os requisitos e a origem copiada', () => {
    render(<ErrorCatalogEntry dados={dados} />);

    const arquivo = `https://github.com/${dados.origem.repositorio}/blob/${dados.origem.commit}/contracts/descricoes-de-erros.json`;
    expect(screen.getByRole('link', {name: 'UNI-REQ-0001'})).toHaveAttribute('href', '/produto/requisitos/#UNI-REQ-0001');
    expect(screen.getByRole('link', {name: 'Editar'})).toHaveAttribute('href', arquivo);
    expect(within(screen.getByRole('article')).getByRole('link', {name: dados.origem.commit})).toHaveAttribute('href', arquivo);
  });

  it('exibe o exemplo em bloco de código', () => {
    const descricao = {...dados.descricao, comoResolver: ['```json\n{"campo": 1}\n```']};
    const {container} = render(<ErrorCatalogEntry dados={{...dados, descricao}} />);
    expect(container.querySelector('pre > code')).toHaveTextContent('{"campo": 1}');
  });

  it('renderiza Markdown e impede marcação e links fora do formato', () => {
    const descricao = {
      ...dados.descricao,
      comoResolver: ['<button>Botão</button> [instruções](/erros/) [inválido](http://example.invalid)'],
      ondeAparece: undefined,
    };
    render(<ErrorCatalogEntry dados={{...dados, descricao}} />);

    expect(screen.getByText('campo obrigatório', {selector: 'strong'})).toBeVisible();
    expect(screen.getByRole('link', {name: 'instruções'})).toHaveAttribute('href', '/erros/');
    expect(screen.getByText('inválido')).not.toHaveAttribute('href');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Onde aparece'})).not.toBeInTheDocument();
  });
});
