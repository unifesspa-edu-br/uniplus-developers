import {readdirSync, readFileSync} from 'node:fs';
import {basename, extname, join} from 'node:path';
import matter from 'gray-matter';
import {test, expect} from '@playwright/test';

test.describe('Portal — navegação e conteúdo', () => {
  test('a home carrega com as duas trilhas no menu', async ({page}) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/Uni\+ Developers/);
    await expect(
      page.getByRole('heading', {name: 'Portal de desenvolvedores do Uni+'}),
    ).toBeVisible();
    const navbar = page.locator('.navbar');
    await expect(
      navbar.getByRole('link', {name: 'Produto', exact: true}),
    ).toBeVisible();
    await expect(
      navbar.getByRole('link', {name: 'Referência de API', exact: true}),
    ).toBeVisible();
  });

  test('a página de proof gate abre', async ({page}) => {
    await page.goto('referencia-api/proof-gate');
    await expect(
      page.getByRole('heading', {name: /Proof gate/, level: 1}),
    ).toBeVisible();
  });

  for (const {url, heading} of [
    {url: 'produto/requisitos/', heading: 'Requisitos'},
    {url: 'produto/regras-negocio/', heading: 'Regras de negócio'},
    {url: 'produto/rastreabilidade/', heading: 'Rastreabilidade'},
    {url: 'produto/mvp-selecao/', heading: 'MVP Seleção'},
    {
      url: 'produto/checklist-publicacao/',
      heading: 'Checklist de publicação de requisitos',
    },
    {url: 'produto/dominio/', heading: 'Domínio do processo seletivo'},
    {
      url: 'produto/regras-negocio/conceitos',
      heading: 'Regras de negócio nomeadas',
    },
    {url: 'produto/conformidade-legal/', heading: 'Conformidade legal'},
    {
      url: 'arquitetura/congelamento-snapshot/',
      heading: 'Congelamento na publicação',
    },
  ]) {
    test(`a página ${url} abre`, async ({page}) => {
      await page.goto(url);
      await expect(
        page.getByRole('heading', {name: heading, level: 1}),
      ).toBeVisible();
    });
  }

  test('o checklist de publicação traz o portão editorial e o que não publicar', async ({
    page,
  }) => {
    await page.goto('produto/checklist-publicacao/');
    // O checklist documenta o portão de promoção…
    await expect(
      page.getByRole('heading', {name: 'Checklist de promoção', level: 2}),
    ).toBeVisible();
    // …e a fronteira do que nunca vai ao portal público.
    await expect(
      page.getByRole('heading', {name: 'O que nunca publicar', level: 2}),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', {name: /Dados pessoais reais e PII/}),
    ).toBeVisible();
  });

  test('a página demo do scaffold não existe mais', async ({page}) => {
    const resp = await page.goto('markdown-page');
    expect(resp?.status()).toBe(404);
  });
});

test.describe('Requisitos (fonte pública curada)', () => {
  test('a tabela de requisitos lista os itens curados e o filtro reduz', async ({
    page,
  }) => {
    await page.goto('produto/requisitos/');

    // SSR renderiza a tabela com um item conhecido do recorte.
    await expect(page.getByRole('cell', {name: 'UNI-REQ-0023'})).toBeVisible();
    const totalLinhas = await page.locator('tbody tr').count();
    expect(totalLinhas).toBeGreaterThan(5);

    // Filtrar por recorte de fundação reduz a lista (e some o item de MVP).
    await page
      .getByRole('combobox', {name: 'Recorte'})
      .selectOption({label: 'Fundação'});
    await expect(page.getByRole('cell', {name: 'UNI-REQ-0023'})).toHaveCount(0);
    expect(await page.locator('tbody tr').count()).toBeLessThan(totalLinhas);
  });

  test('regras de negócio mostram apenas regras vinculadas', async ({page}) => {
    await page.goto('produto/regras-negocio/');
    // Regra de negócio do recorte aparece.
    await expect(page.getByRole('cell', {name: 'UNI-REQ-0032'})).toBeVisible();
    // Requisito funcional puro não entra nesta página.
    await expect(page.getByRole('cell', {name: 'UNI-REQ-0017'})).toHaveCount(0);
  });

  test('a matriz de rastreabilidade liga filho ao pai', async ({page}) => {
    await page.goto('produto/rastreabilidade/');
    const linha = page.getByRole('row', {
      name: /UNI-REQ-0023 Ciclo-base da inscrição/,
    });
    await expect(linha).toBeVisible();
    // A inscrição (UNI-REQ-0023) é filha do fluxo primário (UNI-REQ-0002).
    await expect(linha.getByText('UNI-REQ-0002')).toBeVisible();
  });
});

test.describe('Âncoras de requisito (UNI-REQ)', () => {
  test('o ID canônico é uma âncora copiável que atualiza a URL', async ({
    page,
  }) => {
    await page.goto('produto/requisitos/');
    const ancora = page.locator('a[id="UNI-REQ-0023"]');
    await expect(ancora).toHaveCount(1);
    await expect(ancora).toHaveAttribute('href', '#UNI-REQ-0023');
    await ancora.click();
    // A URL passa a apontar o ponto exato — copiável para compartilhar.
    await expect(page).toHaveURL(/\/produto\/requisitos\/#UNI-REQ-0023$/);
  });

  test('na matriz, a coluna Pai liga à âncora canônica da mesma página', async ({
    page,
  }) => {
    await page.goto('produto/rastreabilidade/');
    // A âncora canônica do pai existe uma única vez na página…
    await expect(page.locator('a[id="UNI-REQ-0002"]')).toHaveCount(1);
    // …e a referência na linha filha aponta para ela, sem duplicar o id.
    const linhaFilha = page.getByRole('row', {
      name: /UNI-REQ-0023 Ciclo-base da inscrição/,
    });
    const refPai = linhaFilha.locator('a[href="#UNI-REQ-0002"]');
    await expect(refPai).toBeVisible();
    await refPai.click();
    await expect(page).toHaveURL(/\/produto\/rastreabilidade\/#UNI-REQ-0002$/);
  });
});

test.describe('Personas (cadastros fictícios)', () => {
  test('vive em /personas/ e lista os 30 cadastros com a tabela enxuta', async ({
    page,
  }) => {
    await page.goto('personas/');
    await expect(
      page.getByRole('heading', {name: 'Personas fictícias', level: 1}),
    ).toBeVisible();

    // SSR renderiza todos os 30.
    await expect(page.getByText(/30 de 30 cadastros/)).toBeVisible();

    // Tabela enxuta: 5 colunas (Nome, Sexo, CPF, Data de nascimento, Detalhes).
    const headers = page.locator('thead th');
    await expect(headers).toHaveText([
      'Nome',
      'Sexo',
      'CPF',
      'Data de nascimento',
      'Detalhes',
    ]);
  });

  test('as admonitions renderizam como caixa (sem marcador literal)', async ({
    page,
  }) => {
    await page.goto('personas/');
    // As admonitions viram caixas com classe theme-admonition…
    await expect(page.locator('.theme-admonition').first()).toBeVisible();
    // …e os marcadores de diretiva não aparecem como texto na página.
    for (const marker of [':::warning', ':::note', ':::info']) {
      await expect(page.getByText(marker)).toHaveCount(0);
    }
  });

  test('o filtro reduz a lista', async ({page}) => {
    await page.goto('personas/');
    // Filtra por cidade (Campo Grande → Fernanda); a coluna cidade não aparece,
    // mas o filtro busca nela, então a linha resultante traz o nome esperado.
    await page.getByRole('searchbox', {name: /Filtrar/}).fill('Campo Grande');
    const linhas = page.locator('tbody tr');
    await expect(linhas.first()).toContainText('Fernanda');
    expect(await linhas.count()).toBeLessThan(30);
  });

  test('o modal mostra o nome social e copia o CPF de fato', async ({page}) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('personas/');

    // A primeira persona tem nome social (RN02).
    await page
      .locator('tbody tr')
      .first()
      .getByRole('button', {name: /Ver detalhes de/})
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Nome social', {exact: true})).toBeVisible();

    const copyCpf = dialog.getByRole('button', {name: 'Copiar CPF'});
    await copyCpf.click();
    // O botão é icônico; o feedback de cópia é o nome acessível mudando.
    await expect(dialog.getByRole('button', {name: 'CPF copiado'})).toBeVisible();

    // Verifica que copiou DE FATO (não apenas o rótulo do botão).
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);

    await dialog.getByRole('button', {name: 'Fechar'}).click();
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Catálogo de erros', () => {
  // O que varia de entrada para entrada é dado de fonte — `code`, `situacao`,
  // as seções da prosa —, e isso é contrato de página, conferido entrada a
  // entrada por `tools/catalogo-erros/validar.mjs`. Aqui ficam as
  // propriedades que só o portal servido pode provar: que cada endereço
  // publicado responde, que o índice publica todas as entradas, e que o
  // cabeçalho renderiza o que o frontmatter declara.

  // A lista vem do disco, não da página do índice: uma entrada que suma da
  // navegação precisa reprovar, e não apenas deixar de ser testada.
  const DIR_CATALOGO = join(__dirname, '../docs/erros');

  const ENTRADAS = readdirSync(DIR_CATALOGO)
    .filter((nome) => /\.mdx?$/.test(nome) && !/^index\.mdx?$/.test(nome))
    .map((nome) => {
      const {data} = matter(readFileSync(join(DIR_CATALOGO, nome), 'utf8'));
      return {
        code: basename(nome, extname(nome)),
        situacao: data.situacao as string,
      };
    })
    // Ordenação binária dos dois lados da comparação: `localeCompare`
    // despreza pontuação em pt-BR, e os `code` se distinguem justamente
    // por ponto e sublinhado.
    .sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));

  const RASCUNHO = ENTRADAS.filter((e) => e.situacao === 'rascunho');
  const PUBLICADA = ENTRADAS.filter((e) => e.situacao === 'publicado');

  test('o catálogo é alcançável pela Referência de API', async ({page}) => {
    await page.goto('./');
    await page
      .locator('.navbar')
      .getByRole('link', {name: 'Referência de API', exact: true})
      .click();
    const catalogo = page
      .locator('.theme-doc-sidebar-container')
      .getByRole('link', {name: 'Catálogo de erros'});
    await expect(catalogo).toBeVisible();
    await catalogo.click();
    await expect(
      page.getByRole('heading', {name: 'Catálogo de erros', level: 1}),
    ).toBeVisible();
  });

  test('toda entrada resolve no endereço que o campo type anuncia', async ({
    page,
    request,
  }) => {
    // O endereço varrido vem do `type` renderizado numa entrada real, e não de
    // uma URL remontada aqui: `siteConfig.url` e `baseUrl` valem para todas as
    // páginas, então uma quebra em qualquer um deles muda o valor publicado —
    // e é essa quebra que a varredura precisa flagrar, não um endereço que o
    // próprio teste inventou e que continuaria resolvendo.
    expect(ENTRADAS.length).toBeGreaterThan(0);
    const referencia = ENTRADAS[0];
    await page.goto(`erros/${referencia.code}`);
    const typeUri = await page
      .locator('main dl code', {hasText: /^https:\/\//})
      .innerText();
    expect(typeUri.endsWith(`/erros/${referencia.code}`)).toBe(true);
    const prefixo = typeUri.slice(0, typeUri.length - referencia.code.length);

    // Em lotes: abrir uma conexão por entrada de uma vez contra o servidor de
    // arquivo do E2E trocaria o timeout por sobrecarga — outra forma de teste
    // instável.
    const naoResolveram: string[] = [];
    const TAMANHO_DO_LOTE = 16;
    for (let i = 0; i < ENTRADAS.length; i += TAMANHO_DO_LOTE) {
      const lote = ENTRADAS.slice(i, i + TAMANHO_DO_LOTE);
      const respostas = await Promise.all(
        lote.map((entrada) =>
          request.get(new URL(prefixo + entrada.code).pathname),
        ),
      );
      respostas.forEach((resposta, indice) => {
        if (resposta.status() !== 200) {
          naoResolveram.push(`${lote[indice].code} → ${resposta.status()}`);
        }
      });
    }
    expect(naoResolveram).toEqual([]);
  });

  test('o índice lista todas as entradas e anuncia rascunho exatamente onde há', async ({
    page,
  }) => {
    await page.goto('erros/');
    const cards = page.locator('main a.theme-doc-card-container');
    const hrefs = await cards.evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).getAttribute('href')),
    );
    const textos = await cards.allInnerTexts();

    // Antes de indexar por code: o Map colapsa href repetido, e card
    // duplicado no índice sobreviveria à comparação de conjuntos.
    expect(hrefs.length).toBe(ENTRADAS.length);

    const noIndice = new Map<string, string>();
    hrefs.forEach((href, indice) => {
      noIndice.set(href!.replace(/\/$/, '').split('/').pop()!, textos[indice]);
    });

    // Entrada publicada e ausente do índice fica invisível para quem varre a
    // lista; card sem página quebra o caminho de quem clica.
    expect([...noIndice.keys()].sort()).toEqual(ENTRADAS.map((e) => e.code));

    // O estado precisa aparecer já no ponto de descoberta: quem varre a lista
    // não pode confundir causa ainda não emitida com comportamento em vigor.
    // A prova é a correspondência — o prefixo aparece exatamente nas entradas
    // que a própria fonte declara em rascunho.
    const anunciamRascunho = [...noIndice.entries()]
      .filter(([, texto]) => texto.includes('Rascunho —'))
      .map(([code]) => code)
      .sort();
    expect(anunciamRascunho).toEqual(RASCUNHO.map((e) => e.code));
  });

  // A renderização é a mesma função para toda entrada — o que muda de uma para
  // outra é o frontmatter, conferido no gate de fonte. Duas entradas, uma de
  // cada situação, provam que o cabeçalho publica o que foi declarado.
  for (const [rotulo, entradas] of [
    ['publicada', PUBLICADA],
    ['em rascunho', RASCUNHO],
  ] as const) {
    test(`a entrada ${rotulo} publica o que o frontmatter declara`, async ({
      page,
    }) => {
      // Rascunho é estado transitório por desenho (ADR-0024 da `uniplus-api`:
      // a entrada abre antes do código existir). Quando não houver nenhuma, o
      // certo é não ter o que exercitar — exigir uma obrigaria o catálogo a
      // manter rascunho artificial só para o gate passar.
      test.skip(entradas.length === 0, `catálogo sem entrada ${rotulo}`);
      const entrada = entradas[0];
      await page.goto(`erros/${entrada.code}`);
      const main = page.locator('main');

      // Um H1 só — o título que o corpo de erro emite para este `code`.
      await expect(main.getByRole('heading', {level: 1})).toHaveCount(1);

      // O código exibido é o mesmo que endereça a página. Comparação literal:
      // montar um padrão a partir do `code` exigiria escapar toda a pontuação
      // que ele carrega, e escape parcial é falso negativo esperando acontecer.
      const codigosExibidos = await main.locator('dl code').allInnerTexts();
      expect(
        codigosExibidos.filter((texto) => texto.trim() === entrada.code),
      ).toHaveLength(1);

      await expect(
        main.getByRole('heading', {name: 'O que aconteceu', level: 2}),
      ).toBeVisible();
      await expect(
        main.getByRole('heading', {name: 'Como resolver', level: 2}),
      ).toBeVisible();

      const situacao = await main
        .getByText('Situação', {exact: true})
        .locator('xpath=following-sibling::dd[1]')
        .innerText();
      expect(situacao.toLowerCase()).toContain(
        entrada.situacao === 'rascunho' ? 'rascunho' : 'publicado',
      );
    });
  }

  test('a entrada não rola na horizontal em viewport estreita', async ({
    page,
  }) => {
    // Código e URI são cadeias longas sem espaço: sem quebra, estourariam a
    // largura da viewport (WCAG 2.1 AA — 1.4.10, reflow a 320 px).
    await page.setViewportSize({width: 320, height: 800});
    await page.goto(
      'erros/uniplus.selecao.processo_seletivo.localidade_ausente',
    );
    const estoura = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(estoura).toBe(false);
  });
});

test.describe('Media types e changelog', () => {
  test('a entrada de media type publica recurso, versão, vendor MIME e status', async ({
    page,
  }) => {
    await page.goto('media-types/processo-seletivo/v1');
    const main = page.locator('main');
    await expect(
      main.getByRole('heading', {name: 'processo-seletivo v1', level: 1}),
    ).toBeVisible();
    await expect(main.getByText('processo-seletivo', {exact: true})).toBeVisible();
    await expect(main.getByText('v1', {exact: true})).toBeVisible();
    await expect(
      main.getByText('application/vnd.uniplus.processo-seletivo.v1+json'),
    ).toBeVisible();
    await expect(main.getByText('Em vigor')).toBeVisible();
  });

  test('a entrada de changelog publica versão, data e tipo de mudança', async ({
    page,
  }) => {
    await page.goto('changelog/v1.0.0');
    const main = page.locator('main');
    await expect(main.getByRole('heading', {name: 'v1.0.0', level: 1})).toBeVisible();
    await expect(main.getByText('2026-08-18')).toBeVisible();
    await expect(main.getByText('Versão nova')).toBeVisible();
    await expect(main.getByText('processo-seletivo/v1')).toBeVisible();
    // Entrada de versão nova não exibe o banner de deprecation/sunset.
    await expect(main.getByRole('note')).toHaveCount(0);
  });

  test('as duas entradas aparecem na navegação da Referência de API', async ({
    page,
  }) => {
    await page.goto('referencia-api/proof-gate');
    const sidebar = page.locator('.theme-doc-sidebar-container');
    await expect(
      sidebar.getByRole('link', {name: 'processo-seletivo v1'}),
    ).toBeVisible();
    await expect(sidebar.getByRole('link', {name: 'v1.0.0'})).toBeVisible();
  });
});
