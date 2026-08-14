import {test, expect} from '@playwright/test';
import {requisitosMvpSelecao} from '../src/data/produto/requisitos-mvp-selecao';

/**
 * Invariantes do registro público de requisitos, e o acordo entre ele e a
 * página que apresenta as regras institucionais.
 *
 * O registro é dado estruturado consumido por três páginas (tabela, matriz de
 * rastreabilidade e regras de negócio), e o `typecheck` só garante a forma de
 * cada item — não que os identificadores sejam únicos, que a árvore feche numa
 * única raiz sem componente solta, nem que a prosa curada em `conceitos.mdx`
 * acompanhe o que o registro declara. Essas coisas já falharam na prática: a
 * célula da RN13 ficou sem o `UNI-REQ-0111` por uma edição que criou o
 * requisito e não voltou à página.
 */

/** Identificadores declarados, na ordem do registro. */
const identificadores = requisitosMvpSelecao.map((r) => r.requisito_id);

/**
 * Regras institucionais que cada requisito declara implementar, lidas do
 * título — a convenção do registro é sufixá-lo com `(RNxx)`.
 */
const requisitosPorRegra = new Map<string, string[]>();
for (const requisito of requisitosMvpSelecao) {
  for (const regra of requisito.titulo.match(/\bRN\d{2}\b/g) ?? []) {
    const lista = requisitosPorRegra.get(regra) ?? [];
    lista.push(requisito.requisito_id);
    requisitosPorRegra.set(regra, lista);
  }
}

test.describe('Registro de requisitos — integridade referencial', () => {
  test('nenhum identificador é usado por dois requisitos', () => {
    const repetidos = identificadores.filter(
      (id, i) => identificadores.indexOf(id) !== i,
    );
    // Um identificador com dois significados faz issue, ADR e teste que
    // resolvem por ele apontarem para a coisa errada, sem sintoma visível.
    expect(repetidos, 'identificadores duplicados no registro').toEqual([]);
  });

  test('todo parent_id resolve para um requisito do próprio conjunto', () => {
    const orfaos = requisitosMvpSelecao
      .filter((r) => r.parent_id && !identificadores.includes(r.parent_id))
      .map((r) => `${r.requisito_id} → ${r.parent_id}`);
    // A matriz de rastreabilidade navega por `parent_id`: um pai inexistente
    // rende uma linha filha que não liga a lugar nenhum.
    expect(orfaos, 'parent_id sem requisito correspondente').toEqual([]);
  });

  test('exatamente um requisito é raiz da árvore', () => {
    const raizes = requisitosMvpSelecao
      .filter((r) => !r.parent_id)
      .map((r) => r.requisito_id);
    expect(raizes).toHaveLength(1);
  });

  test('todo requisito é alcançável descendo a partir da raiz', () => {
    const filhosPorPai = new Map<string, string[]>();
    for (const requisito of requisitosMvpSelecao) {
      if (!requisito.parent_id) continue;
      const filhos = filhosPorPai.get(requisito.parent_id) ?? [];
      filhos.push(requisito.requisito_id);
      filhosPorPai.set(requisito.parent_id, filhos);
    }

    const raiz = requisitosMvpSelecao.find((r) => !r.parent_id);
    const alcancados = new Set<string>();
    const pendentes = raiz ? [raiz.requisito_id] : [];
    while (pendentes.length > 0) {
      const atual = pendentes.pop() as string;
      // Guarda contra revisitar: sem ela, um ciclo alcançável a partir da raiz
      // faria a descida não terminar.
      if (alcancados.has(atual)) continue;
      alcancados.add(atual);
      pendentes.push(...(filhosPorPai.get(atual) ?? []));
    }

    const inalcancaveis = identificadores.filter((id) => !alcancados.has(id));
    // Unicidade, `parent_id` resolvível e raiz única não bastam: dois
    // requisitos que se apontem como pai um do outro satisfazem os três e
    // ainda assim formam um ciclo desligado da árvore, invisível na matriz de
    // rastreabilidade, que só navega descendo.
    expect(inalcancaveis, 'requisitos fora da árvore da raiz').toEqual([]);
  });
});

test.describe('Regras institucionais e os requisitos que as implementam', () => {
  for (const [regra, requisitos] of requisitosPorRegra) {
    test(`a célula da ${regra} lista todo requisito que a declara no título`, async ({
      page,
    }) => {
      await page.goto('produto/regras-negocio/conceitos');

      const linha = page
        .getByRole('row')
        .filter({has: page.getByRole('cell', {name: regra, exact: true})});
      await expect(
        linha,
        `${regra} aparece em título de requisito e precisa de linha própria na tabela`,
      ).toHaveCount(1);

      for (const requisito of requisitos) {
        // A célula é a única navegação da regra institucional para os
        // requisitos verificáveis: um requisito ausente dela fica invisível
        // para quem chega pela regra.
        await expect(
          linha,
          `${regra} não cita ${requisito}, que declara implementá-la`,
        ).toContainText(requisito);
      }
    });
  }
});
