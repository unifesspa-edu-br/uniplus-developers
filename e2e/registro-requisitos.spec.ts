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
 *
 * O alcance disto é o que a convenção alcança, e ela não é universal: só as
 * regras cujos requisitos sufixam o título entram aqui (hoje RN08, RN13 e
 * RN14). As demais têm requisitos vinculados apenas pela prosa curada da
 * página — `UNI-REQ-0031` implementa a RN01 sem dizê-lo no título —, e para
 * elas não existe segunda fonte contra a qual conferir: retirar um requisito
 * daquelas células não é detectável aqui. Fechar isso exige declarar o vínculo
 * como dado do registro, e não como sufixo de texto.
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
  test('todo requisito citado na tabela existe no registro', async ({page}) => {
    await page.goto('produto/regras-negocio/conceitos');
    const tabela = page.getByRole('table').first();
    const texto = (await tabela.textContent()) ?? '';

    // Identificadores completos continuam sendo lidos do texto corrido: uma
    // referência não deixa de existir só porque perdeu ou ainda não ganhou
    // link. Sem esta fonte, um `UNI-REQ-NNNN` obsoleto em texto simples passa
    // sem ser confrontado com o registro.
    const citadosPorTexto = texto.match(/UNI-REQ-\d{4}/g) ?? [];

    // Os rótulos dos links complementam o texto corrido: a célula da RN08
    // abrevia a faixa como `UNI-REQ-0057…0063`, e o segundo extremo é um link
    // rotulado só `0063` — invisível para quem procurasse apenas a forma
    // completa no texto.
    const citadosPorLink = (await tabela.getByRole('link').allTextContents())
      .map((rotulo) => rotulo.trim())
      .filter((rotulo) => /^(?:UNI-REQ-)?\d{4}$/.test(rotulo))
      .map((rotulo) =>
        rotulo.startsWith('UNI-REQ-') ? rotulo : `UNI-REQ-${rotulo}`,
      );

    // A abreviação também subentende os intermediários, que não são link
    // nenhum: `0057…0063` promete que os sete existem, não apenas os extremos.
    const citadosPorFaixa: string[] = [];
    for (const faixa of texto.matchAll(
      /UNI-REQ-(\d{4})\s*(?:…|\.\.\.)\s*(?:UNI-REQ-)?(\d{4})/g,
    )) {
      const inicio = Number(faixa[1]);
      const fim = Number(faixa[2]);
      expect(fim, `faixa ${faixa[0]} termina antes de começar`).toBeGreaterThan(
        inicio,
      );
      for (let n = inicio; n <= fim; n += 1) {
        citadosPorFaixa.push(`UNI-REQ-${String(n).padStart(4, '0')}`);
      }
    }

    const citados = [
      ...new Set([
        ...citadosPorTexto,
        ...citadosPorLink,
        ...citadosPorFaixa,
      ]),
    ];
    // Sanidade do próprio teste: uma tabela que deixasse de citar requisito
    // nenhum tornaria a asserção seguinte vacuamente verdadeira.
    expect(citados.length).toBeGreaterThan(0);

    const inexistentes = citados.filter((id) => !identificadores.includes(id));
    // Este sentido pega o que o outro não pega: citação a requisito que foi
    // renumerado ou nunca existiu, em qualquer RN — inclusive nas que não usam
    // o sufixo no título.
    expect(inexistentes, 'requisitos citados que não estão no registro').toEqual(
      [],
    );
  });

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
