import {test, expect, type Page} from '@playwright/test';

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
  // A taxonomia do `code` é contrato (ADR-0023 do `uniplus-api`).
  const TAXONOMIA_CODE = /^[a-z]+(\.[a-z_]+)+$/;

  /** Códigos publicados, lidos do índice — a lista que os testes percorrem. */
  async function codigosDoCatalogo(page: Page): Promise<string[]> {
    await page.goto('erros/');
    const hrefs = await page
      .locator('main a.theme-doc-card-container')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute('href')),
      );
    return hrefs.map((href) => href!.replace(/\/$/, '').split('/').pop()!);
  }

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

  test('o índice revela, ali mesmo, quais entradas ainda são rascunho', async ({
    page,
  }) => {
    const codigos = await codigosDoCatalogo(page);
    expect(codigos.length).toBeGreaterThanOrEqual(6);
    for (const code of codigos) {
      expect(code).toMatch(TAXONOMIA_CODE);
    }

    const cards = page.locator('main a.theme-doc-card-container');
    expect(await cards.count()).toBe(codigos.length);

    // O texto de cada card, colhido antes de sair da página do índice — os
    // cards saem na mesma ordem em que `codigosDoCatalogo` os lê.
    const textos = await cards.allInnerTexts();

    // O estado precisa aparecer já no ponto de descoberta: quem varre a lista
    // não pode confundir causa ainda não emitida com comportamento em vigor.
    // Com o catálogo misto, a prova é a correspondência — o prefixo aparece
    // exatamente nas entradas que a própria página declara em rascunho.
    for (const [i, code] of codigos.entries()) {
      await page.goto(`erros/${code}`);
      const situacao = await page
        .getByText('Situação', {exact: true})
        .locator('xpath=following-sibling::dd[1]')
        .innerText();
      const ehRascunho = situacao.toLowerCase().includes('rascunho');

      expect(
        textos[i].includes('Rascunho —'),
        `${code}: o card ${ehRascunho ? 'deveria' : 'não deveria'} anunciar rascunho`,
      ).toBe(ehRascunho);
    }
  });

  test('cada entrada traz causa, remediação, e um type que resolve nela mesma', async ({
    page,
  }) => {
    const codigos = await codigosDoCatalogo(page);

    for (const code of codigos) {
      await page.goto(`erros/${code}`);
      const main = page.locator('main');

      // Um H1 só — o título que o corpo de erro emite para este `code`.
      await expect(main.getByRole('heading', {level: 1})).toHaveCount(1);

      // O código exibido é o mesmo que endereça a página. Se o frontmatter e o
      // nome do arquivo divergirem, o `type` publicado aponta para outro lugar.
      await expect(
        main.locator('dl code', {hasText: new RegExp(`^${code}$`)}),
      ).toHaveCount(1);

      // O `type` declarado tem de resolver na própria página — é a função do
      // campo, e o que o cenário de aceite da issue #86 cobra na prática.
      const typeUri = await main
        .locator('dl code', {hasText: /^https:\/\//})
        .innerText();
      expect(typeUri.endsWith(`/erros/${code}`)).toBe(true);
      const alvo = await page.request.get(new URL(typeUri).pathname);
      expect(alvo.status()).toBe(200);

      // Causa e remediação, em toda entrada.
      await expect(
        main.getByRole('heading', {name: 'O que aconteceu', level: 2}),
      ).toBeVisible();
      await expect(
        main.getByRole('heading', {name: 'Como resolver', level: 2}),
      ).toBeVisible();
    }
  });

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
